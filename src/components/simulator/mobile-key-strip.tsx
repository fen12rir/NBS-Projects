"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Keyboard } from "lucide-react";

interface MobileKeyStripProps {
  onKeyPress: (key: string, altKey?: boolean, ctrlKey?: boolean) => void;
}

export function MobileKeyStrip({ onKeyPress }: MobileKeyStripProps) {
  const [isOpen, setIsOpen] = useState(false);

  const commonKeys = [
    { label: "ENTER", key: "Enter", primary: true },
    { label: "ESC", key: "Escape", isEsc: true },
    { label: "TAB", key: "Tab" },
    { label: "Alt+B", key: "b", altKey: true, highlight: true },
    { label: "Alt+Enter", key: "Enter", altKey: true, highlight: true },
    { label: "Cancel", key: "c", ctrlKey: true, altKey: true, title: "Ctrl+Alt+C (Cancel Transaction)" },
  ];

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex items-center select-none pointer-events-none">
      {isOpen ? (
        <div className="pointer-events-auto bg-gray-950/95 border border-l-0 border-gray-700 rounded-r-lg shadow-2xl p-1.5 flex flex-col gap-1.5 backdrop-blur-xs">
          <div className="flex items-center justify-between gap-2 pb-1 border-b border-gray-800">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 px-0.5">
              <Keyboard className="w-3 h-3 text-emerald-400" />
              Keys
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 cursor-pointer"
              title="Hide Keys Drawer"
              aria-label="Hide Keys Drawer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
          {commonKeys.map((k) => (
            <button
              key={k.label}
              type="button"
              title={(k as any).title || k.label}
              onClick={() => onKeyPress(k.key, k.altKey, k.ctrlKey)}
              className={`h-8 px-2.5 py-1 text-[11px] font-mono font-bold rounded shadow-xs active:scale-95 transition-transform cursor-pointer text-center whitespace-nowrap flex items-center justify-center ${
                k.primary
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : k.highlight
                  ? "bg-amber-600 hover:bg-amber-500 text-white"
                  : (k as any).isEsc
                  ? "bg-red-900/90 hover:bg-red-800 text-white border border-red-700"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto bg-gray-900/90 hover:bg-gray-800 border border-l-0 border-gray-600 text-emerald-400 rounded-r-md px-1 py-2.5 shadow-lg flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-transform"
          title="Open Shortcut Keys (ENTER, ESC, Alt+B)"
          aria-label="Open Shortcut Keys"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <ChevronRight className="w-3 h-3 text-gray-300" />
        </button>
      )}
    </div>
  );
}
