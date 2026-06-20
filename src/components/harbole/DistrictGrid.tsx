import { MapPin, ChevronRight } from "lucide-react";
import { useNavigationData } from "@/hooks/useNavigationData";
import { useNavigate, useSearch } from "@tanstack/react-router";

export function DistrictGrid() {
  const { data, isLoading } = useNavigationData();
  const navigate = useNavigate({ from: "/" });
  
  let search: any = {};
  try {
    search = useSearch({ from: "/" });
  } catch (e) {
    // fallback if not on root
  }
  
  const selectedDistrictSlug = search.district;

  if (isLoading) {
    return (
      <section className="px-4 py-10">
        <div className="h-20 bg-navy/5 animate-pulse rounded-lg mb-5" />
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {[...Array(8)].map((_, i) => (
             <div key={i} className="aspect-square bg-navy/5 animate-pulse rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  const districts = data?.districts || [];
  if (districts.length === 0) return null;

  const activeDistrict = districts.find(d => d.slug === selectedDistrictSlug) || districts[0];

  function handleDistrictClick(slug: string) {
    navigate({ search: (prev: any) => ({ ...prev, district: slug, category: undefined }) });
  }

  return (
    <section className="px-4 py-10">
      <div className="mb-5">
        <div className="text-orange text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Your District</div>
        <h2 className="font-hindi text-2xl font-semibold text-navy">अपना जिला चुनें</h2>
        <p className="text-navy/50 text-xs font-body-hindi mt-2">अपने जिले की ख़ास ख़बरें सबसे ऊपर देखें</p>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {districts.map((d) => {
          const active = d.slug === activeDistrict?.slug;
          return (
            <button
              key={d.id}
              onClick={() => handleDistrictClick(d.slug)}
              className={`relative aspect-square rounded-lg p-2 flex flex-col items-center justify-center text-center transition-all overflow-hidden ${
                active
                  ? "bg-navy text-paper shadow-elevated"
                  : "bg-white text-navy ring-1 ring-navy/10 hover:ring-navy/30"
              }`}
            >
              {d.image_url ? (
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition">
                  <img src={d.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              ) : null}
              <MapPin className={`absolute top-2 left-2 size-3 z-10 ${active ? "text-gold" : "text-orange"}`} />
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <div className={`font-hindi text-lg sm:text-xl font-semibold leading-tight ${active ? "text-paper" : "text-navy"}`}>{d.name}</div>
              </div>
              {active && <div className="absolute top-1.5 right-1.5 size-1 rounded-full bg-gold animate-pulse z-10" />}
            </button>
          );
        })}
      </div>
      <button className="mt-5 w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-orange">
        देखें {activeDistrict?.name} की ख़बरें <ChevronRight className="size-4" />
      </button>
    </section>
  );
}
