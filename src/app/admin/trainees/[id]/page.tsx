"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TRAINING_MODULES } from "@/data/modules";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Award, 
  RotateCcw, 
  LogOut, 
  Check, 
  AlertTriangle,
  History,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface TraineeDossier {
  trainee: {
    id: string;
    fullName: string;
    email: string;
    contactNo: string;
    branchCode: string;
    branchName: string;
    branchRegion: string;
    role: string;
    status: "active" | "pending" | "rejected" | "deactivated";
    rejectionReason?: string | null;
    employeeId?: string | null;
    accessExpiresAt?: string | null;
    disabledReason?: string | null;
    lastLoginAt?: string | null;
    createdAt: string;
  };
  progress: {
    completedLessons: string[];
    completedModules: string[];
    lastActiveLessonId?: string | null;
    lastActiveModuleId?: string | null;
    certificationCompletedAt?: string | null;
    certificateId?: string | null;
  };
  lessonCompletions: Array<{
    lessonId: string;
    moduleId: string;
    completedAt: string;
  }>;
  attempts: Array<{
    id: string;
    scenarioId: string;
    scenarioTitle: string;
    score: number;
    passed: boolean;
    stepsCompleted: number;
    totalSteps: number;
    hintsUsed: number;
    timeSpentSeconds: number;
    mistakes: any[];
    caseResults?: any[] | null;
    timestamp: string;
  }>;
  auditLogs: Array<{
    id: number;
    actorName: string;
    action: string;
    details: any;
    createdAt: string;
  }>;
}

