"use client";

import React, { useState, useEffect, Suspense } from "react";
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
  ChevronRight
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const { login, user, enterDemoMode } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    if (user && user.status === "active") {
      router.push(redirectPath);
    }
  }, [user, redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setPendingNotice(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      router.push(redirectPath);
    } else {
      if (result.code === "PENDING") {
        setPendingNotice(result.error || "Your account registration is awaiting approval from your branch administrator.");
      } else {
        setErrorMessage(result.error || "Invalid email or password.");
      }
    }
  };

  const handleDemoLogin = () => {
    enterDemoMode();
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-md bg-white border border-gray-300 shadow-sm p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
        <div className="bg-[#E4002B] text-white px-2.5 py-1 font-extrabold text-xl tracking-tighter">
          NBS
        </div>
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900">
            Staff Sign In
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            POS Training Portal &amp; Simulator
          </p>
        </div>
      </div>

      {/* Pending Notice */}
      {pendingNotice && (
        <div className="mb-4 p-3.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start space-x-2.5">
          <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-950 uppercase mb-0.5">Registration Pending Approval</div>
            <p>{pendingNotice}</p>
            <p className="text-[11px] text-amber-800 mt-1">
              Please notify your branch training supervisor or store manager to verify and activate your account.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            E-mail Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <Input
              type="email"
              required
              placeholder="name@nbs.com.ph"
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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-gray-700 uppercase">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <Input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage(null);
                setPendingNotice(null);
              }}
              className="pl-9 text-sm"
              autoComplete="current-password"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full font-bold uppercase tracking-wide py-2.5 mt-2 bg-[#E4002B] hover:bg-[#C30024] text-white flex items-center justify-center space-x-2"
        >
          <LogIn className="w-4 h-4" />
          <span>{isLoading ? "Signing In..." : "Sign In"}</span>
        </Button>
      </form>

      {/* New Trainee Registration Link */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center space-y-3">
        <div className="text-xs text-gray-600">
          New cashier or trainee?{" "}
          <Link
            href="/signup"
            className="font-bold text-[#E4002B] hover:underline"
          >
            Register Here
          </Link>
        </div>

        {/* Offline Local Demo Mode Fallback */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="text-[11px] text-gray-400 hover:text-gray-700 underline font-mono"
          >
            Continue in Local Offline Demo Mode
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans">
      {/* Top Banner */}
      <div className="bg-[#E4002B] text-white py-1.5 px-4 text-center text-xs font-semibold tracking-wide">
        NATIONAL BOOK STORE • CASHIER ACADEMY
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <Suspense fallback={<div className="text-center text-xs text-gray-400">Loading sign in...</div>}>
          <LoginForm />
        </Suspense>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-500">
        National Book Store, Inc. • Internal Retail Training System
      </footer>
    </div>
  );
}
