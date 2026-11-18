"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  CheckCircle2, 
  Clock, 
  Award, 
  MapPin, 
  AlertCircle 
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setBranches(data.branches || []);
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
        <div className="pb-4 border-b border-gray-300">
          <div className="flex items-center space-x-2 text-[#E4002B] mb-1">
            <Building2 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Multi-Branch Administration</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
            NBS Retail Branches
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Active physical stores enrolled in the POS Fidelity cashier training program
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-300 p-4 shadow-sm">
            <div className="text-xs font-bold uppercase text-gray-500 mb-1">Active Branches</div>
            <div className="text-2xl font-black font-mono text-gray-900">{branches.length} Stores</div>
            <div className="text-[11px] text-gray-400 mt-1">NCR, Region I &amp; Region III</div>
          </div>
          <div className="bg-white border border-gray-300 p-4 shadow-sm">
            <div className="text-xs font-bold uppercase text-gray-500 mb-1">Enrolled Trainees</div>
            <div className="text-2xl font-black font-mono text-gray-900">{totalTraineesAcrossBranches}</div>
            <div className="text-[11px] text-gray-400 mt-1">Across all participating locations</div>
          </div>
          <div className="bg-white border border-gray-300 p-4 shadow-sm">
            <div className="text-xs font-bold uppercase text-gray-500 mb-1">Total Certified</div>
            <div className="text-2xl font-black font-mono text-[#E4002B]">{totalCertifiedAcrossBranches}</div>
            <div className="text-[11px] text-gray-400 mt-1">Graduated cashiers</div>
          </div>
        </div>

        {/* Branches Table */}
        <div className="bg-white border border-gray-300 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">
              Branch Roster &amp; Training Capacity
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase font-bold border-b border-gray-200">
                  <th className="py-2.5 px-3">Branch Code</th>
                  <th className="py-2.5 px-3">Store Name</th>
                  <th className="py-2.5 px-3">Region</th>
                  <th className="py-2.5 px-3 text-center">Enrolled</th>
                  <th className="py-2.5 px-3 text-center text-emerald-700">Active</th>
                  <th className="py-2.5 px-3 text-center text-amber-600">Pending</th>
                  <th className="py-2.5 px-3 text-center text-[#E4002B]">Certified</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      Loading branches...
                    </td>
                  </tr>
                ) : (
                  branches.map((b) => (
                    <tr key={b.code} className="hover:bg-gray-50">
                      <td className="py-3 px-3 font-mono font-bold text-gray-900">
                        {b.code}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-900 text-sm">{b.name}</div>
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
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800">
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
      </div>
    </AdminShell>
  );
}
