"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ManagerOverrideModal } from "./manager-override-modal";

export interface AuthenticDiscount {
  code: string;
  description: string;
  rate: number;
}

export const AUTHENTIC_DISCOUNTS: AuthenticDiscount[] = [
  { code: "ZEIP", description: "Employee with Installment Payment", rate: 0.15 },
  { code: "ZEM1", description: "Employee 10% Discount", rate: 0.10 },
  { code: "ZEM2", description: "Employee 20% Discount", rate: 0.20 },
  { code: "ZMDP", description: "Medical / Dental Plan", rate: 0.10 },
  { code: "ZOZM", description: "Ozone Member", rate: 0.10 },
  { code: "ZPO1", description: "P.O. Discount 1", rate: 0.10 },
  { code: "ZPWD", description: "Person with Disability", rate: 0.20 },
  { code: "ZQCR", description: "LNQR Corporate Discount", rate: 0.10 },
  { code: "ZQFD", description: "LNQR Family Discount", rate: 0.10 },
  { code: "ZQRP", description: "LNQR Regular Promo", rate: 0.10 },
  { code: "ZSBS", description: "Step By Step", rate: 0.05 },
  { code: "ZSEN", description: "Senior Citizen Discount", rate: 0.20 },
  { code: "ZSPD", description: "Special Discount", rate: 0.10 },
  { code: "ZSPM", description: "Special Promo", rate: 0.15 },
  { code: "ZSSD", description: "School Season Discount", rate: 0.10 },
  { code: "ZTDY", description: "Teachers Day Discount", rate: 0.10 },
  { code: "ZTIP", description: "Teacher with Installment", rate: 0.10 },
  { code: "ZTNP", description: "Teacher Non-Installment", rate: 0.10 },
];

interface TransactionDiscountScreenProps {
  onApply: (discount: { name: string; percent: number }) => void;
  onCancel: () => void;
  clerkName?: string;
  terminalId?: string;
  branchCode?: string;
}

