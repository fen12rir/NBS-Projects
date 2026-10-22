"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TRAINING_MODULES } from "@/data/modules";
import { getScenarioForLesson } from "@/data/scenarios";
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
  Sparkles,
  Video,
  FileImage
} from "lucide-react";

function LessonDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;

  const fromPractice = searchParams.get("fromPractice") === "true";
  const scoreParam = searchParams.get("score");
  const practiceScore = scoreParam ? parseInt(scoreParam, 10) : null;

  const [progress, setProgress] = useState<UserProgress>({
    completedLessons: [],
    completedModules: [],
    scenarioAttempts: [],
  });
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    setProgress(getLocalProgress());
  }, []);

  const currentModuleIndex = TRAINING_MODULES.findIndex((m) => m.id === moduleId);
  const currentModule = currentModuleIndex !== -1 ? TRAINING_MODULES[currentModuleIndex] : undefined;

  const currentLessonIndex = currentModule
    ? currentModule.lessons.findIndex((l) => l.id === lessonId)
    : -1;
  const currentLesson = currentLessonIndex !== -1 && currentModule
    ? currentModule.lessons[currentLessonIndex]
    : undefined;

  const isLastLessonInModule = currentModule
    ? currentLessonIndex === currentModule.lessons.length - 1
    : false;

  const nextLesson = (!isLastLessonInModule && currentModule && currentLessonIndex !== -1)
    ? currentModule.lessons[currentLessonIndex + 1]
    : null;

  const nextModule = (isLastLessonInModule && currentModuleIndex < TRAINING_MODULES.length - 1)
    ? TRAINING_MODULES[currentModuleIndex + 1]
    : null;

  const prevLesson = (currentLessonIndex > 0 && currentModule)
    ? currentModule.lessons[currentLessonIndex - 1]
    : null;

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

  // Find a scenario specific to this lesson; fall back to the module-level scenario
  const lessonScenario = getScenarioForLesson(currentLesson.id);
  const simulatorUrl = lessonScenario
    ? `/simulator?scenario=${lessonScenario.id}&lesson=${currentLesson.id}&module=${currentModule.id}`
    : `/simulator?module=${currentModule.id}&lesson=${currentLesson.id}`;

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

        {/* Returned from Practice Callout Banner */}
        {fromPractice && !isCompleted && (
          <div className="bg-emerald-50 border-2 border-emerald-400 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase font-extrabold text-emerald-800 tracking-wider">
                    Practice Simulation Completed
                  </span>
                  {practiceScore !== null && (
                    <span className="bg-emerald-200 text-emerald-900 text-[11px] font-mono font-bold px-2 py-0.5 rounded">
                      Score: {practiceScore}%
                    </span>
                  )}
                </div>
                <p className="text-sm text-emerald-900 font-medium leading-snug">
                  Great job practicing this procedure! If you feel confident with the steps, mark this lesson complete to record your progress.
                </p>
              </div>
            </div>

            <Button
              onClick={handleMarkComplete}
              className="w-full sm:w-auto font-bold text-xs bg-[#E4002B] hover:bg-[#C10024] text-white flex items-center justify-center space-x-1.5 shadow whitespace-nowrap px-4 py-2.5 flex-shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Lesson Complete</span>
            </Button>
          </div>
        )}

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

          {/* Training Deck Slide Visual */}
          {(currentLesson.visualAssets && currentLesson.visualAssets.length > 0) ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-600 border-b border-gray-200 pb-2">
                <span className="uppercase text-[#E4002B]">Official Deck Visual References & Demonstrations</span>
                <span>{currentLesson.deckSlideRef}</span>
              </div>
              <div className="space-y-4">
                {currentLesson.visualAssets.map((asset, idx) => {
                  const isVideo = asset.src.endsWith(".mp4");
                  return (
                    <div key={idx} className="border border-gray-300 bg-white p-3 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 pb-1">
                        <span className="flex items-center font-bold">
                          {isVideo ? (
                            <>
                              <Video className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                              <span className="text-blue-700 uppercase">Video Walkthrough</span>
                            </>
                          ) : (
                            <>
                              <FileImage className="w-3.5 h-3.5 text-gray-500 mr-1.5" />
                              <span className="text-gray-600 uppercase">Visual Reference {idx + 1}</span>
                            </>
                          )}
                        </span>
                      </div>
                      <div className="overflow-hidden bg-black border border-gray-300 flex items-center justify-center">
                        {isVideo ? (
                          <video
                            controls
                            playsInline
                            preload="metadata"
                            className="w-full max-h-[500px] bg-black"
                            src={asset.src}
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <img
                            src={asset.src}
                            alt={asset.alt}
                            className="w-full h-auto object-contain max-h-[500px]"
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-700 font-sans text-center pt-1 font-semibold">
                        {asset.caption}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : currentLesson.visualAsset ? (
            <div className="border border-gray-300 bg-white p-3 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-600 border-b border-gray-200 pb-2">
                <span className="uppercase text-[#E4002B]">Official Deck Visual Reference</span>
                <span>{currentLesson.deckSlideRef}</span>
              </div>
              <div className="overflow-hidden bg-gray-900 border border-gray-300 flex items-center justify-center">
                {currentLesson.visualAsset.src.endsWith(".mp4") ? (
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full max-h-[500px] bg-black"
                    src={currentLesson.visualAsset.src}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={currentLesson.visualAsset.src}
                    alt={currentLesson.visualAsset.alt}
                    className="w-full h-auto object-contain max-h-[500px]"
                  />
                )}
              </div>
              <p className="text-xs text-gray-500 font-sans text-center pt-1 italic">
                {currentLesson.visualAsset.caption}
              </p>
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 bg-gray-50 p-6 text-center space-y-2">
              <div className="text-xs font-mono font-bold text-gray-500 uppercase">
                Visual Reference Placeholder: {currentLesson.deckSlideRef}
              </div>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Terminal layout and procedure screenshots correspond to {currentLesson.deckSlideRef} in the official cashier training deck.
              </p>
            </div>
          )}
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

            <Link href={simulatorUrl}>
              <Button
                variant="outline"
                className="w-full sm:w-auto font-bold text-xs flex items-center justify-center space-x-1 border-gray-400"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Practice Lesson</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Lesson Navigation Footer */}
        <div className="bg-white border border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          {prevLesson ? (
            <Link
              href={`/modules/${currentModule.id}/lessons/${prevLesson.id}`}
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                className="w-full sm:w-auto font-bold text-xs flex items-center justify-center space-x-1 border-gray-300 text-gray-700 hover:text-[#E4002B]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Lesson</span>
              </Button>
            </Link>
          ) : (
            <Link href={`/modules/${currentModule.id}`} className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto font-bold text-xs flex items-center justify-center space-x-1 border-gray-300 text-gray-700 hover:text-[#E4002B]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Module</span>
              </Button>
            </Link>
          )}

          <div className="w-full sm:w-auto flex justify-end">
            {nextLesson ? (
              <Link
                href={`/modules/${currentModule.id}/lessons/${nextLesson.id}`}
                className="w-full sm:w-auto"
              >
                <Button
                  className="w-full sm:w-auto bg-[#E4002B] hover:bg-[#C10024] text-white font-black text-sm flex items-center justify-center space-x-2 px-6 py-2.5 shadow-sm"
                >
                  <span>Next Lesson</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Link
                href={`/modules/${currentModule.id}`}
                className="w-full sm:w-auto"
              >
                <Button
                  className="w-full sm:w-auto bg-[#E4002B] hover:bg-[#C10024] text-white font-black text-sm flex items-center justify-center space-x-2 px-6 py-2.5 shadow-sm"
                >
                  <span>Back to Module</span>
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

export default function LessonDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center font-mono text-sm text-gray-500">
          Loading lesson details...
        </div>
      }
    >
      <LessonDetailContent />
    </Suspense>
  );
}