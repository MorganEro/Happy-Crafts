'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type StarRatingProps = {
  /** 0–5 (ints). If you ever want halves, we can extend later. */
  value: number;
  onChange?: (next: number) => void; // if provided, becomes interactive
  max?: number; // default 5
  size?: number; // px (icon size)
  className?: string;
  /** Accessible label prefix, e.g. 'Product rating' */
  label?: string;
};

function StarIcon({
  filled,
  size = 18,
  className,
}: {
  filled: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true">
      {/* outline path */}
      <path
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.25l-7.19-.62L12 2 9.19 8.63 2 9.25l5.46 4.72L5.82 21z"
        className="fill-transparent stroke-[1.5] stroke-hc-orange"
      />
      {/* fill path */}
      <path
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.25l-7.19-.62L12 2 9.19 8.63 2 9.25l5.46 4.72L5.82 21z"
        className={cn(
          'transition-colors',
          filled ? 'fill-hc-orange' : 'fill-transparent'
        )}
      />
    </svg>
  );
}

export function StarRating({
  value,
  onChange,
  max = 5,
  size = 18,
  className,
  label = 'Rating',
}: StarRatingProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  const interactive = typeof onChange === 'function';

  return (
    <div
      className={cn('inline-flex items-center gap-1', className)}
      aria-label={`${label}: ${value} out of ${max}`}
      role={interactive ? 'radiogroup' : undefined}>
      {stars.map(n => {
        const filled = n <= value;
        if (!interactive) {
          return (
            <StarIcon
              key={n}
              filled={filled}
              size={size}
            />
          );
        }
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={filled}
            onClick={() => onChange?.(n)}
            className="p-0.5 rounded-md hover:bg-hc-cream transition-colors"
            title={`${n} ${n === 1 ? 'star' : 'stars'}`}>
            <StarIcon
              filled={filled}
              size={size}
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm text-muted-foreground">
        {value}/{max}
      </span>
    </div>
  );
}
