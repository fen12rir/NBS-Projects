import React from "react";

interface StartOfDayVerifyScreenProps {
  now: Date;
  selectedButton: "YES" | "NO" | null;
  onVerifyYes: () => void;
  onVerifyNo: () => void;
}

const fmtLongDate = (d: Date) =>
  d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const fmtDayName = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "long" });

const fmtTime = (d: Date) =>
  d.toLocaleTimeString("en-US", { hour12: false });

export function StartOfDayVerifyScreen({
  now,
  selectedButton,
  onVerifyYes,
  onVerifyNo,
}: StartOfDayVerifyScreenProps) {
  return (
    <div className="flex-1 h-full min-h-0 bg-white flex flex-col items-center justify-center p-6 select-none relative">
      <div className="max-w-lg w-full bg-white border border-gray-300 p-8 shadow-sm flex flex-col items-center text-center space-y-5">
        <div className="space-y-1">
          <div className="text-[#E4002B] font-bold text-2xl font-sans tracking-tight">
            Today is {fmtLongDate(now)}
          </div>
          <div className="text-[#E4002B] font-bold text-2xl font-sans tracking-tight">
            {fmtDayName(now)}
          </div>
          <div className="text-[#E4002B] font-bold text-2xl font-sans tracking-tight font-mono">
            {fmtTime(now)}
          </div>
          <div className="text-[#E4002B] font-bold text-lg pt-2 font-sans">
            Is the date and time correct?
          </div>
        </div>

        <div className="flex items-center justify-center space-x-6 pt-2">
          <button
            type="button"
            onClick={onVerifyYes}
            className={`min-w-[85px] px-5 py-1.5 text-sm font-bold font-sans transition-all border-2 ${
              selectedButton === "YES"
                ? "bg-[#D4D0C8] border-red-600 ring-2 ring-red-500 shadow-inner text-black font-extrabold"
                : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 hover:bg-[#E2E0DC]"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={onVerifyNo}
            className={`min-w-[85px] px-5 py-1.5 text-sm font-bold font-sans transition-all border-2 ${
              selectedButton === "NO"
                ? "bg-[#D4D0C8] border-red-600 ring-2 ring-red-500 shadow-inner text-black font-extrabold"
                : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 hover:bg-[#E2E0DC]"
            }`}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
