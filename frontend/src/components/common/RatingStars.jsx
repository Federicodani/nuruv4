import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, size = 'sm', showNumber = true }) => {
  const sizes = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' };
  const starSize = sizes[size];

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= Math.round(rating) ? 'fill-primary text-primary' : 'fill-secondary-200 text-secondary-200'
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-xs font-medium text-secondary-600">
          {rating > 0 ? rating.toFixed(1) : 'New'}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
