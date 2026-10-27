import React from "react";

interface LnqrUpdatedModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

export function LnqrUpdatedModal({
  isOpen,
  onConfirm,
}: LnqrUpdatedModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onConfirm}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
        <div className="w-[380px] bg-[#D6D3CE] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-2xl font-sans pointer-events-auto">
          {/* Window Title Bar */}
          <div className="bg-gradient-to-r from-[#1C4158] to-[#2E5874] text-white px-2 py-1 flex items-center justify-between text-xs font-semibold select-none">
            <div className="flex items-center space-x-1 truncate">
              <span className="text-[10px] leading-none">•</span>
              <span className="text-[11px] truncate tracking-wide text-gray-100">
                The page at http://localhost says:
              </span>
            </div>
            <div className="flex items-center space-x-0.5">
              <div className="w-3.5 h-3.5 bg-[#4A6475] border border-[#7A93A4] flex items-center justify-center text-[9px] text-gray-200">
                _
              </div>
              <div className="w-3.5 h-3.5 bg-[#4A6475] border border-[#7A93A4] flex items-center justify-center text-[9px] text-gray-200">
                <div className="w-2 h-2 border border-gray-200" />
              </div>
              <button
                type="button"
                onClick={onConfirm}
                className="w-3.5 h-3.5 bg-[#4A6475] hover:bg-red-700 border border-[#7A93A4] flex items-center justify-center text-[10px] text-gray-200 leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Window Content */}
          <div className="p-4 space-y-4">
            <div className="flex items-start space-x-3">
              {/* Yellow Warning Triangle Icon */}
              <div className="text-amber-500 font-extrabold text-2xl leading-none flex-shrink-0">
                ⚠️
              </div>
              <div className="text-xs font-sans text-gray-900 space-y-1 font-semibold leading-relaxed">
                <div className="font-bold text-sm text-gray-900 mb-1">
                  LNQR has been updated!
                </div>
                <div>Name: Cate Marie Gonzalez</div>
                <div>Card Number : 20221003LN000004</div>
                <div>New Sulit Coins: 32.63</div>
                <div>Sulit Coins Earn: 11.48</div>
              </div>
            </div>

            {/* OK Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onConfirm}
                className="min-w-[70px] px-4 py-1 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer"
                autoFocus
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
