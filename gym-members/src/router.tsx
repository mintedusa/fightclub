import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AdminLayout } from './components/layout/AdminLayout'
import { PortalLayout } from './components/layout/PortalLayout'
import { Login } from './pages/Login'
import { AdminDashboard } from './pages/admin/Dashboard'
import { AdminMembers } from './pages/admin/Members'
import { AdminMemberDetail } from './pages/admin/MemberDetail'
import { AdminSubscriptions } from './pages/admin/Subscriptions'
import { AdminClasses } from './pages/admin/Classes'
import { AdminCheckIn } from './pages/admin/CheckIn'
import { PortalDashboard } from './pages/portal/Dashboard'
import { PortalMySubscription } from './pages/portal/MySubscription'
import { PortalClasses } from './pages/portal/Classes'
import { PortalMyBookings } from './pages/portal/MyBookings'
import { PortalProfile } from './pages/portal/Profile'

export const router = createBrowserRouter([
  { path: '/', element: <Login /> },
  {
    path: '/admin',
    element: <ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'members', element: <AdminMembers /> },
      { path: 'members/:id', element: <AdminMemberDetail /> },
      { path: 'subscriptions', element: <AdminSubscriptions /> },
      { path: 'classes', element: <AdminClasses /> },
      { path: 'checkin', element: <AdminCheckIn /> },
    ],
  },
  {
    path: '/portal',
    element: <ProtectedRoute><PortalLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <PortalDashboard /> },
      { path: 'subscription', element: <PortalMySubscription /> },
      { path: 'classes', element: <PortalClasses /> },
      { path: 'bookings', element: <PortalMyBookings /> },
      { path: 'profile', element: <PortalProfile /> },
    ],
  },
])
