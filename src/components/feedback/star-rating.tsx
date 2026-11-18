'use client';

import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import * as React from 'react';

export interface StarRatingProps {
  score: number;
  interactive?: boolean;
  onChange?: (score: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showScoreLabel?: boolean;
  className?: string;
}

export function StarRating({
  score,
  interactive = false,
  onChange,
  size = 'md',
  showScoreLabel = false,
  className,
}: StarRatingProps) {
  const [hoverScore, setHoverScore] = React.useState<number | null>(null);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const activeScore = hoverScore !== null ? hoverScore : score;

  const handleStarClick = (selectedScore: number) => {
    if (interactive && onChange) {
      onChange(selectedScore);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, starValue: number) => {
    if (!interactive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleStarClick(starValue);
    }
  };

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div
        className="inline-flex items-center gap-1"
        role={interactive ? 'radiogroup' : 'img'}
        aria-label={`Avaliação de ${score} de 5 estrelas`}
        onMouseLeave={() => interactive && setHoverScore(null)}
      >
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = starValue <= activeScore;

          if (interactive) {
            return (
              <button
                key={starValue}
                type="button"
                aria-pressed={score === starValue}
                aria-label={`${starValue} de 5 estrelas`}
                onClick={() => handleStarClick(starValue)}
                onMouseEnter={() => setHoverScore(starValue)}
                onKeyDown={(e) => handleKeyDown(e, starValue)}
                className={cn(
                  'p-0.5 rounded transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                  isFilled ? 'text-amber-500' : 'text-zinc-300 dark:text-zinc-700',
                )}
              >
                <Star
                  className={cn(
                    starSizes[size],
                    'transition-colors',
                    isFilled ? 'fill-amber-400 text-amber-500' : 'fill-transparent',
                  )}
                />
              </button>
            );
          }

          return (
            <Star
              key={starValue}
              className={cn(
                starSizes[size],
                'transition-colors',
                isFilled
                  ? 'fill-amber-400 text-amber-500'
                  : 'fill-transparent text-zinc-300 dark:text-zinc-700',
              )}
              aria-hidden="true"
            />
          );
        })}
      </div>

      {showScoreLabel && (
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 ml-1">
          {score.toFixed(1)}
        </span>
      )}
    </div>
  );
}
