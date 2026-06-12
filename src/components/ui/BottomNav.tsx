import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, CalendarDays, Dumbbell, Tag, Film } from 'lucide-react';

const items = [
  { href: '/',        label: 'Acasă',   Icon: Home        },
  { href: '/clase',   label: 'Clase',   Icon: Dumbbell    },
  { href: '/orar',    label: 'Orar',    Icon: CalendarDays },
  { href: '/preturi', label: 'Prețuri', Icon: Tag         },
  { href: '/galerie', label: 'Galerie', Icon: Film        },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <div
        className="flex items-center gap-1 px-2 py-2 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {items.map(({ href, label, Icon }) => (
          <NavLink
            key={href}
            to={href}
            end={href === '/'}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full transition-colors duration-200 ${
                isActive ? 'text-gold' : 'text-white/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavBubble"
                    className="absolute inset-0 rounded-full bg-gold/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon
                  className={`relative w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span className="relative text-[9px] font-semibold tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
