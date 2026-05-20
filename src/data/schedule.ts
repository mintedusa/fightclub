import type { ScheduleEntry } from '../types';

export const scheduleEntries: ScheduleEntry[] = [
  // Box Thai — L / M / V  18:00–19:30
  { classId: 'box-thai', day: 'luni',   startTime: '18:00', endTime: '19:30' },
  { classId: 'box-thai', day: 'marti',  startTime: '18:00', endTime: '19:30' },
  { classId: 'box-thai', day: 'vineri', startTime: '18:00', endTime: '19:30' },
  // Power Step — M / J / S  07:00–08:30
  { classId: 'power-step', day: 'marti',   startTime: '07:00', endTime: '08:30' },
  { classId: 'power-step', day: 'joi',     startTime: '07:00', endTime: '08:30' },
  { classId: 'power-step', day: 'sambata', startTime: '07:00', endTime: '08:30' },
  // Yoga — M / V  10:00–11:00
  { classId: 'yoga', day: 'marti',  startTime: '10:00', endTime: '11:00' },
  { classId: 'yoga', day: 'vineri', startTime: '10:00', endTime: '11:00' },
  // Spinning — L / M / J  19:00–20:00
  { classId: 'spinning', day: 'luni',  startTime: '19:00', endTime: '20:00' },
  { classId: 'spinning', day: 'marti', startTime: '19:00', endTime: '20:00' },
  { classId: 'spinning', day: 'joi',   startTime: '19:00', endTime: '20:00' },
  // MMA — M / V  20:00–21:30
  { classId: 'mma', day: 'marti',  startTime: '20:00', endTime: '21:30' },
  { classId: 'mma', day: 'vineri', startTime: '20:00', endTime: '21:30' },
  // Kickbox — L / J  17:00–18:30
  { classId: 'kickbox', day: 'luni', startTime: '17:00', endTime: '18:30' },
  { classId: 'kickbox', day: 'joi',  startTime: '17:00', endTime: '18:30' },
];

export const categoryColors: Record<'Lupte' | 'Cardio' | 'Funcțional' | 'Wellness', string> = {
  Lupte:      '#EF4444',
  Cardio:     '#3B82F6',
  Funcțional: '#22C55E',
  Wellness:   '#A855F7',
};
