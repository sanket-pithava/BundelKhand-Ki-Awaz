import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

type RoleRow = { id: string; user_id: string; role: string; created_at: string };

function AdminUsers() {
  const [rows, setRows] = useState<RoleRow[]>([]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await supabase.from("user_roles").select("*").order("created_at", { ascending: false });
    setRows((data ?? []) as RoleRow[]);
  }
  useEffect(() => { load(); }, []);

  async function promote() {
    setBusy(true);
    try {
      // Find user by email via profiles
      const { data: prof, error: pErr } = await supabase.from("profiles").select("id").eq("email", email.trim().toLowerCase()).maybeSingle();
      if (pErr) throw pErr;
      if (!prof) { toast.error("No user found with that email. They must sign up first."); return; }
      const { error } = await supabase.from("user_roles").insert({ user_id: prof.id, role: "admin" });
      if (error) throw error;
      toast.success("Promoted to admin");
      setEmail("");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this role?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Admin Users</h1>
        <p className="text-sm text-navy/60">Promote registered users to admin. They must first sign up at /admin/login.</p>
      </header>

      <div className="flex gap-2 rounded-xl border border-navy/10 bg-white p-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          className="flex-1 rounded-lg border border-navy/15 px-3 py-2 text-sm"
        />
        <button onClick={promote} disabled={busy || !email} className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50">
          Promote to admin
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-navy/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-navy/5 text-left text-xs uppercase tracking-wider text-navy/60">
            <tr><th className="px-3 py-2">User ID</th><th className="px-3 py-2">Role</th><th className="px-3 py-2 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-navy/5">
                <td className="px-3 py-2 font-mono text-xs">{r.user_id}</td>
                <td className="px-3 py-2"><span className="rounded bg-navy/10 px-2 py-0.5 text-xs font-semibold">{r.role}</span></td>
                <td className="px-3 py-2 text-right">
                  <button onClick={() => revoke(r.id)} className="text-xs font-semibold text-red-600 hover:underline">Revoke</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
