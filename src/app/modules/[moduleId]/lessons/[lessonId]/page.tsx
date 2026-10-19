"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TRAINING_MODULES } from "@/data/modules";
import { 
  getLocalProgress, 
  markLessonAsCompleted, 
  UserProgress 
} from "@/lib/progress/progress-store";
import { 
  ArrowLeft, 
  CheckCircle2, 
  ChevronRight, 
  Monitor, 
  BookOpen, 
  Key, 
  Sparkles 
} from "lucide-react";

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;

  const [progress, setProgress] = useState<UserProgress>({
    completedLessons: [],
    completedModules: [],
    scenarioAttempts: [],
  });
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    setProgress(getLocalProgress());
  }, []);

  const currentModule = TRAINING_MODULES.find((m) => m.id === moduleId);
  const currentLesson = currentModule?.lessons.find((l) => l.id === lessonId);

  if (!currentModule || !currentLesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <DashboardHeader />
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <h1 className="text-xl font-bold text-gray-900">Lesson Not Found</h1>
          <p className="text-sm text-gray-500 mt-2">The requested lesson does not exist.</p>
          <Link href="/dashboard" className="mt-4 inline-block">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = progress.completedLessons.includes(currentLesson.id) || justCompleted;

  const handleMarkComplete = () => {
    const updated = markLessonAsCompleted(currentLesson.id, currentModule.id);
    setProgress(updated);
    setJustCompleted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href={`/modules/${currentModule.id}`}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-gray-500 hover:text-[#E4002B]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {currentModule.title}</span>
          </Link>

          <span className="text-xs font-mono text-gray-400">
            Source: {currentLesson.deckSlideRef}
          </span>
        </div>

        {/* Lesson Title & Objective Card */}
        <div className="bg-white border border-gray-200 p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant="default">Module {currentModule.number}</Badge>
            <Badge variant="secondary">Lesson Procedure</Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {currentLesson.title}
          </h1>

          <div className="bg-red-50/60 border-l-4 border-[#E4002B] p-4 text-sm text-gray-800">
            <strong className="text-[#E4002B] font-bold block mb-1">
              Learning Objective:
            </strong>
            {currentLesson.objective}
          </div>
        </div>

        {/* Function Key Callouts */}
        {currentLesson.keyCallouts && currentLesson.keyCallouts.length > 0 && (
          <div className="bg-[#0B192C] text-white p-5 border border-gray-800 space-y-2">
            <div className="flex items-center space-x-2 text-blue-300 font-bold text-xs uppercase tracking-wider">
              <Key className="w-4 h-4" />
              <span>Key POS Function Callouts For This Lesson</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {currentLesson.keyCallouts.map((keyStr, idx) => (
                <span
                  key={idx}
                  className="bg-blue-900/80 border border-blue-600 px-3 py-1 font-mono text-xs font-bold text-blue-200"
                >
                  {keyStr}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ordered Step-by-Step Instructions */}
        <div className="bg-white border border-gray-200 p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight border-b pb-2">
            Standard Cashier Operating Procedure
          </h2>

          <div className="space-y-4">
            {currentLesson.instructions.map((step, idx) => (
              <div key={idx} className="flex items-start space-x-4">
                <div className="w-7 h-7 bg-[#E4002B] text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="text-sm text-gray-800 pt-0.5 leading-relaxed">
                  {step}
                </div>
              </div>
            ))}
          </div>

          {/* Training Deck Slide Visual Placeholder */}
          <div className="border border-dashed border-gray-300 bg-gray-50 p-6 text-center space-y-2">
            <div className="text-xs font-mono font-bold text-gray-500 uppercase">
              Visual Reference Placeholder: {currentLesson.deckSlideRef}
            </div>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Terminal layout and procedure screenshots correspond to {currentLesson.deckSlideRef} in the official cashier training deck.
            </p>
          </div>
        </div>

        {/* Actions & Completion */}
        <div className="bg-white border border-gray-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            {isCompleted ? (
              <div className="flex items-center space-x-2 text-emerald-600 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Lesson Completed! Progress saved.</span>
              </div>
            ) : (
              <div className="text-xs text-gray-500">
                Review all steps above before marking complete.
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {!isCompleted && (
              <Button
                variant="primary"
                onClick={handleMarkComplete}
                className="w-full sm:w-auto font-bold text-xs"
              >
                Mark Lesson Complete
              </Button>
            )}

            <Link href={`/simulator?module=${currentModule.id}`}>
              <Button
                variant="outline"
                className="w-full sm:w-auto font-bold text-xs flex items-center justify-center space-x-1 border-gray-400"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Practice in Simulator</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}