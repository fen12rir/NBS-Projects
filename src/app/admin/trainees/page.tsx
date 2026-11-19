"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  ArrowRight,
  ChevronRight,
  Award,
  AlertTriangle,
  Building2
} from "lucide-react";

interface TraineeListItem {
  id: string;
  fullName: string;
  email: string;
  contactNo: string;
  branchCode: string;
  branchName: string;
  branchRegion: string;
  status: "active" | "pending" | "rejected" | "deactivated";
  employeeId?: string | null;
  accessExpiresAt?: string | null;
  isExpired: boolean;
  isExpiringSoon: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  completedLessonsCount: number;
  totalLessonsCount: number;
  progressPercent: number;
  isCertified: boolean;
  certificateId?: string | null;
  examScore?: number | null;
  examPassed: boolean;
}

export default function AdminTraineesPage() {
  const { user } = useAuth();
  const isSuper = user?.role === "super_admin";

  const [trainees, setTrainees] = useState<TraineeListItem[]>([]);
  const [branches, setBranches] = useState<Array<{ code: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Load branches
  useEffect(() => {
    fetch("/api/branches")
      .then((res) => res.json())
      .then((data) => {
        if (data.branches) setBranches(data.branches);
      })
      .catch(() => {});
  }, []);

  const fetchTrainees = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (selectedBranch !== "all") params.set("branch", selectedBranch);
      if (selectedStatus !== "all") params.set("status", selectedStatus);

      const res = await fetch(`/api/admin/trainees?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load trainees");
      const data = await res.json();
      setTrainees(data.trainees || []);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedBranch, selectedStatus]);

  useEffect(() => {
    fetchTrainees();
  }, [fetchTrainees]);

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedBranch !== "all") params.set("branch", selectedBranch);
    if (selectedStatus !== "all") params.set("status", selectedStatus);
    params.set("export", "csv");
    window.open(`/api/admin/trainees?${params.toString()}`, "_blank");
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-300">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
              Trainee Directory
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Monitor learning progress, exam attempts, and account access
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleExportCsv}
            className="border-gray-300 font-bold flex items-center space-x-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Trainees to CSV</span>
          </Button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-gray-300 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <Input
              placeholder="Search by full name, email, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Branch Filter (Super Admin) */}
            {isSuper && (
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="text-xs border border-gray-300 bg-white px-2.5 py-1.5 text-gray-800 font-medium focus:ring-1 focus:ring-[#E4002B]"
              >
                <option value="all">All Branches (11)</option>
                {branches.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.code} - {b.name}
                  </option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs border border-gray-300 bg-white px-2.5 py-1.5 text-gray-800 font-medium focus:ring-1 focus:ring-[#E4002B]"
            >
              <option value="all">All Account Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="pending">Pending Approval</option>
              <option value="expiring_soon">Expiring This Week</option>
              <option value="expired">Expired Access</option>
              <option value="deactivated">Deactivated</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedBranch("all");
                setSelectedStatus("all");
              }}
              className="text-xs h-9 border-gray-300"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Trainees Table Card */}
        <div className="bg-white border border-gray-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase font-bold border-b border-gray-200 whitespace-nowrap">
                  <th className="py-2.5 px-3 min-w-[200px]">Trainee</th>
                  <th className="py-2.5 px-3 min-w-[170px]">Branch</th>
                  <th className="py-2.5 px-3 text-center min-w-[90px]">Status</th>
                  <th className="py-2.5 px-3 min-w-[150px]">Curriculum Progress</th>
                  <th className="py-2.5 px-3 text-center min-w-[140px]">Practical Exam</th>
                  <th className="py-2.5 px-3 min-w-[120px]">Access Expiry</th>
                  <th className="py-2.5 px-3 text-right min-w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      Loading trainee records...
                    </td>
                  </tr>
                ) : trainees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <div className="font-bold text-gray-700">No trainees found matching criteria</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Try clearing search terms or selecting another branch.
                      </div>
                    </td>
                  </tr>
                ) : (
                  trainees.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      {/* Name & Contact */}
                      <td className="py-3 px-3">
                        <Link
                          href={`/admin/trainees/${t.id}`}
                          className="font-bold text-gray-900 hover:text-[#E4002B] text-sm block"
                        >
                          {t.fullName}
                        </Link>
                        <div className="text-[11px] text-gray-500 font-mono">
                          {t.email} • {t.contactNo}
                        </div>
                      </td>

                      {/* Branch */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-800">{t.branchName}</div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          {t.branchCode} • {t.branchRegion}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase leading-none ${
                            t.status === "active"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : t.status === "pending"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : t.status === "deactivated"
                              ? "bg-gray-200 text-gray-700 border border-gray-300"
                              : "bg-red-100 text-red-800 border border-red-300"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="py-3 px-3 min-w-[150px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-gray-800">
                            {t.completedLessonsCount} / {t.totalLessonsCount} lessons
                          </span>
                          <span className="font-mono text-gray-500 font-bold">{t.progressPercent}%</span>
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

                      {/* Practical Exam */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center justify-center gap-1">
                          {t.examPassed ? (
                            <div className="inline-flex items-center space-x-1 text-emerald-700 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-mono text-xs">Passed ({t.examScore}%)</span>
                            </div>
                          ) : t.examScore !== null && t.examScore !== undefined ? (
                            <div className="text-red-600 font-bold font-mono text-xs">
                              Failed ({t.examScore}%)
                            </div>
                          ) : (
                            <span className="text-gray-400 font-mono text-[11px]">Not attempted</span>
                          )}
                          {t.isCertified && (
                            <span className="inline-flex items-center space-x-1 text-[9px] font-black uppercase text-[#E4002B] bg-red-50 px-1.5 py-0.5 border border-red-200 leading-none">
                              <Award className="w-3 h-3 shrink-0" />
                              <span>Certified</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Expiry */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {t.isExpired ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 leading-none">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>Expired</span>
                          </span>
                        ) : t.isExpiringSoon ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 leading-none">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>Expiring Soon</span>
                          </span>
                        ) : t.accessExpiresAt ? (
                          <div className="font-mono text-gray-700 text-[11px]">
                            {new Date(t.accessExpiresAt).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px]">No Expiry</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <Link href={`/admin/trainees/${t.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 px-2.5 border-gray-300 font-bold hover:text-[#E4002B] hover:border-[#E4002B]"
                          >
                            <span>View Record</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
