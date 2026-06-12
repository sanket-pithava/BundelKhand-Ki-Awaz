import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Bookmark, Share2, Type, Clock } from "lucide-react";
import { Header } from "@/components/harbole/Header";
import { BottomNav } from "@/components/harbole/BottomNav";
import { ALL_ARTICLES, TOP10, IMAGES } from "@/lib/harbole-data";
import { AdBanner } from "@/components/harbole/AdBanner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/article/$slug")({
  loader: async ({ params }) => {
    let article = ALL_ARTICLES[params.slug];
    if (!article) {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', params.slug)
        .single();
      if (!error && data) {
        article = {
          title: data.title,
          category: data.category_slug || 'news',
          slug: data.slug,
          time: data.time_label || 'Recently',
          image: data.image_url || IMAGES.newsGeneric,
          dek: data.excerpt || '',
          content: data.content || '',
          author: data.author_name || 'हरबोले डेस्क'
        } as any;
      }
    }
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.article.title} | हरबोले` },
          { name: "description", content: loaderData.article.dek ?? loaderData.article.title },
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
  const { article } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-[480px] md:max-w-3xl lg:max-w-4xl mx-auto bg-paper relative">
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

            <div className="px-4 md:px-0">
              <img
                src={article.image}
                alt={article.title}
                width={1024}
                height={680}
                className="w-full aspect-[4/3] md:aspect-[21/9] object-cover rounded-2xl shadow-editorial"
              />
              <p className="text-[10px] uppercase tracking-widest text-navy/40 mt-2 px-1">— हरबोले फोटो</p>
            </div>

            <div className="px-6 md:px-0 mt-8 space-y-6 font-body-hindi text-[17px] md:text-lg leading-[1.8] text-navy/85">
              {article.content ? (
                <div dangerouslySetInnerHTML={{ __html: article.content }} className="prose prose-lg prose-navy max-w-none prose-p:mb-6" />
              ) : (
                <>
                  <p className="first-letter:font-hindi first-letter:text-6xl first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-orange">
                    बुंदेलखंड की मिट्टी हमेशा से कहानियाँ बुनती आई है — कभी सूखे की, कभी संघर्ष की, और अब उम्मीद की भी। महोबा ज़िले के एक छोटे से गांव से उठी यह लहर अब पूरे क्षेत्र में एक नया संदेश दे रही है।
                  </p>
                  <p>
                    जब बारिश का पानी पहाड़ों से उतरकर खेतों तक पहुँचने से पहले ही गायब हो जाता था, तब गांव की महिलाओं ने पुरानी पारंपरिक तकनीकों को फिर से ज़िंदा करने का बीड़ा उठाया। पत्थर के बांध, मिट्टी के तालाब और कुओं की मरम्मत — यह सब उन्हीं हाथों ने किया जिन्हें कभी असहाय माना जाता था।
                  </p>
                  <blockquote className="border-l-4 border-orange pl-5 py-2 font-hindi text-2xl text-navy leading-tight">
                    "हमने पानी को रोका, और पानी ने हमें थाम लिया।"
                  </blockquote>
                  <p>
                    आज इस गांव में सरसों लहलहा रही है, खेतों में चहल-पहल है, और सबसे ज़रूरी — पलायन रुका है। यह कहानी सिर्फ एक गांव की नहीं, बुंदेलखंड के भविष्य की है।
                  </p>
                </>
              )}
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

          <section className="mt-6 px-4 md:px-0">
            <div className="text-orange text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Continue Reading</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
              {TOP10.slice(0, 3).map((a) => (
                <Link
                  key={a.slug}
                  to="/article/$slug"
                  params={{ slug: a.slug }}
                  className="flex md:flex-col gap-3 bg-white rounded-xl p-3 ring-1 ring-navy/5 shadow-editorial"
                >
                  <img src={a.image} alt="" loading="lazy" className="size-20 md:size-auto md:w-full md:aspect-video object-cover rounded-lg shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-orange mb-1">{a.category}</div>
                    <h4 className="font-hindi text-sm md:text-base text-navy leading-snug line-clamp-3">{a.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
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
