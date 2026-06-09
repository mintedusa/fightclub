import { Helmet } from 'react-helmet-async';
import ContactSection from '../components/sections/ContactSection';

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Contact & Locație Galați | FightClub — Strada Saturn 34</title>
        <meta name="description" content="Găsește-ne la Strada Saturn 34, Galați. Trimite-ne un mesaj sau vino direct la sală. Program: Luni–Vineri 08:00–21:00, Sâmbătă 08:00–14:00." />
        <link rel="canonical" href="https://fightclubgalati.ro/contact" />
        <meta property="og:title" content="Contact FightClub Galați — Strada Saturn 34" />
        <meta property="og:description" content="Sală de fitness în Galați. Strada Saturn 34. Trimite-ne un mesaj sau vino direct!" />
        <meta property="og:url" content="https://fightclubgalati.ro/contact" />
        <meta property="og:image" content="https://fightclubgalati.ro/hero-poster.jpg" />
      </Helmet>
      <div className="pt-24">
        <ContactSection />
      </div>
    </>
  );
}
