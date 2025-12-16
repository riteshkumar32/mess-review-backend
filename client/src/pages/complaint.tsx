import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth, getAuthHeader } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MessageSquarePlus, Loader2 } from "lucide-react";

const mealTypes = ["Breakfast", "Lunch", "Snacks", "Dinner", "General"] as const;
const categories = ["Hygiene", "Taste", "Quantity", "Behaviour", "Other"] as const;

export default function ComplaintPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const hallCode = user?.hall || "RK";

  const [mealType, setMealType] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [text, setText] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(token),
        },
        body: JSON.stringify({
          hallCode,
          mealType,
          category,
          text,
          complaintDate: today,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit complaint");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Complaint submitted",
        description: "Your complaint has been recorded anonymously.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
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

  const isValid = mealType && category && text.length >= 10;

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-bold">Submit a Complaint</h1>
        <p className="text-muted-foreground">
          Your complaint will be recorded anonymously
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4 text-primary" />
            Complaint Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <div className="p-3 rounded-md bg-muted text-sm">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mealType">Meal Type</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger id="mealType" data-testid="select-meal-type">
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                {mealTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" data-testid="select-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complaint">Complaint / Suggestion</Label>
            <Textarea
              id="complaint"
              placeholder="Describe your complaint or suggestion in detail..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="resize-none"
              rows={4}
              data-testid="textarea-complaint"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters required ({text.length}/10)
            </p>
          </div>

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
              disabled={!isValid || submitMutation.isPending}
              className="flex-1"
              data-testid="button-submit-complaint"
            >
              {submitMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Submit Complaint"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
