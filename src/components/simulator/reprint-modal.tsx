"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";

export interface MockRecentReceipt {
  orNumber: string;
  dateTime: string;
  totalAmount: number;
  itemCount: number;
  cashierName: string;
  items: Array<{
    description: string;
    qty: number;
    amount: number;
  }>;
}

interface ReprintModalProps {
  onPrint: (orNumber: string) => void;
  onCancel: () => void;
  clerkName?: string;
  terminalId?: string;
  branchCode?: string;
}

export function ReprintModal({
  onPrint,
  onCancel,
  clerkName = "Jan Angela",
  terminalId = "0003",
  branchCode = "2999",
}: ReprintModalProps) {
  const recentReceipts: MockRecentReceipt[] = [
    {
      orNumber: "0212202629990003000574",
      dateTime: "2026-Feb-12 11:33 AM",
      totalAmount: 2990.00,
      itemCount: 1,
      cashierName: clerkName,
      items: [{ description: "PHO PRKR RBALL POINT", qty: 1, amount: 2990.00 }],
    },
    {
      orNumber: "0212202629990003000573",
      dateTime: "2026-Feb-12 11:15 AM",
      totalAmount: 184.50,
      itemCount: 3,
      cashierName: clerkName,
      items: [{ description: "CRNA MATH NOTEBOOK 660P", qty: 3, amount: 184.50 }],
    },
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(recentReceipts.length - 1, prev + 1));
      } else if (e.key === "Enter" || (e.altKey && e.key === "Enter")) {
        e.preventDefault();
        if (recentReceipts[selectedIndex]) {
          onPrint(recentReceipts[selectedIndex].orNumber);
        }
      } else if (e.key === "Escape" || (e.altKey && (e.key === "b" || e.key === "B"))) {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, recentReceipts, onPrint, onCancel]);

  const activeRcpt = recentReceipts[selectedIndex];

  return (
    <div className="w-full flex-1 flex flex-col font-sans bg-white min-h-[500px] select-none">
      {/* 2. AUTHENTIC YELLOW BANNER */}
      <div className="bg-[#FFF275] border-b-2 border-gray-500 py-1.5 text-center font-bold text-lg text-gray-900 tracking-wider">
        REPRINT
      </div>

      {/* 3. TWO PANELS */}
      <div className="flex-1 grid grid-cols-12 p-4 gap-4 bg-white overflow-hidden">
        {/* Left Table: OR No. */}
        <div className="col-span-5 flex flex-col border-2 border-gray-400 bg-white">
          <div className="bg-gradient-to-b from-[#D4D0C8] to-[#B0B8C0] border-b border-gray-400 py-1 px-3 text-center text-xs font-bold text-gray-900">
            OR No.
          </div>
          <div className="flex-1 overflow-y-auto">
            {recentReceipts.map((rc, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={rc.orNumber}
                  onClick={() => setSelectedIndex(idx)}
                  className={`px-3 py-1.5 cursor-pointer text-xs font-mono font-bold text-center border-b border-gray-100 ${
                    isSelected
                      ? "bg-[#9ACD32] text-red-600 font-extrabold text-sm"
                      : "text-red-600 hover:bg-gray-100"
                  }`}
                >
                  {rc.orNumber}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Preview Box */}
        <div className="col-span-7 border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white p-4 font-mono text-xs overflow-y-auto">
          {activeRcpt && (
            <div className="space-y-2">
              <div className="text-center font-bold text-xs text-gray-900 border-b pb-1">
                NATIONAL BOOK STORE, INC.<br />
                REPRINT DUPLICATE OR<br />
                OR #: {activeRcpt.orNumber}
              </div>
              <div className="text-gray-600 text-[11px]">
                Date: {activeRcpt.dateTime} | Clerk: {activeRcpt.cashierName}
              </div>
              <div className="border-t border-dashed border-gray-300 pt-2 space-y-1">
                {activeRcpt.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-gray-800">
                    <span>
                      {it.qty}x {it.description}
                    </span>
                    <span className="font-bold">{formatCurrency(it.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-black pt-2 flex justify-between font-bold text-sm text-gray-900">
                <span>TOTAL AMOUNT:</span>
                <span>{formatCurrency(activeRcpt.totalAmount)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. BOTTOM TOOLBAR */}
      <div className="bg-[#388E3C] border-t-2 border-black p-2 flex items-center justify-center space-x-6">
        <button
          type="button"
          onClick={() => activeRcpt && onPrint(activeRcpt.orNumber)}
          className="min-w-[110px] px-4 py-1.5 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-blue-900 font-extrabold text-xs shadow flex flex-col items-center cursor-pointer active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white"
        >
          <span className="font-black text-sm">PRINT</span>
          <span className="text-[10px] text-gray-900">&lt;Enter&gt;</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
          className="min-w-[110px] px-4 py-1.5 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-blue-900 font-extrabold text-xs shadow flex flex-col items-center cursor-pointer"
        >
          <span className="font-black text-sm">PREV</span>
          <span className="text-[10px] text-gray-900">&lt;Left-Arrow&gt;</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedIndex((prev) => Math.min(recentReceipts.length - 1, prev + 1))}
          className="min-w-[110px] px-4 py-1.5 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-blue-900 font-extrabold text-xs shadow flex flex-col items-center cursor-pointer"
        >
          <span className="font-black text-sm">NEXT</span>
          <span className="text-[10px] text-gray-900">&lt;Right-Arrow&gt;</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-w-[110px] px-4 py-1.5 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-blue-900 font-extrabold text-xs shadow flex flex-col items-center cursor-pointer active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white"
        >
          <span className="font-black text-sm">BACK</span>
          <span className="text-[10px] text-gray-900">&lt;Alt-B&gt;</span>
        </button>
      </div>
    </div>
  );
}
