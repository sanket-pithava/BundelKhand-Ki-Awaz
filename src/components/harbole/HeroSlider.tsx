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
      className="p-3 sm:p-4 md:px-6 md:py-6 animate-reveal"
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
      <div className="relative rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-elevated bg-black">
        {/* Responsive Aspect Ratio: 4/3 on mobile, 16/9 on tablet, 21/9 on desktop */}
        <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] w-full">
          {slides.map((s, idx) => {
            const imgSrc = s.mobileImage || s.image;
            const active = idx === i;

            return (
              <Link
                key={s.slug}
                to="/article/$slug"
                params={{ slug: s.slug }}
                className={`absolute inset-0 transition-opacity duration-700 block ${
                  active ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
                }`}
                aria-hidden={!active}
              >
                {/* Background ambient fill to eliminate black void on all devices */}
                {imgSrc && (
                  <img
                    src={imgSrc}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-105"
                  />
                )}

                {/* Main sharp image with responsive picture tag */}
                <picture className="relative w-full h-full block">
                  {s.mobileImage && (
                    <source media="(max-width: 640px)" srcSet={s.mobileImage} />
                  )}
                  <img
                    src={s.image || imgSrc}
                    alt={s.title}
                    className="w-full h-full object-cover"
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                </picture>

                {/* Subtle, neutral bottom gradient ONLY behind the text (no blue fog over the image) */}
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

                {/* Top Badge: Breaking + District + Time */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 z-10">
                  <span className="px-2.5 py-1 bg-red-600 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded shadow-md flex items-center gap-1.5">
                    <span className="inline-block size-1.5 bg-white rounded-full animate-pulse" />
                    Breaking
                  </span>
                  <span className="px-2.5 py-1 bg-black/55 backdrop-blur-md rounded text-white/95 text-[10px] sm:text-xs font-hindi border border-white/10 shadow-sm">
                    {s.district?.name ? `${s.district.name} • ` : ""}
                    {s.time}
                  </span>
                </div>

                {/* Bottom Content: Category + Title + Excerpt */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 sm:p-6 sm:pb-10 md:p-8 md:pb-12 md:max-w-3xl z-10">
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-gold/25 text-gold border border-gold/40 text-[10px] sm:text-xs font-semibold mb-1.5 backdrop-blur-md shadow-sm">
                    {s.category?.name || "Featured"}
                  </div>
                  <h1 className="text-white font-hindi text-[15px] sm:text-xl md:text-2xl lg:text-3xl font-bold leading-[1.35] text-balance line-clamp-2 md:line-clamp-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    {s.title}
                  </h1>
                  {s.excerpt && (
                    <p className="hidden md:block text-white/85 font-body-hindi text-sm md:text-base text-pretty line-clamp-2 mt-1.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                      {s.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Carousel indicators with clearance from text */}
        {slides.length > 1 && (
          <div className="absolute bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Slide ${idx + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  setI(idx);
                }}
                className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                  idx === i
                    ? "w-6 sm:w-8 bg-gold"
                    : "w-1.5 bg-paper/40 hover:bg-paper/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
