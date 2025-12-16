import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRatingChange?.(star)}
          className={cn(
            "transition-colors",
            !readonly && "cursor-pointer hover:scale-110 active:scale-95"
          )}
          data-testid={`star-${star}`}
        >
          <Star
            className={cn(
              sizeClasses[size],
              "transition-colors",
              star <= rating
                ? "fill-primary text-primary"
                : "fill-transparent text-muted-foreground/40"
            )}
          />
        </button>
      ))}
    </div>
  );
}

interface RatingDisplayProps {
  rating: number | null;
  label: string;
}

export function RatingDisplay({ rating, label }: RatingDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <Star
        className={cn(
          "w-4 h-4",
          rating ? "fill-primary text-primary" : "fill-transparent text-muted-foreground/40"
        )}
      />
      <span className="text-sm font-medium">
        {rating !== null ? rating.toFixed(1) : "N/A"}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
