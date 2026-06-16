import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Crown, Mail, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · GenFluence" },
      { name: "description", content: "Sign in to GenFluence to design and monetize your AI influencers." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const handleEmail = async (mode: "signin" | "signup") => {
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created — check your inbox to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (e: any) {
      toast.error(e.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-40"
        style={{ backgroundImage: "radial-gradient(circle at 30% 30%, oklch(0.74 0.16 350 / 0.3), transparent 50%), radial-gradient(circle at 70% 70%, oklch(0.62 0.18 305 / 0.3), transparent 50%)" }} />

      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Crown className="w-6 h-6 text-primary" />
          <span className="font-display text-2xl tracking-wide">GenFluence</span>
        </Link>

        <div className="glass-card rounded-2xl p-8 animate-fade-up">
          <h1 className="font-display text-3xl text-center text-gradient-gold">Enter the studio</h1>
          <p className="text-center text-sm text-muted-foreground mt-2">Premium AI influencer creation.</p>

          <Button
            onClick={handleGoogle} disabled={loading}
            variant="outline"
            className="w-full mt-6 h-11 bg-secondary/40 border-border hover:bg-secondary/60"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.617 0 3.077.554 4.224 1.638l3.158-3.158C17.46 1.616 14.97.5 12 .5 7.392.5 3.397 3.137 1.386 6.953l3.69 2.86C6.052 6.97 8.81 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.275c0-.85-.075-1.667-.214-2.45H12v4.633h6.458c-.278 1.5-1.122 2.766-2.392 3.617l3.7 2.866c2.166-2 3.734-4.95 3.734-8.666z"/>
              <path fill="#FBBC05" d="M5.076 14.187A7.49 7.49 0 0 1 4.7 12c0-.762.133-1.5.376-2.187L1.386 6.953A11.493 11.493 0 0 0 .5 12c0 1.85.444 3.6 1.222 5.137l3.354-2.95z"/>
              <path fill="#34A853" d="M12 23.5c3.234 0 5.95-1.067 7.933-2.9l-3.7-2.866c-1.027.7-2.35 1.116-4.233 1.116-3.19 0-5.948-1.97-6.924-4.813l-3.69 2.86C3.397 20.863 7.392 23.5 12 23.5z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full bg-secondary/40">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            {(["signin", "signup"] as const).map((mode) => (
              <TabsContent key={mode} value={mode} className="space-y-4 mt-5">
                <div className="space-y-2">
                  <Label htmlFor={`${mode}-email`}>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id={`${mode}-email`} type="email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 bg-input/60" placeholder="you@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${mode}-pw`}>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id={`${mode}-pw`} type="password" value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 bg-input/60" placeholder="••••••••" />
                  </div>
                </div>
                <Button
                  className="w-full h-11 bg-gradient-luxe text-primary-foreground font-medium border-0 hover:opacity-90"
                  onClick={() => handleEmail(mode)}
                  disabled={loading || !email || !password}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {mode === "signin" ? "Sign in" : "Create account"}
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
