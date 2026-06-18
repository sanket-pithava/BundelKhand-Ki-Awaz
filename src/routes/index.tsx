import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Play, ChevronRight } from "lucide-react";
import { Header } from "@/components/harbole/Header";
import { BottomNav } from "@/components/harbole/BottomNav";
import { ArticleCard } from "@/components/harbole/ArticleCard";
import { SectionHeader } from "@/components/harbole/SectionHeader";
import { HeroSlider } from "@/components/harbole/HeroSlider";
import { NewsTicker } from "@/components/harbole/NewsTicker";
import { Shakhsiyat } from "@/components/harbole/Shakhsiyat";
import { ImpactTimeline } from "@/components/harbole/ImpactTimeline";
import { DistrictGrid } from "@/components/harbole/DistrictGrid";
import { AmitTripathiShow } from "@/components/harbole/AmitTripathiShow";
import { AutoScrollingAds } from "@/components/harbole/AutoScrollingAds";
import { AdBanner } from "@/components/harbole/AdBanner";
import { Logo } from "@/components/harbole/Logo";
import { ScrollableRow } from "@/components/harbole/ScrollableRow";
import {
  HERO,
  TOP10, // kept as fallback if needed for types, but we'll use dynamic
  REELS,
  IMAGES,
} from "@/lib/harbole-data";
import { useArticles } from "@/hooks/useArticles";
import { useHomepageData } from "@/hooks/useHomepageData";

type HomeSearch = {
  district?: string;
  category?: string;
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): HomeSearch => {
    return {
      district: search.district as string | undefined,
      category: search.category as string | undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "हरबोले — बुंदेलखंड की आवाज़ | Harbole" },
      { name: "description", content: "Premium regional journalism from Bundelkhand — politics, culture, villages, sports, impact stories." },
      { property: "og:title", content: "हरबोले — बुंदेलखंड की आवाज़" },
      { property: "og:description", content: "Voice of the people, pride of the region — premium Bundeli journalism." },
    ],
  }),
  component: HomePage,
});

// Removed static HERO_SLIDES and TICKER_1, TICKER_2

