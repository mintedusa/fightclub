export type Role = 'admin' | 'member' | 'trainer'
export type SubscriptionStatus = 'active' | 'expired' | 'frozen'
export type BookingStatus = 'confirmed' | 'cancelled' | 'attended'

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  email: string
  role: Role
  avatar_url: string | null
  created_at: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  duration_days: number
  price: number
  is_active: boolean
}

export interface Subscription {
  id: string
  member_id: string
  plan_id: string
  start_date: string
  end_date: string
  status: SubscriptionStatus
  amount_paid: number
  notes: string | null
  created_at: string
  plan?: SubscriptionPlan
}

export interface Class {
  id: string
  name: string
  instructor: string
  datetime: string
  capacity: number
  location: string
  is_cancelled: boolean
  bookings_count?: number
}

export interface Booking {
  id: string
  member_id: string
  class_id: string
  status: BookingStatus
  created_at: string
  class?: Class
}

export interface CheckIn {
  id: string
  member_id: string
  checked_in_at: string
  checked_in_by: string | null
}
