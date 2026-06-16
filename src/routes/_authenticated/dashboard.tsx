import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Users, ImageIcon, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · GenFluence" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [count, setCount] = useState<number | null>(null);
  const [name, setName] = useState("Creator");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setName(data.user.email.split("@")[0]);
    });
    supabase.from("influencers").select("*", { count: "exact", head: true }).then(({ count }) => setCount(count ?? 0));
  }, []);

  const stats = [
    { label: "Influencers", value: count ?? "—", icon: Users },
    { label: "Posts generated", value: "0", icon: ImageIcon },
    { label: "Subscribers", value: "0", icon: TrendingUp },
    { label: "Revenue (USD)", value: "$0", icon: TrendingUp },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Welcome back</p>
          <h1 className="font-display text-4xl md:text-5xl mt-1">Good evening, <span className="text-gradient-gold">{name}</span></h1>
        </div>
        <Link to="/create" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-luxe text-primary-foreground font-medium hover-lift">
          <Sparkles className="w-4 h-4" /> Create new influencer
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-5 hover-lift">
            <s.icon className="w-5 h-5 text-primary mb-3" />
            <div className="text-3xl font-display">{s.value}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 glass-card rounded-2xl p-8 text-center">
        <div className="font-display text-2xl text-gradient-gold">Your stage is set.</div>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Begin by crafting your first AI influencer. Sliders, scenes, and presets — no prompts required.</p>
        <Link to="/create" className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-gradient-luxe text-primary-foreground font-medium hover-lift">
          <Sparkles className="w-4 h-4" /> Open the builder
        </Link>
      </div>
    </div>
  );
}
