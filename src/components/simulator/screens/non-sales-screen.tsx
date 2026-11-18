"use client";

import React, { useState, useEffect, useRef } from "react";

export interface NonSalesChargeOption {
  code: string;
  sku: string;
  description: string;
  defaultAmount: string;
}

export const NON_SALES_OPTIONS: NonSalesChargeOption[] = [
  {
    code: "LNQR_EGC",
    sku: "S400000001352",
    description: "LNQR EGC",
    defaultAmount: "500",
  },
  {
    code: "NBS_GC",
    sku: "S400000001353",
    description: "NBS GIFT CARD RELOAD",
    defaultAmount: "1000",
  },
  {
    code: "DOWN_PAYMENT",
    sku: "S400000001354",
    description: "DOWN PAYMENT / RESERVATION",
    defaultAmount: "500",
  },
];

interface NonSalesScreenProps {
  clerkName?: string;
  terminalId?: string;
  branchCode?: string;
  trxNumber?: string;
  onConfirm: (data: {
    category: string;
    sku: string;
    amount: number;
    referenceNo: string;
    customerName: string;
  }) => void;
  onCancel: () => void;
}

export function NonSalesScreen({
  clerkName = "Jan Angela",
  terminalId = "0007",
  branchCode = "2999",
  trxNumber = "11042026299900070002750",
  onConfirm,
  onCancel,
}: NonSalesScreenProps) {
  const [selectedCharge, setSelectedCharge] = useState(NON_SALES_OPTIONS[0].description);
  const [price, setPrice] = useState("500");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [popupFocusedBtn, setPopupFocusedBtn] = useState<"OK" | "CANCEL">("OK");

  const selectRef = useRef<HTMLSelectElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const okBtnRef = useRef<HTMLButtonElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const popupOkBtnRef = useRef<HTMLButtonElement>(null);
  const popupCancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    priceInputRef.current?.focus();
    priceInputRef.current?.select();
  }, []);

  useEffect(() => {
    if (showConfirmPopup) {
      setPopupFocusedBtn("OK");
      setTimeout(() => {
        popupOkBtnRef.current?.focus();
      }, 20);
    }
  }, [showConfirmPopup]);

  const parsedAmount = parseFloat(price);
  const validAmount = !isNaN(parsedAmount) && parsedAmount > 0 ? parsedAmount : 500;

  const handleOpenPopup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!price.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setPrice("500");
    }
    setShowConfirmPopup(true);
  };

  const handleFinalConfirm = () => {
    const matched =
      NON_SALES_OPTIONS.find((o) => o.description === selectedCharge) ||
      NON_SALES_OPTIONS[0];
    setShowConfirmPopup(false);
    onConfirm({
      category: matched.description,
      sku: matched.sku,
      amount: validAmount,
      referenceNo: matched.sku,
      customerName: "Walk-in Customer",
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showConfirmPopup) {
        if (e.key === "Tab" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          setPopupFocusedBtn((prev) => {
            const next = prev === "OK" ? "CANCEL" : "OK";
            if (next === "OK") popupOkBtnRef.current?.focus();
            else popupCancelBtnRef.current?.focus();
            return next;
          });
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (popupFocusedBtn === "CANCEL") {
            setShowConfirmPopup(false);
          } else {
            handleFinalConfirm();
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          setShowConfirmPopup(false);
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showConfirmPopup, popupFocusedBtn, selectedCharge, price]);

  const today = new Date();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const todayLabel = `${today.getFullYear()}-${months[today.getMonth()]}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  return (
    <div className="flex min-h-0 w-full flex-1 select-none flex-col overflow-hidden bg-white font-sans relative">
      {/* Top Header Bar */}
      <div className="bg-[#BCC4CC] border-b border-gray-400 px-4 py-1 flex items-center justify-between text-[11px] font-mono text-gray-900 border-t border-t-white flex-shrink-0 h-7 select-none w-full">
        <span><span className="font-bold">Trx.:</span> {trxNumber}</span>
        <span><span className="font-bold">Clerk:</span> {clerkName}</span>
        <span><span className="font-bold">Str No.:</span> {branchCode}</span>
        <span><span className="font-bold">Reg No.:</span> {terminalId}</span>
        <span className="font-bold">{todayLabel}</span>
      </div>

      {/* Top Yellow Strip */}
      <div className="bg-[#FFF275] h-7 w-full border-b border-gray-400 flex-shrink-0" />

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 overflow-hidden">
        <form
          onSubmit={handleOpenPopup}
          className="w-[330px] border-[6px] border-[#22A838] bg-[#C0C6CC] font-sans shadow-lg"
        >
          {/* Green Title Bar */}
          <div className="bg-[#22A838] text-white py-1 px-3 text-center font-bold text-sm uppercase tracking-wider">
            NON SALES
          </div>

          {/* Dialog Body */}
          <div className="px-4 py-3 space-y-4 text-gray-900">
            {/* Select Charge */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-900 text-center">
                Select Charge
              </label>
              <select
                ref={selectRef}
                value={selectedCharge}
                onChange={(e) => {
                  setSelectedCharge(e.target.value);
                  const found = NON_SALES_OPTIONS.find(
                    (o) => o.description === e.target.value
                  );
                  if (found) setPrice(found.defaultAmount);
                }}
                className="w-full bg-white border border-gray-600 px-2 py-1 text-xs font-sans text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                {NON_SALES_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.description}>
                    {opt.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Enter Price Row */}
            <div className="flex items-center justify-between px-3 py-3">
              <label
                htmlFor="non-sales-price-input"
                className="text-xs font-bold text-gray-900 leading-tight text-center"
              >
                Enter
                <br />
                Price
              </label>
              <input
                id="non-sales-price-input"
                ref={priceInputRef}
                type="number"
                step="1"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Tab" && !e.shiftKey) {
                    e.preventDefault();
                    okBtnRef.current?.focus();
                  }
                }}
                className="w-44 bg-white border border-gray-300 px-2 py-1 text-xs font-sans text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-3 pt-1">
              <button
                ref={okBtnRef}
                type="submit"
                className="w-32 py-0.5 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] focus:outline-1 focus:outline-dotted focus:outline-black focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                Ok
              </button>
              <button
                ref={cancelBtnRef}
                type="button"
                onClick={onCancel}
                className="w-32 py-0.5 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] focus:outline-1 focus:outline-dotted focus:outline-black cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Bottom Green Footer Bar */}
      <div className="bg-[#22A838] border-t border-green-700 flex-shrink-0 h-7 w-full" />

      {/* Unnamed Confirmation Pop-up */}
      {showConfirmPopup && (
        <div className="absolute inset-0 z-50 bg-black/25 flex items-center justify-center p-4">
          <div className="w-[520px] max-w-full bg-[#EFEFEF] border border-gray-500 shadow-2xl font-sans overflow-hidden">
            {/* Dark Window Title Bar */}
            <div className="bg-[#141414] text-gray-200 px-2.5 py-1 flex items-center justify-between text-xs select-none">
              <span className="text-[10px] text-gray-400">▪</span>
              <span className="font-semibold tracking-wide text-gray-200">Unnamed</span>
              <div className="flex items-center space-x-2 text-gray-400 text-xs">
                <span>▬</span>
                <button
                  type="button"
                  onClick={() => setShowConfirmPopup(false)}
                  className="hover:text-white cursor-pointer"
                  aria-label="Close popup"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Popup Message Body */}
            <div className="px-6 py-5 text-center text-sm text-gray-700 font-sans">
              The amount to be loaded is P{validAmount.toFixed(0)}. Are you sure you want to proceed?
            </div>

            {/* Bottom Split Buttons */}
            <div className="grid grid-cols-2 border-t border-gray-300 bg-[#E6E6E6]">
              <button
                ref={popupOkBtnRef}
                type="button"
                onClick={handleFinalConfirm}
                className={`py-2 text-center text-sm font-sans text-gray-700 border-r border-gray-300 hover:bg-gray-200 cursor-pointer focus:outline-none ${
                  popupFocusedBtn === "OK" ? "bg-gray-200 font-semibold ring-1 ring-inset ring-blue-500" : ""
                }`}
              >
                Ok
              </button>
              <button
                ref={popupCancelBtnRef}
                type="button"
                onClick={() => setShowConfirmPopup(false)}
                className={`py-2 text-center text-sm font-sans text-gray-700 hover:bg-gray-200 cursor-pointer focus:outline-none ${
                  popupFocusedBtn === "CANCEL" ? "bg-gray-200 font-semibold ring-1 ring-inset ring-blue-500" : ""
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
