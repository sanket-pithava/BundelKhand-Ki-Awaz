import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { ArticlePickerModal } from "./ArticlePickerModal";
import {
  adminGetPlacementsFn,
  adminAddPlacementFn,
  adminDeleteResourceFn,
} from "@/lib/admin-queries";

export function PlacementManager({ resource }: { resource: any }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await adminGetPlacementsFn({ data: { table: resource.table } });
      setRows(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load placements");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [resource.table]);

  async function remove(id: string) {
    if (!confirm("Remove this article from " + resource.label + "?")) return;
    try {
      await adminDeleteResourceFn({ data: { table: resource.table, id } });
      toast.success("Removed");
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove");
    }
  }

  async function addArticle(articleId: string) {
    try {
      await adminAddPlacementFn({ data: { table: resource.table, articleId } });
      toast.success("Added to " + resource.label);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to add article");
    }
    setPickerOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-navy/60">
          {loading
            ? "Loading…"
            : `${rows.length} article(s) in ${resource.label}`}
        </div>
        <button
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-paper hover:bg-navy/90 transition-colors"
        >
          <Plus className="size-4" /> Add Article
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-navy/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-navy/5 text-left text-xs uppercase tracking-wider text-navy/60">
            <tr>
              <th className="px-3 py-3 w-16 text-center">Order</th>
              <th className="px-3 py-3 w-16">Image</th>
              <th className="px-3 py-3">Article Title</th>
              <th className="px-3 py-3 w-32 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const article = r.article;
              const catName = typeof article?.category === "string" ? article?.category : article?.category?.name;

              return (
                <tr key={r.id} className="border-t border-navy/5 group">
                  <td className="px-3 py-3 text-center text-navy/40 font-mono text-xs">
                    {r.sort_order}
                  </td>
                  <td className="px-3 py-3">
                    <div className="size-10 rounded bg-navy/5 overflow-hidden">
                      {article?.image_url && (
                        <img
                          src={article.image_url}
                          className="w-full h-full object-contain"
                          alt=""
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-semibold text-navy line-clamp-1">
                      {article?.title || "Unknown Article"}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-navy/50 mt-0.5">
                      {catName || "Uncategorized"}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      onClick={() => remove(r.id)}
                      className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="size-3.5 inline mr-1" /> Remove
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-10 text-center text-navy/50">
                  No articles assigned to {resource.label} yet. Click "Add
                  Article" to assign one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pickerOpen && (
        <ArticlePickerModal
          onClose={() => setPickerOpen(false)}
          onSelect={addArticle}
          alreadySelectedIds={rows.map((r) => r.article_id)}
        />
      )}
    </div>
  );
}
