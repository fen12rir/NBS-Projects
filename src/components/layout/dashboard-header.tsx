"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Monitor, 
  LogOut, 
  ShieldAlert, 
  Award, 
  ArrowLeft 
} from "lucide-react";

export function DashboardHeader() {
  const { user, isDemoMode, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      {/* Demo Warning Banner */}
      {isDemoMode && (
        <div className="bg-amber-500 text-black py-1.5 px-4 text-xs font-bold text-center tracking-wide flex items-center justify-center space-x-2">
          <ShieldAlert className="w-4 h-4" />
          <span>
            LOCAL DEMO MODE ACTIVE - Using synthetic local storage profile: {user?.name} ({user?.email})
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="bg-[#E4002B] text-white px-2.5 py-0.5 font-extrabold text-lg tracking-tighter">
              NBS
            </div>
            <span className="font-bold text-gray-900 tracking-tight text-sm sm:text-base uppercase hidden sm:inline-block">
              POS Training Portal
            </span>
          </Link>
          <div className="h-5 w-px bg-gray-200 hidden sm:block"></div>
          <nav className="flex items-center space-x-1 sm:space-x-3 text-xs sm:text-sm font-semibold">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-[#E4002B] px-2 py-1"
            >
              Modules
            </Link>
            <Link
              href="/simulator"
              className="text-[#E4002B] bg-red-50 hover:bg-red-100 px-2.5 py-1 font-bold flex items-center space-x-1"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>POS Simulator</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-gray-900">{user?.name || "Trainee"}</div>
            <div className="text-[10px] text-gray-500 font-mono">Branch: {user?.branchCode || "BR-014"}</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center space-x-1 text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
