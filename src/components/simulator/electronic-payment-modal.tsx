"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";

export type CardTenderType =
  | "Credit Card"
  | "Debit Card / BancNet"
  | "GCash / QR PH"
  | "LNQR Sulit Coins"
  | "LNQR E-GC"
  | "NBS Gift Card"
  | "Gift Certificate Series"
  | "Promo Coupon";

interface ElectronicPaymentModalProps {
  initialType?: CardTenderType;
  totalDue: number;
  onConfirmPayment: (data: {
    tenderType: CardTenderType;
    reference: string;
    amount: number;
  }) => void;
  onCancel: () => void;
}

export function ElectronicPaymentModal({
  initialType = "Credit Card",
  totalDue,
  onConfirmPayment,
  onCancel,
}: ElectronicPaymentModalProps) {
  const [tenderType, setTenderType] = useState<CardTenderType>(initialType);
  const [cardNumber, setCardNumber] = useState("************4012");
  const [approvalCode, setApprovalCode] = useState("847291");
  const [gcashRef, setGcashRef] = useState("100293847561");
  const [voucherSerial, setVoucherSerial] = useState("GC-2026-88410");
  const [tenderAmount, setTenderAmount] = useState(totalDue.toFixed(2));
  const [coinsRedeem, setCoinsRedeem] = useState(Math.min(totalDue, 150).toFixed(2));

  useEffect(() => {
    setTenderAmount(totalDue.toFixed(2));
    setCoinsRedeem(Math.min(totalDue, 150).toFixed(2));
  }, [totalDue]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let reference = "";
    let amt = parseFloat(tenderAmount) || totalDue;

    if (tenderType === "Credit Card" || tenderType === "Debit Card / BancNet") {
      reference = `Card: ${cardNumber.slice(-4)} | Appr: ${approvalCode}`;
    } else if (tenderType === "GCash / QR PH") {
      reference = `GCash Ref: ${gcashRef}`;
    } else if (tenderType === "LNQR Sulit Coins") {
      amt = parseFloat(coinsRedeem) || 0;
      reference = `Sulit Coins: ${coinsRedeem}`;
    } else {
      reference = `Serial: ${voucherSerial}`;
    }

    onConfirmPayment({
      tenderType,
      reference,
      amount: amt,
    });
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
        <form
          onSubmit={handleSubmit}
          className="w-[460px] bg-[#D4D0C8] border-4 border-[#2563EB] shadow-2xl font-sans pointer-events-auto"
        >
          {/* Authentic Blue Title Bar matching frame_3_36s.jpg */}
          <div className="bg-[#2563EB] text-white py-1.5 px-3 text-center font-bold text-sm uppercase tracking-wide">
            Card Payment Details
          </div>

          <div className="p-5 space-y-4 text-gray-900">
            <div className="space-y-3">
              {/* Select Card Type */}
              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-xs font-bold text-gray-800 text-right">
                  Please Select Card Type:
                </label>
                <select
                  value={tenderType}
                  onChange={(e) => setTenderType(e.target.value as CardTenderType)}
                  className="col-span-2 bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card / BancNet">Debit Card / BancNet</option>
                  <option value="GCash / QR PH">GCash / QR PH E-Wallet</option>
                  <option value="LNQR Sulit Coins">LNQR Sulit Coins Redemption</option>
                  <option value="LNQR E-GC">LNQR E-GC Voucher</option>
                  <option value="NBS Gift Card">NBS Gift Card</option>
                  <option value="Gift Certificate Series">Paper Gift Certificate Series</option>
                  <option value="Promo Coupon">Promo Coupon / Voucher</option>
                </select>
              </div>

              {/* Dynamic Tender Fields */}
              {(tenderType === "Credit Card" || tenderType === "Debit Card / BancNet") && (
                <>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-xs font-bold text-gray-800 text-right">
                      Swipe Card / Number:
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                      placeholder="Swipe card or enter digits..."
                      className="col-span-2 bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      autoFocus
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-xs font-bold text-gray-800 text-right">
                      Approval Code:
                    </label>
                    <input
                      type="text"
                      value={approvalCode}
                      onChange={(e) => setApprovalCode(e.target.value)}
                      required
                      className="col-span-2 bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </>
              )}

              {tenderType === "GCash / QR PH" && (
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-xs font-bold text-gray-800 text-right">
                    12-Digit Reference No:
                  </label>
                  <input
                    type="text"
                    value={gcashRef}
                    onChange={(e) => setGcashRef(e.target.value)}
                    required
                    maxLength={16}
                    className="col-span-2 bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    autoFocus
                  />
                </div>
              )}

              {tenderType === "LNQR Sulit Coins" && (
                <>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="text-xs font-bold text-gray-800 text-right">Available Coins:</span>
                    <span className="col-span-2 text-xs font-bold text-emerald-700 font-mono">
                      150.00 Coins (₱150.00 PHP)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-xs font-bold text-gray-800 text-right">
                      Redeem Amount:
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      max={150}
                      value={coinsRedeem}
                      onChange={(e) => setCoinsRedeem(e.target.value)}
                      required
                      className="col-span-2 bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      autoFocus
                    />
                  </div>
                </>
              )}

              {(tenderType === "NBS Gift Card" ||
                tenderType === "LNQR E-GC" ||
                tenderType === "Gift Certificate Series" ||
                tenderType === "Promo Coupon") && (
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-xs font-bold text-gray-800 text-right">
                    Series / Voucher No:
                  </label>
                  <input
                    type="text"
                    value={voucherSerial}
                    onChange={(e) => setVoucherSerial(e.target.value)}
                    required
                    className="col-span-2 bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    autoFocus
                  />
                </div>
              )}

              {/* Amount Handed / Due */}
              <div className="grid grid-cols-3 items-center gap-2 pt-1 border-t border-gray-300">
                <label className="text-xs font-bold text-gray-800 text-right">Amount Due (PHP):</label>
                <input
                  type="number"
                  step="0.01"
                  value={tenderAmount}
                  onChange={(e) => setTenderAmount(e.target.value)}
                  className="col-span-2 bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="bg-amber-50 border border-amber-300 p-1.5 text-center text-xs font-bold text-red-600">
              Please press <kbd className="bg-white border px-1 text-black">Alt+Enter</kbd> to continue, otherwise <kbd className="bg-white border px-1 text-black">ESC</kbd>.
            </div>

            {/* Bottom Buttons and Timestamp */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono text-gray-600">{timeStr}</span>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-1.5 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 font-bold text-xs hover:bg-[#E2E0DC] cursor-pointer"
                >
                  Cancel (ESC)
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2563EB] text-white font-bold text-xs border-2 border-blue-800 hover:bg-blue-700 cursor-pointer shadow"
                >
                  Ok (Enter)
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
