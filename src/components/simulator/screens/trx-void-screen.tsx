"use client";

import React, { useState, useEffect } from "react";

export const TRX_VOID_REASONS = [
  "Wrong price",
  "Cashier Error",
  "Customer Cancel",
  "System Error",
  "Changed mind",
  "Other",
];

interface TrxVoidScreenProps {
  clerkName?: string;
  terminalId?: string;
  branchCode?: string;
  trxNumber?: string;
  totalQty?: number;
  totalSales?: number;
  onProceed?: () => void;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function TrxVoidScreen({
  clerkName = "Jan Angela",
  terminalId = "0003",
  branchCode = "2999",
  trxNumber = "0212202629990003000597",
  totalQty = 0,
  totalSales = 0,
  onProceed,
  onConfirm,
  onCancel,
}: TrxVoidScreenProps) {
  const [step, setStep] = useState<"CONFIRM" | "REASON">("CONFIRM");
  const [reason, setReason] = useState(TRX_VOID_REASONS[0]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (step === "CONFIRM") {
        if (e.key === "y" || e.key === "Y" || e.key === "Enter") {
          e.preventDefault();
          setStep("REASON");
          onProceed?.();
        } else if (e.key === "n" || e.key === "N" || e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      } else {
        if ((e.key === "Enter" && e.altKey) || (e.key === "Enter" && !e.shiftKey)) {
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
  }, [step, reason, onProceed, onConfirm, onCancel]);

  const today = new Date();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const todayLabel = `${today.getFullYear()}-${months[today.getMonth()]}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  const currentTimeLabel = today.toLocaleTimeString("en-US", { hour12: true });

  return (
    <div className="flex min-h-0 w-full flex-1 select-none flex-col overflow-hidden bg-white font-sans">
      {/* Header */}
      <div className="bg-[#BCC4CC] border-b border-gray-400 px-4 py-1 flex items-center justify-between text-[11px] font-mono text-gray-900 border-t border-t-white flex-shrink-0 h-7 select-none w-full">
        <span><span className="font-bold">Trx.:</span> {trxNumber}</span>
        <span><span className="font-bold">Clerk:</span> {clerkName}</span>
        <span><span className="font-bold">Str No.:</span> {branchCode}</span>
        <span><span className="font-bold">Reg No.:</span> {terminalId}</span>
        <span className="font-bold">{todayLabel}</span>
      </div>

      {/* Yellow Strip */}
      <div className="bg-[#FFF275] h-7 w-full border-b border-gray-400 flex-shrink-0" />

      {/* Main Area */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 overflow-hidden">
        <div className="w-[440px] border-4 border-[#228B22] bg-[#D4D0C8] font-sans shadow-lg">
          {/* Title */}
          <div className="bg-[#228B22] text-white py-1 px-3 text-center font-bold text-sm uppercase tracking-wider">
            TRANSACTION VOID
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 text-gray-900">
            {step === "CONFIRM" ? (
              <>
                <div className="text-center font-bold text-sm text-gray-900 pt-1 leading-snug">
                  Are you sure you want to void this transaction?
                </div>

                <div className="text-center font-bold text-[11px] text-red-600 pt-1">
                  Please press Y to continue,otherwise press N.
                </div>

                <div className="flex items-center justify-center space-x-6 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("REASON");
                      onProceed?.();
                    }}
                    className="min-w-[85px] px-5 py-1 text-xs font-bold font-sans bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-black outline outline-1 outline-dotted outline-black cursor-pointer hover:bg-[#E2E0DC]"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="min-w-[85px] px-5 py-1 text-xs font-bold font-sans bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 hover:bg-[#E2E0DC] cursor-pointer"
                  >
                    No
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center space-x-3 pt-2">
                  <label className="text-xs font-bold text-gray-900">
                    Select a Reason
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    autoFocus
                    className="w-56 bg-white border-2 border-gray-600 px-2 py-1 text-xs font-bold text-gray-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-green-600 cursor-pointer"
                  >
                    {TRX_VOID_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-center font-bold text-[11px] text-red-600 pt-2 leading-tight">
                  Please press Alt+Enter to continue, otherwise ESC.
                </div>

                <div className="flex items-center justify-center space-x-6 pt-3">
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
                    className="min-w-[85px] px-5 py-1 text-xs font-bold font-sans bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 hover:bg-[#E2E0DC] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#228B22] border-t-2 border-gray-500 flex-shrink-0 h-10 w-full" />
    </div>
  );
}
