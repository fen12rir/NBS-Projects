"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
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
  Activity
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dashboard statistics");
        return res.json();
      })
      .then((data) => {
        setStats(data.stats);
        setBranches(data.branches || []);
        setRecentActivity(data.recentActivity || []);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-300">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
              Operations Overview
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              National Book Store cashier trainee progress and branch metrics
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/admin/approvals">
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold flex items-center space-x-1.5 text-xs"
              >
                <UserCheck className="w-4 h-4" />
                <span>Pending Approvals ({stats?.pendingApprovals || 0})</span>
              </Button>
            </Link>
            <Link href="/api/admin/trainees?export=csv" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 font-bold flex items-center space-x-1.5 text-xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export CSV</span>
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Pending Approval Callout Banner if any pending */}
        {stats && stats.pendingApprovals > 0 && (
          <div className="bg-amber-50 border-2 border-amber-300 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-amber-200 text-amber-900 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950 uppercase tracking-tight">
                  {stats.pendingApprovals} Trainee Sign-Up{stats.pendingApprovals === 1 ? "" : "s"} Awaiting Approval
                </h3>
                <p className="text-xs text-amber-800">
                  New trainees cannot log into the training modules or simulator until verified and activated by an administrator.
                </p>
              </div>
            </div>
            <Link href="/admin/approvals" className="shrink-0">
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center space-x-1"
              >
                <span>Review Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        )}

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Trainees */}
          <div className="bg-white border border-gray-300 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Trainees</span>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-3xl font-black font-mono text-gray-900">
              {isLoading ? "..." : stats?.totalTrainees || 0}
            </div>
            <div className="mt-2 text-[11px] text-gray-500 flex items-center space-x-1.5">
              <span className="font-bold text-emerald-600">{stats?.activeTrainees || 0} active</span>
              <span>•</span>
              <span className="font-bold text-amber-600">{stats?.pendingApprovals || 0} pending</span>
            </div>
          </div>

          {/* Card 2: Pending Approvals */}
          <div className="bg-white border border-gray-300 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
              <UserCheck className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-black font-mono text-amber-600">
              {isLoading ? "..." : stats?.pendingApprovals || 0}
            </div>
            <div className="mt-2 text-[11px] text-gray-500">
              {stats?.pendingApprovals ? "Requires administrative review" : "Queue is clear"}
            </div>
          </div>

          {/* Card 3: Certified Trainees */}
          <div className="bg-white border border-gray-300 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Certified Cashiers</span>
              <Award className="w-4 h-4 text-[#E4002B]" />
            </div>
            <div className="text-3xl font-black font-mono text-[#E4002B]">
              {isLoading ? "..." : stats?.certifiedTrainees || 0}
            </div>
            <div className="mt-2 text-[11px] text-gray-500">
              Completed all 9 modules &amp; passed practical exam
            </div>
          </div>

          {/* Card 4: Exam Pass Rate */}
          <div className="bg-white border border-gray-300 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Practical Exam Pass Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black font-mono text-emerald-700">
              {isLoading ? "..." : `${stats?.examPassRate || 0}%`}
            </div>
            <div className="mt-2 text-[11px] text-gray-500">
              From {stats?.examAttempts || 0} recorded attempts
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Branch Performance & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Branch Performance Summary (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-gray-300 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-[#E4002B]" />
                <h2 className="text-sm font-bold uppercase tracking-tight text-gray-900">
                  Branch Performance Matrix
                </h2>
              </div>
              <Link
                href="/admin/trainees"
                className="text-xs font-bold text-[#E4002B] hover:underline"
              >
                View Trainees →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 uppercase font-bold border-b border-gray-200">
                    <th className="py-2.5 px-3">Branch</th>
                    <th className="py-2.5 px-2 text-center">Total</th>
                    <th className="py-2.5 px-2 text-center text-emerald-700">Active</th>
                    <th className="py-2.5 px-2 text-center text-amber-600">Pending</th>
                    <th className="py-2.5 px-2 text-center text-[#E4002B]">Certified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {branches.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-400">
                        {isLoading ? "Loading branch data..." : "No branch activity recorded yet."}
                      </td>
                    </tr>
                  ) : (
                    branches.map((b) => (
                      <tr key={b.code} className="hover:bg-gray-50">
                        <td className="py-2 px-3">
                          <div className="font-bold text-gray-900">{b.name}</div>
                          <div className="text-[10px] text-gray-500 font-mono">
                            Code: {b.code} • {b.region}
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-gray-800">
                          {b.totalUsers}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-emerald-700">
                          {b.activeUsers}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-amber-600">
                          {b.pendingUsers}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-[#E4002B]">
                          {b.certifiedUsers}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Training Attempts Feed (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-gray-300 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[#E4002B]" />
                <h2 className="text-sm font-bold uppercase tracking-tight text-gray-900">
                  Recent Scenario Attempts
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  {isLoading ? "Loading activity..." : "No recent assessment attempts recorded."}
                </div>
              ) : (
                recentActivity.map((act) => (
                  <div
                    key={act.id}
                    className="p-2.5 bg-gray-50 border border-gray-200 text-xs flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-gray-900 truncate">{act.fullName}</div>
                      <div className="text-[10px] text-gray-500 truncate">
                        {act.scenarioTitle} • {act.branchName}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {new Date(act.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-1.5 py-0.5 text-[10px] font-mono font-extrabold uppercase ${
                          act.passed
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
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
