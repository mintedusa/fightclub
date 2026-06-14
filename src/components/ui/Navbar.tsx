import { useState, useEffect, useRef } from 'react';
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
  const [logoVisible, setLogoVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastScrollY.current && y > 60) {
        setLogoVisible(false);
      } else {
        setLogoVisible(true);
      }
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (href: string) => {
    setMobileOpen(false);
    navigate(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[300]">

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

      {/* ── Mobile: Two floating glass bubbles ── */}
      <div className="md:hidden relative h-20 px-4">

        {/* Logo — absolute stânga, dispare la scroll down */}
        <AnimatePresence>
          {(logoVisible || mobileOpen) && (
            <motion.div
              key="mobile-logo"
              className="absolute left-4 top-1/2 -translate-y-1/2"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Link to="/" onClick={() => setMobileOpen(false)} className="block">
                <img src={logoUrl} alt="FightClub Galați" className="h-20 w-auto" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu bubble — absolute dreapta */}
        <motion.button
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1], delay: 0.05 }}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          className="absolute right-4 top-1/2 -translate-y-1/2 overflow-hidden rounded-full px-5 py-3.5 flex items-center gap-2.5 text-white"
          style={glassStyle}
        >
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />
          <AnimatePresence mode="wait" initial={false}>
            {mobileOpen ? (
              <motion.span key="close" className="flex items-center gap-2"
                initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}
              >
                <X className="w-5 h-5" />
                <span className="text-xs font-bold tracking-widest uppercase">Închide</span>
              </motion.span>
            ) : (
              <motion.span key="open" className="flex items-center gap-2.5"
                initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}
              >
                <HamburgerIcon />
                <span className="text-xs font-bold tracking-widest uppercase">Meniu</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

      </div>

      {/* Mobile full-screen liquid glass overlay */}
      {createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[200] flex flex-col p-4 pt-28 gap-3"
              style={{
                background: 'rgba(0,1,1,0.78)',
                backdropFilter: 'blur(72px) saturate(220%)',
                WebkitBackdropFilter: 'blur(72px) saturate(220%)',
              }}
            >
              {/* Nav cards — glass */}
              <div className="grid grid-cols-3 gap-3">
                {navItems.map(({ href, label, Icon }, i) => (
                  <motion.button
                    key={href}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => handleNav(href)}
                    className="aspect-square rounded-2xl p-5 text-left flex flex-col justify-between relative overflow-hidden active:scale-95 transition-transform"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 100%)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.16)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 4px 16px rgba(0,0,0,0.3)',
                    }}
                  >
                    <div className="absolute inset-x-0 top-0 h-px"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
                    <Icon className="w-7 h-7 text-gold" strokeWidth={1.6} />
                    <span className="text-white text-lg font-black">{label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Glass spacer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="flex-1 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
              />

              {/* CTA */}
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.3 }}
                onClick={() => handleNav('/contact')}
                className="w-full text-center text-base font-black py-4 rounded-2xl tracking-wide relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(199,132,59,0.35) 0%, rgba(199,132,59,0.15) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(199,132,59,0.5)',
                  boxShadow: '0 4px 20px rgba(199,132,59,0.25), inset 0 1px 0 rgba(255,220,150,0.3)',
                  color: '#ffcb93',
                }}
              >
                <span className="absolute inset-x-0 top-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,220,150,0.5), transparent)' }} />
                Contact
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      , document.body)}
    </header>
  );
}
