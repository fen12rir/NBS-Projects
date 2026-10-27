import React from "react";

interface UserLoginScreenProps {
  loginUsername: string;
  loginPassword: string;
  onUsernameChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function UserLoginScreen({
  loginUsername,
  loginPassword,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  onCancel,
}: UserLoginScreenProps) {
  return (
    <div className="flex-1 h-full min-h-0 bg-white flex flex-col select-none relative">
      <div className="h-6 bg-[#FFF275] border-b border-gray-300" />

      <div className="flex-1 bg-[#ECE9D8] flex flex-col items-center justify-center p-6">
        <form
          onSubmit={onSubmit}
          className="w-[340px] bg-[#D4D0C8] border-4 border-[#228B22] shadow-2xl font-sans"
        >
          <div className="bg-[#228B22] text-white px-3 py-1 font-bold text-sm text-center uppercase tracking-wide">
            USER LOGIN
          </div>

          <div className="p-4 space-y-3">
            <div className="text-center text-xs font-semibold text-gray-700">
              Enter Information
            </div>

            <div>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => onUsernameChange(e.target.value)}
                placeholder="UserName"
                className="w-full bg-white border border-gray-500 px-2 py-1 text-center font-mono font-bold text-sm text-gray-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-green-600"
                autoFocus
              />
              <div className="text-[11px] text-gray-600 text-center font-sans mt-0.5">
                UserName
              </div>
            </div>

            <div>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Password"
                className="w-full bg-white border border-gray-500 px-2 py-1 text-center font-mono font-bold text-sm text-gray-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-green-600"
              />
              <div className="text-[11px] text-gray-600 text-center font-sans mt-0.5">
                Password
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="submit"
                className="min-w-[80px] px-4 py-1 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer"
              >
                Ok
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="min-w-[80px] px-4 py-1 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-700 font-sans space-y-0.5 text-left">
          <div>Press [F2] for Lookup</div>
          <div>Press [F3] for Masterfile Updates</div>
          <div>Press [F5] for Scandos</div>
          <div>Press [F10] to Activate E-Gift Card</div>
        </div>
      </div>

      <div className="h-6 bg-[#228B22]" />
    </div>
  );
}
