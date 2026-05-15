import { FormEvent, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const contactInfo = [
  { Icon: MapPin, text: 'Strada Saturn 34, 800647 Galați' },
  { Icon: Phone, text: '0236 000 000' },
  { Icon: Mail, text: 'contact@fightclubgalati.ro' },
  { Icon: Clock, text: 'L-V: 06:00-22:00 · S-D: 08:00-20:00' },
];

export default function ContactSection() {
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useScrollAnimation<HTMLDivElement>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    setLoading(true);
    try {
      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID as string,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string,
        formRef.current,
        { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string },
      );
      toast.success('Mesaj trimis cu succes! Te vom contacta în curând.');
      formRef.current.reset();
    } catch {
      toast.error('Eroare la trimitere. Te rugăm să încerci din nou.');
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
                src="https://maps.google.com/maps?q=Strada+Saturn+34,+Galati,+Romania&output=embed&hl=ro"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="FightClub Galați pe hartă"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
