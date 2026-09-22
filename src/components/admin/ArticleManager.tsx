import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { EditDrawer } from "@/routes/admin.index";
import {
  adminGetArticlesListFn,
  adminDeleteResourceFn,
  adminToggleArticlePlacementFn,
  adminSaveResourceFn,
} from "@/lib/admin-queries";

export function ArticleManager({ resource }: { resource: any }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await adminGetArticlesListFn();
      setRows(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load articles");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Delete this article completely?")) return;
    try {
      await adminDeleteResourceFn({ data: { table: "articles", id } });
      toast.success("Deleted");
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete article");
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const nextStatus = currentStatus === "published" ? "draft" : "published";
    try {
      await adminSaveResourceFn({
        data: {
          table: "articles",
          id,
          data: {
            id,
            status: nextStatus,
            approval_status: nextStatus === "published" ? "Approved" : "Pending",
            updated_at: new Date().toISOString(),
          },
        },
      });
      toast.success(nextStatus === "published" ? "Article is now LIVE" : "Article set to Draft");
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
    }
  }

  async function togglePlacement(
    table: string,
    articleId: string,
    placementId: string | null,
  ) {
    try {
      const res = await adminToggleArticlePlacementFn({
        data: {
          table,
          articleId,
          placementId,
        },
      });
      if (res.action === "removed") {
        toast.success("Removed from placement");
      } else {
        toast.success("Added to placement");
      }
      load();
    } catch (err: any) {
      toast.error(err.message || "Placement update failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-navy/60">
          {loading ? "Loading…" : `${rows.length} article(s)`}
        </div>
        <button
          onClick={() => setEditing({ id: "", ...resource.defaults })}
          className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-paper hover:bg-navy/90"
        >
          <Plus className="size-4" /> New Article
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-navy/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-navy/5 text-left text-xs uppercase tracking-wider text-navy/60">
            <tr>
              <th className="px-3 py-3 w-16">Image</th>
              <th className="px-3 py-3">Article details</th>
              <th className="px-3 py-3 hidden lg:table-cell">
                Placements & Badges
              </th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const catName = typeof r.category === "string" ? r.category : r.category?.name;
              const distName = typeof r.district === "string" ? r.district : r.district?.name;

              const isHero = !!r.hero?.id;
              const isBreaking = !!r.breaking?.id;
              const isTop10 = !!r.top10?.id;

              const heroId = isHero ? r.hero.id : null;
              const breakingId = isBreaking ? r.breaking.id : null;
              const top10Id = isTop10 ? r.top10.id : null;

              return (
                <tr
                  key={r.id}
                  className="border-t border-navy/5 hover:bg-navy/[0.02]"
                >
                  <td className="px-3 py-3 align-top">
                    <div className="size-12 rounded bg-navy/5 overflow-hidden">
                      {(r.image_url || r.image) && (
                        <img
                          src={r.image_url || r.image}
                          className="w-full h-full object-contain"
                          alt=""
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="font-bold text-navy text-sm line-clamp-2 leading-snug mb-1">
                      {r.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-navy/50">
                      <button
                        type="button"
                        onClick={() => toggleStatus(r.id, r.status)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold transition-all ${
                          r.status === "published"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100"
                        }`}
                        title="Click to toggle between Published (Live) and Draft"
                      >
                        <span className={`size-1.5 rounded-full ${r.status === "published" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {r.status === "published" ? "Live" : "Draft"}
                      </button>
                      <span>•</span>
                      <span>{catName || "Uncategorized"}</span>
                      {distName && <span>• {distName}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top hidden lg:table-cell">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {!isHero && !isBreaking && !isTop10 && (
                        <span className="px-2 py-0.5 rounded-full bg-navy/5 text-navy/60 text-[10px] font-bold uppercase tracking-widest">
                          Category Only
                        </span>
                      )}
                      {isHero && (
                        <span className="px-2 py-0.5 rounded-full bg-orange/10 text-orange-600 text-[10px] font-bold uppercase tracking-widest border border-orange/20">
                          Hero
                        </span>
                      )}
                      {isBreaking && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 text-[10px] font-bold uppercase tracking-widest border border-red-500/20">
                          Breaking
                        </span>
                      )}
                      {isTop10 && (
                        <span className="px-2 py-0.5 rounded-full bg-navy text-white text-[10px] font-bold uppercase tracking-widest">
                          Top 10
                        </span>
                      )}
                    </div>
                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() =>
                          togglePlacement("homepage_hero", r.id, heroId)
                        }
                        className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded border transition-colors ${isHero ? "border-orange text-orange hover:bg-orange/5" : "border-navy/10 text-navy/40 hover:bg-navy/5 hover:text-navy"}`}
                      >
                        {isHero ? "- Hero" : "+ Hero"}
                      </button>
                      <button
                        onClick={() =>
                          togglePlacement("homepage_breaking", r.id, breakingId)
                        }
                        className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded border transition-colors ${isBreaking ? "border-red-500 text-red-600 hover:bg-red-50" : "border-navy/10 text-navy/40 hover:bg-navy/5 hover:text-navy"}`}
                      >
                        {isBreaking ? "- Breaking" : "+ Breaking"}
                      </button>
                      <button
                        onClick={() =>
                          togglePlacement("homepage_top10", r.id, top10Id)
                        }
                        className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded border transition-colors ${isTop10 ? "border-navy text-navy hover:bg-navy/5" : "border-navy/10 text-navy/40 hover:bg-navy/5 hover:text-navy"}`}
                      >
                        {isTop10 ? "- Top 10" : "+ Top 10"}
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right align-top">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditing(r)}
                        className="rounded p-1.5 text-navy/50 hover:bg-navy/5 hover:text-navy"
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button
                        onClick={() => remove(r.id)}
                        className="rounded p-1.5 text-red-600/50 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditDrawer
          resource={resource}
          row={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
