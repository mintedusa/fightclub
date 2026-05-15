import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
}

export default function StarRating({ rating }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-gold fill-gold' : 'text-muted'}`}
        />
      ))}
    </div>
  );
}
