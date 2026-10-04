"use client";

import { Star } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type FeedbackRatingInputProps = {
  value: number | null;
  onChange: (value: number | null) => void;
};

const RATING_VALUES = [1, 2, 3, 4, 5] as const;

export function FeedbackRatingInput({
  value,
  onChange,
}: Readonly<FeedbackRatingInputProps>) {
  return (
    <div className="flex items-center gap-1">
      {RATING_VALUES.map((rating) => (
        <button
          key={rating}
          type="button"
          aria-label={`Rate ${rating} out of 5`}
          aria-pressed={value !== null && rating <= value}
          onClick={() => onChange(value === rating ? null : rating)}
          className="p-0.5"
        >
          <Star
            className={cn(
              "size-5 text-muted-foreground",
              value !== null && rating <= value && "fill-primary text-primary"
            )}
          />
        </button>
      ))}
    </div>
  );
}
