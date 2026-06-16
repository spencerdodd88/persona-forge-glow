import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Sparkles, Image as ImageIcon,
  CalendarClock, UsersRound, DollarSign, Settings, LogOut, Crown,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

type NavItem = { title: string; url: string; icon: typeof LayoutDashboard; accent?: boolean };
const items: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Influencers", url: "/my-influencers", icon: Users },
  { title: "Create Influencer", url: "/create", icon: Sparkles, accent: true },
  { title: "Content Studio", url: "/content-studio", icon: ImageIcon },
  { title: "Schedule", url: "/schedule", icon: CalendarClock },
  { title: "Friends & Groups", url: "/friends", icon: UsersRound },
  { title: "Monetization", url: "/monetization", icon: DollarSign },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();

  const handleSignOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-luxe flex items-center justify-center shrink-0">
            <Crown className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-display text-lg tracking-wide">GenFluence</span>}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">Studio</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url || pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}
                      className={`relative ${active ? "bg-gradient-to-r from-primary/15 to-accent/10 text-foreground" : ""}`}>
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className={`w-4 h-4 ${active ? "text-primary" : ""} ${item.accent && !active ? "text-accent" : ""}`} />
                        {!collapsed && <span className={item.accent ? "font-medium" : ""}>{item.title}</span>}
                        {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-gradient-luxe" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Sign out" className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
              {!collapsed && <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
