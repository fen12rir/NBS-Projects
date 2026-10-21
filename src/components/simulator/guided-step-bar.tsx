"use client";

import React from "react";
import Link from "next/link";
import { TrainingScenario, TRAINING_SCENARIOS } from "@/data/scenarios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  CheckCircle, 
  RotateCcw, 
  Sparkles, 
  Compass, 
  BookOpen, 
  Barcode,
  ArrowRight
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
}: GuidedStepBarProps) {
  // Free Exploration Sandbox
  if (!scenario) {
    return (
      <div className="relative z-50 bg-[#0f172a] border-b-2 border-emerald-500/80 text-white p-3 space-y-2 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-600 text-white px-2 py-0.5 text-xs font-bold rounded flex items-center space-x-1">
              <Compass className="w-3.5 h-3.5" />
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
              className="bg-gray-800 border border-gray-600 text-white text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
            >
              <option value="">Switch to Guided Module...</option>
              {TRAINING_SCENARIOS.map((scen) => (
                <option key={scen.id} value={scen.id}>
                  {scen.title}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={onResetTerminal}
              className="text-xs bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 h-7"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>Clear Terminal</span>
            </Button>
          </div>
        </div>

        {/* Quick Clickable Barcode Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono border-t border-gray-800">
          <span className="text-gray-400 flex items-center mr-1">
            <Barcode className="w-3.5 h-3.5 mr-1 text-gray-400" />
            Quick Barcode Fill:
          </span>
          {SAMPLE_BARCODES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => onFillBarcode(item.code)}
              className="bg-gray-800/90 hover:bg-emerald-950/80 border border-gray-700 hover:border-emerald-500 text-gray-200 px-2 py-0.5 rounded text-[11px] transition-colors flex items-center space-x-1"
            >
              <strong className="text-emerald-400">{item.code}</strong>
              <span className="text-gray-400">({item.name})</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Module-Guided Practice Mode
  const currentStep = scenario.steps[currentStepIndex];
  const totalSteps = scenario.steps.length;
  const isFinished = currentStepIndex >= totalSteps;

  return (
    <div className="relative z-50 bg-[#0B192C] border-2 border-yellow-500/80 text-white p-3 space-y-2 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-700 pb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold uppercase text-yellow-300 flex items-center space-x-1">
            <BookOpen className="w-3.5 h-3.5 text-yellow-400 mr-1" />
            <span>PRACTICE: {scenario.title}</span>
          </span>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-gray-300">
            Step: <strong className="text-white">{Math.min(currentStepIndex + 1, totalSteps)}</strong> / {totalSteps}
          </span>
          <span className="text-red-400">
            Mistakes: <strong>{mistakesCount}</strong>
          </span>
          <span className="text-blue-300">
            Hints: <strong>{hintsUsed}</strong>
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectScenario(null)}
            className="text-xs bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 h-6 px-2 ml-2"
          >
            <Compass className="w-3 h-3 mr-1 text-emerald-400" />
            <span>Switch to Free Exploration</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="space-y-1">
          <div className="text-xs font-bold text-gray-200">
            {isFinished ? (
              <div className="space-y-1">
                <div className="text-emerald-400 font-bold flex items-center space-x-1 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Module Practice Complete! You finished all steps for {scenario.title}.</span>
                </div>
                <div className="text-xs text-gray-300 font-normal">
                  You can repeat this practice anytime or return to Free Exploration.
                </div>
              </div>
            ) : (
              currentStep?.instruction
            )}
          </div>
          {activeHint && !isFinished && (
            <div className="text-xs bg-yellow-950/80 border border-yellow-600 text-yellow-200 p-2 font-mono">
              💡 <strong>Hint:</strong> {activeHint}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {!isFinished ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onShowHint}
                className="text-xs bg-blue-950 border-blue-600 text-blue-200 hover:bg-blue-900"
              >
                <HelpCircle className="w-3.5 h-3.5 mr-1" />
                <span>Get Hint</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onResetScenario}
                className="text-xs bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                <span>Reset Practice</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onResetScenario}
                className="text-xs bg-emerald-950 border-emerald-600 text-emerald-200 hover:bg-emerald-900 font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                <span>Practice Again</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectScenario(null)}
                className="text-xs bg-blue-950 border-blue-600 text-blue-200 hover:bg-blue-900 font-bold"
              >
                <Compass className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                <span>Free Exploration</span>
              </Button>

              {scenario.moduleRef && (
                <Link href={`/modules/${scenario.moduleRef}`}>
                  <Button size="sm" className="text-xs bg-[#E4002B] hover:bg-[#C10024] text-white font-bold">
                    <span>Back to Module</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
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