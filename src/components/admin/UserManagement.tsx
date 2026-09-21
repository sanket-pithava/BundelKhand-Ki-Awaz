import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Shield, User, Trash2 } from "lucide-react";
import { adminGetUsersFn, adminRegisterFn, adminUpdateUserRoleFn, adminDeleteUserFn } from "@/lib/admin-auth";

export function UserManagement() {
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState<"admin" | "editor">("editor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  const loadUsers = async () => {
    try {
      const data = await adminGetUsersFn();
      setUsers(data || []);
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      await adminRegisterFn({
        data: {
          email,
          password,
          name: name || email.split("@")[0],
          role,
        },
      });

      toast.success(
        `${role === "editor" ? "Reporter" : "Admin"} account created successfully!`,
      );
      setEmail("");
      setPassword("");
      setName("");
      loadUsers();
    } catch (e: any) {
      toast.error(e.message || "Failed to create user");
    } finally {
      setBusy(false);
    }
  }

  async function updateRole(userId: string, newRole: "admin" | "editor" | "user") {
    try {
      await adminUpdateUserRoleFn({ data: { userId, role: newRole } });
      toast.success("User role updated");
      loadUsers();
    } catch (e: any) {
      toast.error(e.message || "Failed to update role");
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await adminDeleteUserFn({ data: { userId } });
      toast.success("User removed");
      loadUsers();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete user");
    }
  }

  const admins = users.filter((u) => u.role === "admin").length;
  const reporters = users.filter((u) => u.role === "editor" || u.role === "reporter").length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-navy/5 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-navy/60 uppercase tracking-wider">
              Super Admins
            </div>
            <div className="text-3xl font-black text-navy mt-1">{admins}</div>
          </div>
          <Shield className="size-10 text-navy/20" />
        </div>
        <div className="bg-orange/5 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-orange uppercase tracking-wider">
              Reporters
            </div>
            <div className="text-3xl font-black text-navy mt-1">
              {reporters}
            </div>
          </div>
          <User className="size-10 text-orange/20" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-navy/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-navy mb-4">Create New User</h3>
          <form onSubmit={createUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-navy/60">
                Account Type
              </label>
              <div className="mt-2 flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    checked={role === "editor"}
                    onChange={() => setRole("editor")}
                  />{" "}
                  Reporter
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    checked={role === "admin"}
                    onChange={() => setRole("admin")}
                  />{" "}
                  Super Admin
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-navy/60">
                Full Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm"
                placeholder={role === "editor" ? "Reporter Name" : "Admin Name"}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-navy/60">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-navy/60">
                Password
              </label>
              <input
                required
                type="text"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm"
                placeholder="min 6 characters"
              />
              <p className="text-[10px] text-navy/40 mt-1">
                Make sure to securely share this password with the user.
              </p>
            </div>

            <button
              disabled={busy}
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-paper disabled:opacity-50"
            >
              <Plus className="size-4" />{" "}
              {busy
                ? "Creating..."
                : `Create ${role === "editor" ? "Reporter" : "Admin"}`}
            </button>
          </form>
        </div>

        <div className="bg-white border border-navy/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-navy mb-4">Existing Users</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 rounded-xl border border-navy/10 hover:bg-navy/5 transition"
              >
                <div>
                  <div className="font-semibold text-sm text-navy">{u.name || u.email}</div>
                  <div className="text-xs text-navy/60">{u.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value as any)}
                    className="text-xs font-medium rounded border border-navy/20 px-2 py-1 bg-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Reporter</option>
                    <option value="user">User</option>
                  </select>
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                    title="Remove user"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-center text-xs text-navy/40 py-8">No users found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
