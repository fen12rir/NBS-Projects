"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
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
  AlertCircle 
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
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [branches, setBranches] = useState<Array<{ code: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
  }, []);

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-300">
          <div>
            <div className="flex items-center space-x-2 text-[#E4002B] mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Super Administrator Console</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
              Administrative Accounts
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Manage branch supervisors and platform system administrators
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="bg-[#E4002B] hover:bg-[#C30024] text-white font-bold flex items-center space-x-1.5 text-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Administrator</span>
          </Button>
        </div>

        {/* Feedback Alerts */}
        {feedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-emerald-700 font-bold">×</button>
          </div>
        )}

        {/* Accounts Table */}
        <div className="bg-white border border-gray-300 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">
              Active Administrators ({accounts.length})
            </h2>
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
                  <th className="py-2.5 px-3 text-center min-w-[80px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Loading administrator accounts...
                    </td>
                  </tr>
                ) : (
                  accounts.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-900 text-sm">{a.fullName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">ID: {a.id}</div>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <div className="text-gray-800 break-all">{a.email}</div>
                        <div className="text-[10px] text-gray-500">{a.contactNo}</div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase shrink-0 leading-none inline-flex items-center ${
                            a.role === "super_admin"
                              ? "bg-black text-white"
                              : "bg-blue-100 text-blue-900 border border-blue-300"
                          }`}
                        >
                          {a.role === "super_admin" ? "SUPER ADMIN" : "BRANCH ADMIN"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {a.role === "super_admin" ? (
                          <span className="text-gray-500 font-medium">All Branches (Global)</span>
                        ) : (
                          <div>
                            <span className="font-bold text-gray-900">{a.branchName}</span>
                            <span className="text-[10px] text-gray-500 font-mono block">Code: {a.branchCode}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-600 whitespace-nowrap">
                        {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString() : "Never"}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 leading-none inline-flex items-center justify-center">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create Administrator */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full border-4 border-gray-900 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center space-x-2 text-[#E4002B] font-black uppercase text-base">
                  <UserPlus className="w-5 h-5" />
                  <span>Create Administrator Account</span>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-black font-bold text-lg"
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
