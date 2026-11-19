"use client";

import React from "react";

interface PortalLoadingScreenProps {
  message?: string;
}

export function PortalLoadingScreen({
  message = "Loading Portal Session...",
}: PortalLoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2.5">
          <div className="bg-[#E4002B] text-white px-3 py-1 font-black text-xl tracking-tighter">
            NBS
          </div>
          <div className="w-5 h-5 border-2 border-gray-300 border-t-[#E4002B] rounded-full animate-spin" />
        </div>
        <div className="text-center font-mono text-xs sm:text-sm text-gray-600 font-medium tracking-tight">
          {message}
        </div>
      </div>
    </div>
  );
}
