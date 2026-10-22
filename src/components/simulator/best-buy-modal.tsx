"use client";

import React, { useState } from "react";

interface BestBuyModalProps {
  onConfirm: (promo: { promoName: string; promoSku: string; promoPrice: number }) => void;
  onCancel: () => void;
}

export function BestBuyModal({ onConfirm, onCancel }: BestBuyModalProps) {
  const PROMOS = [
    {
      id: "bb-1",
      name: "Bonus Buy: 3x Spiral Notebooks Bundle",
      sku: "NBS-BB-001",
      price: 100.0,
      description: "Buy 3 best-selling NBS Spiral Notebooks for only ₱100.00 (Save ₱35).",
    },
    {
      id: "bb-2",
      name: "Bonus Buy: Pilot G-Tech + 2 Refills",
      sku: "NBS-BB-002",
      price: 185.0,
      description: "Pilot G-Tech 0.3/0.4 black pen plus two genuine ink refills.",
    },
    {
      id: "bb-3",
      name: "Bonus Buy: Faber-Castell Exam Pack",
      sku: "NBS-BB-003",
      price: 120.0,
      description: "Exam-ready bundle: 3 pencils, 1 dust-free eraser, 1 sharpener.",
    },
    {
      id: "bb-4",
      name: "Bonus Buy: Back-to-School Arts Set",
      sku: "NBS-BB-004",
      price: 249.0,
      description: "Crayola 24s + sketch pad + safety scissors combo pack.",
    },
  ];

  const [selectedPromoId, setSelectedPromoId] = useState(PROMOS[0].id);

  const handleApply = () => {
    const matched = PROMOS.find((p) => p.id === selectedPromoId) || PROMOS[0];
    onConfirm({
      promoName: matched.name,
      promoSku: matched.sku,
      promoPrice: matched.price,
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
        <div className="w-[480px] bg-[#D4D0C8] border-4 border-[#228B22] shadow-2xl font-sans pointer-events-auto">
          {/* Green Title Bar */}
          <div className="bg-[#228B22] text-white py-1.5 px-3 text-center font-bold text-sm uppercase tracking-wide">
            BEST BUY / BONUS BUY PROMOTIONS (F2)
          </div>

          <div className="p-6 space-y-4 text-gray-900">
            <div className="bg-[#FFF275] border border-yellow-500 p-2 text-xs font-bold text-gray-900 text-center">
              Select an authorized NBS Best Buy / Bonus Buy promo bundle
            </div>

            <div className="space-y-2">
              {PROMOS.map((promo) => (
                <div
                  key={promo.id}
                  onClick={() => setSelectedPromoId(promo.id)}
                  className={`p-3 border-2 cursor-pointer transition-all ${
                    selectedPromoId === promo.id
                      ? "bg-white border-[#228B22] ring-2 ring-green-400 shadow"
                      : "bg-[#ECE9D8] border-gray-400 hover:bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center font-bold text-xs">
                    <span className="text-gray-900">{promo.name}</span>
                    <span className="text-green-800 font-mono text-sm">
                      ₱{promo.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1">
                    {promo.description}
                  </div>
                </div>
              ))}
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
                type="button"
                onClick={handleApply}
                className="px-5 py-1.5 bg-[#228B22] text-white font-bold text-xs border-2 border-green-800 hover:bg-green-700 cursor-pointer shadow"
              >
                Apply Bonus Buy (Enter)
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
