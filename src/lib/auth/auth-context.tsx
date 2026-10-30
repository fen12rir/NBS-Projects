"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthUser, DEMO_USER } from "./demo-user";

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
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("nbs_user_profile") : null;
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setIsDemoMode(Boolean(parsed.isDemo));
        setIsLoading(false);
        return;
      } catch {
        // Fallback to default
      }
    }

    // Default to active demo user for instant access in training sandbox
    if (typeof window !== "undefined") {
      localStorage.setItem("nbs_demo_active", "true");
    }
    setUser(DEMO_USER);
    setIsDemoMode(true);
    setIsLoading(false);
  }, []);

  const signInWithGoogle = async () => {
    enterDemoMode();
  };

  const enterDemoMode = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nbs_demo_active", "true");
      localStorage.setItem("nbs_user_profile", JSON.stringify(DEMO_USER));
    }
    setUser(DEMO_USER);
    setIsDemoMode(true);
  };

  const signOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("nbs_demo_active");
      localStorage.removeItem("nbs_user_profile");
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
