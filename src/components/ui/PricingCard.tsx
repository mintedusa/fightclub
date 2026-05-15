import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { PricingPlan } from '../../types';

interface PricingCardProps {
  plan: PricingPlan;
  billing: 'monthly' | 'annual';
  index: number;
}

export default function PricingCard({ plan, billing, index }: PricingCardProps) {
  const price =
    billing === 'annual' ? Math.round(plan.monthlyPrice * 0.8) : plan.monthlyPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative rounded-2xl p-8 flex flex-col ${
        plan.highlighted
          ? 'bg-gold text-dark ring-4 ring-gold scale-105'
          : 'bg-surface-2 text-white'
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-dark text-gold text-xs font-bold px-4 py-1.5 rounded-full border border-gold whitespace-nowrap">
          {plan.badge}
        </span>
      )}

      <h3
        className={`text-xl font-bold mb-2 ${
          plan.highlighted ? 'text-dark' : 'text-white'
        }`}
      >
        {plan.name}
      </h3>

      <div className="mb-6">
        <motion.span
          key={price}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-5xl font-black ${
            plan.highlighted ? 'text-dark' : 'text-gold'
          }`}
        >
          {price}
        </motion.span>
        <span
          className={`text-sm ml-1 ${
            plan.highlighted ? 'text-dark/70' : 'text-muted'
          }`}
        >
          RON/lună
        </span>
        {billing === 'annual' && (
          <p
            className={`text-xs mt-1 ${
              plan.highlighted ? 'text-dark/70' : 'text-green-400'
            }`}
          >
            Economisești 20%
          </p>
        )}
      </div>

      <ul className="space-y-3 flex-1 mb-8">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check
              className={`w-4 h-4 mt-0.5 shrink-0 ${
                plan.highlighted ? 'text-dark' : 'text-gold'
              }`}
            />
            <span className={plan.highlighted ? 'text-dark/90' : 'text-muted'}>
              {f}
            </span>
          </li>
        ))}
      </ul>

      <button
        className={`w-full py-3 rounded-lg font-bold text-sm transition-colors ${
          plan.highlighted
            ? 'bg-dark text-gold hover:bg-dark/80'
            : 'bg-gold text-dark hover:bg-gold-dark'
        }`}
      >
        Alege Planul
      </button>
    </motion.div>
  );
}
