import type { RecurrenceState } from '../../lib/recurrence'

interface Props {
  value: RecurrenceState
  onChange: (v: RecurrenceState) => void
  startDate: string  // "YYYY-MM-DD" — used for min on endDate and day pre-selection
}

const DAY_LABELS = ['D', 'L', 'Ma', 'Mi', 'J', 'V', 'S']

export function RecurrenceFields({ value, onChange, startDate }: Props) {
  function toggleDay(day: number) {
    const days = value.days.includes(day)
      ? value.days.filter(d => d !== day)
      : [...value.days, day]
    onChange({ ...value, days })
  }

  function handleEnableToggle(checked: boolean) {
    if (checked && value.days.length === 0 && startDate) {
      const day = new Date(startDate + 'T12:00:00').getDay()
      onChange({ ...value, enabled: true, days: [day] })
    } else {
      onChange({ ...value, enabled: checked })
    }
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
        <input
          type="checkbox"
          className="accent-red-600"
          checked={value.enabled}
          onChange={e => handleEnableToggle(e.target.checked)}
        />
        Recurent (săptămânal)
      </label>

      {value.enabled && (
        <>
          <div>
            <p className="text-sm font-medium text-zinc-300 mb-2">Zilele de repetiție</p>
            <div className="flex gap-1">
              {DAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`w-9 h-9 rounded-lg text-xs font-medium transition-colors ${
                    value.days.includes(i)
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {value.days.length === 0 && (
              <p className="text-xs text-red-400 mt-1">Selectează cel puțin o zi</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Repetă până la
            </label>
            <input
              type="date"
              value={value.endDate}
              min={startDate}
              onChange={e => onChange({ ...value, endDate: e.target.value })}
              required
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-500"
            />
          </div>
        </>
      )}
    </div>
  )
}
