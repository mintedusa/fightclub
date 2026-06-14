import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scheduleClasses, scheduleEntries, categoryColors, activeCategoryColors } from '../../data/schedule';
import type { DayKey } from '../../types';

const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'luni',     label: 'Luni',     short: 'L'  },
  { key: 'marti',    label: 'Marți',    short: 'M'  },
  { key: 'miercuri', label: 'Miercuri', short: 'Mi' },
  { key: 'joi',      label: 'Joi',      short: 'J'  },
  { key: 'vineri',   label: 'Vineri',   short: 'V'  },
  { key: 'sambata',  label: 'Sâmbătă',  short: 'S'  },
  { key: 'duminica', label: 'Duminică', short: 'D'  },
];

const classMap = Object.fromEntries(scheduleClasses.map((c) => [c.id, c]));

// Only time slots that have at least one class
const activeSlots = [...new Set(scheduleEntries.map((e) => e.startTime))].sort();

function LevelBadge({ time }: { time: string }) {
  const isBeginners = time === '16:30';
  return (
    <span
      className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full mt-1 inline-block ${
        isBeginners
          ? 'bg-emerald-500/20 text-emerald-400'
          : 'bg-gold/15 text-gold'
      }`}
    >
      {isBeginners ? 'Începători' : 'Avansați'}
    </span>
  );
}

const JS_DAY_TO_KEY: Record<number, DayKey> = {
  0: 'duminica',
  1: 'luni',
  2: 'marti',
  3: 'miercuri',
  4: 'joi',
  5: 'vineri',
  6: 'sambata',
};

export default function ScheduleGrid() {
  const [activeDay, setActiveDay] = useState<DayKey>(JS_DAY_TO_KEY[new Date().getDay()]);

  return (
    <div>
      {/* Desktop grid */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface border-b border-white/10">
              <th className="w-20 py-3 text-xs font-bold text-white/50 text-center">Ora</th>
              {DAYS.map((day) => (
                <th key={day.key} className="py-3 text-xs font-bold text-white/70 text-center">
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeSlots.map((slot, rowIdx) => {
              // Find end time from any entry at this slot
              const sampleEntry = scheduleEntries.find((e) => e.startTime === slot);
              const endTime = sampleEntry?.endTime ?? '';

              return (
                <tr
                  key={slot}
                  className={`border-b border-white/5 ${rowIdx % 2 === 0 ? 'bg-dark' : 'bg-surface/30'}`}
                >
                  {/* Time label */}
                  <td className="py-4 text-center">
                    <span className="text-[11px] font-bold text-gold block">{slot}</span>
                    {endTime && (
                      <span className="text-[10px] text-muted/60">–{endTime}</span>
                    )}
                    <LevelBadge time={slot} />
                  </td>

                  {/* Day cells */}
                  {DAYS.map((day) => {
                    const isSunday = day.key === 'duminica';
                    const entry = scheduleEntries.find(
                      (e) => e.day === day.key && e.startTime === slot
                    );
                    const cls = entry ? classMap[entry.classId] : null;
                    const color = cls ? categoryColors[cls.category] : null;

                    return (
                      <td key={day.key} className="py-2 px-1.5">
                        {isSunday ? (
                          rowIdx === Math.floor(activeSlots.length / 2) ? (
                            <div className="text-center text-muted/50 text-xs font-medium">Închis</div>
                          ) : null
                        ) : cls && color ? (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: rowIdx * 0.03, duration: 0.25 }}
                            className="rounded-lg px-2.5 py-2.5"
                            style={{ backgroundColor: color + 'CC' }}
                          >
                            <p className="text-white text-[11px] font-bold leading-tight">
                              {cls.title}
                            </p>
                            <p className="text-white/70 text-[10px] mt-0.5">
                              {entry!.startTime}–{entry!.endTime}
                            </p>
                          </motion.div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: tabs */}
      <div className="md:hidden">
        <div className="flex gap-1 mb-4 flex-wrap">
          {DAYS.map((day) => (
            <button
              key={day.key}
              onClick={() => setActiveDay(day.key)}
              className={`px-3 py-1.5 rounded text-sm font-bold transition-colors ${
                activeDay === day.key
                  ? 'bg-gold text-dark'
                  : 'bg-surface text-muted hover:text-white'
              }`}
            >
              {day.short}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeDay === 'duminica' ? (
              <div className="text-center text-muted py-12 text-lg font-medium">Închis</div>
            ) : (
              <MobileDayList day={activeDay} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Legend — only categories actually used */}
      <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-white/10">
        {Object.entries(activeCategoryColors).map(([category, color]) => (
          <div key={category} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-muted text-sm">{category}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-3">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Începători</span>
          <span className="text-muted text-xs">Clasele de la 16:30</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-gold/15 text-gold">Avansați</span>
          <span className="text-muted text-xs">Restul claselor</span>
        </div>
      </div>
    </div>
  );
}

function MobileDayList({ day }: { day: DayKey }) {
  const dayEntries = scheduleEntries
    .filter((e) => e.day === day)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (dayEntries.length === 0) {
    return <div className="text-center text-muted py-12">Nicio clasă programată</div>;
  }

  return (
    <div className="space-y-3">
      {dayEntries.map((entry) => {
        const cls = classMap[entry.classId];
        if (!cls) return null;
        const color = categoryColors[cls.category as keyof typeof categoryColors] ?? '#F5C518';
        return (
          <div
            key={`${entry.day}-${entry.classId}-${entry.startTime}`}
            className="flex items-start gap-3 p-4 rounded-lg bg-surface"
            style={{ borderLeft: `4px solid ${color}` }}
          >
            <div>
              <p className="text-white font-bold">{cls.title}</p>
              <p className="text-muted text-sm">{entry.startTime} – {entry.endTime}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs font-medium" style={{ color }}>{cls.category}</p>
                <LevelBadge time={entry.startTime} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
