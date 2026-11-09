"use client";

import React, { useState, useEffect, useMemo } from "react";
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

interface RecallModalProps {
  suspendedList: SuspendedTransactionItem[];
  onRecall: (id: string) => void;
  onCancel: () => void;
}

export function RecallModal({
  suspendedList,
  onRecall,
  onCancel,
}: RecallModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const mockSuspendedList: SuspendedTransactionItem[] = useMemo(
    () => [
      {
        id: "mock-1",
        transactionNumber: "1023202629990004001552",
        suspendedAt: "10:14:02 AM",
        totalAmount: 149.5,
        itemCount: 2,
        items: [
          {
            id: "1",
            sku: "NBS-BK-001",
            description: "Spiral Notebook 80 leaves",
            unitPrice: 49.75,
            quantity: 2,
            total: 99.5,
          },
          {
            id: "2",
            sku: "NBS-PEN-002",
            description: "Pilot G-Tech 0.3mm Black",
            unitPrice: 50.0,
            quantity: 1,
            total: 50.0,
          },
        ],
      },
    ],
    []
  );

  const listToDisplay = useMemo(
    () => (suspendedList.length > 0 ? suspendedList : mockSuspendedList),
    [suspendedList, mockSuspendedList]
  );

  const currentSelection = listToDisplay[selectedIndex] || listToDisplay[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "F12") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, listToDisplay.length - 1));
      } else if (e.key === "ArrowUp" || e.key === "F11") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (currentSelection) onRecall(currentSelection.id);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, listToDisplay, currentSelection, onRecall, onCancel]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
        <div className="w-[780px] h-[520px] bg-white border-4 border-gray-600 shadow-2xl font-sans flex flex-col pointer-events-auto overflow-hidden">
          {/* Header */}
          <div className="bg-[#BCC4CC] border-b border-gray-400 px-4 py-1 flex items-center justify-between text-[11px] font-mono text-gray-900 border-t border-t-white flex-shrink-0 h-7 select-none w-full">
            <span>
              <span className="font-bold">Trx.:</span> 1023202629990004001558
            </span>
            <span>
              <span className="font-bold">Clerk:</span> Jan Angela
            </span>
            <span>
              <span className="font-bold">Str No.:</span> 2999
            </span>
            <span>
              <span className="font-bold">Reg No.:</span> 0004
            </span>
          </div>

          <div className="bg-[#FFF275] border-b-2 border-gray-500 py-1.5 text-center font-bold text-base text-gray-900 tracking-wide">
            RECALL TRANSACTION BUFFER
          </div>

          <div className="flex-1 grid grid-cols-12 p-4 gap-4 bg-white overflow-hidden">
            <div className="col-span-5 flex flex-col border-2 border-gray-400 bg-white">
              <div className="bg-[#BCC4CC] border-b border-gray-400 py-1 px-3 text-center text-xs font-bold text-gray-900">
                Transaction No.
              </div>
              <div className="flex-1 overflow-y-auto">
                {listToDisplay.map((tx, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedIndex(idx)}
                      className={`px-3 py-2 text-xs font-mono font-bold cursor-pointer border-b border-gray-200 transition-colors ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      <div>{tx.transactionNumber}</div>
                      <div className="text-[10px] opacity-80 font-normal flex justify-between">
                        <span>{tx.suspendedAt}</span>
                        <span>{formatCurrency(tx.totalAmount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="col-span-7 flex flex-col border-2 border-gray-400 bg-gray-50 p-3 overflow-hidden">
              <div className="text-xs font-bold text-gray-800 border-b border-gray-300 pb-1 mb-2">
                Transaction Details
              </div>
              {currentSelection ? (
                <div className="flex-1 flex flex-col overflow-hidden text-xs font-mono">
                  <div className="space-y-1 mb-2 text-gray-700">
                    <div>
                      <span className="font-bold">TRX:</span>{" "}
                      {currentSelection.transactionNumber}
                    </div>
                    <div>
                      <span className="font-bold">Time:</span>{" "}
                      {currentSelection.suspendedAt}
                    </div>
                    <div>
                      <span className="font-bold">Total:</span>{" "}
                      {formatCurrency(currentSelection.totalAmount)}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto border border-gray-300 bg-white p-2">
                    <div className="text-[10px] font-bold text-gray-500 uppercase border-b pb-1 mb-1 grid grid-cols-6">
                      <span className="col-span-3">Item</span>
                      <span className="text-center">Qty</span>
                      <span className="col-span-2 text-right">Total</span>
                    </div>
                    {currentSelection.items.map((it) => (
                      <div
                        key={it.id}
                        className="grid grid-cols-6 text-[10px] py-0.5 border-b border-gray-100"
                      >
                        <span className="col-span-3 truncate text-gray-800">
                          {it.description}
                        </span>
                        <span className="text-center text-gray-600">
                          {it.quantity}
                        </span>
                        <span className="col-span-2 text-right font-bold text-gray-900">
                          {formatCurrency(it.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-xs italic">
                  No transaction selected
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#BCC4CC] border-t-2 border-gray-400 p-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                if (currentSelection) onRecall(currentSelection.id);
              }}
              className="px-6 py-1 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-black font-bold text-xs cursor-pointer hover:bg-[#E2E0DC] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white"
            >
              Recall (Enter)
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-1 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-black font-bold text-xs cursor-pointer hover:bg-[#E2E0DC] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white"
            >
              Cancel (Esc)
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
