"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
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
  FileText
} from "lucide-react";

export default function AssessmentResultPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [attempt, setAttempt] = useState<AttemptRecord | null>(null);
  const [history, setHistory] = useState<AttemptRecord[]>([]);

  useEffect(() => {
    const progress = getLocalProgress();
    const found = progress.scenarioAttempts.find((a) => a.id === attemptId);
    if (found) {
      setAttempt(found);
    } else if (progress.scenarioAttempts.length > 0) {
      setAttempt(progress.scenarioAttempts[0]);
    }
    setHistory(progress.scenarioAttempts);
  }, [attemptId]);

  if (!attempt) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <DashboardHeader />
        <div className="max-w-xl mx-auto py-16 text-center">
          <h2 className="text-xl font-bold text-gray-900">Attempt Record Not Found</h2>
          <p className="text-sm text-gray-500 mt-2">No score details available for this session.</p>
          <Link href="/dashboard" className="mt-4 inline-block">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPassed = attempt.passed;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-1 text-xs font-semibold text-gray-500 hover:text-[#E4002B]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Big Outcome Banner */}
        <div
          className={`p-8 border-4 text-center space-y-4 shadow-xl ${
            isPassed
              ? "bg-emerald-50 border-emerald-600 text-emerald-950"
              : "bg-amber-50 border-amber-600 text-amber-950"
          }`}
        >
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-white shadow-sm">
            {isPassed ? (
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-12 h-12 text-amber-600" />
            )}
          </div>

          <Badge variant={isPassed ? "success" : "warning"} className="text-xs tracking-wider">
            {isPassed ? "OFFICIAL PASS" : "NEEDS PRACTICE"}
          </Badge>

          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            {isPassed ? "Assessment Passed!" : "Practical Assessment Incomplete"}
          </h1>

          <p className="text-sm max-w-xl mx-auto text-gray-700 leading-relaxed">
            {isPassed
              ? "Outstanding! You demonstrated proficient navigation of item entry, quantity settings, and cash tender per NBS cashier SOP."
              : "You completed the cashier workflow, but several incorrect function keys or sequences were recorded. Review the mistake breakdown below and retry."}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-sm font-mono font-bold">
            <div>
              <span className="text-xs text-gray-500 block">FINAL SCORE:</span>
              <span className={`text-3xl ${isPassed ? "text-emerald-700" : "text-amber-700"}`}>
                {attempt.score}%
              </span>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div>
              <span className="text-xs text-gray-500 block">STEPS COMPLETED:</span>
              <span className="text-2xl text-gray-900">{attempt.stepsCompleted} / {attempt.totalSteps}</span>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div>
              <span className="text-xs text-gray-500 block">MISTAKES LOGGED:</span>
              <span className="text-2xl text-red-600">{attempt.mistakes.length}</span>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div>
              <span className="text-xs text-gray-500 block">TIME SPENT:</span>
              <span className="text-2xl text-gray-900">{attempt.timeSpentSeconds}s</span>
            </div>
          </div>
        </div>

        {/* Mistakes Review Table */}
        <div className="bg-white border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight">
              Detailed Mistake Log & Feedback
            </h2>
            <span className="text-xs font-mono text-gray-400">
              {attempt.mistakes.length} item(s) recorded
            </span>
          </div>

          {attempt.mistakes.length === 0 ? (
            <div className="p-6 bg-emerald-50 text-emerald-800 text-xs font-mono flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Flawless session! No incorrect function keys or invalid tender sequences occurred.</span>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 text-xs">
              {attempt.mistakes.map((m, idx) => (
                <div key={idx} className="py-3 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-red-100 text-red-800 font-bold px-1.5 py-0.5 text-[10px]">
                      Step {m.step}
                    </span>
                    <span className="font-bold text-gray-800">
                      Action Attempted: <code className="text-red-700 bg-red-50 px-1">{m.actionAttempted}</code>
                    </span>
                  </div>
                  <div className="text-gray-600 pl-2 border-l-2 border-red-300 ml-1 mt-1">
                    {m.feedback}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Link href="/simulator" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto font-bold text-xs bg-[#E4002B] hover:bg-[#C10024] flex items-center justify-center space-x-2">
              <RotateCcw className="w-4 h-4" />
              <span>Retry Practical Assessment</span>
            </Button>
          </Link>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold text-xs border-gray-300">
              Return to Course Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
