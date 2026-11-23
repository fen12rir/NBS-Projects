"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  CheckCircle2, 
  Clock, 
  Award, 
  MapPin, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  UserCheck,
  User,
  ExternalLink
} from "lucide-react";

interface BranchSummary {
  code: string;
  name: string;
  region: string;
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  certifiedUsers: number;
}

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<BranchSummary[]>([]);
  const [trainees, setTrainees] = useState<any[]>([]);
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/trainees").then((r) => r.json()).catch(() => ({ trainees: [] })),
    ])
      .then(([statsData, traineesData]) => {
        setBranches(statsData.branches || []);
        setTrainees(traineesData.trainees || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const totalTraineesAcrossBranches = branches.reduce((acc, b) => acc + b.totalUsers, 0);
  const totalCertifiedAcrossBranches = branches.reduce((acc, b) => acc + b.certifiedUsers, 0);

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-2 text-[#E4002B] mb-1">
            <Building2 className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Store Branches</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            NBS Retail Branches
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Active stores participating in the cashier POS training program
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-xs">
            <div className="text-[11px] sm:text-xs font-semibold text-slate-500 mb-1">Active Branches</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900">{branches.length} Stores</div>
            <div className="text-[11px] text-slate-400 mt-1">NCR, CAR, Region I &amp; Region III</div>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-xs">
            <div className="text-[11px] sm:text-xs font-semibold text-slate-500 mb-1">Total Trainees</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900">{totalTraineesAcrossBranches}</div>
            <div className="text-[11px] text-slate-400 mt-1">Across all branches</div>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-xs">
            <div className="text-[11px] sm:text-xs font-semibold text-slate-500 mb-1">Certified Cashiers</div>
            <div className="text-xl sm:text-2xl font-bold text-[#E4002B]">{totalCertifiedAcrossBranches}</div>
            <div className="text-[11px] text-slate-400 mt-1">Finished training &amp; exam</div>
          </div>
        </div>

        {/* Branches Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200">
            <h2 className="text-xs font-bold text-slate-800">
              Branch Roster &amp; Competency Status
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase font-bold border-b border-gray-200 whitespace-nowrap">
                  <th className="py-2.5 px-3 min-w-[90px]">Branch Code</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Store Name</th>
                  <th className="py-2.5 px-3 min-w-[160px]">Region</th>
                  <th className="py-2.5 px-3 text-center min-w-[70px]">Enrolled</th>
                  <th className="py-2.5 px-3 text-center text-emerald-700 min-w-[70px]">Active</th>
                  <th className="py-2.5 px-3 text-center text-amber-600 min-w-[70px]">Pending</th>
                  <th className="py-2.5 px-3 text-center text-[#E4002B] min-w-[70px]">Certified</th>
                  <th className="py-2.5 px-3 text-center min-w-[80px]">Status</th>
                  <th className="py-2.5 px-3 text-right min-w-[140px]">Branch Cashiers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
                      Loading branches and enrolled cashiers...
                    </td>
                  </tr>
                ) : (
                  branches.map((b) => {
                    const isExpanded = expandedBranch === b.code;
                    const branchTrainees = trainees.filter((t) => t.branchCode === b.code);

                    return (
                      <React.Fragment key={b.code}>
                        <tr
                          onClick={() => setExpandedBranch(isExpanded ? null : b.code)}
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                            isExpanded ? "bg-red-50/50" : ""
                          }`}
                        >
                          <td className="py-3 px-3 font-mono font-bold text-gray-900">
                            {b.code}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-gray-900 text-sm flex items-center space-x-1.5">
                              <span>{b.name}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-[#E4002B]" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-medium text-gray-600">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span>{b.region}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-gray-900">
                            {b.totalUsers}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                            {b.activeUsers}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-amber-600">
                            {b.pendingUsers}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-[#E4002B]">
                            {b.certifiedUsers}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 leading-none inline-flex items-center justify-center">
                              ACTIVE
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setExpandedBranch(isExpanded ? null : b.code)}
                              className={`text-xs h-7 px-2 font-bold flex items-center space-x-1 ml-auto ${
                                isExpanded ? "border-[#E4002B] text-[#E4002B] bg-red-50" : "border-gray-300 text-gray-700"
                              }`}
                            >
                              <span>{isExpanded ? "Hide Roster" : `View Cashiers (${branchTrainees.length})`}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </td>
                        </tr>

                        {/* Expandable Accordion Drawer */}
                        {isExpanded && (
                          <tr className="bg-slate-50 border-y-2 border-red-200">
                            <td colSpan={9} className="p-4 sm:p-5">
                              <div className="space-y-4">
                                {/* Drawer Top Bar */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200">
                                  <div className="flex items-center space-x-2">
                                    <Users className="w-4 h-4 text-[#E4002B]" />
                                    <h3 className="font-extrabold text-sm uppercase text-gray-900 tracking-tight">
                                      {b.name} • Enrolled Cashiers ({branchTrainees.length})
                                    </h3>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    {b.pendingUsers > 0 && (
                                      <Link href="/admin/approvals">
                                        <Button
                                          size="sm"
                                          className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold h-7 px-2.5 flex items-center space-x-1"
                                        >
                                          <UserCheck className="w-3.5 h-3.5" />
                                          <span>Pending Approvals ({b.pendingUsers})</span>
                                        </Button>
                                      </Link>
                                    )}

                                    <Link href={`/admin/trainees?branch=${b.code}`}>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-gray-300 text-gray-800 text-xs font-bold h-7 px-2.5 flex items-center space-x-1 hover:border-[#E4002B] hover:text-[#E4002B]"
                                      >
                                        <span>Open in Directory</span>
                                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                                      </Button>
                                    </Link>
                                  </div>
                                </div>

                                {/* Trainees List */}
                                {branchTrainees.length === 0 ? (
                                  <div className="py-6 text-center text-xs text-gray-400 bg-white border border-dashed border-gray-300">
                                    No trainees or cashiers currently registered under this branch.
                                  </div>
                                ) : (
                                  <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                                    <table className="w-full text-left text-xs">
                                      <thead>
                                        <tr className="bg-gray-100/80 text-gray-600 uppercase font-bold border-b border-gray-200">
                                          <th className="py-2 px-3">Cashier Name</th>
                                          <th className="py-2 px-3">Contact</th>
                                          <th className="py-2 px-3 text-center">Status</th>
                                          <th className="py-2 px-3">Curriculum Progress</th>
                                          <th className="py-2 px-3 text-center">Exam Result</th>
                                          <th className="py-2 px-3 text-right">Action</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {branchTrainees.map((t) => (
                                          <tr key={t.id} className="hover:bg-gray-50">
                                            <td className="py-2.5 px-3">
                                              <Link
                                                href={`/admin/trainees/${t.id}`}
                                                className="font-bold text-gray-900 hover:text-[#E4002B]"
                                              >
                                                {t.fullName}
                                              </Link>
                                              <div className="text-[10px] text-gray-400 font-mono">ID: {t.id}</div>
                                            </td>
                                            <td className="py-2.5 px-3 font-mono text-gray-600">
                                              <div>{t.email}</div>
                                              <div className="text-[10px] text-gray-400">{t.contactNo}</div>
                                            </td>
                                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                              <span
                                                className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase leading-none ${
                                                  t.status === "active"
                                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                                    : t.status === "pending"
                                                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                                                    : "bg-gray-100 text-gray-700"
                                                }`}
                                              >
                                                {t.status}
                                              </span>
                                            </td>
                                            <td className="py-2.5 px-3 min-w-[140px]">
                                              <div className="flex items-center justify-between text-[10px] mb-1">
                                                <span className="font-bold text-gray-700">
                                                  {t.completedLessonsCount} / {t.totalLessonsCount} lessons
                                                </span>
                                                <span className="font-mono text-gray-500">{t.progressPercent}%</span>
                                              </div>
                                              <div className="w-full bg-gray-200 h-1.5 overflow-hidden">
                                                <div
                                                  className={`h-full ${
                                                    t.progressPercent === 100 ? "bg-emerald-500" : "bg-[#E4002B]"
                                                  }`}
                                                  style={{ width: `${t.progressPercent}%` }}
                                                />
                                              </div>
                                            </td>
                                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                              {t.examPassed ? (
                                                <div className="inline-flex items-center space-x-1 text-emerald-700 font-bold">
                                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                                  <span className="font-mono text-xs">Passed ({t.examScore}%)</span>
                                                </div>
                                              ) : t.examScore !== null && t.examScore !== undefined ? (
                                                <span className="text-red-600 font-bold font-mono text-xs">
                                                  Failed ({t.examScore}%)
                                                </span>
                                              ) : (
                                                <span className="text-gray-400 font-mono text-[10px]">Not taken</span>
                                              )}
                                              {t.isCertified && (
                                                <div className="mt-0.5 inline-flex items-center space-x-1 text-[8px] font-black uppercase text-[#E4002B] bg-red-50 px-1 border border-red-200">
                                                  <Award className="w-2.5 h-2.5" />
                                                  <span>Certified</span>
                                                </div>
                                              )}
                                            </td>
                                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                              <Link href={`/admin/trainees/${t.id}`}>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="text-[11px] h-6 px-2 border-gray-300 font-bold hover:text-[#E4002B]"
                                                >
                                                  <span>View Record &rarr;</span>
                                                </Button>
                                              </Link>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
