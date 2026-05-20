import type { Trainer } from '../types';

export const trainers: Trainer[] = [
  {
    id: 'alexandru-ionescu',
    name: 'Alexandru Ionescu',
    specialty: 'Box & MMA',
    bio: 'Campion național la box amator cu 15 ani experiență. Antrenor certificat FRBX cu peste 200 de sportivi pregătiți.',
    avatar: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80',
    certifications: ['FRBX Level 3', 'MMA Coach Certified', 'First Aid'],
    socials: { instagram: '#', facebook: '#' },
  },
  {
    id: 'maria-constantin',
    name: 'Maria Constantin',
    specialty: 'Yoga & Pilates',
    bio: 'Instructor de yoga cu certificare internațională RYT-200. Specializată în yoga terapeutică și recuperare post-traumatism.',
    avatar: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=400&q=80',
    certifications: ['RYT-200 Yoga Alliance', 'Pilates Mat Level 2', 'Mindfulness Coach'],
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
