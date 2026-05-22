# Recurring Classes — Design Spec

**Goal:** Allow admins and trainers to create recurring classes (multiple days per week, until a chosen end date) with a single form submission.

**Architecture:** Client-side date generation — the frontend calculates all occurrence dates and sends a single batch INSERT. No DB schema changes. Each generated class is fully independent (can be edited or cancelled individually).

---

## Feature Scope

- Available in: admin create-class modal (`/admin/classes`) and trainer create-class modal (`/trainer/classes`)
- Only on **create** — editing an existing class has no recurrence option
- Recurrence is opt-in via a checkbox

---

## UI Behaviour

### Modal — create class (both zones)

Existing fields remain unchanged: Tip clasă, Data și ora, Capacitate maximă, Locație.

Below Locație, a new section appears:

**1. Checkbox "Recurent"**
When unchecked (default): behaviour is identical to today — one class created.

When checked, two additional fields appear:

**2. Zile de repetiție** — 7 toggle buttons in a row:
`L  Ma  Mi  J  V  S  D`
At least one day must be selected to submit. The day of the week from "Data și ora" is pre-selected automatically as a convenience (user can deselect it).

**3. Repetă până la** — a date-only input (type="date").
Must be after the date in "Data și ora". No minimum enforced beyond that.

### Submission logic

The "Data și ora" field defines:
- The **time** used for all generated classes (e.g. 18:00)
- The **start date** — only occurrences on or after this date are included

Algorithm:
1. Collect selected day-of-week indices (0 = Sunday … 6 = Saturday, matching JS `Date.getDay()`)
2. Iterate day by day from start date to end date (inclusive)
3. For each day whose `getDay()` matches a selected day, generate a class record with that date + the template time
4. Batch insert all records in one Supabase call

Example: start = Mon 2 Jun 2026 18:00, days = Monday + Wednesday, end = 1 Jul 2026
→ generates: 2/6, 4/6, 9/6, 11/6, 16/6, 18/6, 23/6, 25/6, 30/6 — all at 18:00 (9 classes)

### After submission

- Modal closes
- Cache invalidated: `['classes']`, `['trainer-classes']`, `['trainer-stats']`
- No confirmation screen needed — count is not shown (YAGNI)

---

## Data Model

No schema changes. Each generated class is a normal row in `classes`:

| column | value |
|---|---|
| `name` | from form |
| `instructor` | from form (admin) or `profile.full_name` (trainer) |
| `datetime` | calculated occurrence datetime (ISO string) |
| `capacity` | from form |
| `location` | from form |
| `is_cancelled` | `false` |

---

## Files

**New:**
- `src/components/ui/RecurrenceFields.tsx` — controlled component: accepts `recurrence` state + setter, renders checkbox + day toggles + end date input. No submission logic — purely UI.

**Modified:**
- `src/hooks/useClasses.ts` — add `useCreateClasses` mutation (batch insert array of class objects)
- `src/pages/admin/Classes.tsx` — integrate `RecurrenceFields` into create modal; on submit, if recurrence enabled generate dates and call `useCreateClasses`, else call existing `useCreateClass`
- `src/pages/trainer/Classes.tsx` — same integration

---

## Error Handling

- If end date is before start date: disable submit button, show inline message "Data de final trebuie să fie după data de start"
- If recurrence is checked but no day selected: disable submit button, show "Selectează cel puțin o zi"
- If batch insert fails: show existing error handling (same `catch` block as single create)

---

## Out of Scope

- Editing all classes in a series at once
- Cancelling a whole series
- `recurrence_group_id` or any DB linkage between generated classes
- Bi-weekly or monthly recurrence (weekly only)
