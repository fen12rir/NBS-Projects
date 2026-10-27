"use client";

import React, { useState } from "react";
import { POSLineItem } from "@/lib/simulator/pos-state-machine";

interface PriceChangeModalProps {
  items: POSLineItem[];
  onAuthorizeOverride?: () => void;
  onConfirm: (data: { itemId: string; newPrice: number; reason: string }) => void;
  onCancel: () => void;
}

export function PriceChangeModal({
  items,
  onAuthorizeOverride,
  onConfirm,
  onCancel,
}: PriceChangeModalProps) {
  const activeItems = items.filter((i) => !i.isVoided);
  const defaultItem = activeItems[activeItems.length - 1];

  const [selectedItemId, setSelectedItemId] = useState(defaultItem?.id || "");
  const [newPrice, setNewPrice] = useState(defaultItem ? defaultItem.unitPrice.toFixed(2) : "");
  const [selectedReason, setSelectedReason] = useState("Manager Discretion / Markdown");
  const [supervisorPass, setSupervisorPass] = useState("");
  const [isSupervisorOverridden, setIsSupervisorOverridden] = useState(false);
  const [authError, setAuthError] = useState("");

  const currentItem = activeItems.find((i) => i.id === selectedItemId) || defaultItem;

  const REASONS = [
    "Manager Discretion / Markdown",
    "Damaged Item / Shopworn Packaging",
    "Shelf Price Discrepancy",
    "Bulk Purchase Agreement",
    "Seasonal Clearance",
  ];

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (supervisorPass === "9999" || supervisorPass === "1234" || supervisorPass.length >= 4) {
      setIsSupervisorOverridden(true);
      setAuthError("");
      onAuthorizeOverride?.();
    } else {
      setAuthError("Invalid Manager PIN. Use '9999' or '1234' for training.");
    }
  };

  const handlePriceChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum < 0 || !selectedItemId) return;
    onConfirm({
      itemId: selectedItemId,
      newPrice: priceNum,
      reason: selectedReason,
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
        <div className="w-[440px] bg-[#D4D0C8] border-4 border-[#228B22] shadow-2xl font-sans pointer-events-auto">
          {/* Green Title Bar */}
          <div className="bg-[#228B22] text-white py-1.5 px-3 text-center font-bold text-sm uppercase tracking-wide">
            PRICE CHANGE (F3)
          </div>

          {!isSupervisorOverridden ? (
            <form onSubmit={handleOverrideSubmit} className="p-6 space-y-4 text-gray-900">
              <div className="bg-[#FFF275] border border-yellow-500 p-2 text-xs font-bold text-gray-900 text-center">
                Supervisor Override Required to Change Price
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">
                  Supervisor / Manager PIN:
                </label>
                <input
                  type="password"
                  value={supervisorPass}
                  onChange={(e) => setSupervisorPass(e.target.value)}
                  placeholder="Enter 9999 or 1234"
                  className="w-full bg-white border-2 border-gray-500 px-3 py-1.5 font-mono text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-green-600 shadow-inner"
                  autoFocus
                />
              </div>

              {authError && (
                <div className="text-xs font-bold text-red-600 text-center">
                  {authError}
                </div>
              )}

              <div className="text-[11px] text-gray-500 text-center">
                Training hint: Enter PIN <code className="font-bold text-gray-800">9999</code> then press Enter.
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-1.5 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 font-bold text-xs hover:bg-[#E2E0DC] cursor-pointer"
                >
                  Cancel (Esc)
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#228B22] text-white font-bold text-xs border-2 border-green-800 hover:bg-green-700 cursor-pointer shadow"
                >
                  Authorize (Enter)
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePriceChangeSubmit} className="p-6 space-y-4 text-gray-900">
              {activeItems.length > 1 && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-800 block">
                    Select Item to Price Change:
                  </label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => {
                      setSelectedItemId(e.target.value);
                      const itm = activeItems.find((i) => i.id === e.target.value);
                      if (itm) setNewPrice(itm.unitPrice.toFixed(2));
                    }}
                    className="w-full bg-white border-2 border-gray-500 px-2 py-1.5 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    {activeItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.description} ({item.unitPrice.toFixed(2)} PHP)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {currentItem && (
                <div className="bg-white border-2 border-gray-400 p-2 text-xs font-mono space-y-1 shadow-inner">
                  <div className="font-bold text-gray-900 truncate">
                    {currentItem.description}
                  </div>
                  <div className="flex justify-between text-gray-600 text-[11px]">
                    <span>Original SRP:</span>
                    <span className="font-bold line-through">
                      {currentItem.unitPrice.toFixed(2)} PHP
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800 block">
                  New Adjusted Unit Price (PHP):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full bg-white border-2 border-gray-600 px-3 py-1.5 text-center font-mono font-bold text-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-inner"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800 block">
                  Reason for Price Change:
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full bg-white border-2 border-gray-500 px-2 py-1.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-1.5 bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 font-bold text-xs hover:bg-[#E2E0DC] cursor-pointer"
                >
                  Cancel (Esc)
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#228B22] text-white font-bold text-xs border-2 border-green-800 hover:bg-green-700 cursor-pointer shadow"
                >
                  Apply Price Change (Enter)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
