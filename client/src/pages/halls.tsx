import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

const halls = [
  {
    code: "RK",
    name: "Radhakrishnan Hall",
    isActive: true,
  },
];

export default function HallsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Halls</h1>
        <p className="text-muted-foreground">
          View and review mess food for different halls
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {halls.map((hall) => (
          <Card key={hall.code} data-testid={`card-hall-${hall.code}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{hall.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">({hall.code})</p>
                  </div>
                </div>
                {hall.isActive && (
                  <Badge variant="default" className="bg-primary/20 text-primary">
                    Active
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Link href={`/halls/${hall.code}`}>
                <Button className="w-full" data-testid={`button-view-${hall.code}`}>
                  View Hall
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}

        {/* Coming Soon Card */}
        <Card className="opacity-60">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                <Building2 className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base">More Halls</CardTitle>
                <p className="text-sm text-muted-foreground">Coming Soon</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="secondary" disabled>
              View Hall
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
