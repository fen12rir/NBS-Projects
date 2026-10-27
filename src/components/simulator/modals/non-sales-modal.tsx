"use client";

import React, { useState } from "react";

interface NonSalesModalProps {
  onConfirm: (data: { category: string; amount: number; referenceNo: string; customerName: string }) => void;
  onCancel: () => void;
}

export function NonSalesModal({ onConfirm, onCancel }: NonSalesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("Down Payment / Book Reservation");
  const [amount, setAmount] = useState("500.00");
  const [referenceNo, setReferenceNo] = useState("NS-2026-0812");
  const [customerName, setCustomerName] = useState("Walk-in Customer");

  const CATEGORIES = [
    { label: "Down Payment / Book Reservation", defaultAmount: "500.00" },
    { label: "NBS Gift Card Issuance / Purchase", defaultAmount: "1000.00" },
    { label: "Laking National Card Reloading", defaultAmount: "300.00" },
    { label: "Account Deposit / Pre-Order", defaultAmount: "1500.00" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    onConfirm({
      category: selectedCategory,
      amount: amountNum,
      referenceNo: referenceNo.trim() || "NS-001",
      customerName: customerName.trim() || "Customer",
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
        <div className="w-[450px] bg-[#D4D0C8] border-4 border-[#228B22] shadow-2xl font-sans pointer-events-auto">
          {/* Green Title Bar */}
          <div className="bg-[#228B22] text-white py-1.5 px-3 text-center font-bold text-sm uppercase tracking-wide">
            NON-SALES TRANSACTION (F4)
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-gray-900">
            <div className="bg-[#FFF275] border border-yellow-500 p-2 text-xs font-bold text-gray-900 text-center">
              Process non-sales deposits, voucher purchase, and card reloads
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-800 block">
                Transaction Type:
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
                Customer Name:
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name"
                className="w-full bg-white border-2 border-gray-500 px-3 py-1 font-sans text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 shadow-inner"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-800 block">
                Amount (PHP):
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
                Reference / Order Slip No.:
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="NS-2026-0812"
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
                Process Non-Sales (Enter)
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
