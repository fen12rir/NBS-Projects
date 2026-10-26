"use client";

import React, { useState, useEffect } from "react";

interface ReturnModalProps {
  mode: "RETURN" | "REFUND";
  onConfirmReturn: (data: { reason: string; orNumber: string; sku: string }) => void;
  onConfirmRefund: (data: { reason: string; orNumber: string; amount: number }) => void;
  onCancel: () => void;
}

export function ReturnRefundModal({
  mode,
  onConfirmReturn,
  onConfirmRefund,
  onCancel,
}: ReturnModalProps) {
  const isReturn = mode === "RETURN";

  const [reason, setReason] = useState("Wrong Author");
  const [orNumber, setOrNumber] = useState("0218202629990003000660");
  const [sku, setSku] = useState("12");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isReturn) {
      onConfirmReturn({ reason, orNumber, sku });
    } else {
      onConfirmRefund({ reason: "Refund OR", orNumber, amount: 61.50 });
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
        <form
          onSubmit={handleSubmit}
          className="w-[440px] bg-[#D4D0C8] border-4 border-[#2E7D32] shadow-2xl font-sans pointer-events-auto"
        >
          {/* Authentic Green Header */}
          <div className="bg-[#2E7D32] text-white px-3 py-1 font-bold text-sm text-center uppercase tracking-wide border-b border-[#1B5E20]">
            {isReturn ? "ITEM RETURN" : "ITEM REFUND"}
          </div>

          <div className="p-6 space-y-4 text-gray-900">
            {isReturn && (
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-800">
                  Select a Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-48 bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-sans font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Wrong Author">Wrong Author</option>
                  <option value="Wrong Price">Wrong Price</option>
                  <option value="Defective / Damaged">Defective / Damaged</option>
                  <option value="Customer Change of Mind">Customer Change of Mind</option>
                </select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800">
                Enter ORNO
              </label>
              <input
                type="text"
                value={orNumber}
                onChange={(e) => setOrNumber(e.target.value)}
                autoFocus
                className="w-48 bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Red prompt text */}
            <div className="text-center text-xs font-bold text-red-600 pt-1">
              Please press Alt+Enter to continue, otherwise ESC.
            </div>

            {/* Buttons: Ok & Cancel */}
            <div className="flex items-center justify-center space-x-6 pt-2">
              <button
                type="submit"
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
        </form>
      </div>
    </>
  );
}
