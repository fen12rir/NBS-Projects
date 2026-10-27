"use client";

import React, { useState, useEffect, useRef } from "react";

export interface TransactionComments {
  customerName?: string;
  address?: string;
  tin?: string;
  remarks?: string;
}

interface TransactionCommentScreenProps {
  initialComments?: TransactionComments;
  trxNumber?: string;
  clerkName?: string;
  terminalId?: string;
  branchCode?: string;
  dateStr?: string;
  onSave: (comments: TransactionComments) => void;
  onCancel: () => void;
}

export function TransactionCommentScreen({
  initialComments,
  trxNumber = "0216202629990003000658",
  clerkName = "Jan Angela",
  terminalId = "0003",
  branchCode = "2999",
  dateStr,
  onSave,
  onCancel,
}: TransactionCommentScreenProps) {
  const [customerName, setCustomerName] = useState(
    initialComments?.customerName || "JAN ANGELA CATINDIG"
  );
  const [tin, setTin] = useState(initialComments?.tin || "000-000-000");
  const [address, setAddress] = useState(
    initialComments?.address || "MANDALUYONG"
  );

  const [currentTime, setCurrentTime] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
    nameInputRef.current?.select();

    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ customerName, tin, address });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white font-sans select-none overflow-hidden">
      {/* 1. TOP HEADER BAR: Authentic Light Grey Monospace Bar */}
      <div className="bg-[#BCC4CC] border-b border-gray-400 px-4 py-1 flex items-center justify-between text-[11px] font-mono text-gray-900 border-t border-t-white flex-shrink-0 h-7 select-none w-full">
        <span>
          <span className="font-bold">Trx.:</span> {trxNumber}
        </span>
        <span>
          <span className="font-bold">Clerk:</span> {clerkName}
        </span>
        <span>
          <span className="font-bold">Str No.:</span> {branchCode}
        </span>
        <span>
          <span className="font-bold">Reg No.:</span> {terminalId}
        </span>
        <span className="font-bold">{dateStr || "2026-Feb-16"}</span>
      </div>

      {/* 2. Yellow Bar across the top */}
      <div className="bg-[#FFF275] border-b border-gray-400 h-8 flex-shrink-0" />

      {/* 3. Center Page Area: Light Grey with Green-framed Dialog */}
      <div className="flex-1 bg-[#BDC3C7] flex items-center justify-center p-4 min-h-0 overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          className="w-[390px] bg-[#D4D0C8] border-4 border-[#2E7D32] shadow-2xl font-sans"
        >
          {/* Authentic Green Header */}
          <div className="bg-[#2E7D32] text-white px-3 py-1 font-bold text-sm text-center uppercase tracking-wide border-b border-[#1B5E20]">
            TRANSACTION COMMENT
          </div>

          <div className="p-5 space-y-4 text-gray-900">
            <div className="text-center font-bold text-xs text-gray-800">
              Enter Comment:
            </div>

            {/* 3 Text Inputs */}
            <div className="space-y-2.5 max-w-[320px] mx-auto">
              <input
                ref={nameInputRef}
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="CUSTOMER NAME"
                className="w-full bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-mono font-bold text-gray-900 uppercase focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-inner"
              />
              <input
                type="text"
                value={tin}
                onChange={(e) => setTin(e.target.value)}
                placeholder="TIN (000-000-000)"
                className="w-full bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-mono font-bold text-gray-900 uppercase focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-inner"
              />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ADDRESS"
                className="w-full bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-mono font-bold text-gray-900 uppercase focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-inner"
              />
            </div>

            {/* Buttons: Ok & Cancel */}
            <div className="flex items-center justify-center space-x-6 pt-2">
              <button
                type="submit"
                className="min-w-[85px] px-5 py-1 text-xs font-bold font-sans bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-black outline outline-1 outline-dotted outline-black cursor-pointer hover:bg-[#E2E0DC] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white"
              >
                Ok
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="min-w-[85px] px-5 py-1 text-xs font-bold font-sans bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 cursor-pointer hover:bg-[#E2E0DC] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 4. BOTTOM GREEN BAR */}
      <div className="bg-[#22A838] border-t-2 border-gray-400 h-9 flex items-center justify-between px-4 flex-shrink-0">
        <div />
        <div className="text-black font-bold font-sans text-xs tracking-tight">
          {currentTime || "04:38:16 PM"}
        </div>
      </div>
    </div>
  );
}

// Re-export for compatibility
export const TransactionCommentModal = TransactionCommentScreen;
