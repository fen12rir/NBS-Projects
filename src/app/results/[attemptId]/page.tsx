"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { LearningShell } from "@/components/layout/learning-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLocalProgress, AttemptRecord, UserProgress } from "@/lib/progress/progress-store";
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowLeft, 
  Award, 
  Clock, 
  AlertTriangle, 
  HelpCircle,
  FileText,
  UserCheck,
  User,
  ShoppingBag,
  ExternalLink
} from "lucide-react";

export default function AssessmentResultPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [attempt, setAttempt] = useState<AttemptRecord | null>(null);
  const [history, setHistory] = useState<AttemptRecord[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const p = getLocalProgress();
    setProgress(p);
    const found = p.scenarioAttempts.find((a) => a.id === attemptId);
    if (found) {
      setAttempt(found);
    } else if (p.scenarioAttempts.length > 0) {
      setAttempt(p.scenarioAttempts[0]);
    }
    setHistory(p.scenarioAttempts);
  }, [attemptId]);

  if (!attempt) {
    return (
      <LearningShell>
        <div className="max-w-xl mx-auto py-16 px-4 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-500">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Attempt Record Not Found</h2>
          <p className="text-sm text-gray-500 mt-1">No score details available for this session.</p>
          <Link href="/dashboard" className="mt-4 inline-block">
            <Button className="bg-[#E4002B] hover:bg-[#C10024] text-white">Return to Dashboard</Button>
          </Link>
        </div>
      </LearningShell>
    );
  }

  const isPassed = attempt.passed;
  const isPracticalExam = Boolean(attempt.caseResults && attempt.caseResults.length > 0);
  const isCertified = Boolean(progress?.certificationCompletedAt);

  return (
    <LearningShell>
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-[#E4002B] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Primary Result Summary Card */}
        <div className="bg-white border border-gray-200 shadow-sm overflow-hidden rounded-lg">
          {/* Top Status Strip */}
          <div className={`h-2 sm:h-2.5 ${isPassed ? "bg-emerald-600" : "bg-[#E4002B]"}`} />

          <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Badge variant={isPassed ? "success" : "danger"} className="text-[10px] sm:text-xs">
                  {isPassed ? "Official Pass" : "Needs Practice"}
                </Badge>
                <span className="text-[10px] sm:text-xs font-mono font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded truncate max-w-full">
                  {attempt.scenarioTitle}
                </span>
              </div>

              <h1 className="text-lg sm:text-3xl font-black text-gray-900 tracking-tight uppercase leading-snug">
                {isPracticalExam
                  ? isPassed
                    ? "Practical Hands-On Exam Passed!"
                    : "Practical Hands-On Exam Needs Review"
                  : isPassed
                  ? "Module Assessment Passed!"
                  : "Assessment Needs Review"}
              </h1>

              <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
                {isPassed
                  ? "Outstanding! You demonstrated proficient cashier operations adhering to official National Book Store SOP guidelines. All critical milestones and tender amounts verified."
                  : "You completed the cashier workflow, but certain validation steps or function key sequences were missed or executed incorrectly. Review the breakdown below and retry."}
              </p>
            </div>

            {/* Unified 4-Metric Grid: 2x2 on Mobile, 4 columns on Desktop to eliminate empty spaces */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3.5 pt-1">
              {/* Metric 1: Final Score */}
              <div className="bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-md flex flex-col justify-between">
                <div className="text-[10px] sm:text-xs uppercase font-bold text-gray-500 tracking-wider">
                  Final Score
                </div>
                <div className="my-1">
                  <span className={`text-2xl sm:text-4xl font-black font-mono ${isPassed ? "text-emerald-600" : "text-[#E4002B]"}`}>
                    {attempt.score}%
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 truncate">
                  Pass Mark: 80% {isPracticalExam ? "(≥6/7)" : ""}
                </div>
              </div>

              {/* Metric 2: Status Classification */}
              <div className="bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-md flex flex-col justify-between">
                <div className="text-[10px] sm:text-xs uppercase font-bold text-gray-500 tracking-wider">
                  Status
                </div>
                <div className="my-1 font-mono font-black text-xs sm:text-base">
                  {isPassed ? (
                    <span className="text-emerald-600 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span>QUALIFIED</span>
                    </span>
                  ) : (
                    <span className="text-[#E4002B] flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span>RETAKE REQ.</span>
                    </span>
                  )}
                </div>
                <div className="text-[10px] truncate">
                  {isPassed ? (
                    <span className="text-emerald-600 font-medium">Passed criteria</span>
                  ) : isPracticalExam && attempt.stepsCompleted < 6 ? (
                    <span className="text-red-600 font-medium">{attempt.stepsCompleted}/7 served</span>
                  ) : (
                    <span className="text-red-600 font-medium">Score below 80%</span>
                  )}
                </div>
              </div>

              {/* Metric 3: Customers / Cases */}
              <div className="bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-md flex flex-col justify-between">
                <div className="text-[10px] sm:text-xs uppercase font-bold text-gray-500 tracking-wider">
                  {isPracticalExam ? "Customers" : "Steps"}
                </div>
                <div className="my-1 text-xl sm:text-2xl font-black text-gray-900 font-mono">
                  {attempt.stepsCompleted}{" "}
                  <span className="text-xs text-gray-500 font-normal">of {attempt.totalSteps}</span>
                </div>
                <div className="text-[10px] truncate">
                  {isPracticalExam ? (
                    attempt.stepsCompleted >= 6 ? (
                      <span className="text-emerald-600 font-medium">Goal met (≥6/7)</span>
                    ) : (
                      <span className="text-red-600 font-medium">{attempt.totalSteps - attempt.stepsCompleted} unserved</span>
                    )
                  ) : (
                    <span className="text-gray-500">Steps completed</span>
                  )}
                </div>
              </div>

              {/* Metric 4: Total Time */}
              <div className="bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-md flex flex-col justify-between">
                <div className="text-[10px] sm:text-xs uppercase font-bold text-gray-500 tracking-wider">
                  Total Time
                </div>
                <div className="my-1 text-xl sm:text-2xl font-black text-gray-900 font-mono">
                  {Math.floor(attempt.timeSpentSeconds / 60)}m {attempt.timeSpentSeconds % 60}s
                </div>
                <div className="text-[10px] text-gray-500 truncate">
                  15m standard limit
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Callout Banner: Only if passed and officially certified */}
        {isPassed && isCertified ? (
          <div className="bg-emerald-50 border-2 border-emerald-400/60 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 rounded-lg shadow-xs">
            <div className="flex items-center space-x-3 sm:space-x-3.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              </div>
              <div>
                <h3 className="font-extrabold text-emerald-950 text-sm sm:text-base">
                  Official NBS Cashier Certification Unlocked!
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  You have successfully satisfied all curriculum modules and practical exam requirements. Your personalized certificate is ready.
                </p>
              </div>
            </div>
            <Link href="/certificate" className="shrink-0 w-full sm:w-auto">
              <Button
                size="sm"
                className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 px-4 py-2 sm:py-2.5 shadow-sm"
              >
                <Award className="w-4 h-4 shrink-0" />
                <span>View &amp; Print Certificate</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-red-50 border-2 border-red-300 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 rounded-lg shadow-xs">
            <div className="flex items-center space-x-3 sm:space-x-3.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#E4002B] text-white flex items-center justify-center shrink-0 shadow-sm">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              </div>
              <div>
                <h3 className="font-extrabold text-red-950 text-sm sm:text-base">
                  Official NBS Certification Locked (Passing Mark: 80%)
                </h3>
                <div className="text-xs text-red-800 leading-relaxed space-y-1">
                  {attempt.score >= 80 && attempt.stepsCompleted < 6 ? (
                    <p>
                      You achieved a score of <strong>{attempt.score}%</strong> on completed interactions, but only{" "}
                      <strong>{attempt.stepsCompleted} of {attempt.totalSteps} customers were served</strong> ({attempt.totalSteps - attempt.stepsCompleted} customer {attempt.totalSteps - attempt.stepsCompleted === 1 ? "case was" : "cases were"} unserved or abandoned). To earn official NBS cashier certification, you must handle <strong>all customer cases</strong> during your shift and pass <strong>at least 6 of the 7 cases</strong> with an <strong>80% overall score</strong>.
                    </p>
                  ) : attempt.score >= 80 ? (
                    <p>
                      You achieved an overall score of <strong>{attempt.score}%</strong>, but{" "}
                      <strong>{attempt.totalSteps - attempt.stepsCompleted} customer {attempt.totalSteps - attempt.stepsCompleted === 1 ? "case was" : "cases were"} failed</strong>{" "}
                      due to critical missed steps or incorrect change. To unlock official certification, you must achieve <strong>80% overall</strong> and pass <strong>at least 6 of the 7 cases</strong> (max 1 failed case).
                    </p>
                  ) : (
                    <p>
                      Trainee achieved <strong>{attempt.score}%</strong> ({attempt.stepsCompleted} of {attempt.totalSteps} cases passed). To unlock the official National Book Store Cashier Certificate, achieve an overall score of <strong>80% or higher</strong> and successfully pass at least 6 of the 7 customer cases in a single shift.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Link href={isPracticalExam ? "/simulator?exam=practical" : "/simulator"} className="shrink-0 w-full sm:w-auto">
              <Button
                size="sm"
                className="w-full sm:w-auto bg-[#E4002B] hover:bg-[#C10024] text-white font-bold text-xs flex items-center justify-center space-x-1.5 px-4 py-2 sm:py-2.5 shadow-sm"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>Retake Practical Exam</span>
              </Button>
            </Link>
          </div>
        )}

        {/* Practical Exam Per-Case Score Breakdown */}
        {isPracticalExam && attempt.caseResults && (
          <div className="bg-white border border-gray-200 p-3.5 sm:p-6 space-y-3 sm:space-y-4 shadow-sm rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-200 gap-2">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-gray-900 uppercase tracking-tight flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-[#E4002B] shrink-0" />
                  <span>Customer Interaction Breakdown</span>
                </h2>
                <p className="text-xs text-gray-500">
                  Performance across each unguided customer transaction in your shift
                </p>
              </div>
              <span className="text-xs font-mono text-gray-600 font-bold bg-gray-100 px-2.5 py-1 rounded">
                {attempt.caseResults.filter((c) => c.passed).length} / {attempt.caseResults.length} Cases Passed
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {attempt.caseResults.map((c) => (
                <div key={c.caseId} className="py-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="bg-[#0B192C] text-white font-mono font-bold px-2 py-0.5 rounded text-xs shrink-0">
                        Case #{c.caseNumber}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-gray-900">
                        {c.title}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-auto">
                      <span className="text-xs text-gray-500 font-mono font-medium flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>{c.timeSpentSeconds}s</span>
                      </span>
                      <span className={`font-mono font-bold text-sm ${c.passed ? "text-emerald-700" : "text-[#E4002B]"}`}>
                        {c.score}%
                      </span>
                      <Badge variant={c.passed ? "success" : "danger"}>
                        {c.passed ? "Passed" : "Failed"}
                      </Badge>
                    </div>
                  </div>

                  {c.feedback && c.feedback.length > 0 && (
                    <div className="bg-red-50/80 border-l-4 border-[#E4002B] p-3 text-xs text-red-950 space-y-1.5 rounded-r">
                      <div className="font-bold text-[11px] uppercase tracking-wider text-[#E4002B] flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>SOP Checklist &amp; Auditor Observations:</span>
                      </div>
                      <div className="space-y-1 pl-4">
                        {c.feedback.map((f, fIdx) => (
                          <div key={fIdx} className="flex items-start space-x-1.5">
                            <span className="text-[#E4002B] font-bold">•</span>
                            <span className="leading-relaxed">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Guided Scenario Mistakes Review Table */}
        {!isPracticalExam && (
          <div className="bg-white border border-gray-200 p-3.5 sm:p-6 space-y-3 sm:space-y-4 shadow-sm rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-200 gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-gray-900 uppercase tracking-tight flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#E4002B]" />
                <span>Detailed Mistake Log &amp; Feedback</span>
              </h2>
              <span className="text-xs font-mono text-gray-500">
                {attempt.mistakes.length} item(s) recorded
              </span>
            </div>

            {attempt.mistakes.length === 0 ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono flex items-center space-x-2 rounded-md">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Flawless session! No incorrect function keys or invalid tender sequences occurred.</span>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 text-xs">
                {attempt.mistakes.map((m, idx) => (
                  <div key={idx} className="py-3 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-red-100 text-[#E4002B] font-bold px-2 py-0.5 text-[10px] rounded font-mono">
                        Step {m.step}
                      </span>
                      <span className="font-bold text-gray-800">
                        Action Attempted: <code className="text-[#E4002B] bg-red-50 px-1 py-0.5 rounded font-mono">{m.actionAttempted}</code>
                      </span>
                    </div>
                    <div className="text-gray-600 pl-3 border-l-2 border-[#E4002B]/40 ml-1">
                      {m.feedback}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <Link
            href={isPracticalExam ? "/simulator?exam=practical" : "/simulator"}
            className="w-full sm:w-auto"
          >
            <Button
              size="lg"
              className="w-full sm:w-auto font-bold text-xs bg-[#E4002B] hover:bg-[#C10024] text-white flex items-center justify-center space-x-2 cursor-pointer shadow-sm px-6 py-2.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isPracticalExam ? "Retake Practical Exam" : "Retry Assessment"}</span>
            </Button>
          </Link>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto font-bold text-xs border-gray-300 text-gray-700 hover:text-gray-900 cursor-pointer px-6 py-2.5"
            >
              Return to Course Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </LearningShell>
  );
}
