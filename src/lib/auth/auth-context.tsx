"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthUser, DEMO_USER } from "./demo-user";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "../supabase/client";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isDemoMode: boolean;
  signInWithGoogle: () => Promise<void>;
  enterDemoMode: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isDemoMode: false,
  signInWithGoogle: async () => {},
  enterDemoMode: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check if user previously logged in or active in demo mode
    const storedDemo = localStorage.getItem("nbs_demo_active");
    if (storedDemo === "true") {
      setUser(DEMO_USER);
      setIsDemoMode(true);
      setIsLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      // Default fallback when supabase not configured
      setIsLoading(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Employee",
          email: session.user.email || "",
          role: "trainee",
          branchCode: "BR-014",
          isDemo: false,
          avatarUrl: session.user.user_metadata?.avatar_url,
        });
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Employee",
          email: session.user.email || "",
          role: "trainee",
          branchCode: "BR-014",
          isDemo: false,
          avatarUrl: session.user.user_metadata?.avatar_url,
        });
        setIsDemoMode(false);
      } else if (!isDemoMode) {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isDemoMode]);

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      alert("Supabase OAuth is not configured in this environment. Entering Local Demo Mode instead.");
      enterDemoMode();
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    }
  };

  const enterDemoMode = () => {
    localStorage.setItem("nbs_demo_active", "true");
    setUser(DEMO_USER);
    setIsDemoMode(true);
  };

  const signOut = async () => {
    localStorage.removeItem("nbs_demo_active");
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    setUser(null);
    setIsDemoMode(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isDemoMode,
        signInWithGoogle,
        enterDemoMode,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
