import { Helmet } from 'react-helmet-async';

export default function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Politică de Confidențialitate — FightClub Galați</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen bg-dark pt-40 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-black text-white mb-2">
            Politică de <span className="text-gold">Confidențialitate</span>
          </h1>
          <p className="text-muted text-sm mb-10">Ultima actualizare: iunie 2026</p>

          <div className="prose prose-invert max-w-none space-y-8 text-muted leading-relaxed">

            <section>
              <h2 className="text-white text-xl font-bold mb-3">1. Cine suntem</h2>
              <p>
                FightClub Galați, Strada Saturn 34, Galați, România.<br />
                Contact: <a href="mailto:contact@fightclubgalati.ro" className="text-gold hover:underline">contact@fightclubgalati.ro</a> · 0752 960 301
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">2. Ce date colectăm</h2>
              <p>Colectăm date personale doar atunci când:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li><strong className="text-white">Formularul de contact</strong> — nume, adresă de email, număr de telefon (opțional), mesaj.</li>
                <li><strong className="text-white">Cookie-uri tehnice</strong> — necesare pentru funcționarea site-ului (preferința cookie banner).</li>
              </ul>
              <p className="mt-2">Nu colectăm date de plată, nu folosim formulare de înregistrare și nu creăm conturi de utilizator.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">3. Cum folosim datele</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Răspundem la solicitările trimise prin formularul de contact.</li>
                <li>Nu vindem, nu închiriem și nu transferăm datele tale către terți.</li>
                <li>Mesajele primite sunt stocate doar în căsuța de email a sălii și sunt șterse după rezolvarea solicitării.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">4. Cookie-uri</h2>
              <p>Site-ul folosește un singur cookie tehnic (<code className="text-gold">cookieConsent</code>) care salvează preferința ta legată de bannerul de cookie-uri. Nu folosim cookie-uri de tracking sau publicitate.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">5. Drepturile tale (GDPR)</h2>
              <p>Conform Regulamentului European 679/2016, ai dreptul să:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Accesezi datele personale pe care le deținem despre tine.</li>
                <li>Soliciți rectificarea sau ștergerea datelor.</li>
                <li>Te opui prelucrării datelor.</li>
                <li>Depui o plângere la <strong className="text-white">ANSPDCP</strong> (Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal).</li>
              </ul>
              <p className="mt-2">Pentru orice solicitare, ne poți contacta la <a href="mailto:contact@fightclubgalati.ro" className="text-gold hover:underline">contact@fightclubgalati.ro</a>.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">6. Securitate</h2>
              <p>Site-ul folosește conexiune HTTPS (SSL/TLS). Formularele de contact sunt transmise prin email securizat și nu sunt stocate în baze de date externe.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">7. Modificări</h2>
              <p>Putem actualiza această politică periodic. Orice modificare semnificativă va fi anunțată pe site.</p>
            </section>

          </div>
        </div>
      </main>
    </>
  );
}
