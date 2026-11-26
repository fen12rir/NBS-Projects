import React from "react";
import { ClipboardList, Building2, FileText, MapPin } from "lucide-react";

interface CustomerBillingCardPreviewProps {
  customerName: string;
  tin: string;
  address: string;
  onUseDetails?: () => void;
}

export function CustomerBillingCardPreview({
  customerName,
  tin,
  address,
  onUseDetails,
}: CustomerBillingCardPreviewProps) {
  return (
    <aside
      aria-label="Customer billing details card preview"
      className="w-full max-w-[270px] rounded-md border-2 border-gray-700 bg-gray-800 p-3 shadow-2xl transition-all duration-300 select-none"
    >
      {/* Top Panel Header */}
      <div className="mb-2 flex items-center justify-between font-sans text-[10px] font-bold uppercase tracking-widest text-amber-300">
        <span>Customer TIN / Billing Slip</span>
        {onUseDetails && (
          <button
            type="button"
            onClick={onUseDetails}
            className="cursor-pointer rounded bg-emerald-600 hover:bg-emerald-500 px-2 py-0.5 text-[9px] font-mono font-bold text-white shadow-xs transition-colors flex items-center"
            title="Click to copy Customer Details into POS Transaction Comment"
          >
            <ClipboardList className="w-3 h-3 mr-1 inline-block" /> Use Details
          </button>
        )}
      </div>

      {/* TIN Card */}
      <div
        onClick={onUseDetails}
        className={`w-full rounded-lg bg-[#fffef7] border-2 border-amber-300/80 shadow-xl overflow-hidden text-gray-900 flex flex-col justify-between ${
          onUseDetails
            ? "cursor-pointer hover:ring-2 hover:ring-emerald-400 transition-all"
            : ""
        }`}
        title={
          onUseDetails
            ? "Click card to auto-fill Customer Name, TIN, and Address into POS"
            : undefined
        }
      >
        {/* Card Header Strip */}
        <div className="bg-[#1E3A8A] px-3 py-2 text-white flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider leading-tight">
                Corporate Billing Info
              </div>
              <div className="text-[8px] text-blue-200 font-mono">
                BIR Official Receipt / Invoice Request
              </div>
            </div>
          </div>
          <span className="bg-amber-400 text-blue-950 font-mono font-extrabold text-[8px] px-1.5 py-0.5 rounded uppercase">
            TIN Card
          </span>
        </div>

        {/* Customer Details Body */}
        <div className="p-3 space-y-2.5 font-mono text-xs">
          {/* Customer / Company Name */}
          <div className="bg-amber-50/70 border border-amber-200 rounded p-2">
            <div className="text-[9px] font-sans font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-blue-700 shrink-0" />
              <span>Customer / Company Name</span>
            </div>
            <div className="mt-0.5 font-mono font-black text-xs text-gray-950 tracking-tight break-words">
              {customerName}
            </div>
          </div>

          {/* TIN */}
          <div className="bg-blue-50/70 border border-blue-200 rounded p-2">
            <div className="text-[9px] font-sans font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
              <FileText className="w-3 h-3 text-blue-700 shrink-0" />
              <span>Taxpayer Identification No. (TIN)</span>
            </div>
            <div className="mt-0.5 font-mono font-black text-sm text-blue-900 tracking-wider">
              {tin}
            </div>
          </div>

          {/* Registered Address */}
          <div className="bg-gray-50 border border-gray-200 rounded p-2">
            <div className="text-[9px] font-sans font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-700 shrink-0" />
              <span>Registered Business Address</span>
            </div>
            <div className="mt-0.5 font-mono font-bold text-[11px] text-gray-900 leading-snug break-words">
              {address}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-gray-100 border-t border-dashed border-gray-300 px-3 py-1.5 text-[8.5px] font-sans text-gray-600 flex items-center justify-between">
          <span>Present to Cashier for F3 Trx Comment</span>
          <span className="font-mono font-bold text-emerald-700">Tap to Copy</span>
        </div>
      </div>

      {/* Helper Caption */}
      <div className="mt-2 text-center text-[10px] font-mono text-gray-300">
        TIN: <span className="font-bold text-yellow-300">{tin}</span>
      </div>
    </aside>
  );
}
