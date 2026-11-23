"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, X, Check } from "lucide-react";

export interface BranchOption {
  code: string;
  name: string;
  region?: string;
}

interface SearchableBranchSelectProps {
  branches: BranchOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  includeAllOption?: boolean;
  allLabel?: string;
  className?: string;
}

export function SearchableBranchSelect({
  branches,
  value,
  onChange,
  placeholder = "Search branch by name or code...",
  includeAllOption = true,
  allLabel = "All Branches (11)",
  className = "",
}: SearchableBranchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedBranch = branches.find((b) => b.code === value);
  const displayLabel = value === "all" ? allLabel : selectedBranch ? `${selectedBranch.code} - ${selectedBranch.name}` : value;

  const filteredBranches = branches.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      b.code.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q) ||
      (b.region && b.region.toLowerCase().includes(q))
    );
  });

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(includeAllOption ? "all" : (branches[0]?.code || ""));
    setSearchQuery("");
  };

  return (
    <div ref={containerRef} className={`relative w-full sm:w-64 text-xs font-sans ${className}`}>
      {/* Selected Box / Input Trigger */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className={`flex items-center justify-between border bg-white px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
          isOpen ? "border-[#E4002B] ring-2 ring-[#E4002B]/20" : "border-slate-300 hover:border-slate-400"
        }`}
      >
        <span className="truncate font-medium text-gray-900 pr-1">
          {displayLabel}
        </span>
        <div className="flex items-center space-x-1 shrink-0 text-gray-400">
          {value && value !== "all" && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear selection"
              className="p-0.5 hover:text-black hover:bg-gray-100 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180 text-gray-700" : ""}`} />
        </div>
      </div>

      {/* Dropdown Menu with Search Input */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-64 flex flex-col overflow-hidden">
          {/* Search Input Bar */}
          <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center space-x-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1 outline-none focus:border-[#E4002B]"
              onClick={(e) => e.stopPropagation()}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-48 divide-y divide-gray-100">
            {includeAllOption && !searchQuery && (
              <div
                onClick={() => handleSelect("all")}
                className={`px-3 py-2 cursor-pointer flex items-center justify-between text-xs hover:bg-red-50 hover:text-[#E4002B] ${
                  value === "all" ? "bg-red-50 font-bold text-[#E4002B]" : "text-gray-700"
                }`}
              >
                <span>{allLabel}</span>
                {value === "all" && <Check className="w-3.5 h-3.5" />}
              </div>
            )}

            {filteredBranches.length === 0 ? (
              <div className="p-3 text-center text-gray-400 text-xs">
                No branches match &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredBranches.map((b) => {
                const isSelected = value === b.code;
                return (
                  <div
                    key={b.code}
                    onClick={() => handleSelect(b.code)}
                    className={`px-3 py-2 cursor-pointer flex items-center justify-between text-xs hover:bg-red-50 hover:text-[#E4002B] ${
                      isSelected ? "bg-red-50 font-bold text-[#E4002B]" : "text-gray-800"
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{b.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        Code: {b.code} {b.region ? `• ${b.region}` : ""}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
