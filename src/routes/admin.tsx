import { Link, Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAdminAuth } from "@/lib/admin/use-admin-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Newspaper,
  Film,
  Tv,
  Megaphone,
  Sparkles,
  Radio,
  MapPin,
  Users as UsersIcon,
  LogOut,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Harbole Admin" }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/articles", label: "Articles", icon: Newspaper },
  { to: "/admin/reels", label: "Reels", icon: Film },
  { to: "/admin/shows", label: "Show Episodes", icon: Tv },
  { to: "/admin/impact", label: "Impact Series", icon: Sparkles },
  { to: "/admin/ads", label: "Ads", icon: Megaphone },
  { to: "/admin/ticker", label: "News Ticker", icon: Radio },
  { to: "/admin/districts", label: "Districts", icon: MapPin },
  { to: "/admin/users", label: "Admin Users", icon: UsersIcon },
];

function AdminLayout() {
  const loc = useLocation();
  const nav = useNavigate();
  const { user, isAdmin, loading } = useAdminAuth();
  const isLogin = loc.pathname === "/admin/login";

  useEffect(() => {
    if (loading || isLogin) return;
    if (!user) nav({ to: "/admin/login", replace: true });
  }, [loading, isLogin, user, nav]);

  if (isLogin) {
    return (
      <div className="min-h-screen bg-paper">
        <Outlet />
        <Toaster richColors position="top-center" />
      </div>
    );
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-paper text-navy/60">लोड हो रहा है…</div>;
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
        <h1 className="text-2xl font-bold text-navy">Access denied</h1>
        <p className="max-w-md text-sm text-navy/60">
          Your account ({user.email}) is signed in but does not have the admin role. Ask an existing
          admin to promote you.
        </p>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            nav({ to: "/admin/login", replace: true });
          }}
          className="rounded-md bg-navy px-4 py-2 text-sm text-paper"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-paper text-navy">
      <aside className="hidden w-64 shrink-0 border-r border-navy/10 bg-white p-4 md:block">
        <div className="mb-6 px-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-navy/40">Harbole</div>
          <div className="text-lg font-bold">Admin Console</div>
        </div>
        <nav className="space-y-1">
          {NAV.map((n) => {
            const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-navy text-paper" : "text-navy/70 hover:bg-navy/5"
                }`}
              >
                <Icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 border-t border-navy/10 pt-4">
          <div className="px-2 text-xs text-navy/50">{user.email}</div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              nav({ to: "/admin/login", replace: true });
            }}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-navy/70 hover:bg-navy/5"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-navy/10 bg-white px-4 py-3">
        <Link to="/admin" className="font-bold">Harbole Admin</Link>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            nav({ to: "/admin/login", replace: true });
          }}
          className="text-xs text-navy/60"
        >
          Sign out
        </button>
      </div>

      <main className="flex-1 md:p-8 p-4 pt-16 md:pt-8">
        {/* Mobile nav scroll */}
        <div className="md:hidden -mx-4 mb-4 overflow-x-auto px-4">
          <div className="flex gap-2 pb-2">
            {NAV.map((n) => {
              const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                    active ? "bg-navy text-paper" : "bg-navy/5 text-navy/70"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </div>
        </div>

        <Outlet />
      </main>

      <Toaster richColors position="top-center" />
    </div>
  );
}
