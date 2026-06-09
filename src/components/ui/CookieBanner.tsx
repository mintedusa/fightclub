import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'fc_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50"
        >
          <div className="bg-surface border border-gold/20 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm mb-1">Cookie-uri</p>
                <p className="text-muted text-xs leading-relaxed">
                  Folosim cookie-uri esențiale pentru funcționarea site-ului. Nu colectăm date personale fără acordul tău.
                </p>
              </div>
              <button
                onClick={decline}
                className="text-muted hover:text-white transition-colors shrink-0 -mt-0.5"
                aria-label="Închide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={accept}
                className="flex-1 bg-gold hover:bg-gold-dark text-dark font-bold text-xs py-2.5 rounded-xl transition-colors"
              >
                Accept
              </button>
              <button
                onClick={decline}
                className="flex-1 border border-white/15 hover:border-gold/40 text-muted hover:text-white font-semibold text-xs py-2.5 rounded-xl transition-colors"
              >
                Refuz
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
