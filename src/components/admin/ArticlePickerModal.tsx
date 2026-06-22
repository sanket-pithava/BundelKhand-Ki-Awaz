import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, X, Loader2, Check } from "lucide-react";

type Article = {
  id: string;
  title: string;
  slug: string;
  image_url: string;
  publish_at: string;
  category: { name: string } | null;
  district: { name: string } | null;
};

type Props = {
  onSelect: (articleId: string) => void;
  onClose: () => void;
  alreadySelectedIds?: string[];
};

export function ArticlePickerModal({
  onSelect,
  onClose,
  alreadySelectedIds = [],
}: Props) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [categoryId, setCategoryId] = useState<string>("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  useEffect(() => {
    (supabase as any)
      .from("categories")
      .select("id, name")
      .then(({ data }: any) => {
        if (data) setCategories(data);
      });
  }, []);

  async function fetchArticles(isNewSearch = false) {
    if (isNewSearch) {
      setLoading(true);
      setPage(0);
    }

    let query = (supabase as any)
      .from("articles")
      .select(
        `
        id, title, slug, image_url, publish_at,
        category:categories(name),
        district:districts(name)
      `,
      )
      .eq("status", "published")
      .order("publish_at", { ascending: false });

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const from = isNewSearch ? 0 : page * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error } = await query;
    if (error) {
      console.error(error);
    } else {
      const formatted =
        data?.map((d: any) => ({
          ...d,
          category: Array.isArray(d.category) ? d.category[0] : d.category,
          district: Array.isArray(d.district) ? d.district[0] : d.district,
        })) || [];

      setArticles((prev) =>
        isNewSearch ? formatted : [...prev, ...formatted],
      );
      setHasMore(formatted.length === limit);
      if (!isNewSearch) setPage((p) => p + 1);
    }
    setLoading(false);
  }

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      fetchArticles(true);
    }, 300);
    return () => clearTimeout(t);
  }, [search, categoryId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4">
      <div className="flex h-full max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-navy/10 px-6 py-4">
          <h2 className="text-xl font-bold text-navy">Select Article</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-navy/50 hover:bg-navy/5 hover:text-navy"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 border-b border-navy/5 bg-navy/[0.02] p-6 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy/40" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-navy/10 py-2.5 pl-10 pr-4 text-sm focus:border-navy focus:outline-none"
            />
          </div>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-xl border border-navy/10 px-4 py-2.5 text-sm focus:border-navy focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Article List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && articles.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="size-8 animate-spin text-navy/20" />
            </div>
          ) : articles.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-navy/40">
              <p>No published articles found.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => {
                const isSelected = alreadySelectedIds.includes(article.id);
                return (
                  <button
                    key={article.id}
                    onClick={() => {
                      if (!isSelected) onSelect(article.id);
                    }}
                    disabled={isSelected}
                    className={`group flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-navy/20 bg-navy/5 opacity-50 cursor-not-allowed"
                        : "border-navy/10 bg-white hover:border-navy/30 hover:shadow-md"
                    }`}
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-navy/5">
                      {article.image_url ? (
                        <img
                          src={article.image_url}
                          alt=""
                          className="h-full w-full object-contain"
                        />
                      ) : null}
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-navy/50 text-white backdrop-blur-[2px]">
                          <Check className="size-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="line-clamp-2 text-sm font-bold text-navy leading-snug">
                        {article.title}
                      </h4>
                      <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-navy/50">
                        <span>{article.category?.name || "Uncategorized"}</span>
                        {article.district?.name && (
                          <>
                            <span>•</span>
                            <span>{article.district.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {hasMore && articles.length > 0 && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => fetchArticles(false)}
                disabled={loading}
                className="rounded-full bg-navy/5 px-6 py-2 text-xs font-bold uppercase tracking-wider text-navy transition-colors hover:bg-navy hover:text-white disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
