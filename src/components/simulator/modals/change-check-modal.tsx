import React, { useState } from "react";
import { Banknote, CheckCircle2 } from "lucide-react";
import { useLockBodyScroll } from "@/lib/use-lock-body-scroll";

interface ChangeCheckModalProps {
  isOpen: boolean;
  expectedTenderAmount?: number;
  totalSales: number;
  sulitCoinsRedeemed?: number;
  onConfirmChange: (changeAmount: number) => void;
}

export function ChangeCheckModal({
  isOpen,
  totalSales,
  sulitCoinsRedeemed = 0,
  onConfirmChange,
}: ChangeCheckModalProps) {
  const [inputVal, setInputVal] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  const netDue = Math.max(0, totalSales - sulitCoinsRedeemed);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputVal.trim());
    if (isNaN(val) || val < 0) {
      setErrorMsg("Please enter a valid change amount.");
      return;
    }
    setErrorMsg(null);
    onConfirmChange(val);
    setInputVal("");
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overscroll-none touch-none">
      {/* POS Silver Beveled Chassis */}
      <div className="bg-[#D4D0C8] border-4 border-[#7A8A99] p-4 sm:p-5 shadow-2xl max-w-sm w-full max-h-[90dvh] overflow-y-auto font-sans text-gray-900 select-none animate-in fade-in zoom-in-95 duration-200 border-t-white border-l-white border-r-[#404040] border-b-[#404040]">
        {/* POS Green Header Bar */}
        <div className="bg-[#006633] text-white px-3 py-1.5 font-bold text-xs sm:text-sm mb-3 flex items-center justify-between border-b-2 border-[#004D26] shadow-xs">
          <div className="flex items-center space-x-1.5">
            <Banknote className="w-4 h-4 text-emerald-200 shrink-0" />
            <span className="uppercase tracking-wide">Cashier Verification: Change Due</span>
          </div>
          <span className="font-mono text-[10px] bg-green-900/90 text-green-200 px-1.5 py-0.5 rounded border border-green-700">
            CHECKPOINT
          </span>
        </div>

        {/* Total Sales Display Inset */}
        <div className="bg-[#002400] text-[#00FF66] font-mono font-bold px-3 py-1.5 text-center text-sm border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white my-2.5 space-y-1">
          {sulitCoinsRedeemed > 0 && (
            <div className="flex items-center justify-between text-xs text-green-300 font-sans border-b border-green-800 pb-1">
              <span>Gross Total: ₱{totalSales.toFixed(2)}</span>
              <span>Coins: -₱{sulitCoinsRedeemed.toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-green-400 uppercase tracking-wider font-sans font-semibold">
              {sulitCoinsRedeemed > 0 ? "Net Amount Due:" : "Total Amount Due:"}
            </span>
            <span className="text-base text-[#00FF66]">₱{netDue.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-800 mb-2 leading-relaxed font-medium">
          Customer handed cash for this purchase. Enter the exact change you are counting and handing back to the customer:
        </p>

        {errorMsg && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 text-xs font-bold text-center mb-2">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold font-mono text-gray-800">₱</span>
            <input
              type="number"
              step="0.01"
              autoFocus
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-3 py-1.5 text-xl font-mono font-black text-center text-gray-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#006633]"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            {/* POS Green Beveled Action Button */}
            <button
              type="submit"
              className="w-full bg-[#006633] hover:bg-[#005229] active:bg-[#003D1E] text-white px-4 py-2 text-xs font-black uppercase tracking-wider shadow-md border-2 border-t-[#34D399] border-l-[#34D399] border-r-[#064E3B] border-b-[#064E3B] flex items-center justify-center space-x-1.5 cursor-pointer active:scale-[0.99] transition-transform"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
              <span>Hand Change &amp; Finish Receipt [Enter]</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
