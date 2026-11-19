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

  // Approval Modal State
  const [approvingTrainee, setApprovingTrainee] = useState<PendingTrainee | null>(null);
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reject Modal State
  const [rejectingTrainee, setRejectingTrainee] = useState<PendingTrainee | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  const fetchApprovals = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/approvals");
      if (!res.ok) throw new Error("Failed to load pending queue");
      const data = await res.json();
      setPendingList(data.pending || []);
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
    if (!approvingTrainee) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: approvingTrainee.id,
          action: "approve",
          days: isUnlimited ? 0 : selectedDays,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed");

      setActionSuccess(data.message || `Approved ${approvingTrainee.fullName}`);
      setApprovingTrainee(null);
      fetchApprovals();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to approve trainee.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingTrainee) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: rejectingTrainee.id,
          action: "reject",
          rejectionReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rejection failed");

      setActionSuccess(data.message || `Registration declined for ${rejectingTrainee.fullName}`);
      setRejectingTrainee(null);
      setRejectionReason("");
      fetchApprovals();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to decline registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="pb-4 border-b border-gray-300">
          <div className="flex items-center space-x-2 text-amber-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Access Authorization</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
            Pending Trainee Approvals
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Review and grant portal access to newly registered cashiers and staff
          </p>
        </div>

        {/* Feedback Alerts */}
        {actionSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center justify-between">
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
          <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-700 hover:text-black font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Queue Table Card */}
        <div className="bg-white border border-gray-300 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-gray-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                Pending Verification Queue ({pendingList.length})
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchApprovals}
              disabled={isLoading}
              className="text-xs h-7 border-gray-300"
            >
              Refresh Queue
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase font-bold border-b border-gray-200 whitespace-nowrap">
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
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      Loading pending approvals...
                    </td>
                  </tr>
                ) : pendingList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                      <div className="font-bold text-gray-700">Approval queue is empty</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        All trainee registrations for your branch have been verified.
                      </div>
                    </td>
                  </tr>
                ) : (
                  pendingList.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
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
                              setApprovingTrainee(t);
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
                              setRejectingTrainee(t);
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Approve Trainee & Set Expiry */}
        {approvingTrainee && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full border-4 border-[#E4002B] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center space-x-2 text-emerald-700 font-black uppercase text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Approve Trainee Account</span>
                </div>
                <button
                  onClick={() => setApprovingTrainee(null)}
                  className="text-gray-400 hover:text-black font-bold text-lg"
                >
                  ×
                </button>
              </div>

              <div className="text-xs text-gray-700 space-y-1">
                <div>Approving: <strong className="text-gray-900 text-sm">{approvingTrainee.fullName}</strong></div>
                <div>Email: <span className="font-mono">{approvingTrainee.email}</span></div>
                <div>Branch: <strong>{approvingTrainee.branchCode} - {approvingTrainee.branchName}</strong></div>
              </div>

              {/* Access Expiry Setting */}
              <div className="pt-2 border-t border-gray-200">
                <label className="block text-xs font-bold text-gray-900 uppercase mb-2">
                  Training Access Validity Period
                </label>
                
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => { setSelectedDays(30); setIsUnlimited(false); }}
                    className={`py-1.5 px-2 text-xs font-bold border ${!isUnlimited && selectedDays === 30 ? "bg-[#E4002B] text-white border-[#E4002B]" : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"}`}
                  >
                    30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedDays(60); setIsUnlimited(false); }}
                    className={`py-1.5 px-2 text-xs font-bold border ${!isUnlimited && selectedDays === 60 ? "bg-[#E4002B] text-white border-[#E4002B]" : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"}`}
                  >
                    60 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedDays(90); setIsUnlimited(false); }}
                    className={`py-1.5 px-2 text-xs font-bold border ${!isUnlimited && selectedDays === 90 ? "bg-[#E4002B] text-white border-[#E4002B]" : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"}`}
                  >
                    90 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUnlimited(true)}
                    className={`py-1.5 px-2 text-xs font-bold border ${isUnlimited ? "bg-[#E4002B] text-white border-[#E4002B]" : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"}`}
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
                  onClick={() => setApprovingTrainee(null)}
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
                  {isSubmitting ? "Approving..." : "Confirm & Activate Trainee"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Reject Trainee */}
        {rejectingTrainee && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full border-4 border-red-600 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center space-x-2 text-red-700 font-black uppercase text-base">
                  <ShieldAlert className="w-5 h-5" />
                  <span>Decline Trainee Registration</span>
                </div>
                <button
                  onClick={() => setRejectingTrainee(null)}
                  className="text-gray-400 hover:text-black font-bold text-lg"
                >
                  ×
                </button>
              </div>

              <p className="text-xs text-gray-600">
                Are you sure you want to decline registration for{" "}
                <strong className="text-gray-900">{rejectingTrainee.fullName}</strong>?
                This user will not be allowed to log in.
              </p>

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
                  onClick={() => setRejectingTrainee(null)}
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
                  {isSubmitting ? "Declining..." : "Confirm Decline"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
