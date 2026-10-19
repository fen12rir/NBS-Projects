"use client";

import React, { useState, useEffect, useRef } from "react";
import { SyntheticProduct, SYNTHETIC_PRODUCTS } from "@/data/products";

interface F2LookupScreenProps {
  onCancel: () => void;
  onSelectItem: (sku: string) => void;
  initialSearch?: string;
}

type LookupMode = "SKU" | "DESCRIPTION" | "AUTHOR";

export function F2LookupScreen({
  onCancel,
  onSelectItem,
  initialSearch = "",
}: F2LookupScreenProps) {
  const [mode, setMode] = useState<LookupMode>("SKU");
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    setSearchTerm(initialSearch);
    setSelectedIndex(0);
    setPage(1);
  }, [initialSearch]);

  // Filter products based on active mode & search term
  const filteredProducts = SYNTHETIC_PRODUCTS.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    if (mode === "SKU") {
      return item.sku.toLowerCase().includes(term) || item.barcode.toLowerCase().includes(term);
    } else if (mode === "DESCRIPTION") {
      return item.description.toLowerCase().includes(term);
    } else if (mode === "AUTHOR") {
      return (item.author || "").toLowerCase().includes(term);
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const currentPageProducts = filteredProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  useEffect(() => {
    if (selectedIndex >= currentPageProducts.length && currentPageProducts.length > 0) {
      setSelectedIndex(0);
    }
  }, [currentPageProducts.length, selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || (e.altKey && (e.key === "b" || e.key === "B"))) {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key === "F2") {
        e.preventDefault();
        setMode("SKU");
        inputRef.current?.focus();
        return;
      }
      if (e.key === "F3") {
        e.preventDefault();
        setMode("DESCRIPTION");
        inputRef.current?.focus();
        return;
      }
      if (e.key === "F4") {
        e.preventDefault();
        setMode("AUTHOR");
        inputRef.current?.focus();
        return;
      }
      if (e.key === "F11" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(0, prev - 1));
        return;
      }
      if (e.key === "F12" || e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(currentPageProducts.length - 1, prev + 1));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const chosen = currentPageProducts[selectedIndex];
        if (chosen) {
          onSelectItem(chosen.sku);
        }
        return;
      }
      if (e.key === "ArrowLeft") {
        setPage((p) => Math.max(1, p - 1));
        return;
      }
      if (e.key === "ArrowRight") {
        setPage((p) => Math.min(totalPages, p + 1));
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPageProducts, selectedIndex, page, totalPages, onCancel, onSelectItem]);

  const handleRowClick = (idx: number) => {
    setSelectedIndex(idx);
  };

  const handleRowDoubleClick = (item: SyntheticProduct) => {
    onSelectItem(item.sku);
  };

  return (
    <div className="w-full flex-1 flex flex-col font-sans bg-white min-h-[500px]">
      {/* 1. YELLOW BANNER — Row 1: Title */}
      <div className="bg-[#FFF275] py-1 text-center font-bold text-xs sm:text-sm text-gray-900 uppercase font-sans tracking-wide">
        {mode === "SKU" && "LOOKUP BY SKU / BARCODE"}
        {mode === "DESCRIPTION" && "LOOKUP BY DESCRIPTION"}
        {mode === "AUTHOR" && "LOOKUP BY AUTHOR"}
      </div>

      {/* 1b. YELLOW BANNER — Row 2: Help & On-Hand */}
      <div className="bg-[#FFF275] border-b border-gray-400 px-3 py-0.5 flex items-center justify-between text-xs font-mono font-bold">
        <button
          type="button"
          onClick={() => alert("F1 Help: Use F2 for SKU search, F3 for Description search, F4 for Author search. Use Up/Down arrows to select, and Enter or double click to select item.")}
          className="text-[#1D4ED8] hover:underline cursor-pointer"
        >
          [ F1 ] Help
        </button>
        <button
          type="button"
          onClick={() => alert("F5 On-Hand Inventory: Real-time store inventory count is active.")}
          className="text-[#1D4ED8] hover:underline cursor-pointer"
        >
          [ F5 ] On-Hand
        </button>
      </div>

      {/* 3. BUTTON BAR & SEARCH INPUT ROW */}
      <div className="bg-[#C2CAD0] border-b-2 border-gray-400 flex items-stretch h-[48px]">
        <div className="flex items-stretch border-r border-gray-400">
          {/* F11 (Up Arrow) */}
          <button
            type="button"
            onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
            className="w-[56px] border-r border-gray-400 bg-[#D2D7DF] hover:bg-[#E2E6EC] active:bg-[#B8BFC9] flex flex-col items-center justify-center p-1 transition-all select-none cursor-pointer"
          >
            <div className="w-0 h-0 border-x-[7px] border-x-transparent border-b-[10px] border-b-[#16A34A] mb-0.5"></div>
            <span className="text-[10px] font-bold text-gray-900">F11</span>
          </button>

          {/* F12 (Down Arrow) */}
          <button
            type="button"
            onClick={() => setSelectedIndex((prev) => Math.min(currentPageProducts.length - 1, prev + 1))}
            className="w-[56px] border-r border-gray-400 bg-[#D2D7DF] hover:bg-[#E2E6EC] active:bg-[#B8BFC9] flex flex-col items-center justify-center p-1 transition-all select-none cursor-pointer"
          >
            <div className="w-0 h-0 border-x-[7px] border-x-transparent border-t-[10px] border-t-[#16A34A] mb-0.5"></div>
            <span className="text-[10px] font-bold text-gray-900">F12</span>
          </button>

          {/* F2 SKU / BARCODE */}
          <button
            type="button"
            onClick={() => {
              setMode("SKU");
              inputRef.current?.focus();
            }}
            className={`w-[78px] border-r border-gray-400 flex flex-col items-center justify-center p-1 font-sans select-none transition-all cursor-pointer ${
              mode === "SKU"
                ? "bg-[#FFF275] border-t-2 border-t-yellow-500 font-bold"
                : "bg-[#D2D7DF] hover:bg-[#E2E6EC] active:bg-[#B8BFC9]"
            }`}
          >
            <span className="text-[9px] font-bold text-gray-900 leading-tight uppercase text-center">SKU /<br/>BARCODE</span>
            <span className="text-[10px] font-extrabold text-[#1D4ED8]">F2</span>
          </button>

          {/* F3 DESCRIPTION */}
          <button
            type="button"
            onClick={() => {
              setMode("DESCRIPTION");
              inputRef.current?.focus();
            }}
            className={`w-[78px] border-r border-gray-400 flex flex-col items-center justify-center p-1 font-sans select-none transition-all cursor-pointer ${
              mode === "DESCRIPTION"
                ? "bg-[#FFF275] border-t-2 border-t-yellow-500 font-bold"
                : "bg-[#D2D7DF] hover:bg-[#E2E6EC] active:bg-[#B8BFC9]"
            }`}
          >
            <span className="text-[9px] font-bold text-gray-900 leading-tight uppercase text-center">Description</span>
            <span className="text-[10px] font-extrabold text-[#1D4ED8]">F3</span>
          </button>

          {/* F4 AUTHOR */}
          <button
            type="button"
            onClick={() => {
              setMode("AUTHOR");
              inputRef.current?.focus();
            }}
            className={`w-[78px] flex flex-col items-center justify-center p-1 font-sans select-none transition-all cursor-pointer ${
              mode === "AUTHOR"
                ? "bg-[#FFF275] border-t-2 border-t-yellow-500 font-bold"
                : "bg-[#D2D7DF] hover:bg-[#E2E6EC] active:bg-[#B8BFC9]"
            }`}
          >
            <span className="text-[9px] font-bold text-gray-900 leading-tight uppercase text-center">Author</span>
            <span className="text-[10px] font-extrabold text-[#1D4ED8]">F4</span>
          </button>
        </div>

        {/* Right */}
        <div className="flex-1 bg-[#C2CAD0] flex items-center justify-center px-4 space-x-3">
          <span className="text-base font-bold text-gray-900 font-sans tracking-tight">Look for:</span>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
              setSelectedIndex(0);
            }}
            className="flex-1 max-w-[420px] bg-white border border-gray-500 px-2 py-1 text-sm font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-inner"
          />
        </div>
      </div>

      {/* 4. TABLE HEADERS */}
      <div className="bg-[#B8C2CC] border-b border-gray-400 px-2 py-1 text-[11px] font-bold text-gray-800 grid grid-cols-12 text-center uppercase tracking-tight font-sans">
        <span className="col-span-3 text-left">SKU</span>
        <span className="col-span-5 text-left">DESCRIPTION</span>
        <span className="col-span-2 text-left">AUTHOR</span>
        <span className="col-span-1 text-right">SRP</span>
        <span className="col-span-1 text-right">PROMO</span>
      </div>

      {/* 6. TABLE BODY ROWS */}
      <div className="flex-1 min-h-[300px] overflow-y-auto bg-white divide-y divide-gray-200 font-mono text-xs">
        {currentPageProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-500 italic">
            No items matching "{searchTerm}" found.
          </div>
        ) : (
          currentPageProducts.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={item.sku}
                onClick={() => handleRowClick(idx)}
                onDoubleClick={() => handleRowDoubleClick(item)}
                className={`grid grid-cols-12 px-3 py-1.5 cursor-pointer items-center text-[11px] ${
                  isSelected
                    ? "bg-[#76853a] text-white font-bold"
                    : "text-[#D32F2F] hover:bg-red-50"
                }`}
              >
                <span className="col-span-3 text-left font-mono truncate">
                  {item.sku}
                </span>
                <span className="col-span-5 text-left font-bold truncate pr-2">
                  {item.description}
                </span>
                <span className="col-span-2 text-left truncate text-gray-700">
                  {item.author || ""}
                </span>
                <span className="col-span-1 text-right font-mono">
                  {item.srp.toFixed(2)}
                </span>
                <span className="col-span-1 text-right font-mono">
                  {item.promoPrice ? item.promoPrice.toFixed(2) : "N/A"}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* 5. GREEN BOTTOM ACTION BAR */}
      <div className="bg-[#48BB78] border-t-2 border-gray-500 px-3 py-1.5 flex items-center justify-between">
        <div className="w-[100px]" />

        {/* Centered Bevel Buttons: PREV, NEXT, CANCEL */}
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className={`w-[85px] h-[40px] px-2 py-0.5 flex flex-col items-center justify-center border font-sans select-none shadow-sm transition-all cursor-pointer ${
              page <= 1
                ? "bg-gray-400 border-gray-500 text-gray-600 cursor-not-allowed opacity-50"
                : "bg-[#D2D7DF] hover:bg-[#E2E6EC] active:bg-[#B8BFC9] text-gray-900 border-gray-400"
            }`}
          >
            <span className="text-[12px] font-black leading-tight uppercase text-[#0B25B7]">PREV</span>
            <span className="text-[9px] font-bold text-gray-800 leading-none">&lt;Left-Arrow&gt;</span>
          </button>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className={`w-[85px] h-[40px] px-2 py-0.5 flex flex-col items-center justify-center border font-sans select-none shadow-sm transition-all cursor-pointer ${
              page >= totalPages
                ? "bg-gray-400 border-gray-500 text-gray-600 cursor-not-allowed opacity-50"
                : "bg-[#D2D7DF] hover:bg-[#E2E6EC] active:bg-[#B8BFC9] text-gray-900 border-gray-400"
            }`}
          >
            <span className="text-[12px] font-black leading-tight uppercase text-[#0B25B7]">NEXT</span>
            <span className="text-[9px] font-bold text-gray-800 leading-none">&lt;Right-Arrow&gt;</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-[85px] h-[40px] px-2 py-0.5 flex flex-col items-center justify-center border font-sans select-none shadow-sm transition-all cursor-pointer bg-[#D2D7DF] hover:bg-[#E2E6EC] active:bg-[#B8BFC9] text-gray-900 border-gray-400"
          >
            <span className="text-[12px] font-black leading-tight uppercase text-[#0B25B7]">CANCEL</span>
            <span className="text-[9px] font-bold text-gray-800 leading-none">&lt;Alt-B&gt;</span>
          </button>
        </div>

        {/* Page Counter on Far Right */}
        <div className="w-[100px] text-right font-mono text-xs font-bold text-gray-900 pr-1">
          Page: {page}/{totalPages}
        </div>
      </div>
    </div>
  );
}
