export interface GymClass {
  id: string;
  title: string;
  level: 'Începător' | 'Intermediar' | 'Avansat' | 'Toate nivelele';
  schedule: string;
  image: string;
  description: string;
  category: string;
}

export interface Trainer {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  avatar: string;
  certifications: string[];
  socials: { instagram?: string; facebook?: string };
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  features: string[];
  highlighted: boolean;
  badge?: string;
}

export interface NavItem {
  label: string;
  href: string;
}
