import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/harbole/Header";
import { BottomNav } from "@/components/harbole/BottomNav";
import { ArticleCard } from "@/components/harbole/ArticleCard";
import { CATEGORIES } from "@/lib/harbole-data";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.cat.label} · ${loaderData.cat.english} | हरबोले` },
          { name: "description", content: `${loaderData.cat.english} stories from Bundelkhand on Harbole.` },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center p-8 text-center">
      <Link to="/" className="text-orange">श्रेणी नहीं मिली · Back</Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="min-h-screen grid place-items-center p-8">
      <button onClick={reset} className="text-orange">Retry</button>
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { cat } = Route.useLoaderData();
  const featured = cat.items[0];
  const rest = cat.items.slice(1);

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-[480px] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto bg-paper relative">
        <Header />
        <main className="pb-32 md:pb-16">
          <div className="px-4 pt-3">
            <Link to="/" className="flex items-center gap-1.5 text-navy/60 text-xs font-semibold uppercase tracking-widest">
              <ArrowLeft className="size-4" /> Home
            </Link>
          </div>

          <header className="px-5 md:px-6 pt-6 pb-8 border-b border-navy/10">
            <div className="text-orange text-[10px] font-bold uppercase tracking-[0.35em] mb-2">{cat.english}</div>
            <h1 className="font-hindi text-5xl md:text-7xl font-medium text-navy leading-none">{cat.label}</h1>
            <p className="font-body-hindi text-navy/55 text-sm md:text-base mt-4 max-w-prose">
              {cat.items.length} stories · बुंदेलखंड के हर कोने से ताज़ा रिपोर्ट
            </p>
          </header>

          {featured && (
            <section className="p-4 md:p-6 animate-reveal">
              <Link
                to="/article/$slug"
                params={{ slug: featured.slug }}
                className="block bg-navy rounded-2xl overflow-hidden shadow-elevated group"
              >
                <div className="relative aspect-[4/5] md:aspect-[21/9]">
                  <img src={featured.image} alt={featured.title} loading="lazy" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-navy via-navy/30 to-transparent" />
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-gold text-navy text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded">Lead Story</div>
                  <div className="absolute bottom-0 left-0 right-0 md:right-auto md:max-w-2xl p-6 md:p-10">
                    <h2 className="font-hindi text-2xl md:text-5xl text-paper leading-tight mb-2 md:mb-4 text-balance">{featured.title}</h2>
                    <div className="text-paper/55 text-[10px] md:text-xs uppercase tracking-widest font-semibold">{featured.time}</div>
                  </div>
                </div>
              </Link>
            </section>
          )}

          <section className="px-4 md:px-6 mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {rest.map((a: typeof featured) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
            {/* Filler card */}
            <div className="rounded-2xl border border-dashed border-navy/15 p-8 text-center">
              <div className="text-[10px] font-bold uppercase tracking-widest text-navy/40 mb-2">More stories</div>
              <div className="font-hindi text-lg text-navy/60">जल्द ही प्रकाशित होंगी</div>
            </div>
          </section>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
