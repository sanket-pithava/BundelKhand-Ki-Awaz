import { useEffect, useRef, useState } from "react";
import { AdBanner } from "./AdBanner";

export function AutoScrollingAds({ ads }: { ads: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isAutoScrolling = useRef(false);

  useEffect(() => {
    if (!ads || ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [ads]);

  useEffect(() => {
    if (scrollRef.current) {
      isAutoScrolling.current = true;
      const { clientWidth } = scrollRef.current;
      scrollRef.current.scrollTo({
        left: clientWidth * currentIndex,
        behavior: "smooth"
      });
      
      const timer = setTimeout(() => {
        isAutoScrolling.current = false;
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  if (!ads || ads.length === 0) return null;

  return (
    <div className="relative w-full">
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
      
      {ads.length > 1 && (
        <div className="flex justify-center gap-1.5 -mt-4 mb-4 relative z-10">
          {ads.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex ? "bg-navy w-4" : "bg-navy/20 w-1.5"
              }`}
              aria-label={`Go to ad ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
