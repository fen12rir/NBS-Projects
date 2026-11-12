"use client";

import React, { useEffect, useState, useRef } from "react";
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
  ArrowLeft,
  Menu,
  PanelLeft
} from "lucide-react";

interface DashboardHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function DashboardHeader({ onToggleSidebar, isSidebarOpen }: DashboardHeaderProps = {}) {
  const { user, isDemoMode, signOut } = useAuth();
  const router = useRouter();

  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(64);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [isDemoMode]);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = (e.target as HTMLElement | Document) || document;
      const currentScrollY =
        target === document || target === (window as any)
          ? window.scrollY
          : (target as HTMLElement).scrollTop ?? window.scrollY;

      const delta = currentScrollY - lastScrollY.current;

      // Immediate response on scroll direction
      if (currentScrollY <= 15) {
        setIsVisible(true);
      } else if (delta > 3) {
        // Scrolling down -> immediate hide
        setIsVisible(false);
      } else if (delta < -3) {
        // Scrolling up -> immediate show
        setIsVisible(true);
      }
      lastScrollY.current = Math.max(0, currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", handleScroll, { capture: true });
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header
      ref={headerRef}
      style={{
        marginTop: isVisible ? "0px" : `-${headerHeight || 64}px`,
      }}
      className={`bg-white border-b border-gray-200 z-50 shrink-0 transition-[margin-top,transform,opacity] duration-300 ease-in-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      {/* Demo Warning Banner */}
      {isDemoMode && (
        <div className="bg-amber-500 text-black py-1.5 px-4 text-xs font-bold text-center tracking-wide flex items-center justify-center space-x-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span className="truncate">
            LOCAL DEMO MODE ACTIVE - Using synthetic local storage profile: {user?.name} ({user?.email})
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Toggle Navigation Sidebar"
              title="Toggle Curriculum Sidebar"
              className="p-2 rounded-md text-gray-700 hover:text-[#E4002B] hover:bg-red-50 cursor-pointer transition-colors border border-transparent hover:border-red-200 shrink-0"
            >
              <PanelLeft className="w-5 h-5 shrink-0" />
            </button>
          )}
          <Link href="/dashboard" className="flex items-center space-x-2 shrink-0">
            <div className="bg-[#E4002B] text-white px-2.5 py-0.5 font-extrabold text-lg tracking-tighter">
              NBS
            </div>
            <span className="font-bold text-gray-900 tracking-tight text-sm sm:text-base uppercase hidden sm:inline-block">
              POS Training Portal
            </span>
          </Link>
          <div className="h-5 w-px bg-gray-200 hidden sm:block shrink-0"></div>
          <nav className="hidden sm:flex items-center space-x-1 sm:space-x-3 text-xs sm:text-sm font-semibold truncate">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-[#E4002B] px-2 py-1 shrink-0"
            >
              Modules
            </Link>
            <Link
              href="/simulator"
              className="text-[#E4002B] bg-red-50 hover:bg-red-100 px-2.5 py-1 font-bold flex items-center space-x-1 shrink-0 rounded"
            >
              <Monitor className="w-3.5 h-3.5 shrink-0" />
              <span>POS Simulator</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-gray-900">{user?.name || "Trainee"}</div>
            <div className="text-[10px] text-gray-500 font-mono">Branch: {user?.branchCode || "BR-014"}</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center space-x-1 text-xs shrink-0"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
