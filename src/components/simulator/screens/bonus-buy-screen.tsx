"use client";

import React, { useState, useEffect, useRef } from "react";

export interface BonusBuyPromo {
  promoCode: string;
  promoItem: string;
  eventPrice: number;
  condition: string;
  sku: string;
}

const BONUS_BUY_PROMOS: BonusBuyPromo[] = [
  {
    promoCode: "0200004604",
    promoItem: "S40000001362 - BLEACHED PAPER BAG W",
    eventPrice: 0.0,
    condition: "OR",
    sku: "S40000001362",
  },
  {
    promoCode: "0200004606",
    promoItem: "S40000001362 - BLEACHED PAPER BAG W",
    eventPrice: 10.0,
    condition: "OR",
    sku: "S40000001362",
  },
];

interface BonusBuyScreenProps {
  transactionTotal: number;
  clerkName?: string;
  terminalId?: string;
  branchCode?: string;
  trxNumber?: string;
  onConfirm: (promo: {
    promoCode: string;
    promoItem: string;
    eventPrice: number;
    quantity: number;
  } | null) => void;
  onCancel: () => void;
}

export function BonusBuyScreen({
  transactionTotal,
  clerkName = "Jan Angela",
  terminalId = "0004",
  branchCode = "2999",
  trxNumber = "1023202629990004001559",
  onConfirm,
  onCancel,
}: BonusBuyScreenProps) {
  // If transaction total >= 500, row 0 (Free bag) is eligible; otherwise row 1 (10 PHP bag) is eligible.
  const isEligibleForFree = transactionTotal >= 500;
  const initialRow = isEligibleForFree ? 0 : 1;

  const [selectedRow, setSelectedRow] = useState<number>(initialRow);
  const [quantities, setQuantities] = useState<Record<number, number>>({
    0: 1,
    1: 1,
  });
  const [checkedRow, setCheckedRow] = useState<number | null>(null);
  const [lookForText, setLookForText] = useState("");

  // Confirmation dialog state: "OK" or "CANCEL" or null (closed)
  const [confirmDialogAction, setConfirmDialogAction] = useState<"OK" | "CANCEL" | null>(null);
  const [confirmSelectedBtn, setConfirmSelectedBtn] = useState<"YES" | "NO">("YES");

  // Focusable elements refs for keyboard Tab cycling
  const lookForRef = useRef<HTMLInputElement>(null);
  const qty0Ref = useRef<HTMLInputElement>(null);
  const chk0Ref = useRef<HTMLInputElement>(null);
  const qty1Ref = useRef<HTMLInputElement>(null);
  const chk1Ref = useRef<HTMLInputElement>(null);

  // Initial focus on mount is on the "Look for:" input field
  useEffect(() => {
    lookForRef.current?.focus();
  }, []);

  // Handle global keyboard shortcuts inside Bonus Buy Screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. When confirmation dialog is open
      if (confirmDialogAction !== null) {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Tab") {
          e.preventDefault();
          setConfirmSelectedBtn((prev) => (prev === "YES" ? "NO" : "YES"));
        } else if (e.key === "Enter") {
          e.preventDefault();
          handleConfirmDialogAnswer(confirmSelectedBtn);
        } else if (e.key === "Escape" || e.key.toLowerCase() === "n") {
          e.preventDefault();
          setConfirmDialogAction(null);
        } else if (e.key.toLowerCase() === "y") {
          e.preventDefault();
          handleConfirmDialogAnswer("YES");
        }
        return;
      }

      // 2. Alt+Enter -> Trigger OK confirmation
      if (e.altKey && e.key === "Enter") {
        e.preventDefault();
        setConfirmSelectedBtn("YES");
        setConfirmDialogAction("OK");
        return;
      }

      // 3. Alt+B or Escape -> Trigger CANCEL confirmation
      if ((e.altKey && (e.key === "b" || e.key === "B")) || e.key === "Escape") {
        e.preventDefault();
        setConfirmSelectedBtn("YES");
        setConfirmDialogAction("CANCEL");
        return;
      }

      // 4. F11 or ArrowUp -> Select Row 0
      if (e.key === "F11" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedRow(0);
        qty0Ref.current?.focus();
        return;
      }

      // 5. F12 or ArrowDown -> Select Row 1
      if (e.key === "F12" || e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedRow(1);
        qty1Ref.current?.focus();
        return;
      }

      // 6. Spacebar toggles checkbox of currently selected row if not typing in text/number input
      if (e.key === " " && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        handleToggleCheckbox(selectedRow);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmDialogAction, confirmSelectedBtn, selectedRow, checkedRow, quantities]);

  const handleToggleCheckbox = (rowIdx: number) => {
    setSelectedRow(rowIdx);
    setCheckedRow((prev) => (prev === rowIdx ? null : rowIdx));
  };

  const handleQuantityChange = (rowIdx: number, val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setQuantities((prev) => ({ ...prev, [rowIdx]: num }));
    } else if (val === "") {
      setQuantities((prev) => ({ ...prev, [rowIdx]: 1 }));
    }
  };

  const handleConfirmDialogAnswer = (answer: "YES" | "NO") => {
    if (answer === "NO") {
      setConfirmDialogAction(null);
      return;
    }

    // Cashier confirmed "YES"
    if (confirmDialogAction === "OK") {
      setConfirmDialogAction(null);
      if (checkedRow !== null) {
        const promo = BONUS_BUY_PROMOS[checkedRow];
        const qty = quantities[checkedRow] || 1;
        onConfirm({
          promoCode: promo.promoCode,
          promoItem: promo.promoItem,
          eventPrice: promo.eventPrice,
          quantity: qty,
        });
      } else {
        // No bag checked
        onConfirm(null);
      }
    } else if (confirmDialogAction === "CANCEL") {
      setConfirmDialogAction(null);
      onCancel();
    }
  };

  // Format today's date (e.g. 2026-Oct-23)
  const todayStr = (() => {
    const d = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getFullYear()}-${months[d.getMonth()]}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  return (
    <div className="w-full flex-1 flex flex-col font-sans bg-white min-h-0 overflow-hidden select-none relative">
      {/* 1. TOP HEADER BAR: Authentic Light Grey Monospace Bar */}
      <div className="bg-[#BCC4CC] border-b border-gray-400 px-4 py-1 flex items-center justify-between text-[11px] font-mono text-gray-900 border-t border-t-white flex-shrink-0 h-7 select-none w-full">
        <span><span className="font-bold">Trx.:</span> {trxNumber}</span>
        <span><span className="font-bold">Clerk:</span> {clerkName}</span>
        <span><span className="font-bold">Str No.:</span> {branchCode}</span>
        <span><span className="font-bold">Reg No.:</span> {terminalId}</span>
        <span className="font-bold">{todayStr}</span>
      </div>

      {/* 2. YELLOW BANNER: BONUS BUY LIST */}
      <div className="bg-[#FFEE55] border-b border-gray-400 py-1.5 text-center font-bold text-sm text-gray-900 uppercase tracking-wider font-sans flex-shrink-0">
        BONUS BUY LIST
      </div>

      {/* 3. TOOLBAR: F11, F12 Large Beveled Buttons & Look for Input */}
      <div className="bg-[#CCD2D8] border-b border-gray-400 px-3 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-1">
          {/* F11 Up Button (Beveled WinXP button with green up arrow) */}
          <button
            type="button"
            onClick={() => {
              setSelectedRow(0);
              qty0Ref.current?.focus();
            }}
            className="w-14 h-11 bg-[#D4D0C8] active:bg-[#BDB8AF] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white flex flex-col items-center justify-center cursor-pointer"
          >
            <div className="w-0 h-0 border-x-[7px] border-x-transparent border-b-[10px] border-b-[#1E9E35] mb-0.5" />
            <span className="text-[10px] font-bold text-gray-900 leading-none">F11</span>
          </button>

          {/* F12 Down Button (Beveled WinXP button with green down arrow) */}
          <button
            type="button"
            onClick={() => {
              setSelectedRow(1);
              qty1Ref.current?.focus();
            }}
            className="w-14 h-11 bg-[#D4D0C8] active:bg-[#BDB8AF] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white flex flex-col items-center justify-center cursor-pointer"
          >
            <div className="w-0 h-0 border-x-[7px] border-x-transparent border-t-[10px] border-t-[#1E9E35] mb-0.5" />
            <span className="text-[10px] font-bold text-gray-900 leading-none">F12</span>
          </button>
        </div>

        {/* Look for: input (first focused on page entry, Tab moves to quantity) */}
        <div className="flex items-center space-x-3 text-sm font-bold text-gray-900">
          <span>Look for:</span>
          <input
            ref={lookForRef}
            type="text"
            value={lookForText}
            onChange={(e) => setLookForText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Tab" && !e.shiftKey) {
                e.preventDefault();
                if (selectedRow === 0) {
                  qty0Ref.current?.focus();
                } else {
                  qty1Ref.current?.focus();
                }
              }
            }}
            placeholder=""
            className="w-80 bg-white border border-gray-400 rounded-sm px-2 py-0.5 font-mono text-xs text-gray-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
      </div>

      {/* 4. TABLE HEADERS */}
      <div className="bg-[#CCD2D8] border-b border-gray-400 grid grid-cols-12 text-xs font-bold text-gray-900 uppercase tracking-tight">
        <div className="col-span-2 px-3 py-1 border-t border-l border-white border-r border-b border-gray-400">
          PROMO CODE
        </div>
        <div className="col-span-5 px-3 py-1 border-t border-l border-white border-r border-b border-gray-400">
          PROMO ITEM
        </div>
        <div className="col-span-2 px-3 py-1 text-center border-t border-l border-white border-r border-b border-gray-400">
          EVENT PRICE
        </div>
        <div className="col-span-1 px-2 py-1 text-center border-t border-l border-white border-r border-b border-gray-400">
          CONDITION
        </div>
        <div className="col-span-2 px-3 py-1 text-center border-t border-l border-white border-r border-b border-gray-400">
          QUANTITY
        </div>
      </div>

      {/* 5. TABLE BODY */}
      <div className="flex-1 bg-white overflow-y-auto min-h-0">
        <table className="w-full text-left font-sans text-xs border-collapse">
          <tbody>
            {BONUS_BUY_PROMOS.map((promo, idx) => {
              const isSelected = selectedRow === idx;
              const isChecked = checkedRow === idx;
              const qtyRef = idx === 0 ? qty0Ref : qty1Ref;
              const chkRef = idx === 0 ? chk0Ref : chk1Ref;

              // The highlighted row is dynamically whichever row is selectedRow!
              const rowBg = isSelected ? "bg-[#8CD028]" : "bg-white";

              return (
                <tr
                  key={promo.promoCode}
                  onClick={() => setSelectedRow(idx)}
                  className={`border-b border-gray-200 select-none cursor-pointer ${rowBg}`}
                >
                  {/* PROMO CODE */}
                  <td className="py-1.5 px-3 w-[16.66%] font-sans font-bold text-sm text-[#CC0000]">
                    {promo.promoCode}
                  </td>

                  {/* PROMO ITEM */}
                  <td className="py-1.5 px-3 w-[41.66%] font-sans font-bold text-sm text-[#CC0000]">
                    {promo.promoItem}
                  </td>

                  {/* EVENT PRICE */}
                  <td className="py-1.5 px-3 w-[16.66%] text-center font-sans font-bold text-sm text-[#CC0000]">
                    {promo.eventPrice.toFixed(2)}
                  </td>

                  {/* CONDITION */}
                  <td className="py-1.5 px-2 w-[8.33%] text-center font-sans font-bold text-sm text-[#CC0000]">
                    {promo.condition}
                  </td>

                  {/* QUANTITY & CHECKBOX */}
                  <td className="py-1.5 px-3 w-[16.66%]">
                    <div className="flex items-center justify-center space-x-2">
                      <input
                        ref={qtyRef}
                        type="number"
                        min="1"
                        max="99"
                        value={quantities[idx] || 1}
                        onFocus={() => setSelectedRow(idx)}
                        onChange={(e) => handleQuantityChange(idx, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Tab" && !e.shiftKey) {
                            e.preventDefault();
                            if (idx === 0) {
                              chk0Ref.current?.focus();
                            } else {
                              chk1Ref.current?.focus();
                            }
                          } else if (e.key === "Tab" && e.shiftKey) {
                            e.preventDefault();
                            lookForRef.current?.focus();
                          }
                        }}
                        className="w-16 h-6 border border-gray-400 bg-white rounded-sm text-center font-sans font-bold text-xs text-black shadow-inner focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      <input
                        ref={chkRef}
                        type="checkbox"
                        checked={isChecked}
                        onFocus={() => setSelectedRow(idx)}
                        onChange={() => handleToggleCheckbox(idx)}
                        onKeyDown={(e) => {
                          if (e.key === "Tab" && !e.shiftKey) {
                            e.preventDefault();
                            if (idx === 0) {
                              setSelectedRow(1);
                              qty1Ref.current?.focus();
                            } else {
                              setSelectedRow(0);
                              lookForRef.current?.focus();
                            }
                          } else if (e.key === "Tab" && e.shiftKey) {
                            e.preventDefault();
                            if (idx === 0) {
                              qty0Ref.current?.focus();
                            } else {
                              qty1Ref.current?.focus();
                            }
                          } else if (e.key === " ") {
                            e.preventDefault();
                            handleToggleCheckbox(idx);
                          }
                        }}
                        className="w-4 h-4 cursor-pointer accent-[#22A838] focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 6. BOTTOM GREEN BAR: Centered OK / CANCEL & Page: 1 / 0 on far right */}
      <div className="bg-[#22A838] border-t border-green-700 px-4 py-1.5 flex items-center justify-between text-xs font-sans h-12 flex-shrink-0">
        <div className="w-1/4" />

        {/* Center: OK Alt-Enter & CANCEL Alt-B */}
        <div className="flex items-center justify-center space-x-6 flex-1">
          {/* OK Alt-Enter */}
          <button
            type="button"
            onClick={() => {
              setConfirmSelectedBtn("YES");
              setConfirmDialogAction("OK");
            }}
            className="w-32 h-9 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white flex flex-col items-center justify-center cursor-pointer"
          >
            <span className="font-extrabold text-sm text-[#000080] leading-none">OK</span>
            <span className="text-[10px] text-gray-900 leading-tight">Alt-Enter</span>
          </button>

          {/* CANCEL Alt-B */}
          <button
            type="button"
            onClick={() => {
              setConfirmSelectedBtn("YES");
              setConfirmDialogAction("CANCEL");
            }}
            className="w-32 h-9 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white flex flex-col items-center justify-center cursor-pointer"
          >
            <span className="font-extrabold text-sm text-[#000080] leading-none">CANCEL</span>
            <span className="text-[10px] text-gray-900 leading-tight">Alt-B</span>
          </button>
        </div>

        {/* Far Right: Page: 1 / 0 */}
        <div className="w-1/4 text-right font-sans font-bold text-sm text-gray-900 pr-2">
          Page: 1 / 0
        </div>
      </div>

      {/* 7. CONFIRMATION POPUP MODAL ("Do you want to continue?") */}
      {confirmDialogAction !== null && (
        <div className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-80 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-2xl p-4 flex flex-col items-center space-y-4 font-sans">
            {/* Title / Question */}
            <div className="text-sm font-bold text-gray-900 text-center pt-2">
              Do you want to continue?
            </div>

            {/* Buttons: Yes / No */}
            <div className="flex items-center justify-center space-x-4 pt-2">
              <button
                type="button"
                autoFocus
                onClick={() => handleConfirmDialogAnswer("YES")}
                className={`min-w-[75px] px-4 py-1 text-xs font-bold transition-all border-2 ${
                  confirmSelectedBtn === "YES"
                    ? "bg-[#D4D0C8] border-red-600 ring-2 ring-red-500 shadow-inner text-black font-extrabold"
                    : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-900 hover:bg-[#E2E0DC]"
                }`}
              >
                Yes
              </button>

              <button
                type="button"
                onClick={() => handleConfirmDialogAnswer("NO")}
                className={`min-w-[75px] px-4 py-1 text-xs font-bold transition-all border-2 ${
                  confirmSelectedBtn === "NO"
                    ? "bg-[#D4D0C8] border-red-600 ring-2 ring-red-500 shadow-inner text-black font-extrabold"
                    : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-900 hover:bg-[#E2E0DC]"
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
