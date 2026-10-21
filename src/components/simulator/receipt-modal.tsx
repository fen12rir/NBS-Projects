"use client";

import React from "react";
import { POSTransactionState, calculateTotals } from "@/lib/simulator/pos-state-machine";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Printer, RotateCcw } from "lucide-react";

interface ReceiptModalProps {
  state: POSTransactionState;
  onClose: () => void;
  onReset: () => void;
}

export function ReceiptModal({ state, onClose, onReset }: ReceiptModalProps) {
  const totals = calculateTotals(state.lineItems);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white max-w-sm w-full p-6 space-y-4 font-mono text-xs border-2 border-gray-900 shadow-2xl animate-in fade-in zoom-in-95 pointer-events-auto">
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
          <div className="bg-red-100 text-red-800 text-[9px] font-bold py-0.5 mt-1 uppercase">
            *** TRAINING RECEIPT - NON-FISCAL ***
          </div>
        </div>

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
            <span>{state.cashierName}</span>
          </div>
        </div>

        {/* Item Rows */}
        <div className="space-y-1.5 border-b border-dashed border-gray-400 pb-3">
          {state.lineItems.map((item) => (
            <div key={item.id} className="space-y-0.5">
              <div className="flex justify-between font-bold">
                <span className="truncate max-w-[200px]">{item.description}</span>
                <span>{formatCurrency(item.total)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>{item.quantity} x @{formatCurrency(item.unitPrice)}</span>
                <span>{item.isVoided ? "VOIDED" : ""}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-1 text-[11px] border-b border-dashed border-gray-400 pb-3">
          <div className="flex justify-between font-bold">
            <span>SUBTOTAL:</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm text-[#E4002B]">
            <span>TOTAL SALES:</span>
            <span>{formatCurrency(totals.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>CASH TENDERED:</span>
            <span>{formatCurrency(state.tenderAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-emerald-700">
            <span>CHANGE DUE:</span>
            <span>{formatCurrency(state.changeDue)}</span>
          </div>
        </div>

        <div className="text-center text-[10px] text-gray-400 space-y-1">
          <div>Thank you for shopping at National Book Store!</div>
          <div>Laking National: Read More, Learn More</div>
          <div className="text-[9px] text-red-600 font-bold uppercase">
            *** NO LIVE REVENUE GENERATED ***
          </div>
        </div>

        <div className="pt-2 flex flex-col space-y-2">
          <Button
            onClick={onClose}
            size="sm"
            className="w-full font-bold bg-[#E4002B] hover:bg-[#C10024] text-xs uppercase"
          >
            Review Result & Finish
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            size="sm"
            className="w-full text-xs font-bold border-gray-300"
          >
            Start New Transaction
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}