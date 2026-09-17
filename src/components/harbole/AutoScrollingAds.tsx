import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AdBanner } from "./AdBanner";

export function AutoScrollingAds({ ads }: { ads: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isAutoScrolling = useRef(false);
  const isHovered = useRef(false);

  useEffect(() => {
    if (!ads || ads.length <= 1) return;
    const interval = setInterval(() => {
      if (!isHovered.current) {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [ads]);

  useEffect(() => {
    if (scrollRef.current) {
      isAutoScrolling.current = true;
      const { clientWidth } = scrollRef.current;
      scrollRef.current.scrollTo({
        left: clientWidth * currentIndex,
        behavior: "smooth",
      });

      const timer = setTimeout(() => {
        isAutoScrolling.current = false;
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  if (!ads || ads.length === 0) return null;

  const prev = () => {
    setCurrentIndex((c) => (c - 1 + ads.length) % ads.length);
  };

  const next = () => {
    setCurrentIndex((c) => (c + 1) % ads.length);
  };

  return (
    <div
      className="relative w-full group/slider"
      onMouseEnter={() => (isHovered.current = true)}
      onMouseLeave={() => (isHovered.current = false)}
      onTouchStart={() => (isHovered.current = true)}
      onTouchEnd={() => setTimeout(() => (isHovered.current = false), 2500)}
    >
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
        onScroll={(e) => {
          if (isAutoScrolling.current) return;
          const target = e.target as HTMLDivElement;
          const index = Math.round(target.scrollLeft / target.clientWidth);
          if (index !== currentIndex && !Number.isNaN(index)) {
            setCurrentIndex(index);
          }
        }}
      >
        {ads.map((ad) => (
          <div key={ad.id} className="w-full shrink-0 snap-start">
            <AdBanner {...ad} />
          </div>
        ))}
      </div>

      {/* Navigation Arrows for desktop/tablet */}
      {ads.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous Ad"
            className="absolute left-2 top-1/2 -translate-y-1/2 size-8 sm:size-9 rounded-full bg-navy/80 hover:bg-navy text-paper backdrop-blur-md shadow-md grid place-items-center opacity-0 group-hover/slider:opacity-100 transition-opacity z-20"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next Ad"
            className="absolute right-2 top-1/2 -translate-y-1/2 size-8 sm:size-9 rounded-full bg-navy/80 hover:bg-navy text-paper backdrop-blur-md shadow-md grid place-items-center opacity-0 group-hover/slider:opacity-100 transition-opacity z-20"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}

      {/* Indicator Dots */}
      {ads.length > 1 && (
        <div className="flex justify-center gap-1.5 -mt-1 mb-3 relative z-10">
          {ads.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? "bg-navy w-5" : "bg-navy/25 w-1.5 hover:bg-navy/50"
              }`}
              aria-label={`Go to ad ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
