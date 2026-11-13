"use client";

import React, { useState, useEffect } from "react";

interface ManagerOverrideScreenProps {
  targetAction?: string;
  clerkName?: string;
  terminalId?: string;
  branchCode?: string;
  trxNumber?: string;
  totalQty?: number;
  totalSales?: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ManagerOverrideScreen({
  targetAction,
  clerkName = "Jan Angela",
  terminalId = "0003",
  branchCode = "2999",
  trxNumber = "0212202629990003000597",
  totalQty = 0,
  totalSales = 0,
  onConfirm,
  onCancel,
}: ManagerOverrideScreenProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("1234");
  const [focusedField, setFocusedField] = useState<"USERNAME" | "PASSWORD" | "YES" | "NO">("PASSWORD");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        setFocusedField((prev) => {
          if (prev === "USERNAME") return "PASSWORD";
          if (prev === "PASSWORD") return "YES";
          if (prev === "YES") return "NO";
          return "USERNAME";
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (focusedField === "NO") {
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
  }, [focusedField, onConfirm, onCancel]);

  const today = new Date();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const todayLabel = `${today.getFullYear()}-${months[today.getMonth()]}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  const currentTimeLabel = today.toLocaleTimeString("en-US", { hour12: true });

  return (
    <div className="flex min-h-0 w-full flex-1 select-none flex-col overflow-hidden bg-white font-sans">
      {/* Header */}
      <div className="bg-[#BCC4CC] border-b border-gray-400 px-4 py-1 flex items-center justify-between text-[11px] font-mono text-gray-900 border-t border-t-white flex-shrink-0 h-7 select-none w-full">
        <span><span className="font-bold">Trx.:</span> {trxNumber}</span>
        <span><span className="font-bold">Clerk:</span> {clerkName}</span>
        <span><span className="font-bold">Str No.:</span> {branchCode}</span>
        <span><span className="font-bold">Reg No.:</span> {terminalId}</span>
        <span className="font-bold">{todayLabel}</span>
      </div>

      {/* Yellow Strip */}
      <div className="bg-[#FFF275] h-7 w-full border-b border-gray-400 flex-shrink-0" />

      {/* Main Area */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 overflow-hidden">
        <div className="w-[440px] border-4 border-[#228B22] bg-[#D4D0C8] font-sans shadow-lg">
          {/* Title */}
          <div className="bg-[#228B22] text-white py-1 px-3 text-center font-bold text-sm uppercase tracking-wider">
            MANAGER OVERRIDE
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 text-gray-900">
            <div className="text-center font-bold text-xs text-gray-900 leading-snug px-2">
              Sorry, you dont have permission to do this operation. Please perform Manager Override
            </div>

            {/* Inputs */}
            <div className="space-y-3 pt-2 max-w-[280px] mx-auto">
              <div className="flex flex-col items-center">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField("USERNAME")}
                  className={`w-full bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-mono font-bold text-gray-900 text-center focus:outline-none ${
                    focusedField === "USERNAME" ? "ring-2 ring-blue-500" : ""
                  }`}
                />
                <label className="text-[11px] font-bold text-gray-700 mt-1">
                  Username
                </label>
              </div>

              <div className="flex flex-col items-center">
                <input
                  type="text"
                  style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-lpignore="true"
                  data-form-type="other"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("PASSWORD")}
                  autoFocus
                  className={`w-full bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-mono font-bold text-gray-900 text-center focus:outline-none ${
                    focusedField === "PASSWORD" ? "ring-2 ring-blue-500" : ""
                  }`}
                />
                <label className="text-[11px] font-bold text-gray-700 mt-1">
                  Password
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center space-x-6 pt-2">
              <button
                type="button"
                onClick={onConfirm}
                className={`min-w-[85px] px-5 py-1 text-xs font-bold font-sans transition-all border-2 cursor-pointer ${
                  focusedField === "YES"
                    ? "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-black outline outline-1 outline-dotted outline-black ring-1 ring-blue-600"
                    : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 hover:bg-[#E2E0DC]"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={onCancel}
                className={`min-w-[85px] px-5 py-1 text-xs font-bold font-sans transition-all border-2 cursor-pointer ${
                  focusedField === "NO"
                    ? "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-black outline outline-1 outline-dotted outline-black ring-1 ring-blue-600"
                    : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 hover:bg-[#E2E0DC]"
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#228B22] border-t-2 border-gray-500 flex-shrink-0 h-10 w-full" />
    </div>
  );
}
