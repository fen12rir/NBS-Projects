"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TrainingScenario, TRAINING_SCENARIOS } from "@/data/scenarios";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  CheckCircle, 
  RotateCcw, 
  Compass, 
  BookOpen, 
  Barcode, 
  ArrowRight, 
  Award,
  Clock,
  Lightbulb,
  Volume2,
  VolumeX
} from "lucide-react";

interface GuidedStepBarProps {
  scenario: TrainingScenario | null;
  currentStepIndex: number;
  hintsUsed: number;
  mistakesCount: number;
  onShowHint: () => void;
  onResetScenario: () => void;
  onResetTerminal: () => void;
  activeHint: string | null;
  onSelectScenario: (scenarioId: string | null) => void;
  onFillBarcode: (code: string) => void;
  remainingSeconds?: number | null;
}

const SAMPLE_BARCODES = [
  { code: "NBS-BK-001", name: "Spiral Notebook", price: "₱39.50" },
  { code: "NBS-PEN-002", name: "Pilot G-Tech", price: "₱85.00" },
  { code: "NBS-PAP-003", name: "A4 Copy Paper", price: "₱240.00" },
  { code: "NBS-ART-004", name: "Color Pencils", price: "₱180.00" },
  { code: "NBS-CAL-005", name: "Sci Calculator", price: "₱420.00" },
];

