"use client";

import React, { useState, useEffect } from "react";

export interface ReturnRefundScreenProps {
  mode: "RETURN" | "REFUND";
  clerkName?: string;
  terminalId?: string;
  branchCode?: string;
  trxNumber?: string;
  totalQty?: number;
  totalSales?: number;
  onConfirmReturn: (data: { reason: string; orNumber: string }) => void;
  onConfirmRefund: (data: { reason: string; orNumber: string; amount: number }) => void;
  onRefundOrnoSubmit?: (orNumber: string) => void;
  onCancel: () => void;
}

export function ReturnRefundScreen({
  mode,
  clerkName = "Jan Angela",
  terminalId = "0003",
  branchCode = "2999",
  trxNumber = "0212202629990003000595",
  totalQty = 0,
  totalSales = 0,
  onConfirmReturn,
  onConfirmRefund,
  onRefundOrnoSubmit,
  onCancel,
}: ReturnRefundScreenProps) {
  const isReturn = mode === "RETURN";

  const [reason, setReason] = useState("Wrong Author");
  const [orNumber, setOrNumber] = useState("0218202629990003000660");
  const [isRefundConfirmationOpen, setIsRefundConfirmationOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("Wrong Product");
  const [selectedStore, setSelectedStore] = useState("");
  const [returnStep, setReturnStep] = useState<"STORE" | "MANAGER_OVERRIDE" | "DETAILS">(
    mode === "RETURN" ? "STORE" : "DETAILS"
  );
  const [managerUsername, setManagerUsername] = useState("admin");
  const [managerPassword, setManagerPassword] = useState("1234");
  const [managerAuthError, setManagerAuthError] = useState("");

  const confirmRefund = () => {
    onConfirmRefund({ reason: refundReason || "Refund OR", orNumber, amount: 61.50 });
  };

  const continueFromStoreSelection = () => {
    if (selectedStore) {
      setReturnStep("MANAGER_OVERRIDE");
    }
  };

  const confirmManagerOverride = () => {
    if (managerPassword === "9999" || managerPassword === "1234" || managerPassword.length >= 4) {
      setManagerAuthError("");
      setReturnStep("DETAILS");
      return;
    }
    setManagerAuthError("Invalid Manager PIN. Enter at least 4 characters.");
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isReturn) {
      onConfirmReturn({ reason, orNumber });
    } else {
      if (onRefundOrnoSubmit) {
        onRefundOrnoSubmit(orNumber);
      }
      setIsRefundConfirmationOpen(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === "RETURN" && returnStep === "STORE") {
        if ((e.altKey && e.key === "Enter") || (!e.shiftKey && e.key === "Enter" && selectedStore)) {
          e.preventDefault();
          continueFromStoreSelection();
        } else if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      } else if (mode === "RETURN" && returnStep === "MANAGER_OVERRIDE") {
        if (e.key === "Enter") {
          e.preventDefault();
          confirmManagerOverride();
        } else if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      } else if (mode === "REFUND" && isRefundConfirmationOpen) {
        if (e.key === "Enter") {
          e.preventDefault();
          confirmRefund();
        } else if (e.key === "Escape") {
          e.preventDefault();
          setIsRefundConfirmationOpen(false);
        }
      } else if ((e.altKey && e.key === "Enter") || (!e.shiftKey && e.key === "Enter")) {
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
        {mode === "RETURN" && returnStep === "STORE" && (
          <div className="w-[440px] border-4 border-[#228B22] bg-[#D4D0C8] font-sans shadow-lg">
            <div className="bg-[#228B22] text-white py-1.5 px-3 text-center font-bold text-sm uppercase tracking-wider">
              SELECT STORE
            </div>
            <div className="space-y-4 p-6 text-gray-900">
              <div className="space-y-1.5">
                <label
                  htmlFor="return-store"
                  className="block text-xs font-bold text-gray-900 text-center"
                >
                  Select Store
                </label>
                <div className="flex justify-center">
                  <select
                    id="return-store"
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    autoFocus
                    className="w-72 bg-white border border-gray-600 px-2 py-1 text-xs font-bold text-gray-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-green-600 cursor-pointer text-center"
                  >
                    <option value="">-- Select Store --</option>
                    <option value="OWN_STORE">Own Store</option>
                    <option value="OTHER_STORE">Other Store</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-center space-x-4 pt-2">
                <button
                  type="button"
                  onClick={continueFromStoreSelection}
                  disabled={!selectedStore}
                  className="min-w-[90px] px-6 py-1 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="min-w-[90px] px-6 py-1 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <p className="text-center text-[11px] font-bold text-gray-700">
                Select a store, then press Alt+Enter to continue.
              </p>
            </div>
          </div>
        )}

        {mode === "RETURN" && returnStep === "MANAGER_OVERRIDE" && (
          <div className="w-[440px] border-4 border-[#228B22] bg-[#D4D0C8] font-sans shadow-lg">
            <div className="bg-[#228B22] text-white py-1.5 px-3 text-center font-bold text-sm uppercase tracking-wider">
              MANAGER OVERRIDE
            </div>
            <div className="space-y-4 p-6 text-gray-900">
              <p className="text-center text-xs font-bold leading-snug">
                Manager approval is required to continue with the return.
              </p>
              <div className="space-y-3 pt-1 max-w-[280px] mx-auto">
                <div className="flex flex-col items-center">
                  <input
                    type="text"
                    value={managerUsername}
                    onChange={(e) => setManagerUsername(e.target.value)}
                    className="w-full bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-mono font-bold text-gray-900 text-center focus:outline-none"
                  />
                  <label className="text-[11px] font-bold text-gray-700 mt-1">
                    Username
                  </label>
                </div>
                <div className="flex flex-col items-center">
                  <input
                    type="text"
                    style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-form-type="other"
                    value={managerPassword}
                    onChange={(e) => {
                      setManagerPassword(e.target.value);
                      setManagerAuthError("");
                    }}
                    autoFocus
                    className="w-full bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-mono font-bold text-gray-900 text-center focus:outline-none"
                  />
                  <label className="text-[11px] font-bold text-gray-700 mt-1">
                    Password
                  </label>
                </div>
              </div>
              {managerAuthError && (
                <p role="alert" className="text-center text-xs font-bold text-red-700">
                  {managerAuthError}
                </p>
              )}
              <div className="flex justify-center space-x-4 pt-1">
                <button
                  type="button"
                  onClick={confirmManagerOverride}
                  className="min-w-[90px] px-6 py-1 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="min-w-[90px] px-6 py-1 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer"
                >
                  No
                </button>
              </div>
              <p className="text-center text-[11px] font-bold text-gray-700">
                Press ENTER to approve or ESC to cancel.
              </p>
            </div>
          </div>
        )}

        {((mode === "RETURN" && returnStep === "DETAILS") || (mode === "REFUND" && !isRefundConfirmationOpen)) && (
          <form
            onSubmit={handleSubmit}
            className="w-[440px] border-4 border-[#228B22] bg-[#D4D0C8] font-sans shadow-lg"
          >
            <div className="bg-[#228B22] text-white py-1.5 px-3 text-center font-bold text-sm uppercase tracking-wider">
              {isReturn ? "ITEM RETURN" : "ITEM REFUND"}
            </div>

            <div className="p-6 space-y-4 text-gray-900">
              {isReturn && (
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-900">
                    Select a Reason
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-52 bg-white border border-gray-600 px-2 py-1 text-xs font-sans font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-600"
                  >
                    <option value="Wrong Author">Wrong Author</option>
                    <option value="Wrong Price">Wrong Price</option>
                    <option value="Defective / Damaged">Defective / Damaged</option>
                    <option value="Customer Change of Mind">Customer Change of Mind</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-900">
                  Enter ORNO
                </label>
                <input
                  type="text"
                  value={orNumber}
                  onChange={(e) => setOrNumber(e.target.value)}
                  autoFocus
                  className="w-52 bg-white border border-gray-600 px-2 py-1 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-600"
                />
              </div>

              <div className="text-center font-bold text-[11px] text-red-600 pt-1 leading-tight">
                Please press Alt+Enter to continue, otherwise ESC.
              </div>

              <div className="flex items-center justify-center space-x-6 pt-2">
                <button
                  type="submit"
                  className="min-w-[90px] px-6 py-1 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer"
                >
                  Ok
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="min-w-[90px] px-6 py-1 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {mode === "REFUND" && isRefundConfirmationOpen && (
          <div className="w-[460px] border-4 border-[#228B22] bg-[#D4D0C8] font-sans shadow-lg">
            <div className="bg-[#228B22] text-white py-1.5 px-3 text-center font-bold text-sm uppercase tracking-wider">
              CONFIRM REFUND
            </div>
            <div className="p-6 space-y-4 text-gray-900 text-center">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-900">
                  Refund Reason
                </label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-64 bg-white border border-gray-600 px-2 py-1 text-xs font-bold text-gray-900 mx-auto block"
                >
                  <option value="Wrong Product">Wrong Product</option>
                  <option value="Wrong Author">Wrong Author</option>
                  <option value="Wrong Size">Wrong Size</option>
                  <option value="Exchange">Exchange</option>
                </select>
              </div>

              <div className="pt-2">
                <p className="text-xs font-bold text-gray-800">
                  Are you sure you want to refund this transaction?
                </p>
                <p className="font-mono text-xs font-bold text-gray-900 pt-1">
                  ORNO: {orNumber}
                </p>
              </div>

              <div className="flex justify-center space-x-6 pt-2">
                <button
                  type="button"
                  onClick={confirmRefund}
                  autoFocus
                  className="min-w-[90px] px-6 py-1 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setIsRefundConfirmationOpen(false)}
                  className="min-w-[90px] px-6 py-1 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer"
                >
                  No
                </button>
              </div>

              <p className="text-[11px] font-bold text-gray-700">
                Press ENTER to confirm or ESC to go back.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-[#228B22] border-t-2 border-gray-500 flex-shrink-0 h-10 w-full" />
    </div>
  );
}
