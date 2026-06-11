import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Pagina nu există — FightClub Galați</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen bg-dark flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gold text-8xl font-black mb-4">404</p>
          <h1 className="text-3xl font-black text-white mb-3">Pagina nu există</h1>
          <p className="text-muted mb-8">Link-ul accesat nu a fost găsit.</p>
          <Link
            to="/"
            className="bg-gold text-dark font-bold px-8 py-3 rounded hover:bg-gold-dark transition-colors"
          >
            Înapoi la pagina principală
          </Link>
        </div>
      </main>
    </>
  );
}
