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
  Clock,
  Lock,
  CheckCircle2,
  AlertCircle,
  X,
  Settings
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

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      setPasswordSuccess(data.message || "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

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
      className={`bg-white z-50 shrink-0 transition-all duration-300 ease-in-out ${
        isVisible
          ? "max-h-36 opacity-100 border-b border-gray-200 overflow-visible"
          : "max-h-0 opacity-0 pointer-events-none border-b-0 overflow-hidden"
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
        <div className="bg-slate-900 text-slate-200 py-1 px-4 text-xs font-medium text-center flex items-center justify-center space-x-2">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-400" />
          <span>
            Practice Demo Mode Active • {user?.name || "Trainee"}
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center space-x-1.5 sm:space-x-3 lg:space-x-4 min-w-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Toggle Navigation Sidebar"
              title="Toggle Training Guide Sidebar"
              className="p-2 rounded-lg text-slate-600 hover:text-[#E4002B] hover:bg-red-50 cursor-pointer transition-colors border border-transparent hover:border-red-100 shrink-0"
            >
              <PanelLeft className="w-5 h-5 shrink-0" />
            </button>
          )}
          <Link href="/dashboard" className="flex items-center space-x-2.5 shrink-0">
            <div className="bg-[#E4002B] text-white px-2.5 py-0.5 rounded-none font-heading font-extrabold text-lg tracking-tighter shadow-xs">
              NBS
            </div>
            <div>
              <div className="font-bold text-slate-900 tracking-tight text-xs sm:text-sm leading-tight whitespace-nowrap">
                POS Training Portal
              </div>
              <div className="text-[11px] text-slate-500 font-medium leading-tight whitespace-nowrap hidden sm:block">
                Cashier Practice &amp; Guide
              </div>
            </div>
          </Link>
          <div className="h-5 w-px bg-slate-200 hidden lg:block shrink-0"></div>
          <nav className="hidden lg:flex items-center space-x-2 text-xs sm:text-sm font-medium shrink-0">
            <Link
              href="/dashboard"
              className="text-slate-700 hover:text-[#E4002B] hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              Modules
            </Link>
            <Link
              href="/simulator"
              className="text-[#E4002B] bg-red-50 hover:bg-red-100/80 px-3 py-1.5 font-semibold flex items-center space-x-1.5 shrink-0 rounded-lg border border-red-200/60 transition-colors"
            >
              <Monitor className="w-3.5 h-3.5 shrink-0" />
              <span>POS Simulator</span>
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-slate-800 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 font-semibold flex items-center space-x-1.5 shrink-0 rounded-lg border border-slate-200 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-[#E4002B] shrink-0" />
                <span>Admin Portal</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
          <div className="text-right hidden md:block">
            <div className="text-xs font-semibold text-slate-900 flex items-center justify-end space-x-1.5">
              <span className="truncate max-w-[160px] lg:max-w-none">{user?.fullName || user?.name || "Trainee"}</span>
              {isAdmin && (
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-none bg-slate-900 text-white font-bold leading-none shrink-0">
                  {user?.role === "super_admin" ? "SUPER ADMIN" : "BRANCH ADMIN"}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 truncate max-w-[160px] lg:max-w-[220px]">
              {user?.branchName ? `${user.branchCode} • ${user.branchName}` : `Branch ${user?.branchCode || "2438"}`}
            </div>
          </div>

          {/* Settings Gear Dropdown */}
          <div ref={settingsMenuRef} className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettingsMenu((prev) => !prev)}
              title="Account Settings"
              aria-label="Account Settings"
              aria-expanded={showSettingsMenu}
              className={`flex items-center justify-center p-2 border-slate-300 shrink-0 rounded-lg ${
                showSettingsMenu ? "border-[#E4002B] text-[#E4002B] bg-red-50" : "text-slate-700 hover:text-[#E4002B]"
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
            </Button>

            {showSettingsMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Learner Account
                  </div>
                  <div className="text-xs font-semibold text-slate-900 truncate mt-0.5">
                    {user?.fullName || user?.name || "Trainee"}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {user?.branchName ? `${user.branchCode} • ${user.branchName}` : `Branch ${user?.branchCode || "2438"}`}
                  </div>
                  {user?.email && (
                    <div className="text-[11px] text-slate-400 truncate">
                      {user.email}
                    </div>
                  )}
                </div>
                <div className="py-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSettingsMenu(false);
                      setShowPasswordModal(true);
                      setPasswordError(null);
                      setPasswordSuccess(null);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-[#E4002B] flex items-center space-x-2.5 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Change Password</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center space-x-1 text-xs shrink-0"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Trainee Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5 text-slate-900 font-bold text-base">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E4002B] flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <span>Change Account Password</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-700 rounded-lg p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 chars (letters + numbers)"
                  className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                />
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                Password must be at least 8 characters long with letters and numbers.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  size="sm"
                  className="bg-[#E4002B] hover:bg-[#C30024] text-white font-semibold text-xs"
                >
                  {isUpdatingPassword ? "Saving..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
