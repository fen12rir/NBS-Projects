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
      className={`w-full max-w-[240px] border-2 border-gray-600 bg-gray-900 p-4 shadow-xl z-40 transition-all duration-500 ease-in-out animate-in fade-in duration-300 xl:absolute xl:left-[calc(50%+540px+16px)] xl:top-1/2 xl:-translate-y-1/2 ${
        isExternalReceiptShowing ? "xl:-translate-x-32" : "xl:translate-x-0"
      } max-xl:fixed max-xl:right-4 max-xl:top-24 max-xl:max-h-[85vh] max-xl:overflow-y-auto`}
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
