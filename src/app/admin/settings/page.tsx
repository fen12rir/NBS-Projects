"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  KeyRound, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Building2, 
  Mail,
  Shield,
  Eye,
  EyeOff
} from "lucide-react";

export default function AdminSettingsPage() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [demoAccessEnabled, setDemoAccessEnabled] = useState(true);
  const [isTogglingDemo, setIsTogglingDemo] = useState(false);

  const isSuper = user?.role === "super_admin";

  useEffect(() => {
    if (isSuper) {
      fetch("/api/settings/public")
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.demoAccessEnabled === "boolean") {
            setDemoAccessEnabled(data.demoAccessEnabled);
          }
        })
        .catch(() => {});
    }
  }, [isSuper]);

  const handleToggleDemoAccess = async () => {
    setIsTogglingDemo(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    const nextVal = !demoAccessEnabled;
    try {
      const res = await fetch("/api/settings/public", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoAccessEnabled: nextVal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update setting");
      setDemoAccessEnabled(nextVal);
      setSuccessMessage(data.message);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update demo access setting");
    } finally {
      setIsTogglingDemo(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setErrorMessage("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to change password.");
      }

      setSuccessMessage(data.message || "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while updating your password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6 max-w-4xl">
        {/* Page Header */}
        <div className="pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-2 text-[#E4002B] mb-1">
            <KeyRound className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Account Administration</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Administrator Settings
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage your credentials, security preferences, and portal access
          </p>
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 font-bold">×</button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-700 font-bold">×</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Change Password Card (7 cols) */}
          <div className="md:col-span-7 bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Lock className="w-4 h-4 text-[#E4002B]" />
              <h2 className="text-sm font-bold text-slate-900">
                Change Password
              </h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Current Password
                </label>
                <Input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  New Password
                </label>
                <Input
                  type="password"
                  required
                  placeholder="Minimum 8 characters (letters + numbers)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="text-[11px] text-gray-500 bg-gray-50 p-2.5 border border-gray-200 leading-relaxed">
                Password must be at least 8 characters long and contain both letters and numbers.
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full font-bold uppercase tracking-wide py-2.5 bg-[#E4002B] hover:bg-[#C30024] text-white text-xs"
              >
                {isLoading ? "Updating Password..." : "Update Password"}
              </Button>
            </form>
          </div>

          {/* Account Profile Summary Card (5 cols) */}
          <div className="md:col-span-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Shield className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">
                Active Administrator
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Name</span>
                <span className="font-semibold text-slate-900 text-sm">{user?.fullName || user?.name || "Administrator"}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Email Address</span>
                <span className="text-slate-800 break-all">{user?.email || "admin@nbs.com.ph"}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Role &amp; Privileges</span>
                <div className="mt-1">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-none bg-slate-900 text-white font-bold leading-none inline-flex items-center">
                    {isSuper ? "SUPER ADMIN" : "BRANCH ADMIN"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Assigned Scope</span>
                <span className="font-mono text-gray-800">
                  {user?.branchName ? `${user.branchCode} - ${user.branchName}` : (isSuper ? "All 11 Retail Branches" : `Branch ${user?.branchCode}`)}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Security Status</span>
                <div className="mt-1 flex items-center space-x-1.5 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified &amp; Active Session</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Super Admin Portal Controls: Instant Demo Access Visibility */}
        {isSuper && (
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  demoAccessEnabled
                    ? "bg-amber-50 text-amber-600 border border-amber-200"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}
              >
                {demoAccessEnabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-bold text-slate-900">
                    Instant Demo Access Visibility
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase leading-none ${
                      demoAccessEnabled
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {demoAccessEnabled ? "VISIBLE" : "HIDDEN"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {demoAccessEnabled
                    ? "The 'Admin Demo' and 'Trainee Demo' buttons are currently shown on the Login and Landing pages."
                    : "Instant Demo Access is hidden on the Login and Landing pages. Only registered users can sign in."}
                </p>
              </div>
            </div>

            <Button
              variant={demoAccessEnabled ? "outline" : "primary"}
              size="sm"
              disabled={isTogglingDemo}
              onClick={handleToggleDemoAccess}
              className="text-xs font-semibold shrink-0 flex items-center space-x-1.5"
            >
              {demoAccessEnabled ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>{isTogglingDemo ? "Hiding..." : "Hide Demo Access"}</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isTogglingDemo ? "Showing..." : "Show Demo Access"}</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
