import React, { useState } from "react";
import { PracticalExamCase } from "@/data/practical-exam";
import { 
  User, 
  Clock, 
  AlertTriangle, 
  Banknote, 
  CreditCard, 
  QrCode, 
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Receipt,
  CheckCircle2,
  Info
} from "lucide-react";

interface CustomerPanelProps {
  currentCase: PracticalExamCase;
  caseIndex: number;
  totalCases: number;
  remainingSeconds: number | null;
  onFinishCase?: () => void;
  canFinishCase?: boolean;
  hasSuspendedTrx?: boolean;
}

export function CustomerPanel({
  currentCase,
  caseIndex,
  totalCases,
  remainingSeconds,
  hasSuspendedTrx,
}: CustomerPanelProps) {
  const [showFullQuoteMobile, setShowFullQuoteMobile] = useState(false);

  const formatTime = (secs: number | null) => {
    if (secs === null) return "--:--";
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isTimeCritical = remainingSeconds !== null && remainingSeconds < 120;

  const handedItems = currentCase.events.flatMap((ev, evIdx) =>
    (ev.hands || []).map((item, itIdx) => (
      <div
        key={`item-${evIdx}-${itIdx}`}
        className="bg-gray-800 border border-emerald-500/80 rounded px-2 py-0.5 sm:py-1 flex items-center space-x-1.5 text-gray-200 shadow-sm shrink-0 whitespace-nowrap text-[11px] sm:text-xs"
      >
        <ShoppingBag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="text-emerald-300 font-mono font-bold">
          {item.qty}×
        </span>
        <span className="font-semibold text-white max-w-[140px] sm:max-w-none truncate">{item.label}</span>
        {item.noBarcode ? (
          <span className="bg-red-900 text-red-200 text-[9px] sm:text-[10px] px-1 py-0.2 rounded font-bold flex items-center space-x-1 shrink-0">
            <AlertTriangle className="w-3 h-3 text-red-300 shrink-0" />
            <span>F2 Lookup</span>
          </span>
        ) : (
          <span className="bg-gray-700 text-yellow-300 font-mono text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded font-bold shrink-0">
            SKU: {item.sku}
          </span>
        )}
        <span className="text-green-400 font-mono font-bold text-[10px] sm:text-[11px] shrink-0">
          ₱{item.unitPrice.toFixed(2)}
        </span>
      </div>
    ))
  );

  const tenderItems = currentCase.events.flatMap((ev, evIdx) => [
    ...(currentCase.id === "case-sulit-coins" || currentCase.milestones.some((m) => m.action === "REDEEM_SULIT_COINS") ? [
      <div
        key="sulit-coins-action-pill"
        className="bg-amber-900 border border-amber-400 rounded px-2 py-0.5 sm:py-1 flex items-center space-x-1.5 text-amber-100 font-sans shadow-sm shrink-0 whitespace-nowrap text-[11px] sm:text-xs"
      >
        <span className="text-sm">🪙</span>
        <span className="font-bold text-yellow-300">Step 1:</span>
        <span className="font-semibold text-white">Redeem ₱29 Sulit Coins (F3 Bank Card)</span>
      </div>
    ] : []),

    ...(ev.tender ? [
      <div
        key={`tender-${evIdx}`}
        className="bg-blue-950 border border-blue-600 rounded px-2 py-0.5 sm:py-1 flex items-center space-x-1.5 text-blue-200 font-sans shadow-sm shrink-0 whitespace-nowrap text-[11px] sm:text-xs"
      >
        <Banknote className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
        <span className="font-bold text-white">
          {currentCase.id === "case-sulit-coins" ? "Step 2 Cash:" : "Tender:"}
        </span>
        <span className="text-yellow-300 font-bold">
          {ev.tender.kind === "CASH"
            ? `₱${ev.tender.amount?.toFixed(2) || "Exact"} Cash`
            : ev.tender.kind}
        </span>
        {currentCase.id === "case-sulit-coins" && (
          <span className="text-emerald-300 font-bold text-[10px] shrink-0">
            (Change: ₱109.00)
          </span>
        )}
        {ev.tender.reference && (
          <span className="text-gray-300 font-mono text-[9px] sm:text-[10px] shrink-0">
            Ref: {ev.tender.reference}
          </span>
        )}
        {ev.tender.slipAuth && (
          <span className="text-emerald-300 font-mono text-[9px] sm:text-[10px] shrink-0">
            Auth: {ev.tender.slipAuth}
          </span>
        )}
        {ev.tender.slipInvoice && (
          <span className="text-cyan-300 font-mono text-[9px] sm:text-[10px] shrink-0">
            Slip #: {ev.tender.slipInvoice}
          </span>
        )}
      </div>
    ] : []),

    ...(ev.shows ? [
      <div
        key={`shows-${evIdx}`}
        className="bg-amber-950 border border-amber-600 rounded px-2 py-0.5 sm:py-1 flex items-center space-x-1.5 text-amber-200 font-sans shadow-sm shrink-0 whitespace-nowrap text-[11px] sm:text-xs"
      >
        {ev.shows === "LNQR_QR" ? (
          <QrCode className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
        ) : (
          <CreditCard className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
        )}
        <span className="font-bold text-yellow-300">Presents:</span>
        <span className="font-medium text-white">
          {ev.shows === "LNC_CARD"
            ? "LNC Card"
            : ev.shows === "LNQR_QR"
            ? "LNQR Barcode"
            : ev.shows === "PWD_ID"
            ? "PWD ID"
            : ev.shows === "SENIOR_ID"
            ? "Senior ID"
            : ev.shows === "TIN_INFO"
            ? "TIN Info"
            : "Receipt"}
        </span>
      </div>
    ] : []),
  ]);

  return (
    <div className="w-full bg-[#1F2937] text-white border-b-2 border-yellow-500 shadow-md select-none">
      {/* Top Banner: Customer Identity & Exam Timer */}
      <div className="max-w-[1080px] mx-auto px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-yellow-400 text-gray-900 flex items-center justify-center font-bold shadow-inner shrink-0">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 shrink-0" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5 sm:space-x-2 truncate">
              <span className="font-extrabold text-xs sm:text-base text-yellow-300 truncate">
                {currentCase.customerName}
              </span>
              <span className="text-[9px] sm:text-[11px] bg-gray-700 text-gray-300 px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full font-mono shrink-0">
                #{caseIndex + 1}/{totalCases}
              </span>
            </div>

            {/* Quote: Collapsible on mobile to save vertical space */}
            <div className="text-[11px] sm:text-xs text-gray-300 italic flex items-center space-x-1">
              <p className={`truncate sm:line-clamp-2 ${showFullQuoteMobile ? "whitespace-normal line-clamp-none" : ""}`}>
                &ldquo;
                {currentCase.id === "case-suspend-recall" && hasSuspendedTrx
                  ? "I'm back with the eraser! Please recall my transaction: Press F5 (2nd Screen) -> F9 (Recall) -> Select and Confirm Transaction."
                  : currentCase.customerQuote}
                &rdquo;
              </p>
              {currentCase.customerQuote.length > 50 && (
                <button
                  type="button"
                  onClick={() => setShowFullQuoteMobile((prev) => !prev)}
                  className="sm:hidden text-yellow-400 hover:text-yellow-300 shrink-0 ml-1 text-[10px] font-bold underline"
                >
                  {showFullQuoteMobile ? "Less" : "More"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls & Timer */}
        <div className="flex items-center space-x-2 shrink-0">
          <div
            className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded font-mono text-[11px] sm:text-xs font-bold ${
              isTimeCritical
                ? "bg-red-700 text-white animate-pulse"
                : "bg-gray-800 text-yellow-400 border border-gray-600"
            }`}
          >
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 shrink-0" />
            <span>{formatTime(remainingSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Customer Action Items / Handed Items Tray */}
      <div className="bg-[#111827] border-t border-gray-700 py-1.5 px-2.5 sm:px-4 text-xs font-sans">
        <div className="max-w-[1080px] mx-auto flex items-center space-x-3 overflow-x-auto scrollbar-none py-0.5">
          {currentCase.id === "case-suspend-recall" && hasSuspendedTrx ? (
            <div className="bg-amber-950/90 border border-amber-500 rounded px-2.5 py-0.5 sm:py-1 flex items-center space-x-1.5 text-amber-200 font-sans shadow-sm shrink-0 whitespace-nowrap text-[11px] sm:text-xs animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-bold text-white">Customer Returned:</span>
              <span>Press F5 (2nd Screen) &rarr; F9 (Recall) &rarr; Select transaction &amp; Confirm.</span>
            </div>
          ) : handedItems.length > 0 ? (
            <div className="flex items-center space-x-3 shrink-0">
              {/* 1. Items to Scan */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <span className="bg-emerald-900/90 text-emerald-200 border border-emerald-600 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                  Scan Items:
                </span>
                <div className="flex items-center space-x-1.5">{handedItems}</div>
              </div>

              {/* 2. Payment Method */}
              {tenderItems.length > 0 && (
                <div className="flex items-center space-x-1.5 shrink-0 pl-2 border-l border-gray-700">
                  <span className="bg-blue-900/90 text-blue-200 border border-blue-600 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                    Tender at F4:
                  </span>
                  <div className="flex items-center space-x-1.5">{tenderItems}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-emerald-950/80 border border-emerald-600 rounded px-2.5 py-0.5 sm:py-1 flex items-center space-x-1.5 text-emerald-200 font-sans shadow-sm shrink-0 whitespace-nowrap text-[11px] sm:text-xs">
              <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-bold text-white">Cashier Briefing:</span>
              <span>
                {currentCase.events[0]?.say || currentCase.events[0]?.note || "Verify terminal date/time and sign in."}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
