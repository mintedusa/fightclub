import { describe, it, expect } from 'vitest'
import { getDaysRemaining, getSubscriptionStatusColor, formatDate } from './utils'

describe('getDaysRemaining', () => {
  it('returns positive number for future date', () => {
    const future = new Date()
    future.setDate(future.getDate() + 10)
    expect(getDaysRemaining(future.toISOString().split('T')[0])).toBe(10)
  })

  it('returns 0 for today', () => {
    const today = new Date().toISOString().split('T')[0]
    expect(getDaysRemaining(today)).toBe(0)
  })

  it('returns negative for past date', () => {
    const past = new Date()
    past.setDate(past.getDate() - 5)
    expect(getDaysRemaining(past.toISOString().split('T')[0])).toBe(-5)
  })
})

describe('getSubscriptionStatusColor', () => {
  it('returns green for active with >7 days', () => {
    expect(getSubscriptionStatusColor('active', 15)).toBe('green')
  })

  it('returns yellow for active with <=7 days', () => {
    expect(getSubscriptionStatusColor('active', 5)).toBe('yellow')
  })

  it('returns red for expired status', () => {
    expect(getSubscriptionStatusColor('expired', 0)).toBe('red')
  })

  it('returns blue for frozen status', () => {
    expect(getSubscriptionStatusColor('frozen', 10)).toBe('blue')
  })
})

describe('formatDate', () => {
  it('formats ISO date to Romanian locale', () => {
    expect(formatDate('2026-05-20')).toBe('20 mai 2026')
  })
})
