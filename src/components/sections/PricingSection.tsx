import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Repeat } from 'lucide-react';

const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.companyname.gma&pcampaignid=web_share';
const APP_STORE_URL = 'https://apps.apple.com/ro/app/gma-gym-management-app/id1496040256';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface Plan {
  name: string;
  price: number;
  days: number;
  sessions: string;
  highlight?: boolean;
}

interface Category {
  id: string;
  label: string;
  plans: Plan[];
}

const categories: Category[] = [
  {
    id: 'fitness',
    label: 'Fitness',
    plans: [
      { name: 'Full Fitness (Forță)', price: 199, days: 30, sessions: 'Nelimitat', highlight: false },
      { name: 'Fitness Nelimitat 3 Luni', price: 549, days: 90, sessions: 'Nelimitat', highlight: true },
      { name: 'Fitness Nelimitat 6 Luni', price: 999, days: 180, sessions: 'Nelimitat' },
      { name: 'Fitness Nelimitat 12 Luni', price: 1799, days: 365, sessions: 'Nelimitat' },
    ],
  },
  {
    id: 'aerobic',
    label: 'Aerobic',
    plans: [
      { name: 'Aerobic Nelimitat', price: 299, days: 30, sessions: 'Nelimitat' },
      { name: 'Aerobic 12 Ședințe', price: 279, days: 30, sessions: '12 sesiuni' },
      { name: 'Aerobic Full 3 Luni', price: 849, days: 90, sessions: 'Nelimitat', highlight: true },
      { name: 'Aerobic Full 6 Luni', price: 1599, days: 180, sessions: 'Nelimitat' },
      { name: 'Aerobic Full 12 Luni', price: 2799, days: 365, sessions: 'Nelimitat' },
    ],
  },
  {
    id: 'combo',
    label: 'Aerobic + Fitness',
    plans: [
      { name: 'Aerobic Nelimitat + Fitness', price: 329, days: 30, sessions: 'Nelimitat' },
      { name: 'Aerobic + Fitness 3 Luni', price: 899, days: 90, sessions: 'Nelimitat', highlight: true },
      { name: 'Aerobic + Fitness 6 Luni', price: 1699, days: 180, sessions: 'Nelimitat' },
      { name: 'Aerobic + Fitness 12 Luni', price: 2999, days: 365, sessions: 'Nelimitat' },
    ],
  },
  {
    id: 'pt',
    label: 'PT + Fitness',
    plans: [
      { name: 'PT Ionuț Fitness — 1 Ședință', price: 90, days: 1, sessions: '1 sesiune' },
      { name: 'PT Ionuț Fitness — 12 Ședințe', price: 800, days: 30, sessions: '12 sesiuni', highlight: true },
      { name: 'PT Ionuț Fitness — 16 Ședințe', price: 1000, days: 30, sessions: '16 sesiuni' },
    ],
  },
  {
    id: 'unica',
    label: 'Ședință Unică',
    plans: [
      { name: 'Ședință — 1 zi', price: 40, days: 1, sessions: '1 sesiune' },
    ],
  },
];

export default function PricingSection() {
  const titleRef = useScrollAnimation<HTMLDivElement>();
  const [activeId, setActiveId] = useState('fitness');

  const active = categories.find((c) => c.id === activeId)!;

  return (
    <section className="py-20 bg-dark">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div ref={titleRef} className="text-center mb-10">
          <span className="text-gold text-sm font-bold uppercase tracking-widest">
            Abonamente
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">
            Planuri & <span className="text-gold">Prețuri</span>
          </h2>
          <p className="text-muted text-sm mt-3">
            Achiziționează abonamentul direct din aplicația{' '}
            <span className="text-gold font-semibold">GMA</span>
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveId(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                activeId === cat.id
                  ? 'bg-gold text-dark border-gold'
                  : 'border-white/20 text-muted hover:border-gold hover:text-gold'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Plans grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {active.plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl p-5 border flex flex-col gap-4 ${
                  plan.highlight
                    ? 'bg-gold/5 border-gold/40'
                    : 'bg-surface-2 border-white/8'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-4 bg-gold text-dark text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                    Popular
                  </span>
                )}

                <p className="text-white font-bold text-base leading-snug pr-2">
                  {plan.name}
                </p>

                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black text-gold">{plan.price}</span>
                  <span className="text-muted text-sm mb-1">Lei</span>
                </div>

                <div className="flex items-center gap-4 text-muted text-xs">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gold/70" />
                    {plan.days === 1 ? '1 zi' : `${plan.days} zile`}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5 text-gold/70" />
                    {plan.sessions}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* GMA CTA */}
        <div className="mt-10 text-center">
          <p className="text-muted text-sm mb-4">
            Abonează-te direct din aplicația GMA disponibilă pe
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-gold/50 text-white px-5 py-2.5 rounded-xl transition-all text-sm font-semibold"
            >
              App Store
            </a>
            <a
              href={GOOGLE_PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-gold/50 text-white px-5 py-2.5 rounded-xl transition-all text-sm font-semibold"
            >
              Google Play
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
