"use client";

import React, { useState, useEffect } from "react";

interface QuantityModalProps {
  initialQuantity?: number;
  onConfirm: (quantity: number) => void;
  onCancel: () => void;
}

export function QuantityModal({
  initialQuantity = 1,
  onConfirm,
  onCancel,
}: QuantityModalProps) {
  const [qtyInput, setQtyInput] = useState(initialQuantity.toString());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const val = parseInt(qtyInput, 10);
        if (!isNaN(val) && val > 0) {
          onConfirm(val);
        } else {
          onConfirm(1);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [qtyInput, onConfirm, onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(qtyInput, 10);
    if (!isNaN(val) && val > 0) {
      onConfirm(val);
    } else {
      onConfirm(1);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
        <form
          onSubmit={handleSubmit}
          className="w-[380px] bg-[#ECE9D8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-2xl font-sans pointer-events-auto"
        >
          {/* Classic Browser Prompt Title Bar matching pos-quantity-step1-f3.png */}
          <div className="bg-[#0A246A] text-white px-2 py-1 font-bold text-xs flex items-center justify-between">
            <span>The page at http://localhost says:</span>
            <button
              type="button"
              onClick={onCancel}
              className="w-4 h-4 bg-[#D4D0C8] text-black border border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-[9px] font-bold flex items-center justify-center"
            >
              ×
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-start space-x-3">
              {/* Question Icon */}
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-serif font-bold text-lg flex items-center justify-center flex-shrink-0">
                ?
              </div>
              <div className="space-y-2 flex-1">
                <div className="text-xs font-sans text-gray-900">
                  Please enter quantity
                </div>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={qtyInput}
                  onChange={(e) => setQtyInput(e.target.value)}
                  autoFocus
                  className="w-full bg-white border border-[#404040] px-2 py-0.5 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-1 text-xs font-sans bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-900 hover:bg-[#E2E0DC] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1 text-xs font-sans font-bold bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-black outline outline-1 outline-dotted outline-black hover:bg-[#E2E0DC] cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
