import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  Building2,
  Stethoscope,
  HeartPulse,
  FileText,
  Tags,
  Image,
  Settings,
  UserCog,
  LogOut,
  ExternalLink,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LoadingBlock } from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Admin | MedJourney" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/enquiries", label: "Patients / Enquiries", icon: Users },
  { to: "/admin/hospitals", label: "Hospitals", icon: Building2 },
  { to: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/admin/treatments", label: "Treatments", icon: HeartPulse },
  { to: "/admin/posts", label: "Blog posts", icon: FileText },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/media", label: "Media", icon: Image },
  { to: "/admin/team", label: "Team & access", icon: UserCog },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const roles = useQuery({
    queryKey: ["my-roles", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map((r) => r.role);
    },
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (roles.isLoading) return <LoadingBlock />;
  if (!roles.data?.length) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface px-4">
        <div className="max-w-md rounded-2xl border bg-card p-8 text-center">
          <h1 className="font-display text-2xl font-semibold">No admin access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You're signed in as {user.email}, but this account hasn't been granted a staff role. Ask
            an administrator to grant access.
          </p>
          <Button className="mt-6" variant="outline" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface md:flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex-col bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:flex md:h-screen",
          open ? "flex" : "hidden",
        )}
      >
        <div className="px-5 py-5 font-display text-xl">
          MedJourney <span className="text-xs font-sans opacity-60">CMS</span>
        </div>
        <nav aria-label="Admin" className="flex-1 space-y-0.5 overflow-auto px-3">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: "exact" in n }}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm opacity-80 hover:bg-sidebar-accent hover:opacity-100"
              activeProps={{
                className: "bg-sidebar-accent !opacity-100 text-sidebar-accent-foreground",
              }}
            >
              <n.icon className="h-4 w-4" aria-hidden />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 border-t border-sidebar-border p-3 text-sm">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-md px-3 py-2 opacity-80 hover:bg-sidebar-accent"
          >
            <ExternalLink className="h-4 w-4" />
            View website
          </a>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 opacity-80 hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <p className="truncate px-3 pt-2 text-xs opacity-50">
            {user.email} · {roles.data.join(", ")}
          </p>
        </div>
      </aside>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/30 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2 border-b bg-card px-4 py-3 md:hidden">
          <button aria-label="Open admin menu" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display">MedJourney CMS</span>
        </div>
        <main className="mx-auto max-w-6xl p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
