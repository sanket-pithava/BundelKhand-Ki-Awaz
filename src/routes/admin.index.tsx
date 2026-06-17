import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/admin/upload";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Save, X, Upload } from "lucide-react";
import { PlacementManager } from "@/components/admin/PlacementManager";
import { ArticleManager } from "@/components/admin/ArticleManager";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

type FieldType = "text" | "textarea" | "richtext" | "image" | "bool" | "number" | "select" | "multiselect" | "select_district" | "select_sub_district" | "select_category" | "select_article" | "datetime";
type Field = { key: string; label: string; type: FieldType; options?: any[]; placeholder?: string };

type Resource = {
  key: string;
  label: string;
  table: string;
  orderBy: string;
  ascending?: boolean;
  fields: Field[];
  defaults: Record<string, unknown>;
  selectQuery?: string;
};

const RESOURCES: Resource[] = [
  {
    key: "articles",
    label: "Articles",
    table: "articles",
    orderBy: "created_at",
    ascending: false,
    defaults: { status: "published", is_impact: false, sort_order: 0 },
    fields: [
      { key: "title", label: "Title (Hindi)", type: "text" },
      { key: "slug", label: "Slug (unique, english)", type: "text", placeholder: "ken-betwa-2026" },
      { key: "dek", label: "Subheadline / Dek", type: "textarea" },
      { key: "excerpt", label: "Excerpt (short text for lists)", type: "textarea" },
      { key: "body", label: "Body (full article)", type: "richtext" },
      { key: "district_id", label: "District (Jila)", type: "select_district" },
      { key: "sub_district_id", label: "Sub-District (Tehsil/Area)", type: "select_sub_district" },
      { key: "category_id", label: "Category", type: "select_category" },
      { key: "tags", label: "Tags (comma separated)", type: "text" },
      { key: "image_url", label: "Cover Image", type: "image" },
      { key: "video_url", label: "Video URL (optional)", type: "text" },
      { key: "is_trending", label: "Trending Article", type: "bool" },
      { key: "is_impact", label: "Add to Impact Series", type: "bool" },
      { key: "status", label: "Status", type: "select", options: ["published", "draft", "archived"] },
      { key: "publish_at", label: "Publish Date (leave blank for now)", type: "datetime" },
      { key: "sort_order", label: "Sort", type: "number" },
    ],
  },
  {
    key: "hero",
    label: "Hero Banner",
    table: "homepage_hero",
    orderBy: "sort_order",
    ascending: true,
    selectQuery: "*, article:articles(title)",
    defaults: { sort_order: 0 },
    fields: [
      { key: "article_id", label: "Select Article", type: "select_article" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },
  {
    key: "breaking",
    label: "Breaking News",
    table: "homepage_breaking",
    orderBy: "sort_order",
    ascending: true,
    selectQuery: "*, article:articles(title)",
    defaults: { sort_order: 0 },
    fields: [
      { key: "article_id", label: "Select Article", type: "select_article" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },
  {
    key: "top10",
    label: "Bundelkhand Top 10",
    table: "homepage_top10",
    orderBy: "sort_order",
    ascending: true,
    selectQuery: "*, article:articles(title)",
    defaults: { sort_order: 0 },
    fields: [
      { key: "article_id", label: "Select Article", type: "select_article" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },
  {
    key: "homepage_sections",
    label: "Homepage Sections",
    table: "homepage_sections",
    orderBy: "sort_order",
    ascending: true,
    defaults: { status: true, sort_order: 0, article_limit: 5 },
    fields: [
      { key: "title_hindi", label: "Section Title (Hindi)", type: "text" },
      { key: "title_english", label: "Section Title (English)", type: "text" },
      { key: "category_id", label: "Linked Category", type: "select_category" },
      { key: "article_limit", label: "Number of Articles to Show", type: "number" },
      { key: "status", label: "Active", type: "bool" },
      { key: "sort_order", label: "Display Order", type: "number" },
    ],
  },
  {
    key: "shakhsiyat",
    label: "Shakhsiyat",
    table: "shakhsiyat",
    orderBy: "sort_order",
    ascending: true,
    defaults: { sort_order: 0, status: true },
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "designation", label: "Designation", type: "text" },
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "image", label: "Profile Image", type: "image" },
      { key: "description", label: "Description (optional)", type: "textarea" },
      { key: "sort_order", label: "Sort Order", type: "number" },
      { key: "status", label: "Active Status", type: "bool" },
    ],
  },
  {
    key: "reels",
    label: "Bundeli Reels",
    table: "reels",
    orderBy: "sort_order",
    ascending: true,
    defaults: { is_active: true, sort_order: 0, platform: "YouTube Shorts" },
    fields: [
      { key: "title", label: "Reel Title", type: "text" },
      {
        key: "platform",
        label: "Platform Type",
        type: "select",
        options: [
          { label: "YouTube Shorts", value: "YouTube Shorts" },
          { label: "Instagram Reels", value: "Instagram Reels" },
          { label: "Facebook Reels", value: "Facebook Reels" },
          { label: "Self Hosted", value: "Self Hosted" },
        ],
      },
      { key: "video_url", label: "Video URL", type: "text", placeholder: "https://youtube.com/shorts/..." },
      { key: "image_url", label: "Thumbnail Override (Optional, auto-extracted for YT)", type: "text" },
      { key: "views", label: "View Count (Manual)", type: "text", placeholder: "1.2M Views" },
      { key: "duration", label: "Duration (Optional)", type: "text", placeholder: "0:59" },
      { key: "sort_order", label: "Sort Order", type: "number" },
      { key: "is_active", label: "Active Status", type: "bool" },
    ],
  },
  {
    key: "shows",
    label: "The Amit Tripathi Show",
    table: "show_episodes",
    orderBy: "sort_order",
    ascending: true,
    defaults: { sort_order: 0, is_featured: false, status: true, season_number: 1 },
    fields: [
      { key: "title", label: "Episode Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "season_number", label: "Season Number", type: "number" },
      { key: "episode_number", label: "Episode Number", type: "number" },
      { key: "youtube_url", label: "YouTube URL", type: "text", placeholder: "https://youtu.be/..." },
      { key: "description", label: "Description", type: "textarea" },
      { key: "schedule", label: "Display Duration/Schedule", type: "text", placeholder: "48 मिनट" },
      { key: "publish_at", label: "Publish Date (Leave blank for now)", type: "text", placeholder: "YYYY-MM-DD HH:MM" },
      { key: "is_featured", label: "Featured Episode", type: "bool" },
      { key: "sort_order", label: "Sort Order", type: "number" },
      { key: "status", label: "Published Status", type: "bool" },
    ],
  },
  {
    key: "impact",
    label: "Impact Series",
    table: "impact_items",
    orderBy: "sort_order",
    ascending: true,
    defaults: { is_done: false, sort_order: 0, color: "bg-orange/15 text-orange ring-orange/30" },
    fields: [
      { key: "tag", label: "Tag (समस्या/रिपोर्ट/कार्रवाई/समाधान)", type: "text" },
      { key: "title", label: "Title", type: "textarea" },
      { key: "image_url", label: "Image", type: "image" },
      { key: "color", label: "Tailwind color classes", type: "text" },
      { key: "is_done", label: "Solved", type: "bool" },
      { key: "sort_order", label: "Sort", type: "number" },
    ],
  },
  {
    key: "ads",
    label: "Ads",
    table: "ads",
    orderBy: "sort_order",
    ascending: true,
    defaults: { variant: "gold", placement: "home", is_active: true, sort_order: 0, eyebrow: "Sponsored", cta: "Learn More" },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "cta", label: "CTA Label", type: "text" },
      { key: "sponsor", label: "Sponsor", type: "text" },
      { key: "variant", label: "Variant", type: "select", options: ["gold","navy","orange","paper"] },
      { key: "placement", label: "Placement", type: "select", options: ["home","article","category"] },
      { key: "image_url", label: "Image", type: "image" },
      { key: "is_active", label: "Active", type: "bool" },
      { key: "sort_order", label: "Sort", type: "number" },
    ],
  },
  {
    key: "ticker",
    label: "News Ticker",
    table: "ticker_items",
    orderBy: "sort_order",
    ascending: true,
    defaults: { is_active: true, sort_order: 0 },
    fields: [
      { key: "text", label: "Headline text", type: "text" },
      { key: "is_active", label: "Active", type: "bool" },
      { key: "sort_order", label: "Sort", type: "number" },
    ],
  },
  {
    key: "categories",
    label: "Categories",
    table: "categories",
    orderBy: "sort_order",
    ascending: true,
    defaults: { status: true, sort_order: 0 },
    fields: [
      { key: "name", label: "Category Name", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
      { key: "icon", label: "Icon URL", type: "image" },
      { key: "status", label: "Active", type: "bool" },
      { key: "sort_order", label: "Sort", type: "number" },
    ],
  },
  {
    key: "districts",
    label: "Districts",
    table: "districts",
    orderBy: "sort_order",
    ascending: true,
    defaults: { status: true, sort_order: 0 },
    fields: [
      { key: "name", label: "District name (Hindi)", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
      { key: "image_url", label: "Image", type: "image" },
      { key: "status", label: "Active", type: "bool" },
      { key: "sort_order", label: "Sort", type: "number" },
      { key: "_categories", label: "Assigned Categories", type: "multiselect" },
    ],
  },
  {
    key: "sub_districts",
    label: "Sub-Districts",
    table: "sub_districts",
    orderBy: "created_at",
    ascending: false,
    defaults: { status: true },
    fields: [
      { key: "name", label: "Sub-District Name", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
      { key: "jila_id", label: "Parent District (Jila)", type: "select_district" },
      { key: "status", label: "Active", type: "bool" },
    ],
  },
];

function AdminHome() {
  const [tab, setTab] = useState(RESOURCES[0].key);
  const resource = useMemo(() => RESOURCES.find((r) => r.key === tab)!, [tab]);
  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[80vh]">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 shrink-0 space-y-8">
        <header className="px-2">
          <h1 className="text-2xl font-bold text-navy">CMS Dashboard</h1>
          <p className="text-xs text-navy/60 mt-1">Manage every section of Harbole</p>
        </header>

        <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible no-scrollbar pb-2">
          {RESOURCES.map((r) => (
            <button
              key={r.key}
              onClick={() => setTab(r.key)}
              className={`text-left shrink-0 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                tab === r.key
                  ? "bg-navy text-paper shadow-md ring-1 ring-navy/10"
                  : "bg-transparent text-navy/60 hover:bg-navy/5 hover:text-navy"
              }`}
            >
              {r.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-navy/5">
        <div className="mb-6 pb-6 border-b border-navy/5">
          <h2 className="text-xl font-bold text-navy">{resource.label} Management</h2>
          <p className="text-sm text-navy/50 mt-1">Add, edit, or remove {resource.label.toLowerCase()} entries displayed on the platform.</p>
        </div>
        {resource.key === "articles" ? (
          <ArticleManager key={resource.key} resource={resource} />
        ) : resource.key === "hero" || resource.key === "breaking" || resource.key === "top10" ? (
          <PlacementManager key={resource.key} resource={resource} />
        ) : (
          <ResourceManager key={resource.key} resource={resource} />
        )}
      </main>
    </div>
  );
}

type Row = Record<string, unknown> & { id: string };

function ResourceManager({ resource }: { resource: Resource }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from(resource.table)
      .select(resource.selectQuery || "*")
      .order(resource.orderBy, { ascending: resource.ascending ?? false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [resource.table]);

  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    const { error } = await (supabase as any).from(resource.table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  function startCreate() {
    setEditing({ id: "", ...resource.defaults } as Row);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-navy/60">{loading ? "Loading…" : `${rows.length} item(s)`}</div>
        <button onClick={startCreate} className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-paper">
          <Plus className="size-4" /> New {resource.label.replace(/s$/, "")}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-navy/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-navy/5 text-left text-xs uppercase tracking-wider text-navy/60">
            <tr>
              <th className="px-3 py-2 w-16">Image</th>
              <th className="px-3 py-2">Title / Name</th>
              <th className="px-3 py-2 hidden md:table-cell">Meta</th>
              <th className="px-3 py-2 w-32 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const img = (r.image_url as string) || "";
              const title = (r.title as string) || (r.article as any)?.title || (r.name as string) || (r.text as string) || "(untitled)";
              const meta = [r.status, r.placement, r.variant, r.tag].filter(Boolean).join(" · ");
              return (
                <tr key={r.id} className="border-t border-navy/5">
                  <td className="px-3 py-2">
                    {img ? <img src={img} alt="" className="size-10 rounded object-cover" /> : <div className="size-10 rounded bg-navy/5" />}
                  </td>
                  <td className="px-3 py-2 font-medium">
                    {title}
                    {r.is_breaking ? <span className="ml-2 rounded bg-orange px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">Breaking</span> : null}
                    {r.is_featured ? <span className="ml-2 rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold text-navy uppercase">Hero</span> : null}
                    {r.is_top10 ? <span className="ml-2 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">Top 10</span> : null}
                    {r.is_impact ? <span className="ml-2 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">Impact</span> : null}
                  </td>
                  <td className="px-3 py-2 text-xs text-navy/60 hidden md:table-cell">{meta}</td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => setEditing(r)} className="rounded px-2 py-1 text-xs font-semibold text-navy hover:bg-navy/5">Edit</button>
                    <button onClick={() => remove(r.id)} className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
                      <Trash2 className="size-3.5 inline" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-10 text-center text-navy/50">No items yet. Click "New" to add one.</td></tr>
            )}
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

export function EditDrawer({ resource, row, onClose, onSaved }: { resource: Resource; row: Row; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Row>(row);
  const [busy, setBusy] = useState(false);
  const isNew = !form.id;
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [districts, setDistricts] = useState<{id: string, name: string}[]>([]);
  const [subDistricts, setSubDistricts] = useState<{id: string, name: string}[]>([]);
  const [articles, setArticles] = useState<{id: string, title: string}[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (resource.fields.some(f => f.type === "select_article")) {
      (supabase as any).from("articles").select("id, title").eq("status", "published").order("publish_at", { ascending: false }).limit(200).then(({data}: any) => {
         if(data) setArticles(data);
      });
    }
    if (resource.fields.some(f => f.type === "multiselect" || f.type === "select_category")) {
      (supabase as any).from("categories").select("id, name").then(({data}: any) => {
         if(data) setCategories(data);
      });
    }
    if (resource.fields.some(f => f.type === "select_district")) {
      (supabase as any).from("districts").select("id, name").then(({data}: any) => {
         if(data) setDistricts(data);
      });
    }

    if (resource.fields.some(f => f.type === "multiselect" && f.key === "_categories")) {
      if (!isNew) {
         (supabase as any).from("district_categories").select("category_id").eq("district_id", form.id).then(({data}: any) => {
            if(data) setSelectedCategories(data.map((d: any) => d.category_id));
         });
      }
    }
  }, [resource, form.id, isNew]);

  useEffect(() => {
    const jilaId = form.district_id || form.jila_id;
    if (jilaId) {
      (supabase as any).from("sub_districts").select("id, name").eq("jila_id", jilaId).eq("status", true).then(({data}: any) => {
         if(data) setSubDistricts(data);
      });
    } else {
      setSubDistricts([]);
      if (form.sub_district_id) setForm((f) => ({ ...f, sub_district_id: null }));
    }
  }, [form.district_id, form.jila_id]);

  function set<K extends string>(k: K, v: unknown) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setBusy(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const f of resource.fields) {
        if (f.type !== "multiselect") {
          let val = form[f.key];
          if (f.type === "bool") val = !!val;
          payload[f.key] = val ?? null;
        }
      }
      
      let savedId = form.id;
      if (isNew) {
        // Fallback for old required columns that we removed from UI but might still be NOT NULL in DB
        if (resource.table === "articles") {
           payload.category = payload.category || "Uncategorized";
           payload.category_slug = payload.category_slug || "uncategorized";
        }
        const { data, error } = await (supabase as any).from(resource.table).insert(payload).select("id").single();
        if (error) throw error;
        savedId = data.id;
        toast.success("Created");
      } else {
        const { error } = await (supabase as any).from(resource.table).update(payload).eq("id", form.id);
        if (error) throw error;
        toast.success("Saved");
      }

      if (resource.fields.some(f => f.type === "multiselect" && f.key === "_categories")) {
         await (supabase as any).from("district_categories").delete().eq("district_id", savedId);
         if (selectedCategories.length > 0) {
            await (supabase as any).from("district_categories").insert(
               selectedCategories.map(cid => ({ district_id: savedId, category_id: cid }))
            );
         }
      }
      onSaved();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload(field: string, file: File) {
    try {
      const url = await uploadMedia(file, resource.table);
      set(field, url);
      toast.success("Uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{isNew ? "Create" : "Edit"} {resource.label.replace(/s$/, "")}</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-navy/5"><X className="size-4" /></button>
        </div>
        <div className="space-y-4">
          {resource.fields.map((f) => {
            const v = form[f.key];
            const id = `f-${f.key}`;
            if (f.type === "textarea") {
              return (
                <div key={f.key}>
                  <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-navy/60">{f.label}</label>
                  <textarea id={id} value={(v as string) ?? ""} onChange={(e) => set(f.key, e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm" placeholder={f.placeholder} />
                </div>
              );
            }
            if (f.type === "richtext") {
              return (
                <div key={f.key} className="col-span-full">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy/60 mb-1">{f.label}</label>
                  <RichTextEditor value={(v as string) ?? ""} onChange={(val) => set(f.key, val)} />
                </div>
              );
            }
            if (f.type === "bool") {
              return (
                <label key={f.key} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!v} onChange={(e) => set(f.key, e.target.checked)} /> {f.label}
                </label>
              );
            }
            if (f.type === "number") {
              return (
                <div key={f.key}>
                  <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-navy/60">{f.label}</label>
                  <input id={id} type="number" value={(v as number) ?? 0} onChange={(e) => set(f.key, Number(e.target.value))} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm" />
                </div>
              );
            }
            if (f.type === "select") {
              return (
                <div key={f.key}>
                  <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-navy/60">{f.label}</label>
                  <select id={id} value={(v as string) ?? ""} onChange={(e) => set(f.key, e.target.value)} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm">
                    {f.options?.map((o: any) => {
                      const val = typeof o === "object" ? o.value : o;
                      const label = typeof o === "object" ? o.label : o;
                      return <option key={val} value={val}>{label}</option>;
                    })}
                  </select>
                </div>
              );
            }
            if (f.type === "select_category") {
              return (
                <div key={f.key}>
                  <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-navy/60">{f.label}</label>
                  <select id={id} value={(v as string) ?? ""} onChange={(e) => set(f.key, e.target.value || null)} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm">
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              );
            }
            if (f.type === "select_article") {
              return (
                <div key={f.key}>
                  <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-navy/60">{f.label}</label>
                  <select id={id} value={(v as string) ?? ""} onChange={(e) => set(f.key, e.target.value || null)} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm">
                    <option value="">-- Select Article --</option>
                    {articles.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
                  </select>
                </div>
              );
            }
            if (f.type === "select_district") {
              return (
                <div key={f.key}>
                  <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-navy/60">{f.label}</label>
                  <select id={id} value={(v as string) ?? ""} onChange={(e) => set(f.key, e.target.value || null)} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm">
                    <option value="">-- Select District --</option>
                    {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              );
            }
            if (f.type === "select_sub_district") {
              const hasJila = !!form.district_id;
              return (
                <div key={f.key}>
                  <label htmlFor={id} className={`block text-xs font-semibold uppercase tracking-wider ${hasJila ? 'text-navy/60' : 'text-navy/30'}`}>{f.label}</label>
                  <select id={id} value={(v as string) ?? ""} onChange={(e) => set(f.key, e.target.value || null)} disabled={!hasJila} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm disabled:bg-navy/5 disabled:text-navy/40">
                    <option value="">-- Select Sub-District (Optional) --</option>
                    {subDistricts.map((sd) => <option key={sd.id} value={sd.id}>{sd.name}</option>)}
                  </select>
                  {!hasJila && <p className="text-[10px] text-navy/40 mt-1">Please select a District (Jila) first.</p>}
                </div>
              );
            }
            if (f.type === "datetime") {
              return (
                <div key={f.key}>
                  <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-navy/60">{f.label}</label>
                  <input id={id} type="datetime-local" value={(v as string)?.slice(0,16) ?? ""} onChange={(e) => set(f.key, e.target.value ? new Date(e.target.value).toISOString() : null)} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm" />
                </div>
              );
            }
            if (f.type === "image") {
              return (
                <div key={f.key}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy/60">{f.label}</label>
                  <div className="mt-1 flex items-center gap-3">
                    {v ? <img src={v as string} alt="" className="size-16 rounded object-cover" /> : <div className="size-16 rounded bg-navy/5" />}
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-navy/15 px-3 py-2 text-sm hover:bg-navy/5">
                      <Upload className="size-4" /> Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f0 = e.target.files?.[0]; if (f0) handleUpload(f.key, f0); }} />
                    </label>
                  </div>
                  <input value={(v as string) ?? ""} onChange={(e) => set(f.key, e.target.value)} placeholder="or paste image URL" className="mt-2 w-full rounded-lg border border-navy/15 px-3 py-2 text-xs" />
                </div>
              );
            }
            if (f.type === "multiselect" && f.key === "_categories") {
              return (
                <div key={f.key}>
                   <label className="block text-xs font-semibold uppercase tracking-wider text-navy/60">{f.label}</label>
                   <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border border-navy/15 p-3 rounded-lg bg-paper">
                     {categories.map(c => (
                        <label key={c.id} className="flex items-center gap-2 text-sm">
                           <input type="checkbox" checked={selectedCategories.includes(c.id)} onChange={(e) => {
                               if (e.target.checked) setSelectedCategories([...selectedCategories, c.id]);
                               else setSelectedCategories(selectedCategories.filter(id => id !== c.id));
                           }} /> {c.name}
                        </label>
                     ))}
                     {categories.length === 0 && <p className="text-xs text-navy/50">No categories found. Create categories first.</p>}
                   </div>
                </div>
              );
            }
            return (
              <div key={f.key}>
                <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-navy/60">{f.label}</label>
                <input id={id} value={(v as string) ?? ""} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm" />
              </div>
            );
          })}
        </div>
        <div className="sticky bottom-0 mt-6 flex gap-2 border-t border-navy/10 bg-white pt-4">
          <button onClick={save} disabled={busy} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-navy py-2.5 text-sm font-semibold text-paper disabled:opacity-50">
            <Save className="size-4" /> {busy ? "Saving…" : "Save"}
          </button>
          <button onClick={onClose} className="rounded-lg border border-navy/15 px-4 py-2.5 text-sm">Cancel</button>
        </div>
      </div>
    </div>
  );
}
