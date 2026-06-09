import { ArrowUpRight } from "lucide-react";

export function SectionHeader({
  hindi,
  english,
  href,
  invert,
}: {
  hindi: string;
  english?: string;
  href?: string;
  invert?: boolean;
}) {
  return (
    <div className="px-4 mb-5 flex items-end justify-between">
      <div>
        <div className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-1 ${invert ? "text-gold" : "text-orange"}`}>
          {english}
        </div>
        <h2 className={`font-hindi text-2xl font-semibold leading-none ${invert ? "text-paper" : "text-navy"}`}>
          {hindi}
        </h2>
      </div>
      {href && (
        <a
          href={href}
          className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${invert ? "text-paper/60" : "text-navy/50"}`}
        >
          All <ArrowUpRight className="size-3" />
        </a>
      )}
    </div>
  );
}
