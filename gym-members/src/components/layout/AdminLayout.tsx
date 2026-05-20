import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, CreditCard, Calendar, LogIn, LogOut } from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/members', label: 'Membri', icon: Users },
  { to: '/admin/subscriptions', label: 'Abonamente', icon: CreditCard },
  { to: '/admin/classes', label: 'Clase', icon: Calendar },
  { to: '/admin/checkin', label: 'Check-in', icon: LogIn },
]

export function AdminLayout() {
  const { signOut, profile } = useAuthContext()

  return (
    <div className="min-h-screen bg-black flex">
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <span className="text-white font-bold text-lg tracking-tight">Fight Club</span>
          <span className="text-red-500 font-bold text-lg"> Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-red-600/20 text-red-400'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <div className="text-xs text-zinc-500 mb-3">{profile?.full_name}</div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Deconectare
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
