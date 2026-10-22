"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";

export interface SuspendedTransactionItem {
  id: string;
  transactionNumber: string;
  suspendedAt: string;
  totalAmount: number;
  itemCount: number;
  items: Array<{
    id: string;
    sku: string;
    description: string;
    unitPrice: number;
    quantity: number;
    total: number;
  }>;
}

interface SuspendModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function SuspendModal({ onConfirm, onCancel }: SuspendModalProps) {
  const [selectedBtn, setSelectedBtn] = useState<"YES" | "NO">("YES");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        setSelectedBtn((prev) => (prev === "YES" ? "NO" : "YES"));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedBtn === "YES") onConfirm();
        else onCancel();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBtn, onConfirm, onCancel]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
        <div className="w-[440px] bg-[#D4D0C8] border-4 border-[#2E7D32] shadow-2xl font-sans pointer-events-auto">
          {/* Authentic Green Header matching pos-suspend-f9.png */}
          <div className="bg-[#2E7D32] text-white px-3 py-1 font-bold text-sm text-center uppercase tracking-wide border-b border-[#1B5E20]">
            SUSPEND
          </div>

          <div className="p-6 space-y-6 text-gray-900">
            <div className="text-center font-bold text-xs text-gray-900">
              Are you sure you want to suspend this transaction?
            </div>

            <div className="flex items-center justify-center space-x-6 pt-1">
              <button
                type="button"
                onClick={onConfirm}
                className={`min-w-[85px] px-5 py-1 text-xs font-bold font-sans transition-all border-2 cursor-pointer ${
                  selectedBtn === "YES"
                    ? "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-black outline outline-1 outline-dotted outline-black ring-1 ring-blue-600"
                    : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 hover:bg-[#E2E0DC]"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={onCancel}
                className={`min-w-[85px] px-5 py-1 text-xs font-bold font-sans transition-all border-2 cursor-pointer ${
                  selectedBtn === "NO"
                    ? "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-black outline outline-1 outline-dotted outline-black ring-1 ring-blue-600"
                    : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 hover:bg-[#E2E0DC]"
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface RecallModalProps {
  suspendedList: SuspendedTransactionItem[];
  onRecall: (transactionId: string) => void;
  onCancel: () => void;
  clerkName?: string;
  terminalId?: string;
  branchCode?: string;
}

export function RecallModal({
  suspendedList,
  onRecall,
  onCancel,
  clerkName = "Jan Angela",
  terminalId = "0003",
  branchCode = "2999",
}: RecallModalProps) {
  const listToDisplay: SuspendedTransactionItem[] =
    suspendedList.length > 0
      ? suspendedList
      : [
          {
            id: "susp-0212202629990003000599",
            transactionNumber: "0212202629990003000599",
            suspendedAt: "11:42 AM",
            totalAmount: 2990.00,
            itemCount: 1,
            items: [
              {
                id: "item-505",
                sku: "505",
                description: "PRKR RBALL POINT REG SONN",
                unitPrice: 2990.00,
                quantity: 1,
                total: 2990.00,
              },
            ],
          },
          {
            id: "susp-0212202629990003000600",
            transactionNumber: "0212202629990003000600",
            suspendedAt: "11:49 AM",
            totalAmount: 184.50,
            itemCount: 3,
            items: [
              {
                id: "item-12",
                sku: "12",
                description: "CRNA MATH NOTEBOOK 660P",
                unitPrice: 61.50,
                quantity: 3,
                total: 184.50,
              },
            ],
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
        setSelectedIndex((prev) => Math.min(listToDisplay.length - 1, prev + 1));
      } else if (e.key === "Enter" || (e.altKey && e.key === "Enter")) {
        e.preventDefault();
        if (listToDisplay[selectedIndex]) {
          onRecall(listToDisplay[selectedIndex].id);
        }
      } else if (e.key === "Escape" || (e.altKey && (e.key === "b" || e.key === "B"))) {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, listToDisplay, onRecall, onCancel]);

  const activeTx = listToDisplay[selectedIndex];

  return (
    <div className="w-full flex-1 flex flex-col font-sans bg-white min-h-[500px] select-none">
      {/* 2. AUTHENTIC YELLOW BANNER */}
      <div className="bg-[#FFF275] border-b-2 border-gray-500 py-1.5 text-center font-bold text-lg text-gray-900 tracking-wider">
        RECALL
      </div>

      {/* 3. TWO PANELS MATCHING pos-recall-step3-f7.png */}
      <div className="flex-1 grid grid-cols-12 p-4 gap-4 bg-white overflow-hidden">
        {/* Left Table: Transaction No. */}
        <div className="col-span-5 flex flex-col border-2 border-gray-400 bg-white">
          <div className="bg-gradient-to-b from-[#D4D0C8] to-[#B0B8C0] border-b border-gray-400 py-1 px-3 text-center text-xs font-bold text-gray-900">
            Transaction No.
          </div>
          <div className="flex-1 overflow-y-auto">
            {listToDisplay.map((tx, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`px-3 py-1.5 cursor-pointer text-xs font-mono font-bold text-center border-b border-gray-100 ${
                    isSelected
                      ? "bg-[#9ACD32] text-red-600 font-extrabold text-sm"
                      : "text-red-600 hover:bg-gray-100"
                  }`}
                >
                  {tx.transactionNumber}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Preview Box */}
        <div className="col-span-7 border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white p-4 font-mono text-xs overflow-y-auto">
          {activeTx && (
            <div className="space-y-2">
              <div className="font-bold text-gray-800 text-sm border-b pb-1">
                Transaction Preview: {activeTx.transactionNumber}
              </div>
              <div className="text-gray-600 text-[11px]">
                Suspended at: {activeTx.suspendedAt} | Items: {activeTx.itemCount}
              </div>
              <div className="border-t border-dashed border-gray-300 pt-2 space-y-1">
                {activeTx.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-gray-800">
                    <span>
                      {it.quantity}x {it.description}
                    </span>
                    <span className="font-bold">{formatCurrency(it.total)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-black pt-2 flex justify-between font-bold text-sm text-gray-900">
                <span>TOTAL AMOUNT:</span>
                <span>{formatCurrency(activeTx.totalAmount)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. BOTTOM TOOLBAR MATCHING pos-recall-step3-f7.png */}
      <div className="bg-[#388E3C] border-t-2 border-black p-2 flex items-center justify-center space-x-6">
        <button
          type="button"
          onClick={() => activeTx && onRecall(activeTx.id)}
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
          onClick={() => setSelectedIndex((prev) => Math.min(listToDisplay.length - 1, prev + 1))}
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
