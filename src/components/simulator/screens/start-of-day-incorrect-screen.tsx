import React from "react";

interface StartOfDayIncorrectScreenProps {
  onBackToVerify?: () => void;
}

export function StartOfDayIncorrectScreen({
  onBackToVerify,
}: StartOfDayIncorrectScreenProps) {
  return (
    <div className="flex-1 h-full min-h-0 bg-white flex flex-col p-6 sm:p-8 select-none relative justify-center items-center overflow-y-auto">
      {/* Error Message */}
      <div className="flex flex-col items-center justify-center text-center space-y-6 my-auto py-6">
        <div className="text-2xl sm:text-3xl font-bold text-[#E4002B] font-sans tracking-tight">
          System date is incorrect!
        </div>

        <div className="text-base sm:text-xl font-bold text-[#E4002B] font-sans leading-relaxed max-w-xl">
          <p>Please call our technical support and helpdesk</p>
          <p>immediately at 7465833 or 6318061 loc.125 or 131 or</p>
          <p>email us at nbstasksupport@nationalbookstore.com.ph</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center pt-2">
        {onBackToVerify && (
          <button
            type="button"
            onClick={onBackToVerify}
            className="px-6 py-2 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer font-sans"
          >
            Return to Date Verification &lt;Esc&gt;
          </button>
        )}
      </div>
    </div>
  );
}
