"use client";

import React, { useEffect } from "react";

interface ChooseOptionScreenProps {
  trxNumber?: string;
  clerkName?: string;
  branchCode?: string;
  terminalId?: string;
  onSelectOption: (optionNum: 1 | 2 | 3) => void;
  onCancel: () => void;
}

export function ChooseOptionScreen({
  trxNumber = "1023202629990004001560",
  clerkName = "Jan Angela",
  branchCode = "2999",
  terminalId = "0004",
  onSelectOption,
  onCancel,
}: ChooseOptionScreenProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "1") {
        e.preventDefault();
        onSelectOption(1);
      } else if (e.key === "2") {
        e.preventDefault();
        onSelectOption(2);
      } else if (e.key === "3") {
        e.preventDefault();
        onSelectOption(3);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSelectOption, onCancel]);

  const todayStr = (() => {
    const d = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getFullYear()}-${months[d.getMonth()]}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  return (
    <div className="w-full flex-1 flex flex-col font-sans bg-[#DCDAD4] min-h-0 overflow-hidden select-none">
      {/* 1. TOP HEADER BAR: Light Grey Monospace / Sans Bar */}
      <div className="bg-[#BCC4CC] border-b border-gray-400 px-4 py-1 flex items-center justify-between text-[11px] font-mono text-gray-900 border-t border-t-white flex-shrink-0 h-7 select-none w-full">
        <span><span className="font-bold">Trx.:</span> {trxNumber}</span>
        <span><span className="font-bold">Clerk:</span> {clerkName}</span>
        <span><span className="font-bold">Str No.:</span> {branchCode}</span>
        <span><span className="font-bold">Reg No.:</span> {terminalId}</span>
        <span className="font-bold">{todayStr}</span>
      </div>

      {/* 2. SOLID YELLOW BANNER */}
      <div className="bg-[#FFF275] border-b border-gray-400 h-9 flex-shrink-0" />

      {/* 3. CENTER SCREEN BODY */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#DCDAD4] min-h-0 overflow-y-auto">
        {/* GREEN BEVELED OPTION BOX */}
        <div className="w-[380px] bg-[#CCD2D8] border-[6px] border-[#22A838] shadow-lg flex flex-col font-sans">
          {/* Header */}
          <div className="bg-[#22A838] py-1.5 px-3 text-center font-bold text-base text-[#1E293B]">
            Choose Option
          </div>

          {/* Options Content */}
          <div className="p-8 flex flex-col space-y-6 text-gray-900">
            <button
              type="button"
              onClick={() => onSelectOption(1)}
              className="text-left text-lg font-bold hover:text-green-800 transition-colors cursor-pointer select-none focus:outline-none"
            >
              1. None
            </button>
            <button
              type="button"
              onClick={() => onSelectOption(2)}
              className="text-left text-lg font-bold hover:text-green-800 transition-colors cursor-pointer select-none focus:outline-none"
            >
              2. Laking National Card
            </button>
            <button
              type="button"
              onClick={() => onSelectOption(3)}
              className="text-left text-lg font-bold hover:text-green-800 transition-colors cursor-pointer select-none focus:outline-none"
            >
              3. LNQR / LNQR PLUS
            </button>
          </div>
        </div>
      </div>

      {/* 4. SOLID GREEN BOTTOM BAR */}
      <div className="bg-[#22A838] h-10 border-t border-green-700 flex-shrink-0" />
    </div>
  );
}
