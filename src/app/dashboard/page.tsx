"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TRAINING_MODULES } from "@/data/modules";
import { TRAINING_SCENARIOS } from "@/data/scenarios";
import { getLocalProgress, UserProgress } from "@/lib/progress/progress-store";
import { 
  BookOpen, 
  Monitor, 
  CheckCircle2, 
  PlayCircle, 
  Award, 
  ChevronRight, 
  Flame, 
  Clock, 
  RotateCcw 
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [progress, setProgress] = useState<UserProgress>({
    completedLessons: [],
    completedModules: [],
    scenarioAttempts: [],
  });

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
  const progressPercent = Math.round((completedLessonCount / totalLessons) * 100);

  const bestAttempt = progress.scenarioAttempts.find((a) => a.passed);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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

        {/* Progress Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase font-bold text-gray-400 tracking-wider">Course Progress</div>
                <div className="text-2xl font-black text-gray-900 mt-1">{progressPercent}%</div>
              </div>
              <div className="w-10 h-10 bg-red-50 text-[#E4002B] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-200 h-2">
              <div className="bg-[#E4002B] h-2 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {completedLessonCount} of {totalLessons} lessons completed
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase font-bold text-gray-400 tracking-wider">Simulator Status</div>
                <div className="text-2xl font-black text-gray-900 mt-1">
                  {bestAttempt ? (
                    <span className="text-emerald-600">Passed</span>
                  ) : progress.scenarioAttempts.length > 0 ? (
                    <span className="text-amber-600">In Progress</span>
                  ) : (
                    <span className="text-gray-400">Not Started</span>
                  )}
                </div>
              </div>
              <div className="w-10 h-10 bg-red-50 text-[#E4002B] flex items-center justify-center">
                <Monitor className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              {progress.scenarioAttempts.length} practical attempts logged
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase font-bold text-gray-400 tracking-wider">Certification</div>
                <div className="text-2xl font-black text-gray-900 mt-1">
                  {bestAttempt ? "Eligible" : "Pending"}
                </div>
              </div>
              <div className="w-10 h-10 bg-red-50 text-[#E4002B] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Pass the Cashier Practical Assessment to unlock
            </div>
          </Card>
        </div>

        {/* Learning Modules Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
                POS Cashier Curriculum
              </h2>
              <p className="text-xs text-gray-500">
                9 Modules based on the 120-slide NBS Cashier Newbie Training Deck
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRAINING_MODULES.map((mod) => {
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
        <div className="bg-[#0B192C] text-white p-6 sm:p-8 border-4 border-gray-900 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge variant="warning">Practical Hands-On Exam</Badge>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Practical Assessment: Cashier Core Cash Sale
            </h2>
            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
              Test your ability to lookup items, set multipliers, tender cash, and generate customer receipts under simulated branch conditions.
            </p>
          </div>
          <Link href="/simulator">
            <Button
              size="lg"
              className="bg-[#E4002B] hover:bg-[#C10024] font-black text-sm px-6 py-4 flex items-center space-x-2"
            >
              <span>Begin Assessment</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
