"use client";

import React, { useState, useEffect } from "react";

interface ReturnModalProps {
  mode: "RETURN" | "REFUND";
  onConfirmReturn: (data: { reason: string; orNumber: string }) => void;
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
  const [isRefundConfirmationOpen, setIsRefundConfirmationOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState("");
  const [returnStep, setReturnStep] = useState<"STORE" | "MANAGER_OVERRIDE" | "DETAILS">(
    mode === "RETURN" ? "STORE" : "DETAILS"
  );
  const [managerUsername, setManagerUsername] = useState("admin");
  const [managerPassword, setManagerPassword] = useState("1234");
  const [managerAuthError, setManagerAuthError] = useState("");

  const confirmRefund = () => {
    onConfirmRefund({ reason: "Refund OR", orNumber, amount: 61.50 });
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === "RETURN" && returnStep === "STORE") {
        if (e.altKey && e.key === "Enter") {
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
      } else if (e.altKey && e.key === "Enter") {
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
      onConfirmReturn({ reason, orNumber });
    } else {
      setIsRefundConfirmationOpen(true);
    }
  };

  if (mode === "RETURN" && returnStep === "STORE") {
    return (
      <>
        <div
          className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onCancel}
        />
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
          <section className="w-full max-w-md border-4 border-[#2E7D32] bg-[#D4D0C8] font-sans shadow-2xl pointer-events-auto">
            <header className="border-b border-[#1B5E20] bg-[#2E7D32] px-3 py-2 text-center text-sm font-bold uppercase tracking-wide text-white">
              Select Store
            </header>
            <div className="space-y-5 p-6">
              <div className="space-y-2">
                <label
                  htmlFor="return-store"
                  className="block text-xs font-bold text-gray-800"
                >
                  Select Store
                </label>
                <select
                  id="return-store"
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  autoFocus
                  className="w-full border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white px-2 py-2 text-sm font-bold text-gray-900"
                >
                  <option value="">-- Select Store --</option>
                  <option value="OWN_STORE">Own Store</option>
                  <option value="OWN_STORE">Other Store</option>
                </select>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={continueFromStoreSelection}
                  disabled={!selectedStore}
                  className="min-w-[100px] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#D4D0C8] px-5 py-2 text-xs font-bold text-gray-900 enabled:hover:bg-[#E2E0DC] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="min-w-[100px] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#D4D0C8] px-5 py-2 text-xs font-bold text-gray-900 hover:bg-[#E2E0DC]"
                >
                  Cancel
                </button>
              </div>
              <p className="text-center text-xs font-bold text-gray-700">
                Select a store, then press Alt+Enter to continue.
              </p>
            </div>
          </section>
        </div>
      </>
    );
  }

