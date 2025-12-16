import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth, getAuthHeader } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/star-rating";
import { useToast } from "@/hooks/use-toast";
import { Coffee, Sun, Cookie, Moon, Loader2, CheckCircle } from "lucide-react";
import type { Review } from "@shared/schema";

const mealConfig = [
  { key: "breakfast" as const, label: "Breakfast", icon: Coffee },
  { key: "lunch" as const, label: "Lunch", icon: Sun },
  { key: "snacks" as const, label: "Snacks", icon: Cookie },
  { key: "dinner" as const, label: "Dinner", icon: Moon },
];

type MealRatings = {
  breakfast: { rating: number | null; comment: string };
  lunch: { rating: number | null; comment: string };
  snacks: { rating: number | null; comment: string };
  dinner: { rating: number | null; comment: string };
};

export default function ReviewPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const hallCode = user?.hall || "RK";

  const [ratings, setRatings] = useState<MealRatings>({
    breakfast: { rating: null, comment: "" },
    lunch: { rating: null, comment: "" },
    snacks: { rating: null, comment: "" },
    dinner: { rating: null, comment: "" },
  });

  const today = new Date().toISOString().split("T")[0];

  const { data: existingReview, isLoading: reviewLoading } = useQuery<Review | null>({
    queryKey: ["/api/reviews/today"],
    queryFn: async () => {
      const res = await fetch("/api/reviews/today", {
        headers: getAuthHeader(token),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch review");
      return res.json();
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (existingReview) {
      setRatings({
        breakfast: {
          rating: existingReview.breakfastRating,
          comment: existingReview.breakfastComment || "",
        },
        lunch: {
          rating: existingReview.lunchRating,
          comment: existingReview.lunchComment || "",
        },
        snacks: {
          rating: existingReview.snacksRating,
          comment: existingReview.snacksComment || "",
        },
        dinner: {
          rating: existingReview.dinnerRating,
          comment: existingReview.dinnerComment || "",
        },
      });
    }
  }, [existingReview]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        hallCode,
        reviewDate: today,
        breakfastRating: ratings.breakfast.rating,
        breakfastComment: ratings.breakfast.comment || null,
        lunchRating: ratings.lunch.rating,
        lunchComment: ratings.lunch.comment || null,
        snacksRating: ratings.snacks.rating,
        snacksComment: ratings.snacks.comment || null,
        dinnerRating: ratings.dinner.rating,
        dinnerComment: ratings.dinner.comment || null,
      };

      const method = existingReview ? "PUT" : "POST";
      const url = existingReview ? `/api/reviews/${existingReview.id}` : "/api/reviews";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(token),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit review");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted",
        description: "Your review has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/halls"] });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRatingChange = (meal: keyof MealRatings, rating: number) => {
    setRatings((prev) => ({
      ...prev,
      [meal]: { ...prev[meal], rating },
    }));
  };

  const handleCommentChange = (meal: keyof MealRatings, comment: string) => {
    setRatings((prev) => ({
      ...prev,
      [meal]: { ...prev[meal], comment },
    }));
  };

  const hasAnyRating = Object.values(ratings).some((r) => r.rating !== null);

  if (reviewLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-bold">
          {existingReview ? "Edit Today's Review" : "Review Today's Food"}
        </h1>
        <p className="text-muted-foreground">
          {hallCode} Hall · {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        {existingReview && (
          <div className="flex items-center gap-2 mt-2 text-sm text-primary">
            <CheckCircle className="w-4 h-4" />
            <span>You've already submitted a review today. You can edit it below.</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Rate Your Meals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {mealConfig.map(({ key, label, icon: Icon }) => (
            <div key={key} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <Label className="text-base font-medium">{label}</Label>
              </div>
              <div className="pl-7 space-y-3">
                <div>
                  <StarRating
                    rating={ratings[key].rating || 0}
                    onRatingChange={(r) => handleRatingChange(key, r)}
                    size="lg"
                  />
                </div>
                <Textarea
                  placeholder={`Optional: Add a comment about ${label.toLowerCase()}...`}
                  value={ratings[key].comment}
                  onChange={(e) => handleCommentChange(key, e.target.value)}
                  className="resize-none"
                  rows={2}
                  data-testid={`textarea-${key}`}
                />
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setLocation("/dashboard")}
              variant="secondary"
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={!hasAnyRating || submitMutation.isPending}
              className="flex-1"
              data-testid="button-submit-review"
            >
              {submitMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : existingReview ? (
                "Update Review"
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
