import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, CreditCard, Calendar, BookOpen, User, LogOut } from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'

const navItems = [
  { to: '/portal', label: 'Acasă', icon: LayoutDashboard, end: true },
  { to: '/portal/subscription', label: 'Abonamentul meu', icon: CreditCard },
  { to: '/portal/classes', label: 'Clase', icon: Calendar },
  { to: '/portal/bookings', label: 'Rezervările mele', icon: BookOpen },
  { to: '/portal/profile', label: 'Profil', icon: User },
]

export function PortalLayout() {
  const { signOut, profile } = useAuthContext()

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <span className="text-white font-bold text-lg tracking-tight">
          Fight Club <span className="text-red-500">Galați</span>
        </span>
        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-red-600/20 text-red-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{label}</span>
            </NavLink>
          ))}
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </nav>
        <span className="text-xs text-zinc-500 hidden lg:block">{profile?.full_name}</span>
      </header>
      <main className="max-w-5xl mx-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
