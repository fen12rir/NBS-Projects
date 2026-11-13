"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { LearningShell } from "@/components/layout/learning-shell";
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
import { getLocalizedLesson, getLocalizedModule, useModuleLanguage } from "@/lib/i18n/module-language";
import { ModuleLanguageToggle } from "@/components/ui/module-language-toggle";
import { useSpeech } from "@/lib/speech/use-speech";
import { 
  ArrowLeft, 
  CheckCircle2, 
  ChevronRight, 
  Monitor, 
  BookOpen, 
  Key, 
  Sparkles,
  Video,
  FileImage,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Volume2,
  VolumeX
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
  const [zoomedImage, setZoomedImage] = useState<{ src: string; alt?: string; caption?: string } | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const { lang, setLang } = useModuleLanguage();
  const { speechSupported, isSpeaking, speak, stop } = useSpeech();

  useEffect(() => {
    setProgress(getLocalProgress());
  }, []);

  useEffect(() => {
    stop();
  }, [lang, lessonId, stop]);

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

  const localizedModule = getLocalizedModule(currentModule, lang);
  const localizedLesson = getLocalizedLesson(currentLesson, lang);

  const handleReadLesson = () => {
    if (!speechSupported) return;
    if (isSpeaking) {
      stop();
      return;
    }
    const text = [
      localizedLesson.title,
      localizedLesson.objective,
      ...localizedLesson.instructions.map((step, i) => `${lang === "tl" ? "Hakbang" : "Step"} ${i + 1}: ${step}`),
    ].join(". ");
    speak(text, lang === "tl" ? "fil-PH" : "en-US");
  };

  return (
    <LearningShell currentModuleId={moduleId} currentLessonId={lessonId}>
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb & Language / Speech Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href={`/modules/${currentModule.id}`}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-gray-500 hover:text-[#E4002B]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === "tl" ? `Bumalik sa ${localizedModule.title}` : `Back to ${localizedModule.title}`}</span>
          </Link>

          <div className="flex items-center gap-2">
            {speechSupported && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReadLesson}
                className={`text-xs h-7 px-2.5 flex items-center gap-1 ${
                  isSpeaking
                    ? "bg-red-50 border-red-400 text-red-700 hover:bg-red-100"
                    : "bg-emerald-50 border-emerald-400 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? (lang === "tl" ? "Ihinto" : "Stop") : (lang === "tl" ? "Basahin" : "Read Lesson")}</span>
              </Button>
            )}
            <ModuleLanguageToggle lang={lang} onChange={setLang} />
            <span className="text-xs font-mono text-gray-400 hidden sm:inline">
              Source: {localizedLesson.deckSlideRef}
            </span>
          </div>
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
            <Badge variant="default">Module {localizedModule.number}</Badge>
            <Badge variant="secondary">{lang === "tl" ? "Pamamaraan ng Aralin" : "Lesson Procedure"}</Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {localizedLesson.title}
          </h1>

          <div className="bg-red-50/60 border-l-4 border-[#E4002B] p-4 text-sm text-gray-800">
            <strong className="text-[#E4002B] font-bold block mb-1">
              {lang === "tl" ? "Layunin ng Aralin:" : "Learning Objective:"}
            </strong>
            {localizedLesson.objective}
          </div>
        </div>

        {/* Function Key Callouts */}
        {localizedLesson.keyCallouts && localizedLesson.keyCallouts.length > 0 && (
          <div className="bg-[#0B192C] text-white p-5 border border-gray-800 space-y-2">
            <div className="flex items-center space-x-2 text-blue-300 font-bold text-xs uppercase tracking-wider">
              <Key className="w-4 h-4" />
              <span>{lang === "tl" ? "Mga Mahalagang POS Function Key sa Araling Ito" : "Key POS Function Callouts For This Lesson"}</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {localizedLesson.keyCallouts.map((keyStr, idx) => (
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
            {lang === "tl" ? "Pamantayang Hakbang ng Cashier (SOP)" : "Standard Cashier Operating Procedure"}
          </h2>

          <div className="space-y-4">
            {localizedLesson.instructions.map((step, idx) => (
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
          {(localizedLesson.visualAssets && localizedLesson.visualAssets.length > 0) ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-600 border-b border-gray-200 pb-2">
                <span className="uppercase text-[#E4002B]">{lang === "tl" ? "Opisyal na Gabay at Demonstrasyon" : "Official Deck Visual References & Demonstrations"}</span>
                <span>{localizedLesson.deckSlideRef}</span>
              </div>
              <div className="space-y-4">
                {localizedLesson.visualAssets.map((asset, idx) => {
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
                          <div
                            onClick={() => {
                              setZoomedImage(asset);
                              setImageScale(1);
                            }}
                            className="relative group cursor-zoom-in w-full flex items-center justify-center bg-gray-950"
                            title="Click to view enlarged image"
                          >
                            <img
                              src={asset.src}
                              alt={asset.alt}
                              className="w-full h-auto object-contain max-h-[500px] transition-transform duration-200 group-hover:scale-[1.01]"
                            />
                            <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <Maximize2 className="w-3 h-3" />
                              <span>Enlarge</span>
                            </div>
                          </div>
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
                  <div
                    onClick={() => {
                      if (currentLesson.visualAsset) {
                        setZoomedImage(currentLesson.visualAsset);
                        setImageScale(1);
                      }
                    }}
                    className="relative group cursor-zoom-in w-full flex items-center justify-center bg-gray-950"
                    title="Click to view enlarged image"
                  >
                    <img
                      src={currentLesson.visualAsset.src}
                      alt={currentLesson.visualAsset.alt}
                      className="w-full h-auto object-contain max-h-[500px] transition-transform duration-200 group-hover:scale-[1.01]"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3 h-3" />
                      <span>Enlarge</span>
                    </div>
                  </div>
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
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex flex-col items-center justify-between p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setZoomedImage(null)}
        >
          {/* Top Bar with Controls */}
          <div
            className="w-full max-w-5xl flex items-center justify-between text-white pb-3 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-gray-300">
              <FileImage className="w-4 h-4 text-[#E4002B]" />
              <span className="truncate max-w-[200px] sm:max-w-md">{zoomedImage.alt || "Visual Reference"}</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-gray-800 rounded px-2 py-1 border border-gray-700 space-x-1">
                <button
                  type="button"
                  onClick={() => setImageScale((s) => Math.max(0.6, Number((s - 0.2).toFixed(1))))}
                  className="p-1 hover:bg-gray-700 text-gray-200 rounded cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-gray-300 px-1 min-w-[36px] text-center select-none">
                  {Math.round(imageScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setImageScale((s) => Math.min(3, Number((s + 0.2).toFixed(1))))}
                  className="p-1 hover:bg-gray-700 text-gray-200 rounded cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                {imageScale !== 1 && (
                  <button
                    type="button"
                    onClick={() => setImageScale(1)}
                    className="p-1 hover:bg-gray-700 text-yellow-400 rounded cursor-pointer ml-1"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="bg-gray-800 hover:bg-red-600 text-white p-2 rounded-full border border-gray-700 transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Zoomable Image Viewport */}
          <div
            className="flex-1 w-full max-w-5xl flex items-center justify-center overflow-auto p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoomedImage.src}
              alt={zoomedImage.alt}
              style={{
                transform: `scale(${imageScale})`,
                transformOrigin: "center center",
                maxHeight: imageScale <= 1 ? "80vh" : undefined,
                maxWidth: imageScale <= 1 ? "95vw" : undefined,
              }}
              className="object-contain transition-transform duration-150 select-none cursor-grab active:cursor-grabbing shadow-2xl rounded"
            />
          </div>

          {/* Bottom Caption Bar */}
          {zoomedImage.caption && (
            <div
              className="w-full max-w-3xl text-center bg-gray-900/90 text-gray-200 text-xs sm:text-sm py-2 px-4 rounded border border-gray-800 mt-2 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {zoomedImage.caption}
            </div>
          )}
        </div>
      )}
    </LearningShell>
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