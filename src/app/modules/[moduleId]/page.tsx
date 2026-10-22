"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TRAINING_MODULES } from "@/data/modules";
import { getScenarioForLesson } from "@/data/scenarios";
import { getLocalProgress, UserProgress } from "@/lib/progress/progress-store";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Monitor, 
  FileText,
  Award
} from "lucide-react";

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;

  const [progress, setProgress] = useState<UserProgress>({
    completedLessons: [],
    completedModules: [],
    scenarioAttempts: [],
  });

  useEffect(() => {
    setProgress(getLocalProgress());
  }, []);

  const currentModuleIndex = TRAINING_MODULES.findIndex((m) => m.id === moduleId);
  const currentModule = currentModuleIndex !== -1 ? TRAINING_MODULES[currentModuleIndex] : undefined;

  if (!currentModule) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <DashboardHeader />
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <h1 className="text-xl font-bold text-gray-900">Module Not Found</h1>
          <p className="text-sm text-gray-500 mt-2">The requested training module does not exist.</p>
          <Link href="/dashboard" className="mt-4 inline-block">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const prevModule = currentModuleIndex > 0 ? TRAINING_MODULES[currentModuleIndex - 1] : null;
  const nextModule = (currentModuleIndex !== -1 && currentModuleIndex < TRAINING_MODULES.length - 1)
    ? TRAINING_MODULES[currentModuleIndex + 1]
    : null;

  const completedInMod = currentModule.lessons.filter((l) =>
    progress.completedLessons.includes(l.id)
  ).length;
  const isAllComplete = completedInMod === currentModule.lessons.length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-1 text-xs font-semibold text-gray-500 hover:text-[#E4002B]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Module Header Card */}
        <div className="bg-white border border-gray-200 p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="default">Module {currentModule.number}</Badge>
            <span className="text-xs font-mono text-gray-500">
              Source: {currentModule.deckPages}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {currentModule.title}
          </h1>

          <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
            {currentModule.shortDesc}
          </p>

          <div className="pt-2 flex items-center space-x-4 text-xs font-medium text-gray-500">
            <span>{currentModule.lessons.length} Lessons</span>
            <span>•</span>
            <span>
              Status:{" "}
              {isAllComplete ? (
                <strong className="text-emerald-600">All Completed</strong>
              ) : (
                <strong className="text-amber-600">
                  {completedInMod}/{currentModule.lessons.length} Done
                </strong>
              )}
            </span>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">
            Module Lessons
          </h2>

          <div className="space-y-3">
            {currentModule.lessons.map((lesson, idx) => {
              const isCompleted = progress.completedLessons.includes(lesson.id);
              const lessonScenario = getScenarioForLesson(lesson.id);
              const simulatorUrl = lessonScenario
                ? `/simulator?scenario=${lessonScenario.id}&lesson=${lesson.id}&module=${currentModule.id}`
                : `/simulator?module=${currentModule.id}&lesson=${lesson.id}`;

              return (
                <Card
                  key={lesson.id}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#E4002B] transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-mono text-gray-400">
                        Lesson {idx + 1} • {lesson.deckSlideRef}
                      </div>
                      <h3 className="text-base font-bold text-gray-900">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 max-w-xl">
                        {lesson.objective}
                      </p>
                      {(lesson.visualAsset || (lesson.visualAssets && lesson.visualAssets.length > 0)) && (
                        <div className="mt-2.5 flex items-center space-x-2 text-xs text-[#E4002B] font-semibold">
                          <FileText className="w-3.5 h-3.5" />
                          <span>
                            Includes Official Visual Reference: {lesson.deckSlideRef}
                            {lesson.visualAssets?.some((a) => a.src.endsWith(".mp4")) ? " • Video Walkthrough" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <Link href={`/modules/${currentModule.id}/lessons/${lesson.id}`}>
                      <Button
                        variant={isCompleted ? "outline" : "primary"}
                        size="sm"
                        className="w-full sm:w-auto font-bold text-xs flex items-center justify-center space-x-1"
                      >
                        <span>{isCompleted ? "Review Lesson" : "Start Lesson"}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Link href={simulatorUrl}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto font-bold text-xs flex items-center justify-center space-x-1 border-gray-300 text-gray-600 hover:border-[#E4002B] hover:text-[#E4002B]"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                        <span>Practice</span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Start Practical Assessment Action */}
        <div className="border-2 border-[#0B192C]/15 bg-gradient-to-r from-[#0B192C] to-[#162944] text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-11 h-11 rounded bg-[#E4002B] flex items-center justify-center flex-shrink-0 shadow-sm">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                  End-of-Module Test
                </span>
                <h3 className="text-sm font-black text-white uppercase tracking-wide">
                  Ready for the Module Practical Assessment?
                </h3>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed max-w-2xl">
                Put everything you learned across all lessons in this module to the test. You will handle a combined real-world cashier scenario with new items and sequence variations to verify your mastery.
              </p>
            </div>
          </div>
          <Link href={`/simulator?module=${currentModule.id}`} className="w-full sm:w-auto flex-shrink-0">
            <Button size="sm" className="w-full sm:w-auto bg-[#E4002B] hover:bg-[#C10024] text-white font-bold text-xs whitespace-nowrap px-4 py-2.5 shadow-sm">
              Take Module Assessment
            </Button>
          </Link>
        </div>

        {/* Module Navigation Footer */}
        <div className="bg-white border border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {prevModule ? (
            <Link href={`/modules/${prevModule.id}`} className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto font-bold text-xs flex items-center justify-center space-x-1 border-gray-300 text-gray-700 hover:text-[#E4002B]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Module</span>
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto font-bold text-xs flex items-center justify-center space-x-1 border-gray-300 text-gray-700 hover:text-[#E4002B]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
          )}

          <div className="w-full sm:w-auto flex items-center justify-end">
            {nextModule ? (
              <Link href={`/modules/${nextModule.id}`} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#E4002B] hover:bg-[#C10024] text-white font-black text-sm flex items-center justify-center space-x-2 px-6 py-2.5 shadow-sm"
                >
                  <span>Next Module</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center space-x-2 px-6 py-2.5 shadow-sm"
                >
                  <span>Complete Curriculum (Back to Dashboard)</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
