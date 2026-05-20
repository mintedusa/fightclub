import type { SubscriptionStatus } from '../types'

export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getSubscriptionStatusColor(
  status: SubscriptionStatus,
  daysRemaining: number
): 'green' | 'yellow' | 'red' | 'blue' {
  if (status === 'expired') return 'red'
  if (status === 'frozen') return 'blue'
  return daysRemaining <= 7 ? 'yellow' : 'green'
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