export function GuidedStepBar({
  scenario,
  currentStepIndex,
  hintsUsed,
  mistakesCount,
  onShowHint,
  onResetScenario,
  onResetTerminal,
  activeHint,
  onSelectScenario,
  onFillBarcode,
  remainingSeconds
}: GuidedStepBarProps) {
  const currentInstruction = scenario?.steps[currentStepIndex]?.instruction;
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    setSpeechSupported("speechSynthesis" in window);
  }, []);

  useEffect(() => {
    setIsSpeaking(false);
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [currentInstruction]);

  const handleReadInstruction = () => {
    if (!speechSupported || !currentInstruction) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentInstruction);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Free Exploration Sandbox
  if (!scenario) {
    return (
      <div className="relative z-30 bg-gray-900 border-b border-emerald-500/70 text-white px-2 py-1 sm:px-3 sm:py-1.5 shadow-md shrink-0">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Left: Mode Badge & Scenario Selector & Clear */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
            <span className="bg-emerald-600 text-white px-1.5 py-0.5 text-[10px] sm:text-[11px] font-bold rounded flex items-center space-x-1 shrink-0 shadow-xs">
              <Compass className="w-3 h-3 shrink-0" />
              <span className="hidden sm:inline">FREE EXPLORATION</span>
              <span className="sm:hidden">FREE</span>
            </span>

            <select
              value=""
              onChange={(e) => onSelectScenario(e.target.value || null)}
              className="bg-gray-800 border border-gray-600 text-white text-[11px] px-1.5 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans max-w-[135px] xs:max-w-[160px] sm:max-w-[200px] truncate"
              title="Switch to Guided Scenario"
            >
              <option value="">Switch to Guided Scenario...</option>
              {TRAINING_SCENARIOS.map((scen) => (
                <option key={scen.id} value={scen.id}>
                  {scen.lessonRef ? `[Lesson] ${scen.title}` : `[Assessment] ${scen.title}`}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={onResetTerminal}
              className="text-[10px] sm:text-[11px] bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 h-6 px-1.5 sm:px-2 shrink-0"
              title="Clear Terminal / Reset POS state"
            >
              <RotateCcw className="w-3 h-3 sm:mr-1 shrink-0" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          </div>

          {/* Right: Quick Barcodes - seamlessly fills all remaining horizontal space */}
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none text-[10px] font-mono shrink-0 py-0.5 ml-auto">
            <span className="text-gray-400 flex items-center mr-0.5 shrink-0 text-[10px]">
              <Barcode className="w-3 h-3 mr-0.5 text-gray-400 shrink-0" />
              <span className="hidden lg:inline">Quick:</span>
            </span>
            {SAMPLE_BARCODES.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => onFillBarcode(item.code)}
                className="bg-gray-800 hover:bg-emerald-950 border border-gray-700 hover:border-emerald-500 text-gray-200 px-1.5 py-0.5 rounded text-[10px] transition-colors flex items-center space-x-1 shrink-0 whitespace-nowrap active:scale-95 cursor-pointer"
                title={`Scan ${item.code} (${item.name} - ${item.price})`}
              >
                <strong className="text-emerald-400 font-bold">{item.code}</strong>
                <span className="text-gray-400 hidden xl:inline">({item.name})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Lesson Practice or Module Practical Assessment Mode
  const currentStep = scenario.steps[currentStepIndex];
  const totalSteps = scenario.steps.length;
  const isFinished = currentStepIndex >= totalSteps;
  const isLessonPractice = Boolean(scenario.lessonRef);

  return (
    <div className="relative z-30 bg-gray-900 border-b-2 border-yellow-500/80 text-white px-2 py-1 sm:px-3 sm:py-1.5 space-y-1 shadow-md shrink-0">
      <div className="flex items-center justify-between gap-1.5 border-b border-gray-800 pb-1">
        <div className="flex items-center space-x-1.5 min-w-0">
          <span className="text-[11px] font-mono font-bold uppercase text-yellow-300 flex items-center space-x-1 shrink-0">
            {isLessonPractice ? (
              <BookOpen className="w-3 h-3 text-yellow-400 mr-0.5 shrink-0" />
            ) : (
              <Award className="w-3 h-3 text-yellow-400 mr-0.5 shrink-0" />
            )}
            <span>{isLessonPractice ? "PRACTICE" : "ASSESSMENT"}:</span>
          </span>
          <span className="text-[11px] text-gray-200 truncate font-semibold">
            {scenario.title}
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] sm:text-[11px] font-mono shrink-0 ml-auto">
          {remainingSeconds != null && (
            <span className={`font-bold shrink-0 flex items-center ${remainingSeconds <= 60 ? "text-red-400" : "text-yellow-300"}`}>
              <Clock className="w-3 h-3 mr-0.5 shrink-0" />
              <span>
                {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, "0")}
              </span>
            </span>
          )}
          <span className="text-gray-300 shrink-0">
            Step: <strong className="text-white">{Math.min(currentStepIndex + 1, totalSteps)}</strong>/{totalSteps}
          </span>
          <span className="text-red-400 hidden sm:inline shrink-0">
            Mistakes: <strong>{mistakesCount}</strong>
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectScenario(null)}
            className="text-[9px] sm:text-[10px] bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 h-5 px-1 sm:px-1.5 shrink-0"
            title="Exit scenario to Free Exploration"
          >
            <Compass className="w-2.5 h-2.5 mr-0.5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Free Mode</span>
            <span className="sm:hidden">Free</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] sm:text-xs font-semibold text-gray-200 truncate">
            {isFinished ? (
              <div className="text-emerald-400 font-bold flex items-center space-x-1 text-xs">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isLessonPractice ? "Practice Complete!" : "Assessment Complete!"} Finished all steps.
                </span>
              </div>
            ) : (
              <span className="text-yellow-200">
                {currentInstruction}
              </span>
            )}
          </div>
          {activeHint && !isFinished && (
            <div className="text-[10px] bg-yellow-950/80 border border-yellow-600 text-yellow-200 px-1.5 py-0.5 font-mono flex items-center space-x-1 mt-0.5 rounded">
              <Lightbulb className="w-3 h-3 text-yellow-300 shrink-0" />
              <span className="truncate"><strong>Hint:</strong> {activeHint}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          {!isFinished ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReadInstruction}
                disabled={!speechSupported || !currentInstruction}
                className="text-[10px] sm:text-xs bg-purple-950 border-purple-600 text-purple-200 hover:bg-purple-900 disabled:opacity-50 h-6 px-1.5 sm:px-2"
                title={
                  speechSupported
                    ? isSpeaking
                      ? "Stop reading instruction"
                      : "Read instruction aloud"
                    : "Text-to-speech is not supported in this browser"
                }
                aria-label={
                  isSpeaking ? "Stop reading instruction" : "Read instruction aloud"
                }
              >
                {isSpeaking ? (
                  <VolumeX className="w-3 h-3 mr-0.5 shrink-0" />
                ) : (
                  <Volume2 className="w-3 h-3 mr-0.5 shrink-0" />
                )}
                <span>{isSpeaking ? "Stop" : "Read"}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onShowHint}
                className="text-[10px] sm:text-xs bg-blue-950 border-blue-600 text-blue-200 hover:bg-blue-900 h-6 px-1.5 sm:px-2"
              >
                <HelpCircle className="w-3 h-3 mr-0.5 shrink-0" />
                <span>Hint</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onResetScenario}
                className="text-[10px] sm:text-xs bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 h-6 px-1.5 sm:px-2"
              >
                <RotateCcw className="w-3 h-3 mr-0.5 shrink-0" />
                <span>Reset</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center space-x-1 sm:space-x-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={onResetScenario}
                className="text-[10px] sm:text-xs bg-emerald-950 border-emerald-600 text-emerald-200 hover:bg-emerald-900 font-bold h-6 px-1.5 sm:px-2"
              >
                <RotateCcw className="w-3 h-3 mr-0.5 shrink-0" />
                <span>Retry</span>
              </Button>

              {scenario.moduleRef && (
                <Link href={`/modules/${scenario.moduleRef}`}>
                  <Button size="sm" className="text-[10px] sm:text-xs bg-[#E4002B] hover:bg-[#C10024] text-white font-bold h-6 px-1.5 sm:px-2">
                    <span>Module</span>
                    <ArrowRight className="w-3 h-3 ml-0.5 shrink-0" />
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