export function TransactionDiscountModal({
  onApply,
  onCancel,
  clerkName = "Jan Angela",
  terminalId = "0003",
  branchCode = "2999",
}: TransactionDiscountScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [isFamDiscQrOpen, setIsFamDiscQrOpen] = useState(false);
  const [customerQr, setCustomerQr] = useState("20221003LN000004");

  const selectedDiscount = AUTHENTIC_DISCOUNTS[selectedIndex];

  useEffect(() => {
    if (isOverrideOpen || isFamDiscQrOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "F11") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowDown" || e.key === "F12") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(AUTHENTIC_DISCOUNTS.length - 1, prev + 1));
      } else if ((e.altKey && e.key === "Enter") || e.key === "Enter") {
        e.preventDefault();
        setIsOverrideOpen(true);
      } else if (e.key === "Escape" || (e.altKey && (e.key === "b" || e.key === "B"))) {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, isOverrideOpen, isFamDiscQrOpen, onCancel]);

  const handleOverrideSuccess = () => {
    setIsOverrideOpen(false);
    if (selectedDiscount.code === "ZQFD") {
      setIsFamDiscQrOpen(true);
    } else {
      onApply({
        name: `${selectedDiscount.code} - ${selectedDiscount.description}`,
        percent: Math.round(selectedDiscount.rate * 100),
      });
    }
  };

  const handleConfirmFamDiscQr = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsFamDiscQrOpen(false);
    onApply({
      name: `${selectedDiscount.code} - ${selectedDiscount.description}`,
      percent: Math.round(selectedDiscount.rate * 100),
    });
  };

  return (
    <div className="w-full flex-1 flex flex-col font-sans bg-white min-h-[500px] select-none">
      {/* 2. AUTHENTIC YELLOW BANNER */}
      <div className="bg-[#FFF275] border-b-2 border-gray-500 py-1.5 text-center font-bold text-lg text-gray-900 tracking-wider">
        TRANSACTION DISCOUNT
      </div>

      {/* 3. CONTROLS ROW */}
      <div className="bg-[#C2CAD0] border-b border-gray-400 flex items-center px-4 py-1.5 space-x-3">
        {/* F11 Up */}
        <button
          type="button"
          onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
          className="w-12 h-9 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] flex flex-col items-center justify-center cursor-pointer active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white"
        >
          <div className="w-0 h-0 border-x-[5px] border-x-transparent border-b-[7px] border-b-green-700 mb-0.5" />
          <span className="text-[10px] font-bold text-gray-900">F11</span>
        </button>

        {/* F12 Down */}
        <button
          type="button"
          onClick={() => setSelectedIndex((prev) => Math.min(AUTHENTIC_DISCOUNTS.length - 1, prev + 1))}
          className="w-12 h-9 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] flex flex-col items-center justify-center cursor-pointer active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white"
        >
          <div className="w-0 h-0 border-x-[5px] border-x-transparent border-t-[7px] border-t-green-700 mb-0.5" />
          <span className="text-[10px] font-bold text-gray-900">F12</span>
        </button>

        {/* F1 Help */}
        <button
          type="button"
          className="w-14 h-9 bg-[#E4002B] text-white font-bold text-xs flex flex-col items-center justify-center border-2 border-t-[#ff6b6b] border-l-[#ff6b6b] border-r-[#800000] border-b-[#800000]"
        >
          <span className="text-[9px] leading-none">Help</span>
          <span className="text-[10px]">F1</span>
        </button>

        <span className="text-sm font-bold text-gray-900 pl-4">
          Select Discount Type:
        </span>
      </div>

      {/* 4. TABLE HEADERS */}
      <div className="bg-[#B8C2CC] border-b border-gray-400 px-6 py-1 text-xs font-bold text-gray-800 grid grid-cols-12 uppercase tracking-wider">
        <span className="col-span-3">Code</span>
        <span className="col-span-9">Description</span>
      </div>

      {/* 5. TABLE BODY */}
      <div className="flex-1 bg-white overflow-y-auto">
        <table className="w-full text-left font-sans text-xs border-collapse">
          <tbody>
            {AUTHENTIC_DISCOUNTS.map((disc, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <tr
                  key={disc.code}
                  onClick={() => setSelectedIndex(idx)}
                  className={`cursor-pointer border-b border-gray-200 transition-colors ${
                    isSelected
                      ? "bg-[#9ACD32] text-black font-extrabold"
                      : "hover:bg-blue-50 text-gray-900 font-medium"
                  }`}
                >
                  <td className="py-1.5 px-6 w-1/4 font-mono font-bold text-sm">
                    {disc.code}
                  </td>
                  <td className="py-1.5 px-6 w-3/4 text-sm font-bold">
                    {disc.description}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 6. BOTTOM GREEN TOOLBAR */}
      <div className="bg-[#388E3C] border-t-2 border-black p-2 flex items-center justify-center space-x-6">
        <button
          type="button"
          onClick={() => setIsOverrideOpen(true)}
          className="min-w-[120px] px-4 py-1.5 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-black font-extrabold text-xs shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer"
        >
          OK &lt;Alt-Enter&gt;
        </button>
        <button
          type="button"
          onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
          className="min-w-[120px] px-4 py-1.5 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 font-bold text-xs shadow cursor-pointer"
        >
          PREV &lt;Left-Arrow&gt;
        </button>
        <button
          type="button"
          onClick={() => setSelectedIndex((prev) => Math.min(AUTHENTIC_DISCOUNTS.length - 1, prev + 1))}
          className="min-w-[120px] px-4 py-1.5 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 font-bold text-xs shadow cursor-pointer"
        >
          NEXT &lt;Right-Arrow&gt;
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-w-[120px] px-4 py-1.5 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-black font-extrabold text-xs shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer"
        >
          CANCEL &lt;Alt-B&gt;
        </button>
      </div>

      {/* 7. AUTHENTIC MANAGER OVERRIDE MODAL ON SELECTION */}
      {isOverrideOpen && (
        <ManagerOverrideModal
          targetAction={`Discount ${selectedDiscount.code}`}
          onConfirm={handleOverrideSuccess}
          onCancel={() => setIsOverrideOpen(false)}
        />
      )}

      {/* 8. AUTHENTIC LAKING NATIONAL QR MODAL FOR ZQFD */}
      {isFamDiscQrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleConfirmFamDiscQr}
            className="w-[440px] bg-[#D4D0C8] border-4 border-[#2E7D32] shadow-2xl font-sans"
          >
            <div className="bg-[#FFF275] text-black px-3 py-1 font-bold text-sm text-center uppercase tracking-wide border-b border-gray-400">
              Laking National QR
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-800">
                  Scan Customer QR :
                </label>
                <input
                  type="text"
                  value={customerQr}
                  onChange={(e) => setCustomerQr(e.target.value)}
                  autoFocus
                  className="w-56 bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-center space-x-6 pt-2">
                <button
                  type="submit"
                  className="min-w-[85px] px-5 py-1 text-xs font-bold font-sans bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-black outline outline-1 outline-dotted outline-black cursor-pointer hover:bg-[#E2E0DC]"
                >
                  Ok
                </button>
                <button
                  type="button"
                  onClick={() => setIsFamDiscQrOpen(false)}
                  className="min-w-[85px] px-5 py-1 text-xs font-bold font-sans bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 cursor-pointer hover:bg-[#E2E0DC]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
