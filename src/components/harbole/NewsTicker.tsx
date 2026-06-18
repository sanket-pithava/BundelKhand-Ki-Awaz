import { Link } from "@tanstack/react-router";
import type { DynamicArticle } from "@/hooks/useHomepageData";

export function NewsTicker({ items, invert }: { items: DynamicArticle[]; invert?: boolean }) {
  if (!items || items.length === 0) return null;

  // Duplicate for smooth infinite marquee
  const loop = [...items, ...items, ...items];
  
  return (
    <div
      className={`relative overflow-hidden border-y ${
        invert ? "bg-navy text-paper border-white/10" : "bg-white text-navy border-navy/10"
      }`}
    >
      <div className="flex items-stretch">
        <div className="shrink-0 px-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] bg-orange text-paper z-10 relative shadow-[2px_0_10px_rgba(0,0,0,0.1)]">
          <span className="size-1.5 rounded-full bg-paper animate-pulse" /> Live
        </div>
        <div className="flex-1 overflow-hidden py-2.5">
          <div className="flex gap-10 whitespace-nowrap animate-marquee w-max hover:[animation-play-state:paused]">
            {loop.map((it, idx) => (
              <Link key={`${it.id}-${idx}`} to="/article/$slug" params={{ slug: it.slug }} className="flex items-center gap-2 text-sm font-body-hindi group">
                <span className={`text-[9px] font-bold uppercase tracking-widest ${invert ? "text-gold" : "text-orange"}`}>
                  {it.district?.name || it.category?.name || "ताज़ा ख़बर"}
                </span>
                <span className={`${invert ? "text-paper/90 group-hover:text-gold" : "text-navy/85 group-hover:text-orange"} transition-colors`}>{it.title}</span>
                <span className={`text-[10px] ${invert ? "text-paper/40" : "text-navy/35"}`}>· {it.time}</span>
                <span className={`size-1 rounded-full ${invert ? "bg-paper/30" : "bg-navy/20"}`} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
