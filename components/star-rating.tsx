'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (val: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  showLabel = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const getLabel = (val: number) => {
    switch (val) {
      case 5:
        return 'Rất hài lòng (Xuất sắc)';
      case 4:
        return 'Hài lòng (Tốt)';
      case 3:
        return 'Bình thường (Đạt)';
      case 2:
        return 'Chưa hài lòng';
      case 1:
        return 'Rất không hài lòng';
      default:
        return 'Chưa đánh giá';
    }
  };

  const currentDisplay = hoverValue ?? value;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= currentDisplay;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onChange && onChange(star)}
              onMouseEnter={() => !readOnly && setHoverValue(star)}
              onMouseLeave={() => !readOnly && setHoverValue(null)}
              className={`p-0.5 transition-transform ${
                readOnly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-115 active:scale-95'
              }`}
            >
              <Star
                className={`${starSizes[size]} transition-colors ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                    : 'text-zinc-300 dark:text-zinc-700'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 ml-1">
          {getLabel(currentDisplay)}
        </span>
      )}
    </div>
  );
}
