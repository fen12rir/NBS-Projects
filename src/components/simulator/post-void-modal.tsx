"use client";

import React, { useState } from "react";

interface PostVoidModalProps {
  currentOrNumber: string;
  onAuthorizeOverride?: () => void;
  onConfirm: (data: { orNumber: string; reason: string }) => void;
  onCancel: () => void;
}

export function PostVoidModal({
  currentOrNumber,
  onAuthorizeOverride,
  onConfirm,
  onCancel,
}: PostVoidModalProps) {
  const [orNumber, setOrNumber] = useState(currentOrNumber || "TRX-0212202629990003000592");
  const [selectedReason, setSelectedReason] = useState("Customer Request / Changed Mind");
  const [isSupervisorOverridden, setIsSupervisorOverridden] = useState(false);
  const [supervisorPass, setSupervisorPass] = useState("");
  const [authError, setAuthError] = useState("");

  const REASONS = [
    "Customer Request / Changed Mind",
    "Cashier Encoding Error",
    "Duplicate Transaction Swiped",
    "Incorrect Tender / Payment Method",
    "System / Terminal Network Disconnect",
  ];

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (supervisorPass === "9999" || supervisorPass === "1234" || supervisorPass.length >= 4) {
      setIsSupervisorOverridden(true);
      setAuthError("");
      onAuthorizeOverride?.();
    } else {
      setAuthError("Invalid Manager PIN. Use '9999' or '1234' for training.");
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orNumber.trim()) return;
    onConfirm({ orNumber: orNumber.trim(), reason: selectedReason });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
        <div className="w-[450px] bg-[#D4D0C8] border-4 border-[#228B22] shadow-2xl font-sans pointer-events-auto">
          {/* Header */}
          <div className="bg-[#228B22] text-white py-1.5 px-3 text-center font-bold text-sm uppercase tracking-wide">
            POST VOID TRANSACTION (F2)
          </div>

          {!isSupervisorOverridden ? (
            /* STEP 1: MANAGER OVERRIDE AUTHENTICATION (SLIDE 078) */
            <form onSubmit={handleOverrideSubmit} className="p-6 space-y-4 text-gray-900">
              <div className="bg-[#FFF275] border border-yellow-500 p-2 text-xs font-bold text-gray-900 text-center">
                Supervisor Override Required for Post Void
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">
                  Supervisor / Manager PIN:
                </label>
                <input
                  type="password"
                  value={supervisorPass}
                  onChange={(e) => setSupervisorPass(e.target.value)}
                  placeholder="Enter 9999 or 1234"
                  className="w-full bg-white border-2 border-gray-500 px-3 py-1.5 font-mono text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-green-600 shadow-inner"
                  autoFocus
                />
              </div>

              {authError && (
                <div className="text-xs font-bold text-red-600 text-center">
                  {authError}
                </div>
              )}

              <div className="text-[11px] text-gray-500 text-center">
                Training hint: Enter PIN <code className="font-bold text-gray-800">9999</code> then press Enter.
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-1.5 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 font-bold text-xs hover:bg-[#E2E0DC] cursor-pointer"
                >
                  Cancel (Esc)
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#228B22] text-white font-bold text-xs border-2 border-green-800 hover:bg-green-700 cursor-pointer shadow"
                >
                  Authorize (Enter)
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: POST VOID DETAILS FORM (SLIDES 079-080) */
            <form onSubmit={handleFinalSubmit} className="p-6 space-y-4 text-gray-900">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800 block">
                  Original Receipt / OR Number:
                </label>
                <input
                  type="text"
                  value={orNumber}
                  onChange={(e) => setOrNumber(e.target.value)}
                  placeholder="TRX-0212202629990003000592"
                  className="w-full bg-white border-2 border-gray-500 px-3 py-1.5 font-mono font-bold text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 shadow-inner"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800 block">
                  Reason for Post Void:
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full bg-white border-2 border-gray-500 px-2 py-1.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-red-50 border border-red-300 p-2 text-xs text-red-700 font-sans">
                <span className="font-bold">Caution:</span> Post Void permanently voids this completed Official Receipt and creates a post-void audit log on the terminal.
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-1.5 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 font-bold text-xs hover:bg-[#E2E0DC] cursor-pointer"
                >
                  No (Esc)
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-red-700 text-white font-bold text-xs border-2 border-red-900 hover:bg-red-800 cursor-pointer shadow"
                >
                  Yes, Void Transaction (Alt+Enter)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
