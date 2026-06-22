import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus,
  Check,
  Clock,
  XCircle,
  LayoutDashboard,
  FileText,
} from "lucide-react";
import { useAdminAuth } from "@/lib/admin/use-admin-auth";
import { EditDrawer } from "@/routes/admin.index"; // Reusing the powerful EditDrawer

// Reconstruct the resource config specifically for Reporters
const REPORTER_ARTICLE_RESOURCE = {
  key: "articles",
  label: "Articles",
  table: "articles",
  orderBy: "created_at",
  ascending: false,
  defaults: {
    status: "draft",
    approval_status: "Pending",
    is_impact: false,
    sort_order: 0,
  },
  fields: [
    { key: "title", label: "Title (Hindi)", type: "text" },
    {
      key: "slug",
      label: "Slug (unique, english)",
      type: "text",
      placeholder: "ken-betwa-2026",
    },
    { key: "dek", label: "Subheadline / Dek", type: "textarea" },
    {
      key: "excerpt",
      label: "Excerpt (short text for lists)",
      type: "textarea",
    },
    { key: "body", label: "Body (full article)", type: "richtext" },
    { key: "district_id", label: "District (Jila)", type: "select_district" },
    {
      key: "sub_district_id",
      label: "Sub-District (Tehsil/Area)",
      type: "select_sub_district",
    },
    { key: "category_id", label: "Category", type: "select_category" },
    { key: "tags", label: "Tags (comma separated)", type: "text" },
    {
      key: "image_url",
      label: "Cover Image (Desktop - 1920x800)",
      type: "image",
    },
    {
      key: "mobile_image_url",
      label: "Cover Image (Mobile - 1080x1350)",
      type: "image",
    },
    { key: "video_url", label: "Video URL (optional)", type: "text" },
    // Removed: is_trending, is_impact, status, publish_at, sort_order
  ],
};

export function ReporterDashboard() {
  const [tab, setTab] = useState<"overview" | "articles" | "profile">(
    "overview",
  );
  const { user } = useAdminAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[80vh]">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 shrink-0 space-y-8">
        <header className="px-2">
          <h1 className="text-2xl font-bold text-navy">Reporter Portal</h1>
          <p className="text-xs text-navy/60 mt-1">
            Submit and track your news
          </p>
        </header>

        <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible no-scrollbar pb-2">
          <button
            onClick={() => setTab("overview")}
            className={`text-left shrink-0 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
              tab === "overview"
                ? "bg-navy text-paper shadow-md ring-1 ring-navy/10"
                : "bg-transparent text-navy/60 hover:bg-navy/5 hover:text-navy"
            }`}
          >
            <LayoutDashboard className="size-4 inline-block mr-2" /> Overview
          </button>
          <button
            onClick={() => setTab("articles")}
            className={`text-left shrink-0 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
              tab === "articles"
                ? "bg-navy text-paper shadow-md ring-1 ring-navy/10"
                : "bg-transparent text-navy/60 hover:bg-navy/5 hover:text-navy"
            }`}
          >
            <FileText className="size-4 inline-block mr-2" /> My Articles
          </button>
          <button
            onClick={() => setTab("profile")}
            className={`text-left shrink-0 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
              tab === "profile"
                ? "bg-navy text-paper shadow-md ring-1 ring-navy/10"
                : "bg-transparent text-navy/60 hover:bg-navy/5 hover:text-navy"
            }`}
          >
            <LayoutDashboard className="size-4 inline-block mr-2" /> Profile
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-navy/5">
        {tab === "overview" && <ReporterOverview userId={user.id} />}
        {tab === "articles" && <ReporterArticles userId={user.id} />}
        {tab === "profile" && (
          <ReporterProfile userId={user.id} userEmail={user.email || ""} />
        )}
      </main>
    </div>
  );
}

function ReporterOverview({ userId }: { userId: string }) {
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    async function loadStats() {
      // Temporary hack: Since we don't have reporter_id set up yet, we query all.
      // In production, we'd add `.eq("reporter_id", userId)`
      const { data } = await supabase
        .from("articles")
        .select("approval_status")
        .eq("reporter_id", userId);
      if (!data) return;

      let p = 0,
        a = 0,
        r = 0;
      data.forEach((d) => {
        if (d.approval_status === "Pending") p++;
        else if (d.approval_status === "Approved") a++;
        else if (d.approval_status === "Rejected") r++;
      });
      setStats({ pending: p, approved: a, rejected: r });
    }
    loadStats();
  }, [userId]);

  return (
    <div>
      <div className="mb-6 pb-6 border-b border-navy/5">
        <h2 className="text-xl font-bold text-navy">Welcome back!</h2>
        <p className="text-sm text-navy/50 mt-1">
          Here is the status of your submitted articles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange/5 border border-orange/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-orange font-bold mb-2">
            <Clock className="size-5" /> Pending Review
          </div>
          <div className="text-4xl font-black text-navy">{stats.pending}</div>
        </div>

        <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-green-600 font-bold mb-2">
            <Check className="size-5" /> Approved
          </div>
          <div className="text-4xl font-black text-navy">{stats.approved}</div>
        </div>

        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-red-600 font-bold mb-2">
            <XCircle className="size-5" /> Rejected
          </div>
          <div className="text-4xl font-black text-navy">{stats.rejected}</div>
        </div>
      </div>
    </div>
  );
}

