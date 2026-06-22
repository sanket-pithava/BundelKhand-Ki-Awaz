import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, PlayCircle, Bookmark, User } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/category/politics", label: "Topics", Icon: LayoutGrid },
  { to: "/category/bundeli", label: "Reels", Icon: PlayCircle },
  { to: "/category/impact", label: "Saved", Icon: Bookmark },
  { to: "/category/villages", label: "Profile", Icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50">
      <div className="mx-3 mb-3 bg-paper/95 backdrop-blur-xl border border-navy/10 rounded-2xl shadow-elevated px-3 py-2 flex justify-between items-center">
        {ITEMS.map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={label}
              to={to}
              className="flex-1 flex flex-col items-center gap-1 py-1.5 group"
            >
              <Icon
                className={`size-5 transition-colors ${active ? "text-orange" : "text-navy/40 group-hover:text-navy"}`}
                strokeWidth={active ? 2.4 : 1.8}
              />
              <span
                className={`text-[9px] font-semibold uppercase tracking-wider ${active ? "text-orange" : "text-navy/40"}`}
              >
                {label}
              </span>
              {active && (
                <div className="absolute -bottom-0 size-1 rounded-full bg-orange" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
