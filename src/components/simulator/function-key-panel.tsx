"use client";

import React from "react";
import { POSPage, POS_FUNCTION_KEYS, FunctionKeyDef } from "@/data/function-keys";

interface FunctionKeyPanelProps {
  currentPage: POSPage;
  onKeyClick: (keyDef: FunctionKeyDef) => void;
  disabledKeys?: string[];
}

export function FunctionKeyPanel({
  currentPage,
  onKeyClick,
  disabledKeys = [],
}: FunctionKeyPanelProps) {
  const keys = POS_FUNCTION_KEYS[currentPage] || [];

  return (
    <div className="bg-[#1E3E62] border-2 border-[#3B82F6] p-2">
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-blue-400/30 text-[11px] font-mono text-blue-200">
        <span className="font-bold tracking-wider uppercase">
          SCREEN: {currentPage}
        </span>
        <span className="text-[10px] text-blue-300">
          Touch or use Physical F1-F12 Keys
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
        {keys.map((keyDef) => {
          const isKeyDisabled = keyDef.disabled || disabledKeys.includes(keyDef.key);

          return (
            <button
              key={keyDef.key}
              disabled={isKeyDisabled}
              onClick={() => onKeyClick(keyDef)}
              className={`flex flex-col items-center justify-center p-2 border font-mono transition-all text-center select-none ${
                isKeyDisabled
                  ? "bg-gray-800/60 border-gray-700 text-gray-500 cursor-not-allowed opacity-60"
                  : "bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] border-blue-300 text-white shadow-sm cursor-pointer"
              }`}
            >
              <span
                className={`text-xs font-black tracking-wider ${
                  isKeyDisabled ? "text-gray-400" : "text-yellow-300"
                }`}
              >
                {keyDef.key}
              </span>
              <span className="text-[11px] font-bold leading-tight mt-0.5 uppercase truncate w-full">
                {keyDef.label}
              </span>
              {keyDef.subtext && (
                <span className="text-[9px] text-blue-100 truncate w-full mt-0.5 opacity-80">
                  {keyDef.subtext}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}