import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Bookmark, Share2, Type, Clock } from "lucide-react";
import { Header } from "@/components/harbole/Header";
import { BottomNav } from "@/components/harbole/BottomNav";
import { ALL_ARTICLES, TOP10 } from "@/lib/harbole-data";
import { AdBanner } from "@/components/harbole/AdBanner";
import { getArticleBySlugFn } from "@/lib/queries";
import { toast } from "sonner";

export const Route = createFileRoute("/article/$slug")({
  loader: async ({ params }): Promise<{
    article: any;
    relatedArticles: any[];
    prevArticle: any;
    nextArticle: any;
    ads?: any[];
  }> => {
    let result: Awaited<ReturnType<typeof getArticleBySlugFn>> = null;
    try {
      result = await getArticleBySlugFn({ data: params.slug });
    } catch (e) {
      console.error("Error loading article from Mongo:", e);
    }

    if (result?.article) {
      return result;
    }

    const fallback = ALL_ARTICLES[params.slug];
    if (!fallback) throw notFound();

    return {
      article: fallback,
      relatedArticles: [],
      prevArticle: null,
      nextArticle: null,
      ads: [],
    };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.article.title} | हरबोले` },
          {
            name: "description",
            content: loaderData.article.dek || loaderData.article.title,
          },
          { property: "og:title", content: loaderData.article.title },
          { property: "og:image", content: loaderData.article.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center bg-paper p-8 text-center">
      <div>
        <h1 className="font-hindi text-3xl text-navy mb-3">लेख नहीं मिला</h1>
        <Link
          to="/"
          className="text-orange font-semibold text-sm uppercase tracking-widest"
        >
          Back home
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="min-h-screen grid place-items-center p-8 text-center">
      <button onClick={reset} className="text-orange">
        Retry
      </button>
    </div>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const { article, relatedArticles, prevArticle, nextArticle, ads = [] } =
    Route.useLoaderData();

  const adSlot1 = ads[0] || null;
  const adSlot2 = ads[1] || (ads.length === 1 ? ads[0] : null);

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
              <button
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator
                      .share({
                        title: article.title,
                        text: article.dek,
                        url: window.location.href,
                      })
                      .catch(console.error);
                  } else if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("News link copied successfully.");
                  }
                }}
                className="size-9 grid place-items-center rounded-full hover:bg-navy/5"
                title="Share"
              >
                <Share2 className="size-4 text-navy" />
              </button>
            </div>
          </div>

          <article className="pt-4 animate-reveal">
            <div className="px-5">
              <div className="text-orange text-[10px] font-bold uppercase tracking-[0.3em] mb-3">
                {article.category}
              </div>
              <h1 className="font-hindi text-[34px] md:text-5xl lg:text-6xl leading-[1.15] md:leading-[1.05] text-navy text-balance font-medium mb-5">
                {article.title}
              </h1>
              {article.dek && (
                <p className="font-body-hindi text-lg text-navy/70 leading-relaxed text-pretty mb-6">
                  {article.dek}
                </p>
              )}
              <div className="flex items-center justify-between py-4 border-y border-navy/10 mb-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full overflow-hidden bg-gold/20 ring-1 ring-gold/40 grid place-items-center font-hindi text-gold">
                    {article.reporterProfile?.profile_image ? (
                      <img
                        src={article.reporterProfile.profile_image}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      (article.reporterProfile?.name?.[0] ??
                      article.author?.[0] ??
                      "ह")
                    )}
                  </div>
                  <div>
                    <div className="font-body-hindi text-sm font-semibold text-navy">
                      {article.reporterProfile?.name ||
                        article.author ||
                        "हरबोले डेस्क"}
                    </div>
                    <div className="text-[10px] text-navy/50 uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="size-3" /> {article.time} · 6 min read
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 md:px-6 lg:px-8">
              <picture className="relative block w-full aspect-[4/3] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-editorial bg-navy/5">
                <img
                  src={article.image}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-xl opacity-60 scale-110 saturate-150"
                />
                <img
                  src={article.image}
                  alt={article.title}
                  width={1024}
                  height={680}
                  className="relative z-10 w-full h-full object-contain drop-shadow-md"
                />
              </picture>
              <p className="text-[10px] uppercase tracking-widest text-navy/40 mt-2 px-1">
                — हरबोले फोटो
              </p>
            </div>

            <div className="px-6 md:px-8 lg:px-10 mt-8 space-y-6 font-body-hindi text-[17px] md:text-lg leading-[1.8] text-navy/85">
              {article.content ? (
                <div
                  dangerouslySetInnerHTML={{ __html: article.content }}
                  className="prose prose-lg prose-navy max-w-none prose-p:mb-6"
                />
              ) : (
                <p className="first-letter:font-hindi first-letter:text-6xl first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-orange">
                  {article.dek || "इस खबर का पूरा विवरण जल्द ही उपलब्ध होगा।"}
                </p>
              )}
            </div>

            <div className="px-6 md:px-8 lg:px-10 mt-10 mb-8 border-t border-navy/10 pt-6">
              <h3 className="text-sm font-semibold text-navy mb-4 font-hindi">
                Share this article:
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                {typeof navigator !== "undefined" && navigator.share && (
                  <button
                    onClick={() => {
                      navigator
                        .share({
                          title: article.title,
                          text: article.dek,
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
                  href={`https://wa.me/?text=${encodeURIComponent(`${article.title} - ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
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

          {/* Reporter Bio Block */}
          {article.reporterProfile && (
            <div className="px-4 md:px-6 lg:px-8 mt-6">
              <div className="bg-navy/5 rounded-2xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6 border border-navy/10">
                <div className="size-24 rounded-full overflow-hidden shrink-0 ring-4 ring-white shadow-sm">
                  {article.reporterProfile.profile_image ? (
                    <img
                      src={article.reporterProfile.profile_image}
                      className="w-full h-full object-cover"
                      alt={article.reporterProfile.name}
                    />
                  ) : (
                    <div className="w-full h-full bg-navy text-white grid place-items-center text-3xl font-bold">
                      {article.reporterProfile.name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="text-[10px] font-bold text-orange uppercase tracking-widest mb-1">
                    Reporter
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-2">
                    {article.reporterProfile.name}
                  </h3>
                  <p className="text-sm text-navy/70 leading-relaxed max-w-2xl">
                    Reporting from the ground for Harbole. Bringing you the most
                    accurate and timely news from the Bundelkhand region.
                  </p>

                  {/* Social Links */}
                  {(article.reporterProfile.youtube_link ||
                    article.reporterProfile.instagram_link ||
                    article.reporterProfile.linkedin_link) && (
                    <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
                      {article.reporterProfile.youtube_link && (
                        <a
                          href={article.reporterProfile.youtube_link}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/20 transition-colors"
                        >
                          YouTube
                        </a>
                      )}
                      {article.reporterProfile.instagram_link && (
                        <a
                          href={article.reporterProfile.instagram_link}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-pink-500/10 text-pink-600 text-[10px] font-bold uppercase tracking-wider hover:bg-pink-500/20 transition-colors"
                        >
                          Instagram
                        </a>
                      )}
                      {article.reporterProfile.linkedin_link && (
                        <a
                          href={article.reporterProfile.linkedin_link}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-colors"
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* In-article dynamic ad (Slot 1) */}
          {adSlot1 && (
            <AdBanner
              variant={adSlot1.variant || "gold"}
              sponsor={adSlot1.sponsor}
              eyebrow={adSlot1.eyebrow || "Sponsored"}
              title={adSlot1.title}
              subtitle={adSlot1.subtitle}
              cta={adSlot1.cta || "Explore"}
              image={adSlot1.image}
              mobileImage={adSlot1.mobileImage}
              website_url={adSlot1.website_url}
            />
          )}

          <section className="mt-8 px-4 md:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row gap-4 border-y border-navy/10 py-6 mb-8 justify-between">
              {prevArticle ? (
                <Link
                  to="/article/$slug"
                  params={{ slug: prevArticle.slug }}
                  className="flex-1 group"
                >
                  <div className="text-[10px] text-navy/50 font-bold uppercase tracking-widest mb-1 group-hover:text-orange transition-colors">
                    ← Previous Article
                  </div>
                  <div className="font-hindi text-sm text-navy leading-snug line-clamp-2">
                    {prevArticle.title}
                  </div>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
              {nextArticle ? (
                <Link
                  to="/article/$slug"
                  params={{ slug: nextArticle.slug }}
                  className="flex-1 text-right group"
                >
                  <div className="text-[10px] text-navy/50 font-bold uppercase tracking-widest mb-1 group-hover:text-orange transition-colors">
                    Next Article →
                  </div>
                  <div className="font-hindi text-sm text-navy leading-snug line-clamp-2">
                    {nextArticle.title}
                  </div>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
            </div>

            {relatedArticles && relatedArticles.length > 0 && (
              <>
                <div className="text-orange text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
                  Related News
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
                  {relatedArticles.map((a: any) => (
                    <Link
                      key={a.slug}
                      to="/article/$slug"
                      params={{ slug: a.slug }}
                      className="flex md:flex-col gap-3 bg-white rounded-xl p-3 ring-1 ring-navy/5 shadow-editorial group hover:shadow-elevated transition-shadow"
                    >
                      <img
                        src={a.image}
                        alt=""
                        loading="lazy"
                        className="size-20 md:h-auto md:w-full object-cover rounded-lg shrink-0 group-hover:opacity-95"
                      />
                      <div className="min-w-0">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-orange mb-1">
                          {a.category}
                        </div>
                        <h4 className="font-hindi text-sm md:text-base text-navy leading-snug line-clamp-3 group-hover:text-orange transition-colors">
                          {a.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Bottom dynamic ad (Slot 2) */}
          {adSlot2 && (
            <AdBanner
              variant={adSlot2.variant || "navy"}
              sponsor={adSlot2.sponsor}
              eyebrow={adSlot2.eyebrow || "Membership"}
              title={adSlot2.title}
              subtitle={adSlot2.subtitle}
              cta={adSlot2.cta || "Try Free"}
              image={adSlot2.image}
              mobileImage={adSlot2.mobileImage}
              website_url={adSlot2.website_url}
            />
          )}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
