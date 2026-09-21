import { useEffect, useState, useCallback } from "react";
import { adminGetSessionFn } from "@/lib/admin-auth";

export type AdminUser = {
  id: string;
  email: string;
  name?: string;
  role: string;
};

export type AdminAuthState = {
  user: AdminUser | null;
  isAdmin: boolean;
  isReporter: boolean;
  loading: boolean;
};

export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    isAdmin: false,
    isReporter: false,
    loading: true,
  });

  const checkAuth = useCallback(async () => {
    if (typeof window === "undefined") {
      setState({ user: null, isAdmin: false, isReporter: false, loading: false });
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) {
      setState({ user: null, isAdmin: false, isReporter: false, loading: false });
      return;
    }

    try {
      const res = await adminGetSessionFn({ data: { token } });
      if (res?.user) {
        setState({
          user: res.user,
          isAdmin: res.isAdmin,
          isReporter: res.isReporter,
          loading: false,
        });
      } else {
        localStorage.removeItem("admin_token");
        setState({ user: null, isAdmin: false, isReporter: false, loading: false });
      }
    } catch {
      localStorage.removeItem("admin_token");
      setState({ user: null, isAdmin: false, isReporter: false, loading: false });
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("admin-auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("admin-auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [checkAuth]);

  return state;
}
