import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Bookmark, Share2, Type, Clock } from "lucide-react";
import { Header } from "@/components/harbole/Header";
import { BottomNav } from "@/components/harbole/BottomNav";
import { ALL_ARTICLES, TOP10, IMAGES } from "@/lib/harbole-data";
import { AdBanner } from "@/components/harbole/AdBanner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/article/$slug")({
  loader: async ({ params }) => {
    let article = null;
    let relatedArticles: any[] = [];
    let prevArticle = null;
    let nextArticle = null;
    
    const { data, error } = await supabase
      .from('articles')
      .select('*, category:categories(name)')
      .eq('slug', params.slug)
      .maybeSingle();

    if (!error && data) {
      // @ts-ignore
      const categoryName = data.category?.name || (data as any).category_slug || 'news';
      article = {
        title: data.title,
        category: categoryName,
        slug: data.slug,
        time: (data as any).time_label || 'Recently',
        image: data.image_url || '',
        mobileImage: (data as any).mobile_image_url || '',
        dek: data.dek || data.excerpt || '',
        content: data.body || (data as any).content || '',
        author: (data as any).author_name || 'हरबोले डेस्क'
      } as any;

      if (data.category_id) {
        const [relatedRes, prevRes, nextRes] = await Promise.all([
          supabase.from('articles').select('title, slug, image_url, category:categories(name)').eq('category_id', data.category_id).neq('id', data.id).limit(3),
          supabase.from('articles').select('title, slug').lt('created_at', data.created_at).order('created_at', { ascending: false }).limit(1).maybeSingle(),
          supabase.from('articles').select('title, slug').gt('created_at', data.created_at).order('created_at', { ascending: true }).limit(1).maybeSingle()
        ]);
        
        relatedArticles = (relatedRes.data || []).map((a: any) => ({
          title: a.title,
          slug: a.slug,
          image: a.image_url,
          category: Array.isArray(a.category) ? a.category[0]?.name : (a.category?.name || 'News')
        }));
        prevArticle = prevRes.data;
        nextArticle = nextRes.data;
      }

    } else {
      article = ALL_ARTICLES[params.slug];
    }
    
    if (!article) throw notFound();
    return { article, relatedArticles, prevArticle, nextArticle };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.article.title} | हरबोले` },
          { name: "description", content: loaderData.article.dek || loaderData.article.title },
          { property: "og:title", content: loaderData.article.title },
          { property: "og:image", content: loaderData.article.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center bg-paper p-8 text-center">
      <div>
        <h1 className="font-hindi text-3xl text-navy mb-3">लेख नहीं मिला</h1>
        <Link to="/" className="text-orange font-semibold text-sm uppercase tracking-widest">Back home</Link>
      </div>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="min-h-screen grid place-items-center p-8 text-center">
      <button onClick={reset} className="text-orange">Retry</button>
    </div>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const { article, relatedArticles, prevArticle, nextArticle } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-[480px] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto bg-paper relative">
        <Header />
        <main className="pb-32 md:pb-16">
          <div className="px-4 pt-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-1.5 text-navy/60 text-xs font-semibold uppercase tracking-widest">
              <ArrowLeft className="size-4" /> Back
            </Link>
            <div className="flex items-center gap-1">
              <button className="size-9 grid place-items-center rounded-full hover:bg-navy/5"><Type className="size-4 text-navy" /></button>
              <button className="size-9 grid place-items-center rounded-full hover:bg-navy/5"><Bookmark className="size-4 text-navy" /></button>
              <button className="size-9 grid place-items-center rounded-full hover:bg-navy/5"><Share2 className="size-4 text-navy" /></button>
            </div>
          </div>

          <article className="pt-4 animate-reveal">
            <div className="px-5">
              <div className="text-orange text-[10px] font-bold uppercase tracking-[0.3em] mb-3">{article.category}</div>
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
                  <div className="size-10 rounded-full bg-gold/20 ring-1 ring-gold/40 grid place-items-center font-hindi text-gold">
                    {article.author?.[0] ?? "ह"}
                  </div>
                  <div>
                    <div className="font-body-hindi text-sm font-semibold text-navy">{article.author ?? "हरबोले डेस्क"}</div>
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
              <p className="text-[10px] uppercase tracking-widest text-navy/40 mt-2 px-1">— हरबोले फोटो</p>
            </div>

            <div className="px-6 md:px-8 lg:px-10 mt-8 space-y-6 font-body-hindi text-[17px] md:text-lg leading-[1.8] text-navy/85">
              {article.content ? (
                <div dangerouslySetInnerHTML={{ __html: article.content }} className="prose prose-lg prose-navy max-w-none prose-p:mb-6" />
              ) : (
                <p className="first-letter:font-hindi first-letter:text-6xl first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-orange">
                  {article.dek || "इस खबर का पूरा विवरण जल्द ही उपलब्ध होगा।"}
                </p>
              )}
            </div>

            <div className="px-6 md:px-8 lg:px-10 mt-10 mb-8 border-t border-navy/10 pt-6">
              <h3 className="text-sm font-semibold text-navy mb-4 font-hindi">Share this article:</h3>
              <div className="flex flex-wrap items-center gap-3">
                {typeof navigator !== "undefined" && navigator.share && (
                  <button
                    onClick={() => {
                      navigator.share({
                        title: article.title,
                        text: article.dek,
                        url: window.location.href,
                      }).catch(console.error);
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

          {/* In-article ad */}
          <AdBanner
            variant="gold"
            sponsor="Bundeli Bazaar"
            eyebrow="Sponsored"
            title="स्थानीय कारीगरों का बाज़ार — सीधे आपके दरवाज़े"
            subtitle="हर खरीदारी पर एक कारीगर परिवार को मिले सही दाम।"
            cta="Explore"
            image={IMAGES.cultureTemple}
          />

          <section className="mt-8 px-4 md:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row gap-4 border-y border-navy/10 py-6 mb-8 justify-between">
              {prevArticle ? (
                <Link to="/article/$slug" params={{ slug: prevArticle.slug }} className="flex-1 group">
                  <div className="text-[10px] text-navy/50 font-bold uppercase tracking-widest mb-1 group-hover:text-orange transition-colors">← Previous Article</div>
                  <div className="font-hindi text-sm text-navy leading-snug line-clamp-2">{prevArticle.title}</div>
                </Link>
              ) : <div className="flex-1" />}
              {nextArticle ? (
                <Link to="/article/$slug" params={{ slug: nextArticle.slug }} className="flex-1 text-right group">
                  <div className="text-[10px] text-navy/50 font-bold uppercase tracking-widest mb-1 group-hover:text-orange transition-colors">Next Article →</div>
                  <div className="font-hindi text-sm text-navy leading-snug line-clamp-2">{nextArticle.title}</div>
                </Link>
              ) : <div className="flex-1" />}
            </div>

            {relatedArticles && relatedArticles.length > 0 && (
              <>
                <div className="text-orange text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Related News</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
                  {relatedArticles.map((a: any) => (
                    <Link
                      key={a.slug}
                      to="/article/$slug"
                      params={{ slug: a.slug }}
                      className="flex md:flex-col gap-3 bg-white rounded-xl p-3 ring-1 ring-navy/5 shadow-editorial group hover:shadow-elevated transition-shadow"
                    >
                      <img src={a.image} alt="" loading="lazy" className="size-20 md:size-auto md:w-full md:aspect-video object-cover rounded-lg shrink-0 group-hover:opacity-95" />
                      <div className="min-w-0">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-orange mb-1">{a.category}</div>
                        <h4 className="font-hindi text-sm md:text-base text-navy leading-snug line-clamp-3 group-hover:text-orange transition-colors">{a.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>

          <AdBanner
            variant="navy"
            sponsor="Harbole+"
            eyebrow="Membership"
            title="विज्ञापन-मुक्त पढ़ें, गहराई से जुड़ें"
            subtitle="हरबोले+ के सदस्य बनिए — सिर्फ ₹49/माह।"
            cta="Try Free"
            image={IMAGES.amitTripathi}
          />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
