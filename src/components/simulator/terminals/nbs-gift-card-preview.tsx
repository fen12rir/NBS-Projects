import React from "react";
import { ClipboardList } from "lucide-react";

interface NbsGiftCardPreviewProps {
  isExternalReceiptShowing: boolean;
  voucherCode: string;
  onUseCode?: () => void;
}

export function NbsGiftCardPreview({
  voucherCode,
  onUseCode,
}: NbsGiftCardPreviewProps) {
  return (
    <aside
      aria-label="NBS Gift Card preview"
      className="w-full max-w-[260px] rounded-md border-2 border-gray-700 bg-gray-800 p-3 shadow-2xl transition-all duration-300 select-none"
    >
      {/* Top Panel Header */}
      <div className="mb-2 flex items-center justify-between font-sans text-[10px] font-bold uppercase tracking-widest text-gray-300">
        <span>NBS Gift Card</span>
        {onUseCode && (
          <button
            type="button"
            onClick={onUseCode}
            className="cursor-pointer rounded bg-[#E4002B] hover:bg-red-600 px-2 py-0.5 text-[9px] font-mono font-bold text-white shadow-xs transition-colors flex items-center"
            title="Click to copy Voucher Code into POS"
          >
            <ClipboardList className="w-3 h-3 mr-1 inline-block" /> Use Code
          </button>
        )}
      </div>

      {/* Physical NBS Gift Card Back */}
      <div
        onClick={onUseCode}
        className={`w-full rounded-xl bg-[#C8102E] border border-red-400/40 shadow-xl overflow-hidden text-white flex flex-col justify-between ${
          onUseCode ? "cursor-pointer hover:ring-2 hover:ring-yellow-300 transition-all" : ""
        }`}
        title={onUseCode ? "Click card to fill Voucher Code into POS" : undefined}
      >
        {/* Top Red Lip + Black Magnetic Stripe */}
        <div className="pt-2.5">
          <div className="h-6 w-full bg-neutral-950 shadow-inner" />
        </div>

        {/* Terms & Conditions Fine Print */}
        <div className="px-3 py-2 space-y-1.5 text-[6.5px] leading-[1.25] font-sans font-semibold tracking-wide uppercase text-white/95">
          <p>
            THIS GIFT CARD MAY BE USED FOR PAYMENT BY THE BEARER FOR ITEMS OR SERVICES AT ANY NBS RETAIL GROUP ESTABLISHMENT.
          </p>
          <div>
            <p className="mb-0.5">
              BY USING THIS CARD, BEARER AGREES TO BE BOUND BY THE FOLLOWING TERMS:
            </p>
            <ul className="space-y-0.5 pl-1">
              <li>• THIS GIFT CARD MAY BE USED FOR MULTIPLE TRANSACTIONS, BUT IS NOT CONVERTIBLE TO CASH.</li>
              <li>• THIS GIFT CARD MAY BE RELOADED AT ANY NBS RETAIL GROUP ESTABLISHMENT, WITH AMOUNTS RANGING FROM P100 TO P10,000.</li>
              <li>• NBS RETAIL GROUP WILL NOT BE LIABLE FOR ANY LOST OR STOLEN GIFT CARDS.</li>
              <li>• VISIT NATIONALBOOKSTORE.COM/GIFTCARD FOR THE COMPLETE TERMS AND CONDITIONS.</li>
            </ul>
          </div>
        </div>

        {/* Bottom Logo & Voucher Code Row */}
        <div className="px-3 pb-2.5 pt-1 flex items-end justify-between gap-2">
          <div className="leading-none">
            <div className="font-serif italic font-black text-lg tracking-tight text-white flex items-start">
              <span>National</span>
              <span className="text-[7px] not-italic font-sans ml-0.5 mt-0.5">®</span>
            </div>
            <div className="text-[6px] font-sans font-extrabold tracking-[0.22em] uppercase text-white/95 pl-3 -mt-0.5">
              BOOK STORE
            </div>
          </div>

          <div className="bg-black/20 border border-white/30 rounded px-1.5 py-0.5">
            <span className="font-mono font-black text-xs tracking-wider text-white drop-shadow">
              {voucherCode}
            </span>
          </div>
        </div>
      </div>

      {/* Helper Caption */}
      <div className="mt-2 text-center text-[10px] font-mono text-gray-300">
        Voucher Code: <span className="font-bold text-yellow-300">{voucherCode}</span>
      </div>
    </aside>
  );
}
