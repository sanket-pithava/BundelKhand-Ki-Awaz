import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { DynamicArticle } from "@/hooks/useHomepageData";

const COLORS = [
  "bg-orange/15 text-orange ring-orange/30",
  "bg-gold/20 text-[oklch(0.55_0.11_80)] ring-gold/40",
  "bg-navy/10 text-navy ring-navy/20",
  "bg-green-500/15 text-green-700 ring-green-500/30",
];

function Card({ s, idx, total }: { s: DynamicArticle; idx: number; total: number }) {
  const color = COLORS[idx % COLORS.length];
  const isDone = idx === total - 1; // Last item is marked as done conceptually
  
  return (
    <Link to="/article/$slug" params={{ slug: s.slug }} className="bg-white rounded-xl ring-1 ring-navy/5 shadow-editorial overflow-hidden flex hover:bg-navy/5 transition group">
      <img src={s.image} alt="" loading="lazy" className="w-24 h-24 object-cover shrink-0" />
      <div className="p-3 flex-1 min-w-0 relative">
        <span className={`absolute top-3 right-3 size-6 rounded-full grid place-items-center ring-2 bg-paper ${color}`}>
          {isDone ? <CheckCircle2 className="size-4" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
        </span>
        <div className={`inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${color}`}>
          {s.category?.name || "Impact"}
        </div>
        <p className="font-hindi text-navy text-sm leading-snug mt-1.5 pr-8 group-hover:text-orange transition-colors line-clamp-2">{s.title}</p>
      </div>
    </Link>
  );
}

export function ImpactTimeline({ items }: { items: DynamicArticle[] }) {
  if (!items || items.length === 0) return null;
  const loop = [...items, ...items];
  const firstArticle = items[0];
  
  return (
    <section className="bg-paper py-12 px-4">
      <div className="mb-6">
        <div className="text-orange text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Impact Series</div>
        <h2 className="font-hindi text-2xl font-semibold text-navy">समस्या से समाधान तक</h2>
        <p className="text-navy/50 text-xs font-body-hindi mt-2">एक कहानी, अनेक पड़ाव — बुंदेलखंड का असली बदलाव</p>
      </div>
      <div className="relative h-[420px] overflow-hidden rounded-2xl ring-1 ring-navy/5 bg-gradient-to-b from-paper to-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-paper to-transparent z-10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent z-10" />
        <div className="animate-vscroll space-y-4 p-4 hover:[animation-play-state:paused]">
          {loop.map((s, i) => (
            <Card key={`${s.id}-${i}`} s={s} idx={i % items.length} total={items.length} />
          ))}
        </div>
      </div>
      <Link to="/article/$slug" params={{ slug: firstArticle.slug }} className="mt-6 w-full flex items-center justify-center gap-2 bg-navy text-paper rounded-full py-3 text-xs font-bold uppercase tracking-widest hover:bg-navy/90 transition shadow-elevated">
        पूरी कहानी पढ़ें <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}
