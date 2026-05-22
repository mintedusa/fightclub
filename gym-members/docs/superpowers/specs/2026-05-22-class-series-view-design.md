# Class Series View Design Spec

**Goal:** Display recurring classes as a single series row in the admin and trainer class tables, with per-instance cancel support and a DB-backed trainer selector on create.

**Architecture:** Add `recurrence_group_id UUID` column to `classes`. Series rows are computed client-side by grouping classes that share a `recurrence_group_id`. Non-recurring classes (`recurrence_group_id IS NULL`) are shown individually as today. Edit/cancel operations on a series mutate all rows in the group via a single UPDATE WHERE `recurrence_group_id = $1`.

---

## Database

### Migration
Add nullable column to `classes`:
```sql
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS recurrence_group_id UUID;
```
No index needed for now (small table). Existing classes keep `NULL` — they appear as individual rows.

---

## Data Model

Update `Class` type in `src/types/index.ts`:
```ts
export interface Class {
  id: string
  name: string
  instructor: string
  datetime: string
  capacity: number
  location: string
  is_cancelled: boolean
  bookings_count?: number
  recurrence_group_id?: string | null
}
```

---

## Table View — Series Row

The table shows **one row per series** (classes sharing the same `recurrence_group_id`) and **one row per individual class** (`recurrence_group_id IS NULL`).

### Client-side grouping
After fetching all classes (or trainer's classes), group them:
- Classes with `recurrence_group_id` → deduplicate to one representative row per group
- Representative row uses the **earliest future** instance's data (or the latest if all past)
- Computed fields added to the representative row:
  - `seriesDays`: array of unique weekday indices across the group (e.g. `[1, 3]` = Mon + Wed)
  - `seriesStart`: earliest `datetime` in the group
  - `seriesEnd`: latest `datetime` in the group
  - `instanceCount`: total instances in the group
  - `isSeries: true`

### Columns for series rows
| Column | Value |
|---|---|
| Clasă | name |
| Instructor | instructor |
| Program | e.g. `L, Mi 18:00` (days from seriesDays + time from representative) |
| Interval | e.g. `2 Iun – 1 Aug` (seriesStart to seriesEnd, date only) |
| Locuri | `0 / capacity` (capacity from representative) |
| Locație | location |
| Status | Activă / Anulată (if all instances cancelled → Anulată, else Activă) |
| Actions | `[Editează] [Instanțe]` |

### Columns for individual (non-series) rows — unchanged from today
Data/Ora shown as before.

---

## Edit Series Modal

Clicking **Editează** on a series row opens a modal pre-filled with the representative row's data. Fields:

- **Tip clasă** (text) — updates `name` on all instances
- **Instructor** (select from trainers, admin only) — updates `instructor` on all instances
- **Ora** (time input, `HH:mm`) — updates the time component on all instances (preserves each instance's date, changes only hours/minutes)
- **Capacitate** (number) — updates `capacity` on all instances
- **Locație** (text) — updates `location` on all instances
- **Anulează toată seria** (checkbox) — sets `is_cancelled = true` on all instances

On save: single `UPDATE public.classes SET ... WHERE recurrence_group_id = $groupId`.

---

## Instances Modal

Clicking **Instanțe** on a series row opens a modal listing all individual classes in the group, ordered by `datetime` ascending.

Each row shows:
- Date + time (Romanian locale)
- Status badge (Activă / Anulată)
- **Anulează** button (only for non-cancelled instances) — calls existing `useUpdateClass({ id, is_cancelled: true })`

No edit of individual instances beyond cancel.

---

## Recurrence Creation — pass group ID

Update `generateOccurrences` to accept and embed a `recurrence_group_id`:

```ts
export function generateOccurrences(
  startDatetime: string,
  days: number[],
  endDate: string,
  base: Omit<ClassInput, 'datetime'> & { recurrence_group_id: string }
): ClassInput[]
```

In the admin/trainer create handlers, generate a UUID (`crypto.randomUUID()`) and pass it as `recurrence_group_id` in `base` before calling `generateOccurrences`.

---

## Trainer Selector (Admin Create/Edit)

Replace the free-text `Instructor` input in the admin create/edit modal with a `<select>` populated from `profiles WHERE role = 'trainer'`, ordered by `full_name`.

New hook `src/hooks/useTrainers.ts`:
```ts
export function useTrainers() {
  return useQuery({
    queryKey: ['trainers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'trainer')
        .order('full_name')
      if (error) throw error
      return data as { id: string; full_name: string }[]
    },
  })
}
```

The trainer zone is unchanged — trainers still auto-set `instructor = profile!.full_name`.

---

## Files

**New:**
- `src/hooks/useTrainers.ts`
- `src/components/ui/ClassInstancesModal.tsx`

**Modified:**
- DB: migration adds `recurrence_group_id UUID` column
- `src/types/index.ts` — add `recurrence_group_id` to `Class`
- `src/lib/recurrence.ts` — `generateOccurrences` accepts `recurrence_group_id` in `base`
- `src/hooks/useClasses.ts` — add `useSeriesClasses`, `useTrainerSeriesClasses`, `useUpdateClassSeries`
- `src/pages/admin/Classes.tsx` — series view, edit series modal, trainer selector, Instanțe button
- `src/pages/trainer/Classes.tsx` — series view, edit series modal, Instanțe button

---

## Out of Scope
- Editing individual instances (only cancel)
- Changing the days/end-date of an existing series (would require deleting and recreating)
- Moving a single instance to a different date
- Notifications to members when a series is modified
