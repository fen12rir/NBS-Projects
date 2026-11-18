"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
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
  Clock
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

  // Poll or fetch pending count on mount
  useEffect(() => {
    fetch("/api/admin/approvals")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.pending)) {
          setPendingCount(data.pending.length);
        }
      })
      .catch(() => {});
  }, [pathname]);

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
      badgeColor: "bg-amber-500 text-black",
    },
    {
      title: "Trainee Directory",
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
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900 font-sans">
      {/* Top Banner */}
      <div className="bg-[#E4002B] text-white py-1 px-4 text-xs font-semibold tracking-wide flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span>NATIONAL BOOK STORE • CASHIER ACADEMY MANAGEMENT PORTAL</span>
          <span className="hidden md:inline text-red-200">|</span>
          <span className="hidden md:inline font-mono text-[11px] text-red-100">
            {isSuper ? "GLOBAL ACCESS (SUPER ADMIN)" : `BRANCH SCOPE (${user?.branchCode})`}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <Link
            href="/dashboard"
            className="text-white hover:text-red-100 flex items-center space-x-1 underline font-medium"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Trainee Portal</span>
          </Link>
          <Link
            href="/simulator"
            className="text-white hover:text-red-100 flex items-center space-x-1 underline font-medium"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Simulator</span>
          </Link>
        </div>
      </div>

      {/* Main Admin Header */}
      <header className="bg-white border-b border-gray-300 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-black hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/admin" className="flex items-center space-x-2.5">
              <div className="bg-[#E4002B] text-white px-2 py-0.5 font-black text-lg tracking-tight">
                NBS
              </div>
              <div>
                <div className="font-extrabold text-gray-900 tracking-tight text-base uppercase leading-none">
                  Admin Dashboard
                </div>
                <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                  POS Training Analytics &amp; User Access
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-gray-900 flex items-center justify-end space-x-1.5">
                <span>{user?.fullName || user?.name || "Administrator"}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-black text-white font-bold">
                  {isSuper ? "SUPER ADMIN" : "BRANCH ADMIN"}
                </span>
              </div>
              <div className="text-[11px] text-gray-600 font-mono truncate max-w-[240px]">
                {user?.branchName ? `${user.branchCode} - ${user.branchName}` : (isSuper ? "All 11 Branches" : `Branch ${user?.branchCode}`)}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-1 text-xs border-gray-300 hover:bg-gray-50"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Desktop Sidebar */}
        <aside className="w-64 shrink-0 hidden md:block">
          <nav className="bg-white border border-gray-300 p-3 space-y-1 shadow-sm sticky top-24">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200 mb-2">
              Navigation
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
                  className={`flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-tight transition-colors ${
                    isActive
                      ? "bg-[#E4002B] text-white shadow-sm"
                      : "text-gray-700 hover:bg-red-50 hover:text-[#E4002B]"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 font-extrabold ${isActive ? "bg-white text-black" : item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-gray-200 px-3">
              <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                Branch Scope
              </div>
              <div className="text-xs font-mono font-bold text-gray-800">
                {isSuper ? "All 11 Active Branches" : `${user?.branchCode} - ${user?.branchName || "Assigned Branch"}`}
              </div>
            </div>
          </nav>
        </aside>

        {/* Mobile Sidebar Modal */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 md:hidden flex">
            <div className="w-72 bg-white h-full p-4 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
                  <div className="font-bold text-sm uppercase">Admin Menu</div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-1">
                    <X className="w-5 h-5 text-gray-600" />
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
                        className={`flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase ${
                          isActive
                            ? "bg-[#E4002B] text-white"
                            : "text-gray-700 hover:bg-red-50 hover:text-[#E4002B]"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </div>
                        {item.badge !== null && item.badge !== undefined && (
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 font-bold ${isActive ? "bg-white text-black" : item.badgeColor}`}>
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
