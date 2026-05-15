import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { classes } from '../../data/classes';
import { scheduleEntries, categoryColors } from '../../data/schedule';
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

const START_HOUR = 7;
const END_HOUR = 22;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const HOUR_HEIGHT = 50;
const GRID_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;
const HOURS = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i);

const classMap = Object.fromEntries(classes.map((c) => [c.id, c]));

function timeToPercent(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return ((h - START_HOUR) * 60 + m) / (TOTAL_HOURS * 60) * 100;
}

function durationToPercent(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return ((eh - sh) * 60 + (em - sm)) / (TOTAL_HOURS * 60) * 100;
}

export default function ScheduleGrid() {
  const [activeDay, setActiveDay] = useState<DayKey>('luni');

  return (
    <div>
      {/* Desktop grid */}
      <div className="hidden md:flex overflow-x-auto rounded-lg border border-white/10">
        {/* Time labels */}
        <div className="w-14 flex-shrink-0">
          <div className="h-10 bg-surface border-b border-white/10" />
          <div className="relative bg-dark" style={{ height: GRID_HEIGHT }}>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute right-2 text-[10px] text-muted leading-none"
                style={{
                  top: `${((hour - START_HOUR) / TOTAL_HOURS) * 100}%`,
                  transform: 'translateY(-50%)',
                }}
              >
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>
        </div>

        {/* Day columns */}
        {DAYS.map((day) => {
          const isSunday = day.key === 'duminica';
          const dayEntries = scheduleEntries.filter((e) => e.day === day.key);

          return (
            <div key={day.key} className="flex-1 min-w-0 border-l border-white/10">
              {/* Header */}
              <div className="h-10 flex items-center justify-center text-xs font-bold text-white/70 bg-surface border-b border-white/10">
                {day.label}
              </div>
              {/* Column body */}
              <div className="relative" style={{ height: GRID_HEIGHT }}>
                {/* Hour lines */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-t border-white/5"
                    style={{ top: `${((hour - START_HOUR) / TOTAL_HOURS) * 100}%` }}
                  />
                ))}

                {isSunday ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-surface-2/40">
                    <span className="text-muted text-sm font-medium">Închis</span>
                  </div>
                ) : (
                  dayEntries.map((entry) => {
                    const cls = classMap[entry.classId];
                    if (!cls) return null;
                    const color = categoryColors[cls.category as keyof typeof categoryColors] ?? '#F5C518';
                    return (
                      <motion.div
                        key={`${entry.day}-${entry.classId}-${entry.startTime}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        animate={{ zIndex: 1 }}
                        transition={{ delay: idx * 0.05, duration: 0.3 }}
                        whileHover={{ scale: 1.04, zIndex: 20 }}
                        className="absolute left-1 right-1 rounded p-1.5 overflow-hidden cursor-default"
                        style={{
                          top: `${timeToPercent(entry.startTime)}%`,
                          height: `${durationToPercent(entry.startTime, entry.endTime)}%`,
                          backgroundColor: color + 'CC',
                        }}
                      >
                        <p className="text-white text-[11px] font-bold leading-tight truncate">
                          {cls.title}
                        </p>
                        <p className="text-white/70 text-[10px] leading-tight">
                          {entry.startTime}–{entry.endTime}
                        </p>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
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

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-white/10">
        {Object.entries(categoryColors).map(([category, color]) => (
          <div key={category} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-muted text-sm">{category}</span>
          </div>
        ))}
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
            key={`${entry.day}-${entry.classId}`}
            className="flex items-start gap-3 p-4 rounded-lg bg-surface"
            style={{ borderLeft: `4px solid ${color}` }}
          >
            <div>
              <p className="text-white font-bold">{cls.title}</p>
              <p className="text-muted text-sm">{entry.startTime} – {entry.endTime}</p>
              <p className="text-xs mt-1 font-medium" style={{ color }}>{cls.category}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
