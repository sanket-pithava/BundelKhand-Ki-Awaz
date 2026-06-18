import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Share2, Quote } from "lucide-react";
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
    return { profile: data };
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
        <h1 className="font-hindi text-3xl text-navy mb-3">शख्सियत नहीं मिली</h1>
        <Link to="/" className="text-orange font-semibold text-sm uppercase tracking-widest">Back home</Link>
      </div>
    </div>
  ),
  component: SakshiyatPage,
});

function SakshiyatPage() {
  const { profile } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <div className="max-w-[480px] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl w-full mx-auto bg-paper relative flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 pb-32 md:pb-16 animate-reveal">
          <div className="px-4 pt-3 mb-6">
            <Link to="/" className="inline-flex items-center gap-1.5 text-navy/60 text-xs font-semibold uppercase tracking-widest hover:text-navy transition">
              <ArrowLeft className="size-4" /> Home
            </Link>
            <span className="text-navy/30 mx-2">/</span>
            <span className="text-orange text-xs font-semibold uppercase tracking-widest">Sakshiyat</span>
            <span className="text-navy/30 mx-2">/</span>
            <span className="text-navy/60 text-xs font-semibold uppercase tracking-widest">{profile.name}</span>
          </div>

          <article className="max-w-3xl mx-auto px-4 md:px-8">
            <div className="relative mb-8 rounded-3xl overflow-hidden shadow-editorial bg-navy">
              <img
                src={profile.image || IMAGES.amitTripathi}
                alt={profile.name}
                className="w-full aspect-square md:aspect-[4/3] object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <div className="text-gold text-xs font-bold uppercase tracking-[0.3em] mb-2">{profile.designation}</div>
                <h1 className="font-hindi text-4xl md:text-6xl text-paper leading-none mb-4">{profile.name}</h1>
              </div>
            </div>

            <div className="relative bg-white p-6 md:p-8 rounded-2xl ring-1 ring-navy/5 shadow-sm mb-10 text-center">
              <Quote className="size-8 md:size-10 text-orange/20 mx-auto mb-4" />
              <p className="font-hindi text-2xl md:text-3xl text-navy leading-snug text-balance">
                "{profile.quote}"
              </p>
            </div>

            {profile.description && (
              <div className="prose prose-lg prose-navy max-w-none font-body-hindi text-lg leading-relaxed text-navy/85 mb-10">
                {profile.description}
              </div>
            )}

            <div className="mt-12 mb-8 border-t border-navy/10 pt-8">
              <h3 className="text-sm font-semibold text-navy mb-4 font-hindi">Share this profile:</h3>
              <div className="flex flex-wrap items-center gap-3">
                {typeof navigator !== "undefined" && navigator.share && (
                  <button
                    onClick={() => {
                      navigator.share({
                        title: `${profile.name} - शख्सियत`,
                        text: profile.quote,
                        url: window.location.href,
                      }).catch(console.error);
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
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
