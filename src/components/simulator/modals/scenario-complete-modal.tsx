import React from "react";
import Link from "next/link";
import { Trophy, CheckCircle, RotateCcw, ArrowRight } from "lucide-react";
import { TrainingScenario } from "@/data/scenarios";

interface ScenarioCompleteModalProps {
  isOpen: boolean;
  scenario: TrainingScenario | null;
  mistakesCount: number;
  isLessonSpecific: boolean;
  returnLessonUrl: string;
  returnButtonLabel: string;
  onResetExam: () => void;
}

export function ScenarioCompleteModal({
  isOpen,
  scenario,
  mistakesCount,
  isLessonSpecific,
  returnLessonUrl,
  returnButtonLabel,
  onResetExam,
}: ScenarioCompleteModalProps) {
  if (!isOpen || !scenario) return null;

  const finalScore = Math.max(0, 100 - mistakesCount * 10);
  const modalReturnUrl = isLessonSpecific
    ? `${returnLessonUrl}?fromPractice=true&score=${finalScore}`
    : returnLessonUrl;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200 pointer-events-none">
        <div className="bg-[#D4D0C8] border-4 border-[#228B22] shadow-2xl max-w-md w-full overflow-hidden font-sans pointer-events-auto">
          {/* Retro Green Header */}
          <div className="bg-[#228B22] text-white px-4 py-2 font-bold text-sm flex items-center justify-between uppercase tracking-wide">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span>PRACTICE COMPLETED!</span>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 space-y-5 text-gray-900">
            {/* Badge & Title */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">
                  Congratulations!
                </h3>
                <p className="text-xs text-gray-600 mt-0.5 font-medium">
                  You successfully finished all steps for:
                </p>
                <div className="text-xs font-bold text-[#E4002B] mt-1 bg-white border border-gray-400 py-1 px-2 shadow-inner font-mono">
                  {scenario.title}
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-white border-2 border-gray-400 p-3 grid grid-cols-3 gap-2 text-center text-xs font-mono shadow-inner">
              <div className="border-r border-gray-300 pr-1">
                <div className="text-gray-500 text-[10px] uppercase font-bold">
                  Steps
                </div>
                <div className="font-extrabold text-sm text-gray-900">
                  {scenario.steps.length}/{scenario.steps.length}
                </div>
              </div>
              <div className="border-r border-gray-300 pr-1">
                <div className="text-gray-500 text-[10px] uppercase font-bold">
                  Mistakes
                </div>
                <div
                  className={
                    "font-extrabold text-sm " +
                    (mistakesCount === 0 ? "text-emerald-600" : "text-amber-600")
                  }
                >
                  {mistakesCount}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-[10px] uppercase font-bold">
                  Score
                </div>
                <div className="font-extrabold text-sm text-emerald-600">
                  {finalScore}%
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-2">
              <button
                type="button"
                onClick={onResetExam}
                className="flex-1 px-4 py-2 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow flex items-center justify-center space-x-1.5 cursor-pointer font-sans"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Practice Again</span>
              </button>

              <Link href={modalReturnUrl} className="flex-1">
                <button
                  type="button"
                  className="w-full px-4 py-2 bg-[#E4002B] hover:bg-[#C10024] active:bg-[#9B001D] text-xs font-bold text-white border-2 border-red-800 shadow flex items-center justify-center space-x-1.5 cursor-pointer font-sans"
                >
                  <span>{returnButtonLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
