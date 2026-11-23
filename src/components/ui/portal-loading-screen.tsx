"use client";

import React from "react";

interface PortalLoadingScreenProps {
  message?: string;
}

export function PortalLoadingScreen({
  message = "Loading Portal Session...",
}: PortalLoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="flex flex-col items-center space-y-5">
        <div className="w-12 h-12 bg-[#E4002B] text-white font-heading font-black text-base tracking-tighter flex items-center justify-center rounded-none shadow-sm animate-spin">
          NBS
        </div>
        <div className="text-center font-sans text-xs sm:text-sm text-slate-600 font-medium">
          {message}
        </div>
      </div>
    </div>
  );
}