  if (mode === "RETURN" && returnStep === "MANAGER_OVERRIDE") {
    return (
      <>
        <div
          className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onCancel}
        />
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
          <section className="w-full max-w-md border-4 border-[#2E7D32] bg-[#D4D0C8] font-sans shadow-2xl pointer-events-auto">
            <header className="border-b border-[#1B5E20] bg-[#2E7D32] px-3 py-2 text-center text-sm font-bold uppercase tracking-wide text-white">
              Manager Override
            </header>
            <div className="space-y-4 p-6 text-gray-900">
              <p className="text-center text-xs font-bold">
                Manager approval is required to continue with the return.
              </p>
              <label className="block text-xs font-bold">
                Username
                <input
                  type="text"
                  value={managerUsername}
                  onChange={(e) => setManagerUsername(e.target.value)}
                  className="mt-1 w-full border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white px-2 py-1 font-mono text-sm"
                />
              </label>
              <label className="block text-xs font-bold">
                Password
                <input
                  type="password"
                  value={managerPassword}
                  onChange={(e) => {
                    setManagerPassword(e.target.value);
                    setManagerAuthError("");
                  }}
                  autoFocus
                  className="mt-1 w-full border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white px-2 py-1 font-mono text-sm"
                />
              </label>
              {managerAuthError && (
                <p role="alert" className="text-center text-xs font-bold text-red-700">
                  {managerAuthError}
                </p>
              )}
              <div className="flex justify-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={confirmManagerOverride}
                  className="min-w-[90px] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#D4D0C8] px-5 py-2 text-xs font-bold hover:bg-[#E2E0DC]"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="min-w-[90px] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] bg-[#D4D0C8] px-5 py-2 text-xs font-bold hover:bg-[#E2E0DC]"
                >
                  No
                </button>
              </div>
              <p className="text-center text-xs font-bold text-gray-700">
                Press ENTER to approve or ESC to cancel.
              </p>
            </div>
          </section>
        </div>
      </>
    );
  }

  if (isRefundConfirmationOpen) {
    return (
      <div className="absolute inset-0 z-50 grid grid-cols-2 gap-3 overflow-hidden bg-[#0879C9] p-3 font-sans sm:gap-4 sm:p-4">
        <div className="flex min-w-0 flex-col justify-center gap-4 overflow-y-auto">
          <section className="w-full border-2 border-blue-950 bg-[#EAF5FF] p-3 shadow-2xl sm:p-4">
            <label
              htmlFor="refund-reason"
              className="mb-2 block text-sm font-bold text-gray-900"
            >
              Refund Reason
            </label>
            <select
              id="refund-reason"
              defaultValue=""
              className="w-full border-2 border-gray-500 bg-white px-3 py-2 text-sm text-gray-900 shadow-inner"
            >
              <option value="">-- Select Refund Reason --</option>
              <option value="">Wrong Product</option>
              <option value="">Wrong Author</option>
              <option value="">Wrong Size</option>
              <option value="">Exchange</option>
            </select>
          </section>
          <section className="w-full border-2 border-blue-950 bg-[#EAF5FF] p-3 text-center shadow-2xl sm:p-5">
            <div>
              <h2 className="mb-4 text-xl font-bold text-gray-900">Confirm Refund</h2>
              <p className="mb-3 text-sm text-gray-800">
                Are you sure you want to refund this transaction?
              </p>
              <p className="mb-6 font-mono text-sm font-bold text-gray-900">
                ORNO: {orNumber}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={confirmRefund}
                  className="min-w-[100px] border-2 border-blue-950 bg-blue-700 px-5 py-2 text-sm font-bold text-white hover:bg-blue-800"
                  autoFocus
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setIsRefundConfirmationOpen(false)}
                  className="min-w-[100px] border-2 border-gray-600 bg-[#D4D0C8] px-5 py-2 text-sm font-bold text-gray-900 hover:bg-[#E2E0DC]"
                >
                  No
                </button>
              </div>
              <p className="mt-4 text-xs text-gray-700">
                Press ENTER to confirm or ESC to go back.
              </p>
            </div>
          </section>
        </div>
        <aside className="flex min-h-0 min-w-0 flex-col border-2 border-gray-700 bg-gray-800 p-2 shadow-2xl sm:p-3">
          <div className="mb-2 shrink-0 text-center font-sans text-xs font-bold uppercase tracking-widest text-gray-300">
            Refund Receipt
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#fffef8] p-3 font-mono text-xs leading-tight text-gray-900 shadow-md sm:p-5">
            <header className="mb-4 text-center font-bold">
              <div>NATIONAL BOOK STORE</div>
              <div>ABACUS BOOK &amp; CARD CORPORATION</div>
              <div>QUAD ALPHA CENTRUM 125 PIONEER ST.</div>
              <div>MANDALUYONG CITY</div>
              <div>VAT TIN: 000-299-299-00000</div>
            </header>
            <div className="my-3 border-t border-dashed border-gray-500" />
            <div className="space-y-1">
              <div>DATE: 10/27/2026</div>
              <div>TIME: 03:17 PM</div>
              <div>OR NO: {orNumber}</div>
              <div>CLERK: 241209</div>
              <div>TERM: 0004</div>
            </div>
            <div className="my-3 border-t border-dashed border-gray-500" />
            <div className="flex justify-between font-bold">
              <span>REFUND</span>
              <span>61.50</span>
            </div>
            <div className="mt-1">1 x NOTEBOOK</div>
            <div className="flex justify-between">
              <span>Customer Refund</span>
              <span>61.50</span>
            </div>
            <div className="my-3 border-t border-dashed border-gray-500" />
            <div className="flex justify-between font-bold">
              <span>TOTAL REFUND</span>
              <span>61.50</span>
            </div>
            <div className="mt-4 text-center font-bold">
              *** REFUND RECEIPT ***
              <div>Please retain for your records</div>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <>
      <div
        className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
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