function HomePage() {
  const search = useSearch({ from: "/" });
  const { data: articles, isLoading } = useArticles(search.district, search.category);
  const { data: homeData, isLoading: homeLoading } = useHomepageData();

  const isFiltered = !!(search.district || search.category);

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-[480px] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto bg-paper relative">
        <Header />
        <main className="pb-32 md:pb-16">
          {isFiltered ? (
            <section className="py-8 md:py-12 px-4 md:px-6 min-h-[50vh]">
              <SectionHeader hindi="ताज़ा ख़बरें" english="Filtered Results" />
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                  {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-navy/5 rounded-2xl" />)}
                </div>
              ) : articles?.length === 0 ? (
                <div className="py-20 text-center text-navy/50 font-body-hindi">इस श्रेणी में अभी कोई ख़बर नहीं है। (No articles found)</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {articles?.map(a => (
                    <ArticleCard key={a.id} article={{ ...a, time: a.time_label || "", image: a.image_url || "" } as any} />
                  ))}
                </div>
              )}
            </section>
          ) : (
            <>
              {/* Live ticker */}
              {homeData?.breakingNews?.length ? <NewsTicker items={homeData.breakingNews} /> : null}

              {/* Hero auto-rotating slider */}
              {homeLoading ? (
                <div className="p-4 md:px-6 md:py-6"><div className="aspect-[16/10] md:aspect-[21/9] bg-navy/5 rounded-2xl animate-pulse" /></div>
              ) : (
                <HeroSlider slides={homeData?.heroArticles || []} />
              )}

              {/* Impact Timeline */}
              {homeData?.impactArticles?.length ? (
                <ImpactTimeline items={homeData.impactArticles} />
              ) : null}

              {/* Top 10 */}
              {homeData?.top10Articles?.length ? (
                <section className="py-6">
                  <SectionHeader hindi="बुंदेलखंड Top 10" english="Most Read Today" href="/category/top10" />
                  <ScrollableRow className="gap-5 px-4 pb-2">
                    {homeData.top10Articles.map((a, i) => (
                      <div key={a.slug} className="shrink-0 w-[85%] sm:w-[calc(50%-10px)] md:w-[calc(33.333%-13px)] lg:w-[calc(25%-15px)] snap-start relative pt-3">
                        <span className="absolute -top-1 -left-1 text-[80px] leading-none font-bold text-gold/25 italic select-none font-sans">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="relative z-10 pl-7">
                          <ArticleCard article={a as any} />
                        </div>
                      </div>
                    ))}
                  </ScrollableRow>
                </section>
              ) : null}

              {/* Ticker 2 */}
              {homeData?.breakingNews?.length ? <NewsTicker items={homeData.breakingNews} invert /> : null}

              {/* Ads Carousel */}
              {homeData?.ads && homeData.ads.length > 0 && (
                <AutoScrollingAds ads={homeData.ads} />
              )}


              {/* DYNAMIC CATEGORY SECTIONS AND STATIC WIDGETS */}
              {/* We will render static components at specific positions relative to dynamic sections, but guarantee they render even if sections are missing */}

              <div className="flex flex-col">
                {/* Slot 0: Dynamic Section 0 or Shakhsiyat */}
                {homeData?.categorySections?.[0] && (
                  <CategoryBand
                    hindi={homeData.categorySections[0].title_hindi}
                    english={homeData.categorySections[0].title_english}
                    href={`/category/${homeData.categorySections[0].category_slug}`}
                    items={homeData.categorySections[0].articles as any}
                  />
                )}
                <Shakhsiyat profiles={homeData?.shakhsiyat || []} />

                {/* Slot 1: Dynamic Section 1 or Reels */}
                {homeData?.categorySections?.[1] && (
                  <CategoryBand
                    hindi={homeData.categorySections[1].title_hindi}
                    english={homeData.categorySections[1].title_english}
                    href={`/category/${homeData.categorySections[1].category_slug}`}
                    items={homeData.categorySections[1].articles as any}
                  />
                )}
                {homeData?.reels && homeData.reels.length > 0 && (
                  <section className="bg-navy py-10 grain">
                    <SectionHeader hindi="लोक रंग" english="Bundeli Reels" invert />
                    <ScrollableRow className="gap-3 px-4 pb-2">
                      {homeData.reels.map((r) => (
                        <a
                          key={r.id}
                          href={r.video_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 w-[calc(50%-6px)] md:w-[calc(25%-9px)] aspect-[9/16] rounded-xl overflow-hidden relative ring-1 ring-white/10 group block snap-start"
                        >
                          <img src={r.thumbnail} alt={r.title} loading="lazy" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                          <div className="absolute top-2.5 right-2.5 size-7 rounded-full bg-paper/15 backdrop-blur grid place-items-center ring-1 ring-paper/20">
                            <Play className="size-3 text-paper fill-paper" />
                          </div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <p className="text-paper text-xs font-body-hindi leading-snug mb-1">{r.title}</p>
                            <div className="flex justify-between items-center text-paper/50 text-[10px] font-semibold">
                              <span>{r.views}</span>
                              <span>{r.duration}</span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </ScrollableRow>
                  </section>
                )}

                {/* Slot 2: Dynamic Section 2 */}
                {homeData?.categorySections?.[2] && (
                  <CategoryBand
                    hindi={homeData.categorySections[2].title_hindi}
                    english={homeData.categorySections[2].title_english}
                    href={`/category/${homeData.categorySections[2].category_slug}`}
                    items={homeData.categorySections[2].articles as any}
                  />
                )}

                {/* Slot 3: Dynamic Section 3 or Amit Tripathi Show */}
                {homeData?.categorySections?.[3] && (
                  <CategoryBand
                    hindi={homeData.categorySections[3].title_hindi}
                    english={homeData.categorySections[3].title_english}
                    href={`/category/${homeData.categorySections[3].category_slug}`}
                    items={homeData.categorySections[3].articles as any}
                  />
                )}
                <AmitTripathiShow featuredEpisode={homeData?.featuredEpisode} pastEpisodes={homeData?.pastEpisodes || []} />

                {/* Slot 4: Dynamic Section 4 */}
                {homeData?.categorySections?.[4] && (
                  <CategoryBand
                    hindi={homeData.categorySections[4].title_hindi}
                    english={homeData.categorySections[4].title_english}
                    href={`/category/${homeData.categorySections[4].category_slug}`}
                    items={homeData.categorySections[4].articles as any}
                  />
                )}

                {/* Any remaining dynamic sections */}
                {homeData?.categorySections?.slice(5).map((sec) => (
                  <CategoryBand
                    key={sec.id}
                    hindi={sec.title_hindi}
                    english={sec.title_english}
                    href={`/category/${sec.category_slug}`}
                    items={sec.articles as any}
                  />
                ))}
              </div>

            </>
          )}

          {/* District Selector always visible at bottom */}
          <DistrictGrid />

          {/* Footer */}
          <footer className="bg-navy text-paper px-6 pt-12 pb-10 mt-6">
            <div className="flex items-center gap-3 mb-6">
              <Logo className="h-16 w-auto" />
              <div>
                <div className="font-hindi text-2xl">हरबोले</div>
                <div className="text-[9px] uppercase tracking-[0.3em] text-gold/80">Bundelkhand Ki Awaaz</div>
              </div>
            </div>
            <p className="text-paper/55 text-sm font-body-hindi leading-relaxed mb-8 max-w-prose">
              बुंदेलखंड की मिट्टी, उसकी आवाज़, उसके लोग — हरबोले एक स्वतंत्र प्रीमियम डिजिटल मीडिया मंच है जो क्षेत्रीय पत्रकारिता को आधुनिक रूप में पेश करता है।
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div>
                <div className="text-gold text-[9px] font-bold uppercase tracking-[0.25em] mb-3">Sections</div>
                <ul className="space-y-2 text-sm text-paper/70 font-body-hindi">
                  <li>राजनीति</li>
                  <li>खेल</li>
                  <li>धर्म व संस्कृति</li>
                  <li>गांव की कहानियाँ</li>
                  <li>व्यापार</li>
                </ul>
              </div>
              <div>
                <div className="text-gold text-[9px] font-bold uppercase tracking-[0.25em] mb-3">Editorial</div>
                <ul className="space-y-2 text-sm text-paper/70 font-body-hindi">
                  <li>हमारा सिद्धांत</li>
                  <li>The Amit Tripathi Show</li>
                  <li>संपर्क</li>
                  <li>आर्काइव</li>
                </ul>
              </div>
              <div className="hidden md:block">
                <div className="text-gold text-[9px] font-bold uppercase tracking-[0.25em] mb-3">Region</div>
                <ul className="space-y-2 text-sm text-paper/70 font-body-hindi">
                  <li>झांसी</li>
                  <li>महोबा</li>
                  <li>छतरपुर</li>
                  <li>सागर</li>
                  <li>टीकमगढ़</li>
                </ul>
              </div>
              <div className="hidden md:block">
                <div className="text-gold text-[9px] font-bold uppercase tracking-[0.25em] mb-3">Company</div>
                <ul className="space-y-2 text-sm text-paper/70 font-body-hindi">
                  <li>About Harbole</li>
                  <li>Careers</li>
                  <li>Advertise</li>
                  <li>Privacy</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-2 mb-6">
              {[
                {
                  label: "Twitter",
                  path: "M18.244 2H21l-6.52 7.45L22 22h-6.91l-4.83-6.32L4.7 22H2l7.04-8.04L1.5 2h7.08l4.36 5.86L18.24 2zm-2.42 18h1.69L7.27 4h-1.8l10.35 16z",
                },
                {
                  label: "Instagram",
                  path: "M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2zm0 5.6a4.2 4.2 0 100 8.4 4.2 4.2 0 000-8.4zm0 6.93a2.73 2.73 0 110-5.46 2.73 2.73 0 010 5.46zm5.35-7.1a.98.98 0 11-1.96 0 .98.98 0 011.96 0z",
                },
                {
                  label: "YouTube",
                  path: "M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z",
                },
                {
                  label: "Facebook",
                  path: "M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.25 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z",
                },
              ].map(({ label, path }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="size-9 rounded-full ring-1 ring-white/15 grid place-items-center text-paper/80 hover:bg-white/5 hover:text-gold transition"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
            <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[10px] uppercase tracking-widest text-paper/35">
              <span>© 2026 Harbole Media</span>
              <span>Made in Bundelkhand</span>
            </div>
          </footer>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

function CategoryBand({
  hindi,
  english,
  href,
  items,
}: {
  hindi: string;
  english: string;
  href: string;
  items: { slug: string; title: string; category: string; time: string; image: string; author?: string }[];
}) {
  return (
    <section className="py-8 md:py-12">
      <SectionHeader hindi={hindi} english={english} href={href} />
      <ScrollableRow className="gap-4 md:gap-6 px-4 md:px-6 pb-2">
        {items.map((a) => (
          <div key={a.slug} className="shrink-0 w-[85%] sm:w-[calc(50%-8px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] snap-start">
            <ArticleCard article={a} />
          </div>
        ))}
      </ScrollableRow>
    </section>
  );
}
