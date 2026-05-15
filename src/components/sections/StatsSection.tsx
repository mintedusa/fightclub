import CountUp from 'react-countup';
import { Users, UserCheck, Dumbbell, Trophy } from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const stats = [
  { id: 's1', end: 500, suffix: '+', label: 'Membri Activi', Icon: Users },
  { id: 's2', end: 12, suffix: '', label: 'Traineri Certificați', Icon: UserCheck },
  { id: 's3', end: 30, suffix: '+', label: 'Clase / Săptămână', Icon: Dumbbell },
  { id: 's4', end: 10, suffix: '', label: 'Ani Experiență', Icon: Trophy },
];

export default function StatsSection() {
  const sectionRef = useScrollAnimation<HTMLElement>();

  return (
    <section ref={sectionRef} className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ id, end, suffix, label, Icon }) => (
            <div key={id} className="text-center">
              <Icon className="w-8 h-8 text-gold mx-auto mb-3" />
              <div className="text-4xl sm:text-5xl font-black text-white mb-1">
                <CountUp
                  end={end}
                  suffix={suffix}
                  duration={2.5}
                  separator="."
                  enableScrollSpy
                  scrollSpyOnce
                />
              </div>
              <p className="text-muted text-sm font-medium uppercase tracking-wider">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
