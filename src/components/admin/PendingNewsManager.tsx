import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, ExternalLink, RefreshCcw } from "lucide-react";

export function PendingNewsManager({ resourceKey }: { resourceKey?: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select(
        `
        *,
        category:categories(name),
        reporter:reporters(name)
      `,
      )
      .eq("approval_status", "Pending")
      .order("created_at", { ascending: false });

    if (error) toast.error(error.message);
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAction(id: string, action: "Approved" | "Rejected") {
    if (
      !confirm(`Are you sure you want to ${action.toLowerCase()} this article?`)
    )
      return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      const approvedBy = userData.user?.id;

      const payload: any = {
        approval_status: action,
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      };

      if (action === "Approved") {
        payload.status = "published";
      } else {
        payload.status = "draft"; // Ensure it stays hidden
      }

      const { error } = await supabase
        .from("articles")
        .update(payload)
        .eq("id", id);
      if (error) throw error;

      toast.success(`Article ${action}`);
      load(); // refresh
    } catch (e: any) {
      toast.error(e.message || "Action failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-navy/60">
          {loading ? "Loading…" : `${rows.length} pending article(s)`}
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-navy/15 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-navy/5"
        >
          <RefreshCcw className="size-3.5" /> Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-navy/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-navy/5 text-left text-xs uppercase tracking-wider text-navy/60">
            <tr>
              <th className="px-3 py-3">Article Title</th>
              <th className="px-3 py-3">Reporter</th>
              <th className="px-3 py-3 hidden md:table-cell">Category</th>
              <th className="px-3 py-3 hidden lg:table-cell">Submitted</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const catName = Array.isArray(r.category)
                ? r.category[0]?.name
                : r.category?.name;
              const repName = Array.isArray(r.reporter)
                ? r.reporter[0]?.name
                : r.reporter?.name;

              return (
                <tr key={r.id} className="border-t border-navy/5">
                  <td
                    className="px-3 py-3 font-medium text-navy max-w-xs truncate"
                    title={r.title}
                  >
                    {r.title}
                  </td>
                  <td className="px-3 py-3">{repName || "Unknown Reporter"}</td>
                  <td className="px-3 py-3 text-xs text-navy/60 hidden md:table-cell">
                    {catName || "Uncategorized"}
                  </td>
                  <td className="px-3 py-3 text-xs text-navy/60 hidden lg:table-cell">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <a
                        href={`/article/${r.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded bg-navy/5 px-2 py-1 text-[10px] font-bold text-navy hover:bg-navy/10 uppercase tracking-wider"
                      >
                        <ExternalLink className="size-3" /> View
                      </a>
                      <button
                        onClick={() => handleAction(r.id, "Approved")}
                        className="flex items-center gap-1 rounded bg-green-500/10 px-2 py-1 text-[10px] font-bold text-green-700 hover:bg-green-500/20 uppercase tracking-wider"
                      >
                        <Check className="size-3" /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(r.id, "Rejected")}
                        className="flex items-center gap-1 rounded bg-red-500/10 px-2 py-1 text-[10px] font-bold text-red-700 hover:bg-red-500/20 uppercase tracking-wider"
                      >
                        <X className="size-3" /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-navy/50">
                  All caught up! No pending articles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
