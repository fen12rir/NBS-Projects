"use client";

import React, { useReducer, useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { ReceiptModal } from "@/components/simulator/receipt-modal";
import { GuidedStepBar } from "@/components/simulator/guided-step-bar";
import { 
  posReducer, 
  createInitialPOSState, 
  calculateTotals, 
} from "@/lib/simulator/pos-state-machine";
import { RIGHT_FUNCTION_KEYS, RightFunctionKeyDef } from "@/data/exact-pos-keys";
import { SYNTHETIC_PRODUCTS } from "@/data/products";
import { 
  TRAINING_SCENARIOS, 
  TrainingScenario, 
  getScenarioForModule, 
  getScenarioById 
} from "@/data/scenarios";
import { recordScenarioAttempt } from "@/lib/progress/progress-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ShieldAlert } from "lucide-react";

function SimulatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();

  const moduleParam = searchParams.get("module");
  const scenarioParam = searchParams.get("scenario");

  const initialScenario = scenarioParam 
    ? getScenarioById(scenarioParam) 
    : moduleParam 
    ? getScenarioForModule(moduleParam) 
    : null;

  const [activeScenario, setActiveScenario] = useState<TrainingScenario | null>(initialScenario);

  const [state, dispatch] = useReducer(
    posReducer,
    createInitialPOSState("Jan Angela")
  );

  const [barcodeInput, setBarcodeInput] = useState("");
  const barcodeRef = useRef<HTMLInputElement>(null);

  const [qtyInput, setQtyInput] = useState("1");
  const qtyInputRef = useRef<HTMLInputElement>(null);

  const [cashTenderInput, setCashTenderInput] = useState("500");
  const [overridePass, setOverridePass] = useState("");

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState<
    { step: number; actionAttempted: string; expected: string; feedback: string }[]
  >([]);
  const [scenarioStartTime] = useState<number>(Date.now());
  const [isExamCompleted, setIsExamCompleted] = useState(false);

  useEffect(() => {
    if (!state.isQuantityInputActive && !state.activeLookupOpen && !state.managerOverrideOpen && !state.paymentDialogOpen) {
      barcodeRef.current?.focus();
    }
  }, [state.isQuantityInputActive, state.activeLookupOpen, state.managerOverrideOpen, state.paymentDialogOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.startsWith("F") && !isNaN(Number(e.key.substring(1)))) {
        e.preventDefault();
        handlePhysicalFKey(e.key.toUpperCase());
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handlePhysicalFKey = (fKey: string) => {
    if (fKey === "F2") {
      handleAction("LOOKUP");
      return;
    }
    if (fKey === "F10") {
      handleAction("CSA_TOGGLE");
      return;
    }
    if (fKey === "F11") {
      handleAction("PAGE_UP");
      return;
    }
    if (fKey === "F12") {
      handleAction("PAGE_DOWN");
      return;
    }

    const currentKeys = RIGHT_FUNCTION_KEYS[state.currentPage] || [];
    const matched = currentKeys.find((k) => k.key === fKey);
    if (matched && !matched.disabled) {
      handleAction(matched.actionId);
    }
  };

  const validateScenarioStep = (actionId: string, dataVal?: string | number) => {
    if (!activeScenario || isExamCompleted) return;
    const currentStep = activeScenario.steps[currentStepIndex];
    if (!currentStep) return;

    const actionMatches = currentStep.expectedAction === actionId;
    let dataMatches = true;
    if (currentStep.expectedData !== undefined) {
      dataMatches = String(currentStep.expectedData) === String(dataVal);
    }

    if (actionMatches && dataMatches) {
      setActiveHint(null);
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      if (nextIndex >= activeScenario.steps.length) {
        setIsExamCompleted(true);
        // Ignore final test/exam redirect for now: keep user in module practice mode
      }
    } else {
      setMistakes((prev) => [
        ...prev,
        {
          step: currentStepIndex + 1,
          actionAttempted: actionId + (dataVal ? " (" + dataVal + ")" : ""),
          expected: currentStep.expectedAction,
          feedback: currentStep.errorFeedback,
        },
      ]);
    }
  };

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case "LOOKUP":
        dispatch({ type: "OPEN_LOOKUP" });
        validateScenarioStep("LOOKUP");
        break;
      case "SET_QTY":
      case "SET_QTY_MODE":
        dispatch({ type: "SET_QUANTITY_START" });
        validateScenarioStep("SET_QTY_MODE");
        break;
      case "GO_PAYMENT":
        dispatch({ type: "OPEN_PAYMENT" });
        validateScenarioStep("GO_PAYMENT");
        break;
      case "NAV_SECOND":
        dispatch({ type: "NAVIGATE_PAGE", page: "SECOND" });
        validateScenarioStep("NAV_SECOND");
        break;
      case "NAV_THIRD":
        dispatch({ type: "NAVIGATE_PAGE", page: "THIRD" });
        validateScenarioStep("NAV_THIRD");
        break;
      case "NAV_FOURTH":
        dispatch({ type: "NAVIGATE_PAGE", page: "FOURTH" });
        validateScenarioStep("NAV_FOURTH");
        break;
      case "NAV_MAIN":
        dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
        validateScenarioStep("NAV_MAIN");
        break;
      case "PAY_BACK":
        dispatch({ type: "CLOSE_PAYMENT" });
        break;
      case "PAY_CASH":
        dispatch({ type: "SELECT_PAYMENT_METHOD", method: "CASH" });
        validateScenarioStep("PAY_CASH");
        break;
      case "PAY_CARD":
        dispatch({ type: "SELECT_PAYMENT_METHOD", method: "CARD/GCASH" });
        validateScenarioStep("PAY_CARD");
        break;
      case "ITEM_VOID":
        dispatch({ type: "REQUEST_MANAGER_OVERRIDE", targetAction: "Item Void" });
        validateScenarioStep("ITEM_VOID");
        break;
      case "TRX_VOID":
        dispatch({ type: "REQUEST_MANAGER_OVERRIDE", targetAction: "Transaction Void" });
        validateScenarioStep("TRX_VOID");
        break;
      case "SUSPEND":
        dispatch({ type: "SUSPEND_TRANSACTION" });
        validateScenarioStep("SUSPEND");
        break;
      case "RECALL":
        dispatch({ type: "REQUEST_MANAGER_OVERRIDE", targetAction: "Recall Transaction" });
        break;
      case "READING_Y":
        dispatch({ type: "TRIGGER_READING", readingType: "Y" });
        break;
      case "READING_Z":
        dispatch({ type: "TRIGGER_READING", readingType: "Z" });
        break;
      case "SDV_CHECK":
        dispatch({ type: "RUN_SDV_CHECK" });
        validateScenarioStep("SDV_CHECK");
        break;
      case "REPRINT":
        dispatch({ type: "REQUEST_MANAGER_OVERRIDE", targetAction: "Reprint Official Receipt" });
        break;
      case "POST_VOID":
        dispatch({ type: "REQUEST_MANAGER_OVERRIDE", targetAction: "Post Void" });
        break;
      case "LOGOUT":
        validateScenarioStep("LOGOUT");
        router.push("/dashboard");
        break;
      default:
        console.log("Unhandled action:", actionId);
    }
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const code = barcodeInput.trim();
    dispatch({ type: "ADD_ITEM_BY_CODE", code });
    validateScenarioStep("ADD_ITEM", code);
    setBarcodeInput("");
  };

  const handleConfirmQuantity = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(qtyInput, 10) || 1;
    dispatch({ type: "SET_QUANTITY_CONFIRM", quantity: qty });
    validateScenarioStep("CONFIRM_QTY", qty);
    setQtyInput("1");
  };

  const handleConfirmTender = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(cashTenderInput) || 0;
    dispatch({ type: "TENDER_PAYMENT", amount });
    validateScenarioStep("CONFIRM_TENDER", amount);
  };

  const handleConfirmOverride = () => {
    dispatch({ type: "CONFIRM_MANAGER_OVERRIDE" });
    validateScenarioStep("CONFIRM_OVERRIDE");
    setOverridePass("");
  };

  const handleShowHint = () => {
    if (!activeScenario) return;
    const currentStep = activeScenario.steps[currentStepIndex];
    if (currentStep) {
      setActiveHint(currentStep.hint);
      setHintsUsed((prev) => prev + 1);
    }
  };

  const handleResetExam = () => {
    dispatch({ type: "RESET_TRANSACTION" });
    setCurrentStepIndex(0);
    setMistakes([]);
    setHintsUsed(0);
    setActiveHint(null);
    setIsExamCompleted(false);
  };

  const handleResetTerminal = () => {
    dispatch({ type: "RESET_TRANSACTION" });
    setBarcodeInput("");
  };

  const handleFillBarcode = (code: string) => {
    setBarcodeInput(code);
    dispatch({ type: "ADD_ITEM_BY_CODE", code });
    validateScenarioStep("ADD_ITEM", code);
    setBarcodeInput("");
  };

  const handleSelectScenario = (scenarioId: string | null) => {
    if (!scenarioId) {
      setActiveScenario(null);
    } else {
      const scen = getScenarioById(scenarioId);
      setActiveScenario(scen);
    }
    setCurrentStepIndex(0);
    setMistakes([]);
    setHintsUsed(0);
    setActiveHint(null);
    setIsExamCompleted(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white font-mono text-sm">
        Loading POS Terminal session...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-4 font-sans">
        <div className="max-w-md w-full bg-white border-4 border-gray-900 p-8 space-y-6 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-100 text-[#E4002B] rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              Authentication Required
            </h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              The POS Terminal Simulator is restricted to authorized employees and trainees. Please sign in or use Local Demo Mode to access the terminal.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/">
              <Button className="w-full bg-[#E4002B] hover:bg-[#C10024] font-bold text-white py-3">
                Go to Sign In / Demo Mode
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totals = calculateTotals(state.lineItems);
  const activeItems = state.lineItems.filter((i) => !i.isVoided);
  const lastItem = activeItems[activeItems.length - 1];
  const rightKeys = RIGHT_FUNCTION_KEYS[state.currentPage] || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-900 font-sans select-none">
      {/* Top Trainer Navigation Bar */}
      <header className="bg-black text-white px-4 py-1.5 flex items-center justify-between text-xs font-mono border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard" className="flex items-center space-x-1 text-gray-400 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <span className="text-gray-600">|</span>
          <span className="font-bold text-red-500 uppercase">
            NBS Cashier POS Screen Fidelity Simulator
          </span>
        </div>
        <div className="text-gray-400 text-[11px]">
          {activeScenario ? `Guided Mode: ${activeScenario.title}` : "Free Exploration Mode"}
        </div>
      </header>

      {/* Guided Instruction Bar */}
      <GuidedStepBar
        scenario={activeScenario}
        currentStepIndex={currentStepIndex}
        hintsUsed={hintsUsed}
        mistakesCount={mistakes.length}
        onShowHint={handleShowHint}
        onResetScenario={handleResetExam}
        onResetTerminal={handleResetTerminal}
        activeHint={activeHint}
        onSelectScenario={handleSelectScenario}
        onFillBarcode={handleFillBarcode}
      />

      {/* EXACT POS TERMINAL CONTAINER (Matches Slide 006) */}
      <div className="flex-1 p-2 sm:p-4 flex items-center justify-center">
        <div className="w-full max-w-[1080px] bg-[#B0B8C0] border-4 border-[#7A8A99] shadow-2xl flex flex-col font-sans overflow-hidden">
          
          {/* 1. TOP HEADER STATUS BAR (Trx, Clerk, Str No, Reg No) */}
          <div className="bg-[#B0B8C0] border-b border-gray-500 px-3 py-1 flex items-center justify-between text-[11px] font-bold text-gray-900 font-mono tracking-tight">
            <div>
              Trx.: <span className="font-normal font-mono">0212202629990003000592</span>
            </div>
            <div>
              Clerk: <span className="font-normal">Jan Angela</span>
            </div>
            <div>
              Str No.: <span className="font-normal">2999</span>
            </div>
            <div>
              Reg No.: <span className="font-normal">0003</span>
            </div>
          </div>

          {/* MAIN WORKING AREA (Left 80% + Right 20% Function Column) */}
          <div className="flex-1 grid grid-cols-12 min-h-[500px] bg-white">
            
            {/* LEFT 10 COLS: Scanner, Black Display, Top F-Keys, Line Items Table */}
            <div className="col-span-10 flex flex-col border-r-2 border-gray-400">
              
              {/* TOP ROW: Yellow Barcode Input + Black LED Customer Display */}
              <div className="grid grid-cols-12 border-b-2 border-gray-400">
                
                {/* Yellow Barcode Scanner Box (Cols 1-6) */}
                <div className="col-span-6 bg-[#FFF275] border-r border-gray-400 p-2 flex flex-col justify-center">
                  <div className="text-center font-bold text-xs text-gray-900 tracking-wide mb-1 font-sans">
                    Scan or Enter UPC
                  </div>
                  <form onSubmit={handleBarcodeSubmit}>
                    <input
                      ref={barcodeRef}
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder=""
                      className="w-full bg-white border border-gray-500 px-2 py-1 text-sm font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-inner"
                    />
                  </form>
                </div>

                {/* Black Real-Time Price/Subtotal Display Box (Cols 7-12) */}
                <div className="col-span-6 bg-black text-white p-2 font-mono flex flex-col justify-between">
                  <div className="grid grid-cols-2 text-xs">
                    <div className="space-y-0.5">
                      <div className="text-[#38BDF8] font-bold">SubTotal:</div>
                      <div className="text-gray-300">Quantity:</div>
                      <div className="text-[#4ADE80] font-bold">Unit Price:</div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <div className="text-[#38BDF8] font-bold">{totals.totalAmount.toFixed(2)}</div>
                      <div className="text-gray-300">{totals.totalQty}</div>
                      <div className="text-[#4ADE80] font-bold">
                        {lastItem ? lastItem.unitPrice.toFixed(2) : "0.00"}
                      </div>
                    </div>
                  </div>

                  {/* Huge Bright Green Total Display */}
                  <div className="text-right text-3xl sm:text-4xl font-mono font-bold text-[#00FF66] tracking-wider pt-1">
                    {totals.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* 4 TOP HORIZONTAL FUNCTION BUTTONS (F11 Up, F12 Down, F10 CSA, F2 Lookup) */}
              <div className="grid grid-cols-4 bg-[#C2CAD0] border-b-2 border-gray-400 text-center font-sans">
                <button
                  type="button"
                  onClick={() => handleAction("PAGE_UP")}
                  className="p-1.5 border-r border-gray-400 hover:bg-[#B0B8C0] active:bg-gray-400 flex flex-col items-center justify-center"
                >
                  <div className="w-0 h-0 border-x-8 border-x-transparent border-b-[12px] border-b-[#16A34A] mb-0.5"></div>
                  <span className="text-[10px] font-bold text-gray-800">F11</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction("PAGE_DOWN")}
                  className="p-1.5 border-r border-gray-400 hover:bg-[#B0B8C0] active:bg-gray-400 flex flex-col items-center justify-center"
                >
                  <div className="w-0 h-0 border-x-8 border-x-transparent border-t-[12px] border-t-[#16A34A] mb-0.5"></div>
                  <span className="text-[10px] font-bold text-gray-800">F12</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction("CSA_TOGGLE")}
                  className="p-1.5 border-r border-gray-400 hover:bg-[#B0B8C0] active:bg-gray-400 flex flex-col items-center justify-center"
                >
                  <span className="text-[11px] font-bold text-gray-900 leading-tight">CSA ON/OFF</span>
                  <span className="text-[10px] font-bold text-[#1D4ED8]">F10</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction("LOOKUP")}
                  className="p-1.5 hover:bg-[#B0B8C0] active:bg-gray-400 flex flex-col items-center justify-center bg-gray-200"
                >
                  <span className="text-[11px] font-bold text-gray-900 leading-tight">Lookup</span>
                  <span className="text-[10px] font-bold text-[#1D4ED8]">F2</span>
                </button>
              </div>

              {/* TABLE COLUMN HEADERS (LN, UPC, Description, Qty, SRP, Amount, Type) */}
              <div className="bg-[#B8C2CC] border-b border-gray-400 px-2 py-1 text-[11px] font-bold text-gray-800 grid grid-cols-12 text-center uppercase tracking-tight">
                <span className="col-span-1 text-left">LN</span>
                <span className="col-span-3 text-left">UPC</span>
                <span className="col-span-4 text-left">Description</span>
                <span className="col-span-1">Qty</span>
                <span className="col-span-1 text-right">SRP</span>
                <span className="col-span-1 text-right">Amount</span>
                <span className="col-span-1 text-right">Type</span>
              </div>

              {/* LINE ITEM SCREEN PAGE (White Scrollable Rows) */}
              <div className="flex-1 bg-white overflow-y-auto p-1 font-mono text-xs divide-y divide-gray-100 min-h-[300px]">
                {state.lineItems.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400 italic text-xs py-16">
                    Line item screen page (Scan or Enter UPC above)
                  </div>
                ) : (
                  state.lineItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className={"grid grid-cols-12 py-1 px-1 items-center text-[11px] " + (
                        item.isVoided ? "line-through text-red-600 bg-red-50" : "text-gray-900"
                      )}
                    >
                      <span className="col-span-1 text-left font-bold">{idx + 1}</span>
                      <span className="col-span-3 text-left truncate">{item.sku}</span>
                      <span className="col-span-4 text-left font-bold truncate pr-1">{item.description}</span>
                      <span className="col-span-1 text-center font-bold">
                        {item.isVoided ? "-" + item.quantity : item.quantity}
                      </span>
                      <span className="col-span-1 text-right text-gray-700">{item.unitPrice.toFixed(2)}</span>
                      <span className="col-span-1 text-right font-bold">{item.total.toFixed(2)}</span>
                      <span className="col-span-1 text-right text-gray-500">REG</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT 2 COLS: VERTICAL FUNCTION KEYS PANEL (Exact Red & Silver Buttons from Image) */}
            <div className="col-span-2 bg-[#9AA5B1] p-1 flex flex-col justify-between border-l border-gray-400 space-y-1">
              {rightKeys.map((kDef) => {
                const isRed = kDef.variant === "red";
                return (
                  <button
                    key={kDef.key}
                    disabled={kDef.disabled}
                    onClick={() => handleAction(kDef.actionId)}
                    className={
                      "w-full flex-1 min-h-[50px] p-1 flex flex-col items-center justify-center border font-sans select-none shadow-sm transition-all " +
                      (kDef.disabled
                        ? "bg-gray-400 border-gray-500 text-gray-600 cursor-not-allowed opacity-50"
                        : isRed
                        ? "bg-[#E4002B] hover:bg-[#C10024] active:bg-[#9B001D] text-white border-red-700"
                        : "bg-[#D2D7DF] hover:bg-[#E2E6EC] active:bg-[#B8BFC9] text-gray-900 border-gray-400")
                    }
                  >
                    <span className="text-[11px] font-bold leading-tight uppercase">
                      {kDef.label}
                    </span>
                    <span
                      className={
                        "text-[10px] font-extrabold " +
                        (isRed ? "text-yellow-300" : "text-[#1D4ED8]")
                      }
                    >
                      {kDef.key}
                    </span>
                  </button>
                );
              })}

              <div className="text-center font-mono text-[9px] text-gray-700 pt-1 border-t border-gray-400">
                Page: 0/0
              </div>
            </div>
          </div>

          {/* 3. BOTTOM FOOTER STATUS BAR (Total Qty, Total Sales, Date, Time) */}
          <div className="bg-[#B0B8C0] border-t-2 border-gray-500 grid grid-cols-12 text-xs font-sans items-stretch">
            
            {/* Total Qty (Yellow box) */}
            <div className="col-span-4 bg-[#FFF275] border-r-2 border-gray-500 px-3 py-1.5 flex items-center justify-between">
              <span className="font-bold text-gray-900">Total Qty</span>
              <span className="font-mono font-bold text-base bg-white px-3 py-0.5 border border-gray-400 text-gray-900 min-w-[50px] text-center">
                {totals.totalQty}
              </span>
            </div>

            {/* Total Sales (Green bar) */}
            <div className="col-span-4 bg-[#16A34A] border-r-2 border-gray-500 px-3 py-1.5 flex items-center justify-between text-white">
              <span className="font-bold">Total Sales:</span>
              <span className="font-mono font-bold text-base bg-white px-3 py-0.5 border border-gray-400 text-gray-900 min-w-[70px] text-right">
                {totals.totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Date Display */}
            <div className="col-span-2 bg-[#C2CAD0] border-r-2 border-gray-500 px-2 py-1.5 flex items-center justify-center font-bold text-gray-800 text-[11px]">
              2026-Feb-12
            </div>

            {/* Time Display */}
            <div className="col-span-2 bg-[#C2CAD0] px-2 py-1.5 flex items-center justify-center font-bold text-gray-800 text-[11px]">
              09:04:03 AM
            </div>
          </div>
        </div>
      </div>

      {/* QUICK CATALOG PICKER (For Trainee Accessibility) */}
      <div className="max-w-[1080px] w-full mx-auto px-4 pb-4">
        <div className="bg-gray-800 p-2 border border-gray-700 text-xs font-mono text-gray-300 flex items-center space-x-2 overflow-x-auto">
          <span className="text-yellow-400 font-bold whitespace-nowrap">Catalog Quick-Fill:</span>
          {SYNTHETIC_PRODUCTS.map((p) => (
            <button
              key={p.sku}
              type="button"
              onClick={() => setBarcodeInput(p.sku)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded-none border border-gray-500 whitespace-nowrap text-[11px]"
            >
              {p.sku} ({p.srp} PHP)
            </button>
          ))}
        </div>
      </div>

      {/* F2 LOOKUP MODAL */}
      {state.activeLookupOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 max-w-2xl w-full p-6 space-y-4 font-mono text-xs border-4 border-gray-900 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold uppercase text-[#E4002B]">
                F2 Item Inquiry / Lookup (SRP & Promo Price)
              </h3>
              <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "CLOSE_LOOKUP" })}>
                ESC / Close
              </Button>
            </div>
            <Input
              placeholder="Search by description or SKU..."
              value={state.lookupSearchTerm}
              onChange={(e) => dispatch({ type: "SEARCH_LOOKUP", term: e.target.value })}
              className="w-full text-xs"
            />
            <div className="max-h-60 overflow-y-auto border border-gray-200 divide-y">
              {state.lookupResults.map((p) => (
                <div
                  key={p.sku}
                  onClick={() => {
                    setBarcodeInput(p.sku);
                    dispatch({ type: "CLOSE_LOOKUP" });
                  }}
                  className="p-2 hover:bg-red-50 cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold block">{p.description}</span>
                    <span className="text-[10px] text-gray-400">SKU: {p.sku} • {p.barcode}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 line-through text-[10px] block">
                      {p.promoPrice ? "SRP: ₱" + p.srp.toFixed(2) : ""}
                    </span>
                    <span className="font-bold text-[#E4002B] text-xs">
                      ₱{(p.promoPrice ?? p.srp).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* F3 QUANTITY MODAL */}
      {state.isQuantityInputActive && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmQuantity}
            className="bg-white text-gray-900 max-w-sm w-full p-6 space-y-4 font-mono text-xs border-4 border-gray-900 shadow-2xl"
          >
            <div className="border-b pb-2">
              <h3 className="text-sm font-bold uppercase text-gray-900">F3 Quantity Entry</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Enter multiplier before scanning item (Slide 29).</p>
            </div>
            <Input
              type="number"
              min="1"
              max="999"
              ref={qtyInputRef}
              value={qtyInput}
              onChange={(e) => setQtyInput(e.target.value)}
              className="text-lg font-bold text-center"
              autoFocus
            />
            <div className="flex space-x-2 pt-2">
              <Button type="submit" size="sm" className="w-full bg-[#E4002B] hover:bg-[#C10024] font-bold text-xs">
                ENTER / Confirm
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => dispatch({ type: "SET_QUANTITY_CANCEL" })} className="w-full text-xs">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {state.paymentDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 max-w-md w-full p-6 space-y-4 font-mono text-xs border-4 border-gray-900 shadow-2xl">
            <div className="flex justify-between border-b pb-2">
              <div>
                <h3 className="text-sm font-bold uppercase text-[#E4002B]">Payment Menu • Tender Options</h3>
                <span className="text-[10px] text-gray-500">
                  Total Due: <strong>{formatCurrency(totals.totalAmount)}</strong>
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "CLOSE_PAYMENT" })}>
                Cancel / ESC
              </Button>
            </div>

            {!state.selectedPaymentMethod ? (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  onClick={() => handleAction("PAY_CASH")}
                  className="bg-[#E4002B] hover:bg-[#C10024] text-white font-bold py-3 text-xs flex flex-col items-center"
                >
                  <span>F2 CASH</span>
                  <span className="text-[9px] opacity-80">Philippine Peso</span>
                </Button>
                <Button
                  onClick={() => handleAction("PAY_CARD")}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 text-xs flex flex-col items-center"
                >
                  <span>F3 BANK CARD</span>
                  <span className="text-[9px] opacity-80">Credit / GCash</span>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleConfirmTender} className="space-y-4 pt-2">
                <div className="bg-gray-100 p-3 space-y-1">
                  <div className="text-[10px] text-gray-500">Tender Method:</div>
                  <div className="font-bold text-sm text-gray-900">{state.selectedPaymentMethod}</div>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-xs">Enter Cash Amount Handed (PHP):</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={cashTenderInput}
                    onChange={(e) => setCashTenderInput(e.target.value)}
                    className="text-lg font-bold text-center"
                    autoFocus
                  />
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button type="submit" className="w-full bg-[#E4002B] hover:bg-[#C10024] font-bold text-xs">
                    Confirm Payment & Print OR
                  </Button>
                  <Button type="button" variant="outline" onClick={() => dispatch({ type: "SELECT_PAYMENT_METHOD", method: "" })} className="text-xs">
                    Back
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MANAGER OVERRIDE MODAL */}
      {state.managerOverrideOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 max-w-sm w-full p-6 space-y-4 font-mono text-xs border-4 border-amber-600 shadow-2xl">
            <div className="border-b border-amber-200 pb-2">
              <div className="flex items-center space-x-2 text-amber-700 font-bold uppercase text-xs">
                <ShieldAlert className="w-4 h-4" />
                <span>Manager Authorization Required</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Action: <strong>{state.managerOverrideTarget}</strong></p>
            </div>
            <Input
              type="password"
              value={overridePass}
              onChange={(e) => setOverridePass(e.target.value)}
              placeholder="Enter mock password..."
              className="text-xs font-mono"
              autoFocus
            />
            <div className="flex space-x-2 pt-2">
              <Button onClick={handleConfirmOverride} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase">
                Approve (Training)
              </Button>
              <Button variant="outline" onClick={() => dispatch({ type: "CANCEL_MANAGER_OVERRIDE" })} className="w-full text-xs">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL RECEIPT MODAL */}
      {state.isTransactionCompleted && (
        <ReceiptModal
          state={state}
          onClose={() => {
            dispatch({ type: "RESET_TRANSACTION" });
            if (activeScenario) {
              setCurrentStepIndex(0);
              setMistakes([]);
              setIsExamCompleted(false);
            }
          }}
          onReset={() => {
            dispatch({ type: "RESET_TRANSACTION" });
            if (activeScenario) {
              setCurrentStepIndex(0);
              setMistakes([]);
              setIsExamCompleted(false);
            }
          }}
        />
      )}
    </div>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center font-mono text-sm">
          Loading POS Simulator...
        </div>
      }
    >
      <SimulatorContent />
    </Suspense>
  );
}
