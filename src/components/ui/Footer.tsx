import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Dumbbell } from 'lucide-react';

const navLinks = [
  { label: 'Acasă', href: '/' },
  { label: 'Clase', href: '/clase' },
  { label: 'Traineri', href: '/traineri' },
  { label: 'Contact', href: '/contact' },
];

const classLinks = ['Box Thai', 'CrossFit', 'Yoga', 'Spinning', 'MMA', 'Kickbox'];

export default function Footer() {
  return (
    <footer className="bg-dark border-t-2 border-gold pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="text-gold w-6 h-6" />
              <span className="text-gold font-black text-xl">FC</span>
              <span className="text-white font-semibold">FightClub Galați</span>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              Forjează-ți limitele la FightClub Galați. Sala de fitness #1 din Galați.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
              Navigare
            </h4>
            <ul className="space-y-2">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    className="text-muted text-sm hover:text-gold transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
              Clase
            </h4>
            <ul className="space-y-2">
              {classLinks.map((c) => (
                <li key={c}>
                  <span className="text-muted text-sm">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
              Contact
            </h4>
            <ul className="space-y-2 text-muted text-sm mb-5">
              <li>Strada Saturn 34, Galați</li>
              <li>0236 000 000</li>
              <li>contact@fightclubgalati.ro</li>
              <li>L-V: 06:00-22:00 · S-D: 08:00-20:00</li>
            </ul>
            <div className="flex gap-4">
              <a href="#" className="text-muted hover:text-gold transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted hover:text-gold transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted hover:text-gold transition-colors" aria-label="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-muted text-sm">
          © 2025 FightClub Galați. Toate drepturile rezervate.
        </div>
      </div>
    </footer>
  );
}
