"use client";

import React, { useState, useEffect } from "react";

export interface ReadingsScreenProps {
  readingType: "Y" | "Z";
  cashierName?: string;
  terminalId?: string;
  branchCode?: string;
  trxNumber?: string;
  totalQty?: number;
  totalSales?: number;
  onClose: () => void;
}

export function ReadingsScreen({
  readingType,
  cashierName = "admin",
  terminalId = "0002",
  branchCode = "2999",
  trxNumber = "0212202629990003000595",
  onClose,
}: ReadingsScreenProps) {
  const isY = readingType === "Y";

  // Mode State
  const [zClearingStep, setZClearingStep] = useState(!isY);
  const [clearingFocus, setClearingFocus] = useState<"YES" | "NO" | "CANCEL">("YES");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (zClearingStep) {
        if (e.key === "Tab") {
          e.preventDefault();
          setClearingFocus((prev) => {
            if (prev === "YES") return "NO";
            if (prev === "NO") return "CANCEL";
            return "YES";
          });
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (clearingFocus === "YES") {
            setZClearingStep(false);
          } else {
            onClose();
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
      } else {
        if (e.key === "Escape" || (e.altKey && (e.key === "b" || e.key === "B"))) {
          e.preventDefault();
          onClose();
        } else if (e.key === "Enter") {
          e.preventDefault();
          alert(`${isY ? "Y" : "Z"} Reading printed successfully.`);
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zClearingStep, clearingFocus, isY, onClose]);

  const today = new Date();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const todayLabel = `${today.getFullYear()}-${months[today.getMonth()]}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  return (
    <div className="flex min-h-0 w-full flex-1 select-none flex-col overflow-hidden bg-white font-sans">
      {/* Header */}
      <div className="bg-[#BCC4CC] border-b border-gray-400 px-4 py-1 flex items-center justify-between text-[11px] font-mono text-gray-900 border-t border-t-white flex-shrink-0 h-7 select-none w-full">
        <span><span className="font-bold">Trx.:</span> {trxNumber}</span>
        <span><span className="font-bold">Clerk:</span> {cashierName}</span>
        <span><span className="font-bold">Str No.:</span> {branchCode}</span>
        <span><span className="font-bold">Reg No.:</span> {terminalId}</span>
        <span className="font-bold">{todayLabel}</span>
      </div>

      {/* Yellow Strip */}
      <div className="bg-[#FFF275] h-7 w-full border-b border-gray-400 flex-shrink-0" />

      {/* Main Area */}
      {zClearingStep ? (
        <div className="flex-1 flex items-center justify-center bg-white p-6 overflow-hidden">
          {/* Register Clearing */}
          <div className="w-[440px] border-4 border-[#228B22] bg-[#D4D0C8] font-sans shadow-lg">
            <div className="bg-[#228B22] text-white py-1.5 px-3 text-center font-bold text-sm uppercase tracking-wider">
              REGISTER CLEARING
            </div>
            <div className="p-6 space-y-6 text-gray-900">
              <div className="text-center font-bold text-xs text-gray-900">
                Are you sure you want to clear all totals?
              </div>

              <div className="flex items-center justify-center space-x-4 pt-1">
                <button
                  type="button"
                  onClick={() => setZClearingStep(false)}
                  className={`min-w-[75px] px-4 py-1 text-xs font-bold font-sans transition-all border-2 cursor-pointer ${
                    clearingFocus === "YES"
                      ? "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-black outline outline-1 outline-dotted outline-black ring-1 ring-blue-600"
                      : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 hover:bg-[#E2E0DC]"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={`min-w-[75px] px-4 py-1 text-xs font-bold font-sans transition-all border-2 cursor-pointer ${
                    clearingFocus === "NO"
                      ? "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-black outline outline-1 outline-dotted outline-black ring-1 ring-blue-600"
                      : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 hover:bg-[#E2E0DC]"
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={`min-w-[75px] px-4 py-1 text-xs font-bold font-sans transition-all border-2 cursor-pointer ${
                    clearingFocus === "CANCEL"
                      ? "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-black outline outline-1 outline-dotted outline-black ring-1 ring-blue-600"
                      : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 hover:bg-[#E2E0DC]"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-12 bg-white overflow-hidden min-h-0">
          {/* Readings View */}
          {/* Action Panel */}
          <div className="col-span-5 bg-[#67B8DE] flex flex-col items-center justify-center p-6 space-y-4 border-r-2 border-gray-400">
            <button
              type="button"
              onClick={() => {
                alert(`${isY ? "Y" : "Z"} Reading printed successfully.`);
                onClose();
              }}
              className="w-36 py-2 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-blue-900 font-extrabold text-xs shadow flex flex-col items-center cursor-pointer active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white"
            >
              <span className="font-black text-sm">Print</span>
              <span className="text-[10px] text-gray-900">Enter</span>
            </button>

            <button
              type="button"
              className="w-36 py-2 bg-[#E4002B] border-2 border-t-[#ff6b6b] border-l-[#ff6b6b] border-r-[#800000] border-b-[#800000] text-white font-extrabold text-xs shadow flex flex-col items-center cursor-pointer"
            >
              <span className="font-black text-sm">Help</span>
              <span className="text-[10px]">F1</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-36 py-2 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-blue-900 font-extrabold text-xs shadow flex flex-col items-center cursor-pointer active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white"
            >
              <span className="font-black text-sm">Back</span>
              <span className="text-[10px] text-gray-900">{isY ? "Alt + B" : "Esc"}</span>
            </button>
          </div>

          {/* Paper Slip */}
          <div className="col-span-7 bg-white p-6 overflow-y-auto flex justify-center">
            <div className="w-[380px] bg-white border-2 border-gray-600 p-4 font-mono text-xs text-gray-900 shadow leading-snug">
              <div className="text-center">
                <div className="font-bold text-sm tracking-wider">{isY ? "Y READING" : "Z READING"}</div>
                <div>ABACUS BOOK AND CARD CORP.</div>
                <div>NBS OUTLET STORE</div>
                <div>2nd Floor National Book Store Superbranch</div>
                <div>General Roxas St, Araneta Center</div>
                <div>Socorro Cubao, Quezon City</div>
                <div>VAT Registered TIN: 000-299-299-212</div>
                <div>MIN: 17102610031446661</div>
                <div>Serial No.: AT17-ST0529</div>
                <div>ACCREDTN: 041-208117451-000086-11210</div>
              </div>

              <div className="flex justify-between pt-2 border-t border-dashed border-gray-400 mt-2">
                <span>Store No.: {branchCode}</span>
                <span>Term. No.: {terminalId}</span>
              </div>
              <div>Clerk : {cashierName}</div>
              <div className="flex justify-between">
                <span>27 Aug 2021</span>
                <span>08:21 AM</span>
              </div>

              <div className="pt-2 space-y-0.5 border-t border-dashed border-gray-400 mt-2">
                <div className="flex justify-between">
                  <span># of Transactions</span>
                  <span>12</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total Sales</span>
                  <span>7,973.61</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Items Sold</span>
                  <span>36</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Item Per Sale</span>
                  <span>3.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Amount Per Sale</span>
                  <span>664.47</span>
                </div>
              </div>

              {isY ? (
                <div className="pt-2 border-t border-dashed border-gray-400 mt-2">
                  <div className="text-center font-bold">PAYMENT SUMMARY</div>
                  <div className="flex justify-between pt-1">
                    <span>01 Cash</span>
                    <span>2,029.90</span>
                  </div>
                  <div className="border-t border-dashed border-gray-400 my-0.5" />
                  <div className="flex justify-between font-bold">
                    <span>TOTAL CASH</span>
                    <span>2,029.90</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>13 BPI</span>
                    <span>2,524.91</span>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-dashed border-gray-400 mt-2">
                  <div className="text-center font-bold">DEPARTMENT SUMMARY</div>
                  <div className="flex justify-between pt-1">
                    <span>Books</span>
                    <span>1,545.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Non-Books</span>
                    <span>6,428.61</span>
                  </div>
                  <div className="border-t border-dashed border-gray-400 my-0.5" />
                  <div className="flex justify-between font-bold">
                    <span>TOTAL</span>
                    <span>7,973.61</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CM Issuance(-):</span>
                    <span>0.00</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-[#228B22] border-t-2 border-gray-500 flex-shrink-0 h-10 w-full" />
    </div>
  );
}
