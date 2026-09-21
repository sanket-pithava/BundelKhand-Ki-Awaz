import { createServerFn } from "@tanstack/react-start";
import crypto from "node:crypto";
import { getDatabase } from "./db";

const AUTH_SECRET = process.env.AUTH_SECRET || "harbole_secret_key_bundelkhand_news_2026";

// Helper: Hash password using PBKDF2
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const h = crypto.pbkdf2Sync(password, s, 10000, 64, "sha512").toString("hex");
  return { hash: h, salt: s };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const calculated = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return calculated === hash;
}

// Stateless HMAC-SHA256 Token Helper
function createToken(payload: Record<string, any>): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verifyToken(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [body, signature] = parts;
    const expectedSig = crypto.createHmac("sha256", AUTH_SECRET).update(body).digest("base64url");
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// 1. Admin Login
export const adminLoginFn = createServerFn({ method: "POST" })
  .validator((d: { email: string; password: string }) => d)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const db = await getDatabase();

    const user = await db.collection("profiles").findOne({ email });
    if (!user) {
      throw new Error("इस ईमेल से कोई खाता नहीं मिला।");
    }

    if (!user.password_hash || !user.salt) {
      throw new Error("इस खाते का पासवर्ड सेट नहीं है। कृपया 'Create an account' से पासवर्ड सेट करें।");
    }

    const isValid = verifyPassword(data.password, user.password_hash, user.salt);
    if (!isValid) {
      throw new Error("पासवर्ड या ईमेल सही नहीं है।");
    }

    // Determine role from user or user_roles
    let role = user.role;
    if (!role) {
      const r = await db.collection("user_roles").findOne({ user_id: user.id });
      role = r?.role || "admin";
    }

    // Session token expires in 30 days
    const exp = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const token = createToken({
      id: user.id || user._id?.toString(),
      email: user.email,
      name: user.display_name || user.email.split("@")[0],
      role: role || "admin",
      exp,
    });

    return {
      success: true,
      token,
      user: {
        id: user.id || user._id?.toString(),
        email: user.email,
        name: user.display_name || user.email.split("@")[0],
        role: role || "admin",
      },
    };
  });

// 2. Verify Session
export const adminGetSessionFn = createServerFn({ method: "POST" })
  .validator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    if (!data?.token) {
      return { user: null, isAdmin: false, isReporter: false };
    }

    const payload = verifyToken(data.token);
    if (!payload) {
      return { user: null, isAdmin: false, isReporter: false };
    }

    const role = payload.role || "user";
    const isAdmin = role === "admin";
    const isReporter = role === "editor" || role === "reporter";

    return {
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
      isAdmin,
      isReporter,
    };
  });

// 3. Admin Logout
export const adminLogoutFn = createServerFn({ method: "POST" })
  .validator((_d?: { token?: string }) => _d)
  .handler(async () => {
    return { success: true };
  });

// 4. Admin Sign Up / Register
export const adminRegisterFn = createServerFn({ method: "POST" })
  .validator((d: { email: string; password: string; name?: string; role?: "admin" | "editor" }) => d)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const db = await getDatabase();

    const existing = await db.collection("profiles").findOne({ email });
    const { hash, salt } = hashPassword(data.password);
    const userId = existing?.id || crypto.randomUUID();
    const role = data.role || (existing?.role || "admin");
    const name = data.name || existing?.display_name || email.split("@")[0];

    await db.collection("profiles").updateOne(
      { email },
      {
        $set: {
          id: userId,
          email,
          display_name: name,
          password_hash: hash,
          salt,
          role,
          status: true,
          updated_at: new Date().toISOString(),
        },
        $setOnInsert: {
          created_at: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    await db.collection("user_roles").updateOne(
      { user_id: userId },
      {
        $set: {
          id: crypto.randomUUID(),
          user_id: userId,
          role,
          created_at: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    const exp = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const token = createToken({
      id: userId,
      email,
      name,
      role,
      exp,
    });

    return {
      success: true,
      token,
      user: {
        id: userId,
        email,
        name,
        role,
      },
    };
  });

// 5. Get Users List for Admin Users page
export const adminGetUsersFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const db = await getDatabase();
    const profiles = await db.collection("profiles").find({}).toArray();
    const roles = await db.collection("user_roles").find({}).toArray();
    const roleMap = new Map<string, string>();
    for (const r of roles) {
      if (r.user_id && r.role) roleMap.set(r.user_id, r.role);
    }

    return profiles.map((p: any) => ({
      id: p.id || p._id?.toString(),
      email: p.email,
      name: p.display_name || p.name || "",
      role: roleMap.get(p.id) || p.role || "user",
      created_at: p.created_at || new Date().toISOString(),
      status: p.status ?? true,
    }));
  });

// 6. Update User Role
export const adminUpdateUserRoleFn = createServerFn({ method: "POST" })
  .validator((d: { userId: string; role: "admin" | "editor" | "user" }) => d)
  .handler(async ({ data }) => {
    const db = await getDatabase();
    await db.collection("profiles").updateOne(
      { id: data.userId },
      { $set: { role: data.role, updated_at: new Date().toISOString() } }
    );
    await db.collection("user_roles").updateOne(
      { user_id: data.userId },
      { $set: { role: data.role, updated_at: new Date().toISOString() } },
      { upsert: true }
    );
    return { success: true };
  });

// 7. Delete / Revoke User Role
export const adminDeleteUserFn = createServerFn({ method: "POST" })
  .validator((d: { userId: string }) => d)
  .handler(async ({ data }) => {
    const db = await getDatabase();
    await db.collection("profiles").deleteOne({ id: data.userId });
    await db.collection("user_roles").deleteMany({ user_id: data.userId });
    return { success: true };
  });
