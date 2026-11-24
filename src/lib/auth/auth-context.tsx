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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchSession = useCallback(async () => {
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
              const prevRaw = localStorage.getItem("nbs_user_profile");
              const prevId = prevRaw ? JSON.parse(prevRaw)?.id : null;
              if (prevId && prevId !== authUser.id) {
                localStorage.removeItem("nbs_pos_training_progress_v1");
              }
              localStorage.setItem(
                "nbs_user_profile",
                JSON.stringify({ id: authUser.id, email: authUser.email, fullName: authUser.fullName })
              );
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

    // Check if user set local demo mode in localStorage
    if (typeof window !== "undefined") {
      const demoFlag = localStorage.getItem("nbs_demo_active");
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
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

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
        localStorage.removeItem("nbs_demo_active");
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

    if (typeof window !== "undefined") {
      localStorage.removeItem("nbs_demo_active");
      localStorage.removeItem("nbs_user_profile");
      // Clear client-accessible cookies
      document.cookie = "nbs_demo_mode=; path=/; max-age=0";
    }

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

    if (typeof window !== "undefined") {
      localStorage.setItem("nbs_demo_active", mode);
      document.cookie = `nbs_demo_mode=${mode}; path=/; max-age=604800`;
    }

    const demoUser = mode === "admin" ? DEMO_ADMIN_USER : DEMO_TRAINEE_USER;
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
