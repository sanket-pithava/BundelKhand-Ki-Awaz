import { Link } from "@tanstack/react-router";

export function ArticleCard({ article, size = "md" }: { article: any; size?: "sm" | "md" | "lg" }) {
  const aspect = size === "lg" ? "aspect-[4/3]" : "aspect-video";
  
  // Handle both dummy data format (image) and Supabase database format (image_url)
  const imageUrl = article.image_url || article.image;
  
  // Handle categories flexibly
  const categoryStr = 
    article.categories?.name || 
    article.category_slug || 
    (typeof article.category === "string" ? article.category : article.category?.name) || 
    "ख़बर";
    
  // Handle time formatting (dummy data uses 'time', db uses 'publish_at' or 'created_at')
  let timeStr = article.time;
  if (!timeStr && (article.publish_at || article.created_at)) {
    timeStr = new Date(article.publish_at || article.created_at).toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  const authorStr = article.profiles?.display_name || article.author;

  return (
    <Link
      to="/article/$slug"
      params={{ slug: article.slug }}
      className="group block bg-white rounded-xl overflow-hidden ring-1 ring-navy/5 shadow-editorial hover:shadow-elevated transition-all"
    >
      <div className={`${aspect} relative overflow-hidden bg-navy/5`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-navy/5 flex items-center justify-center">
             <span className="text-navy/30 font-medium text-xs">No Image</span>
          </div>
        )}
        <span className="absolute top-3 left-3 bg-paper/95 backdrop-blur text-navy text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded shadow-sm">
          {categoryStr}
        </span>
      </div>
      <div className="p-4 flex flex-col justify-between flex-1">
        <h3 className={`font-hindi font-medium leading-snug text-navy text-pretty ${size === "lg" ? "text-xl" : "text-base"}`}>
          {article.title}
        </h3>
        <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-navy/40 font-semibold">
          {timeStr && <span>{timeStr}</span>}
          {authorStr && (
            <>
              <span className="size-1 bg-navy/20 rounded-full" />
              <span>{authorStr}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
