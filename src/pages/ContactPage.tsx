import { Helmet } from 'react-helmet-async';
import ContactSection from '../components/sections/ContactSection';

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Contact & Locație — FightClub Galați</title>
        <meta
          name="description"
          content="Strada Saturn 34, 800647 Galați. Contactează-ne astăzi. Tel: 0236 000 000. Email: contact@fightclubgalati.ro"
        />
      </Helmet>
      <div className="pt-24">
        <ContactSection />
      </div>
    </>
  );
}
