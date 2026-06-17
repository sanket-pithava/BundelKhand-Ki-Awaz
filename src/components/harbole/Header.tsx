import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Menu, MapPin, Search, Radio, User, LayoutGrid } from "lucide-react";
import { useState, useMemo } from "react";
import { FullscreenMenu } from "./FullscreenMenu";
import { Logo } from "./Logo";
import { useNavigationData } from "@/hooks/useNavigationData";

interface HeaderProps {
  activeJilaSlug?: string;
  activeSubDistrictSlug?: string;
  activeCategorySlug?: string;
}

export function Header({ activeJilaSlug, activeSubDistrictSlug, activeCategorySlug }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  let search: any = {};
  try {
    search = useSearch({ from: "/" });
  } catch (e) {}

  const selectedDistrictSlug = activeJilaSlug || search.district;
  const selectedCategorySlug = activeCategorySlug || search.category;

  const { data, isLoading } = useNavigationData();

  const selectedDistrict = useMemo(() => {
    if (!data?.districts) return null;
    return data.districts.find(d => d.slug === selectedDistrictSlug) || null;
  }, [data, selectedDistrictSlug]);

  const displayCategories = useMemo(() => {
    if (!data?.categories) return [];
    if (!selectedDistrict) return data.categories;

    const mappedCategoryIds = data.district_categories
      .filter(dc => dc.district_id === selectedDistrict.id)
      .map(dc => dc.category_id);

    return data.categories.filter(c => mappedCategoryIds.includes(c.id));
  }, [data, selectedDistrict]);

  function handleDistrictClick(slug: string) {
    if (selectedDistrictSlug === slug) {
      navigate({ to: selectedCategorySlug ? `/category/${encodeURIComponent(selectedCategorySlug)}` : '/' });
    } else {
      navigate({ to: selectedCategorySlug ? `/news/${encodeURIComponent(slug)}/category/${encodeURIComponent(selectedCategorySlug)}` : `/news/${encodeURIComponent(slug)}` });
    }
  }

  function handleCategoryClick(slug: string) {
    if (selectedCategorySlug === slug) {
      let url = '/';
      if (selectedDistrictSlug && activeSubDistrictSlug) url = `/news/${encodeURIComponent(selectedDistrictSlug)}/district/${encodeURIComponent(activeSubDistrictSlug)}`;
      else if (selectedDistrictSlug) url = `/news/${encodeURIComponent(selectedDistrictSlug)}`;
      navigate({ to: url });
    } else {
      let url = `/category/${encodeURIComponent(slug)}`;
      if (selectedDistrictSlug && activeSubDistrictSlug) url = `/news/${encodeURIComponent(selectedDistrictSlug)}/district/${encodeURIComponent(activeSubDistrictSlug)}/category/${encodeURIComponent(slug)}`;
      else if (selectedDistrictSlug) url = `/news/${encodeURIComponent(selectedDistrictSlug)}/category/${encodeURIComponent(slug)}`;
      navigate({ to: url });
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-xl border-b border-navy/5">
        <div className="px-3 md:px-6 h-16 md:h-20 flex items-center justify-between max-w-[480px] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto">
          <div className="flex items-center gap-1.5 md:gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Menu"
              className="size-9 grid place-items-center rounded-full hover:bg-navy/5 active:scale-95 transition md:hidden"
            >
              <Menu className="size-5 text-navy" strokeWidth={2.2} />
            </button>
            <Link to="/" className="flex items-center gap-2 group">
              <Logo className="h-14 sm:h-16 md:h-20 w-auto group-active:scale-95 transition-transform" />
              <div className="flex flex-col leading-none -ml-1">
                <span className="font-hindi text-[20px] md:text-[26px] font-semibold tracking-tight text-navy">हरबोले</span>
                <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.22em] text-orange mt-0.5">Bundelkhand Ki Awaaz</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <button aria-label="Live TV" className="h-9 md:h-10 px-2.5 md:px-3.5 flex items-center gap-1.5 rounded-full bg-orange text-paper text-[10px] md:text-xs font-bold uppercase tracking-wider active:scale-95 transition shadow-editorial">
              <span className="size-1.5 rounded-full bg-paper animate-pulse" />
              <Radio className="size-3 md:size-3.5" /> Live
            </button>
            <button aria-label="Search" className="size-9 md:size-10 grid place-items-center rounded-full hover:bg-navy/5 active:scale-95 transition">
              <Search className="size-4 text-navy" strokeWidth={2} />
            </button>
            <Link to="/admin" aria-label="Profile" className="size-9 md:size-10 grid place-items-center rounded-full ring-1 ring-navy/15 hover:bg-navy/5 active:scale-95 transition">
              <User className="size-4 text-navy" strokeWidth={2} />
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Menu"
              className="hidden md:grid size-10 place-items-center rounded-full hover:bg-navy/5 active:scale-95 transition"
            >
              <Menu className="size-5 text-navy" strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* District Navigation */}
        <div className="px-4 md:px-6 pb-2 max-w-[480px] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-navy/50">
              <MapPin className="size-3.5" />
              जिला
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
              {isLoading ? (
                <div className="h-8 w-64 bg-navy/5 animate-pulse rounded-full" />
              ) : (
                data?.districts?.map((d) => {
                  const active = d.slug === selectedDistrictSlug;
                  return (
                    <button
                      key={d.id}
                      onClick={() => handleDistrictClick(d.slug)}
                      className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm sm:text-base font-body-hindi font-medium transition-all ${active
                        ? "bg-navy text-paper shadow-editorial"
                        : "bg-white text-navy/75 ring-1 ring-navy/10 hover:ring-navy/30"
                        }`}
                    >
                      {d.name}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Category Navigation (Directly below District) */}
        <div className="px-4 md:px-6 pb-3 max-w-[480px] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-navy/50">
              <LayoutGrid className="size-3.5" />
              श्रेणी
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
              {isLoading ? (
                <div className="h-8 w-48 bg-navy/5 animate-pulse rounded-full" />
              ) : displayCategories.length === 0 ? (
                <span className="text-xs text-navy/40 italic flex items-center h-8">No categories assigned</span>
              ) : (
                displayCategories.map((c) => {
                  const active = c.slug === selectedCategorySlug;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleCategoryClick(c.slug)}
                      className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm sm:text-base font-body-hindi font-medium transition-all ${active
                        ? "bg-orange text-paper shadow-editorial"
                        : "bg-white text-navy/75 ring-1 ring-navy/10 hover:ring-navy/30"
                        }`}
                    >
                      {c.name}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </header>
      <FullscreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
