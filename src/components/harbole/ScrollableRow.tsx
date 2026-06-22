import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ScrollableRow({
  children,
  className = "gap-4 md:gap-6 px-4 md:px-6",
  autoScroll = false,
}: {
  children: React.ReactNode;
  className?: string;
  autoScroll?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth, scrollWidth, scrollLeft } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;

      // If at the end and going right, loop back to start
      if (
        direction === "right" &&
        scrollLeft + clientWidth >= scrollWidth - 10
      ) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    if (!autoScroll) return;
    const interval = setInterval(() => {
      if (!isHovered) {
        scroll("right");
      }
    }, 3500); // 3.5 seconds
    return () => clearInterval(interval);
  }, [autoScroll, isHovered]);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
    >
      <button
        onClick={() => scroll("left")}
        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 size-10 bg-white shadow-md rounded-full items-center justify-center text-navy opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Scroll left"
      >
        <ChevronLeft className="size-6" />
      </button>

      <div
        ref={scrollRef}
        className={`flex overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory scroll-smooth ${className}`}
      >
        {children}
      </div>

      <button
        onClick={() => scroll("right")}
        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 size-10 bg-white shadow-md rounded-full items-center justify-center text-navy opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Scroll right"
      >
        <ChevronRight className="size-6" />
      </button>
    </div>
  );
}
