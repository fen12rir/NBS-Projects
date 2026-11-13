"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { LearningShell } from "@/components/layout/learning-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TRAINING_MODULES } from "@/data/modules";
import { TRAINING_SCENARIOS } from "@/data/scenarios";
import { getLocalProgress, UserProgress } from "@/lib/progress/progress-store";
import { getLocalizedModule, useModuleLanguage } from "@/lib/i18n/module-language";
import { ModuleLanguageToggle } from "@/components/ui/module-language-toggle";
import { 
  BookOpen, 
  Monitor, 
  CheckCircle2, 
  PlayCircle, 
  Award, 
  ChevronRight, 
  Flame, 
  Clock, 
  RotateCcw,
  FileText
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [progress, setProgress] = useState<UserProgress>({
    completedLessons: [],
    completedModules: [],
    scenarioAttempts: [],
  });
  const { lang, setLang } = useModuleLanguage();

  useEffect(() => {
    setProgress(getLocalProgress());
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center font-mono text-sm text-gray-500">
          Loading Training Portal Session...
        </div>
      </div>
    );
  }

  const totalLessons = TRAINING_MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessonCount = progress.completedLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessonCount / totalLessons) * 100) : 0;

  const allModulesCompleted = totalLessons > 0 && completedLessonCount >= totalLessons;
  const practicalExamAttempts = progress.scenarioAttempts.filter(
    (attempt) => attempt.scenarioId === "exam-practical"
  );
  const hasAttempts = practicalExamAttempts.length > 0;
  const bestAttempt = practicalExamAttempts.find((attempt) => attempt.passed);
  const latestAttempt = practicalExamAttempts[0];

  type SimulatorStatusType = "Pending" | "Passed" | "Failed";
  let simulatorStatus: SimulatorStatusType = "Pending";
  let simulatorStatusDetail = "";

  if (!allModulesCompleted) {
    simulatorStatus = "Pending";
    simulatorStatusDetail = `${completedLessonCount} of ${totalLessons} lessons completed • Finish all modules first`;
  } else if (!hasAttempts) {
    simulatorStatus = "Pending";
    simulatorStatusDetail = "All modules completed • Awaiting practical exam";
  } else if (bestAttempt) {
    simulatorStatus = "Passed";
    simulatorStatusDetail = `All modules completed • Practical exam passed (${bestAttempt.score}%)`;
  } else {
    simulatorStatus = "Failed";
    const passedCasesCount = latestAttempt?.caseResults
      ? latestAttempt.caseResults.filter((c) => c.passed).length
      : latestAttempt?.stepsCompleted ?? 0;
    simulatorStatusDetail = `Practical exam: ${latestAttempt?.score ?? 0}% (${passedCasesCount}/7 cases passed) • Retake required (Requires ≥80% and ≥6 of 7 cases)`;
  }

  type CertificationStatusType = "Pending" | "In Progress" | "Certified";
  let certificationStatus: CertificationStatusType = "Pending";
  let certificationDetail = "";

  const isCertified = allModulesCompleted && Boolean(bestAttempt);

  if (isCertified) {
    certificationStatus = "Certified";
    certificationDetail = "Training modules and practical assessment completed • Certificate available";
  } else if (completedLessonCount > 0 || hasAttempts) {
    certificationStatus = "In Progress";
    if (!allModulesCompleted) {
      certificationDetail = `${completedLessonCount} of ${totalLessons} lessons completed • Assessment pending`;
    } else {
      const passedCasesCount = latestAttempt?.caseResults
        ? latestAttempt.caseResults.filter((c) => c.passed).length
        : latestAttempt?.stepsCompleted ?? 0;
      certificationDetail = hasAttempts
        ? `Assessment score (${latestAttempt?.score ?? 0}% • ${passedCasesCount}/7 cases passed) • Requires ≥80% and ≥6/7 cases passed`
        : "All modules completed • Complete practical exam to earn certification";
    }
  } else {
    certificationStatus = "Pending";
    certificationDetail = "Complete all training modules to unlock your certificate";
  }

  return (
    <LearningShell>
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner & Summary */}
        <div className="bg-white border border-gray-200 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="default">Newbie Cashier Onboarding</Badge>
              <span className="text-xs text-gray-400 font-mono">Branch: {user?.branchCode || "BR-014"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Welcome, {user?.name || "Maria Santos"}!
            </h1>
            <p className="text-sm text-gray-600 max-w-2xl">
              Complete the structured training modules or jump into the interactive POS simulator to practice realistic cashier workflows.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link href="/simulator">
              <Button size="lg" className="w-full sm:w-auto font-bold flex items-center justify-center space-x-2 bg-[#E4002B]">
                <Monitor className="w-5 h-5" />
                <span>Launch POS Simulator</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress Metrics Bar: In portrait, Card 1 spans full width, Card 2 & 3 sit side-by-side */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="col-span-2 sm:col-span-1 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] sm:text-xs uppercase font-bold text-gray-400 tracking-wider">Course Progress</div>
                <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">{progressPercent}%</div>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-50 text-[#E4002B] flex items-center justify-center rounded">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3 w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div className="bg-[#E4002B] h-2 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="mt-2 text-[11px] sm:text-xs text-gray-500">
              {completedLessonCount} of {totalLessons} lessons completed
            </div>
          </Card>

          <Card className="col-span-1 p-3.5 sm:p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] sm:text-xs uppercase font-bold text-gray-400 tracking-wider">Simulator</div>
                <div className="text-lg sm:text-2xl font-black text-gray-900 mt-1">
                  {simulatorStatus === "Passed" ? (
                    <span className="text-emerald-600">Passed</span>
                  ) : simulatorStatus === "Failed" ? (
                    <span className="text-red-600">Failed</span>
                  ) : (
                    <span className="text-amber-600">Pending</span>
                  )}
                </div>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-50 text-[#E4002B] flex items-center justify-center shrink-0 rounded">
                <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-2 text-[10px] sm:text-xs text-gray-500 line-clamp-2">
              {simulatorStatusDetail}
            </div>
          </Card>

          <Card className="col-span-1 p-3.5 sm:p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] sm:text-xs uppercase font-bold text-gray-400 tracking-wider">Certification</div>
                <div className="text-lg sm:text-2xl font-black text-gray-900 mt-1">
                  {isCertified ? (
                    <Link
                      href="/certificate"
                      className="text-emerald-600 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      aria-label="View your certificate"
                    >
                      Certified
                    </Link>
                  ) : certificationStatus === "In Progress" ? (
                    <span className="text-red-600">In Progress</span>
                  ) : (
                    <span className="text-gray-400">Pending</span>
                  )}
                </div>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-50 text-[#E4002B] flex items-center justify-center shrink-0 rounded">
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-2 text-[10px] sm:text-xs">
              {isCertified ? (
                <span className="text-emerald-600 font-bold">
                  Certificate ready
                </span>
              ) : (
                <span className="text-gray-500 line-clamp-2">{certificationDetail}</span>
              )}
            </div>
          </Card>
        </div>

        {/* Learning Modules Grid */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
                POS Cashier Curriculum
              </h2>
              <p className="text-xs text-gray-500">
                9 Modules based on the 120-slide NBS Cashier Newbie Training Deck
              </p>
            </div>
            <ModuleLanguageToggle lang={lang} onChange={setLang} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRAINING_MODULES.map((rawMod) => {
              const mod = getLocalizedModule(rawMod, lang);
              const modLessonIds = mod.lessons.map((l) => l.id);
              const completedInMod = modLessonIds.filter((id) =>
                progress.completedLessons.includes(id)
              ).length;
              const isModComplete = completedInMod === modLessonIds.length;

              return (
                <Card
                  key={mod.id}
                  className="flex flex-col justify-between hover:border-[#E4002B] transition-all group border-gray-200"
                >
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={isModComplete ? "success" : "secondary"}>
                        Module {mod.number}
                      </Badge>
                      <span className="text-[11px] font-mono text-gray-400">
                        {mod.deckPages}
                      </span>
                    </div>
                    <CardTitle className="text-base group-hover:text-[#E4002B] transition-colors leading-snug">
                      {mod.title}
                    </CardTitle>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {mod.shortDesc}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
                      <span>{completedInMod} / {mod.lessons.length} Lessons</span>
                      {isModComplete ? (
                        <span className="text-emerald-600 font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">Incomplete</span>
                      )}
                    </div>

                    <Link href={`/modules/${mod.id}`} className="block">
                      <Button
                        variant={isModComplete ? "outline" : "primary"}
                        size="sm"
                        className="w-full font-bold text-xs flex items-center justify-center space-x-1"
                      >
                        <span>{isModComplete ? "Review Module" : "Start Module"}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Practical Assessment Banner */}
        {(() => {
          const latestExamAttempt = progress.scenarioAttempts.find(
            (a) => a.scenarioId === "exam-practical" || a.scenarioId === "scen-practical-assessment"
          );

          return (
            <div className="bg-[#0B192C] text-white p-6 sm:p-8 border-4 border-gray-900 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="danger">Practical Hands-On Exam</Badge>
                  <Badge
                    variant="warning"
                    className="border-yellow-400/50 text-yellow-300 bg-yellow-400/10 font-mono font-bold flex items-center space-x-1 text-xs px-2.5 py-0.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    <span>15-Min Time Limit</span>
                  </Badge>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  Practical Assessment: Full Shift Unguided Operations
                </h2>
                <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
                  Handle realistic customer situations with no step-by-step guides. Open your shift, process cash, cards, e-wallets, loyalty, discounts, voids, and close your register.
                </p>
              </div>

              <div className="flex flex-col items-stretch gap-2.5 shrink-0 w-full sm:w-80">
                <Link href="/simulator?exam=practical" className="w-full block">
                  <Button
                    className="w-full h-12 bg-[#E4002B] hover:bg-[#C10024] font-black text-sm px-4 flex items-center justify-center space-x-2 cursor-pointer shadow-lg rounded-none border-2 border-transparent"
                  >
                    <span>{latestExamAttempt ? "Retake Practical Exam" : "Begin Practical Exam"}</span>
                    <ChevronRight className="w-5 h-5 shrink-0" />
                  </Button>
                </Link>

                {latestExamAttempt && (
                  <Link href={`/results/${latestExamAttempt.id}`} className="w-full block">
                    <Button
                      variant="outline"
                      className="w-full h-11 bg-white/10 hover:bg-white/20 text-white border-2 border-white/40 hover:border-white font-bold text-xs px-4 flex items-center justify-center space-x-1.5 cursor-pointer rounded-none"
                    >
                      <FileText className="w-4 h-4 text-yellow-300 shrink-0" />
                      <span className="truncate">
                        View Exam Results ({latestExamAttempt.score}% {latestExamAttempt.passed ? "Passed" : "Needs Review"})
                      </span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </LearningShell>
  );
}
