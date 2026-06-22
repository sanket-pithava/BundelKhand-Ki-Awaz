import { Link, useNavigate } from "@tanstack/react-router";
import { X, Search, CornerDownLeft } from "lucide-react";
import { Logo } from "./Logo";
import { useEffect, useMemo, useState } from "react";
import { useNavigationData } from "@/hooks/useNavigationData";

export function FullscreenMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const { data } = useNavigationData();
  const navigate = useNavigate({ from: "/" });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const q = query.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (!q || !data?.categories) return [];
    return data.categories
      .filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q))
      .slice(0, 6);
  }, [q, data?.categories]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-navy text-paper animate-reveal overflow-y-auto">
      <div className="max-w-[480px] mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <Logo className="h-14 w-auto" />
            <span className="font-hindi text-xl">हरबोले</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="size-10 grid place-items-center rounded-full ring-1 ring-white/15 hover:bg-white/5 active:scale-95"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Live category search */}
        <div className="relative mb-8">
          <div className="flex items-center gap-3 bg-white/5 ring-1 ring-white/10 focus-within:ring-gold/60 rounded-2xl px-4 py-3 transition">
            <Search className="size-4 text-paper/60 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="श्रेणी खोजें…"
              className="flex-1 bg-transparent outline-none font-body-hindi text-base placeholder:text-paper/35"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-[10px] text-paper/50 uppercase tracking-widest"
              >
                Clear
              </button>
            )}
          </div>
          {q && (
            <div className="mt-2 rounded-2xl bg-[oklch(0.18_0.04_250)] ring-1 ring-white/10 overflow-hidden shadow-elevated animate-reveal">
              {suggestions.length === 0 ? (
                <div className="px-4 py-5 text-sm text-paper/50 font-body-hindi">
                  कोई श्रेणी नहीं मिली
                </div>
              ) : (
                <ul>
                  {suggestions.map((s) => (
                    <li key={s.slug}>
                      <button
                        onClick={() => {
                          navigate({
                            to: "/",
                            search: { category: s.slug, district: undefined },
                          });
                          onClose();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition border-b border-white/5 last:border-0 group text-left"
                      >
                        <span className="size-9 rounded-lg bg-gold/15 text-gold grid place-items-center font-hindi text-base shrink-0">
                          {s.name[0]}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-hindi text-base text-paper leading-tight">
                            {s.name}
                          </span>
                          <span className="block text-[10px] uppercase tracking-widest text-paper/45 mt-0.5">
                            Category
                          </span>
                        </span>
                        <CornerDownLeft className="size-4 text-paper/30 group-hover:text-gold transition" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-4">
          Sections
        </p>
        <nav className="space-y-1 mb-12">
          <Link
            to="/"
            search={{ district: undefined, category: undefined }}
            onClick={onClose}
            className="block py-3 border-b border-white/5 group"
          >
            <div className="font-hindi text-3xl font-semibold group-hover:text-gold transition-colors">
              मुख्य पृष्ठ
            </div>
            <div className="text-[10px] uppercase tracking-widest text-paper/40">
              Home
            </div>
          </Link>
          {data?.categories?.map((c) => (
            <button
              key={c.slug}
              onClick={() => {
                navigate({
                  to: "/",
                  search: { category: c.slug, district: undefined },
                });
                onClose();
              }}
              className="w-full text-left block py-3 border-b border-white/5 group"
            >
              <div className="font-hindi text-3xl font-semibold group-hover:text-gold transition-colors">
                {c.name}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-paper/40">
                {c.slug}
              </div>
            </button>
          ))}
        </nav>

        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-4">
          Editorial
        </p>
        <div className="space-y-3 text-sm text-paper/70 mb-12">
          <div>हमारी पत्रकारिता का सिद्धांत</div>
          <div>The Amit Tripathi Show</div>
          <div>Impact Reports Archive</div>
          <div>Contact Newsroom</div>
        </div>

        <div className="pt-8 border-t border-white/10 text-[10px] uppercase tracking-widest text-paper/40">
          © Harbole Media · Voice of Bundelkhand
        </div>
      </div>
    </div>
  );
}
