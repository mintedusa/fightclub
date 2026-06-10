import type { Trainer } from '../types';
import ionutImg from '../assets/Ionut.webp';
import narcisaImg from '../assets/Narcisa.jpeg';
import stefuImg from '../assets/Stefu-Veronica.jpeg';
import gabrielImg from '../assets/Gabriel-Dinu.jpeg';
import anaImg from '../assets/Ana.jpeg';

export const trainers: Trainer[] = [
  {
    id: 'narcisa-dorin',
    name: 'Narcisa Dorin',
    specialty: 'Master Trainer',
    bio: 'Master trainer și fondatoarea FightClub Galați. Conduce cu energie și precizie fiecare sesiune, specializată în clase de avansați pentru rezultate maxime.',
    avatar: narcisaImg,
    certifications: ['Master Trainer', 'Clase Avansați'],
    socials: { instagram: '#', facebook: '#' },
  },
  {
    id: 'ionut-cocos',
    name: 'Ionuț Cocoș',
    specialty: 'Antrenor Personal Trainer & Kinetoterapeut',
    bio: 'Kinetoterapeut și personal trainer. Construiește programe eficiente și sigure, adaptate fiecărei persoane.',
    avatar: ionutImg,
    certifications: ['Facultatea de Educație Fizică și Sport', 'Kinetoterapie', 'Personal Trainer'],
    socials: { instagram: '#', facebook: '#' },
  },
  {
    id: 'stefu-veronica',
    name: 'Ștefu Veronica',
    specialty: 'Antrenor Clase Începători & Avansați',
    bio: 'Antrenor dedicat claselor de grup, cu o energie contagioasă care motivează atât începătorii cât și sportivii avansați să se depășească.',
    avatar: stefuImg,
    certifications: ['Antrenor Clase Grup', 'Aerobic & Fitness'],
    socials: { instagram: '#', facebook: '#' },
  },
  {
    id: 'dinu-gabriel',
    name: 'Dinu Gabriel',
    specialty: 'Antrenor Circuit Full Body',
    bio: 'Specialist în antrenamente circuit full body, cu accent pe tonifiere, rezistență și arderea caloriilor. Antrenamentele lui sunt dinamice și eficiente.',
    avatar: gabrielImg,
    certifications: ['Circuit Training', 'Full Body Fitness'],
    socials: { instagram: '#', facebook: '#' },
  },
  {
    id: 'ana-serebrianska',
    name: 'Ana Serebrianska',
    specialty: 'Antrenor Pilates & Stretching',
    bio: 'Instructor Pilates & Stretching, pasionată de mișcarea controlată și flexibilitate. Sesiunile ei combină tehnica Pilates cu stretching profund pentru o recuperare optimă.',
    avatar: anaImg,
    certifications: ['Pilates Instructor', 'Stretching & Mobilitate'],
    socials: { instagram: '#', facebook: '#' },
  },
];
