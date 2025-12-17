import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ShieldCheck, Building2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-semibold text-lg">HallMess | IIT KGP</span>
        </div>
        <Link href="/auth">
          <Button data-testid="button-login-nav">Login</Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="font-heading text-4xl md:text-5xl font-bold leading-tight">
            Daily Mess Reviews for IIT Kharagpur Halls
          </h1>
          <p className="text-lg text-muted-foreground">
            Rate meals. Raise issues. Improve food quality — together.
          </p>
          <Link href="/auth">
            <Button size="lg" className="mt-4" data-testid="button-login-hero">
              Login with IITKGP Email
            </Button>
          </Link>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 max-w-4xl w-full">
          <Card className="bg-card">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Daily Reviews</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Rate Breakfast, Lunch, Snacks, and Dinner every day
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Verified Students</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Only @iitkgp.ac.in email addresses allowed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Hall-wise System</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                RK Hall now live. More halls coming soon
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          By RK For RK
        </p>
        <div className="flex items-center justify-center gap-4 mt-2">
          {/* Privacy */}
  <a
    href="https://www.iitkgp.ac.in/"
    target="_blank"
    rel="noopener noreferrer"
    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
  >
    Privacy
  </a>

  {/* Contact */}
  <a
    href="https://www.facebook.com/people/Ritesh-Kumar/pfbid0qrV5jeLZLpJ4ZiyNdETyX5z8aACDq4X1rvQFXmYXM4e9Yai1YBi7WZ2S4yGxAG6Fl/"
    target="_blank"
    rel="noopener noreferrer"
    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
  >
    Contact
  </a>
          <a
  href="https://www.instagram.com/riitesh061/"
  target="_blank"
  rel="noopener noreferrer"
  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
>
  Instagram
</a>

<a
  href="https://www.linkedin.com/in/ritesh-kumar32/"
  target="_blank"
  rel="noopener noreferrer"
  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
>
  LinkedIn
</a>
        </div>
      </footer>
    </div>
  );
}
