"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  UserCheck, 
  Check, 
  X, 
  Clock, 
  AlertCircle, 
  Building2, 
  Mail, 
  Phone, 
  Calendar,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";

interface PendingTrainee {
  id: string;
  fullName: string;
  email: string;
  contactNo: string;
  branchCode: string;
  branchName: string;
  branchRegion: string;
  status: string;
  createdAt: string;
}

export default function AdminApprovalsPage() {
  const [pendingList, setPendingList] = useState<PendingTrainee[]>([]);
  const [defaultDays, setDefaultDays] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Approval Modal State (supports single or mass approval)
  const [approvingTrainees, setApprovingTrainees] = useState<PendingTrainee[]>([]);
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reject Modal State (supports single or mass rejection)
  const [rejectingTrainees, setRejectingTrainees] = useState<PendingTrainee[]>([]);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  const allSelected = pendingList.length > 0 && selectedIds.length === pendingList.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingList.map((t) => t.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const fetchApprovals = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/approvals");
      if (!res.ok) throw new Error("Failed to load pending queue");
      const data = await res.json();
      setPendingList(data.pending || []);
      setSelectedIds([]);
      if (data.defaultDays) setDefaultDays(data.defaultDays);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load pending approvals.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApproveSubmit = async () => {
    if (approvingTrainees.length === 0) return;
    setIsSubmitting(true);
    try {
      const targetIds = approvingTrainees.map((t) => t.id);
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: targetIds,
          action: "approve",
          days: isUnlimited ? 0 : selectedDays,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed");

      setActionSuccess(
        data.message ||
          (approvingTrainees.length > 1
            ? `Approved ${approvingTrainees.length} trainee accounts.`
            : `Approved ${approvingTrainees[0].fullName}`)
      );
      setApprovingTrainees([]);
      setSelectedIds((prev) => prev.filter((id) => !targetIds.includes(id)));
      setPendingList((prev) => prev.filter((t) => !targetIds.includes(t.id)));
      if (!data.message?.includes("Demo Mode")) {
        fetchApprovals();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to approve trainee(s).");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (rejectingTrainees.length === 0) return;
    setIsSubmitting(true);
    try {
      const targetIds = rejectingTrainees.map((t) => t.id);
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: targetIds,
          action: "reject",
          rejectionReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rejection failed");

      setActionSuccess(
        data.message ||
          (rejectingTrainees.length > 1
            ? `Declined ${rejectingTrainees.length} trainee registrations.`
            : `Registration declined for ${rejectingTrainees[0].fullName}`)
      );
      setRejectingTrainees([]);
      setRejectionReason("");
      setSelectedIds((prev) => prev.filter((id) => !targetIds.includes(id)));
      setPendingList((prev) => prev.filter((t) => !targetIds.includes(t.id)));
      if (!data.message?.includes("Demo Mode")) {
        fetchApprovals();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to decline registration(s).");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-2 text-amber-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Access Authorization</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pending Trainee Approvals
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Approve or decline new cashier trainee accounts for your branch
          </p>
        </div>

        {/* Feedback Alerts */}
        {actionSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button
              onClick={() => setActionSuccess(null)}
              className="text-emerald-700 hover:text-black font-bold"
            >
              ×
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-700 hover:text-black font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Queue Table Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-slate-600" />
              <h2 className="text-xs font-bold text-slate-800">
                Pending Verification Queue ({pendingList.length})
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchApprovals}
                disabled={isLoading}
                className="text-xs h-7"
              >
                Refresh Queue
              </Button>
            </div>
          </div>

          {/* Bulk Action Toolbar */}
          {selectedIds.length > 0 && (
            <div className="px-4 py-2.5 bg-red-50 border-b border-red-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-3 text-xs">
                <span className="font-bold text-gray-900">
                  {selectedIds.length} trainee{selectedIds.length === 1 ? "" : "s"} selected
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-[11px] font-semibold text-gray-500 hover:text-black underline"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={() => {
                    const selected = pendingList.filter((t) => selectedIds.includes(t.id));
                    setApprovingTrainees(selected);
                    setSelectedDays(defaultDays);
                    setIsUnlimited(false);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-7 px-3 flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mass Approve ({selectedIds.length})</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const selected = pendingList.filter((t) => selectedIds.includes(t.id));
                    setRejectingTrainees(selected);
                    setRejectionReason("");
                  }}
                  className="border-red-400 bg-white text-red-700 hover:bg-red-100 font-bold text-xs h-7 px-3 flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Mass Reject ({selectedIds.length})</span>
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase font-bold border-b border-gray-200 whitespace-nowrap">
                  <th className="py-2.5 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      disabled={pendingList.length === 0}
                      aria-label="Select all pending trainees"
                      className="w-4 h-4 accent-[#E4002B] cursor-pointer align-middle"
                    />
                  </th>
                  <th className="py-2.5 px-3 min-w-[180px]">Trainee Name</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Contact Details</th>
                  <th className="py-2.5 px-3 min-w-[170px]">Branch Assigned</th>
                  <th className="py-2.5 px-3 min-w-[140px]">Registration Date</th>
                  <th className="py-2.5 px-3 text-right min-w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Loading pending approvals...
                    </td>
                  </tr>
                ) : pendingList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                      <div className="font-bold text-gray-700">Approval queue is empty</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        All trainee registrations for your branch have been verified.
                      </div>
                    </td>
                  </tr>
                ) : (
                  pendingList.map((t) => {
                    const isChecked = selectedIds.includes(t.id);
                    return (
                    <tr key={t.id} className={isChecked ? "bg-red-50/40" : "hover:bg-gray-50"}>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(t.id)}
                          aria-label={`Select ${t.fullName}`}
                          className="w-4 h-4 accent-[#E4002B] cursor-pointer align-middle"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-900 text-sm">{t.fullName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">ID: {t.id}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1.5 text-gray-700">
                          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="font-mono break-all">{t.email}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-gray-500 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="font-mono">{t.contactNo}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-900">{t.branchName}</div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          Code: {t.branchCode} • {t.branchRegion}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-600 font-mono whitespace-nowrap">
                        <div>{new Date(t.createdAt).toLocaleDateString()}</div>
                        <div className="text-[10px] text-gray-400">{new Date(t.createdAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setApprovingTrainees([t]);
                              setSelectedDays(defaultDays);
                              setIsUnlimited(false);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-7 px-3 flex items-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setRejectingTrainees([t]);
                              setRejectionReason("");
                            }}
                            className="border-red-300 text-red-700 hover:bg-red-50 font-bold text-xs h-7 px-2.5 flex items-center space-x-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Approve Trainee(s) & Set Expiry */}
        {approvingTrainees.length > 0 && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5 text-emerald-700 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {approvingTrainees.length > 1
                      ? `Mass Approve (${approvingTrainees.length} Learners)`
                      : "Approve Learner Account"}
                  </span>
                </div>
                <button
                  onClick={() => setApprovingTrainees([])}
                  className="text-slate-400 hover:text-slate-800 font-bold text-lg"
                >
                  ×
                </button>
              </div>

              {approvingTrainees.length === 1 ? (
                <div className="text-xs text-gray-700 space-y-1">
                  <div>Approving: <strong className="text-gray-900 text-sm">{approvingTrainees[0].fullName}</strong></div>
                  <div>Email: <span className="font-mono">{approvingTrainees[0].email}</span></div>
                  <div>Branch: <strong>{approvingTrainees[0].branchCode} - {approvingTrainees[0].branchName}</strong></div>
                </div>
              ) : (
                <div className="text-xs text-gray-700 space-y-2">
                  <div>
                    You are about to activate <strong className="text-gray-900">{approvingTrainees.length} trainee accounts</strong> with the same access validity period:
                  </div>
                  <div className="max-h-28 overflow-y-auto bg-gray-50 border border-gray-200 p-2 space-y-1">
                    {approvingTrainees.map((t) => (
                      <div key={t.id} className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-gray-900 truncate pr-2">{t.fullName}</span>
                        <span className="font-mono text-gray-500 shrink-0">{t.branchCode}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Access Expiry Setting */}
              <div className="pt-2 border-t border-gray-200">
                <label className="block text-xs font-bold text-gray-900 uppercase mb-2">
                  Training Access Validity Period
                </label>
                
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => { setSelectedDays(30); setIsUnlimited(false); }}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-colors ${!isUnlimited && selectedDays === 30 ? "bg-[#E4002B] text-white border-[#E4002B]" : "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100"}`}
                  >
                    30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedDays(60); setIsUnlimited(false); }}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-colors ${!isUnlimited && selectedDays === 60 ? "bg-[#E4002B] text-white border-[#E4002B]" : "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100"}`}
                  >
                    60 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedDays(90); setIsUnlimited(false); }}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-colors ${!isUnlimited && selectedDays === 90 ? "bg-[#E4002B] text-white border-[#E4002B]" : "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100"}`}
                  >
                    90 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUnlimited(true)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-colors ${isUnlimited ? "bg-[#E4002B] text-white border-[#E4002B]" : "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100"}`}
                  >
                    No Expiry
                  </button>
                </div>

                {!isUnlimited ? (
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">
                      Or specify custom duration (in days):
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={selectedDays}
                      onChange={(e) => setSelectedDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className="text-xs font-mono h-8"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Account will be active until: <strong className="text-gray-900">{new Date(Date.now() + selectedDays * 86400000).toLocaleDateString()}</strong>
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 border border-amber-200">
                    Account access will never automatically expire. You can adjust or revoke this at any time in the Trainee Directory.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setApprovingTrainees([])}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleApproveSubmit}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  {isSubmitting
                    ? "Approving..."
                    : approvingTrainees.length > 1
                    ? `Confirm & Activate (${approvingTrainees.length})`
                    : "Confirm & Activate Trainee"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Reject Trainee(s) */}
        {rejectingTrainees.length > 0 && (
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2 text-rose-700 font-bold text-base">
                  <ShieldAlert className="w-5 h-5" />
                  <span>
                    {rejectingTrainees.length > 1
                      ? `Mass Decline (${rejectingTrainees.length} Learners)`
                      : "Decline Learner Enrollment"}
                  </span>
                </div>
                <button
                  onClick={() => setRejectingTrainees([])}
                  className="text-slate-400 hover:text-slate-800 font-bold text-lg"
                >
                  ×
                </button>
              </div>

              {rejectingTrainees.length === 1 ? (
                <p className="text-xs text-gray-600">
                  Are you sure you want to decline registration for{" "}
                  <strong className="text-gray-900">{rejectingTrainees[0].fullName}</strong>?
                  This user will not be allowed to log in.
                </p>
              ) : (
                <div className="text-xs text-gray-600 space-y-2">
                  <p>
                    Are you sure you want to decline registrations for{" "}
                    <strong className="text-gray-900">{rejectingTrainees.length} selected trainees</strong>?
                    None of these users will be allowed to log in.
                  </p>
                  <div className="max-h-28 overflow-y-auto bg-gray-50 border border-gray-200 p-2 space-y-1">
                    {rejectingTrainees.map((t) => (
                      <div key={t.id} className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-gray-900 truncate pr-2">{t.fullName}</span>
                        <span className="font-mono text-gray-500 shrink-0">{t.branchCode}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase mb-1">
                  Reason for Declining (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Unverified staff member, incorrect branch selected, or duplicate profile."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRejectingTrainees([])}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleRejectSubmit}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                >
                  {isSubmitting
                    ? "Declining..."
                    : rejectingTrainees.length > 1
                    ? `Confirm Mass Decline (${rejectingTrainees.length})`
                    : "Confirm Decline"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
