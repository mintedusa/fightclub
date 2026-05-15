import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X, Dumbbell } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { useNavbarScroll } from '../../hooks/useNavbarScroll';
import type { NavItem } from '../../types';

const navItems: NavItem[] = [
  { label: 'Acasă', href: '/' },
  { label: 'Clase', href: '/clase' },
  { label: 'Traineri', href: '/traineri' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useThemeStore();
  const scrolled = useNavbarScroll(80);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Dumbbell className="text-gold w-6 h-6" />
          <span className="text-gold font-black text-xl tracking-tight">FC</span>
          <span className="text-white font-semibold text-sm hidden sm:block">
            FightClub Galați
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-gold' : 'text-white/80 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="p-2 text-white/70 hover:text-gold transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          <Link
            to="/contact"
            className="hidden md:block bg-gold text-dark text-sm font-bold px-4 py-2 rounded hover:bg-gold-dark transition-colors"
          >
            Înscrie-te
          </Link>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 text-white"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 top-16 bg-dark z-40 flex flex-col p-8 gap-6"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `text-2xl font-bold transition-colors ${
                    isActive ? 'text-gold' : 'text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="mt-4 bg-gold text-dark text-center text-lg font-bold px-6 py-3 rounded"
            >
              Înscrie-te
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
