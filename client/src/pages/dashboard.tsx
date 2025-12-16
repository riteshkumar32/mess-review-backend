import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth, getAuthHeader } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/star-rating";
import { Coffee, Sun, Cookie, Moon, Star, MessageSquarePlus, FileEdit } from "lucide-react";
import type { DailyStats, Review, Complaint } from "@shared/schema";

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  snacks: Cookie,
  dinner: Moon,
};

const mealLabels = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  snacks: "Snacks",
  dinner: "Dinner",
};

export default function DashboardPage() {
  const { user, token } = useAuth();

  const hallCode = user?.hall || "RK";

  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery<DailyStats>({
    queryKey: ["/api/halls", hallCode, "stats/today"],
    queryFn: async () => {
      const res = await fetch(`/api/halls/${hallCode}/stats/today`, {
        headers: getAuthHeader(token),
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    enabled: !!token,
  });

  const { data: recentReviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/halls", hallCode, "reviews/recent"],
    queryFn: async () => {
      const res = await fetch(`/api/halls/${hallCode}/reviews/recent`, {
        headers: getAuthHeader(token),
      });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    enabled: !!token,
  });

  const { data: recentComplaints, isLoading: complaintsLoading } = useQuery<Complaint[]>({
    queryKey: ["/api/halls", hallCode, "complaints/recent"],
    queryFn: async () => {
      const res = await fetch(`/api/halls/${hallCode}/complaints/recent`, {
        headers: getAuthHeader(token),
      });
      if (!res.ok) throw new Error("Failed to fetch complaints");
      return res.json();
    },
    enabled: !!token,
  });

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="font-heading text-2xl font-bold" data-testid="text-welcome">
          Welcome, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground" data-testid="text-date">
          {hallCode} Hall · {today}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["breakfast", "lunch", "snacks", "dinner"] as const).map((meal) => {
          const Icon = mealIcons[meal];
          const rating = stats?.[meal];
          
          return (
            <Card key={meal}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{mealLabels[meal]}</span>
                </div>
                {statsLoading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <div className="flex items-center gap-1">
                    <Star className={`w-5 h-5 ${rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
                    <span className="text-xl font-bold" data-testid={`text-rating-${meal}`}>
                      {rating !== null && rating !== undefined ? rating.toFixed(1) : "N/A"}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Link href="/review">
          <Button data-testid="button-review-today">
            <FileEdit className="w-4 h-4 mr-2" />
            Review Today's Food
          </Button>
        </Link>
        <Link href="/complaint">
          <Button variant="secondary" data-testid="button-submit-complaint">
            <MessageSquarePlus className="w-4 h-4 mr-2" />
            Submit a Complaint
          </Button>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))
            ) : recentReviews && recentReviews.length > 0 ? (
              recentReviews.slice(0, 3).map((review, index) => {
                const avgRating = [
                  review.breakfastRating,
                  review.lunchRating,
                  review.snacksRating,
                  review.dinnerRating,
                ].filter((r) => r !== null).reduce((a, b) => a! + b!, 0)! / 
                  [review.breakfastRating, review.lunchRating, review.snacksRating, review.dinnerRating].filter((r) => r !== null).length || 0;
                
                return (
                  <div 
                    key={review.id} 
                    className="flex items-center gap-3 p-2 rounded-md bg-muted/50"
                    data-testid={`card-review-${index}`}
                  >
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="font-medium">{avgRating.toFixed(1)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground truncate">
                        {new Date(review.reviewDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No reviews yet today
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Complaints */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Recent Complaints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {complaintsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))
            ) : recentComplaints && recentComplaints.length > 0 ? (
              recentComplaints.slice(0, 3).map((complaint, index) => (
                <div 
                  key={complaint.id} 
                  className="p-2 rounded-md bg-muted/50"
                  data-testid={`card-complaint-${index}`}
                >
                  <p className="text-sm line-clamp-2">{complaint.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{complaint.mealType}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{complaint.category}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No complaints submitted
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
