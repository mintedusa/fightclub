import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const contactInfo = [
  { Icon: MapPin, text: 'Strada Saturn 34, 800647 Galați' },
  { Icon: Phone, text: '0752 960 301' },
  { Icon: Mail, text: 'contact@fightclubgalati.ro' },
  { Icon: Clock, text: 'L-V: 06:00-22:00 · S-D: 08:00-20:00' },
];

export default function ContactSection() {
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useScrollAnimation<HTMLDivElement>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void; currentTarget: HTMLFormElement }) => {
    e.preventDefault();
    if (!formRef.current) return;

    const data = Object.fromEntries(new FormData(formRef.current));
    setLoading(true);
    try {
      const res = await fetch('/contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data as Record<string, string>).toString(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success('Mesaj trimis cu succes! Te vom contacta în curând.');
      formRef.current.reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Eroare la trimitere. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-muted text-sm focus:outline-none focus:border-gold transition-colors';

  return (
    <section id="contact" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div ref={titleRef} className="text-center mb-12">
          <span className="text-gold text-sm font-bold uppercase tracking-widest">
            Contactează-ne
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">
            Hai la <span className="text-gold">FightClub</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="from_name"
              placeholder="Numele tău *"
              className={inputClass}
              required
            />
            <input
              type="email"
              name="from_email"
              placeholder="Email *"
              className={inputClass}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Telefon"
              className={inputClass}
            />
            <textarea
              name="message"
              placeholder="Mesajul tău *"
              rows={5}
              className={`${inputClass} resize-none`}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-dark font-bold py-3 rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Se trimite...' : 'Trimite Mesaj'}
            </button>
          </form>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map(({ Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                  <span className="text-muted text-sm">{text}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl overflow-hidden h-64 lg:h-80">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d436.24099776803075!2d28.028497130868328!3d45.421716786669734!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b6dee7c95eb2b9%3A0x648dd10277a8c124!2sFight%20club%20Gala%C8%9Bi!5e0!3m2!1sro!2sus!4v1780916202024!5m2!1sro!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="FightClub Galați pe hartă"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
