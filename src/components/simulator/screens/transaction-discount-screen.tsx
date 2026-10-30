"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DISCOUNT_OPTIONS = [
  { code: "ZEIP", description: "Employee Incentive Program" },
  { code: "ZEM1", description: "Employee Disc - Book" },
  { code: "ZEM2", description: "Employee Disc - Sap" },
  { code: "ZMDP", description: "SM Online Disc Promo" },
  { code: "ZOZM", description: "ONLINE ORDER - ZINGMALL" },
  { code: "ZPO1", description: "Powercard - Books" },
  { code: "ZPWD", description: "Pwd" },
  { code: "ZQCR", description: "LNQR Classroom Disc" },
  { code: "ZQFD", description: "LNQR Family Disc" },
  { code: "ZQRP", description: "LNQR Plus Disc" },
  { code: "ZSBS", description: "Special Markdown Sale Price" },
  { code: "ZSEN", description: "Senior Citizen Discount" },
  { code: "ZSPD", description: "NBS School Day Discount" },
  { code: "ZSPM", description: "School Portal Disc (SM Molino Only)" },
  { code: "ZSSD", description: "Speciality Store Discount Card" },
  { code: "ZTDY", description: "Teachers Day" },
  { code: "ZTIP", description: "Teachers Incentive Program" },
  { code: "ZTNP", description: "Tindahan ni Aling Puring Discount" },
];

const DISCOUNT_RATES: Record<string, number> = {
  ZEIP: 5,
  ZEM1: 15,
  ZEM2: 15,
  ZMDP: 10,
  ZOZM: 5,
  ZPO1: 5,
  ZPWD: 20,
  ZQCR: 10,
  ZQFD: 10,
  ZQRP: 10,
  ZSBS: 30,
  ZSEN: 20,
  ZSPD: 5,
  ZSPM: 5,
  ZSSD: 10,
  ZTDY: 5,
  ZTIP: 5,
  ZTNP: 5,
};

export function getDiscountPercent(code: string): number | undefined {
  return DISCOUNT_RATES[code];
}

type DiscountOption = (typeof DISCOUNT_OPTIONS)[number];

interface TransactionDiscountScreenProps {
  onCancel: () => void;
  onSubmit: (discount: DiscountOption & { percent: number }) => void;
  clerkName?: string;
  terminalId?: string;
  branchCode?: string;
}

