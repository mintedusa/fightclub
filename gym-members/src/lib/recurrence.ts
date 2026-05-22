import type { Class } from '../types'

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
  base: Omit<ClassInput, 'datetime'>
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
