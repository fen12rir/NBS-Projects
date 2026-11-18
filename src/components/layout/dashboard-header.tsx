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
  PanelLeft,
  Shield,
  Clock
} from "lucide-react";

interface DashboardHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  isMobileMenuOpen?: boolean;
}

export function DashboardHeader({
  onToggleSidebar,
  isSidebarOpen,
  isMobileMenuOpen,
}: DashboardHeaderProps = {}) {
  const { user, isDemoMode, signOut } = useAuth();
  const router = useRouter();

  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(64);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Check days remaining until access expires
  const daysUntilExpiry = user?.accessExpiresAt
    ? Math.ceil((new Date(user.accessExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [isDemoMode, daysUntilExpiry]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsVisible(true);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      // Desktop Docked Header
      if (typeof window !== "undefined" && window.innerWidth >= 1024) {
        setIsVisible(true);
        return;
      }

      // Mobile Drawer Guard
      if (isMobileMenuOpen) {
        setIsVisible(true);
        return;
      }

      const targetEl = e.target instanceof HTMLElement ? e.target : null;

      // Sidebar Scroll Guard
      if (targetEl && (targetEl.closest("aside") || targetEl.closest("[data-sidebar]"))) {
        return;
      }

      // Main Content Scroll Filter
      const isMainOrDoc =
        !targetEl ||
        targetEl === document.documentElement ||
        targetEl === document.body ||
        Boolean(targetEl.closest("main"));

      if (!isMainOrDoc) return;

      const scrollContainer =
        targetEl && targetEl !== document.documentElement && targetEl !== document.body
          ? targetEl
          : document.documentElement;

      const currentScrollY =
        targetEl && targetEl !== document.documentElement && targetEl !== document.body
          ? targetEl.scrollTop
          : window.scrollY;

      const maxScroll = (scrollContainer.scrollHeight || 0) - (scrollContainer.clientHeight || 0);

      // Bottom Overscroll Guard
      if (maxScroll > 0 && currentScrollY >= maxScroll - 50) {
        lastScrollY.current = Math.max(0, currentScrollY);
        return;
      }

      const delta = currentScrollY - lastScrollY.current;

      // Scroll Direction Threshold
      if (currentScrollY <= 20) {
        setIsVisible(true);
      } else if (delta > 12) {
        // Scroll Down Hide
        setIsVisible(false);
      } else if (delta < -12) {
        // Scroll Up Show
        setIsVisible(true);
      }
      lastScrollY.current = Math.max(0, currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", handleScroll, { capture: true });
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const isAdmin = user?.role === "branch_admin" || user?.role === "super_admin";

  return (
    <header
      ref={headerRef}
      className={`bg-white z-50 shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
        isVisible
          ? "max-h-36 opacity-100 border-b border-gray-200"
          : "max-h-0 opacity-0 pointer-events-none border-b-0"
      }`}
    >
      {/* Expiry Warning Banner (within 7 days) */}
      {daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
        <div className="bg-amber-500 text-black py-1 px-4 text-xs font-bold text-center tracking-wide flex items-center justify-center space-x-2">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>
            Training access expiring in {daysUntilExpiry} day{daysUntilExpiry === 1 ? "" : "s"} ({new Date(user!.accessExpiresAt!).toLocaleDateString()}). Please complete your required modules or contact your branch administrator.
          </span>
        </div>
      )}

      {/* Offline Demo Warning Banner */}
      {isDemoMode && (
        <div className="bg-gray-800 text-white py-1 px-4 text-xs font-mono text-center tracking-wide flex items-center justify-center space-x-2">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-400" />
          <span>
            OFFLINE DEMO MODE ACTIVE ({user?.name || "Trainee"})
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
            {isAdmin && (
              <Link
                href="/admin"
                className="text-gray-900 hover:text-black bg-gray-100 hover:bg-gray-200 px-2.5 py-1 font-bold flex items-center space-x-1 shrink-0 border border-gray-300"
              >
                <Shield className="w-3.5 h-3.5 text-[#E4002B] shrink-0" />
                <span>Admin Portal</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-gray-900 flex items-center justify-end space-x-1.5">
              <span>{user?.fullName || user?.name || "Trainee"}</span>
              {isAdmin && (
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-black text-white font-bold">
                  {user?.role === "super_admin" ? "SUPER ADMIN" : "BRANCH ADMIN"}
                </span>
              )}
            </div>
            <div className="text-[10px] text-gray-500 font-mono truncate max-w-[220px]">
              {user?.branchName ? `${user.branchCode} - ${user.branchName}` : `Branch ${user?.branchCode || "2438"}`}
            </div>
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
