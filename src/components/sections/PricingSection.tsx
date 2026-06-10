import { motion } from 'framer-motion';
import { GraduationCap, Check } from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.companyname.gma&pcampaignid=web_share';
const APP_STORE_URL = 'https://apps.apple.com/ro/app/gma-gym-management-app/id1496040256';

const multiMonthOffers = [
  {
    id: 'fitness',
    label: 'Fitness',
    rows: [
      { period: '3 Luni', total: 549, monthly: 183 },
      { period: '6 Luni', total: 999, monthly: 166 },
      { period: '12 Luni', total: 1799, monthly: 149 },
    ],
  },
  {
    id: 'clase',
    label: 'Clase de Grup',
    rows: [
      { period: '3 Luni', total: 849, monthly: 283 },
      { period: '6 Luni', total: 1599, monthly: 266 },
      { period: '12 Luni', total: 2799, monthly: 233 },
    ],
  },
  {
    id: 'combo',
    label: 'Clase de Grup + Fitness',
    rows: [
      { period: '3 Luni', total: 899, monthly: 299 },
      { period: '6 Luni', total: 1699, monthly: 283 },
      { period: '12 Luni', total: 2999, monthly: 249 },
    ],
  },
];

const studentBenefits = [
  'Sală nouă, aparatură modernă',
  'Ventilație proprie cu aer purificat – printre puținele săli din oraș',
  'Sistem de acces inteligent – fără aglomerație',
  'Condiții premium, atenție la detalii',
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function PricingSection() {
  const titleRef = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="py-20 bg-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Title */}
        <div ref={titleRef} className="text-center mb-14">
          <span className="text-gold text-sm font-bold uppercase tracking-widest">
            Abonamente
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">
            Planuri & <span className="text-gold">Prețuri</span>
          </h2>
          <p className="text-muted text-sm mt-3">
            Abonamentele se achiziționează la recepția sălii sau prin contact direct.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* ─── Left: Abonamente Lunare ─── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gold mb-6 text-center lg:text-left">
              Abonamente Lunare
            </h3>

            <div className="flex flex-col gap-4">

              {/* FITNESS */}
              <motion.div variants={itemVariants} className="bg-surface border border-white/10 rounded-2xl p-5">
                <p className="text-xs font-black uppercase tracking-widest text-gold/70 mb-1">Fitness</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-white">199</span>
                  <span className="text-muted text-sm">RON / lună</span>
                </div>
              </motion.div>

              {/* CLASE DE GRUP */}
              <motion.div variants={itemVariants} className="bg-surface border border-white/10 rounded-2xl p-5">
                <p className="text-xs font-black uppercase tracking-widest text-gold/70 mb-3">Clase de Grup</p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted text-sm">12 ședințe / lună</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">279</span>
                      <span className="text-muted text-xs">RON</span>
                    </div>
                  </div>
                  <div className="h-px bg-white/8" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-semibold">Full Access</p>
                      <p className="text-muted text-xs">zilnic, luni – sâmbătă</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">299</span>
                      <span className="text-muted text-xs">RON</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* CLASE DE GRUP + FITNESS */}
              <motion.div variants={itemVariants} className="bg-surface border border-white/10 rounded-2xl p-5">
                <p className="text-xs font-black uppercase tracking-widest text-gold/70 mb-3">Clase de Grup + Fitness</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-semibold">Full Access</p>
                    <p className="text-muted text-xs">zilnic, luni – sâmbătă</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">329</span>
                    <span className="text-muted text-xs">RON</span>
                  </div>
                </div>
              </motion.div>

              {/* ELEVI ȘI STUDENȚI */}
              <motion.div
                variants={itemVariants}
                className="bg-gold/8 border border-gold/40 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-gold shrink-0" />
                    <p className="text-xs font-black uppercase tracking-widest text-gold/80">
                      Ofertă pentru Elevi și Studenți
                    </p>
                  </div>
                  <span className="bg-gold text-dark text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider whitespace-nowrap shrink-0">
                    Cea mai bună ofertă!
                  </span>
                </div>
                <p className="text-white text-sm font-bold mb-3">Full Fitness All Day</p>
                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="text-4xl font-black text-gold">149</span>
                  <span className="text-muted text-sm">RON / lună</span>
                </div>
                <ul className="flex flex-col gap-2 mb-4">
                  {studentBenefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-muted text-xs">
                      <Check className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <p className="text-gold/80 text-sm italic">Investește în tine, acum!</p>
              </motion.div>

            </div>
          </motion.div>

          {/* ─── Right: Oferte 3/6/12 Luni ─── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gold mb-6 text-center lg:text-left">
              Oferte Abonamente 3, 6 și 12 Luni
            </h3>

            <div className="flex flex-col gap-6">
              {multiMonthOffers.map((cat) => (
                <motion.div
                  key={cat.id}
                  variants={itemVariants}
                  className="bg-surface border border-white/10 rounded-2xl overflow-hidden"
                >
                  <div className="px-5 pt-4 pb-3">
                    <p className="text-xs font-black uppercase tracking-widest text-gold/70">{cat.label}</p>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-t border-white/8">
                        <th className="text-left px-5 py-2 text-[10px] font-black uppercase tracking-widest text-muted/60">Perioadă</th>
                        <th className="text-right px-5 py-2 text-[10px] font-black uppercase tracking-widest text-muted/60">Preț total</th>
                        <th className="text-right px-5 py-2 text-[10px] font-black uppercase tracking-widest text-muted/60">Echivalent lunar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.rows.map((row, i) => (
                        <tr
                          key={row.period}
                          className={`border-t border-white/8 ${i === 2 ? 'bg-gold/5' : ''}`}
                        >
                          <td className="px-5 py-3 font-semibold text-white">{row.period}</td>
                          <td className="px-5 py-3 text-right text-white">{row.total} RON</td>
                          <td className={`px-5 py-3 text-right font-bold ${i === 2 ? 'text-gold' : 'text-muted'}`}>
                            {row.monthly} RON / lună
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* GMA CTA */}
        <div className="mt-14 text-center">
          <p className="text-muted text-sm mb-4">
            Descarcă aplicația <span className="text-gold font-semibold">GMA</span> pentru orar, rezervări și gestionarea abonamentului
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-gold/50 text-white px-5 py-2.5 rounded-xl transition-all text-sm font-semibold"
            >
              App Store
            </a>
            <a
              href={GOOGLE_PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-gold/50 text-white px-5 py-2.5 rounded-xl transition-all text-sm font-semibold"
            >
              Google Play
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
