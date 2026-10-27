import React from "react";

interface PosReloaderScreenProps {
  onReloadToLogin: () => void;
}

export function PosReloaderScreen({ onReloadToLogin }: PosReloaderScreenProps) {
  return (
    <div className="flex-1 h-full min-h-0 bg-white flex flex-col select-none relative font-sans">
      {/* Retro Browser Menu Bar */}
      <div className="bg-[#ECE9D8] border-b border-gray-400 px-3 py-1 flex items-center space-x-4 text-xs text-gray-800 font-sans">
        <span className="hover:bg-blue-600 hover:text-white px-1 cursor-default">File</span>
        <span className="hover:bg-blue-600 hover:text-white px-1 cursor-default">Edit</span>
        <span className="hover:bg-blue-600 hover:text-white px-1 cursor-default">View</span>
        <span className="hover:bg-blue-600 hover:text-white px-1 cursor-default">History</span>
        <span className="hover:bg-blue-600 hover:text-white px-1 cursor-default">Bookmarks</span>
        <span className="hover:bg-blue-600 hover:text-white px-1 cursor-default">Tools</span>
        <span className="hover:bg-blue-600 hover:text-white px-1 cursor-default">Help</span>
      </div>

      {/* Retro Browser Navigation / Address Bar */}
      <div className="bg-[#ECE9D8] border-b border-gray-400 px-3 py-1.5 flex items-center space-x-2 text-xs">
        {/* Back / Forward / Refresh */}
        <div className="flex items-center space-x-1 text-gray-500 font-mono text-sm select-none">
          <span className="px-1 border border-gray-300 bg-gray-100 opacity-60">←</span>
          <span className="px-1 border border-gray-300 bg-gray-100 opacity-60">→</span>
          <span className="px-1 border border-gray-300 bg-gray-100">↺</span>
          <span className="px-1 border border-gray-300 bg-gray-100">✕</span>
          <span className="px-1 border border-gray-300 bg-gray-100">⌂</span>
        </div>

        {/* URL Address Input */}
        <div className="flex-1 bg-white border border-gray-500 px-2 py-0.5 flex items-center justify-between text-xs font-mono text-gray-900 shadow-inner">
          <span>http://localhost/dv3/pos_nbs/</span>
          <span className="text-gray-400 text-[10px]">▼</span>
        </div>

        {/* Search / Go */}
        <div className="w-36 bg-white border border-gray-500 px-2 py-0.5 text-xs text-gray-500 font-sans flex items-center justify-between shadow-inner">
          <span>Google</span>
          <span className="text-gray-400 text-[10px]">🔍</span>
        </div>
      </div>

      {/* Browser Bookmarks Bar */}
      <div className="bg-[#ECE9D8] border-b border-gray-300 px-3 py-0.5 flex items-center space-x-4 text-[11px] text-gray-700">
        <span className="flex items-center space-x-1">
          <span className="text-red-600 font-bold">●</span>
          <span>Getting Started</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="text-orange-500 font-bold">📰</span>
          <span>Latest Headlines</span>
        </span>
      </div>

      {/* POS Reloader Web Page Body */}
      <div className="flex-1 bg-white p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-base font-serif text-gray-900">POS Reloader</h2>
        </div>

        {/* Trainee Helper Guidance Banner */}
        <div className="border border-blue-200 bg-blue-50 p-4 max-w-lg mx-auto text-center space-y-3">
          <p className="text-xs text-blue-900 font-medium">
            The setup window has closed. The POS terminal is now in the browser reloader state.
          </p>
          <p className="text-sm font-bold text-blue-950">
            Press{" "}
            <kbd className="bg-white px-2 py-1 border border-blue-400 text-blue-900 font-mono text-sm">
              F5
            </kbd>{" "}
            on your keyboard to reload into the <strong>USER LOGIN</strong> page.
          </p>
          <div>
            <button
              type="button"
              onClick={onReloadToLogin}
              className="px-5 py-2 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer font-sans"
            >
              Reload Page (F5)
            </button>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
}
