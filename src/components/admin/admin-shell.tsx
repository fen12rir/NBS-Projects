"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useAutoRefresh } from "@/lib/use-auto-refresh";
import { Button } from "@/components/ui/button";
import { PortalLoadingScreen } from "@/components/ui/portal-loading-screen";
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  Building2, 
  ShieldCheck, 
  LogOut, 
  Monitor, 
  Menu, 
  X, 
  ChevronRight,
  BookOpen,
  Shield,
  Layers,
  Clock,
  User
} from "lucide-react";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const fetchPendingCount = useCallback(() => {
    fetch("/api/admin/approvals", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.pending)) {
          setPendingCount(data.pending.length);
        }
      })
      .catch(() => {});
  }, []);

  // Pending approvals count
  useEffect(() => {
    fetchPendingCount();
  }, [pathname, fetchPendingCount]);

  useAutoRefresh(fetchPendingCount, { intervalMs: 20000 });

  const isSuper = user?.role === "super_admin";

  const navItems = [
    {
      title: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "Pending Approvals",
      href: "/admin/approvals",
      icon: UserCheck,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: "bg-amber-400 text-slate-950",
    },
    {
      title: "Trainee List",
      href: "/admin/trainees",
      icon: Users,
    },
    ...(isSuper
      ? [
          {
            title: "Branches",
            href: "/admin/branches",
            icon: Building2,
          },
          {
            title: "Admin Accounts",
            href: "/admin/accounts",
            icon: ShieldCheck,
          },
        ]
      : []),
    {
      title: "Settings",
      href: "/admin/settings",
      icon: User,
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (isLoading) {
    return <PortalLoadingScreen message="Loading Admin Portal Session..." />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Corporate Utility Bar */}
      <div className="bg-slate-900 text-slate-300 py-1.5 px-4 text-xs font-medium flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-white">National Book Store</span>
          <span className="text-slate-600">•</span>
          <span>POS Training Admin Portal</span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-[11px] text-slate-400">
            {isSuper ? "All 11 Branches (Super Admin)" : `Branch Scope (${user?.branchCode})`}
          </span>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <Link
            href="/dashboard"
            className="text-slate-300 hover:text-white flex items-center space-x-1.5 font-medium transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-red-400" />
            <span>Trainee Portal</span>
          </Link>
          <Link
            href="/simulator"
            className="text-slate-300 hover:text-white flex items-center space-x-1.5 font-medium transition-colors"
          >
            <Monitor className="w-3.5 h-3.5 text-emerald-400" />
            <span>POS Simulator</span>
          </Link>
        </div>
      </div>

      {/* Main Admin Header */}
      <header className="bg-white/95 backdrop-blur-xs border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/admin" className="flex items-center space-x-3 shrink-0">
              <div className="bg-[#E4002B] text-white px-2 py-0.5 rounded-none font-heading font-black text-lg tracking-tight shadow-xs">
                NBS
              </div>
              <div>
                <div className="font-bold text-slate-900 tracking-tight text-sm sm:text-base leading-tight whitespace-nowrap">
                  Admin Dashboard
                </div>
                <div className="text-[11px] text-slate-500 font-medium hidden sm:block whitespace-nowrap">
                  Cashier Training &amp; Progress Monitoring
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="text-right hidden md:flex flex-col items-end justify-center">
              <div className="text-xs font-semibold text-slate-900 whitespace-nowrap">
                {user?.fullName || user?.name || "System Administrator"}
              </div>
              <div className="mt-0.5 flex items-center space-x-1.5">
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-none bg-slate-900 text-white font-bold shrink-0 whitespace-nowrap leading-none inline-flex items-center">
                  {isSuper ? "SUPER ADMIN" : "BRANCH ADMIN"}
                </span>
                <span className="text-[11px] text-slate-500 whitespace-nowrap">
                  {user?.branchName ? `${user.branchCode} • ${user.branchName}` : (isSuper ? "All 11 Branches" : `Branch ${user?.branchCode}`)}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-1.5 text-xs"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Desktop Corporate Navy Sidebar */}
        <aside className="w-60 shrink-0 hidden md:block">
          <nav className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 p-3.5 space-y-1 shadow-md sticky top-24">
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-2">
              Admin Menu
            </div>
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#E4002B] text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-none font-bold shrink-0 inline-flex items-center justify-center leading-none ${isActive ? "bg-white text-slate-900" : item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-800 px-3 pb-1">
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mb-1">
                Branch Scope
              </div>
              <div className="text-xs font-medium text-slate-200">
                {isSuper ? "All 11 NBS Branches" : `${user?.branchCode} • ${user?.branchName || "Assigned Branch"}`}
              </div>
            </div>
          </nav>
        </aside>

        {/* Mobile Sidebar Modal */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-xs md:hidden flex">
            <div className="w-72 bg-slate-900 text-slate-100 h-full p-4 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="font-bold text-sm text-white">Admin Menu</div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = item.exact
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                          isActive
                            ? "bg-[#E4002B] text-white"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </div>
                        {item.badge !== null && item.badge !== undefined && (
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-none font-bold shrink-0 inline-flex items-center justify-center leading-none ${isActive ? "bg-white text-slate-900" : item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center space-x-1.5 text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Pane */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
