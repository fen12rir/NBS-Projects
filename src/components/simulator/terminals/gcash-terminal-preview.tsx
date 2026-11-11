import React from "react";

interface GcashTerminalPreviewProps {
  isExternalReceiptShowing: boolean;
  referenceNumber: string;
}

export function GcashTerminalPreview({
  isExternalReceiptShowing,
  referenceNumber,
}: GcashTerminalPreviewProps) {
  return (
    <aside
      aria-label="GCash payment terminal"
      className="w-full max-w-[260px] border-2 border-gray-600 bg-gray-900 p-4 shadow-xl transition-all duration-300 rounded-md"
    >
      <div className="mb-4 border-b border-gray-600 pb-2 text-center font-bold text-blue-400 text-lg tracking-wide">
        GCASH
      </div>
      <div className="min-h-[180px] space-y-3 text-center text-sm text-white">
        <div>GCash reference number</div>
        <div className="font-mono text-lg font-bold">
          {referenceNumber}
        </div>
      </div>
    </aside>
  );
}
