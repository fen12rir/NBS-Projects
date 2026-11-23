"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { useAutoRefresh } from "@/lib/use-auto-refresh";
import { 
  Users, 
  UserCheck, 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  TrendingUp,
  Building2,
  FileSpreadsheet,
  Activity,
  RefreshCw
} from "lucide-react";

interface AdminStats {
  totalTrainees: number;
  pendingApprovals: number;
  activeTrainees: number;
  deactivatedTrainees: number;
  certifiedTrainees: number;
  examAttempts: number;
  examPassRate: number;
}

interface BranchStat {
  code: string;
  name: string;
  region: string;
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  certifiedUsers: number;
}

interface ActivityItem {
  id: string;
  userId: string;
  fullName: string;
  branchCode: string;
  branchName: string;
  scenarioTitle: string;
  score: number;
  passed: boolean;
  timestamp: string;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [branches, setBranches] = useState<BranchStat[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load dashboard statistics");
      const data = await res.json();
      setStats(data.stats);
      setBranches(data.branches || []);
      setRecentActivity(data.recentActivity || []);
      setError(null);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (err: any) {
      if (!silent) setError(err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(false);
  }, [fetchStats]);

  useAutoRefresh(() => fetchStats(true), { intervalMs: 20000 });

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Training Overview
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              National Book Store cashier trainee progress, exam results, and branch summary
              {lastUpdated && (
                <span className="ml-2 text-slate-400">· Updated {lastUpdated}</span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStats(true)}
              disabled={isRefreshing}
              className="font-semibold flex items-center space-x-1.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
            <Link href="/admin/approvals">
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold flex items-center space-x-1.5 text-xs"
              >
                <UserCheck className="w-4 h-4" />
                <span>Pending Approvals ({stats?.pendingApprovals || 0})</span>
              </Button>
            </Link>
            <Link href="/api/admin/trainees?export=csv" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="font-semibold flex items-center space-x-1.5 text-xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export CSV</span>
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Pending Approval Callout Banner if any pending */}
        {stats && stats.pendingApprovals > 0 && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950 tracking-tight">
                  {stats.pendingApprovals} Trainee Sign-Up{stats.pendingApprovals === 1 ? "" : "s"} Waiting for Approval
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  New trainees cannot open the training lessons or POS simulator until approved by an admin.
                </p>
              </div>
            </div>
            <Link href="/admin/approvals" className="shrink-0">
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center space-x-1"
              >
                <span>Review Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        )}

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Trainees */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold">Total Trainees</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              {isLoading ? "..." : stats?.totalTrainees || 0}
            </div>
            <div className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-slate-500 flex flex-wrap items-center gap-x-1.5">
              <span className="font-semibold text-emerald-600">{stats?.activeTrainees || 0} active</span>
              <span>•</span>
              <span className="font-semibold text-amber-600">{stats?.pendingApprovals || 0} pending</span>
            </div>
          </div>

          {/* Card 2: Pending Approvals */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold">Pending Approvals</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-600">
              {isLoading ? "..." : stats?.pendingApprovals || 0}
            </div>
            <div className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-slate-500">
              {stats?.pendingApprovals ? "Needs supervisor approval" : "Approval queue is clear"}
            </div>
          </div>

          {/* Card 3: Certified Cashiers */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold">Certified Cashiers</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-50 text-[#E4002B] flex items-center justify-center shrink-0">
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#E4002B]">
              {isLoading ? "..." : stats?.certifiedTrainees || 0}
            </div>
            <div className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-slate-500">
              Finished all 9 modules &amp; passed practical exam
            </div>
          </div>

          {/* Card 4: Exam Pass Rate */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold">Exam Pass Rate</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
              {isLoading ? "..." : `${stats?.examPassRate || 0}%`}
            </div>
            <div className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-slate-500">
              From {stats?.examAttempts || 0} recorded exam attempts
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Branch Summary & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Branch Summary (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl shadow-xs p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-50 text-[#E4002B] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  Branch Training Summary
                </h2>
              </div>
              <Link
                href="/admin/trainees"
                className="text-xs font-semibold text-[#E4002B] hover:underline"
              >
                View Trainee List →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 whitespace-nowrap">
                    <th className="py-2.5 px-3 min-w-[180px] rounded-tl-lg">Store Branch</th>
                    <th className="py-2.5 px-2 text-center min-w-[60px]">Total</th>
                    <th className="py-2.5 px-2 text-center text-emerald-700 min-w-[60px]">Active</th>
                    <th className="py-2.5 px-2 text-center text-amber-600 min-w-[60px]">Pending</th>
                    <th className="py-2.5 px-2 text-center text-[#E4002B] min-w-[80px] rounded-tr-lg">Certified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {branches.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        {isLoading ? "Loading branch data..." : "No branch activity recorded yet."}
                      </td>
                    </tr>
                  ) : (
                    branches.map((b) => (
                      <tr key={b.code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{b.name}</div>
                          <div className="text-[11px] text-slate-500">
                            <span className="font-mono">{b.code}</span> • {b.region}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-semibold text-slate-800">
                          {b.totalUsers}
                        </td>
                        <td className="py-2.5 px-2 text-center font-semibold text-emerald-700">
                          {b.activeUsers}
                        </td>
                        <td className="py-2.5 px-2 text-center font-semibold text-amber-600">
                          {b.pendingUsers}
                        </td>
                        <td className="py-2.5 px-2 text-center font-semibold text-[#E4002B]">
                          {b.certifiedUsers}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Practice & Exam Attempts Feed (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-50 text-[#E4002B] flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  Recent Practice &amp; Exam Attempts
                </h2>
              </div>
            </div>

            <div className="space-y-2.5">
              {recentActivity.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  {isLoading ? "Loading activity..." : "No recent practice attempts recorded."}
                </div>
              ) : (
                recentActivity.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 truncate">{act.fullName}</div>
                      <div className="text-[11px] text-slate-500 truncate" title={`${act.scenarioTitle} • ${act.branchName}`}>
                        {act.scenarioTitle} • {act.branchName}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(act.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase whitespace-nowrap leading-none ${
                          act.passed
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {act.passed ? "PASSED" : "FAILED"} ({act.score}%)
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
