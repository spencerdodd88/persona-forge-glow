import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings · GenFluence" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [email, setEmail] = useState("");
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto animate-fade-up">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Account</p>
      <h1 className="font-display text-4xl md:text-5xl mt-1">Settings</h1>

      <div className="mt-8 glass-card rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <SettingsIcon className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <div className="text-sm uppercase tracking-wider text-muted-foreground">Signed in as</div>
            <div className="font-display text-2xl mt-1">{email || "—"}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 glass-card rounded-2xl p-6 text-muted-foreground">
        Billing, notifications, and platform integrations will appear here as we launch them.
      </div>
    </div>
  );
}
