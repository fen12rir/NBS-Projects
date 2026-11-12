import React from "react";
import { ClipboardList } from "lucide-react";

interface GcashTerminalPreviewProps {
  isExternalReceiptShowing: boolean;
  referenceNumber: string;
  onUseRef?: () => void;
}

export function GcashTerminalPreview({
  isExternalReceiptShowing,
  referenceNumber,
  onUseRef,
}: GcashTerminalPreviewProps) {
  return (
    <aside
      aria-label="GCash payment terminal"
      className="w-full max-w-[260px] border-2 border-gray-600 bg-gray-900 p-4 shadow-xl transition-all duration-300 rounded-md"
    >
      <div className="mb-4 flex items-center justify-between border-b border-gray-600 pb-2">
        <span className="font-bold text-blue-400 text-lg tracking-wide">GCASH</span>
        {onUseRef && (
          <button
            type="button"
            onClick={onUseRef}
            className="cursor-pointer rounded bg-blue-600 hover:bg-blue-500 px-2 py-0.5 text-[9px] font-mono font-bold text-white shadow-xs transition-colors flex items-center"
            title="Click to copy GCash Ref into POS"
          >
            <ClipboardList className="w-3 h-3 mr-1 inline-block" /> Use Ref
          </button>
        )}
      </div>
      <div
        onClick={onUseRef}
        className={`min-h-[180px] space-y-3 text-center text-sm text-white ${
          onUseRef ? "cursor-pointer hover:bg-gray-800/60 p-2 rounded transition-colors" : ""
        }`}
        title={onUseRef ? "Click to copy Reference Number to POS" : undefined}
      >
        <div className="text-gray-300">GCash reference number</div>
        <div className="font-mono text-lg font-bold text-emerald-300">
          {referenceNumber}
        </div>
      </div>
    </aside>
  );
}
