import React from "react";

interface MayaTerminalReceiptProps {
  isExternalReceiptShowing: boolean;
  traceNumber: string;
  referenceNumber: string;
  generatedAt: Date | null;
  totalAmount: number;
}

export function MayaTerminalReceipt({
  isExternalReceiptShowing,
  traceNumber,
  referenceNumber,
  generatedAt,
  totalAmount,
}: MayaTerminalReceiptProps) {
  const dateObj = generatedAt || new Date();
  const formattedDateTime = dateObj
    .toISOString()
    .replace("T", " ")
    .substring(0, 19)
    .replace(/-/g, "/");

  return (
    <aside
      aria-label="Maya terminal receipt preview"
      className={`w-full max-w-[260px] rounded-md border-2 border-gray-700 bg-gray-800 p-3 shadow-2xl z-40 transition-all duration-500 ease-in-out animate-in fade-in duration-300 xl:absolute xl:left-[calc(50%+540px+16px)] xl:top-1/2 xl:-translate-y-1/2 ${
        isExternalReceiptShowing ? "xl:-translate-x-32" : "xl:translate-x-0"
      } max-xl:fixed max-xl:right-4 max-xl:top-24 max-xl:max-h-[85vh] max-xl:overflow-y-auto`}
    >
      <div className="mb-2 text-center font-sans text-[10px] font-bold uppercase tracking-widest text-[#00D632]">
        Maya Terminal Receipt
      </div>
      <div className="mx-auto min-h-[440px] w-full max-w-[215px] bg-[#fffef8] px-3.5 py-4 font-mono text-[9px] leading-tight text-gray-900 shadow-md border-t-2 border-b-2 border-dashed border-gray-300">
        {/* Maya Logo Header */}
        <div className="mb-2 text-center">
          <div className="text-2xl font-black uppercase tracking-tight text-black flex items-center justify-center">
            <span>MAYA</span>
          </div>
        </div>

        {/* Merchant Information */}
        <header className="mb-3 text-center text-[8px] leading-snug text-gray-700">
          <div className="font-bold text-gray-900 text-[9px]">NATIONAL BOOK STORE</div>
          <div>OWNED &amp; OPERATED BY:</div>
          <div>ABACUS BOOK &amp; CARD CORPORATION</div>
          <div>QUAD ALPHA CENTRUM 125 PIONEER ST.</div>
          <div>HIGHWAY HILLS 1550 MANDALUYONG CITY</div>
          <div>VAT Registered TIN: 000-299-299-00000</div>
        </header>

        <div className="my-2 border-t border-dashed border-gray-400" />

        {/* Terminal Transaction Metadata */}
        <div className="space-y-1 text-[8.5px]">
          <div className="flex justify-between">
            <span className="text-gray-600">MERCHANT ID:</span>
            <span className="font-semibold">893017263541880</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">TERMINAL ID:</span>
            <span className="font-semibold">00000374</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">PAYMENT CHANNEL:</span>
            <span className="font-semibold">Maya QR</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">TRANSACTION TYPE:</span>
            <span className="font-semibold">SALE</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">BATCH NO:</span>
            <span className="font-semibold">00000004</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">TRACE NO:</span>
            <span className="font-semibold">{traceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">REFERENCE NO:</span>
            <span className="font-mono text-[8px]">{referenceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">TRANSACTION NO:</span>
            <span className="font-mono text-[8px]">0DF895FA7DE5</span>
          </div>
          <div className="flex justify-between pt-0.5">
            <span className="text-gray-600">DATE/TIME:</span>
            <span className="font-mono text-[8px]">{formattedDateTime}</span>
          </div>
        </div>

        {/* Approved Status Line */}
        <div className="my-2.5 border-t border-dashed border-gray-400" />
        <div className="text-center font-bold tracking-widest text-[11px] text-gray-900">
          - - - APPROVED - - -
        </div>
        <div className="my-2.5 border-t border-dashed border-gray-400" />

        {/* Sale Amount */}
        <div className="flex justify-between items-center text-[11px] font-bold py-1">
          <span>SALE AMOUNT:</span>
          <span className="text-[12px]">
            PHP{" "}
            {totalAmount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        {/* Simulated Barcode */}
        <div className="my-3 text-center">
          <div className="flex justify-center items-end h-8 gap-[1.5px] px-2 overflow-hidden opacity-85">
            {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 2, 4, 1, 2].map(
              (w, idx) => (
                <div
                  key={idx}
                  className="bg-black h-full"
                  style={{ width: `${w}px` }}
                />
              )
            )}
          </div>
          <div className="text-[8px] tracking-widest mt-1 text-gray-600">50c252</div>
        </div>

        {/* Signature Line */}
        <div className="mt-3 text-left">
          <div className="text-[8px] text-gray-600">SIGNATURE</div>
          <div className="mt-4 border-b border-gray-800" />
        </div>

        {/* Footer */}
        <footer className="mt-3 space-y-0.5 text-center text-[7.5px] text-gray-600">
          <div>FOR MERCHANT USE ONLY</div>
          <div className="font-bold text-gray-800">- - - MERCHANT COPY - - -</div>
          <div className="pt-1 text-[7px] text-gray-500">
            OS: 3.0.4 | MODEL: P2-PAYMAYA APP: 1.3.0_20220128
          </div>
        </footer>
      </div>
    </aside>
  );
}
