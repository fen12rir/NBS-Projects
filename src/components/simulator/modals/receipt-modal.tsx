"use client";

import React from "react";
import { POSTransactionState, calculateTotals } from "@/lib/simulator/pos-state-machine";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ReceiptModalProps {
  state: POSTransactionState;
  isReprint?: boolean;
  onClose: () => void;
  onReset: () => void;
}

export function ReceiptModal({ state, isReprint = false, onClose, onReset }: ReceiptModalProps) {
  const discountPercent = state.appliedDiscount?.percent || 0;
  const totals = calculateTotals(state.lineItems, discountPercent, state.isZeroRated);
  const discountAmount = totals.discountAmount;
  const netTotal = totals.totalAmount;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white max-w-sm w-full p-6 space-y-3.5 font-mono text-xs border-2 border-gray-900 shadow-2xl animate-in fade-in zoom-in-95 pointer-events-auto max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="text-center space-y-1 border-b border-dashed border-gray-400 pb-3">
            <div className="font-bold text-sm tracking-widest text-[#E4002B]">
              NATIONAL BOOK STORE
            </div>
            <div className="text-[11px] text-gray-600">
              Grand Central Branch • {state.branchCode}
            </div>
            <div className="text-[10px] text-gray-500">
              TRAINING TERMINAL: {state.terminalId}
            </div>

            {isReprint ? (
              <div className="bg-amber-100 text-amber-900 text-[10px] font-extrabold py-0.5 mt-1 uppercase border border-amber-300">
                *** REPRINT - AUDIT COPY ***
              </div>
            ) : (
              <div className="bg-red-100 text-red-800 text-[9px] font-bold py-0.5 mt-1 uppercase">
                *** TRAINING RECEIPT - NON-FISCAL ***
              </div>
            )}
          </div>

          {/* Transaction Metadata */}
          <div className="text-[10px] space-y-0.5 border-b border-dashed border-gray-400 pb-2">
            <div className="flex justify-between">
              <span>OR NUMBER:</span>
              <span className="font-bold">{state.transactionNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>DATE / TIME:</span>
              <span>{state.dateStr} {state.timeStr}</span>
            </div>
            <div className="flex justify-between">
              <span>CASHIER:</span>
              <span>{state.cashierName} (241209)</span>
            </div>
          </div>

          {/* Corporate / Customer Billing info if present */}
          {state.transactionComments && (
            <div className="text-[10px] bg-gray-50 border border-gray-300 p-1.5 space-y-0.5">
              <div className="font-bold text-gray-700">BUYER INFO:</div>
              <div>BUYER&apos;S NAME : {state.transactionComments.customerName.toUpperCase()}</div>
              <div>ADDRESS      : {state.transactionComments.address.toUpperCase()}</div>
              <div>TIN          : {state.transactionComments.tin}</div>
              {state.transactionComments.remarks && <div>REMARKS      : {state.transactionComments.remarks.toUpperCase()}</div>}
            </div>
          )}

          {/* Item Rows */}
          <div className="space-y-1.5 border-b border-dashed border-gray-400 pb-3">
            {state.lineItems.map((item) => {
              const isVoid = item.isVoided || item.quantity < 0;
              const displayQty = isVoid ? -Math.abs(item.quantity) : item.quantity;
              const displayTotal = isVoid ? -Math.abs(item.total) : item.total;
              return (
                <div key={item.id} className="space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span className={`truncate max-w-[200px] ${isVoid ? "line-through text-red-600" : ""}`}>
                      {item.description}
                    </span>
                    <span className={isVoid ? "text-red-600 font-bold" : ""}>
                      {formatCurrency(displayTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>
                      {displayQty} x @{formatCurrency(item.unitPrice)}
                      {state.isZeroRated ? " [VE]" : " [VT]"}
                    </span>
                    <span className="font-bold text-red-600">{isVoid ? "VOIDED" : ""}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals & Discounts */}
          <div className="space-y-1 text-[11px] border-b border-dashed border-gray-400 pb-3">
            <div className="flex justify-between font-bold">
              <span>SUBTOTAL:</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>

            {state.appliedDiscount && (
              <div className="flex justify-between text-emerald-700 font-semibold text-[10px]">
                <span>DISCOUNT ({state.appliedDiscount.name}):</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            {state.isZeroRated && (
              <div className="flex justify-between text-blue-700 font-semibold text-[10px]">
                <span>ZERO-RATED (LESS 12% VAT):</span>
                <span>EXEMPT</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-sm text-[#E4002B] pt-0.5 border-t border-dotted border-gray-300">
              <span>TOTAL SALES:</span>
              <span>{formatCurrency(netTotal)}</span>
            </div>

            <div className="flex justify-between text-gray-600 text-[10px]">
              <span>TENDER ({state.selectedPaymentMethod || "CASH"}):</span>
              <span>{formatCurrency(state.tenderAmount || netTotal)}</span>
            </div>

            <div className="flex justify-between font-bold text-emerald-700">
              <span>CHANGE DUE:</span>
              <span>{formatCurrency(state.changeDue || 0)}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[10px] text-gray-400 space-y-1">
            <div>Thank you for shopping at National Book Store!</div>
            <div>Laking National: Read More, Learn More</div>
            <div className="text-[9px] text-red-600 font-bold uppercase">
              *** NO LIVE REVENUE GENERATED ***
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col space-y-2">
            <Button
              onClick={onClose}
              size="sm"
              className="w-full font-bold bg-[#E4002B] hover:bg-[#C10024] text-xs uppercase cursor-pointer"
            >
              {isReprint ? "Close Reprint Preview (ESC)" : "Close Receipt"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
