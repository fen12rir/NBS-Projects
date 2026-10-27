"use client";

import React, { useState } from "react";

interface NonMdseModalProps {
  onConfirm: (data: { description: string; amount: number; referenceNo: string }) => void;
  onCancel: () => void;
}

export function NonMdseModal({ onConfirm, onCancel }: NonMdseModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("Sodexo / GC Variance");
  const [amount, setAmount] = useState("50.00");
  const [referenceNo, setReferenceNo] = useState("REF-VAR-9021");

  const CATEGORIES = [
    { label: "Sodexo / Voucher Variance", defaultAmount: "50.00" },
    { label: "Return-Exchange Balance Variance", defaultAmount: "25.00" },
    { label: "Promotional Subsidy / Co-Pay", defaultAmount: "100.00" },
    { label: "Custom Gift Wrapping & Packaging", defaultAmount: "30.00" },
    { label: "Special Order Deposit Variance", defaultAmount: "200.00" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    onConfirm({
      description: selectedCategory,
      amount: amountNum,
      referenceNo: referenceNo.trim() || "VAR-001",
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
        <div className="w-[440px] bg-[#D4D0C8] border-4 border-[#228B22] shadow-2xl font-sans pointer-events-auto">
          {/* Green Title Bar */}
          <div className="bg-[#228B22] text-white py-1.5 px-3 text-center font-bold text-sm uppercase tracking-wide">
            NON-MERCHANDISE SELECTION (F6)
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-gray-900">
            <div className="bg-[#FFF275] border border-yellow-500 p-2 text-xs font-bold text-gray-900 text-center">
              Add non-merchandise variance or fee line to transaction
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-800 block">
                Select Variance / Service Category:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  const matched = CATEGORIES.find((c) => c.label === e.target.value);
                  if (matched) setAmount(matched.defaultAmount);
                }}
                className="w-full bg-white border-2 border-gray-500 px-2 py-1.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.label} value={c.label}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-800 block">
                Variance Amount (PHP):
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full bg-white border-2 border-gray-600 px-3 py-1.5 text-center font-mono font-bold text-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-inner"
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-800 block">
                Voucher / Documentation Reference No.:
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="REF-VAR-9021"
                className="w-full bg-white border-2 border-gray-500 px-3 py-1 font-mono font-bold text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 shadow-inner"
              />
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
                Add Non-Mdse (Enter)
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
