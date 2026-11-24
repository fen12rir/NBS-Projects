"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Mail, 
  Lock, 
  LogIn, 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  Building2,
  ChevronRight,
  ArrowLeft,
  Eye,
  EyeOff
} from "lucide-react";

function getDefaultDestination(role?: string) {
  if (role === "super_admin" || role === "branch_admin") {
    return "/admin";
  }
  return "/dashboard";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitRedirect = searchParams.get("redirect");
  const isRedirectingRef = useRef(false);

  const { login, user, enterDemoMode } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);
  const [demoAccessEnabled, setDemoAccessEnabled] = useState(true);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.demoAccessEnabled === "boolean") {
          setDemoAccessEnabled(data.demoAccessEnabled);
        }
      })
      .catch(() => {});
  }, []);

  // If already logged in, redirect directly to role-appropriate portal
  useEffect(() => {
    if (isRedirectingRef.current) return;
    if (user && user.status === "active") {
      isRedirectingRef.current = true;
      router.replace(explicitRedirect || getDefaultDestination(user.role));
    }
  }, [user, explicitRedirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setPendingNotice(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    isRedirectingRef.current = true;
    const result = await login(email, password);

    if (result.success) {
      const target = explicitRedirect || getDefaultDestination(result.role);
      router.replace(target);
    } else {
      isRedirectingRef.current = false;
      setIsLoading(false);
      if (result.code === "PENDING") {
        setPendingNotice(result.error || "Your account registration is awaiting approval from your branch administrator.");
      } else {
        setErrorMessage(result.error || "Invalid email or password.");
      }
    }
  };

  const handleDemoTraineeLogin = async () => {
    isRedirectingRef.current = true;
    setIsLoading(true);
    await enterDemoMode("trainee");
    window.location.href = "/dashboard";
  };

  const handleDemoAdminLogin = async () => {
    isRedirectingRef.current = true;
    setIsLoading(true);
    await enterDemoMode("admin");
    window.location.href = "/admin";
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-lg p-6 sm:p-8">
      {/* Return to Landing Page */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-[#E4002B] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Return to Landing Page</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
        <div className="bg-[#E4002B] text-white px-2.5 py-1 rounded-none font-heading font-extrabold text-xl tracking-tighter shadow-xs">
          NBS
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Staff Sign In
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Cashier POS Training &amp; Simulator
          </p>
        </div>
      </div>

      {/* Pending Notice */}
      {pendingNotice && (
        <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start space-x-2.5">
          <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-950 mb-0.5">Registration Pending Approval</div>
            <p>{pendingNotice}</p>
            <p className="text-[11px] text-amber-800 mt-1">
              Please notify your branch training supervisor or store manager to verify and activate your account.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              type="email"
              required
              placeholder="e.g. maria.santos@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage(null);
                setPendingNotice(null);
              }}
              className="pl-9 text-sm"
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage(null);
                setPendingNotice(null);
              }}
              className="pl-9 pr-9 text-sm"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full font-semibold py-2.5 mt-2 bg-[#E4002B] hover:bg-[#C30024] text-white flex items-center justify-center space-x-2"
        >
          <LogIn className="w-4 h-4" />
          <span>{isLoading ? "Signing In..." : "Sign In to Learning Portal"}</span>
        </Button>
      </form>

      {/* Prominent Demo Mode Section */}
      {demoAccessEnabled && (
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase font-semibold">
              <span className="bg-white px-3 text-slate-400 tracking-wider">
                Sandbox Evaluation Mode
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="text-center">
              <div className="text-xs font-bold text-slate-900">
                Instant Demo Access
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Preview the platform without database credentials:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleDemoAdminLogin}
                disabled={isLoading}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 shadow-xs transition-all"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Admin Demo &rarr;</span>
              </button>
              <button
                type="button"
                onClick={handleDemoTraineeLogin}
                disabled={isLoading}
                className="py-2.5 px-3 bg-[#E4002B] hover:bg-[#C30024] text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 shadow-xs transition-all"
              >
                <Building2 className="w-4 h-4 text-white shrink-0" />
                <span>Trainee Demo &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Trainee Registration Link */}
      <div className="mt-4 pt-3 text-center">
        <div className="text-xs text-slate-600">
          New cashier or trainee?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#E4002B] hover:underline"
          >
            Register Trainee Here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-y-auto">
      {/* Top Corporate Bar */}
      <div className="bg-slate-900 text-slate-300 py-2 px-4 text-center text-xs font-medium tracking-wide shrink-0 border-b border-slate-800">
        National Book Store • Cashier POS Training Portal
      </div>

      <main className="flex-1 w-full flex justify-center items-start py-6 sm:py-10 px-4">
        <div className="w-full max-w-md my-auto">
          <Suspense fallback={<div className="text-center text-xs text-slate-400">Loading sign in...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 shrink-0">
        National Book Store, Inc. • Corporate Learning &amp; Competency System
      </footer>
    </div>
  );
}
