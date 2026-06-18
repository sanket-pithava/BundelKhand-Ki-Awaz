import { useState, useEffect } from "react";
import { Play, Radio, Mic, Calendar } from "lucide-react";
import type { DynamicEpisode } from "@/hooks/useHomepageData";
import { extractYouTubeId } from "@/lib/youtubeUtils";

export function AmitTripathiShow({
  featuredEpisode,
  pastEpisodes,
}: {
  featuredEpisode?: DynamicEpisode | null;
  pastEpisodes: DynamicEpisode[];
}) {
  const [activeEpisode, setActiveEpisode] = useState<DynamicEpisode | null>(featuredEpisode || pastEpisodes[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (featuredEpisode) {
      setActiveEpisode(featuredEpisode);
      setIsPlaying(false);
    }
  }, [featuredEpisode]);

  if (!activeEpisode && pastEpisodes.length === 0) return null;

  return (
    <section className="relative my-8 overflow-hidden">
      <div className="relative bg-[oklch(0.16_0.035_250)] text-paper px-4 py-12 grain">
        <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-orange/30 blur-3xl animate-glow" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-gold/15 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Mic className="size-4 text-orange" />
            <span className="text-orange text-[10px] font-bold uppercase tracking-[0.35em]">Flagship Show</span>
            <span className="size-1 rounded-full bg-paper/30" />
            {activeEpisode && (
              <span className="text-paper/50 text-[10px] uppercase tracking-widest font-semibold">Season {activeEpisode.season_number}</span>
            )}
          </div>

          <h2 className="font-hindi text-[34px] leading-[1.05] font-medium text-paper text-balance">
            The Amit <span className="text-gold">Tripathi</span> Show
          </h2>
          <p className="font-body-hindi text-paper/65 mt-3 max-w-prose text-sm">
            हर सप्ताह बुंदेलखंड की धड़कनों से जुड़ी एक नई कहानी, एक तीखी बहस और एक ज़रूरी सवाल।
          </p>

          {activeEpisode && (
          <div className="mt-7 block relative rounded-2xl overflow-hidden ring-1 ring-gold/25 group">
            <div className="relative aspect-video">
              {isPlaying ? (
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(activeEpisode.youtube_url)}?autoplay=1&rel=0`}
                  title={activeEpisode.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0 absolute inset-0"
                />
              ) : (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="w-full h-full text-left relative"
                >
                  <img src={activeEpisode.thumbnail} alt={activeEpisode.title} loading="lazy" className="absolute inset-0 w-full h-full object-contain opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-orange/40 blur-xl animate-glow" />
                      <div className="relative size-20 rounded-full bg-orange grid place-items-center shadow-elevated ring-4 ring-orange/20">
                        <Play className="size-8 text-paper fill-paper ml-1" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-orange text-paper text-[10px] font-bold uppercase tracking-widest rounded flex items-center gap-1.5">
                      <Radio className="size-3" /> Premiering
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Episode {activeEpisode.episode_number}</div>
                    <h3 className="font-hindi text-xl text-paper leading-tight text-balance">{activeEpisode.title}</h3>
                    {activeEpisode.subtitle && (
                      <p className="font-hindi text-sm text-paper/80 mt-1">{activeEpisode.subtitle}</p>
                    )}
                    <div className="mt-3 flex items-center gap-3 text-[10px] text-paper/65 uppercase tracking-widest font-semibold">
                      <Calendar className="size-3" /> {new Date(activeEpisode.publish_at).toLocaleDateString()}
                      {activeEpisode.schedule && (
                        <>
                          <span className="size-1 rounded-full bg-paper/30" />
                          {activeEpisode.schedule}
                        </>
                      )}
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
          )}

          {pastEpisodes.length > 0 && (
            <div className="mt-6">
              <div className="text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-3">Past Episodes</div>
              <div className="space-y-2.5">
                {pastEpisodes.filter(e => e.id !== activeEpisode?.id).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      setActiveEpisode(e);
                      setIsPlaying(true);
                    }}
                    className="w-full flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-white/10 rounded-xl p-3 text-left transition group"
                  >
                    <div className="size-10 rounded-full bg-orange/15 ring-1 ring-orange/40 grid place-items-center shrink-0 group-hover:bg-orange transition">
                      <Play className="size-3.5 text-orange fill-orange group-hover:text-paper group-hover:fill-paper ml-0.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-gold mb-0.5">EP {e.episode_number}</div>
                      <p className="font-hindi text-sm text-paper leading-snug line-clamp-1">{e.title}</p>
                    </div>
                    {e.schedule && <span className="text-[10px] text-paper/40 font-semibold shrink-0">{e.schedule}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
