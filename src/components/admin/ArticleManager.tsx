import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Check, ExternalLink } from "lucide-react";
import { EditDrawer } from "@/routes/admin.index"; // We'll export EditDrawer from admin.index.tsx

export function ArticleManager({ resource }: { resource: any }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("articles")
      .select(`
        *,
        category:categories(name),
        district:districts(name),
        hero:homepage_hero(id),
        breaking:homepage_breaking(id),
        top10:homepage_top10(id)
      `)
      .order("created_at", { ascending: false });

    if (error) toast.error(error.message);
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this article completely?")) return;
    const { error } = await (supabase as any).from("articles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  async function togglePlacement(table: string, articleId: string, placementId: string | null) {
    if (placementId) {
      // Remove
      const { error } = await (supabase as any).from(table).delete().eq("id", placementId);
      if (error) toast.error(error.message);
      else toast.success("Removed from placement");
    } else {
      // Add
      const { data: minData } = await (supabase as any).from(table).select("sort_order").order("sort_order", { ascending: true }).limit(1);
      const minSort = minData?.[0]?.sort_order ?? 0;
      const { error } = await (supabase as any).from(table).insert({ article_id: articleId, sort_order: minSort - 1 });
      if (error) toast.error(error.message);
      else toast.success("Added to placement");
    }
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-navy/60">{loading ? "Loading…" : `${rows.length} article(s)`}</div>
        <button onClick={() => setEditing({ id: "", ...resource.defaults })} className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-paper hover:bg-navy/90">
          <Plus className="size-4" /> New Article
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-navy/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-navy/5 text-left text-xs uppercase tracking-wider text-navy/60">
            <tr>
              <th className="px-3 py-3 w-16">Image</th>
              <th className="px-3 py-3">Article details</th>
              <th className="px-3 py-3 hidden lg:table-cell">Placements & Badges</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const catName = Array.isArray(r.category) ? r.category[0]?.name : r.category?.name;
              const distName = Array.isArray(r.district) ? r.district[0]?.name : r.district?.name;
              
              const isHero = r.hero && r.hero.length > 0;
              const isBreaking = r.breaking && r.breaking.length > 0;
              const isTop10 = r.top10 && r.top10.length > 0;
              
              const heroId = isHero ? r.hero[0].id : null;
              const breakingId = isBreaking ? r.breaking[0].id : null;
              const top10Id = isTop10 ? r.top10[0].id : null;

              return (
                <tr key={r.id} className="border-t border-navy/5 hover:bg-navy/[0.02]">
                  <td className="px-3 py-3 align-top">
                    <div className="size-12 rounded bg-navy/5 overflow-hidden">
                      {r.image_url && <img src={r.image_url} className="w-full h-full object-cover" alt="" />}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="font-bold text-navy text-sm line-clamp-2 leading-snug mb-1">{r.title}</div>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-navy/50">
                      <span className={r.status === 'published' ? 'text-green-600' : 'text-orange-500'}>
                        {r.status}
                      </span>
                      <span>•</span>
                      <span>{catName || "Uncategorized"}</span>
                      {distName && <span>• {distName}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top hidden lg:table-cell">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                       {!isHero && !isBreaking && !isTop10 && <span className="px-2 py-0.5 rounded-full bg-navy/5 text-navy/60 text-[10px] font-bold uppercase tracking-widest">Category Only</span>}
                       {isHero && <span className="px-2 py-0.5 rounded-full bg-orange/10 text-orange-600 text-[10px] font-bold uppercase tracking-widest border border-orange/20">Hero</span>}
                       {isBreaking && <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 text-[10px] font-bold uppercase tracking-widest border border-red-500/20">Breaking</span>}
                       {isTop10 && <span className="px-2 py-0.5 rounded-full bg-navy text-white text-[10px] font-bold uppercase tracking-widest">Top 10</span>}
                    </div>
                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-1.5">
                      <button onClick={() => togglePlacement("homepage_hero", r.id, heroId)} className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded border transition-colors ${isHero ? "border-orange text-orange hover:bg-orange/5" : "border-navy/10 text-navy/40 hover:bg-navy/5 hover:text-navy"}`}>
                        {isHero ? "- Hero" : "+ Hero"}
                      </button>
                      <button onClick={() => togglePlacement("homepage_breaking", r.id, breakingId)} className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded border transition-colors ${isBreaking ? "border-red-500 text-red-600 hover:bg-red-50" : "border-navy/10 text-navy/40 hover:bg-navy/5 hover:text-navy"}`}>
                        {isBreaking ? "- Breaking" : "+ Breaking"}
                      </button>
                      <button onClick={() => togglePlacement("homepage_top10", r.id, top10Id)} className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded border transition-colors ${isTop10 ? "border-navy text-navy hover:bg-navy/5" : "border-navy/10 text-navy/40 hover:bg-navy/5 hover:text-navy"}`}>
                        {isTop10 ? "- Top 10" : "+ Top 10"}
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right align-top">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setEditing(r)} className="rounded p-1.5 text-navy/50 hover:bg-navy/5 hover:text-navy">
                        <Edit2 className="size-4" />
                      </button>
                      <button onClick={() => remove(r.id)} className="rounded p-1.5 text-red-600/50 hover:bg-red-50 hover:text-red-600">
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
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}
