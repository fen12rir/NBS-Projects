"use client";

import React from "react";
import { Languages } from "lucide-react";
import { ModuleLanguage } from "@/lib/i18n/module-language";

interface ModuleLanguageToggleProps {
  lang: ModuleLanguage;
  onChange: (lang: ModuleLanguage) => void;
}

export function ModuleLanguageToggle({ lang, onChange }: ModuleLanguageToggleProps) {
  return (
    <div
      className="inline-flex items-center bg-gray-100 border border-gray-300 rounded-md p-0.5 text-xs font-semibold shadow-2xs"
      role="group"
      aria-label="Module and Lesson Language"
    >
      <span className="px-1.5 text-gray-500 flex items-center" title="Translate Module / Lesson">
        <Languages className="w-3.5 h-3.5" />
      </span>
      <button
        type="button"
        onClick={() => onChange("en")}
        className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
          lang === "en"
            ? "bg-white text-gray-900 shadow-xs font-bold"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onChange("tl")}
        className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
          lang === "tl"
            ? "bg-[#E4002B] text-white shadow-xs font-bold"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Tagalog
      </button>
    </div>
  );
}
