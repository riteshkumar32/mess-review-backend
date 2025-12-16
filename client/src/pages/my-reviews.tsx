import { useQuery } from "@tanstack/react-query";
import { useAuth, getAuthHeader } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { FileText, Coffee, Sun, Cookie, Moon } from "lucide-react";
import type { Review } from "@shared/schema";

const mealConfig = [
  { key: "breakfastRating" as const, commentKey: "breakfastComment" as const, label: "Breakfast", icon: Coffee },
  { key: "lunchRating" as const, commentKey: "lunchComment" as const, label: "Lunch", icon: Sun },
  { key: "snacksRating" as const, commentKey: "snacksComment" as const, label: "Snacks", icon: Cookie },
  { key: "dinnerRating" as const, commentKey: "dinnerComment" as const, label: "Dinner", icon: Moon },
];

export default function MyReviewsPage() {
  const { token } = useAuth();

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews/my"],
    queryFn: async () => {
      const res = await fetch("/api/reviews/my", {
        headers: getAuthHeader(token),
      });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    enabled: !!token,
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">My Reviews</h1>
        <p className="text-muted-foreground">
          View all your submitted reviews
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review, index) => {
            const ratings = [
              review.breakfastRating,
              review.lunchRating,
              review.snacksRating,
              review.dinnerRating,
            ].filter((r) => r !== null);
            const avgRating = ratings.length > 0
              ? ratings.reduce((a, b) => a! + b!, 0)! / ratings.length
              : null;

            return (
              <Card key={review.id} data-testid={`card-my-review-${index}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      {new Date(review.reviewDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </CardTitle>
                    {avgRating !== null && (
                      <Badge variant="secondary" className="font-normal">
                        Avg: {avgRating.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mealConfig.map(({ key, commentKey, label, icon: Icon }) => {
                      const rating = review[key];
                      const comment = review[commentKey];
                      
                      if (rating === null) return null;

                      return (
                        <div
                          key={key}
                          className="p-3 rounded-md bg-muted/50"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{label}</span>
                          </div>
                          <StarRating rating={rating || 0} readonly size="sm" />
                          {comment && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {comment}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-medium mb-2">No reviews yet</h3>
            <p className="text-sm text-muted-foreground">
              You haven't submitted any reviews. Start rating your meals today!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