export default function TraineeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const traineeId = params.id as string;

  const [dossier, setDossier] = useState<TraineeDossier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Expiry custom state
  const [customExpiryDate, setCustomExpiryDate] = useState<string>("");
  const [isUpdatingExpiry, setIsUpdatingExpiry] = useState<boolean>(false);

  // Employee ID edit
  const [isEditingEmpId, setIsEditingEmpId] = useState(false);
  const [empIdInput, setEmpIdInput] = useState("");

  // Deactivate reason
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState("");

  const fetchDossier = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/admin/trainees/${traineeId}`);
      if (!res.ok) throw new Error("Failed to load trainee dossier");
      const data = await res.json();
      setDossier(data);
      if (data.trainee.employeeId) setEmpIdInput(data.trainee.employeeId);
      if (data.trainee.accessExpiresAt) {
        setCustomExpiryDate(new Date(data.trainee.accessExpiresAt).toISOString().split("T")[0]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (traineeId) fetchDossier();
  }, [traineeId]);

  const handlePatch = async (payload: any) => {
    try {
      const res = await fetch(`/api/admin/trainees/${traineeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setFeedback(data.message || "Updated successfully");
      fetchDossier();
    } catch (err: any) {
      setErrorMessage(err.message || "Action failed");
    }
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="py-16 text-center text-gray-500 font-medium">
          Loading trainee profile and history...
        </div>
      </AdminShell>
    );
  }

  if (!dossier) {
    return (
      <AdminShell>
        <div className="p-8 bg-white border border-gray-300 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h2 className="text-base font-bold text-gray-900">Trainee Not Found</h2>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            The requested cashier profile does not exist or belongs to another branch.
          </p>
          <Link href="/admin/trainees">
            <Button size="sm" variant="outline">
              Return to Directory
            </Button>
          </Link>
        </div>
      </AdminShell>
    );
  }

  const { trainee, progress, lessonCompletions, attempts, auditLogs } = dossier;

  const totalLessons = TRAINING_MODULES.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessonsSet = new Set(progress.completedLessons || []);
  const progressPercent = Math.min(100, Math.round((completedLessonsSet.size / totalLessons) * 100));

  const daysRemaining = trainee.accessExpiresAt
    ? Math.ceil((new Date(trainee.accessExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Link href="/admin/trainees" className="hover:text-[#E4002B] flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Trainee Directory</span>
          </Link>
          <span>/</span>
          <span className="font-bold text-gray-800">{trainee.fullName}</span>
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

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-red-700 font-bold">×</button>
          </div>
        )}

        {/* Trainee Profile & Performance Record Header */}
        <div className="bg-white border border-gray-300 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
                  {trainee.fullName}
                </h1>
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase shrink-0 leading-none inline-flex items-center ${
                    trainee.status === "active"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : trainee.status === "pending"
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : trainee.status === "deactivated"
                      ? "bg-gray-200 text-gray-700 border border-gray-300"
                      : "bg-red-100 text-red-800 border border-red-300"
                  }`}
                >
                  {trainee.status}
                </span>
                {progress.certificationCompletedAt && (
                  <span className="bg-[#E4002B] text-white px-2.5 py-0.5 text-[10px] font-bold uppercase flex items-center space-x-1 shrink-0 leading-none">
                    <Award className="w-3.5 h-3.5" />
                    <span>Certified Cashier</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-mono mt-1">
                Trainee ID: {trainee.id}
              </p>
            </div>

            {/* Quick Summary Metrics */}
            <div className="flex items-center space-x-4 text-xs shrink-0">
              <div className="text-right">
                <div className="text-gray-400 font-mono text-[10px] uppercase">Progress</div>
                <div className="font-mono font-extrabold text-base text-gray-900">
                  {completedLessonsSet.size} / {totalLessons} ({progressPercent}%)
                </div>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="text-right">
                <div className="text-gray-400 font-mono text-[10px] uppercase">Access Status</div>
                <div className="font-mono font-bold text-sm">
                  {daysRemaining !== null ? (
                    daysRemaining <= 0 ? (
                      <span className="text-red-600 font-black">EXPIRED</span>
                    ) : daysRemaining <= 7 ? (
                      <span className="text-amber-600 font-black">{daysRemaining} days left</span>
                    ) : (
                      <span className="text-emerald-700">{daysRemaining} days left</span>
                    )
                  ) : (
                    <span className="text-gray-600">No Expiry</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-xs">
            <div className="min-w-0">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Email Address</span>
              <span className="font-mono font-bold text-gray-800 break-all">{trainee.email}</span>
            </div>
            <div className="min-w-0">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Mobile Number</span>
              <span className="font-mono font-bold text-gray-800">{trainee.contactNo}</span>
            </div>
            <div className="min-w-0">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Branch Assigned</span>
              <span className="font-bold text-gray-800 block truncate" title={`${trainee.branchCode} - ${trainee.branchName}`}>
                {trainee.branchCode} - {trainee.branchName}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Employee ID</span>
              {isEditingEmpId ? (
                <div className="flex items-center space-x-1 mt-0.5">
                  <Input
                    value={empIdInput}
                    onChange={(e) => setEmpIdInput(e.target.value)}
                    placeholder="e.g. NBS-2026-0891"
                    className="h-6 text-xs font-mono"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      handlePatch({ action: "update_employee_id", employeeId: empIdInput });
                      setIsEditingEmpId(false);
                    }}
                    className="h-6 px-2 text-[10px]"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 font-mono text-gray-800">
                  <span>{trainee.employeeId || "Not assigned"}</span>
                  <button
                    onClick={() => setIsEditingEmpId(true)}
                    className="text-[10px] text-[#E4002B] hover:underline"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Registration Date</span>
              <span className="font-mono text-gray-800">{new Date(trainee.createdAt).toLocaleString()}</span>
            </div>
            <div className="min-w-0">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Last Portal Login</span>
              <span className="font-mono text-gray-800">
                {trainee.lastLoginAt ? new Date(trainee.lastLoginAt).toLocaleString() : "Never logged in"}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Certificate Number</span>
              <span className="font-mono text-[#E4002B] font-bold break-all">
                {progress.certificateId || "Not certified yet"}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Access Expires On</span>
              <span className="font-mono font-bold text-gray-800">
                {trainee.accessExpiresAt ? new Date(trainee.accessExpiresAt).toLocaleDateString() : "Unlimited"}
              </span>
            </div>
          </div>
        </div>

        {/* Access Control & Actions Card */}
        <div className="bg-white border border-gray-300 p-6 shadow-sm">
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-gray-200">
            <Lock className="w-4 h-4 text-[#E4002B]" />
            <h2 className="text-sm font-bold uppercase tracking-tight text-gray-900">
              Account Access &amp; Lifecycle Controls
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Control 1: Account Status */}
            <div className="p-4 bg-gray-50 border border-gray-200 space-y-3">
              <div className="font-bold text-xs uppercase text-gray-800 flex items-center justify-between">
                <span>Account Status</span>
                <span className="font-mono text-[10px] uppercase font-extrabold">{trainee.status}</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Active trainees can access learning modules and simulator. Deactivating prevents any login.
              </p>
              {trainee.status === "active" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeactivateModal(true)}
                  className="w-full border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold"
                >
                  Deactivate Account
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handlePatch({ action: "update_status", status: "active" })}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  Reactivate Account
                </Button>
              )}
            </div>

            {/* Control 2: Access Expiry Extension */}
            <div className="p-4 bg-gray-50 border border-gray-200 space-y-3">
              <div className="font-bold text-xs uppercase text-gray-800 flex items-center justify-between">
                <span>Access Expiry</span>
                <Clock className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <p className="text-[11px] text-gray-500">
                Current: <strong className="text-gray-900">{trainee.accessExpiresAt ? new Date(trainee.accessExpiresAt).toLocaleDateString() : "Unlimited"}</strong>
              </p>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePatch({ action: "update_expiry", daysToAdd: 7 })}
                  className="text-[11px] h-7 border-gray-300"
                >
                  +7 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePatch({ action: "update_expiry", daysToAdd: 30 })}
                  className="text-[11px] h-7 border-gray-300"
                >
                  +30 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePatch({ action: "update_expiry", daysToAdd: 0 })}
                  className="text-[11px] h-7 border-gray-300"
                >
                  No Expiry
                </Button>
              </div>
            </div>

            {/* Control 3: Exam Reset & Security Actions */}
            <div className="p-4 bg-gray-50 border border-gray-200 space-y-3">
              <div className="font-bold text-xs uppercase text-gray-800">
                Security &amp; Exam Actions
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm("Reset Practical Exam attempts for this trainee? This allows them to retake the exam.")) {
                      handlePatch({ action: "reset_exam_attempts" });
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 text-xs h-8 border-gray-300 text-gray-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Reset Exam Attempts</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm("Revoke all active login sessions for this trainee? They will be logged out immediately.")) {
                      handlePatch({ action: "force_logout" });
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 text-xs h-8 border-gray-300 text-gray-700"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-600" />
                  <span>Force Sign Out All Devices</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Curriculum Progress Matrix */}
        <div className="bg-white border border-gray-300 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
            <h2 className="text-sm font-bold uppercase tracking-tight text-gray-900">
              Curriculum Progress Matrix ({completedLessonsSet.size} of {totalLessons} Lessons)
            </h2>
            <div className="text-xs font-mono font-bold text-gray-700">
              {progressPercent}% Complete
            </div>
          </div>

          <div className="space-y-4">
            {TRAINING_MODULES.map((module) => {
              const moduleLessonsCompleted = module.lessons.filter((l) =>
                completedLessonsSet.has(l.id)
              );
              const isModuleComplete =
                module.lessons.length > 0 &&
                moduleLessonsCompleted.length === module.lessons.length;

              return (
                <div
                  key={module.id}
                  className="border border-gray-200 p-3 bg-gray-50/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${isModuleComplete ? "bg-emerald-500" : "bg-amber-400"}`} />
                      <span className="font-bold text-xs uppercase text-gray-900">
                        {module.title}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-gray-500">
                      {moduleLessonsCompleted.length} / {module.lessons.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {module.lessons.map((lesson) => {
                      const isCompleted = completedLessonsSet.has(lesson.id);
                      const completionRecord = lessonCompletions.find((lc) => lc.lessonId === lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          className={`p-2.5 border text-xs flex items-start justify-between gap-2 ${
                            isCompleted
                              ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                              : "bg-white border-gray-200 text-gray-500"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-xs leading-snug line-clamp-2" title={lesson.title}>
                              {lesson.title}
                            </div>
                            {completionRecord && (
                              <div className="text-[10px] text-emerald-700 font-mono mt-1">
                                Completed: {new Date(completionRecord.completedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0 mt-0.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assessment Attempts History */}
        <div className="bg-white border border-gray-300 p-6 shadow-sm">
          <div className="pb-3 mb-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-tight text-gray-900">
              Scenario &amp; Assessment History ({attempts.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase font-bold border-b border-gray-200">
                  <th className="py-2.5 px-3">Scenario / Exam</th>
                  <th className="py-2.5 px-3">Date &amp; Time</th>
                  <th className="py-2.5 px-3 text-center">Score</th>
                  <th className="py-2.5 px-3 text-center">Outcome</th>
                  <th className="py-2.5 px-3 text-center">Steps</th>
                  <th className="py-2.5 px-3 text-center">Mistakes</th>
                  <th className="py-2.5 px-3 text-center">Time Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attempts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      No assessment attempts recorded for this trainee yet.
                    </td>
                  </tr>
                ) : (
                  attempts.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-gray-900">{a.scenarioTitle}</div>
                        <div className="text-[10px] text-gray-400 font-mono">ID: {a.scenarioId}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-gray-600">
                        {new Date(a.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-sm">
                        {a.score}%
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase ${
                            a.passed
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {a.passed ? "PASSED" : "FAILED"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {a.stepsCompleted} / {a.totalSteps}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-amber-700">
                        {a.mistakes?.length || 0}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-gray-600">
                        {Math.floor(a.timeSpentSeconds / 60)}m {a.timeSpentSeconds % 60}s
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log Card */}
        <div className="bg-white border border-gray-300 p-6 shadow-sm">
          <div className="pb-3 mb-4 border-b border-gray-200 flex items-center space-x-2">
            <History className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-bold uppercase tracking-tight text-gray-900">
              Administrative Audit History
            </h2>
          </div>

          <div className="space-y-2">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No administrative changes recorded.</p>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-gray-50 border border-gray-200 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-gray-900 font-mono uppercase">{log.action}</span>
                    <span className="text-gray-500 mx-2">•</span>
                    <span className="text-gray-600">by {log.actorName}</span>
                    {log.details && (
                      <span className="text-[11px] text-gray-400 ml-2 font-mono">
                        ({JSON.stringify(log.details)})
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-gray-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Deactivate Modal */}
        {showDeactivateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full border-4 border-red-600 p-6 space-y-4 shadow-2xl">
              <h3 className="text-sm font-bold uppercase text-red-700">Deactivate Trainee Account</h3>
              <p className="text-xs text-gray-600">
                Deactivating <strong className="text-gray-900">{trainee.fullName}</strong> will immediately terminate all active sessions and block sign-in.
              </p>
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase mb-1">
                  Reason for Deactivation
                </label>
                <textarea
                  rows={2}
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                  placeholder="e.g. End of employment, transferred branch, disciplinary hold"
                  className="w-full text-xs p-2 border border-gray-300 focus:outline-none focus:border-red-600"
                />
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeactivateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    handlePatch({
                      action: "update_status",
                      status: "deactivated",
                      disabledReason: deactivateReason,
                    });
                    setShowDeactivateModal(false);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                >
                  Confirm Deactivate
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
