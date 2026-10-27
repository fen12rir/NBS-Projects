import React from "react";

interface StartOfDayCloseScreenProps {
  onCloseWindow: () => void;
}

export function StartOfDayCloseScreen({
  onCloseWindow,
}: StartOfDayCloseScreenProps) {
  return (
    <div className="flex-1 h-full min-h-0 bg-white flex flex-col items-center justify-center p-6 select-none relative">
      <div className="max-w-lg w-full bg-white border border-gray-300 p-8 shadow-sm flex flex-col items-center text-center space-y-6">
        <div className="space-y-2 text-[#E4002B] font-bold text-xl font-sans">
          <p>You can now start using your POS terminal.</p>
          <p>Have a nice day.</p>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 text-[#E4002B] font-bold text-base leading-relaxed max-w-md">
          Press{" "}
          <kbd className="bg-white px-2 py-0.5 border border-red-300 text-red-900 font-mono text-sm">
            Ctrl+Alt+C
          </kbd>{" "}
          to close this window and
          <br />
          Press{" "}
          <kbd className="bg-white px-2 py-0.5 border border-red-300 text-red-900 font-mono text-sm">
            (F5)
          </kbd>{" "}
          to go to login page.
        </div>

        <button
          type="button"
          onClick={onCloseWindow}
          className="px-6 py-2.5 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-sm font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer font-sans"
        >
          Close Window (Ctrl+Alt+C)
        </button>
      </div>
    </div>
  );
}
