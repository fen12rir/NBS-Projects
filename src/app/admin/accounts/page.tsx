"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableBranchSelect } from "@/components/ui/searchable-branch-select";
import { 
  ShieldCheck, 
  UserPlus, 
  Mail, 
  Lock, 
  Building2, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle,
  Archive,
  RotateCcw,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";

interface AdminAccount {
  id: string;
  fullName: string;
  email: string;
  contactNo: string;
  branchCode: string;
  branchName: string;
  role: "branch_admin" | "super_admin";
  status: string;
  lastLoginAt?: string | null;
  createdAt: string;
}

export default function AdminAccountsPage() {
  const { user: currentUser } = useAuth();
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [branches, setBranches] = useState<Array<{ code: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "deactivated">("all");
  const [demoAccessEnabled, setDemoAccessEnabled] = useState(true);
  const [isTogglingDemo, setIsTogglingDemo] = useState(false);

  // Form state
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    contactNo: "",
    branchCode: "2438",
    role: "branch_admin",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/accounts");
      if (!res.ok) throw new Error("Failed to load admin accounts");
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetch("/api/branches")
      .then((res) => res.json())
      .then((data) => {
        if (data.branches) setBranches(data.branches);
      })
      .catch(() => {});
    fetch("/api/settings/public")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.demoAccessEnabled === "boolean") {
          setDemoAccessEnabled(data.demoAccessEnabled);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleDemoAccess = async () => {
    setIsTogglingDemo(true);
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
      setFeedback(data.message);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update demo access setting");
    } finally {
      setIsTogglingDemo(false);
    }
  };

  const handleArchiveToggle = async (account: AdminAccount) => {
    const isArchived = account.status === "deactivated";
    const nextStatus = isArchived ? "active" : "deactivated";
    const actionLabel = isArchived ? "Restore" : "Archive";
    if (!confirm(`${actionLabel} administrator account for ${account.fullName} (${account.email})?`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: account.id, status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${actionLabel.toLowerCase()} account`);
      setFeedback(data.message);
      setAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...a, status: nextStatus } : a))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update account status");
    }
  };

  const handleDeleteAccount = async (account: AdminAccount) => {
    if (
      !confirm(
        `Permanently delete administrator account for ${account.fullName} (${account.email})? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/accounts?userId=${encodeURIComponent(account.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account");
      setFeedback(data.message);
      setAccounts((prev) => prev.filter((a) => a.id !== account.id));
    } catch (err: any) {
      alert(err.message || "Failed to delete account");
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create administrator");

      setFeedback(data.message || "Administrator account created");
      setShowCreateModal(false);
      setForm({
        fullName: "",
        email: "",
        contactNo: "",
        branchCode: "2438",
        role: "branch_admin",
        password: "",
      });
      fetchAccounts();
    } catch (err: any) {
      setErrorMessage(err.message || "Creation error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2 text-[#E4002B] mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Enterprise Access Governance</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Administrative Accounts
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Manage branch training supervisors and enterprise L&amp;D administrators
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="bg-[#E4002B] hover:bg-[#C30024] text-white font-semibold flex items-center space-x-1.5 text-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Administrator</span>
          </Button>
        </div>

        {/* Feedback Alerts */}
        {feedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-emerald-700 font-bold">×</button>
          </div>
        )}

        {/* Instant Demo Access Visibility Toggle Card (Super Admin) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  Instant Demo Access on Login &amp; Landing Page
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
                  ? "Visitors on the Login and Landing pages can currently see and use the 'Admin Demo' and 'Trainee Demo' buttons."
                  : "Demo buttons are hidden from the Login and Landing pages. Only real registered accounts can sign in."}
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

        {/* Accounts Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xs font-bold text-slate-800">
              Administrator Accounts ({accounts.filter((a) => statusFilter === "all" || a.status === statusFilter).length})
            </h2>
            <div className="flex items-center space-x-1.5 text-xs">
              {(["all", "active", "deactivated"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                    statusFilter === tab
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab === "all" ? "All" : tab === "active" ? "Active" : "Archived"}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase font-bold border-b border-gray-200 whitespace-nowrap">
                  <th className="py-2.5 px-3 min-w-[180px]">Name</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Email &amp; Contact</th>
                  <th className="py-2.5 px-3 min-w-[130px]">Role</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Branch Assignment</th>
                  <th className="py-2.5 px-3 min-w-[140px]">Last Login</th>
                  <th className="py-2.5 px-3 text-center min-w-[90px]">Status</th>
                  <th className="py-2.5 px-3 text-right min-w-[160px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      Loading administrator accounts...
                    </td>
                  </tr>
                ) : (
                  accounts
                    .filter((a) => statusFilter === "all" || a.status === statusFilter)
                    .map((a) => {
                      const isSelf = currentUser?.id === a.id || currentUser?.email === a.email;
                      const isArchived = a.status === "deactivated";
                      return (
                        <tr key={a.id} className={`hover:bg-gray-50 ${isArchived ? "bg-slate-50/70 opacity-75" : ""}`}>
                          <td className="py-3 px-3">
                            <div className="font-bold text-gray-900 text-sm flex items-center space-x-1.5">
                              <span>{a.fullName}</span>
                              {isSelf && (
                                <span className="text-[10px] font-mono bg-red-50 text-[#E4002B] border border-red-200 px-1.5 py-0.2 rounded-none">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">ID: {a.id}</div>
                          </td>
                          <td className="py-3 px-3 font-mono">
                            <div className="text-gray-800 break-all">{a.email}</div>
                            <div className="text-[10px] text-gray-500">{a.contactNo}</div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase shrink-0 leading-none inline-flex items-center ${
                                a.role === "super_admin"
                                  ? "bg-slate-900 text-white"
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}
                            >
                              {a.role === "super_admin" ? "SUPER ADMIN" : "BRANCH ADMIN"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {a.role === "super_admin" ? (
                              <span className="text-slate-500 font-medium">All Branches</span>
                            ) : (
                              <div>
                                <span className="font-semibold text-slate-900">{a.branchName}</span>
                                <span className="text-[10px] text-slate-500 font-mono block">Code: {a.branchCode}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                            {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString() : "Never"}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase leading-none inline-flex items-center justify-center ${
                                isArchived
                                  ? "bg-slate-100 text-slate-600 border border-slate-300"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {isArchived ? "ARCHIVED" : "ACTIVE"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            {isSelf ? (
                              <span className="text-[11px] text-slate-400 italic">Current Session</span>
                            ) : (
                              <div className="inline-flex items-center space-x-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleArchiveToggle(a)}
                                  className="h-7 px-2 text-[11px] font-semibold flex items-center space-x-1"
                                  title={isArchived ? "Restore Administrator" : "Archive Administrator"}
                                >
                                  {isArchived ? (
                                    <>
                                      <RotateCcw className="w-3 h-3 text-emerald-600" />
                                      <span>Restore</span>
                                    </>
                                  ) : (
                                    <>
                                      <Archive className="w-3 h-3 text-amber-600" />
                                      <span>Archive</span>
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteAccount(a)}
                                  className="h-7 px-2 text-[11px] font-semibold border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center space-x-1"
                                  title="Delete Administrator Permanently"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create Administrator */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E4002B] flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span>Create Administrator Account</span>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-800 font-bold text-lg"
                >
                  ×
                </button>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-red-50 border border-red-300 text-red-700 text-xs flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Full Name <span className="text-[#E4002B]">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. Maria Clara"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Email Address <span className="text-[#E4002B]">*</span>
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="name@nbs.com.ph"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Contact No.
                  </label>
                  <Input
                    placeholder="09171234567"
                    value={form.contactNo}
                    onChange={(e) => setForm({ ...form, contactNo: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Role <span className="text-[#E4002B]">*</span>
                    </label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                      className="w-full border border-gray-300 p-2 text-xs font-bold"
                    >
                      <option value="branch_admin">Branch Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Assigned Branch
                    </label>
                    {form.role === "super_admin" ? (
                      <div className="border border-gray-200 bg-gray-100 p-2 text-xs text-gray-500 font-mono">
                        Global Access (All Branches)
                      </div>
                    ) : (
                      <SearchableBranchSelect
                        branches={branches}
                        value={form.branchCode}
                        onChange={(code) => setForm({ ...form, branchCode: code })}
                        includeAllOption={false}
                        placeholder="Type branch or code..."
                        className="w-full sm:w-full"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Initial Password <span className="text-[#E4002B]">*</span>
                  </label>
                  <Input
                    type="password"
                    required
                    placeholder="Min. 8 characters (letters + numbers)"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="bg-[#E4002B] hover:bg-[#C30024] text-white font-bold"
                  >
                    {isSubmitting ? "Creating..." : "Create Administrator"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
