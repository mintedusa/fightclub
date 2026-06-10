import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useNavbarScroll } from '../../hooks/useNavbarScroll';
import type { NavItem } from '../../types';
import logoUrl from '../../assets/logo.png';

const navItems: NavItem[] = [
  { label: 'Acasă',    href: '/'         },
  { label: 'Clase',    href: '/clase'    },
  { label: 'Orar',     href: '/orar'     },
  { label: 'Traineri', href: '/traineri' },
  { label: 'Prețuri',  href: '/preturi'  },
  { label: 'Contact',  href: '/contact'  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolled = useNavbarScroll(80);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 ${
        mobileOpen ? 'bg-dark' : scrolled ? 'bg-dark/90 backdrop-blur-md shadow-lg transition-all duration-300' : 'bg-transparent transition-all duration-300'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-36 flex items-center justify-between">
        <Link to="/" className="flex items-center pt-3">
          <img src={logoUrl} alt="FightClub Galați" className="h-[130px] w-auto" />
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `text-[16px] font-medium transition-colors ${
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
          <Link
            to="/preturi"
            className="hidden md:block bg-gold text-dark text-sm font-bold px-4 py-2 rounded hover:bg-gold-dark transition-colors"
          >
            Abonamente
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
            className="fixed inset-0 top-36 bg-dark z-[60] flex flex-col p-8 gap-6"
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
              to="/preturi"
              onClick={() => setMobileOpen(false)}
              className="mt-4 bg-gold text-dark text-center text-lg font-bold px-6 py-3 rounded"
            >
              Abonamente
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
