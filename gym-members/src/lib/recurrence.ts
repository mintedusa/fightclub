import type { Class, ClassRow } from '../types'

export interface RecurrenceState {
  enabled: boolean
  days: number[]   // JS day indices: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
  endDate: string  // "YYYY-MM-DD"
}

type ClassInput = Omit<Class, 'id' | 'is_cancelled' | 'bookings_count'>

export function generateOccurrences(
  startDatetime: string,
  days: number[],
  endDate: string,
  base: Omit<ClassInput, 'datetime'> & { recurrence_group_id: string }
): ClassInput[] {
  const result: ClassInput[] = []
  const start = new Date(startDatetime)
  const end = new Date(endDate + 'T23:59:59')
  const hours = start.getHours()
  const minutes = start.getMinutes()

  const cursor = new Date(start)
  cursor.setHours(0, 0, 0, 0)

  while (cursor <= end) {
    if (days.includes(cursor.getDay())) {
      const dt = new Date(cursor)
      dt.setHours(hours, minutes, 0, 0)
      if (dt >= start) {
        result.push({ ...base, datetime: dt.toISOString() })
      }
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return result
}

export function groupClassesBySeries(classes: Class[]): (Class | ClassRow)[] {
  const seriesMap = new Map<string, Class[]>()
  const individual: Class[] = []

  for (const cls of classes) {
    if (cls.recurrence_group_id) {
      const existing = seriesMap.get(cls.recurrence_group_id) ?? []
      existing.push(cls)
      seriesMap.set(cls.recurrence_group_id, existing)
    } else {
      individual.push(cls)
    }
  }

  const seriesRows: ClassRow[] = []
  for (const [, instances] of seriesMap) {
    const sorted = [...instances].sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    )
    const now = new Date()
    const representative =
      sorted.find(c => new Date(c.datetime) >= now) ?? sorted[sorted.length - 1]

    const seriesDays = [...new Set(sorted.map(c => new Date(c.datetime).getDay()))]

    seriesRows.push({
      ...representative,
      isSeries: true,
      seriesDays,
      seriesStart: sorted[0].datetime,
      seriesEnd: sorted[sorted.length - 1].datetime,
      instanceCount: sorted.length,
      instances: sorted,
    })
  }

  return [...seriesRows, ...individual]
}
