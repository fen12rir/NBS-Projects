"use client";

import React, { useEffect, useState } from "react";

interface LogoutScreenProps {
  clerkName?: string;
  terminalId?: string;
  branchCode?: string;
  trxNumber?: string;
  currentTime?: string;
  currentDate?: string;
  selectedButton: "YES" | "NO" | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutScreen({
  clerkName = "Jan Angela",
  terminalId = "0003",
  branchCode = "2999",
  trxNumber = "0212202629990003000592",
  currentTime,
  currentDate,
  selectedButton,
  onConfirm,
  onCancel,
}: LogoutScreenProps) {
  const [internalTime, setInternalTime] = useState(() =>
    new Date().toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  );

  useEffect(() => {
    if (currentTime) return;
    const timer = setInterval(() => {
      setInternalTime(
        new Date().toLocaleTimeString("en-PH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [currentTime]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (selectedButton === "NO") {
          onCancel();
        } else {
          onConfirm();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedButton, onConfirm, onCancel]);

  const today = new Date();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const fallbackDate = `${today.getFullYear()}-${months[today.getMonth()]}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  const displayDate = currentDate || fallbackDate;
  const displayTime = currentTime || internalTime;

  return (
    <div className="flex min-h-0 w-full flex-1 select-none flex-col overflow-hidden bg-white font-sans">
      {/* Top Header Bar */}
      <div className="bg-[#BCC4CC] border-b border-gray-400 px-4 py-1 flex items-center justify-between text-[11px] font-mono text-gray-900 border-t border-t-white flex-shrink-0 h-7 select-none w-full">
        <span><span className="font-bold">Trx.:</span> {trxNumber}</span>
        <span><span className="font-bold">Clerk:</span> {clerkName}</span>
        <span><span className="font-bold">Str No.:</span> {branchCode}</span>
        <span><span className="font-bold">Reg No.:</span> {terminalId}</span>
        <span className="font-bold">{displayDate}</span>
      </div>

      {/* Yellow Strip */}
      <div className="bg-[#FFF275] h-7 w-full border-b border-gray-400 flex-shrink-0" />

      {/* Main Area */}
      <div className="flex-1 flex items-center justify-center bg-[#E5E7EB] p-6 overflow-hidden">
        <div className="w-[380px] border-4 border-[#228B22] bg-[#D4D0C8] font-sans shadow-2xl">
          {/* Title */}
          <div className="bg-[#228B22] text-white py-1.5 px-3 text-center font-bold text-sm uppercase tracking-wider">
            LOGOUT
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 text-gray-900">
            <div className="text-center font-bold text-sm text-gray-900 leading-snug">
              Are you sure you want to LOGOUT?
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center space-x-6 pt-2">
              <button
                type="button"
                onClick={onConfirm}
                className={`min-w-[85px] px-6 py-1.5 text-xs font-bold font-sans transition-all border-2 cursor-pointer ${
                  selectedButton === "YES"
                    ? "bg-[#D4D0C8] border-red-600 ring-2 ring-red-500 shadow-inner text-black font-extrabold"
                    : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 hover:bg-[#E2E0DC]"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={onCancel}
                className={`min-w-[85px] px-6 py-1.5 text-xs font-bold font-sans transition-all border-2 cursor-pointer ${
                  selectedButton === "NO"
                    ? "bg-[#D4D0C8] border-red-600 ring-2 ring-red-500 shadow-inner text-black font-extrabold"
                    : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 hover:bg-[#E2E0DC]"
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="bg-[#228B22] border-t-2 border-gray-500 flex-shrink-0 h-10 w-full select-none" />
    </div>
  );
}
