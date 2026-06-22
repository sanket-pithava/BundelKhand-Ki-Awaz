import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Check, Shield, User } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export function UserManagement() {
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState<"admin" | "editor">("editor"); // 'editor' is Reporter
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [users, setUsers] = useState<any[]>([]);

  // Load existing roles
  useEffect(() => {
    supabase
      .from("user_roles")
      .select("user_id, role")
      .then(({ data }) => {
        setUsers(data || []);
      });
  }, [busy]);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      // Create a temporary client so it doesn't affect the Super Admin's current session
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const tempClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
      });

      // 1. Sign up user
      const { data, error } = await tempClient.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("No user returned from signup");

      const userId = data.user.id;

      // 2. Set Role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: role,
      });
      if (roleError) {
        // If it already exists or fails, just upsert
        await supabase.from("user_roles").upsert({ user_id: userId, role });
      }

      // 3. If Reporter, initialize reporters table
      if (role === "editor") {
        const { error: repError } = await supabase.from("reporters").insert({
          id: userId,
          email: email,
          name: name || "New Reporter",
          status: true,
        });
        if (repError) console.error("Reporter table insert error:", repError);
      }

      toast.success(
        `${role === "editor" ? "Reporter" : "Admin"} account created successfully!`,
      );
      setEmail("");
      setPassword("");
      setName("");
    } catch (e: any) {
      toast.error(e.message || "Failed to create user");
    } finally {
      setBusy(false);
    }
  }

  const admins = users.filter((u) => u.role === "admin").length;
  const reporters = users.filter((u) => u.role === "editor").length;

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

      <div className="bg-white border border-navy/10 rounded-2xl p-6 max-w-xl">
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

          {role === "editor" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-navy/60">
                Full Name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm"
                placeholder="Reporter Name"
              />
            </div>
          )}

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
    </div>
  );
}
