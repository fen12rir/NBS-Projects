"use client";

import React, { useEffect } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export interface PosAlertState {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  onClose?: () => void;
}

interface PosAlertModalProps {
  alert: PosAlertState | null;
  onClose: () => void;
}

export function PosAlertModal({ alert, onClose }: PosAlertModalProps) {
  useEffect(() => {
    if (!alert?.isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey, true);
    return () => window.removeEventListener("keydown", handleKey, true);
  }, [alert?.isOpen, onClose]);

  if (!alert?.isOpen) return null;

  const isSuccess = alert.type === "success" || alert.message.toLowerCase().includes("success");
  const isWarning = alert.type === "warning";

  return (
    <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-[#D4D0C8] border-4 border-[#7A8A99] p-4 sm:p-5 shadow-2xl max-w-sm w-full font-sans text-gray-900 border-t-white border-l-white border-r-[#404040] border-b-[#404040]">
        {/* POS Header Bar */}
        <div
          className={`${
            isSuccess ? "bg-[#006633]" : isWarning ? "bg-[#B45309]" : "bg-[#1E3A8A]"
          } text-white px-3 py-1.5 font-bold text-xs sm:text-sm mb-3 flex items-center justify-between border-b-2 border-black/20 shadow-xs`}
        >
          <div className="flex items-center space-x-1.5">
            {isSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            ) : isWarning ? (
              <AlertCircle className="w-4 h-4 text-amber-200 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-200 shrink-0" />
            )}
            <span className="uppercase tracking-wide">
              {alert.title || (isSuccess ? "Notice: Completed" : "POS Terminal Notice")}
            </span>
          </div>
          <span className="font-mono text-[10px] bg-black/30 text-white/90 px-1.5 py-0.5 rounded">
            OK
          </span>
        </div>

        {/* Message Body */}
        <div className="bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white p-3.5 my-2 shadow-inner">
          <p className="text-xs sm:text-sm text-gray-900 font-bold leading-relaxed whitespace-pre-line text-center">
            {alert.message}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            autoFocus
            onClick={() => {
              if (alert.onClose) alert.onClose();
              onClose();
            }}
            className="w-full bg-[#006633] hover:bg-[#005229] active:bg-[#003D1E] text-white px-5 py-2 text-xs font-black uppercase tracking-wider shadow-md border-2 border-t-[#34D399] border-l-[#34D399] border-r-[#064E3B] border-b-[#064E3B] flex items-center justify-center space-x-1.5 cursor-pointer active:scale-[0.99] transition-transform"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>OK (Enter)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
