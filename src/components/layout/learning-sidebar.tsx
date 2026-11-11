"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TRAINING_MODULES } from "@/data/modules";
import { getLocalProgress, UserProgress } from "@/lib/progress/progress-store";
import { 
  LayoutDashboard, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  CircleDot,
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Award, 
  PanelLeftClose, 
  X,
  FileCheck2,
  Sparkles
} from "lucide-react";

interface LearningSidebarProps {
  currentModuleId?: string;
  currentLessonId?: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isCollapsedDesktop?: boolean;
  onToggleDesktop?: () => void;
}

export function LearningSidebar({
  currentModuleId,
  currentLessonId,
  isOpenMobile,
  onCloseMobile,
  isCollapsedDesktop = false,
  onToggleDesktop,
}: LearningSidebarProps) {
  const pathname = usePathname();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const updateProgress = () => {
      const p = getLocalProgress();
      setProgress(p);
    };

    updateProgress();

    if (currentModuleId) {
      setExpandedModules((prev) => ({ ...prev, [currentModuleId]: true }));
    }

    window.addEventListener("storage", updateProgress);
    window.addEventListener("focus", updateProgress);
    window.addEventListener("nbs_progress_updated", updateProgress);

    return () => {
      window.removeEventListener("storage", updateProgress);
      window.removeEventListener("focus", updateProgress);
      window.removeEventListener("nbs_progress_updated", updateProgress);
    };
  }, [currentModuleId]);

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const isModuleCompleted = (mod: (typeof TRAINING_MODULES)[number]) => {
    if (!progress) return false;
    if (progress.completedModules?.includes(mod.id)) return true;
    return (
      mod.lessons.length > 0 &&
      mod.lessons.every((l) => progress.completedLessons?.includes(l.id))
    );
  };

  const isModuleInProgress = (mod: (typeof TRAINING_MODULES)[number]) => {
    if (!progress || !progress.completedLessons) return false;
    if (isModuleCompleted(mod)) return false;
    const completedCount = mod.lessons.filter((l) =>
      progress.completedLessons.includes(l.id)
    ).length;
    return completedCount > 0;
  };

  const completedModulesCount = TRAINING_MODULES.filter(isModuleCompleted).length;

  const latestExamAttempt = progress?.scenarioAttempts.find(
    (a) => a.scenarioId === "exam-practical" || a.scenarioId === "scen-practical-assessment"
  );

  const hasPracticalPassed = Boolean(
    progress?.scenarioAttempts.some(
      (a) => (a.scenarioId === "scen-practical-assessment" || a.scenarioId === "exam-practical") && a.passed
    )
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`bg-white border-r border-gray-200 flex flex-col h-full text-gray-900 select-none transition-all duration-300 ease-in-out shrink-0 ${
          isOpenMobile
            ? "fixed inset-y-0 left-0 w-80 shadow-2xl translate-x-0 z-50 lg:hidden"
            : "hidden"
        } ${
          !isCollapsedDesktop ? "lg:flex lg:w-72 lg:static lg:translate-x-0 lg:z-30" : "lg:hidden"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="bg-[#E4002B] text-white p-1.5 rounded shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-900">
                Curriculum
              </h2>
              <p className="text-[10px] text-gray-500 font-medium">NBS POS Training Portal</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* Desktop Collapse Toggle */}
            {onToggleDesktop && (
              <button
                type="button"
                onClick={onToggleDesktop}
                title="Collapse Sidebar"
                className="hidden lg:flex text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 p-1.5 rounded-md cursor-pointer transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}

            {/* Mobile Close Button */}
            {isOpenMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden text-gray-500 hover:text-gray-900 p-1 rounded-md cursor-pointer hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-300">
          {/* Main Dashboard Link */}
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              pathname === "/dashboard"
                ? "bg-[#FFF1F2] text-[#E4002B] border-l-4 border-[#E4002B] shadow-xs"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 shrink-0 ${pathname === "/dashboard" ? "text-[#E4002B]" : "text-gray-500"}`} />
            <span>Training Dashboard</span>
          </Link>

          <div className="pt-3 pb-1 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
            <span>Course Modules</span>
            <span className="text-[9px] font-mono font-normal text-gray-500">
              {completedModulesCount} / {TRAINING_MODULES.length} Done
            </span>
          </div>

          {/* Module List */}
          <div className="space-y-1">
            {TRAINING_MODULES.map((mod, modIdx) => {
              const isCurrentMod = currentModuleId === mod.id;
              const isExpanded = Boolean(expandedModules[mod.id] || isCurrentMod);
              const isCompleted = isModuleCompleted(mod);
              const inProgress = isModuleInProgress(mod);

              return (
                <div
                  key={mod.id}
                  className={`rounded-lg border transition-all overflow-hidden ${
                    isCurrentMod
                      ? "border-red-200 bg-red-50/20 shadow-xs"
                      : "border-gray-100 hover:border-gray-200 bg-white"
                  }`}
                >
                  {/* Module Bar */}
                  <div
                    className={`flex items-center justify-between px-2.5 py-2 cursor-pointer text-xs transition-colors select-none ${
                      isCurrentMod
                        ? "bg-[#FFF1F2]/80 text-[#E4002B] font-bold border-l-4 border-[#E4002B]"
                        : "text-gray-800 hover:bg-gray-50"
                    }`}
                    onClick={() => toggleModule(mod.id)}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0 pr-1">
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : inProgress ? (
                        <CircleDot className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      )}
                      <span className="truncate text-[11px] font-semibold">
                        M{modIdx + 1}: {mod.title.replace(/^Module \d+:\s*/, "")}
                      </span>
                    </div>

                    <button
                      type="button"
                      aria-label={isExpanded ? "Collapse module" : "Expand module"}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleModule(mod.id);
                      }}
                      className="p-1.5 -mr-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded cursor-pointer shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Sub-lessons */}
                  {isExpanded && (
                    <div className="bg-gray-50/80 py-1.5 pl-4 pr-1.5 space-y-0.5 border-t border-gray-100 text-[11px]">
                      {/* Module Overview Link */}
                      <Link
                        href={`/modules/${mod.id}`}
                        onClick={onCloseMobile}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-md transition-all ${
                          !currentLessonId && isCurrentMod
                            ? "bg-[#E4002B] text-white font-bold shadow-xs"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 truncate pr-1">
                          <BookOpen className={`w-3 h-3 shrink-0 ${!currentLessonId && isCurrentMod ? "text-white" : "text-gray-400"}`} />
                          <span className="truncate font-medium">Module Overview &amp; Objectives</span>
                        </div>
                      </Link>
                      {mod.lessons.map((les) => {
                        const isCurrentLes = currentLessonId === les.id;
                        const isLesCompleted = progress?.completedLessons.includes(les.id);

                        return (
                          <Link
                            key={les.id}
                            href={`/modules/${mod.id}/lessons/${les.id}`}
                            onClick={onCloseMobile}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md transition-all ${
                              isCurrentLes
                                ? "bg-[#E4002B] text-white font-bold shadow-xs"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                            }`}
                          >
                            <div className="flex items-center space-x-1.5 truncate pr-1">
                              <FileText className={`w-3 h-3 shrink-0 ${isCurrentLes ? "text-white" : "text-gray-400"}`} />
                              <span className="truncate">{les.title}</span>
                            </div>
                            {isLesCompleted && (
                              <CheckCircle2 className={`w-3 h-3 shrink-0 ${isCurrentLes ? "text-white" : "text-emerald-600"}`} />
                            )}
                          </Link>
                        );
                      })}

                      {/* Module Assessment Link */}
                      <Link
                        href={`/simulator?module=${mod.id}`}
                        onClick={onCloseMobile}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-amber-700 hover:text-amber-900 hover:bg-amber-100/60 font-semibold transition-colors mt-0.5"
                      >
                        <div className="flex items-center space-x-1.5 truncate pr-1">
                          <FileCheck2 className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="truncate">Module Practical Assessment</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-amber-500 shrink-0" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-3 pb-1 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Practical Exam &amp; Certification
          </div>

          {/* Practical Exam Card Link */}
          <div className="space-y-1">
            <Link
              href="/simulator?exam=practical"
              onClick={onCloseMobile}
              className={`block p-2.5 rounded-lg border transition-all ${
                pathname.includes("exam=practical")
                  ? "bg-[#FFF1F2] border-[#E4002B] text-[#E4002B] shadow-xs"
                  : "bg-gradient-to-r from-red-50/50 to-amber-50/50 hover:bg-red-50 border-red-200 text-gray-900"
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="bg-[#E4002B] text-white p-1.5 rounded shrink-0">
                  <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate">Practical Hands-On Exam</span>
                    {hasPracticalPassed && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                    15 min • Unguided shift operations
                  </p>
                </div>
              </div>
            </Link>

            {/* Results Button (if attempt exists) */}
            {latestExamAttempt && (
              <Link
                href={`/results/${latestExamAttempt.id}`}
                onClick={onCloseMobile}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md border border-gray-200 hover:border-[#E4002B] bg-white text-gray-700 hover:text-[#E4002B] text-[10px] font-bold shadow-2xs transition-colors"
              >
                <div className="flex items-center space-x-1.5 truncate">
                  <FileText className="w-3 h-3 text-[#E4002B] shrink-0" />
                  <span className="truncate">View Exam Results</span>
                </div>
                <div className="flex items-center space-x-1 font-mono font-bold shrink-0">
                  <span className={latestExamAttempt.passed ? "text-emerald-600" : "text-amber-600"}>
                    {latestExamAttempt.score}%
                  </span>
                  {latestExamAttempt.passed && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  )}
                </div>
              </Link>
            )}
          </div>

          {/* Certificate Link */}
          <Link
            href="/certificate"
            onClick={onCloseMobile}
            className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              pathname === "/certificate"
                ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 shadow-xs"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Award className={`w-4 h-4 shrink-0 ${pathname === "/certificate" ? "text-emerald-600" : "text-gray-500"}`} />
            <span>Official Certificate</span>
          </Link>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-[10px] text-gray-500 flex items-center justify-between">
          <span className="font-bold text-gray-700">NBS Cashier Portal</span>
          <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[9px] font-mono">
            SOP 2026
          </span>
        </div>
      </aside>
    </>
  );
}
