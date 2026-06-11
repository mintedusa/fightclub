import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavbarScroll } from '../../hooks/useNavbarScroll';
import type { NavItem } from '../../types';
import logoUrl from '../../assets/logo.png';

const navItems: NavItem[] = [
  { label: 'Acasă',    href: '/'         },
  { label: 'Clase',    href: '/clase'    },
  { label: 'Orar',     href: '/orar'     },
  { label: 'Traineri', href: '/traineri' },
  { label: 'Prețuri',  href: '/preturi'  },
  { label: 'Galerie',  href: '/galerie'  },
];

function HamburgerIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
      <line x1="0" y1="1"  x2="22" y2="1"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="4" y1="8"  x2="22" y2="8"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="8" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: 'easeOut' },
  }),
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolled = useNavbarScroll(80);
  const navigate = useNavigate();

  const handleNav = (href: string) => {
    setMobileOpen(false);
    navigate(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 ${
        mobileOpen
          ? 'bg-dark'
          : scrolled
          ? 'bg-dark/90 backdrop-blur-md shadow-lg transition-all duration-300'
          : 'bg-transparent transition-all duration-300'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-36 flex items-center justify-between">
        <Link to="/" className="flex items-center pt-3" onClick={() => setMobileOpen(false)}>
          <img src={logoUrl} alt="FightClub Galați" className="h-[130px] w-auto" />
        </Link>

        {/* Desktop nav */}
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

          {/* Mobile trigger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex items-center gap-2 text-white px-2 py-1.5"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-5 h-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <HamburgerIcon />
                  <span className="text-sm font-semibold tracking-widest uppercase">Meniu</span>
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay — rendered via Portal to escape header's stacking context */}
      {createPortal(
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 top-36 bg-dark z-[200] flex flex-col p-4 pb-8"
          >
            {/* Grid cards */}
            <div className="grid grid-cols-2 gap-3 flex-1">
              {navItems.map((item, i) => (
                <motion.button
                  key={item.href}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => handleNav(item.href)}
                  className="relative bg-surface rounded-2xl p-4 text-left flex flex-col justify-between border border-white/8 active:bg-surface-2 transition-colors"
                >
                  <span className="text-gold text-xs font-bold tracking-widest">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-white text-xl font-black">{item.label}</span>
                </motion.button>
              ))}
            </div>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.3 }}
              onClick={() => handleNav('/contact')}
              className="mt-3 w-full bg-gold text-dark text-center text-base font-black py-4 rounded-2xl tracking-wide"
            >
              Contact
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      , document.body)}
    </header>
  );
}
