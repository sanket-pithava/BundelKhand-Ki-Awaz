import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Share2, Type, Bookmark, Quote } from "lucide-react";
import { Header } from "@/components/harbole/Header";
import { BottomNav } from "@/components/harbole/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { IMAGES } from "@/lib/harbole-data";

export const Route = createFileRoute("/sakshiyat/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("shakhsiyat")
      .select("*")
      .or(`slug.eq.${params.slug},id.eq.${params.slug}`)
      .eq("status", true)
      .maybeSingle();

    if (error || !data) throw notFound();

    // Fetch related shakhsiyat
    const { data: relatedData } = await supabase
      .from("shakhsiyat")
      .select("name, slug, image, designation")
      .eq("status", true)
      .neq("id", data.id)
      .limit(3);

    return { profile: data, otherProfiles: relatedData || [] };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.profile.name} - शख्सियत | हरबोले` },
          { name: "description", content: loaderData.profile.quote },
          { property: "og:title", content: loaderData.profile.name },
          { property: "og:image", content: loaderData.profile.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center bg-paper p-8 text-center">
      <div>
        <h1 className="font-hindi text-3xl text-navy mb-3">
          शख्सियत नहीं मिली
        </h1>
        <Link
          to="/"
          className="text-orange font-semibold text-sm uppercase tracking-widest"
        >
          Back home
        </Link>
      </div>
    </div>
  ),
  component: SakshiyatPage,
});

function SakshiyatPage() {
  const { profile, otherProfiles } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-[480px] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto bg-paper relative">
        <Header />

        <main className="pb-32 md:pb-16">
          <div className="px-4 pt-3 flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-navy/60 text-xs font-semibold uppercase tracking-widest"
            >
              <ArrowLeft className="size-4" /> Back
            </Link>
            <div className="flex items-center gap-1">
              <button className="size-9 grid place-items-center rounded-full hover:bg-navy/5">
                <Type className="size-4 text-navy" />
              </button>
              <button className="size-9 grid place-items-center rounded-full hover:bg-navy/5">
                <Bookmark className="size-4 text-navy" />
              </button>
              <button className="size-9 grid place-items-center rounded-full hover:bg-navy/5">
                <Share2 className="size-4 text-navy" />
              </button>
            </div>
          </div>

          <article className="pt-4 animate-reveal">
            <div className="px-5">
              <div className="text-orange text-[10px] font-bold uppercase tracking-[0.3em] mb-3">
                शख्सियत
              </div>
              <h1 className="font-hindi text-[34px] md:text-5xl lg:text-6xl leading-[1.15] md:leading-[1.05] text-navy text-balance font-medium mb-5">
                {profile.name}
              </h1>

              <div className="relative bg-white p-6 rounded-2xl ring-1 ring-navy/5 shadow-sm mb-6 text-center">
                <Quote className="size-8 text-orange/20 mx-auto mb-3" />
                <p className="font-hindi text-xl md:text-2xl text-navy leading-snug text-balance">
                  "{profile.quote}"
                </p>
              </div>

              <div className="flex items-center justify-between py-4 border-y border-navy/10 mb-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gold/20 ring-1 ring-gold/40 grid place-items-center font-hindi text-gold">
                    {profile.name?.[0] ?? "ह"}
                  </div>
                  <div>
                    <div className="font-body-hindi text-sm font-semibold text-navy">
                      {profile.designation}
                    </div>
                    <div className="text-[10px] text-navy/50 uppercase tracking-widest flex items-center gap-1.5">
                      Bundelkhand
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 md:px-6 lg:px-8">
              <picture className="relative block w-full aspect-[4/3] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-editorial bg-navy/5">
                <img
                  src={profile.image || IMAGES.amitTripathi}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-xl opacity-60 scale-110 saturate-150"
                />
                <img
                  src={profile.image || IMAGES.amitTripathi}
                  alt={profile.name}
                  width={1024}
                  height={680}
                  className="relative z-10 w-full h-full object-contain drop-shadow-md"
                />
              </picture>
              <p className="text-[10px] uppercase tracking-widest text-navy/40 mt-2 px-1">
                — हरबोले शख्सियत
              </p>
            </div>

            <div className="px-6 md:px-8 lg:px-10 mt-8 space-y-6 font-body-hindi text-[17px] md:text-lg leading-[1.8] text-navy/85">
              {profile.description ? (
                <div
                  dangerouslySetInnerHTML={{ __html: profile.description }}
                  className="prose prose-lg prose-navy max-w-none prose-p:mb-6"
                />
              ) : (
                <p className="first-letter:font-hindi first-letter:text-6xl first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-orange">
                  इस शख्सियत का पूरा विवरण जल्द ही उपलब्ध होगा।
                </p>
              )}
            </div>

            <div className="px-6 md:px-8 lg:px-10 mt-10 mb-8 border-t border-navy/10 pt-6">
              <h3 className="text-sm font-semibold text-navy mb-4 font-hindi">
                Share this profile:
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                {typeof navigator !== "undefined" && navigator.share && (
                  <button
                    onClick={() => {
                      navigator
                        .share({
                          title: `${profile.name} - शख्सियत`,
                          text: profile.quote,
                          url: window.location.href,
                        })
                        .catch(console.error);
                    }}
                    className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-navy/90 transition"
                  >
                    <Share2 className="size-3" /> Share
                  </button>
                )}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`शख्सियत: ${profile.name} - ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-full text-xs font-semibold hover:opacity-90 transition"
                >
                  WhatsApp
                </a>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link copied to clipboard!");
                    }
                  }}
                  className="flex items-center gap-2 bg-paper text-navy ring-1 ring-navy/20 px-4 py-2 rounded-full text-xs font-semibold hover:bg-navy/5 transition"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </article>

          <section className="mt-8 px-4 md:px-6 lg:px-8">
            {otherProfiles && otherProfiles.length > 0 && (
              <>
                <div className="text-orange text-[10px] font-bold uppercase tracking-[0.3em] mb-4 mt-8 border-t border-navy/10 pt-8">
                  Other Profiles
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
                  {otherProfiles.map((p: any) => (
                    <Link
                      key={p.slug || p.name}
                      to="/sakshiyat/$slug"
                      params={{ slug: p.slug || p.id }}
                      className="flex md:flex-col gap-3 bg-white rounded-xl p-3 ring-1 ring-navy/5 shadow-editorial group hover:shadow-elevated transition-shadow"
                    >
                      <img
                        src={p.image || IMAGES.amitTripathi}
                        alt=""
                        loading="lazy"
                        className="size-20 md:size-auto md:w-full md:aspect-[4/3] object-cover rounded-lg shrink-0 group-hover:opacity-95"
                      />
                      <div className="min-w-0">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-orange mb-1">
                          {p.designation}
                        </div>
                        <h4 className="font-hindi text-sm md:text-base text-navy leading-snug line-clamp-2 group-hover:text-orange transition-colors">
                          {p.name}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
