"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

export interface NonMdseOption {
  code: string;
  description: string;
  defaultAmount: string;
}

export const NON_MDSE_OPTIONS: NonMdseOption[] = [
  {
    code: "ZSOI",
    description: "SODEXHO VARIANCE",
    defaultAmount: "7.00",
  },
  {
    code: "VAR-001",
    description: "GENERAL NON-MERCHANDISE CHARGE",
    defaultAmount: "10.00",
  },
  {
    code: "VAR-025",
    description: "RETURN-EXCHANGE BALANCE VARIANCE",
    defaultAmount: "25.00",
  },
  {
    code: "VAR-100",
    description: "PROMOTIONAL SUBSIDY / CO-PAY",
    defaultAmount: "100.00",
  },
  {
    code: "VAR-030",
    description: "CUSTOM GIFT WRAPPING & PACKAGING",
    defaultAmount: "30.00",
  },
  {
    code: "VAR-200",
    description: "SPECIAL ORDER DEPOSIT VARIANCE",
    defaultAmount: "200.00",
  },
];

interface NonMerchandiseScreenProps {
  onCancel: () => void;
  onSubmit: (data: {
    description: string;
    amount: number;
    referenceNo: string;
    sku: string;
  }) => void;
  clerkName?: string;
  terminalId?: string;
  branchCode?: string;
  trxNumber?: string;
  totalQty?: number;
  totalSales?: number;
  initialCategory?: string;
  initialAmount?: string;
  initialReferenceNo?: string;
}

export function NonMerchandiseScreen({
  onCancel,
  onSubmit,
  clerkName = "Jan Angela",
  terminalId = "0003",
  branchCode = "2999",
  trxNumber = "0212202629990003000595",
  totalQty = 0,
  totalSales = 0,
  initialCategory,
  initialAmount,
  initialReferenceNo,
}: NonMerchandiseScreenProps) {
  const defaultCharge = initialCategory
    ? (NON_MDSE_OPTIONS.find(
        (o) =>
          o.description.toUpperCase().includes(initialCategory.toUpperCase()) ||
          o.code.toUpperCase() === initialCategory.toUpperCase()
      )?.description || "SODEXHO VARIANCE")
    : "SODEXHO VARIANCE";

  const [selectedCharge, setSelectedCharge] = useState(defaultCharge);
  const matchedOpt =
    NON_MDSE_OPTIONS.find((o) => o.description === selectedCharge) ||
    NON_MDSE_OPTIONS[0];

  const [price, setPrice] = useState(
    initialAmount || (matchedOpt ? matchedOpt.defaultAmount : "7.00")
  );
  const priceInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      priceInputRef.current?.focus();
      return;
    }

    const opt =
      NON_MDSE_OPTIONS.find((o) => o.description === selectedCharge) ||
      NON_MDSE_OPTIONS[0];

    onSubmit({
      description: opt.description,
      amount: priceNum,
      referenceNo: initialReferenceNo || "PP12345678",
      sku: opt.code,
    });
  }, [price, selectedCharge, initialReferenceNo, onSubmit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, handleSubmit]);

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
        <div className="w-[380px] sm:w-[400px] border-4 border-[#228B22] bg-[#D4D0C8] font-sans shadow-lg">
          {/* Title */}
          <div className="bg-[#228B22] text-white py-1.5 px-3 text-center font-bold text-sm uppercase tracking-wider">
            NON-MERCHANDISE
          </div>

          {/* Form */}
          <div className="p-6 space-y-4 text-gray-900">
            {/* Charge Select */}
            <div className="space-y-1 text-center">
              <label className="block text-xs font-bold text-gray-900">
                Select Charge
              </label>
              <div className="flex justify-center">
                <select
                  value={selectedCharge}
                  onChange={(e) => {
                    setSelectedCharge(e.target.value);
                    const found = NON_MDSE_OPTIONS.find(
                      (o) => o.description === e.target.value
                    );
                    if (found && !initialAmount) {
                      setPrice(found.defaultAmount);
                    }
                  }}
                  className="w-72 bg-white border border-gray-600 px-2 py-1 text-xs font-bold text-gray-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-green-600 cursor-pointer text-center"
                >
                  {NON_MDSE_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.description}>
                      {opt.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Input */}
            <div className="space-y-1 text-center">
              <label className="block text-xs font-bold text-gray-900">
                Enter Price
              </label>
              <div className="flex justify-center">
                <input
                  ref={priceInputRef}
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder=""
                  autoFocus
                  className="w-72 bg-white border border-gray-600 px-3 py-1 text-center font-mono font-bold text-base text-gray-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-green-600"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center space-x-4 pt-3">
              <button
                type="button"
                onClick={handleSubmit}
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
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#228B22] border-t-2 border-gray-500 flex-shrink-0 h-10 w-full" />
    </div>
  );
}
