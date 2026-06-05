import { Smartphone } from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function GooglePlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M3.18 23.76c.34.19.72.24 1.09.14l11.34-11.35L12 9l-8.82 14.76zM20.9 10.98L18.1 9.4l-3.44 3.44 3.44 3.44 2.81-1.58c.8-.45.8-1.67-.01-2.12zM2.01 1.35C1.9 1.62 1.84 1.93 1.84 2.27v19.46c0 .34.06.65.18.92L13.07 12 2.01 1.35zm10.44 9.21l3.07-3.07L4.27.35C3.9.25 3.52.3 3.18.49L13.5 10.56l-1.05.01z" />
    </svg>
  );
}

export default function AppBannerSection() {
  const ref = useScrollAnimation<HTMLElement>();

  return (
    <section ref={ref} className="py-10 bg-surface border-y border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-gold/10 border border-gold/30 rounded-xl p-3">
              <Smartphone className="w-7 h-7 text-gold" />
            </div>
            <div>
              <p className="text-xs text-gold font-bold uppercase tracking-widest mb-0.5">
                Anunț
              </p>
              <p className="text-white font-semibold text-base sm:text-lg leading-tight">
                La această sală se folosește aplicația{' '}
                <span className="text-gold">GMA</span>
              </p>
              <p className="text-muted text-sm mt-0.5">
                Gestionează-ți abonamentul, rezervă clase și urmărește progresul.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#"
              className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-gold/50 text-white px-4 py-2.5 rounded-xl transition-all duration-200 group"
            >
              <AppleIcon />
              <div className="text-left leading-tight">
                <p className="text-[10px] text-white/60 group-hover:text-white/80 transition-colors">
                  Disponibil pe
                </p>
                <p className="text-sm font-semibold">App Store</p>
              </div>
            </a>

            <a
              href="#"
              className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-gold/50 text-white px-4 py-2.5 rounded-xl transition-all duration-200 group"
            >
              <GooglePlayIcon />
              <div className="text-left leading-tight">
                <p className="text-[10px] text-white/60 group-hover:text-white/80 transition-colors">
                  Disponibil pe
                </p>
                <p className="text-sm font-semibold">Google Play</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
