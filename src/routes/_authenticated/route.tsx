import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

// DEV MODE: auth gate disabled so the app is browsable without signing in.
// Re-enable by restoring the beforeLoad check below.
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    return { user: data.user ?? null };
  },
  component: AuthedLayout,
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _redirect = redirect;

function AuthedLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 px-4 border-b border-border/60 sticky top-0 z-40 backdrop-blur-xl bg-background/60">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="font-display text-lg text-gradient-gold">GenFluence</div>
          </header>
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
