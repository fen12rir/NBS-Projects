"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { POSTransactionState } from "@/lib/simulator/pos-state-machine";
import { formatCurrency } from "@/lib/utils";

interface TransactionJournalScreenProps {
  mode: "TRX_JOURNAL" | "SALES_JOURNAL";
  state: POSTransactionState;
  onClose: () => void;
}

export function TransactionJournalScreen({
  mode,
  state,
  onClose,
}: TransactionJournalScreenProps) {
  const [isPrinted, setIsPrinted] = useState(false);
  const isSalesJournal = mode === "SALES_JOURNAL";
  const [helpNotice, setHelpNotice] = useState<string | null>(null);

  const printJournal = useCallback(() => {
    setIsPrinted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || (event.altKey && event.key.toLowerCase() === "b")) {
        event.preventDefault();
        onClose();
      } else if (event.key === "Enter") {
        event.preventDefault();
        printJournal();
      } else if (event.key === "F1") {
        event.preventDefault();
        setHelpNotice("Press ENTER to print tape, or Alt+B / ESC to return.");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, printJournal]);

  const gross = state.lineItems
    .filter((item) => !item.isVoided)
    .reduce((total, item) => total + item.total, 0);

  return (
    <div className="flex min-h-[500px] w-full flex-1 select-none flex-col bg-white font-sans overflow-hidden">
      {/* 1. TOP HEADER BAR: Authentic Light Grey Monospace Bar */}
      <div className="flex h-7 w-full flex-shrink-0 items-center justify-between border-y border-gray-400 border-t-white bg-[#BCC4CC] px-4 py-1 font-mono text-[11px] text-gray-900">
        <span>
          <span className="font-bold">Trx.:</span> {state.transactionNumber}
        </span>
        <span>
          <span className="font-bold">Clerk:</span> {state.cashierName}
        </span>
        <span>
          <span className="font-bold">Str No.:</span> {state.branchCode}
        </span>
        <span>
          <span className="font-bold">Reg No.:</span> {state.terminalId}
        </span>
        <span className="font-bold">{state.dateStr || "2026-Feb-16"}</span>
      </div>

      {/* 2. Yellow Bar across the top */}
      <div className="flex h-7 flex-shrink-0 items-center justify-center border-b border-gray-400 bg-[#FFF275] text-center text-xs font-bold uppercase tracking-wide text-gray-900">
        {isSalesJournal ? "Sales Journal" : "Transaction Journal"}
      </div>

      {/* 3. Screen Body */}
      <div className="grid flex-1 grid-cols-12 overflow-hidden bg-white">
        <div className="col-span-5 flex flex-col items-center justify-center space-y-4 border-r-2 border-gray-400 bg-[#BDC3C7] p-6">
          <button
            type="button"
            onClick={printJournal}
            className="flex w-36 cursor-pointer flex-col items-center border-2 border-b-[#404040] border-l-white border-r-[#404040] border-t-white bg-[#D4D0C8] py-2 text-xs font-extrabold text-gray-900 shadow hover:bg-[#E2E0DC] active:border-b-white active:border-l-[#404040] active:border-r-white active:border-t-[#404040]"
          >
            <span className="text-sm font-black">Print</span>
            <span className="text-[10px] text-gray-700">Enter</span>
          </button>

          <button
            type="button"
            onClick={() => setHelpNotice("Press ENTER to print tape, or Alt+B / ESC to return.")}
            className="flex w-36 cursor-pointer flex-col items-center border-2 border-b-[#800000] border-l-[#ff6b6b] border-r-[#800000] border-t-[#ff6b6b] bg-[#E4002B] py-2 text-xs font-extrabold text-white shadow hover:bg-[#C10024]"
          >
            <span className="text-sm font-black">Help</span>
            <span className="text-[10px]">F1</span>
          </button>
          {helpNotice && (
            <div className="text-[11px] font-bold text-gray-900 bg-white/90 p-1.5 border border-gray-400 max-w-[150px] text-center">
              {helpNotice}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex w-36 cursor-pointer flex-col items-center border-2 border-b-[#404040] border-l-white border-r-[#404040] border-t-white bg-[#D4D0C8] py-2 text-xs font-extrabold text-gray-900 shadow hover:bg-[#E2E0DC] active:border-b-white active:border-l-[#404040] active:border-r-white active:border-t-[#404040]"
          >
            <span className="text-sm font-black">Back</span>
            <span className="text-[10px] text-gray-700">Alt + B</span>
          </button>

          {isPrinted && (
            <p role="status" className="text-center text-xs font-bold text-green-800 bg-green-50 border border-green-200 px-3 py-1.5 rounded flex items-center justify-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-700 shrink-0" />
              <span>Journal tape sent to POS printer</span>
            </p>
          )}
        </div>

        <div className="col-span-7 flex justify-center overflow-y-auto bg-white p-3 sm:p-6">
          <div className="h-fit w-full max-w-[420px] border-2 border-gray-600 bg-white p-4 font-mono text-xs leading-snug text-gray-900 shadow">
            <div className="text-center">
              <div className="text-sm font-bold tracking-wider">
                {isSalesJournal ? "SALES JOURNAL" : "TRANSACTION JOURNAL"}
              </div>
              <div>ABACUS BOOK AND CARD CORP.</div>
              <div>NATIONAL BOOK STORE</div>
              <div>GROUND FLOOR QUAD ALPHA CENTRUM</div>
              <div>125 PIONEER ST. MANDALUYONG CITY</div>
              <div>VAT Registered TIN: 000-325-972-054</div>
            </div>

            <div className="my-2 border-t border-dashed border-gray-400" />
            <div className="flex justify-between">
              <span>Store No.: {state.branchCode}</span>
              <span>Term. No.: {state.terminalId}</span>
            </div>
            <div className="flex justify-between">
              <span>{isSalesJournal ? "JOURNAL TYPE:" : "TRX NO.:"}</span>
              {isSalesJournal ? (
                <span className="font-bold">DAILY SALES RECORD</span>
              ) : (
                <span className="font-bold">{state.transactionNumber}</span>
              )}
            </div>
            <div>Clerk: {state.cashierName}</div>
            <div className="flex justify-between">
              <span>{state.dateStr}</span>
              <span>{state.timeStr}</span>
            </div>

            <div className="my-2 border-t border-dashed border-gray-400" />
            <div className="mb-1 font-bold text-gray-900">RECORDED ENTRIES:</div>
            {state.lineItems.length > 0 ? (
              state.lineItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex justify-between py-0.5 ${
                    item.isVoided ? "text-red-600 line-through" : ""
                  }`}
                >
                  <span className="truncate pr-2">
                    {index + 1} {item.description} ({item.quantity}x)
                  </span>
                  <span className="shrink-0 font-bold">{formatCurrency(item.total)}</span>
                </div>
              ))
            ) : (
              <div className="py-2 text-center italic text-gray-400">
                * SYSTEM READING: NORMAL ACTIVE REGISTER LOG *
              </div>
            )}

            <div className="my-2 border-t border-dashed border-gray-400" />
            <div className="flex justify-between font-bold">
              <span>ACCUMULATED GROSS:</span>
              <span>{formatCurrency(gross)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-600">
              <span>ZERO RATED SALES:</span>
              <span>{state.isZeroRated ? "YES (0% VAT)" : "0.00"}</span>
            </div>
            {state.appliedDiscount && (
              <div className="flex justify-between font-bold text-yellow-700">
                <span>DISCOUNT ({state.appliedDiscount.name}):</span>
                <span>-{state.appliedDiscount.percent}%</span>
              </div>
            )}
            {state.transactionComments && (
              <div className="my-2 space-y-0.5 border-t border-dashed border-gray-400 pt-1 text-[10px]">
                <div>BUYER&apos;S NAME : {state.transactionComments.customerName?.toUpperCase() || "N/A"}</div>
                <div>ADDRESS      : {state.transactionComments.address?.toUpperCase() || "N/A"}</div>
                <div>TIN          : {state.transactionComments.tin || "N/A"}</div>
                {state.transactionComments.remarks && (
                  <div>REMARKS      : {state.transactionComments.remarks.toUpperCase()}</div>
                )}
              </div>
            )}
            <div className="my-2 border-t border-dashed border-gray-400" />
            <div className="text-center text-[10px] text-gray-500">
              *** END OF JOURNAL RECORD ***
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
