import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth, getAuthHeader } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Coffee, Sun, Cookie, Moon, Star, FileEdit, TrendingUp } from "lucide-react";
import type { DailyStats, WeeklyStats, Complaint } from "@shared/schema";

const mealConfig = [
  { key: "breakfast" as const, label: "Breakfast", icon: Coffee },
  { key: "lunch" as const, label: "Lunch", icon: Sun },
  { key: "snacks" as const, label: "Snacks", icon: Cookie },
  { key: "dinner" as const, label: "Dinner", icon: Moon },
];

const hallNames: Record<string, string> = {
  RK: "Radhakrishnan Hall",
};

export default function HallDetailPage() {
  const params = useParams<{ code: string }>();
  const hallCode = params.code || "RK";
  const { token } = useAuth();

  const { data: todayStats, isLoading: todayLoading } = useQuery<DailyStats>({
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

  const { data: weeklyStats, isLoading: weeklyLoading } = useQuery<WeeklyStats[]>({
    queryKey: ["/api/halls", hallCode, "stats/weekly"],
    queryFn: async () => {
      const res = await fetch(`/api/halls/${hallCode}/stats/weekly`, {
        headers: getAuthHeader(token),
      });
      if (!res.ok) throw new Error("Failed to fetch weekly stats");
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-heading text-2xl font-bold">
              {hallNames[hallCode] || hallCode}
            </h1>
            <Badge variant="default" className="bg-primary/20 text-primary">
              Active
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Daily mess ratings and feedback
          </p>
        </div>
        <Link href="/review">
          <Button data-testid="button-review-hall">
            <FileEdit className="w-4 h-4 mr-2" />
            Review Today
          </Button>
        </Link>
      </div>

      {/* Today's Ratings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            Today's Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mealConfig.map(({ key, label, icon: Icon }) => (
              <div
                key={key}
                className="flex flex-col items-center p-4 rounded-md bg-muted/50"
                data-testid={`stat-${key}`}
              >
                <Icon className="w-6 h-6 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground mb-1">{label}</span>
                {todayLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="flex items-center gap-1">
                    <Star className={`w-5 h-5 ${todayStats?.[key] ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
                    <span className="text-2xl font-bold">
                      {todayStats?.[key] !== null && todayStats?.[key] !== undefined
                        ? todayStats[key]!.toFixed(1)
                        : "N/A"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {todayStats && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Based on {todayStats.totalReviews} review{todayStats.totalReviews !== 1 ? "s" : ""} today
            </p>
          )}
        </CardContent>
      </Card>

      {/* Past 7 Days */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Past 7 Days Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : weeklyStats && weeklyStats.length > 0 ? (
            <div className="space-y-2">
              {weeklyStats.map((day, index) => {
                const ratings = [day.breakfast, day.lunch, day.snacks, day.dinner].filter(
                  (r) => r !== null
                );
                const avgRating = ratings.length > 0
                  ? ratings.reduce((a, b) => a! + b!, 0)! / ratings.length
                  : null;

                return (
                  <div
                    key={day.date}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                    data-testid={`weekly-stat-${index}`}
                  >
                    <span className="text-sm font-medium">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <div className="flex items-center gap-4">
                      {mealConfig.map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-1 text-sm">
                          <span className="text-muted-foreground text-xs">{label[0]}:</span>
                          <span className="font-medium">
                            {day[key] !== null ? day[key]!.toFixed(1) : "-"}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center gap-1 pl-2 border-l border-border">
                        <Star className={`w-4 h-4 ${avgRating ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
                        <span className="font-bold">
                          {avgRating !== null ? avgRating.toFixed(1) : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No data available for the past 7 days
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Complaints */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Recent Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          {complaintsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          ) : recentComplaints && recentComplaints.length > 0 ? (
            <div className="space-y-3">
              {recentComplaints.map((complaint, index) => (
                <div
                  key={complaint.id}
                  className="p-3 rounded-md bg-muted/50"
                  data-testid={`complaint-${index}`}
                >
                  <p className="text-sm">{complaint.text}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {complaint.mealType}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {complaint.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(complaint.complaintDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No complaints submitted yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
