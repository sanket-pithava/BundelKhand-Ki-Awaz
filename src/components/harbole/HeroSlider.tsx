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
      <div className="relative rounded-2xl overflow-hidden ring-1 ring-navy/10 shadow-elevated bg-navy">
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
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-105"
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

                {/* Cinematic gradient overlays for readable text */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-navy/50 via-transparent to-transparent pointer-events-none" />

                {/* Top Badge: Breaking + District + Time */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 z-10">
                  <span className="px-2 py-0.5 bg-orange text-paper text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded shadow-sm flex items-center">
                    <span className="inline-block size-1.5 bg-paper rounded-full mr-1.5 animate-pulse" />
                    Breaking
                  </span>
                  <span className="px-2 py-0.5 bg-navy/60 backdrop-blur-md rounded text-paper/90 text-[10px] sm:text-xs font-body-hindi">
                    {s.district?.name ? `${s.district.name} • ` : ""}
                    {s.time}
                  </span>
                </div>

                {/* Bottom Content: Category + Title + Excerpt */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pb-10 sm:p-6 sm:pb-12 md:p-8 md:pb-14 md:max-w-3xl z-10">
                  <div className="text-gold text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] mb-1 sm:mb-2 drop-shadow-sm font-sans">
                    {s.category?.name || "Featured"}
                  </div>
                  <h1 className="text-paper font-hindi text-[16px] sm:text-xl md:text-3xl lg:text-4xl font-medium leading-[1.38] md:leading-[1.15] text-balance line-clamp-2 md:line-clamp-none drop-shadow">
                    {s.title}
                  </h1>
                  {s.excerpt && (
                    <p className="hidden md:block text-paper/80 font-body-hindi text-sm md:text-base text-pretty line-clamp-2 mt-2">
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
