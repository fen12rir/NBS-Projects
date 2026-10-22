"use client";

import React, { useState, useEffect } from "react";

export interface TransactionComments {
  customerName?: string;
  address?: string;
  tin?: string;
  remarks?: string;
}

interface TransactionCommentModalProps {
  initialComments?: TransactionComments;
  onSave: (comments: TransactionComments) => void;
  onCancel: () => void;
}

export function TransactionCommentModal({
  initialComments,
  onSave,
  onCancel,
}: TransactionCommentModalProps) {
  const [customerName, setCustomerName] = useState(
    initialComments?.customerName || "JAN ANGELA CATINDIG"
  );
  const [tin, setTin] = useState(initialComments?.tin || "000-000-000");
  const [address, setAddress] = useState(
    initialComments?.address || "MANDALUYONG"
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || (e.altKey && e.key === "Enter")) {
        e.preventDefault();
        onSave({ customerName, tin, address });
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [customerName, tin, address, onSave, onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ customerName, tin, address });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
        <form
          onSubmit={handleSubmit}
          className="w-[440px] bg-[#D4D0C8] border-4 border-[#2E7D32] shadow-2xl font-sans pointer-events-auto"
        >
          {/* Authentic Green Header matching pos-trxcomment-step2-f3.png */}
          <div className="bg-[#2E7D32] text-white px-3 py-1 font-bold text-sm text-center uppercase tracking-wide border-b border-[#1B5E20]">
            TRANSACTION COMMENT
          </div>

          <div className="p-6 space-y-4 text-gray-900">
            <div className="text-center font-bold text-xs text-gray-800">
              Enter Comment:
            </div>

            {/* 3 Text Inputs */}
            <div className="space-y-2 max-w-[320px] mx-auto">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                autoFocus
                placeholder="CUSTOMER NAME"
                className="w-full bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-mono font-bold text-gray-900 uppercase focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <input
                type="text"
                value={tin}
                onChange={(e) => setTin(e.target.value)}
                placeholder="TIN (000-000-000)"
                className="w-full bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-mono font-bold text-gray-900 uppercase focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ADDRESS"
                className="w-full bg-white border-2 border-t-[#404040] border-l-[#404040] border-r-white border-b-white px-2 py-1 text-xs font-mono font-bold text-gray-900 uppercase focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Buttons: Ok & Cancel */}
            <div className="flex items-center justify-center space-x-6 pt-2">
              <button
                type="submit"
                className="min-w-[85px] px-5 py-1 text-xs font-bold font-sans bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-black outline outline-1 outline-dotted outline-black cursor-pointer hover:bg-[#E2E0DC]"
              >
                Ok
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="min-w-[85px] px-5 py-1 text-xs font-bold font-sans bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 cursor-pointer hover:bg-[#E2E0DC]"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
