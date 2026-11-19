"use client";

import React, { useState } from "react";
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
  Shield
} from "lucide-react";

export default function AdminSettingsPage() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isSuper = user?.role === "super_admin";

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
        <div className="pb-4 border-b border-gray-300">
          <div className="flex items-center space-x-2 text-[#E4002B] mb-1">
            <KeyRound className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Account Administration</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
            Administrator Settings
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Manage your credentials, security preferences, and portal access
          </p>
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 font-bold">×</button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-red-700 font-bold">×</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Change Password Card (7 cols) */}
          <div className="md:col-span-7 bg-white border border-gray-300 shadow-sm p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
              <Lock className="w-4 h-4 text-[#E4002B]" />
              <h2 className="text-sm font-bold uppercase tracking-tight text-gray-900">
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
          <div className="md:col-span-5 bg-white border border-gray-300 shadow-sm p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
              <Shield className="w-4 h-4 text-gray-700" />
              <h2 className="text-sm font-bold uppercase tracking-tight text-gray-900">
                Active Administrator
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Name</span>
                <span className="font-bold text-gray-900 text-sm">{user?.fullName || user?.name || "Administrator"}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Email Address</span>
                <span className="font-mono text-gray-800 break-all">{user?.email || "admin@nbs.com.ph"}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Role &amp; Privileges</span>
                <div className="mt-1">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-black text-white font-bold leading-none inline-flex items-center">
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
      </div>
    </AdminShell>
  );
}
