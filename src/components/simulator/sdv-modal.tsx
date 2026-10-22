"use client";

import React, { useEffect } from "react";

interface SdvModalProps {
  onClose: () => void;
  onPrintSlip?: () => void;
  saleshdr?: string;
  salesdtl?: string;
  paydtl?: string;
}

export function SdvModal({
  onClose,
  saleshdr = "7,973.61",
  salesdtl = "7,973.61",
  paydtl = "7,973.61",
}: SdvModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || (e.altKey && (e.key === "b" || e.key === "B"))) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="w-full flex-1 flex flex-col font-sans bg-white min-h-[500px] select-none">
      {/* 2. AUTHENTIC YELLOW BANNER matching pos-sdv-step2-f10.png */}
      <div className="bg-[#FFF275] border-b-2 border-gray-500 py-1.5 text-center font-bold text-lg text-gray-900 tracking-wider">
        Sales Data Verification
      </div>

      {/* 3. GREY GRADIENT TOTALS BAR */}
      <div className="bg-gradient-to-b from-[#B8B8B8] to-[#999999] border-b border-gray-400 py-1.5 text-center font-bold text-base text-black font-mono">
        Saleshdr = {saleshdr}&nbsp;&nbsp;Salesdtl = {salesdtl}&nbsp;&nbsp;Paydtl = {paydtl}
      </div>

      {/* 4. LIGHT CYAN TABLE HEADERS */}
      <div className="bg-[#67B8DE] border-b border-gray-400 px-6 py-1 text-xs font-bold text-gray-900 grid grid-cols-3 text-center uppercase tracking-wide">
        <span>Sales Header</span>
        <span>Sales Detail</span>
        <span>Pay Detail</span>
      </div>

      {/* 5. WHITE BODY WITH RED NOTIFICATION TEXT */}
      <div className="flex-1 bg-white flex flex-col items-center justify-center p-8">
        <div className="text-center font-bold text-red-600 text-lg leading-relaxed max-w-md">
          There&apos;s no missing OR. Please perform<br />
          Terminal/Z Reading.
        </div>
      </div>

      {/* 6. GREEN BOTTOM TOOLBAR */}
      <div className="bg-[#388E3C] border-t-2 border-black p-2 flex items-center justify-center">
        <button
          type="button"
          onClick={onClose}
          className="min-w-[130px] px-6 py-1.5 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-blue-900 font-extrabold text-xs shadow flex flex-col items-center cursor-pointer active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white"
        >
          <span className="font-black text-sm">CANCEL</span>
          <span className="text-[10px] text-gray-900">&lt;Alt-B&gt;</span>
        </button>
      </div>
    </div>
  );
}
