import React from "react";

interface LogoutModalProps {
  isOpen: boolean;
  selectedButton: "YES" | "NO" | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutModal({
  isOpen,
  selectedButton,
  onConfirm,
  onCancel,
}: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
        <div className="w-[360px] bg-[#D4D0C8] border-4 border-[#228B22] shadow-2xl font-sans pointer-events-auto">
          {/* Green Title Bar */}
          <div className="bg-[#228B22] text-white px-3 py-1 font-bold text-sm text-center uppercase tracking-wide">
            LOGOUT
          </div>

          {/* Dialog Body */}
          <div className="p-6 space-y-6">
            <div className="text-center font-bold text-sm text-gray-900">
              Are you sure you want to LOGOUT?
            </div>

            {/* Action Buttons: Yes & No */}
            <div className="flex items-center justify-center space-x-6">
              <button
                type="button"
                onClick={onConfirm}
                className={`min-w-[80px] px-5 py-1.5 text-xs font-bold font-sans transition-all border-2 ${
                  selectedButton === "YES"
                    ? "bg-[#D4D0C8] border-red-600 ring-2 ring-red-500 shadow-inner text-black font-extrabold"
                    : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 hover:bg-[#E2E0DC]"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={onCancel}
                className={`min-w-[80px] px-5 py-1.5 text-xs font-bold font-sans transition-all border-2 ${
                  selectedButton === "NO"
                    ? "bg-[#D4D0C8] border-red-600 ring-2 ring-red-500 shadow-inner text-black font-extrabold"
                    : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 hover:bg-[#E2E0DC]"
                }`}
              >
                No
              </button>
            </div>

            <div className="text-center text-[11px] text-gray-500 font-mono">
              Press{" "}
              <kbd className="bg-white px-1 border text-gray-800 font-bold">
                TAB
              </kbd>{" "}
              to toggle,{" "}
              <kbd className="bg-white px-1 border text-gray-800 font-bold">
                ENTER
              </kbd>{" "}
              to confirm
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
