import { useState } from 'react';
import { IconStar } from './Icons';
import './StarRating.css';

function StarRating({ rating = 0, onRate, readonly = false, size = 'md' }) {
  const [hover, setHover] = useState(0);
  const starSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  return (
    <div className={`star-rating star-rating--${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${(hover || rating) >= star ? 'star--filled' : ''} ${readonly ? 'star--readonly' : ''}`}
          onClick={() => !readonly && onRate && onRate(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          role={readonly ? 'img' : 'button'}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <IconStar filled={(hover || rating) >= star} size={starSize} />
        </span>
      ))}
      {rating > 0 && (
        <span className="star-value">{Number(rating).toFixed(1)}</span>
      )}
    </div>
  );
}

export default StarRating;
