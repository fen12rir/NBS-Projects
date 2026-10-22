"use client";

import React, { useState, useEffect } from "react";

interface ItemVoidModalProps {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export const VOID_REASONS = [
  "Wrong Author",
  "Wrong Price",
  "Wrong Quantity",
  "Customer Cancel",
  "Damaged Item",
];

export function ItemVoidModal({ onConfirm, onCancel }: ItemVoidModalProps) {
  const [reason, setReason] = useState(VOID_REASONS[0]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "Enter") {
        e.preventDefault();
        onConfirm(reason);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reason, onConfirm, onCancel]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
        <div className="w-[440px] bg-[#D4D0C8] border-4 border-[#2E7D32] shadow-2xl font-sans pointer-events-auto">
          {/* Authentic Green Header */}
          <div className="bg-[#2E7D32] text-white px-3 py-1 font-bold text-sm text-center uppercase tracking-wide border-b border-[#1B5E20]">
            ITEM VOID
          </div>

          <div className="p-6 space-y-5 text-gray-900">
            {/* Reason selector matching pos-itemvoid-step2-f7.png */}
            <div className="flex items-center justify-between px-2">
              <label className="text-xs font-bold text-gray-800">Select a Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                autoFocus
                className="w-48 bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-sans font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                {VOID_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Red Prompt Text */}
            <div className="text-center text-xs font-bold text-red-600">
              Please press Alt+Enter to continue, otherwise ESC.
            </div>

            {/* Buttons: Ok & Cancel */}
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
        </div>
      </div>
    </>
  );
}
