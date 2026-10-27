"use client";

import React, { useState, useEffect } from "react";

interface ManagerOverrideModalProps {
  targetAction?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ManagerOverrideModal({
  targetAction,
  onConfirm,
  onCancel,
}: ManagerOverrideModalProps) {
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
          return "YES";
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

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
        <div className="w-[440px] bg-[#D4D0C8] border-4 border-[#2E7D32] shadow-2xl font-sans pointer-events-auto">
          {/* Authentic Green Title Bar */}
          <div className="bg-[#2E7D32] text-white px-3 py-1 font-bold text-sm text-center uppercase tracking-wide border-b border-[#1B5E20]">
            MANAGER OVERRIDE
          </div>

          {/* Dialog Body */}
          <div className="p-6 space-y-4 text-gray-900">
            <div className="text-center font-bold text-xs text-gray-900 leading-snug px-2">
              Sorry, you dont have permission to do this operation. Please perform Manager Override
            </div>

            {/* Inputs: Username & Password with labels underneath */}
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
                  type="password"
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

            {/* Buttons: Yes & No */}
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
    </>
  );
}
