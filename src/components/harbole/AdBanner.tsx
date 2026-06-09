import { Sparkles, ArrowUpRight } from "lucide-react";

type Variant = "gold" | "navy" | "orange" | "paper";

type Props = {
  variant?: Variant;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta?: string;
  sponsor?: string;
  image?: string;
};

const VARIANTS: Record<Variant, string> = {
  gold: "bg-gradient-to-br from-[oklch(0.78_0.11_80)] via-gold to-[oklch(0.62_0.13_60)] text-navy",
  navy: "bg-gradient-to-br from-navy via-[oklch(0.18_0.05_250)] to-[oklch(0.12_0.04_250)] text-paper",
  orange: "bg-gradient-to-br from-orange via-[oklch(0.52_0.18_35)] to-[oklch(0.35_0.12_30)] text-paper",
  paper: "bg-white text-navy ring-1 ring-navy/10",
};

export function AdBanner({
  variant = "gold",
  eyebrow = "Sponsored",
  title,
  subtitle,
  cta = "Learn More",
  sponsor,
  image,
}: Props) {
  const isDark = variant === "navy" || variant === "orange";
  return (
    <section className="px-4 py-6">
      <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-navy/35 mb-2 flex items-center gap-1.5">
        <Sparkles className="size-3" /> Advertisement
        {sponsor && <span className="text-navy/30 normal-case tracking-normal font-medium ml-auto">by {sponsor}</span>}
      </div>
      <div className={`relative overflow-hidden rounded-2xl shadow-elevated ${VARIANTS[variant]}`}>
        {image && (
          <>
            <img src={image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-30" />
            <div className={`absolute inset-0 ${isDark ? "bg-gradient-to-r from-navy/90 via-navy/70 to-navy/40" : "bg-gradient-to-r from-white/80 via-white/50 to-transparent"}`} />
          </>
        )}
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-6 -bottom-6 size-32 rounded-full bg-black/10 blur-2xl" />
        <div className="relative p-5 flex items-center gap-4 min-h-[140px]">
          <div className="flex-1 min-w-0">
            <div className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-2 ${isDark ? "text-gold" : "text-orange"}`}>
              {eyebrow}
            </div>
            <h3 className="font-hindi text-xl leading-snug font-semibold mb-1 text-balance">{title}</h3>
            {subtitle && <p className={`font-body-hindi text-xs mb-3 leading-relaxed ${isDark ? "text-paper/70" : "text-navy/60"}`}>{subtitle}</p>}
            <button
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition active:scale-95 ${
                isDark
                  ? "bg-paper text-navy hover:bg-gold"
                  : "bg-navy text-paper hover:bg-[oklch(0.18_0.05_250)]"
              }`}
            >
              {cta} <ArrowUpRight className="size-3" />
            </button>
          </div>
          <div className={`shrink-0 size-20 rounded-2xl grid place-items-center font-hindi text-3xl font-bold ${
            isDark ? "bg-white/10 ring-1 ring-white/20 text-gold" : "bg-navy/5 ring-1 ring-navy/10 text-orange"
          }`}>
            {sponsor?.[0] ?? "ह"}
          </div>
        </div>
      </div>
    </section>
  );
}
