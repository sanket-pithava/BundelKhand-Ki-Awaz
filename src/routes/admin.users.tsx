import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminGetUsersFn, adminUpdateUserRoleFn, adminDeleteUserFn } from "@/lib/admin-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor" | "user";
  created_at: string;
};

function AdminUsers() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const data = await adminGetUsersFn();
      setRows((data ?? []) as UserRow[]);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load users");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function promote() {
    setBusy(true);
    try {
      const target = rows.find((r) => r.email.toLowerCase() === email.trim().toLowerCase());
      if (!target) {
        toast.error("No user found with that email. User must exist in the system first.");
        return;
      }
      await adminUpdateUserRoleFn({ data: { userId: target.id, role: "admin" } });
      toast.success("Promoted to admin successfully");
      setEmail("");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to promote user");
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(userId: string, role: "admin" | "editor" | "user") {
    try {
      await adminUpdateUserRoleFn({ data: { userId, role } });
      toast.success("Role updated");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update role");
    }
  }

  async function removeUser(userId: string) {
    if (!confirm("Are you sure you want to remove this user?")) return;
    try {
      await adminDeleteUserFn({ data: { userId } });
      toast.success("User removed");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to remove user");
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-navy">Admin Users</h1>
        <p className="text-sm text-navy/60">
          Manage admin and reporter roles stored in MongoDB Atlas.
        </p>
      </header>

      <div className="flex gap-2 rounded-xl border border-navy/10 bg-white p-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          className="flex-1 rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-navy"
        />
        <button
          onClick={promote}
          disabled={busy || !email}
          className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50"
        >
          Promote to admin
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-navy/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-navy/5 text-left text-xs uppercase tracking-wider text-navy/60">
            <tr>
              <th className="px-3 py-2.5">User</th>
              <th className="px-3 py-2.5">Email</th>
              <th className="px-3 py-2.5">Role</th>
              <th className="px-3 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-navy/5">
                <td className="px-3 py-2.5 font-medium">{r.name || "(No name)"}</td>
                <td className="px-3 py-2.5 text-navy/70">{r.email}</td>
                <td className="px-3 py-2.5">
                  <select
                    value={r.role}
                    onChange={(e) => changeRole(r.id, e.target.value as any)}
                    className="rounded border border-navy/15 bg-paper px-2 py-1 text-xs font-semibold"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Reporter (Editor)</option>
                    <option value="user">User</option>
                  </select>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <button
                    onClick={() => removeUser(r.id)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-navy/40">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
