import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Crown, Wand2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "GenFluence — Create & Monetize AI Influencers" },
      { name: "description", content: "Design ultra-realistic AI influencers in minutes. Zero prompting required." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // DEV MODE: skip auth check, land everyone in the studio.
    navigate({ to: "/dashboard", replace: true });
  }, [navigate]);

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-40"
        style={{ backgroundImage: "radial-gradient(circle at 20% 20%, oklch(0.62 0.18 305 / 0.35), transparent 50%), radial-gradient(circle at 80% 60%, oklch(0.74 0.16 350 / 0.3), transparent 50%)" }} />

      <header className="flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-2">
          <Crown className="w-6 h-6 text-primary" />
          <span className="font-display text-2xl tracking-wide">GenFluence</span>
        </div>
        <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition">Sign in</Link>
      </header>

      <main className="px-6 md:px-12 pt-12 pb-24 max-w-6xl mx-auto">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs uppercase tracking-[0.2em] text-primary">
            <Sparkles className="w-3 h-3" /> AI Influencer Studio
          </span>
          <h1 className="mt-6 text-5xl md:text-7xl font-display leading-[1.05]">
            Design your <span className="text-gradient-gold">muse</span>.
            <br />Monetize her grace.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Build hyper-realistic AI influencers with a single click. No prompts. No noise. Just elegance, on-demand.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-luxe text-primary-foreground font-medium hover-lift">
              Start creating <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-card text-foreground font-medium hover-lift">
              <Wand2 className="w-4 h-4" /> See the studio
            </Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-5">
          {[
            { t: "Character builder", d: "Sliders, presets, scenes — no prompts." },
            { t: "Content studio", d: "Generate, schedule, post. All in one place." },
            { t: "Monetize", d: "Built-in subscriptions, tips, and DMs." },
          ].map((f) => (
            <div key={f.t} className="glass-card rounded-2xl p-6 hover-lift">
              <div className="font-display text-xl text-gradient-gold">{f.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
