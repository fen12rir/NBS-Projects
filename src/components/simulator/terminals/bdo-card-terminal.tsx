import React from "react";

interface BdoCardTerminalProps {
  isExternalReceiptShowing: boolean;
  invoiceNumber: string;
  authCode: string;
  generatedAt: Date | null;
  totalAmount: number;
}

export function BdoCardTerminal({
  isExternalReceiptShowing,
  invoiceNumber,
  authCode,
  generatedAt,
  totalAmount,
}: BdoCardTerminalProps) {
  const dateObj = generatedAt || new Date();

  return (
    <aside
      aria-label="External card terminal receipt preview"
      className={`w-full max-w-[240px] rounded-md border-2 border-gray-700 bg-gray-800 p-3 shadow-2xl z-40 transition-all duration-500 ease-in-out animate-in fade-in duration-300 xl:absolute xl:left-[calc(50%+540px+16px)] xl:top-1/2 xl:-translate-y-1/2 ${
        isExternalReceiptShowing ? "xl:-translate-x-32" : "xl:translate-x-0"
      } max-xl:fixed max-xl:right-4 max-xl:top-24 max-xl:max-h-[85vh] max-xl:overflow-y-auto`}
    >
      <div className="mb-2 text-center font-sans text-[10px] font-bold uppercase tracking-widest text-gray-300">
        Card Terminal
      </div>
      <div className="mx-auto min-h-[380px] w-full max-w-[190px] bg-[#fffef8] px-3 py-5 font-mono text-[9px] leading-tight text-gray-900 shadow-md">
        <header className="mb-4 text-center">
          <div className="mb-2 text-3xl font-black tracking-tight">BDO</div>
          <div>NATIONAL BOOK STORE</div>
          <div>OWNED &amp; OPERATED BY:</div>
          <div>ABACUS BOOK &amp; CARD CORPORATION</div>
          <div>QUAD ALPHA CENTRUM 125 PIONEER ST.</div>
          <div>HIGHWAY HILLS 1550 MANDALUYONG CITY</div>
          <div>VAT Registered TIN: 000-299-299-00000</div>
          <div>MIN : 140355124</div>
          <div>TERMINAL: 00000000</div>
        </header>

        <div className="space-y-1">
          <div className="text-center text-[12px] font-bold tracking-widest">
            INVOICE: {invoiceNumber}
          </div>
          <div className="flex justify-between gap-2">
            <span>
              {dateObj.toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              })}
            </span>
            <span>{dateObj.toLocaleTimeString("en-US", { hour12: false })}</span>
          </div>
        </div>

        <div className="my-3 border-t border-dashed border-gray-500" />
        <div className="text-center font-bold tracking-widest">CARD SALE</div>
        <div className="mt-2 space-y-1">
          <div>CARD: ************</div>
          <div>CARD TYPE: CREDIT</div>
          <div className="font-bold text-[12px]">
            APPROVAL CODE: {authCode}
          </div>
        </div>

        <div className="my-3 border-t border-dashed border-gray-500" />
        <div className="flex justify-between gap-2 text-[12px] font-bold">
          <span>AMOUNT:</span>
          <span>
            PHP{" "}
            {totalAmount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <footer className="mt-5 space-y-1 text-center">
          <div>PLEASE KEEP THIS COPY</div>
          <div className="mt-3 font-bold">*** MERCHANT COPY ***</div>
          <div className="mt-3 text-[8px]">THANK YOU</div>
        </footer>
      </div>
    </aside>
  );
}
