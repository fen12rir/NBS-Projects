"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TrainingScenario, TRAINING_SCENARIOS } from "@/data/scenarios";
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/lib/speech/use-speech";
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
  VolumeX,
  Repeat,
  Settings,
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
  pageNudge?: string | null;
}

const SAMPLE_BARCODES = [
  { code: "NBS-BK-001", name: "Spiral Notebook", price: "₱39.50" },
  { code: "NBS-PEN-002", name: "Pilot G-Tech", price: "₱85.00" },
  { code: "NBS-PAP-003", name: "A4 Copy Paper", price: "₱240.00" },
  { code: "NBS-ART-004", name: "Color Pencils", price: "₱180.00" },
  { code: "NBS-CAL-005", name: "Sci Calculator", price: "₱420.00" },
];

// Track last auto-spoken step key so input focus/blur or Focus Mode toggles
// never restart the same step's speech from the beginning.
let lastAutoSpokenStepKey: string | null = null;

export function GuidedStepBar({
  scenario,
  currentStepIndex,
  mistakesCount,
  onShowHint,
  onResetScenario,
  onResetTerminal,
  activeHint,
  onSelectScenario,
  onFillBarcode,
  remainingSeconds,
  pageNudge,
}: GuidedStepBarProps) {
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const currentInstruction = scenario?.steps[currentStepIndex]?.instruction;
  const isStepFinished = scenario ? currentStepIndex >= scenario.steps.length : false;
  const stepKey = scenario && !isStepFinished ? `${scenario.id}:${currentStepIndex}` : null;
  const { speechSupported, isSpeaking, speak, stop } = useSpeech();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nbs_guide_tts_enabled");
      if (saved === "false") {
        setIsTtsEnabled(false);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!isSettingsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSettingsOpen]);

  const speakCurrentInstruction = () => {
    if (!speechSupported || !currentInstruction) return;
    const parts = [currentInstruction];
    if (pageNudge) parts.push(pageNudge);
    if (activeHint) parts.push(`Hint: ${activeHint}`);
    speak(parts.join(". "), "en-US");
  };

  useEffect(() => {
    if (!scenario || isStepFinished || !currentInstruction) {
      lastAutoSpokenStepKey = null;
      stop();
      return;
    }
    if (!isTtsEnabled) {
      stop();
      return;
    }
    // Only auto-speak when advancing to a new step (not on input focus/blur or layout toggles)
    if (stepKey && lastAutoSpokenStepKey !== stepKey) {
      lastAutoSpokenStepKey = stepKey;
      speak(currentInstruction, "en-US");
    }
  }, [scenario, stepKey, currentInstruction, isStepFinished, isTtsEnabled, speak, stop]);

  const handleToggleTts = () => {
    const next = !isTtsEnabled;
    setIsTtsEnabled(next);
    try {
      localStorage.setItem("nbs_guide_tts_enabled", String(next));
    } catch {}
    if (!next) {
      stop();
    } else if (currentInstruction && !isStepFinished) {
      lastAutoSpokenStepKey = stepKey;
      speakCurrentInstruction();
    }
  };

  const handleRepeatInstruction = () => {
    if (!speechSupported || !currentInstruction) return;
    lastAutoSpokenStepKey = stepKey;
    speakCurrentInstruction();
    setIsSettingsOpen(false);
  };

  // Free Exploration Sandbox
  if (!scenario) {
    return (
      <div className="relative z-30 bg-gray-900 border-b border-emerald-500/70 text-white px-2 py-1 sm:px-3 sm:py-1.5 shadow-md shrink-0">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Left: Mode Badge & Scenario Selector & Clear */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 min-w-0 flex-1 sm:flex-initial">
            <span className="bg-emerald-600 text-white px-1.5 py-0.5 text-[10px] sm:text-[11px] font-bold rounded flex items-center space-x-1 shrink-0 shadow-xs">
              <Compass className="w-3 h-3 shrink-0" />
              <span className="hidden sm:inline">FREE EXPLORATION</span>
              <span className="sm:hidden">FREE</span>
            </span>

            <select
              value=""
              onChange={(e) => onSelectScenario(e.target.value || null)}
              className="bg-gray-800 border border-gray-600 text-white text-[11px] px-1.5 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans min-w-0 flex-1 sm:flex-none sm:max-w-[200px] truncate"
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

          {/* Right: Quick Barcode Dropdown */}
          <div className="flex items-center space-x-1 shrink-0 ml-auto">
            <Barcode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  onFillBarcode(e.target.value);
                }
              }}
              aria-label="Quick Barcode"
              className="bg-gray-800 border border-gray-600 hover:border-emerald-500 text-emerald-300 text-[11px] font-mono px-1.5 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[130px] sm:max-w-[220px] truncate cursor-pointer"
              title="Select a sample barcode to scan"
            >
              <option value="">Quick Barcode...</option>
              {SAMPLE_BARCODES.map((item) => (
                <option key={item.code} value={item.code} className="text-white bg-gray-900">
                  {item.code} - {item.name} ({item.price})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  // Lesson Practice or Module Practical Assessment Mode (Strictly 2 Rows)
  const totalSteps = scenario.steps.length;
  const isFinished = currentStepIndex >= totalSteps;
  const isLessonPractice = Boolean(scenario.lessonRef);

  return (
    <div className="relative z-30 bg-gray-900 border-b-2 border-yellow-500/80 text-white px-2 py-0.5 sm:px-3 sm:py-1 space-y-0.5 shadow-md shrink-0">
      {/* ROW 1: Scenario Title, Step/Mistakes Counter, Free Mode & Settings Gear Dropdown */}
      <div className="flex items-center justify-between gap-1.5 border-b border-gray-800 pb-0.5">
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

          {!isFinished ? (
            <div ref={settingsRef} className="relative shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSettingsOpen((prev) => !prev)}
                className="text-[10px] bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 h-5 px-1.5 flex items-center gap-1"
                title="Guide Options (Voice, Repeat, Hint, Reset)"
                aria-label="Guide Settings"
                aria-expanded={isSettingsOpen}
              >
                <Settings className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">Options</span>
              </Button>

              {isSettingsOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-gray-900 border border-gray-700 rounded-md shadow-2xl p-1 flex flex-col gap-1 font-sans text-xs">
                  <button
                    type="button"
                    onClick={handleToggleTts}
                    disabled={!speechSupported}
                    className="w-full px-2 py-1.5 rounded text-left flex items-center justify-between hover:bg-gray-800 text-gray-200 disabled:opacity-50 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      {isTtsEnabled ? (
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <VolumeX className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      )}
                      <span>Voice Guide</span>
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        isTtsEnabled
                          ? "bg-emerald-900/80 text-emerald-300 border border-emerald-600"
                          : "bg-gray-800 text-gray-400 border border-gray-600"
                      }`}
                    >
                      {isTtsEnabled ? "ON" : "OFF"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRepeatInstruction}
                    disabled={!speechSupported || !currentInstruction}
                    className="w-full px-2 py-1.5 rounded text-left flex items-center gap-1.5 hover:bg-gray-800 text-emerald-300 disabled:opacity-50 cursor-pointer"
                  >
                    <Repeat className={`w-3.5 h-3.5 shrink-0 ${isSpeaking ? "animate-spin" : ""}`} />
                    <span>Repeat Audio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onShowHint();
                      setIsSettingsOpen(false);
                    }}
                    className="w-full px-2 py-1.5 rounded text-left flex items-center gap-1.5 hover:bg-gray-800 text-blue-300 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Show Hint</span>
                  </button>

                  <div className="h-px bg-gray-800 my-0.5" />

                  <button
                    type="button"
                    onClick={() => {
                      lastAutoSpokenStepKey = null;
                      onResetScenario();
                      setIsSettingsOpen(false);
                    }}
                    className="w-full px-2 py-1.5 rounded text-left flex items-center gap-1.5 hover:bg-gray-800 text-red-300 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                    <span>Reset Scenario</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  lastAutoSpokenStepKey = null;
                  onResetScenario();
                }}
                className="text-[10px] bg-emerald-950 border-emerald-600 text-emerald-200 hover:bg-emerald-900 font-bold h-5 px-1.5"
              >
                <RotateCcw className="w-3 h-3 mr-0.5 shrink-0" />
                <span>Retry</span>
              </Button>
              {scenario.moduleRef && (
                <Link href={`/modules/${scenario.moduleRef}`}>
                  <Button size="sm" className="text-[10px] bg-[#E4002B] hover:bg-[#C10024] text-white font-bold h-5 px-1.5">
                    <span>Module</span>
                    <ArrowRight className="w-3 h-3 ml-0.5 shrink-0" />
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ROW 2: Single Horizontal-Scrolling Instruction Line (Scrolls Left & Right on Overflow) */}
      <div className="w-full overflow-x-auto whitespace-nowrap touch-pan-x py-0.5 flex items-center gap-2 [scrollbar-width:thin]">
        {isFinished ? (
          <div className="text-emerald-400 font-bold flex items-center space-x-1 text-xs shrink-0">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              {isLessonPractice ? "Practice Complete!" : "Assessment Complete!"} Finished all steps.
            </span>
          </div>
        ) : (
          <>
            <span className="text-[11px] sm:text-xs font-semibold text-yellow-200 shrink-0">
              {currentInstruction}
            </span>
            {pageNudge && (
              <span className="text-[10px] sm:text-[11px] bg-amber-950/90 border border-amber-500/80 text-amber-200 px-2 py-0.2 font-mono rounded shrink-0">
                {pageNudge}
              </span>
            )}
            {activeHint && (
              <span className="text-[10px] bg-yellow-950/80 border border-yellow-600 text-yellow-200 px-1.5 py-0.2 font-mono inline-flex items-center space-x-1 rounded shrink-0">
                <Lightbulb className="w-3 h-3 text-yellow-300 shrink-0" />
                <span>
                  <strong>Hint:</strong> {activeHint}
                </span>
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
