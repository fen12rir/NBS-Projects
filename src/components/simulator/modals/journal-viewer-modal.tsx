"use client";

import React, { useState } from "react";
import { POSTransactionState } from "@/lib/simulator/pos-state-machine";
import { formatCurrency } from "@/lib/utils";

interface JournalViewerModalProps {
  mode: "TRX_JOURNAL" | "SALES_JOURNAL";
  state: POSTransactionState;
  onClose: () => void;
}

export function JournalViewerModal({
  mode,
  state,
  onClose,
}: JournalViewerModalProps) {
  const [filterOr, setFilterOr] = useState("");
  const [isPrinted, setIsPrinted] = useState(false);

  const title = mode === "TRX_JOURNAL" ? "TRANSACTION JOURNAL (F4)" : "SALES JOURNAL (F6)";

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
        <div className="w-[520px] bg-[#D4D0C8] border-4 border-[#228B22] shadow-2xl font-sans pointer-events-auto flex flex-col max-h-[85vh]">
          {/* Green Title Bar */}
          <div className="bg-[#228B22] text-white py-1.5 px-3 flex items-center justify-between font-bold text-sm uppercase tracking-wide">
            <span>{title}</span>
            <button
              type="button"
              onClick={onClose}
              className="text-white hover:text-red-300 font-extrabold text-base leading-none cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Filter Bar */}
          <div className="bg-[#D4D0C8] px-4 py-2 border-b border-gray-400 flex items-center justify-between text-xs font-sans">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-gray-800">Filter OR:</span>
              <input
                type="text"
                value={filterOr}
                onChange={(e) => setFilterOr(e.target.value)}
                placeholder="Search OR / Trx..."
                className="bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs text-gray-900 w-36 shadow-inner"
              />
            </div>
            <span className="font-mono text-gray-700 text-[11px]">
              Str: 2999 | Term: 0003
            </span>
          </div>

          {/* Journal Slip Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-white text-gray-800 font-mono text-[11px] leading-relaxed select-text border-b border-gray-400">
            <div className="text-center font-bold text-[10px]">
              ABACUS BOOK AND CARD CORP.<br />
              NATIONAL BOOK STORE<br />
              GROUND FLOOR QUAD ALPHA CENTRUM<br />
              125 PIONEER ST. MANDALUYONG CITY<br />
              VAT Registered TIN: 000-325-972-054
            </div>
            <div className="border-t border-dashed border-gray-400 my-2" />
            <div className="flex justify-between">
              <span>JOURNAL TYPE:</span>
              <span className="font-bold">{mode === "TRX_JOURNAL" ? "TRANSACTION LOG" : "DAILY SALES RECORD"}</span>
            </div>
            <div className="flex justify-between">
              <span>TRX NO.:</span>
              <span className="font-bold">{state.transactionNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>CLERK:</span>
              <span>Jan Angela (02122026)</span>
            </div>
            <div className="flex justify-between">
              <span>DATE/TIME:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
            <div className="border-t border-dashed border-gray-400 my-2" />

            {/* Line items section */}
            <div className="font-bold text-gray-900 mb-1">RECORDED ENTRIES:</div>
            {state.lineItems.length > 0 ? (
              state.lineItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex justify-between py-0.5 ${
                    item.isVoided ? "line-through text-red-600" : ""
                  }`}
                >
                  <span className="truncate pr-2">
                    {idx + 1} {item.description} ({item.quantity}x)
                  </span>
                  <span className="font-bold shrink-0">{formatCurrency(item.total)}</span>
                </div>
              ))
            ) : (
              <div className="py-2 text-center text-gray-400 italic">
                * SYSTEM READING: NORMAL ACTIVE REGISTER LOG *
              </div>
            )}

            <div className="border-t border-dashed border-gray-400 my-2" />
            <div className="flex justify-between font-bold">
              <span>ACCUMULATED GROSS:</span>
              <span>
                {formatCurrency(
                  state.lineItems
                    .filter((i) => !i.isVoided)
                    .reduce((acc, i) => acc + i.total, 0)
                )}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 text-[10px]">
              <span>ZERO RATED SALES:</span>
              <span>{state.isZeroRated ? "YES (0% VAT)" : "0.00"}</span>
            </div>
            {state.appliedDiscount && (
              <div className="flex justify-between text-yellow-700 font-bold">
                <span>DISCOUNT ({state.appliedDiscount.name}):</span>
                <span>-{state.appliedDiscount.percent}%</span>
              </div>
            )}
            {state.transactionComments && (
              <div className="border-t border-dashed border-gray-400 my-2 pt-1 text-[10px] space-y-0.5">
                <div>BUYER&apos;S NAME : {state.transactionComments.customerName.toUpperCase()}</div>
                <div>ADDRESS      : {state.transactionComments.address.toUpperCase()}</div>
                <div>TIN          : {state.transactionComments.tin}</div>
                {state.transactionComments.remarks && (
                  <div>REMARKS      : {state.transactionComments.remarks.toUpperCase()}</div>
                )}
              </div>
            )}
            <div className="border-t border-dashed border-gray-400 my-2" />
            <div className="text-center text-[10px] text-gray-500 font-mono">
              *** END OF JOURNAL RECORD ***
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-3 bg-[#D4D0C8] flex items-center justify-between">
            {isPrinted ? (
              <span className="text-xs font-bold text-green-700 font-mono">
                ✓ Journal tape sent to POS printer
              </span>
            ) : (
              <span className="text-xs text-gray-600">
                Displaying terminal audit trail
              </span>
            )}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setIsPrinted(true)}
                className="px-4 py-1.5 bg-[#FFF275] border-2 border-yellow-500 text-gray-900 font-bold text-xs hover:bg-yellow-200 cursor-pointer shadow"
              >
                Print Journal
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 font-bold text-xs hover:bg-[#E2E0DC] cursor-pointer"
              >
                Close (Esc)
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
