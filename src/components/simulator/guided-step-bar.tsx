"use client";

import React from "react";
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
  Lightbulb
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
  // Free Exploration Sandbox
  if (!scenario) {
    return (
      <div className="relative z-50 bg-gray-900 border-b-2 border-emerald-500/80 text-white p-2 sm:p-3 space-y-1.5 sm:space-y-2 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-600 text-white px-2 py-0.5 text-[11px] sm:text-xs font-bold rounded flex items-center space-x-1 shrink-0">
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>FREE EXPLORATION MODE</span>
            </span>
            <span className="text-xs text-emerald-300 font-mono hidden sm:inline">
              Sandbox • No fixed instructions. Test any barcodes, keys, tenders, and pages freely.
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value=""
              onChange={(e) => onSelectScenario(e.target.value || null)}
              className="bg-gray-800 border border-gray-600 text-white text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans max-w-[180px] sm:max-w-none truncate"
            >
              <option value="">Switch to Guided Scenario...</option>
              {TRAINING_SCENARIOS.map((scen) => (
                <option key={scen.id} value={scen.id}>
                  {scen.lessonRef ? `[Lesson] ${scen.title}` : `[Module Assessment] ${scen.title}`}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={onResetTerminal}
              className="text-xs bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 h-7 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1 shrink-0" />
              <span>Clear Terminal</span>
            </Button>
          </div>
        </div>

        {/* Quick Clickable Barcode Chips - 1 single horizontal row on mobile */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pt-1 text-[11px] font-mono border-t border-gray-800">
          <span className="text-gray-400 flex items-center mr-1 shrink-0 text-[10px] sm:text-[11px]">
            <Barcode className="w-3.5 h-3.5 mr-1 text-gray-400 shrink-0" />
            Quick Barcode:
          </span>
          {SAMPLE_BARCODES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => onFillBarcode(item.code)}
              className="bg-gray-800/90 hover:bg-emerald-950/80 border border-gray-700 hover:border-emerald-500 text-gray-200 px-2 py-0.5 rounded text-[10px] sm:text-[11px] transition-colors flex items-center space-x-1 shrink-0 whitespace-nowrap"
            >
              <strong className="text-emerald-400">{item.code}</strong>
              <span className="text-gray-400">({item.name})</span>
            </button>
          ))}
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
    <div className="relative z-50 bg-gray-900 border-2 border-yellow-500/80 text-white p-2 sm:p-3 space-y-1.5 sm:space-y-2 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 border-b border-gray-700 pb-1.5 sm:pb-2">
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <span className="text-[11px] sm:text-xs font-mono font-bold uppercase text-yellow-300 flex items-center space-x-1">
            {isLessonPractice ? (
              <BookOpen className="w-3.5 h-3.5 text-yellow-400 mr-1 shrink-0" />
            ) : (
              <Award className="w-3.5 h-3.5 text-yellow-400 mr-1 shrink-0" />
            )}
            <span className="truncate max-w-[200px] sm:max-w-none">
              {isLessonPractice ? "PRACTICE" : "ASSESSMENT"}: {scenario.title}
            </span>
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] sm:text-xs font-mono ml-auto">
          {remainingSeconds != null && (
            <span className={`font-bold shrink-0 flex items-center ${remainingSeconds <= 60 ? "text-red-400" : "text-yellow-300"}`}>
              <Clock className="w-3.5 h-3.5 mr-1 shrink-0" />
              <span>
                {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, "0")}
              </span>
            </span>
          )}
          <span className="text-gray-300 shrink-0">
            Step: <strong className="text-white">{Math.min(currentStepIndex + 1, totalSteps)}</strong>/{totalSteps}
          </span>
          <span className="text-red-400 hidden xs:inline shrink-0">
            Mistakes: <strong>{mistakesCount}</strong>
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectScenario(null)}
            className="text-[10px] sm:text-xs bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 h-6 px-1.5 sm:px-2 shrink-0"
          >
            <Compass className="w-3 h-3 mr-1 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Switch to Free Exploration</span>
            <span className="sm:hidden">Free</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5 sm:pt-1">
        <div className="space-y-1 flex-1">
          <div className="text-xs font-bold text-gray-200">
            {isFinished ? (
              <div className="space-y-1">
                <div className="text-emerald-400 font-bold flex items-center space-x-1 text-xs sm:text-sm">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>
                    {isLessonPractice ? "Practice Complete!" : "Assessment Complete!"} Finished all steps.
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="sm:hidden text-xs font-medium text-yellow-200 leading-snug">
                  {currentStep?.instruction.replace(/^Step \d+:\s*/i, "")}
                </div>
                <div className="hidden sm:block text-xs font-bold text-gray-200">
                  {currentStep?.instruction}
                </div>
              </>
            )}
          </div>
          {activeHint && !isFinished && (
            <div className="text-xs bg-yellow-950/80 border border-yellow-600 text-yellow-200 p-1.5 font-mono flex items-center space-x-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
              <span><strong>Hint:</strong> {activeHint}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {!isFinished ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onShowHint}
                className="text-xs bg-blue-950 border-blue-600 text-blue-200 hover:bg-blue-900 h-7 px-2"
              >
                <HelpCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                <span>Get Hint</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onResetScenario}
                className="text-xs bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 h-7 px-2"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1 shrink-0" />
                <span>Reset</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onResetScenario}
                className="text-xs bg-emerald-950 border-emerald-600 text-emerald-200 hover:bg-emerald-900 font-bold h-7 px-2"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1 shrink-0" />
                <span>Retry</span>
              </Button>

              {scenario.moduleRef && (
                <Link href={`/modules/${scenario.moduleRef}`}>
                  <Button size="sm" className="text-xs bg-[#E4002B] hover:bg-[#C10024] text-white font-bold h-7 px-2">
                    <span>Back to Module</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 shrink-0" />
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
