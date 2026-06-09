import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { DynamicArticle } from "@/hooks/useHomepageData";

export function HeroSlider({ slides }: { slides: DynamicArticle[] }) {
  const [i, setI] = useState(0);
  const startX = useRef<number | null>(null);
  const paused = useRef(false);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      if (!paused.current) setI((p) => (p + 1) % slides.length);
    }, 4500);
    return () => clearInterval(id);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  return (
    <section
      className="p-4 md:px-6 md:py-6 animate-reveal"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onTouchStart={(e) => {
        paused.current = true;
        startX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (startX.current === null || slides.length <= 1) return;
        const dx = e.changedTouches[0].clientX - startX.current;
        if (Math.abs(dx) > 40) {
          setI((p) => (p + (dx < 0 ? 1 : -1) + slides.length) % slides.length);
        }
        startX.current = null;
        setTimeout(() => (paused.current = false), 1200);
      }}
    >
      <div className="relative rounded-2xl overflow-hidden ring-1 ring-navy/10 shadow-elevated bg-navy">
        <div className="relative aspect-[16/10] md:aspect-[21/9]">
          {slides.map((s, idx) => (
            <Link
              key={s.slug}
              to="/article/$slug"
              params={{ slug: s.slug }}
              className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              aria-hidden={idx !== i}
            >
              <img src={s.image} alt={s.title} className="w-full h-full object-cover" loading={idx === 0 ? "eager" : "lazy"} />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-orange text-paper text-[9px] font-bold uppercase tracking-widest rounded">
                  <span className="inline-block size-1.5 bg-paper rounded-full mr-1.5 animate-pulse" />
                  Breaking
                </span>
                <span className="text-paper/85 text-[10px] font-body-hindi">{s.district?.name} • {s.time}</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 pb-7 md:p-8 md:pb-12 md:max-w-2xl">
                <div className="text-gold text-[9px] md:text-xs font-bold uppercase tracking-[0.3em] mb-1.5 md:mb-3">
                  {s.category?.name || "Featured"}
                </div>
                <h1 className="text-paper font-hindi text-[18px] md:text-4xl lg:text-5xl font-medium leading-[1.2] md:leading-[1.05] text-balance mb-1.5 md:mb-4 line-clamp-2 md:line-clamp-none">
                  {s.title}
                </h1>
                {s.excerpt && (
                  <p className="hidden md:block text-paper/75 font-body-hindi text-sm md:text-lg text-pretty line-clamp-2">{s.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {slides.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Slide ${idx + 1}`}
                onClick={(e) => {
                   e.preventDefault(); // Prevent triggering link
                   setI(idx);
                }}
                className={`h-1 rounded-full transition-all ${idx === i ? "w-6 bg-gold" : "w-1.5 bg-paper/40"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
