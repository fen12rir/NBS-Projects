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
import { PortalLoadingScreen } from "@/components/ui/portal-loading-screen";
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
    return <PortalLoadingScreen message="Loading Training Portal Session..." />;
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

  const nextIncompleteModule = TRAINING_MODULES.find((m) =>
    m.lessons.some((l) => !progress.completedLessons.includes(l.id))
  );
  const nextIncompleteLesson = nextIncompleteModule?.lessons.find(
    (l) => !progress.completedLessons.includes(l.id)
  );

  const learningStages = [
    {
      label: "POS Basics",
      desc: "Screen & Shift Start",
      done: TRAINING_MODULES.slice(0, 2).every((m) =>
        m.lessons.every((l) => progress.completedLessons.includes(l.id))
      ),
    },
    {
      label: "Scanning Items",
      desc: "Barcodes & Loyalty",
      done: TRAINING_MODULES.slice(2, 4).every((m) =>
        m.lessons.every((l) => progress.completedLessons.includes(l.id))
      ),
    },
    {
      label: "Payments",
      desc: "Cash, Card & GCash",
      done: TRAINING_MODULES.slice(4, 6).every((m) =>
        m.lessons.every((l) => progress.completedLessons.includes(l.id))
      ),
    },
    {
      label: "Special Tasks",
      desc: "eGC, Voids & Discounts",
      done: TRAINING_MODULES.slice(6, 9).every((m) =>
        m.lessons.every((l) => progress.completedLessons.includes(l.id))
      ),
    },
    {
      label: "Practical Exam",
      desc: "7 Customer Cases",
      done: Boolean(bestAttempt),
    },
    {
      label: "Certificate",
      desc: "Official NBS Cashier",
      done: isCertified,
    },
  ];

  const competencyDomains: Record<number, string> = {
    1: "POS Screen & Keys",
    2: "Opening Shift",
    3: "Scanning & Loyalty",
    4: "Receipts & Lookup",
    5: "Card & E-Wallets",
    6: "Returns & Voids",
    7: "Non-Sale & eGC Reload",
    8: "Discounts & Gift Cards",
    9: "Closing Shift",
  };

  return (
    <LearningShell>
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Welcome Banner & Resume Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-4 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">Cashier POS Training</Badge>
              <span className="text-xs text-slate-600 font-semibold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-none">
                Branch: {user?.branchName ? `${user.branchCode} • ${user.branchName}` : user?.branchCode || "2438"}
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome, {user?.name || "Maria Santos"}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Follow your training steps below and practice on the POS simulator to get your NBS Cashier Certificate.
            </p>
          </div>

          {/* Resume Where You Left Off Card */}
          <div className="w-full lg:w-96 bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {nextIncompleteModule ? "Continue Training" : isCertified ? "Training Complete" : "Next Step"}
              </span>
              <span className={`text-xs font-semibold ${progressPercent === 100 ? "text-emerald-600" : "text-[#E4002B]"}`}>
                {progressPercent}% Done
              </span>
            </div>
            {nextIncompleteModule ? (
              <div>
                <div className="text-sm font-bold text-slate-900 line-clamp-1">
                  Module {nextIncompleteModule.number}: {nextIncompleteModule.title}
                </div>
                <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  Next lesson: {nextIncompleteLesson?.title || "Lesson"}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {isCertified ? "All Training Steps Finished!" : "Ready for Practical Exam"}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {isCertified ? "Your official NBS Cashier Certificate is ready." : "Pass the 7 customer cases to get certified."}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 sm:flex items-center gap-2 pt-1">
              {nextIncompleteModule ? (
                <Link href={`/modules/${nextIncompleteModule.id}`} className="sm:flex-1">
                  <Button size="sm" className="w-full font-semibold flex items-center justify-center space-x-1.5 text-xs">
                    <PlayCircle className="w-4 h-4 shrink-0" />
                    <span>Continue Lesson</span>
                  </Button>
                </Link>
              ) : (
                <Link href={isCertified ? "/certificate" : "/simulator?exam=practical"} className="sm:flex-1">
                  <Button size="sm" className="w-full font-semibold flex items-center justify-center space-x-1.5 text-xs">
                    <Award className="w-4 h-4 shrink-0" />
                    <span>{isCertified ? "View Certificate" : "Practical Exam"}</span>
                  </Button>
                </Link>
              )}
              <Link href="/simulator">
                <Button variant="outline" size="sm" className="w-full sm:w-auto font-semibold flex items-center justify-center space-x-1.5 text-xs">
                  <Monitor className="w-4 h-4 text-[#E4002B] shrink-0" />
                  <span>Simulator</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Visual Training Steps Tracker */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900">
                Your Training Steps
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Finish each step from 1 to 6 to complete your cashier training
              </p>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 sm:px-2.5 py-0.5 rounded-none shrink-0">
              {learningStages.filter((s) => s.done).length} of {learningStages.length} Steps Done
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {learningStages.map((stage, idx) => (
              <div
                key={stage.label}
                className={`p-2.5 sm:p-3 rounded-xl border transition-all ${
                  stage.done
                    ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                    : "bg-slate-50/70 border-slate-200/80 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Step {idx + 1}
                  </span>
                  {stage.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">{stage.label}</div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-tight">{stage.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
          <Card className="col-span-2 sm:col-span-1 p-3.5 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-semibold text-slate-500">Lesson Progress</div>
                <div className="text-xl md:text-2xl font-bold text-slate-900 mt-0.5 sm:mt-1">{progressPercent}%</div>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-red-50 text-[#E4002B] flex items-center justify-center shrink-0 rounded-xl">
                <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`${progressPercent === 100 ? "bg-emerald-500" : "bg-[#E4002B]"} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-slate-500">
              {completedLessonCount} of {totalLessons} lessons finished
            </div>
          </Card>

          <Card className="p-3.5 sm:p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-semibold text-slate-500">Practical Exam</div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mt-0.5 sm:mt-1">
                  {simulatorStatus === "Passed" ? (
                    <span className="text-emerald-600">Passed</span>
                  ) : simulatorStatus === "Failed" ? (
                    <span className="text-rose-600">Failed</span>
                  ) : (
                    <span className="text-amber-600">Pending</span>
                  )}
                </div>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-red-50 text-[#E4002B] flex items-center justify-center shrink-0 rounded-xl">
                <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-slate-500 leading-snug">
              {simulatorStatusDetail}
            </div>
          </Card>

          <Card className="p-3.5 sm:p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-semibold text-slate-500">Certificate</div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mt-0.5 sm:mt-1">
                  {isCertified ? (
                    <Link
                      href="/certificate"
                      className="text-emerald-600 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      aria-label="View your certificate"
                    >
                      Certified
                    </Link>
                  ) : certificationStatus === "In Progress" ? (
                    <span className="text-[#E4002B]">In Progress</span>
                  ) : (
                    <span className="text-slate-400">Pending</span>
                  )}
                </div>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-red-50 text-[#E4002B] flex items-center justify-center shrink-0 rounded-xl">
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs leading-snug">
              {isCertified ? (
                <span className="text-emerald-600 font-semibold">
                  Certificate ready to view &amp; print
                </span>
              ) : (
                <span className="text-slate-500">{certificationDetail}</span>
              )}
            </div>
          </Card>
        </div>

        {/* Learning Modules Grid */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Training Modules &amp; Practice Lessons
              </h2>
              <p className="text-xs text-slate-500">
                9 step-by-step cashier modules based on the NBS Cashier Training Guide
              </p>
            </div>
            <ModuleLanguageToggle lang={lang} onChange={setLang} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {TRAINING_MODULES.map((rawMod) => {
              const mod = getLocalizedModule(rawMod, lang);
              const modLessonIds = mod.lessons.map((l) => l.id);
              const completedInMod = modLessonIds.filter((id) =>
                progress.completedLessons.includes(id)
              ).length;
              const isModComplete = completedInMod === modLessonIds.length;
              const isModInProgress = completedInMod > 0 && !isModComplete;
              const modPct = Math.round((completedInMod / Math.max(1, mod.lessons.length)) * 100);
              const estMinutes = mod.lessons.length * 6;

              return (
                <Card
                  key={mod.id}
                  className="flex flex-col justify-between hover:border-[#E4002B]/60 hover:shadow-md transition-all group"
                >
                  <CardHeader className="space-y-2.5 pb-4">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant={
                          isModComplete
                            ? "success"
                            : isModInProgress
                            ? "default"
                            : "secondary"
                        }
                      >
                        Module {mod.number} • {isModComplete ? "Done" : isModInProgress ? "In Progress" : "Not Started"}
                      </Badge>
                      <span className="text-[11px] text-slate-400 font-medium flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>~{estMinutes}m</span>
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-[#E4002B]">
                      {competencyDomains[mod.number] || "POS Operations"}
                    </div>
                    <CardTitle className="text-base group-hover:text-[#E4002B] transition-colors leading-snug">
                      {mod.title}
                    </CardTitle>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {mod.shortDesc}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4">
                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-medium">{completedInMod} of {mod.lessons.length} lessons done</span>
                        <span className="font-semibold text-slate-700">{modPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isModComplete ? "bg-emerald-500" : "bg-[#E4002B]"
                          }`}
                          style={{ width: `${modPct}%` }}
                        />
                      </div>
                    </div>

                    <Link href={`/modules/${mod.id}`} className="block">
                      <Button
                        variant={isModComplete ? "outline" : "primary"}
                        size="sm"
                        className="w-full font-semibold text-xs flex items-center justify-center space-x-1"
                      >
                        <span>
                          {isModComplete
                            ? "Review Module"
                            : isModInProgress
                            ? "Continue Module"
                            : "Start Module"}
                        </span>
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
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="danger" className="bg-red-500/20 text-red-200 border-red-400/30">
                    Practical Hands-On Exam
                  </Badge>
                  <Badge
                    variant="warning"
                    className="border-amber-400/40 text-amber-200 bg-amber-400/10 font-semibold flex items-center space-x-1 text-xs"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>15-Minute Time Limit</span>
                  </Badge>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Practical Exam: Full Cashier Shift
                </h2>
                <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Handle 7 real customer transactions on your own without step-by-step hints—covering cash, cards, e-wallets, loyalty, discounts, voids, and eGC reloading.
                </p>
              </div>

              <div className="flex flex-col items-stretch gap-2.5 shrink-0 w-full sm:w-80">
                <Link href="/simulator?exam=practical" className="w-full block">
                  <Button
                    className="w-full h-11 bg-[#E4002B] hover:bg-[#C10024] font-semibold text-sm px-4 flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                  >
                    <span>{latestExamAttempt ? "Retake Practical Exam" : "Start Practical Exam"}</span>
                    <ChevronRight className="w-5 h-5 shrink-0" />
                  </Button>
                </Link>

                {latestExamAttempt && (
                  <Link href={`/results/${latestExamAttempt.id}`} className="w-full block">
                    <Button
                      variant="outline"
                      className="w-full h-10 bg-white/10 hover:bg-white/20 text-white border border-white/25 hover:border-white/50 font-semibold text-xs px-4 flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-amber-300 shrink-0" />
                      <span className="truncate">
                        View Exam Results ({latestExamAttempt.score}% • {latestExamAttempt.passed ? "Passed" : "Failed"})
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
