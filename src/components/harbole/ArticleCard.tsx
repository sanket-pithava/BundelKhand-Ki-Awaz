import { Link } from "@tanstack/react-router";
import type { Article } from "@/lib/harbole-data";

export function ArticleCard({ article, size = "md" }: { article: Article; size?: "sm" | "md" | "lg" }) {
  const aspect = size === "lg" ? "aspect-[4/3]" : "aspect-video";
  return (
    <Link
      to="/article/$slug"
      params={{ slug: article.slug }}
      className="group block bg-white rounded-xl overflow-hidden ring-1 ring-navy/5 shadow-editorial hover:shadow-elevated transition-all"
    >
      <div className={`${aspect} relative overflow-hidden bg-navy/5`}>
        <img
          src={article.image || undefined}
          alt={article.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
        />
        <span className="absolute top-3 left-3 bg-paper/95 backdrop-blur text-navy text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded">
          {typeof article.category === "string" ? article.category : (article.category as any)?.name}
        </span>
      </div>
      <div className="p-4">
        <h3 className={`font-hindi font-medium leading-snug text-navy text-pretty ${size === "lg" ? "text-xl" : "text-base"}`}>
          {article.title}
        </h3>
        <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-navy/40 font-semibold">
          <span>{article.time}</span>
          {article.author && (
            <>
              <span className="size-1 bg-navy/20 rounded-full" />
              <span>{article.author}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
