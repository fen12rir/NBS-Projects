"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthUser, DEMO_ADMIN_USER, DEMO_TRAINEE_USER, DEMO_USER } from "./demo-user";

export interface SignupData {
  fullName: string;
  email: string;
  contactNo: string;
  branchCode: string;
  password: string;
  confirmPassword: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; code?: string; role?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string; message?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  enterDemoMode: (mode?: "trainee" | "admin") => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isDemoMode: false,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  signOut: async () => {},
  refreshSession: async () => {},
  enterDemoMode: async () => {},
  signInWithGoogle: async () => {},
});

const TAB_SESSION_KEY = "nbs_tab_session_alive";
const LAST_ACTIVE_KEY = "nbs_session_last_active";
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const clearClientAuthStorage = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem(TAB_SESSION_KEY);
      sessionStorage.removeItem("nbs_demo_active");
      localStorage.removeItem("nbs_demo_active");
      localStorage.removeItem(LAST_ACTIVE_KEY);
      localStorage.removeItem("nbs_user_profile");
      localStorage.removeItem("nbs_pos_training_progress_v1");
      document.cookie = "nbs_demo_mode=; path=/; max-age=0";
      window.dispatchEvent(new Event("nbs_progress_updated"));
    } catch {}
  }, []);

  const fetchSession = useCallback(async () => {
    if (typeof window !== "undefined") {
      try {
        // Legacy Demo Flag Cleanup
        localStorage.removeItem("nbs_demo_active");

        const tabAlive = sessionStorage.getItem(TAB_SESSION_KEY);
        const lastActiveRaw = localStorage.getItem(LAST_ACTIVE_KEY);
        const lastActive = lastActiveRaw ? Number(lastActiveRaw) : 0;
        const isInactiveExpired =
          !lastActive || Date.now() - lastActive > INACTIVITY_TIMEOUT_MS;

        // Stale Session Logout
        if (!tabAlive || isInactiveExpired) {
          await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
          clearClientAuthStorage();
          setUser(null);
          setIsDemoMode(false);
          setIsLoading(false);
          return;
        }
      } catch {}
    }

    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: { "Cache-Control": "no-cache" },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            name: data.user.fullName,
            fullName: data.user.fullName,
            email: data.user.email,
            contactNo: data.user.contactNo,
            role: data.user.role,
            status: data.user.status,
            branchCode: data.user.branchCode,
            branchName: data.user.branchName,
            branchRegion: data.user.branchRegion,
            employeeId: data.user.employeeId,
            posUsername: data.user.posUsername,
            posPassword: data.user.posPassword,
            accessExpiresAt: data.user.accessExpiresAt,
            isDemo: Boolean(data.user.id?.includes("demo")),
          };
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(TAB_SESSION_KEY, "1");
              localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
              localStorage.removeItem("nbs_pos_training_progress_v1");
              localStorage.setItem(
                "nbs_user_profile",
                JSON.stringify({ id: authUser.id, email: authUser.email, fullName: authUser.fullName })
              );
              window.dispatchEvent(new Event("nbs_progress_updated"));
            } catch {}
          }
          setUser(authUser);
          setIsDemoMode(Boolean(data.user.id?.includes("demo")));
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Network or API failure
    }

    // Tab Demo Mode
    if (typeof window !== "undefined") {
      const demoFlag = sessionStorage.getItem("nbs_demo_active");
      if (demoFlag === "admin") {
        setUser(DEMO_ADMIN_USER);
        setIsDemoMode(true);
        setIsLoading(false);
        return;
      } else if (demoFlag === "trainee" || demoFlag === "true") {
        setUser(DEMO_TRAINEE_USER);
        setIsDemoMode(true);
        setIsLoading(false);
        return;
      }
    }

    setUser(null);
    setIsDemoMode(false);
    setIsLoading(false);
  }, [clearClientAuthStorage]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Inactivity Logout
  useEffect(() => {
    if (typeof window === "undefined" || !user) return;

    let lastWrite = Date.now();
    const recordActivity = () => {
      const now = Date.now();
      if (now - lastWrite > 15000) {
        lastWrite = now;
        try {
          localStorage.setItem(LAST_ACTIVE_KEY, String(now));
          sessionStorage.setItem(TAB_SESSION_KEY, "1");
        } catch {}
      }
    };

    const events = ["pointerdown", "keydown", "touchstart", "scroll"];
    events.forEach((ev) => window.addEventListener(ev, recordActivity, { passive: true }));

    const interval = setInterval(() => {
      try {
        const lastActiveRaw = localStorage.getItem(LAST_ACTIVE_KEY);
        const lastActive = lastActiveRaw ? Number(lastActiveRaw) : Date.now();
        if (Date.now() - lastActive > INACTIVITY_TIMEOUT_MS) {
          void fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
          clearClientAuthStorage();
          setUser(null);
          setIsDemoMode(false);
          window.location.href = "/login?expired=1";
        }
      } catch {}
    }, 60 * 1000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, recordActivity));
      clearInterval(interval);
    };
  }, [user, clearClientAuthStorage]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: data.error || "Login failed",
          code: data.code,
        };
      }

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(TAB_SESSION_KEY, "1");
          sessionStorage.removeItem("nbs_demo_active");
          localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
          localStorage.removeItem("nbs_demo_active");
        } catch {}
      }

      await fetchSession();
      return { success: true, role: data.user?.role };
    } catch (err: any) {
      return { success: false, error: err?.message || "Network error. Please try again." };
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: body.error || "Registration failed",
        };
      }

      return {
        success: true,
        message: body.message,
      };
    } catch (err: any) {
      return { success: false, error: err?.message || "Network error during registration." };
    }
  };

  const signOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Best-effort logout
    }

    clearClientAuthStorage();

    setUser(null);
    setIsDemoMode(false);
  };

  const enterDemoMode = async (mode: "trainee" | "admin" = "trainee") => {
    try {
      await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
    } catch {
      // Best effort
    }

    const demoUser = mode === "admin" ? DEMO_ADMIN_USER : DEMO_TRAINEE_USER;
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(TAB_SESSION_KEY, "1");
        sessionStorage.setItem("nbs_demo_active", mode);
        localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
        localStorage.removeItem("nbs_demo_active");
        localStorage.removeItem("nbs_pos_training_progress_v1");
        localStorage.setItem(
          "nbs_user_profile",
          JSON.stringify({ id: demoUser.id, email: demoUser.email, fullName: demoUser.fullName })
        );
        document.cookie = `nbs_demo_mode=${mode}; path=/`;
        window.dispatchEvent(new Event("nbs_progress_updated"));
      } catch {}
    }

    setUser(demoUser);
    setIsDemoMode(true);
    setIsLoading(false);
  };

  const signInWithGoogle = async () => {
    await enterDemoMode("trainee");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isDemoMode,
        login,
        signup,
        signOut,
        refreshSession: fetchSession,
        enterDemoMode,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
