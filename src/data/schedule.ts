import type { ScheduleEntry } from '../types';

export type ScheduleCategory = 'Lupte' | 'Cardio' | 'Funcțional' | 'Wellness';

export interface ScheduleClass {
  id: string;
  title: string;
  category: ScheduleCategory;
}

export const scheduleClasses: ScheduleClass[] = [
  { id: 'mortal-kombat-int',    title: 'Mortal Kombat Intermediari',  category: 'Cardio'     },
  { id: 'mortal-kombat-av',     title: 'Mortal Kombat Avansați',      category: 'Cardio'     },
  { id: 'body-kombat-inc',      title: 'Body Kombat Începători',      category: 'Cardio'     },
  { id: 'full-body',            title: 'Full Body',                   category: 'Funcțional' },
  { id: 'bosu-int',             title: 'Bosu Intermediari',           category: 'Funcțional' },
  { id: 'bosu-av',              title: 'Bosu Avansați',               category: 'Funcțional' },
  { id: 'tabata-inc',           title: 'Tabata Începători',           category: 'Cardio'     },
  { id: 'functional-step-av',   title: 'Functional Step Avansați',    category: 'Funcțional' },
  { id: 'pilates',              title: 'Pilates',                     category: 'Wellness'   },
  { id: 'body-pump-int',        title: 'Body Pump Intermediari',      category: 'Funcțional' },
  { id: 'superfit-av',          title: 'SuperFit Avansați',           category: 'Cardio'     },
  { id: 'superfit-inc',         title: 'SuperFit Începători',         category: 'Cardio'     },
  { id: 'superfit-int',         title: 'SuperFit Intermediari',       category: 'Cardio'     },
  { id: 'surpriza-av',          title: 'Surpriza Avansați',           category: 'Cardio'     },
  { id: 'aerobic-stretching',   title: 'Aerobic Stretching',          category: 'Wellness'   },
];

export const scheduleEntries: ScheduleEntry[] = [
  // Luni
  { classId: 'mortal-kombat-int',  day: 'luni',     startTime: '08:00', endTime: '09:00' },
  { classId: 'body-kombat-inc',    day: 'luni',     startTime: '16:30', endTime: '17:30' },
  { classId: 'mortal-kombat-av',   day: 'luni',     startTime: '17:30', endTime: '18:30' },
  { classId: 'mortal-kombat-av',   day: 'luni',     startTime: '18:30', endTime: '19:30' },
  { classId: 'full-body',          day: 'luni',     startTime: '19:30', endTime: '20:30' },
  // Marți
  { classId: 'bosu-int',           day: 'marti',    startTime: '08:00', endTime: '09:00' },
  { classId: 'tabata-inc',         day: 'marti',    startTime: '16:30', endTime: '17:30' },
  { classId: 'bosu-av',            day: 'marti',    startTime: '17:30', endTime: '18:30' },
  { classId: 'bosu-av',            day: 'marti',    startTime: '18:30', endTime: '19:30' },
  { classId: 'bosu-int',           day: 'marti',    startTime: '19:30', endTime: '20:30' },
  // Miercuri
  { classId: 'functional-step-av', day: 'miercuri', startTime: '08:00', endTime: '09:00' },
  { classId: 'pilates',            day: 'miercuri', startTime: '16:30', endTime: '17:30' },
  { classId: 'functional-step-av', day: 'miercuri', startTime: '17:30', endTime: '18:30' },
  { classId: 'functional-step-av', day: 'miercuri', startTime: '18:30', endTime: '19:30' },
  { classId: 'body-pump-int',      day: 'miercuri', startTime: '19:30', endTime: '20:30' },
  // Joi
  { classId: 'superfit-av',        day: 'joi',      startTime: '08:00', endTime: '09:00' },
  { classId: 'superfit-inc',       day: 'joi',      startTime: '16:30', endTime: '17:30' },
  { classId: 'superfit-av',        day: 'joi',      startTime: '17:30', endTime: '18:30' },
  { classId: 'superfit-av',        day: 'joi',      startTime: '18:30', endTime: '19:30' },
  { classId: 'superfit-int',       day: 'joi',      startTime: '19:30', endTime: '20:30' },
  // Vineri
  { classId: 'surpriza-av',        day: 'vineri',   startTime: '08:00', endTime: '09:00' },
  { classId: 'pilates',            day: 'vineri',   startTime: '16:30', endTime: '17:30' },
  { classId: 'surpriza-av',        day: 'vineri',   startTime: '17:30', endTime: '18:30' },
  { classId: 'surpriza-av',        day: 'vineri',   startTime: '18:30', endTime: '19:30' },
  // Sâmbătă
  { classId: 'aerobic-stretching', day: 'sambata',  startTime: '08:30', endTime: '09:30' },
];

export const categoryColors: Record<ScheduleCategory, string> = {
  Lupte:      '#EF4444',
  Cardio:     '#3B82F6',
  Funcțional: '#22C55E',
  Wellness:   '#A855F7',
};
