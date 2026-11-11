"use client";

import React from "react";

interface MobileKeyStripProps {
  onKeyPress: (key: string, altKey?: boolean, ctrlKey?: boolean) => void;
}

export function MobileKeyStrip({ onKeyPress }: MobileKeyStripProps) {
  const commonKeys = [
    { label: "ESC", key: "Escape", isEsc: true },
    { label: "TAB", key: "Tab" },
    { label: "ENTER", key: "Enter", primary: true },
    { label: "Alt+B", key: "b", altKey: true, highlight: true },
    { label: "Alt+Enter", key: "Enter", altKey: true, highlight: true },
    { label: "Cancel", key: "c", ctrlKey: true, altKey: true, title: "Ctrl+Alt+C (Cancel Transaction)" },
  ];

  const fKeys = [
    { label: "F1", key: "F1" },
    { label: "F2", key: "F2" },
    { label: "F3", key: "F3" },
    { label: "F4", key: "F4" },
    { label: "F5", key: "F5" },
    { label: "F6", key: "F6" },
    { label: "F7", key: "F7" },
    { label: "F8", key: "F8" },
    { label: "F9", key: "F9" },
    { label: "F10", key: "F10" },
    { label: "F11", key: "F11" },
    { label: "F12", key: "F12" },
  ];

  return (
    <div className="w-full bg-gray-950/95 border-t border-gray-800 py-1 overflow-x-auto select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden z-30 touch-pan-x px-4 sm:px-8 scroll-px-6">
      <div className="flex items-center justify-start md:justify-center gap-1 sm:gap-1.5 min-w-max pl-2 pr-16 sm:pr-24">
        {/* Control Keys */}
        <div className="flex items-center gap-1 shrink-0 md:shrink md:flex-1">
          {commonKeys.map((k) => (
            <button
              key={k.label}
              type="button"
              title={(k as any).title || k.label}
              onClick={() => onKeyPress(k.key, k.altKey, k.ctrlKey)}
              className={`shrink-0 md:shrink md:flex-1 h-7 sm:h-8 px-2 sm:px-2.5 py-0.5 text-[11px] font-mono font-bold rounded shadow-xs active:scale-95 transition-transform cursor-pointer text-center whitespace-nowrap flex items-center justify-center ${
                k.primary
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : k.highlight
                  ? "bg-amber-600 hover:bg-amber-500 text-white"
                  : (k as any).isEsc
                  ? "bg-red-900/80 hover:bg-red-800 text-white border border-red-700"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>

        {/* Separator Divider */}
        <div className="h-5 w-px bg-gray-700 shrink-0 mx-0.5 sm:mx-1" />

        {/* F1-F12 Function Keys */}
        <div className="flex items-center gap-1 shrink-0 md:shrink md:flex-[1.6]">
          {fKeys.map((k) => (
            <button
              key={k.label}
              type="button"
              onClick={() => onKeyPress(k.key)}
              className={`shrink-0 md:shrink md:flex-1 h-7 sm:h-8 px-1.5 sm:px-2 py-0.5 text-[11px] font-mono font-bold bg-gray-800 hover:bg-gray-700 text-yellow-300 border rounded shadow-xs active:scale-95 transition-transform cursor-pointer text-center whitespace-nowrap flex items-center justify-center ${
                k.label === "F12" ? "border-yellow-500/60 ring-1 ring-yellow-500/30" : "border-gray-700"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
