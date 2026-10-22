"use client";

import React, { useState, useEffect } from "react";

interface TrxVoidModalProps {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export const TRX_VOID_REASONS = [
  "Wrong price",
  "Customer walkout",
  "Double scan",
  "Changed mind",
  "Other",
];

export function TrxVoidModal({ onConfirm, onCancel }: TrxVoidModalProps) {
  const [step, setStep] = useState<"CONFIRM" | "REASON">("CONFIRM");
  const [reason, setReason] = useState(TRX_VOID_REASONS[0]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (step === "CONFIRM") {
        if (e.key === "y" || e.key === "Y" || e.key === "Enter") {
          e.preventDefault();
          setStep("REASON");
        } else if (e.key === "n" || e.key === "N" || e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      } else {
        if (e.altKey && e.key === "Enter") {
          e.preventDefault();
          onConfirm(reason);
        } else if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, reason, onConfirm, onCancel]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
        <div className="w-[440px] bg-[#D4D0C8] border-4 border-[#2E7D32] shadow-2xl font-sans pointer-events-auto">
          {/* Authentic Green Header matching pos-trxvoid-step2-f8.png */}
          <div className="bg-[#2E7D32] text-white px-3 py-1 font-bold text-sm text-center uppercase tracking-wide border-b border-[#1B5E20]">
            TRANSACTION VOID
          </div>

          {step === "CONFIRM" ? (
            <div className="p-6 space-y-5 text-gray-900">
              <div className="text-center font-bold text-xs text-gray-900">
                Are you sure you want to void this transaction?
              </div>

              <div className="text-center text-xs font-bold text-red-600">
                Please press Y to continue,otherwise press N.
              </div>

              <div className="flex items-center justify-center space-x-6 pt-1">
                <button
                  type="button"
                  onClick={() => setStep("REASON")}
                  className="min-w-[85px] px-5 py-1 text-xs font-bold font-sans bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-black outline outline-1 outline-dotted outline-black cursor-pointer hover:bg-[#E2E0DC]"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="min-w-[85px] px-5 py-1 text-xs font-bold font-sans bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 cursor-pointer hover:bg-[#E2E0DC]"
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-5 text-gray-900">
              <div className="flex items-center justify-between px-2">
                <label className="text-xs font-bold text-gray-800">Select a Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  autoFocus
                  className="w-48 bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-sans font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {TRX_VOID_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center text-xs font-bold text-red-600">
                Please press Alt+Enter to continue, otherwise ESC.
              </div>

              <div className="flex items-center justify-center space-x-6 pt-1">
                <button
                  type="button"
                  onClick={() => onConfirm(reason)}
                  className="min-w-[85px] px-5 py-1 text-xs font-bold font-sans bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-black outline outline-1 outline-dotted outline-black cursor-pointer hover:bg-[#E2E0DC]"
                >
                  Ok
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="min-w-[85px] px-5 py-1 text-xs font-bold font-sans bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 cursor-pointer hover:bg-[#E2E0DC]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
