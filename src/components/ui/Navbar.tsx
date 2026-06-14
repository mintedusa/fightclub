import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { X, Home, Dumbbell, CalendarDays, Users, Tag, Film } from 'lucide-react';

import type { NavItem } from '../../types';
import logoUrl from '../../assets/logo.png';

const navItems = [
  { label: 'Acasă',    href: '/',         Icon: Home        },
  { label: 'Clase',    href: '/clase',    Icon: Dumbbell    },
  { label: 'Orar',     href: '/orar',     Icon: CalendarDays },
  { label: 'Traineri', href: '/traineri', Icon: Users       },
  { label: 'Prețuri',  href: '/preturi',  Icon: Tag         },
  { label: 'Galerie',  href: '/galerie',  Icon: Film        },
];

const desktopNavItems: NavItem[] = navItems.map(({ label, href }) => ({ label, href }));

function HamburgerIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
      <line x1="0" y1="1"  x2="22" y2="1"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="4" y1="8"  x2="22" y2="8"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="8" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const glassStyle: React.CSSProperties = {
  background: 'linear-gradient(160deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.10) 100%)',
  backdropFilter: 'blur(28px) saturate(200%) brightness(1.06)',
  WebkitBackdropFilter: 'blur(28px) saturate(200%) brightness(1.06)',
  border: '1px solid rgba(255,255,255,0.22)',
  boxShadow: [
    '0 12px 48px rgba(0,0,0,0.5)',
    '0 2px 8px rgba(0,0,0,0.25)',
    'inset 0 1.5px 0 rgba(255,255,255,0.32)',
    'inset 0 -1px 0 rgba(0,0,0,0.15)',
    'inset 1px 0 0 rgba(255,255,255,0.10)',
    'inset -1px 0 0 rgba(255,255,255,0.10)',
  ].join(', '),
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();

  const handleNav = (href: string) => {
    setMobileOpen(false);
    navigate(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">

      {/* ── Desktop: Liquid Glass floating bar ── */}
      <div className="hidden md:grid grid-cols-[auto_1fr_auto] items-center px-8 pt-5 max-w-7xl mx-auto gap-6">

        {/* Logo — outside glass */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Link to="/" className="flex items-center shrink-0">
            <img src={logoUrl} alt="FightClub Galați" className="h-20 w-auto drop-shadow-lg" />
          </Link>
        </motion.div>

        {/* Glass pill — only nav links */}
        <motion.nav
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
          className="flex items-center justify-center px-8 py-3 rounded-full relative overflow-hidden mx-auto"
          style={glassStyle}
        >
          {/* Specular shine strip across the top */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 40%, rgba(255,255,255,0.55) 60%, transparent 100%)' }}
          />
          {/* Subtle radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 60% 80% at 50% -10%, rgba(255,255,255,0.08) 0%, transparent 70%)' }}
          />

          <ul className="relative flex items-center gap-8">
            {desktopNavItems.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  end={item.href === '/'}
                  className={({ isActive }) =>
                    `text-[15px] font-semibold tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'text-gold drop-shadow-[0_0_8px_rgba(199,132,59,0.6)]'
                        : 'text-white/75 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </motion.nav>

        {/* CTA — outside glass */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        >
          <Link
            to="/preturi"
            className="shrink-0 text-sm font-bold px-6 py-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 block relative overflow-hidden tracking-wide"
            style={{
              background: 'linear-gradient(160deg, rgba(199,132,59,0.22) 0%, rgba(199,132,59,0.08) 50%, rgba(199,132,59,0.15) 100%)',
              backdropFilter: 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: 'blur(28px) saturate(180%)',
              border: '1px solid rgba(199,132,59,0.45)',
              boxShadow: '0 8px 32px rgba(199,132,59,0.2), inset 0 1.5px 0 rgba(255,220,150,0.35), inset 0 -1px 0 rgba(199,132,59,0.1)',
              color: '#ffcb93',
            }}
          >
            {/* shine strip */}
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,220,150,0.6), transparent)' }}
            />
            Abonamente
          </Link>
        </motion.div>

      </div>

      {/* ── Mobile: Liquid Glass header ── */}
      <div
        className="md:hidden transition-all duration-300"
        style={mobileOpen ? { background: '#000101' } : {
          background: 'linear-gradient(180deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 100%)',
          backdropFilter: 'blur(40px) saturate(220%) brightness(1.08)',
          WebkitBackdropFilter: 'blur(40px) saturate(220%) brightness(1.08)',
          borderBottom: '1px solid rgba(255,255,255,0.18)',
          boxShadow: [
            '0 8px 40px rgba(0,0,0,0.55)',
            '0 2px 8px rgba(0,0,0,0.3)',
            'inset 0 1.5px 0 rgba(255,255,255,0.3)',
            'inset 0 -1px 0 rgba(0,0,0,0.2)',
          ].join(', '),
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" onClick={() => setMobileOpen(false)}>
            <img src={logoUrl} alt="FightClub Galați" className="h-16 w-auto" />
          </Link>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex items-center gap-2 text-white px-2 py-1.5"
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
      </div>

      {/* Mobile full-screen overlay */}
      {createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 top-20 bg-dark z-[200] flex flex-col p-4 gap-3"
            >
              <div className="grid grid-cols-3 gap-3">
                {navItems.map(({ href, label, Icon }, i) => (
                  <motion.button
                    key={href}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => handleNav(href)}
                    className="aspect-square bg-surface rounded-2xl p-5 text-left flex flex-col justify-between border border-white/8 active:bg-surface-2 transition-colors"
                  >
                    <Icon className="w-7 h-7 text-gold" strokeWidth={1.6} />
                    <span className="text-white text-lg font-black">{label}</span>
                  </motion.button>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="flex-1 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              />

              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.3 }}
                onClick={() => handleNav('/contact')}
                className="w-full bg-gold text-dark text-center text-base font-black py-4 rounded-2xl tracking-wide"
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
