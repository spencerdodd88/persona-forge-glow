import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { InfluencerAvatar } from "@/components/influencer/InfluencerAvatar";
import type { InfluencerConfig } from "@/components/influencer/types";

export const Route = createFileRoute("/_authenticated/my-influencers")({
  head: () => ({ meta: [{ title: "My Influencers · GenFluence" }] }),
  component: MyInfluencers,
});

type Row = InfluencerConfig & { id: string; created_at: string };

function MyInfluencers() {
  const [rows, setRows] = useState<Row[] | null>(null);

  const load = () =>
    supabase.from("influencers").select("*").order("created_at", { ascending: false }).then(({ data }) => setRows((data as Row[]) ?? []));

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    const { error } = await supabase.from("influencers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    load();
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-up">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Your roster</p>
          <h1 className="font-display text-4xl md:text-5xl mt-1">My <span className="text-gradient-gold">Influencers</span></h1>
        </div>
        <Link to="/create" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-luxe text-primary-foreground font-medium hover-lift">
          <Sparkles className="w-4 h-4" /> New
        </Link>
      </div>

      {rows === null && <div className="mt-10 text-muted-foreground">Loading…</div>}
      {rows && rows.length === 0 && (
        <div className="mt-10 glass-card rounded-2xl p-12 text-center">
          <div className="font-display text-2xl text-gradient-gold">No muses yet.</div>
          <p className="text-muted-foreground mt-2">Create your first AI influencer to populate your roster.</p>
        </div>
      )}
      {rows && rows.length > 0 && (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rows.map((r) => (
            <div key={r.id} className="glass-card rounded-2xl p-5 hover-lift group">
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-secondary/40">
                <InfluencerAvatar config={r} animated={false} />
              </div>
              <div className="mt-4 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-display text-xl truncate">{r.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{r.ethnicity} · {r.age} · {r.scene_preset}</div>
                </div>
                <button onClick={() => remove(r.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