export function TransactionDiscountScreen({
  onCancel,
  onSubmit,
  clerkName = "Jan Angela",
  terminalId = "0003",
  branchCode = "2999",
}: TransactionDiscountScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const selectedRowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    selectedRowRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const submitDiscount = useCallback((discount: DiscountOption) => {
    const percent = getDiscountPercent(discount.code);

    if (percent === undefined) {
      setSubmitError(`No rate is configured for ${discount.code} yet.`);
      return;
    }

    setSubmitError(null);
    onSubmit({ ...discount, percent });
  }, [onSubmit]);

  const submitSelectedDiscount = useCallback(() => {
    submitDiscount(DISCOUNT_OPTIONS[selectedIndex]);
  }, [selectedIndex, submitDiscount]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" ||
        (event.altKey && event.key.toLowerCase() === "b")
      ) {
        event.preventDefault();
        onCancel();
      } else if (event.key === "ArrowUp" || event.key === "F11") {
        event.preventDefault();
        setSelectedIndex((index) => Math.max(0, index - 1));
      } else if (event.key === "ArrowDown" || event.key === "F12") {
        event.preventDefault();
        setSelectedIndex((index) =>
          Math.min(DISCOUNT_OPTIONS.length - 1, index + 1)
        );
      } else if (event.altKey && event.key === "Enter") {
        event.preventDefault();
        submitSelectedDiscount();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, submitSelectedDiscount, selectedIndex]);

  const today = new Date();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const todayLabel = `${today.getFullYear()}-${months[today.getMonth()]}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  return (
    <div className="flex min-h-0 w-full flex-1 select-none flex-col overflow-hidden bg-white font-sans">
      <div className="flex h-7 w-full flex-shrink-0 items-center justify-between border-y border-gray-400 border-t-white bg-[#BCC4CC] px-4 py-1 font-mono text-[11px] text-gray-900">
        <span><span className="font-bold">Clerk:</span> {clerkName}</span>
        <span><span className="font-bold">Str No.:</span> {branchCode}</span>
        <span><span className="font-bold">Reg No.:</span> {terminalId}</span>
        <span className="font-bold">{todayLabel}</span>
      </div>

      <div className="border-b-2 border-gray-500 bg-[#FFF275] py-1 text-center font-sans text-xs font-bold uppercase tracking-wide text-gray-900 sm:text-sm">
        Transaction Discount
      </div>

      <div className="flex h-[48px] flex-shrink-0 items-stretch border-b-2 border-gray-400 bg-[#C2CAD0]">
        <div className="flex items-stretch border-r border-gray-400">
          <button
            type="button"
            onClick={() => setSelectedIndex((index) => Math.max(0, index - 1))}
            aria-label="Previous discount option"
            className="flex w-[56px] flex-col items-center justify-center border-r border-gray-400 bg-[#D2D7DF] p-1 hover:bg-[#E2E6EC]"
          >
            <span className="mb-0.5 h-0 w-0 border-x-[7px] border-b-[10px] border-x-transparent border-b-[#16A34A]" />
            <span className="text-[10px] font-bold text-gray-900">F11</span>
          </button>
          <button
            type="button"
            onClick={() =>
              setSelectedIndex((index) =>
                Math.min(DISCOUNT_OPTIONS.length - 1, index + 1)
              )
            }
            aria-label="Next discount option"
            className="flex w-[56px] flex-col items-center justify-center bg-[#D2D7DF] p-1 hover:bg-[#E2E6EC]"
          >
            <span className="mb-0.5 h-0 w-0 border-x-[7px] border-t-[10px] border-x-transparent border-t-[#16A34A]" />
            <span className="text-[10px] font-bold text-gray-900">F12</span>
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center bg-[#C2CAD0] px-4">
          <span className="text-base font-bold tracking-tight text-gray-900">
            Select Discount Type
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 border-b border-gray-400 bg-[#B8C2CC] px-2 py-1 text-center font-sans text-[11px] font-bold uppercase tracking-tight text-gray-800">
        <span className="col-span-3 text-left">Code</span>
        <span className="col-span-9 text-left">Description</span>
      </div>

      <div
        aria-label="Discount options"
        className="min-h-[300px] flex-1 overflow-y-auto bg-white font-mono text-xs"
      >
        <table className="w-full border-collapse text-left">
          <tbody>
            {DISCOUNT_OPTIONS.map((discount, index) => (
              <tr
                key={discount.code}
                ref={selectedIndex === index ? selectedRowRef : null}
                aria-selected={selectedIndex === index}
                onClick={() => {
                  setSelectedIndex(index);
                  setSubmitError(null);
                }}
                onDoubleClick={() => {
                  setSelectedIndex(index);
                  submitDiscount(discount);
                }}
                className={`cursor-pointer border-b border-gray-200 ${
                  selectedIndex === index
                    ? "bg-[#9ACD32] font-bold text-black"
                    : "text-gray-900 hover:bg-blue-50"
                }`}
              >
                <td className="w-1/4 px-2 py-1.5 font-mono font-bold sm:px-6">
                  {discount.code}
                </td>
                <td className="w-3/4 px-2 py-1.5 sm:px-6">
                  {discount.description}
                  {getDiscountPercent(discount.code) !== undefined && (
                    <span className="float-right font-bold">
                      {getDiscountPercent(discount.code)}%
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-shrink-0 flex-col items-center gap-2 border-t-2 border-black bg-[#388E3C] p-2">
        {submitError && (
          <p role="alert" className="text-center text-xs font-bold text-white">
            {submitError}
          </p>
        )}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={submitSelectedDiscount}
            className="min-w-[140px] cursor-pointer border-2 border-b-[#404040] border-l-white border-r-[#404040] border-t-white bg-[#D4D0C8] px-4 py-1.5 text-xs font-extrabold text-black shadow active:border-b-white active:border-l-[#404040] active:border-r-white active:border-t-[#404040]"
          >
            SELECT &lt;Alt-Enter&gt;
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="min-w-[140px] cursor-pointer border-2 border-b-[#404040] border-l-white border-r-[#404040] border-t-white bg-[#D4D0C8] px-4 py-1.5 text-xs font-extrabold text-black shadow active:border-b-white active:border-l-[#404040] active:border-r-white active:border-t-[#404040]"
          >
            CANCEL &lt;Alt-B&gt;
          </button>
        </div>
      </div>
    </div>
  );
}