function ReporterArticles({ userId }: { userId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("articles")
      .select(
        `
        *,
        category:categories(name)
      `,
      )
      .eq("reporter_id", userId)
      .order("created_at", { ascending: false });

    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [userId]);

  function startCreate() {
    // When creating, inject reporter_id
    setEditing({
      id: "",
      ...REPORTER_ARTICLE_RESOURCE.defaults,
      reporter_id: userId,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-navy/5">
        <div>
          <h2 className="text-xl font-bold text-navy">My Articles</h2>
          <p className="text-sm text-navy/50 mt-1">
            Submit new articles for review.
          </p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-paper"
        >
          <Plus className="size-4" /> Add Article
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-navy/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-navy/5 text-left text-xs uppercase tracking-wider text-navy/60">
            <tr>
              <th className="px-3 py-3 w-16">Image</th>
              <th className="px-3 py-3">Article details</th>
              <th className="px-3 py-3 text-right">Approval Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const catName = Array.isArray(r.category)
                ? r.category[0]?.name
                : r.category?.name;

              return (
                <tr key={r.id} className="border-t border-navy/5">
                  <td className="px-3 py-3 align-top">
                    <div className="size-12 rounded bg-navy/5 overflow-hidden">
                      {r.image_url && (
                        <img
                          src={r.image_url}
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
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-navy/50">
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{catName || "Uncategorized"}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right align-top">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        r.approval_status === "Approved"
                          ? "bg-green-500/10 text-green-600"
                          : r.approval_status === "Rejected"
                            ? "bg-red-500/10 text-red-600"
                            : "bg-orange/10 text-orange"
                      }`}
                    >
                      {r.approval_status || "Pending"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-10 text-center text-navy/50">
                  No articles submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditDrawer
          resource={REPORTER_ARTICLE_RESOURCE as any}
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

import { uploadMedia } from "@/lib/admin/upload";
import { Save, Upload } from "lucide-react";
import { toast } from "sonner";

function ReporterProfile({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail: string;
}) {
  const [form, setForm] = useState<any>({ email: userEmail, name: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase
      .from("reporters")
      .select("*")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data) setForm({ ...data, email: userEmail }); // Enforce correct email
      });
  }, [userId, userEmail]);

  function set(k: string, v: string) {
    setForm((f: any) => ({ ...f, [k]: v }));
  }

  async function handleUpload(file: File) {
    try {
      const url = await uploadMedia(file, "reporters");
      set("profile_image", url);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error("Upload failed");
    }
  }

  async function save() {
    setBusy(true);
    try {
      const payload = { ...form, id: userId };
      // Insert or update
      const { error } = await supabase.from("reporters").upsert(payload);
      if (error) throw error;
      toast.success("Profile saved");
    } catch (e: any) {
      toast.error(e.message || "Failed to save profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6 pb-6 border-b border-navy/5">
        <h2 className="text-xl font-bold text-navy">My Profile</h2>
        <p className="text-sm text-navy/50 mt-1">
          Manage your public reporter profile and contact information.
        </p>
      </div>

      <div className="max-w-xl space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-navy/60">
            Profile Image
          </label>
          <div className="mt-1 flex items-center gap-3">
            {form.profile_image ? (
              <img
                src={form.profile_image}
                className="size-16 rounded-full object-cover"
              />
            ) : (
              <div className="size-16 rounded-full bg-navy/5" />
            )}
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-navy/15 px-3 py-2 text-sm hover:bg-navy/5">
              <Upload className="size-4" /> Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                }}
              />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-navy/60">
            Full Name
          </label>
          <input
            value={form.name || ""}
            onChange={(e) => set("name", e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-navy/60">
            Email
          </label>
          <input
            value={form.email || ""}
            disabled
            className="mt-1 w-full rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-sm text-navy/50 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-navy/60">
            Mobile Number
          </label>
          <input
            value={form.mobile_number || ""}
            onChange={(e) => set("mobile_number", e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy/60">
              Aadhaar Number
            </label>
            <input
              value={form.aadhaar_number || ""}
              onChange={(e) => set("aadhaar_number", e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy/60">
              PAN Number
            </label>
            <input
              value={form.pan_number || ""}
              onChange={(e) => set("pan_number", e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm uppercase"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-navy/5">
          <h3 className="text-sm font-bold mb-3">Social Links</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-navy/60">
                YouTube Channel URL
              </label>
              <input
                value={form.youtube_link || ""}
                onChange={(e) => set("youtube_link", e.target.value)}
                placeholder="https://youtube.com/..."
                className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-navy/60">
                Instagram Profile URL
              </label>
              <input
                value={form.instagram_link || ""}
                onChange={(e) => set("instagram_link", e.target.value)}
                placeholder="https://instagram.com/..."
                className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-navy/60">
                LinkedIn Profile URL
              </label>
              <input
                value={form.linkedin_link || ""}
                onChange={(e) => set("linkedin_link", e.target.value)}
                placeholder="https://linkedin.com/..."
                className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <button
          onClick={save}
          disabled={busy}
          className="mt-6 flex items-center gap-2 rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-paper disabled:opacity-50"
        >
          <Save className="size-4" /> {busy ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
