import { Quote } from "lucide-react";
import type { DynamicShakhsiyat } from "@/hooks/useHomepageData";

export function Shakhsiyat({ profiles }: { profiles: DynamicShakhsiyat[] }) {
  if (!profiles || profiles.length === 0) return null;

  return (
    <section className="py-10">
      <div className="px-4 mb-5">
        <div className="text-orange text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Shakhsiyat</div>
        <h2 className="font-hindi text-2xl font-semibold text-navy leading-none">शख्सियत</h2>
        <p className="text-navy/50 text-xs font-body-hindi mt-2">वो चेहरे जिनकी कहानियाँ बुंदेलखंड को आकार दे रही हैं</p>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-2">
        {profiles.map((p) => (
          <article
            key={p.id}
            className="shrink-0 w-[270px] aspect-[3/4] relative rounded-2xl overflow-hidden ring-1 ring-navy/10 shadow-elevated group"
          >
            <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/45 to-transparent" />
            <Quote className="absolute top-4 right-4 size-5 text-gold/70" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="font-hindi text-paper text-lg leading-snug text-balance mb-3">"{p.quote}"</p>
              <div className="border-t border-white/15 pt-3">
                <div className="font-hindi text-paper text-base">{p.name}</div>
                <div className="text-gold text-[10px] uppercase tracking-widest font-semibold">{p.designation}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
