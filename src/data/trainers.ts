import type { Trainer } from '../types';
import ionutImg from '../assets/Ionut.webp';
import narcisaImg from '../assets/Narcisa.webp';

export const trainers: Trainer[] = [
  {
    id: 'ionut',
    name: 'Ionuț',
    specialty: 'Fitness & Personal Trainer',
    bio: 'Kinetoterapeut și personal trainer. Construiește programe eficiente și sigure, adaptate fiecărei persoane.',
    avatar: ionutImg,
    certifications: ['Facultatea de Educație Fizică și Sport', 'Kinetoterapie', 'Personal Trainer'],
    socials: { instagram: '#', facebook: '#' },
  },
  {
    id: 'narcisa-dorin',
    name: 'Narcisa Dorin',
    specialty: 'Trainer Profesionist',
    bio: 'Trainer profesionist specializată în clasele de avansați. Conduce cu energie și precizie fiecare sesiune pentru rezultate maxime.',
    avatar: narcisaImg,
    certifications: ['Trainer Profesionist', 'Clase Avansați'],
    socials: { instagram: '#', facebook: '#' },
  },
  {
    id: 'bogdan-radu',
    name: 'Bogdan Radu',
    specialty: 'Power Step & Strength',
    bio: 'Power Step Level 2 Trainer cu expertiză în olimpic lifting și programare pentru forță maximă.',
    avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80',
    certifications: ['Power Step L2', 'NSCA-CSCS', 'Olympic Weightlifting'],
    socials: { instagram: '#', facebook: '#' },
  },
  {
    id: 'elena-popa',
    name: 'Elena Popa',
    specialty: 'Spinning & Cardio',
    bio: 'Instructor spinning certificat Schwinn cu 8 ani în industrie. Campioană la triatlon, pasionată de performanță cardio.',
    avatar: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80',
    certifications: ['Schwinn Cycling', 'ACE Group Fitness', 'Triathlon Coach'],
    socials: { instagram: '#', facebook: '#' },
  },
];
