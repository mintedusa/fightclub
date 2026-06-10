import { Helmet } from 'react-helmet-async';
import PricingSection from '../components/sections/PricingSection';

export default function PricingPage() {
  return (
    <>
      <Helmet>
        <title>Prețuri & Abonamente Galați | FightClub Galați</title>
        <meta name="description" content="Abonamente fitness și clase FightClub Galați. Fitness full day, clase aerobic, PT personal, abonamente pe 3, 6 și 12 luni. Prețuri accesibile." />
        <link rel="canonical" href="https://fightclubgalati.ro/preturi" />
        <meta property="og:title" content="Prețuri & Abonamente | FightClub Galați" />
        <meta property="og:description" content="Abonamente fitness și clase aerobic din Galați. Prețuri accesibile, abonamente flexibile." />
        <meta property="og:url" content="https://fightclubgalati.ro/preturi" />
        <meta property="og:image" content="https://fightclubgalati.ro/hero-poster.jpg" />
      </Helmet>

      <div className="pt-32 pb-4 bg-surface text-center">
        <span className="text-gold text-sm font-bold uppercase tracking-widest">
          Abonamente
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white mt-2">
          Prețuri & <span className="text-gold">Abonamente</span>
        </h1>
        <p className="text-muted mt-4 max-w-lg mx-auto text-sm">
          Alege abonamentul potrivit și începe transformarea ta la FightClub Galați.
        </p>
      </div>

      <PricingSection />
    </>
  );
}
