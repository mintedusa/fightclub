import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { usePricingStore } from '../../store/usePricingStore';
import PricingCard from '../ui/PricingCard';
import type { PricingPlan } from '../../types';

const plans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: 99,
    highlighted: false,
    features: [
      'Acces sală L-V 06:00-22:00',
      'Vestiare și dușuri',
      '2 clase/săptămână inclusă',
      'Evaluare fizică inițială',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 159,
    highlighted: true,
    badge: 'Cel mai popular',
    features: [
      'Acces sală nelimitat',
      'Toate clasele de grup inclusă',
      '1 sesiune Personal Training/lună',
      'Acces saună și jacuzzi',
      'App FightClub exclusiv',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    monthlyPrice: 249,
    highlighted: false,
    features: [
      'Tot din planul Pro',
      'Acces 24/7 cu card',
      'Personal Trainer dedicat (4h/lună)',
      'Consultație nutriționist lunar',
      'Zonă VIP exclusivă',
      'Towel service inclus',
    ],
  },
];

export default function PricingSection() {
  const titleRef = useScrollAnimation<HTMLDivElement>();
  const { billing, toggle } = usePricingStore();

  return (
    <section className="py-20 bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div ref={titleRef} className="text-center mb-10">
          <span className="text-gold text-sm font-bold uppercase tracking-widest">
            Abonamente
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">
            Alege <span className="text-gold">Planul</span>
          </h2>

          <div className="flex items-center justify-center gap-4 mt-6">
            <span
              className={`text-sm font-medium ${
                billing === 'monthly' ? 'text-white' : 'text-muted'
              }`}
            >
              Lunar
            </span>
            <button
              onClick={toggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                billing === 'annual' ? 'bg-gold' : 'bg-surface-2'
              }`}
              aria-label="Toggle billing period"
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  billing === 'annual' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                billing === 'annual' ? 'text-white' : 'text-muted'
              }`}
            >
              Anual{' '}
              <span className="text-green-400 text-xs font-bold">-20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {plans.map((plan, i) => (
            <PricingCard key={plan.id} plan={plan} billing={billing} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
