"use client";

import React, { useReducer, useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { ReceiptModal } from "@/components/simulator/modals/receipt-modal";
import { GuidedStepBar } from "@/components/simulator/guided-step-bar";
import { F2LookupScreen } from "@/components/simulator/screens/f2-lookup-screen";
import { ManagerOverrideModal } from "@/components/simulator/modals/manager-override-modal";
import { ItemVoidModal } from "@/components/simulator/modals/item-void-modal";
import { TransactionDiscountModal } from "@/components/simulator/modals/transaction-discount-modal";
import { TrxVoidModal } from "@/components/simulator/modals/trx-void-modal";
import { QuantityModal } from "@/components/simulator/modals/quantity-modal";
import { SuspendModal, RecallModal } from "@/components/simulator/modals/suspend-recall-modal";
import { ReprintModal } from "@/components/simulator/modals/reprint-modal";
import { SdvModal } from "@/components/simulator/modals/sdv-modal";
import { ReadingsModal } from "@/components/simulator/modals/readings-modal";
import { TransactionCommentScreen } from "@/components/simulator/screens/transaction-comment-screen";
import { ReturnRefundModal } from "@/components/simulator/modals/return-refund-modal";
import { ElectronicPaymentModal, CardTenderType } from "@/components/simulator/modals/electronic-payment-modal";
import { PostVoidModal } from "@/components/simulator/modals/post-void-modal";
import { PriceChangeModal } from "@/components/simulator/modals/price-change-modal";
import { NonMdseModal } from "@/components/simulator/modals/non-mdse-modal";
import { JournalViewerModal } from "@/components/simulator/modals/journal-viewer-modal";
import { NonSalesModal } from "@/components/simulator/modals/non-sales-modal";
import { BonusBuyScreen } from "@/components/simulator/screens/bonus-buy-screen";
import { ChooseOptionScreen } from "@/components/simulator/screens/choose-option-screen";
import { BdoCardTerminal } from "@/components/simulator/terminals/bdo-card-terminal";
import { GcashTerminalPreview } from "@/components/simulator/terminals/gcash-terminal-preview";
import { MayaTerminalReceipt } from "@/components/simulator/terminals/maya-terminal-receipt";
import { LogoutModal } from "@/components/simulator/modals/logout-modal";
import { LnqrUpdatedModal } from "@/components/simulator/modals/lnqr-updated-modal";
import { ScenarioCompleteModal } from "@/components/simulator/modals/scenario-complete-modal";
import { StartOfDayVerifyScreen } from "@/components/simulator/screens/start-of-day-verify-screen";
import { StartOfDayCloseScreen } from "@/components/simulator/screens/start-of-day-close-screen";
import { PosReloaderScreen } from "@/components/simulator/screens/pos-reloader-screen";
import { UserLoginScreen } from "@/components/simulator/screens/user-login-screen";
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
import { TRAINING_MODULES } from "@/data/modules";
import { recordScenarioAttempt } from "@/lib/progress/progress-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ShieldAlert, Trophy, CheckCircle, RotateCcw, ArrowRight, Sparkles } from "lucide-react";

export type POSTerminalMode = "START_OF_DAY_VERIFY" | "START_OF_DAY_CLOSE" | "POS_RELOADER" | "USER_LOGIN" | "ACTIVE_REGISTER";

const CARD_TYPES = [
  "-SELECT-",
  "CREDIT CARD",
  "SODEXHO",
  "SWEEP",
  "DEPOSIT",
  "TAX WITHHELD",
  "Art Bar Shopee",
  "ATOME",
  "BILLEASE",
  "BPI QRPH",
  "Globe Rewards",
  "GCASH",
  "MAYA",
  "NBS GIFTCARD",
  "LNQR E-GC",
  "LNQR Sulit Coins",
];

function generateInvoiceNumber() {
  return Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
}

function generateApprovalCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 6 }, () =>
    characters[Math.floor(Math.random() * characters.length)]
  ).join("");
}

function generateGcashReferenceNumber() {
  return Math.floor(Math.random() * 10_000_000_000)
    .toString()
    .padStart(10, "0");
}

function generateMayaTraceNumber() {
  return Math.floor(1000 + Math.random() * 90000)
    .toString()
    .padStart(8, "0");
}

function generateMayaReferenceNumber() {
  const characters = "0123456789ABCDEF";
  return Array.from({ length: 12 }, () =>
    characters[Math.floor(Math.random() * characters.length)]
  ).join("");
}

const TERMINAL_OPTIONS = [
  "-SELECT-",
  "BDO POS",
  "MAYA POS",
  "TERMINAL 1",
  "TERMINAL 2",
];

const isEwalletCardType = (type: string) => {
  const t = (type || "").toUpperCase();
  return (
    t === "GCASH" ||
    t === "MAYA" ||
    t === "BPI QRPH" ||
    t === "ATOME" ||
    t === "BILLEASE" ||
    t === "GLOBE REWARDS" ||
    t === "LNQR E-GC" ||
    t === "LNQR SULIT COINS"
  );
};

function getInitialTerminalMode(scenario: TrainingScenario | null): POSTerminalMode {
  if (!scenario) return "ACTIVE_REGISTER";
  if (scenario.id === "scen-les-2-1" || scenario.id === "scen-mod-2") return "START_OF_DAY_VERIFY";
  if (scenario.id === "scen-les-2-2") return "USER_LOGIN";
  return "ACTIVE_REGISTER";
}

function SimulatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();

  const moduleParam = searchParams.get("module");
  const scenarioParam = searchParams.get("scenario");
  const lessonParam = searchParams.get("lesson");

  const initialScenario = scenarioParam 
    ? getScenarioById(scenarioParam) 
    : moduleParam 
    ? getScenarioForModule(moduleParam) 
    : null;

  const [activeScenario, setActiveScenario] = useState<TrainingScenario | null>(initialScenario);

  const targetLessonId = activeScenario?.lessonRef || lessonParam || (
    activeScenario?.moduleRef 
      ? TRAINING_MODULES.find((m) => m.id === activeScenario.moduleRef)?.lessons[0]?.id 
      : null
  );
  const targetModuleId = activeScenario?.moduleRef || moduleParam || (
    targetLessonId
      ? TRAINING_MODULES.find((m) => m.lessons.some((l) => l.id === targetLessonId))?.id
      : null
  );

  const isLessonSpecific = Boolean(lessonParam || activeScenario?.lessonRef);
  const returnLessonUrl = isLessonSpecific && targetModuleId && targetLessonId
    ? `/modules/${targetModuleId}/lessons/${targetLessonId}`
    : targetModuleId
    ? `/modules/${targetModuleId}`
    : "/dashboard";
  const returnButtonLabel = isLessonSpecific ? "Back to Lesson" : "Back to Module";
  const [terminalMode, setTerminalMode] = useState<POSTerminalMode>(
    getInitialTerminalMode(initialScenario)
  );

  const [selectedSodButton, setSelectedSodButton] = useState<"YES" | "NO" | null>(null);
  const [loginUsername, setLoginUsername] = useState("241209");
  const [loginPassword, setLoginPassword] = useState("******");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [selectedLogoutButton, setSelectedLogoutButton] = useState<"YES" | "NO" | null>(null);

  // Module 3: LNQR Loyalty States
  const [isLoyaltyOptionOpen, setIsLoyaltyOptionOpen] = useState(false);
  const [selectedLoyaltyOption, setSelectedLoyaltyOption] = useState<number | null>(null);
  const [loyaltyType, setLoyaltyType] = useState<"NONE" | "LNC" | "LNQR">("NONE");

  // Option 2: Laking National Card
  const [isLncCardScreenOpen, setIsLncCardScreenOpen] = useState(false);
  const [customerLncInput, setCustomerLncInput] = useState("1008-2024-9901");
  const [selectedLncButton, setSelectedLncButton] = useState<"OK" | "CANCEL" | null>(null);

  // Option 3: LNQR
  const [isLnqrScanScreenOpen, setIsLnqrScanScreenOpen] = useState(false);
  const [customerQrInput, setCustomerQrInput] = useState("20221003LN000004");
  const [selectedLnqrButton, setSelectedLnqrButton] = useState<"OK" | "CANCEL" | null>(null);

  // Authentic Payment Screen States
  const [isLnqrCashPaymentOpen, setIsLnqrCashPaymentOpen] = useState(false);
  const [selectedTenderMethod, setSelectedTenderMethod] = useState<"CASH" | "BANK_CARD" | "CHECK" | "GIFT_CERT" | "COUPON" | "EPURSE" | "CREDIT_MEMO">("CASH");
  const [lnqrCashTenderInput, setLnqrCashTenderInput] = useState("");
  const [isLnqrTenderProcessed, setIsLnqrTenderProcessed] = useState(false);
  const [isFinalTenderStep, setIsFinalTenderStep] = useState(false);
  const tenderTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isLnqrUpdatedModalOpen, setIsLnqrUpdatedModalOpen] = useState(false);

  // Authentic Functional Modals (Modules 4-8)
  const [isItemVoidModalOpen, setIsItemVoidModalOpen] = useState(false);
  const [isTrxVoidModalOpen, setIsTrxVoidModalOpen] = useState(false);
  const [selectedVoidItemId, setSelectedVoidItemId] = useState<string | null>(null);
  const [pendingVoidReason, setPendingVoidReason] = useState<string | null>(null);
  const [isVoidSkuMode, setIsVoidSkuMode] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [isRefundSkuMode, setIsRefundSkuMode] = useState(false);
  const [isBonusBuyOpen, setIsBonusBuyOpen] = useState(false);
  const [hasBonusBuyBeenPrompted, setHasBonusBuyBeenPrompted] = useState(false);

  // Authentic Bank Card In-Screen Flow (Credit Card & E-Wallets like GCash / Maya)
  const [bankCardStep, setBankCardStep] = useState<"SELECT_TYPE" | "SWIPE_CARD" | "DETAILS" | "EWALLET_DETAILS" | "FINAL_TEAROFF">("SELECT_TYPE");
  const [selectedBankCardType, setSelectedBankCardType] = useState("-SELECT-");
  const [bankCardSwipeNum, setBankCardSwipeNum] = useState("");
  const [bankCardHolder, setBankCardHolder] = useState("X");
  const [bankCardTerminal, setBankCardTerminal] = useState("BDO POS");
  const [bankCardValidUntil, setBankCardValidUntil] = useState("2028-12-31");
  const [bankCardAuthCode, setBankCardAuthCode] = useState("");
  const [bankCardSlipNo, setBankCardSlipNo] = useState("");
  const [bankCardRefNo, setBankCardRefNo] = useState("");
  const [bankCardAmountInput, setBankCardAmountInput] = useState("");
  const [sulitCoinsEarnedAmount, setSulitCoinsEarnedAmount] = useState<number | null>(null);
  const [gcashReferenceNumber, setGcashReferenceNumber] = useState("");
  const [mayaTraceNumber, setMayaTraceNumber] = useState("");
  const [mayaReferenceNumber, setMayaReferenceNumber] = useState("");
  const [mayaGeneratedAt, setMayaGeneratedAt] = useState<Date | null>(null);
  const [receiptAuthCode, setReceiptAuthCode] = useState("");
  const [receiptInvoiceNumber, setReceiptInvoiceNumber] = useState("");
  const [receiptGeneratedAt, setReceiptGeneratedAt] = useState<Date | null>(null);
  const [cardReceiptGeneratedAt, setCardReceiptGeneratedAt] = useState<Date | null>(null);


  // In-Screen Payment Details (Module 8)
  const [cardSubtype, setCardSubtype] = useState<"CREDIT_CARD" | "GCASH" | "NBS_GIFTCARD" | "SULIT_COINS">("CREDIT_CARD");
  const [creditCardNum, setCreditCardNum] = useState("****0000");
  const [creditCardHolder, setCreditCardHolder] = useState("JAN ANGELA CATINDIG");
  const [creditCardTerminal, setCreditCardTerminal] = useState("-SELECT-");
  const [creditCardValid, setCreditCardValid] = useState("2028-12-31");
  const [creditCardAuth, setCreditCardAuth] = useState("123456");
  const [creditCardSlip, setCreditCardSlip] = useState("987654");
  const [gcashAmount, setGcashAmount] = useState("2990.00");
  const [gcashRef, setGcashRef] = useState("100293847561");
  const [giftCardCode, setGiftCardCode] = useState("GC-99482");
  const [giftCardAmount, setGiftCardAmount] = useState("2990.00");
  const [sulitCoinsAmount, setSulitCoinsAmount] = useState("1");
  const [sulitCoinsQr, setSulitCoinsQr] = useState("20221003LN000004");
  const [giftCertType, setGiftCertType] = useState("-SELECT-");
  const [giftCertNumber, setGiftCertNumber] = useState("123456789");
  const [couponSeries, setCouponSeries] = useState("-SELECT-");
  const [couponEntryMode, setCouponEntryMode] = useState<"SELECT" | "WITH_SERIES" | "WITHOUT_SERIES">("SELECT");
  const [couponType, setCouponType] = useState("--PLEASE SELECT--");
  const [couponNumber, setCouponNumber] = useState("CP-99214");
  const [couponDenom, setCouponDenom] = useState("50.00");
  const [couponAvail, setCouponAvail] = useState("50.00");
  const [couponRedemption, setCouponRedemption] = useState("2026-02-18");
  const [couponValid, setCouponValid] = useState("2026-12-31");
  const [creditMemoNumber, setCreditMemoNumber] = useState("CM-2026-0041");
  const [creditMemoAmount, setCreditMemoAmount] = useState("2990.00");
  const [isTrxDiscOpen, setIsTrxDiscOpen] = useState(false);
  const [isRecallOpen, setIsRecallOpen] = useState(false);
  const [isReprintOpen, setIsReprintOpen] = useState(false);
  const [isReprintReceiptOpen, setIsReprintReceiptOpen] = useState(false);
  const [isSdvOpen, setIsSdvOpen] = useState(false);
  const [readingsType, setReadingsType] = useState<"Y" | "Z" | null>(null);
  const [isTrxCommentOpen, setIsTrxCommentOpen] = useState(false);
  const [returnRefundMode, setReturnRefundMode] = useState<"RETURN" | "REFUND" | null>(null);
  const [isElectronicPaymentOpen, setIsElectronicPaymentOpen] = useState(false);
  const [electronicPaymentType, setElectronicPaymentType] = useState<CardTenderType>("Credit Card");
  const [isPostVoidOpen, setIsPostVoidOpen] = useState(false);
  const [isPriceChangeOpen, setIsPriceChangeOpen] = useState(false);
  const [isNonMdseOpen, setIsNonMdseOpen] = useState(false);
  const [journalModalMode, setJournalModalMode] = useState<"TRX_JOURNAL" | "SALES_JOURNAL" | null>(null);
  const [isNonSalesOpen, setIsNonSalesOpen] = useState(false);

  const [state, dispatch] = useReducer(
    posReducer,
    createInitialPOSState("Jan Angela")
  );

  const isExternalReceiptShowing =
    (selectedTenderMethod === "BANK_CARD" &&
      selectedBankCardType === "CREDIT CARD" &&
      bankCardStep !== "SELECT_TYPE") ||
    (selectedTenderMethod === "BANK_CARD" &&
      selectedBankCardType === "GCASH" &&
      bankCardStep === "EWALLET_DETAILS") ||
    (selectedTenderMethod === "BANK_CARD" &&
      selectedBankCardType === "MAYA" &&
      (bankCardStep === "EWALLET_DETAILS" || bankCardStep === "FINAL_TEAROFF"));

  const [showItemNotFound, setShowItemNotFound] = useState(false);

  useEffect(() => {
    const isItemNotFound =
      state.lastMessage.type === "error" &&
      state.lastMessage.text.includes("not found");

    if (!isItemNotFound) {
      setShowItemNotFound(false);
      return;
    }

    setShowItemNotFound(true);
    const timeoutId = window.setTimeout(() => {
      setShowItemNotFound(false);
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [state.lastMessage]);

  const [barcodeInput, setBarcodeInput] = useState("");
  const barcodeRef = useRef<HTMLInputElement>(null);

  const [qtyInput, setQtyInput] = useState("");
  const qtyInputRef = useRef<HTMLInputElement>(null);
  const paymentOkBtnRef = useRef<HTMLButtonElement>(null);
  const cashTenderInputRef = useRef<HTMLInputElement>(null);

  const [cashTenderInput, setCashTenderInput] = useState("500");
  const [overridePass, setOverridePass] = useState("");

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState<
    { step: number; actionAttempted: string; expected: string; feedback: string }[]
  >([]);
  const [scenarioStartTime, setScenarioStartTime] = useState<number>(Date.now());
  const [isExamCompleted, setIsExamCompleted] = useState(false);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "2-digit" })
      .replace(",", "").replace(/ /g, "-");
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const fmtTimShort = (d: Date) =>
    d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", hour12: true });
  const fmtDayName = (d: Date) =>
    d.toLocaleDateString("en-PH", { weekday: "long" });
  const fmtLongDate = (d: Date) =>
    d.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });

  useEffect(() => {
    if (isExamCompleted && activeScenario) {
      const timeSpent = Math.max(1, Math.round((Date.now() - scenarioStartTime) / 1000));
      const penalty = mistakes.length * 10;
      const score = Math.max(0, 100 - penalty);
      recordScenarioAttempt({
        id: "attempt-" + Date.now(),
        scenarioId: activeScenario.id,
        scenarioTitle: activeScenario.title,
        timestamp: new Date().toISOString(),
        score,
        passed: score >= activeScenario.passingScore,
        stepsCompleted: activeScenario.steps.length,
        totalSteps: activeScenario.steps.length,
        mistakes,
        hintsUsed,
        timeSpentSeconds: timeSpent,
      });
    }
  }, [isExamCompleted]);

  const handleVerifyDateYes = () => {
    setSelectedSodButton(null);
    setTerminalMode("START_OF_DAY_CLOSE");
    validateScenarioStep("VERIFY_DATE_YES");
  };

  const handleCloseSodWindow = () => {
    setTerminalMode("POS_RELOADER");
    validateScenarioStep("CLOSE_SOD_WINDOW");
  };

  const handleReloadToLogin = () => {
    setTerminalMode("USER_LOGIN");
    validateScenarioStep("RELOAD_POS_LOGIN");
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTerminalMode("ACTIVE_REGISTER");
    validateScenarioStep("LOGIN_SUBMIT", loginUsername);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    setSelectedLogoutButton(null);
    setTerminalMode("USER_LOGIN");
    validateScenarioStep("CONFIRM_LOGOUT_YES");
  };

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false);
    setSelectedLogoutButton(null);
  };

  const handleSelectLoyalty = (optionNum: number) => {
    setSelectedLoyaltyOption(optionNum);
    setSulitCoinsEarnedAmount(null);
    if (state.lineItems.length === 0) {
      dispatch({ type: "ADD_ITEM_BY_CODE", code: "NBS-BK-001" });
    }

    setLnqrCashTenderInput("");

    if (optionNum === 1) {
      // 1. None: Directly navigate to Payment screen
      setLoyaltyType("NONE");
      setIsLoyaltyOptionOpen(false);
      setSelectedTenderMethod("CASH");
      setIsLnqrTenderProcessed(false);
      setReceiptGeneratedAt(new Date());
      dispatch({ type: "OPEN_PAYMENT" });
      validateScenarioStep("CHOOSE_LNQR_OPTION", 1);
    } else if (optionNum === 2) {
      // 2. Laking National Card: Intermediate card input screen
      setIsLoyaltyOptionOpen(false);
      setIsLncCardScreenOpen(true);
      setSelectedLncButton(null);
      validateScenarioStep("CHOOSE_LNQR_OPTION", 2);
    } else if (optionNum === 3) {
      // 3. LNQR / LNQR PLUS: Intermediate QR scan screen
      setIsLoyaltyOptionOpen(false);
      setIsLnqrScanScreenOpen(true);
      setSelectedLnqrButton(null);
      validateScenarioStep("CHOOSE_LNQR_OPTION", 3);
    }
  };

  const handleConfirmLnc = () => {
    setLoyaltyType("LNC");
    setIsLncCardScreenOpen(false);
    setSelectedTenderMethod("CASH");
    setIsLnqrTenderProcessed(false);
    if (state.lineItems.length === 0) {
      dispatch({ type: "ADD_ITEM_BY_CODE", code: "NBS-BK-001" });
    }
    setReceiptGeneratedAt(new Date());
    dispatch({ type: "OPEN_PAYMENT" });
    validateScenarioStep("SUBMIT_LNC", customerLncInput);
  };

  const handleConfirmLnqr = () => {
    setLoyaltyType("LNQR");
    setIsLnqrScanScreenOpen(false);
    setSelectedTenderMethod("CASH");
    setIsLnqrTenderProcessed(false);
    if (state.lineItems.length === 0) {
      dispatch({ type: "ADD_ITEM_BY_CODE", code: "NBS-BK-001" });
    }
    setReceiptGeneratedAt(new Date());
    dispatch({ type: "OPEN_PAYMENT" });
    setIsLnqrCashPaymentOpen(true);
    validateScenarioStep("SUBMIT_LNQR", customerQrInput);
  };

  const handleConfirmLnqrCashTender = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const tenderVal = parseFloat(lnqrCashTenderInput);
    if (isNaN(tenderVal) || tenderVal <= 0) {
      return;
    }
    if (tenderVal < totals.totalAmount) {
      alert(`Amount tendered (₱${tenderVal.toFixed(2)}) is less than amount due (₱${totals.totalAmount.toFixed(2)})!`);
      return;
    }
    setIsLnqrTenderProcessed(true);
    setIsFinalTenderStep(false);
    dispatch({ type: "TENDER_PAYMENT", amount: tenderVal });
    validateScenarioStep("SUBMIT_CASH_TENDER", lnqrCashTenderInput);
    validateScenarioStep("CONFIRM_TENDER", tenderVal);

    if (tenderTimerRef.current) {
      clearTimeout(tenderTimerRef.current);
    }

    // Show "Dont press any key.. Please wait..." then transition to final tear-off / close register screen
    tenderTimerRef.current = setTimeout(() => {
      setIsFinalTenderStep(true);
    }, 7000);
  };

  const handleConfirmLnqrUpdated = () => {
    if (tenderTimerRef.current) {
      clearTimeout(tenderTimerRef.current);
      tenderTimerRef.current = null;
    }
    dispatch({ type: "CLOSE_PAYMENT" });
    setIsLnqrUpdatedModalOpen(false);
    setIsLnqrCashPaymentOpen(false);
    setIsLnqrTenderProcessed(false);
    setIsFinalTenderStep(false);
    setIsLnqrScanScreenOpen(false);
    setIsLncCardScreenOpen(false);
    setIsLoyaltyOptionOpen(false);
    setHasBonusBuyBeenPrompted(false);
    setLoyaltyType("NONE");
    setSelectedTenderMethod("CASH");
    setBankCardStep("SELECT_TYPE");
    setBankCardSwipeNum("");
    setSulitCoinsEarnedAmount(null);
    dispatch({ type: "RESET_TRANSACTION" });
    validateScenarioStep("CONFIRM_LNQR_UPDATED");
  };

  const handleConfirmBankCardPayment = () => {
    if (
      bankCardStep === "EWALLET_DETAILS" &&
      selectedBankCardType.toUpperCase() === "LNQR SULIT COINS"
    ) {
      const earnedAmount = Number(bankCardAmountInput.trim());
      if (!bankCardAmountInput.trim() || !Number.isFinite(earnedAmount) || earnedAmount < 0) {
        alert("Enter a valid Sulit Coins amount.");
        return;
      }

      setSulitCoinsEarnedAmount(earnedAmount);
      setSelectedTenderMethod("CASH");
      setSelectedBankCardType("-SELECT-");
      setBankCardStep("SELECT_TYPE");
      setBankCardAmountInput("");
      setBankCardRefNo("");
      setIsFinalTenderStep(false);
      return;
    }

    dispatch({ type: "TENDER_PAYMENT", amount: totals.totalAmount });
    dispatch({ type: "SELECT_PAYMENT_METHOD", method: "BANK_CARD" });
    validateScenarioStep("CONFIRM_TENDER", totals.totalAmount);
    setBankCardStep("FINAL_TEAROFF");
    setIsFinalTenderStep(true);
  };

  const handleConfirmBankCardType = () => {
    const cardType =
      selectedBankCardType === "-SELECT-" ? "CREDIT CARD" : selectedBankCardType;
    setSelectedBankCardType(cardType);

    if (cardType === "CREDIT CARD") {
      setReceiptInvoiceNumber(generateInvoiceNumber());
      setReceiptAuthCode(generateApprovalCode());
      setCardReceiptGeneratedAt(new Date());

    } else {
      setReceiptInvoiceNumber("");
      setReceiptAuthCode("");
      setCardReceiptGeneratedAt(null);
    }

    setBankCardStep("SWIPE_CARD");
  };

  const handleConfirmEwalletType = (cardType: string) => {
    setSelectedBankCardType(cardType);
    setBankCardAmountInput((totals.totalAmount || 2990).toFixed(2));
    setBankCardRefNo("");
    if (cardType.toUpperCase() === "GCASH") {
      setGcashReferenceNumber(generateGcashReferenceNumber());
      setMayaTraceNumber("");
      setMayaReferenceNumber("");
      setMayaGeneratedAt(null);
    } else if (cardType.toUpperCase() === "MAYA") {
      setMayaTraceNumber(generateMayaTraceNumber());
      setMayaReferenceNumber(generateMayaReferenceNumber());
      setMayaGeneratedAt(new Date());
      setGcashReferenceNumber("");
    } else {
      setGcashReferenceNumber("");
      setMayaTraceNumber("");
      setMayaReferenceNumber("");
      setMayaGeneratedAt(null);
    }
    setBankCardStep("EWALLET_DETAILS");
  };

  const handlePaymentOkClick = () => {
    if (selectedTenderMethod === "BANK_CARD") {
      if (bankCardStep === "SELECT_TYPE") {
        let cardType = selectedBankCardType;
        if (cardType === "-SELECT-") {
          cardType = "CREDIT CARD";
          setSelectedBankCardType("CREDIT CARD");
        }
        if (isEwalletCardType(cardType)) {
          handleConfirmEwalletType(cardType);
        }
        
        else {
         handleConfirmBankCardType();
          }
        return;
      }
      if (bankCardStep === "SWIPE_CARD") {
        setBankCardStep("DETAILS");
        return;
      }
      if (bankCardStep === "DETAILS" || bankCardStep === "EWALLET_DETAILS") {
        handleConfirmBankCardPayment();
        return;
      }
      if (bankCardStep === "FINAL_TEAROFF" || isFinalTenderStep) {
        if (tenderTimerRef.current) {
          clearTimeout(tenderTimerRef.current);
          tenderTimerRef.current = null;
        }
        dispatch({ type: "CLOSE_PAYMENT" });
        dispatch({ type: "RESET_TRANSACTION" });
        setIsLnqrCashPaymentOpen(false);
        setIsLnqrTenderProcessed(false);
        setIsFinalTenderStep(false);
        setLnqrCashTenderInput("");
        setIsLnqrScanScreenOpen(false);
        setIsLncCardScreenOpen(false);
        setIsLoyaltyOptionOpen(false);
        setIsLnqrUpdatedModalOpen(false);
        setHasBonusBuyBeenPrompted(false);
        setLoyaltyType("NONE");
        setSelectedTenderMethod("CASH");
        setSulitCoinsEarnedAmount(null);
        setBankCardStep("SELECT_TYPE");
        setBankCardSwipeNum("");
        setBankCardHolder("X");
        setBankCardTerminal("BDO POS");
        setBankCardValidUntil("2028-12-31");
        setBankCardAuthCode("");
        setBankCardSlipNo("");
        setReceiptAuthCode("");
        setReceiptInvoiceNumber("");
        setCardReceiptGeneratedAt(null);
        setBankCardRefNo("");
        setBankCardAmountInput("");
        setGcashReferenceNumber("");
        setMayaTraceNumber("");
        setMayaReferenceNumber("");
        setMayaGeneratedAt(null);
        validateScenarioStep("CONFIRM_LNQR_UPDATED");
        return;
      }
     
    }

    if (!isLnqrTenderProcessed) {
      handleConfirmLnqrCashTender();
      return;
    }
    if (!isFinalTenderStep) {
      setIsFinalTenderStep(true);
      return;
    }
    if (tenderTimerRef.current) {
      clearTimeout(tenderTimerRef.current);
      tenderTimerRef.current = null;
    }
    if (sulitCoinsEarnedAmount !== null) {
      dispatch({ type: "CLOSE_PAYMENT" });
      setIsLnqrCashPaymentOpen(false);
      setIsLnqrTenderProcessed(false);
      setIsFinalTenderStep(false);
      setIsLnqrUpdatedModalOpen(true);
      return;
    }
    dispatch({ type: "CLOSE_PAYMENT" });
    dispatch({ type: "RESET_TRANSACTION" });
    setIsLnqrCashPaymentOpen(false);
    setIsLnqrTenderProcessed(false);
    setIsFinalTenderStep(false);
    setLnqrCashTenderInput("");
    setIsLnqrScanScreenOpen(false);
    setIsLncCardScreenOpen(false);
    setIsLoyaltyOptionOpen(false);
    setIsLnqrUpdatedModalOpen(false);
    setHasBonusBuyBeenPrompted(false);
    setLoyaltyType("NONE");
    setSelectedTenderMethod("CASH");
    setSulitCoinsEarnedAmount(null);
    setBankCardStep("SELECT_TYPE");
    setBankCardSwipeNum("");
    validateScenarioStep("CONFIRM_LNQR_UPDATED");
  };

  useEffect(() => {
    if (isFinalTenderStep) {
      paymentOkBtnRef.current?.focus();
    }
  }, [isFinalTenderStep, bankCardStep]);

  useEffect(() => {
    if (
      (state.currentPage === "PAYMENT" || isLnqrCashPaymentOpen) &&
      !isLnqrTenderProcessed &&
      selectedTenderMethod === "CASH"
    ) {
      cashTenderInputRef.current?.focus();
    }
  }, [state.currentPage, isLnqrCashPaymentOpen, isLnqrTenderProcessed, selectedTenderMethod]);

  useEffect(() => {
    if (
      terminalMode === "ACTIVE_REGISTER" &&
      !state.isQuantityInputActive &&
      !state.activeLookupOpen &&
      !state.managerOverrideOpen &&
      !state.paymentDialogOpen &&
      state.currentPage === "MAIN" &&
      !isLogoutModalOpen &&
      !isLoyaltyOptionOpen &&
      !isLnqrScanScreenOpen &&
      !isLncCardScreenOpen &&
      !isLnqrCashPaymentOpen &&
      !isLnqrUpdatedModalOpen &&
      !isTrxDiscOpen &&
      !isRecallOpen &&
      !isReprintOpen &&
      !isReprintReceiptOpen &&
      !isSdvOpen &&
      readingsType === null &&
      !isTrxCommentOpen &&
      returnRefundMode === null &&
      !isElectronicPaymentOpen &&
      !isPostVoidOpen &&
      !isPriceChangeOpen &&
      !isNonMdseOpen &&
      journalModalMode === null &&
      !isNonSalesOpen &&
      !isBonusBuyOpen
    ) {
      barcodeRef.current?.focus();
    }
  }, [
    terminalMode,
    state.isQuantityInputActive,
    state.activeLookupOpen,
    state.managerOverrideOpen,
    state.paymentDialogOpen,
    state.currentPage,
    isLogoutModalOpen,
    isLoyaltyOptionOpen,
    isLnqrScanScreenOpen,
    isLncCardScreenOpen,
    isLnqrCashPaymentOpen,
    isLnqrUpdatedModalOpen,
    isTrxDiscOpen,
    isRecallOpen,
    isReprintOpen,
    isReprintReceiptOpen,
    isSdvOpen,
    readingsType,
    isTrxCommentOpen,
    returnRefundMode,
    isElectronicPaymentOpen,
    isPostVoidOpen,
    isPriceChangeOpen,
    isNonMdseOpen,
    journalModalMode,
    isNonSalesOpen,
    isBonusBuyOpen,
  ]);

  const executeItemVoid = (targetId?: string) => {
    const activeItems = state.lineItems.filter((item) => !item.isVoided);
    const idToVoid =
      targetId ||
      selectedVoidItemId ||
      (activeItems.length > 0 ? activeItems[activeItems.length - 1].id : null);

    if (!idToVoid) {
      setIsVoidSkuMode(false);
      setSelectedVoidItemId(null);
      setPendingVoidReason(null);
      return;
    }

    const selectedItem = state.lineItems.find(
      (item) => item.id === idToVoid && !item.isVoided
    );

    if (!selectedItem) {
      setIsVoidSkuMode(false);
      setSelectedVoidItemId(null);
      setPendingVoidReason(null);
      return;
    }

    dispatch({ type: "VOID_ITEM", itemId: selectedItem.id });
    setIsVoidSkuMode(false);
    setSelectedVoidItemId(null);
    setPendingVoidReason(null);
    validateScenarioStep("SCAN_VOID_SKU", selectedItem.sku);
    validateScenarioStep("CONFIRM_ITEM_VOID", pendingVoidReason || "Customer changed mind");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        isVoidSkuMode &&
        !e.altKey &&
        (e.key === "ArrowUp" || e.key === "ArrowDown")
      ) {
        e.preventDefault();
        const activeItems = state.lineItems.filter((item) => !item.isVoided);
        if (activeItems.length === 0) return;

        const selectedIndex = activeItems.findIndex(
          (item) => item.id === selectedVoidItemId
        );
        const nextIndex =
          selectedIndex < 0
            ? e.key === "ArrowDown"
              ? 0
              : activeItems.length - 1
            : e.key === "ArrowDown"
              ? Math.min(selectedIndex + 1, activeItems.length - 1)
              : Math.max(selectedIndex - 1, 0);

        setSelectedVoidItemId(activeItems[nextIndex].id);
        return;
      }

      if (isVoidSkuMode && e.altKey && e.key === "Enter") {
        e.preventDefault();
        executeItemVoid();
        return;
      }

      if (isVoidSkuMode && e.key === "Escape") {
        e.preventDefault();
        setIsVoidSkuMode(false);
        setSelectedVoidItemId(null);
        setPendingVoidReason(null);
        return;
      }

      // 1. If in START_OF_DAY_VERIFY mode
      if (terminalMode === "START_OF_DAY_VERIFY") {
        if (e.key === "Tab") {
          e.preventDefault();
          setSelectedSodButton((prev) => {
            if (prev === null) return "YES";
            return prev === "YES" ? "NO" : "YES";
          });
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          if (selectedSodButton === "YES") {
            handleVerifyDateYes();
          } else if (selectedSodButton === "NO") {
            validateScenarioStep("VERIFY_DATE_NO");
          }
          return;
        }
      }

      // 2. If in START_OF_DAY_CLOSE mode (Ctrl+Alt+C closes setup window to POS Reloader)
      if (terminalMode === "START_OF_DAY_CLOSE") {
        if (e.ctrlKey && e.altKey && (e.key === "c" || e.key === "C")) {
          e.preventDefault();
          handleCloseSodWindow();
          return;
        }
      }

      // 2b. If in POS_RELOADER mode 
      if (terminalMode === "POS_RELOADER") {
        if (e.key === "F5") {
          e.preventDefault();
          handleReloadToLogin();
          return;
        }
      }

      // 3. If in USER_LOGIN mode
      if (terminalMode === "USER_LOGIN") {
        if (e.key === "Enter") {
          e.preventDefault();
          handleLoginSubmit();
          return;
        }
      }

      // 4. If in LOGOUT confirmation modal
      if (isLogoutModalOpen) {
        if (e.key === "Tab") {
          e.preventDefault();
          setSelectedLogoutButton((prev) => {
            if (prev === null) return "YES";
            return prev === "YES" ? "NO" : "YES";
          });
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          if (selectedLogoutButton === "YES") {
            handleConfirmLogout();
          } else if (selectedLogoutButton === "NO") {
            handleCancelLogout();
          }
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          handleCancelLogout();
          return;
        }
      }

      // 4b. Loyalty Option modal (1, 2, 3, Escape)
      if (isLoyaltyOptionOpen) {
        if (e.key === "1") {
          e.preventDefault();
          handleSelectLoyalty(1);
          return;
        }
        if (e.key === "2") {
          e.preventDefault();
          handleSelectLoyalty(2);
          return;
        }
        if (e.key === "3") {
          e.preventDefault();
          handleSelectLoyalty(3);
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setIsLoyaltyOptionOpen(false);
          return;
        }
      }

      // 4c-1. LNC Card Input Screen 
      if (isLncCardScreenOpen) {
        if (e.key === "Tab") {
          e.preventDefault();
          setSelectedLncButton((prev) => (prev === "OK" ? "CANCEL" : "OK"));
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          if (selectedLncButton === "CANCEL") {
            setIsLncCardScreenOpen(false);
          } else {
            handleConfirmLnc();
          }
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setIsLncCardScreenOpen(false);
          return;
        }
      }

      // 4c-2. LNQR Scan Input Screen 
      if (isLnqrScanScreenOpen) {
        if (e.key === "Tab") {
          e.preventDefault();
          setSelectedLnqrButton((prev) => (prev === "OK" ? "CANCEL" : "OK"));
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          if (selectedLnqrButton === "CANCEL") {
            setIsLnqrScanScreenOpen(false);
          } else {
            handleConfirmLnqr();
          }
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setIsLnqrScanScreenOpen(false);
          return;
        }
      }

      // 4d. LNQR Updated Confirmation Modal (Enter or Escape confirms)
      if (isLnqrUpdatedModalOpen) {
        if (e.key === "Enter" || e.key === "Escape") {
          e.preventDefault();
          handleConfirmLnqrUpdated();
          return;
        }
      }

      // 4e. Authentic Payment Screen Keybinds
      if (state.currentPage === "PAYMENT" || isLnqrCashPaymentOpen) {
        if (isLnqrTenderProcessed || isFinalTenderStep) {
          if (!isFinalTenderStep) {
            // Block all keys during "Dont press any key.. Please wait..."
            e.preventDefault();
            return;
          }
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handlePaymentOkClick();
          }
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          if (selectedTenderMethod === "BANK_CARD") {
            if (bankCardStep !== "SELECT_TYPE" && bankCardStep !== "FINAL_TEAROFF") {
              setBankCardStep("SELECT_TYPE");
              return;
            }
            setSelectedTenderMethod("CASH");
            setBankCardStep("SELECT_TYPE");
            return;
          }
          if (tenderTimerRef.current) {
            clearTimeout(tenderTimerRef.current);
            tenderTimerRef.current = null;
          }
          dispatch({ type: "CLOSE_PAYMENT" });
          setIsLnqrCashPaymentOpen(false);
          setIsLnqrTenderProcessed(false);
          setIsFinalTenderStep(false);
          setSelectedTenderMethod("CASH");
          setBankCardStep("SELECT_TYPE");
          return;
        }
        if (e.key === "F1") {
          e.preventDefault();
          if (tenderTimerRef.current) {
            clearTimeout(tenderTimerRef.current);
            tenderTimerRef.current = null;
          }
          dispatch({ type: "CLOSE_PAYMENT" });
          setIsLnqrCashPaymentOpen(false);
          setIsLnqrTenderProcessed(false);
          setIsFinalTenderStep(false);
          setSelectedTenderMethod("CASH");
          setBankCardStep("SELECT_TYPE");
          return;
        }
        if (e.key === "F2") {
          e.preventDefault();
          if (isLnqrTenderProcessed || isFinalTenderStep) return;
          setSelectedTenderMethod("CASH");
          setBankCardStep("SELECT_TYPE");
          validateScenarioStep("PAY_CASH");
          return;
        }
        if (e.key === "F3") {
          e.preventDefault();
          if (isLnqrTenderProcessed || isFinalTenderStep) return;
          setSelectedTenderMethod("BANK_CARD");
          setBankCardStep("SELECT_TYPE");
          validateScenarioStep("PAY_CARD");
          return;
        }
        if (e.key === "F4") {
          e.preventDefault();
          setSelectedTenderMethod("CHECK");
          return;
        }
        if (e.key === "F5") {
          e.preventDefault();
          setSelectedTenderMethod("GIFT_CERT");
          setElectronicPaymentType("Gift Certificate Series");
          validateScenarioStep("PAY_GC");
          return;
        }
        if (e.key === "F6") {
          e.preventDefault();
          setSelectedTenderMethod("COUPON");
          setCouponEntryMode("SELECT");
          setElectronicPaymentType("Promo Coupon");
          validateScenarioStep("PAY_COUPON");
          return;
        }
        if (e.key === "F7") {
          e.preventDefault();
          setSelectedTenderMethod("EPURSE");
          setElectronicPaymentType("GCash / QR PH");
          setIsElectronicPaymentOpen(true);
          return;
        }
        if (e.key === "F8") {
          e.preventDefault();
          setSelectedTenderMethod("CREDIT_MEMO");
          setElectronicPaymentType("Debit Card / BancNet");
          setIsElectronicPaymentOpen(true);
          validateScenarioStep("PAY_CREDIT_MEMO");
          return;
        }
      }

      // 4f. Modal Escape Key Dismissals
      if (e.key === "Escape") {
        if (isPostVoidOpen) {
          e.preventDefault();
          setIsPostVoidOpen(false);
          return;
        }
        if (isPriceChangeOpen) {
          e.preventDefault();
          setIsPriceChangeOpen(false);
          return;
        }
        if (isNonMdseOpen) {
          e.preventDefault();
          setIsNonMdseOpen(false);
          return;
        }
        if (journalModalMode !== null) {
          e.preventDefault();
          setJournalModalMode(null);
          return;
        }
        if (isNonSalesOpen) {
          e.preventDefault();
          setIsNonSalesOpen(false);
          return;
        }
      }

      // 5. In ACTIVE_REGISTER mode: handle physical F-keys
      if (terminalMode === "ACTIVE_REGISTER") {
        if (e.key.startsWith("F") && !isNaN(Number(e.key.substring(1)))) {
          e.preventDefault();
          handlePhysicalFKey(e.key.toUpperCase());
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handlePhysicalFKey = (fKey: string) => {
    if (
      state.currentPage === "LOOKUP" ||
      state.currentPage === "PAYMENT" ||
      isLnqrScanScreenOpen ||
      isLncCardScreenOpen ||
      isLnqrCashPaymentOpen ||
      isLoyaltyOptionOpen ||
      isLnqrUpdatedModalOpen ||
      isTrxDiscOpen ||
      isRecallOpen ||
      isReprintOpen ||
      isReprintReceiptOpen ||
      isSdvOpen ||
      readingsType !== null ||
      isTrxCommentOpen ||
      returnRefundMode !== null ||
      isElectronicPaymentOpen ||
      isPostVoidOpen ||
      isPriceChangeOpen ||
      isNonMdseOpen ||
      journalModalMode !== null ||
      isNonSalesOpen ||
      isBonusBuyOpen
    ) {
      return;
    }

    const currentKeys = RIGHT_FUNCTION_KEYS[state.currentPage] || [];
    const matched = currentKeys.find((k) => k.key === fKey);
    if (matched && !matched.disabled) {
      handleAction(matched.actionId);
      return;
    }

    if (fKey === "F1") {
      handleAction("HELP");
      return;
    }
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
  };

  const validateScenarioStep = (actionId: string, dataVal?: string | number) => {
    if (!activeScenario || isExamCompleted) return;
    const currentStep = activeScenario.steps[currentStepIndex];
    if (!currentStep) return;

    // Check action match with flexible aliasing
    let actionMatches = currentStep.expectedAction === actionId;

    // Supervisor override / modal completion aliasing
    const modalConfirmActions = [
      "CONFIRM_OVERRIDE",
      "APPLY_DISCOUNT",
      "CONFIRM_RECALL",
      "CONFIRM_REPRINT",
      "SAVE_TRX_COMMENT",
      "CONFIRM_RETURN",
      "CONFIRM_REFUND",
      "CONFIRM_POST_VOID",
      "CONFIRM_PRICE_CHANGE",
      "CONFIRM_NON_MDSE",
      "CONFIRM_NON_SALES",
      "CONFIRM_BEST_BUY",
      "CONFIRM_ITEM_VOID",
      "CONFIRM_TRX_VOID",
      "CONFIRM_SUSPEND",
      "SCAN_VOID_SKU",
      "SCAN_REFUND_SKU",
    ];
    if (
      (currentStep.expectedAction === "CONFIRM_OVERRIDE" && modalConfirmActions.includes(actionId)) ||
      (modalConfirmActions.includes(currentStep.expectedAction) && actionId === "CONFIRM_OVERRIDE")
    ) {
      actionMatches = true;
    }

    // Tender submission aliasing
    if (
      (currentStep.expectedAction === "CONFIRM_TENDER" && actionId === "SUBMIT_CASH_TENDER") ||
      (currentStep.expectedAction === "SUBMIT_CASH_TENDER" && actionId === "CONFIRM_TENDER")
    ) {
      actionMatches = true;
    }

    // Auto-advance if trainee tenders cash while at PAY_CASH step
    if (
      currentStep.expectedAction === "PAY_CASH" &&
      (actionId === "CONFIRM_TENDER" || actionId === "SUBMIT_CASH_TENDER")
    ) {
      setActiveHint(null);
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < activeScenario.steps.length) {
        const tenderStep = activeScenario.steps[nextIndex];
        if (tenderStep && (tenderStep.expectedAction === "CONFIRM_TENDER" || tenderStep.expectedAction === "SUBMIT_CASH_TENDER")) {
          const finishedIndex = nextIndex + 1;
          setCurrentStepIndex(finishedIndex);
          if (finishedIndex >= activeScenario.steps.length) {
            setIsExamCompleted(true);
          }
          return;
        }
      }
      setCurrentStepIndex(nextIndex);
      return;
    }

    // Auto-advance if trainee tenders while at CHOOSE_LNQR_OPTION
    if (
      currentStep.expectedAction === "CHOOSE_LNQR_OPTION" &&
      (actionId === "PAY_CASH" || actionId === "PAY_CARD")
    ) {
      setActiveHint(null);
      setCurrentStepIndex(currentStepIndex + 1);
      return;
    }

    let dataMatches = true;
    if (currentStep.expectedData !== undefined && dataVal !== undefined) {
      if (typeof currentStep.expectedData === "number" || !isNaN(Number(currentStep.expectedData))) {
        dataMatches =
          Number(currentStep.expectedData) === Number(dataVal) ||
          (actionId === "CONFIRM_TENDER" && Number(dataVal) > 0);
      } else {
        dataMatches = String(currentStep.expectedData) === String(dataVal);
      }
    }

    if (actionMatches && dataMatches) {
      setActiveHint(null);
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      if (nextIndex >= activeScenario.steps.length) {
        setIsExamCompleted(true);
      }
      return;
    }

    const isNavigationAction = ["NAV_SECOND", "NAV_THIRD", "NAV_FOURTH", "NAV_MAIN"].includes(actionId);
    const stepExpectsNavigation = ["NAV_SECOND", "NAV_THIRD", "NAV_FOURTH", "NAV_MAIN"].includes(currentStep.expectedAction);

    if (isNavigationAction && stepExpectsNavigation) {
      return;
    }

    // If choosing loyalty option (1. None or 2. LNC) in non-loyalty scenario, do not record mistake:
    if (actionId === "CHOOSE_LNQR_OPTION" && currentStep.expectedAction !== "CHOOSE_LNQR_OPTION") {
      return;
    }

    // In Lesson 3-1, if step expects LOOKUP_SEARCH and trainee exits lookup or selects item:
    if (currentStep.expectedAction === "LOOKUP_SEARCH" && (actionId === "CLOSE_LOOKUP" || actionId === "ADD_ITEM")) {
      setActiveHint(null);
      const nextIndex = currentStepIndex + 2;
      setCurrentStepIndex(nextIndex);
      if (nextIndex >= activeScenario.steps.length) {
        setIsExamCompleted(true);
      }
      return;
    }

    setMistakes((prev) => [
      ...prev,
      {
        step: currentStepIndex + 1,
        actionAttempted: actionId + (dataVal ? " (" + dataVal + ")" : ""),
        expected: currentStep.expectedAction,
        feedback: currentStep.errorFeedback,
      },
    ]);
  };

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case "HELP":
        handleShowHint();
        break;
      case "LOOKUP":
        dispatch({ type: "OPEN_LOOKUP" });
        validateScenarioStep("LOOKUP");
        break;
      case "SET_QTY":
      case "SET_QTY_MODE":
        setQtyInput("");
        setIsQuantityModalOpen(true);
        validateScenarioStep("SET_QTY_MODE");
        break;
      case "GO_PAYMENT": {
        if (state.lineItems.length === 0) {
          return;
        }
        if (!hasBonusBuyBeenPrompted) {
          setIsBonusBuyOpen(true);
          setHasBonusBuyBeenPrompted(true);
        } else {
          setIsLoyaltyOptionOpen(true);
          setSelectedLoyaltyOption(null);
        }
        validateScenarioStep("GO_PAYMENT");
        break;
      }
      case "CSA_TOGGLE":
        validateScenarioStep("CSA_TOGGLE");
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
        setIsElectronicPaymentOpen(false);
        setIsLnqrCashPaymentOpen(false);
        setIsLnqrTenderProcessed(false);
        dispatch({ type: "CLOSE_PAYMENT" });
        break;
      case "PAY_CASH":
        setSelectedTenderMethod("CASH");
        dispatch({ type: "SELECT_PAYMENT_METHOD", method: "CASH" });
        validateScenarioStep("PAY_CASH");
        break;
      case "PAY_CARD":
        setSelectedTenderMethod("BANK_CARD");
        setBankCardStep("SELECT_TYPE");
        validateScenarioStep("PAY_CARD");
        break;
      case "PAY_GC":
        setSelectedTenderMethod("GIFT_CERT");
        setElectronicPaymentType("Gift Certificate Series");
        validateScenarioStep("PAY_GC");
        break;
      case "PAY_COUPON":
        setSelectedTenderMethod("COUPON");
        setCouponEntryMode("SELECT");
        setElectronicPaymentType("Promo Coupon");
        validateScenarioStep("PAY_COUPON");
        break;
      case "PAY_CREDIT_MEMO":
        setSelectedTenderMethod("CREDIT_MEMO");
        setElectronicPaymentType("Debit Card / BancNet");
        validateScenarioStep("PAY_CREDIT_MEMO");
        break;
      case "PAY_SULIT_COINS":
        setSelectedTenderMethod("EPURSE");
        setElectronicPaymentType("LNQR Sulit Coins");
        validateScenarioStep("PAY_SULIT_COINS");
        break;
      case "ITEM_VOID":
        dispatch({ type: "REQUEST_MANAGER_OVERRIDE", targetAction: "Item Void" });
        validateScenarioStep("ITEM_VOID");
        break;
      case "TRX_VOID":
        setIsTrxVoidModalOpen(true);
        validateScenarioStep("TRX_VOID");
        break;
      case "TRX_DISC":
        setIsTrxDiscOpen(true);
        validateScenarioStep("TRX_DISC");
        break;
      case "SUSPEND":
        setIsSuspendModalOpen(true);
        validateScenarioStep("SUSPEND");
        break;
      case "RECALL":
        dispatch({ type: "REQUEST_MANAGER_OVERRIDE", targetAction: "Recall" });
        validateScenarioStep("RECALL");
        break;
      case "READING_Y":
        setReadingsType("Y");
        validateScenarioStep("READING_Y");
        break;
      case "READING_Z":
        setReadingsType("Z");
        validateScenarioStep("READING_Z");
        break;
      case "SDV_CHECK":
        setIsSdvOpen(true);
        validateScenarioStep("SDV_CHECK");
        break;
      case "REPRINT":
        dispatch({ type: "REQUEST_MANAGER_OVERRIDE", targetAction: "Reprint" });
        validateScenarioStep("REPRINT");
        break;
      case "PRICE_CHANGE":
        setIsPriceChangeOpen(true);
        validateScenarioStep("PRICE_CHANGE");
        break;
      case "NON_MDSE":
        setIsNonMdseOpen(true);
        validateScenarioStep("NON_MDSE");
        break;
      case "POST_VOID":
        setIsPostVoidOpen(true);
        validateScenarioStep("POST_VOID");
        break;
      case "TRX_JOURNAL":
        setJournalModalMode("TRX_JOURNAL");
        validateScenarioStep("TRX_JOURNAL");
        break;
      case "SALES_JOURNAL":
        setJournalModalMode("SALES_JOURNAL");
        validateScenarioStep("SALES_JOURNAL");
        break;
      case "BONUS_BUY":
      case "BEST_BUY":
        setIsBonusBuyOpen(true);
        validateScenarioStep("BONUS_BUY");
        break;
      case "NON_SALES":
        setIsNonSalesOpen(true);
        validateScenarioStep("NON_SALES");
        break;
      case "TRX_COMMENT":
        setIsTrxCommentOpen(true);
        validateScenarioStep("TRX_COMMENT");
        break;
      case "ZERO_RATED":
        dispatch({ type: "REQUEST_MANAGER_OVERRIDE", targetAction: "Zero Rated" });
        validateScenarioStep("ZERO_RATED");
        break;
      case "RETURN_EXCHANGE":
        setReturnRefundMode("RETURN");
        validateScenarioStep("RETURN_EXCHANGE");
        break;
      case "REFUND":
        dispatch({ type: "REQUEST_MANAGER_OVERRIDE", targetAction: "Refund" });
        validateScenarioStep("REFUND");
        break;
      case "LOGOUT":
        setIsLogoutModalOpen(true);
        setSelectedLogoutButton(null);
        validateScenarioStep("TRIGGER_LOGOUT");
        break;
      default:
        console.log("Unhandled action:", actionId);
    }
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const code = barcodeInput.trim();

    if (isVoidSkuMode) {
      const prod = SYNTHETIC_PRODUCTS.find(
        (p) => p.sku.toUpperCase() === code.toUpperCase() || p.barcode === code
      );
      const targetSku = prod ? prod.sku.toUpperCase() : code.toUpperCase();
      const match = state.lineItems.find(
        (item) =>
          !item.isVoided &&
          (item.sku.toUpperCase() === targetSku || item.id === code)
      );
      if (match) {
        executeItemVoid(match.id);
      } else {
        dispatch({ type: "VOID_ITEM", itemId: code });
        setIsVoidSkuMode(false);
        setSelectedVoidItemId(null);
        setPendingVoidReason(null);
        validateScenarioStep("SCAN_VOID_SKU", code);
      }
      setBarcodeInput("");
      return;
    }

    if (isRefundSkuMode) {
      dispatch({ type: "ADD_ITEM_BY_CODE", code });
      setIsRefundSkuMode(false);
      validateScenarioStep("SCAN_REFUND_SKU", code);
      validateScenarioStep("ADD_ITEM", code);
      setBarcodeInput("");
      return;
    }
    dispatch({ type: "ADD_ITEM_BY_CODE", code });
    validateScenarioStep("ADD_ITEM", code);
    setBarcodeInput("");
  };

  const handleConfirmQuantity = (qtyVal?: number) => {
    const qty = qtyVal !== undefined ? qtyVal : parseInt(qtyInput, 10) || 1;
    dispatch({ type: "SET_QUANTITY_CONFIRM", quantity: qty });
    setIsQuantityModalOpen(false);
    validateScenarioStep("CONFIRM_QTY", qty);
    setQtyInput("");
  };

  const handleConfirmElectronicTender = (tenderName: string, amountVal?: number) => {
    setIsLnqrTenderProcessed(true);
    const amt = amountVal !== undefined ? amountVal : (totals.totalAmount || 2990);
    dispatch({ type: "TENDER_PAYMENT", amount: amt });
    dispatch({ type: "SELECT_PAYMENT_METHOD", method: tenderName });
    validateScenarioStep("CONFIRM_TENDER", amt);
  };

  const handleConfirmTender = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(cashTenderInput) || 0;
    dispatch({ type: "TENDER_PAYMENT", amount });
    validateScenarioStep("CONFIRM_TENDER", amount);
  };

  const handleConfirmOverride = () => {
    const target = state.managerOverrideTarget;
    dispatch({ type: "CONFIRM_MANAGER_OVERRIDE" });
    validateScenarioStep("CONFIRM_OVERRIDE");
    setOverridePass("");

        if (target === "Item Void") {
      setIsVoidSkuMode(false);
      setSelectedVoidItemId(null);
      setPendingVoidReason(null);
      setIsItemVoidModalOpen(true);
    }else if (target === "Recall") {
      setIsRecallOpen(true);
    } else if (target === "Reprint") {
      setIsReprintOpen(true);
    } else if (target === "Zero Rated") {
      dispatch({ type: "SET_ZERO_RATED", isZeroRated: !state.isZeroRated });
    } else if (target === "Refund") {
      setReturnRefundMode("REFUND");
    }
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
    if (tenderTimerRef.current) {
      clearTimeout(tenderTimerRef.current);
      tenderTimerRef.current = null;
    }
    dispatch({ type: "RESET_TRANSACTION" });
    setCurrentStepIndex(0);
    setMistakes([]);
    setHintsUsed(0);
    setActiveHint(null);
    setIsExamCompleted(false);
    setSelectedSodButton(null);
    setSelectedLogoutButton(null);
    setIsLoyaltyOptionOpen(false);
    setSelectedLoyaltyOption(null);
    setIsLncCardScreenOpen(false);
    setCustomerLncInput("1008-2024-9901");
    setSelectedLncButton(null);
    setIsLnqrScanScreenOpen(false);
    setCustomerQrInput("20221003LN000004");
    setSelectedLnqrButton(null);
    setIsLnqrCashPaymentOpen(false);
    setLnqrCashTenderInput("");
    setIsLnqrTenderProcessed(false);
    setIsFinalTenderStep(false);
    setIsLnqrUpdatedModalOpen(false);
    setLoyaltyType("NONE");
    setSelectedTenderMethod("CASH");
    setIsTrxDiscOpen(false);
    setIsRecallOpen(false);
    setIsReprintOpen(false);
    setIsReprintReceiptOpen(false);
    setIsSdvOpen(false);
    setReadingsType(null);
    setIsTrxCommentOpen(false);
    setReturnRefundMode(null);
    setIsElectronicPaymentOpen(false);
    setIsPostVoidOpen(false);
    setIsPriceChangeOpen(false);
    setIsNonMdseOpen(false);
    setJournalModalMode(null);
    setIsNonSalesOpen(false);
    setIsBonusBuyOpen(false);
    setHasBonusBuyBeenPrompted(false);
    setScenarioStartTime(Date.now());
    setTerminalMode(getInitialTerminalMode(activeScenario));
  };

  const handleResetTerminal = () => {
    if (tenderTimerRef.current) {
      clearTimeout(tenderTimerRef.current);
      tenderTimerRef.current = null;
    }
    dispatch({ type: "RESET_TRANSACTION" });
    setBarcodeInput("");
    setIsLnqrCashPaymentOpen(false);
    setIsLnqrTenderProcessed(false);
    setIsFinalTenderStep(false);
    setLnqrCashTenderInput("");
    setIsBonusBuyOpen(false);
    setHasBonusBuyBeenPrompted(false);
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
      setTerminalMode("ACTIVE_REGISTER");
    } else {
      const scen = getScenarioById(scenarioId);
      setActiveScenario(scen);
      setTerminalMode(getInitialTerminalMode(scen));
    }
    setCurrentStepIndex(0);
    setMistakes([]);
    setHintsUsed(0);
    setActiveHint(null);
    setIsExamCompleted(false);
    setSelectedSodButton(null);
    setSelectedLogoutButton(null);
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

  const totals = calculateTotals(
    state.lineItems,
    state.appliedDiscount?.percent || 0,
    state.isZeroRated
  );
  const activeItems = state.lineItems.filter((i) => !i.isVoided);
  const lastItem = activeItems[activeItems.length - 1];
  const rightKeys = RIGHT_FUNCTION_KEYS[state.currentPage] || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-900 font-sans select-none">
      {/* Top Trainer Navigation Bar */}
      <header className="relative z-50 bg-black text-white px-4 py-1.5 flex items-center justify-between text-xs font-mono border-b border-gray-800">
        <div className="flex items-center space-x-3">
          {returnLessonUrl !== "/dashboard" ? (
            <Link href={returnLessonUrl} className="flex items-center space-x-1 text-gray-400 hover:text-white">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{returnButtonLabel}</span>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center space-x-1 text-gray-400 hover:text-white">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
          )}
          <span className="text-gray-600">|</span>
          <span className="font-bold text-red-500 uppercase">
            NBS Cashier POS Screen Fidelity Simulator
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-gray-400 text-[11px] hidden md:inline">POS Screen:</span>
            <select
              value={terminalMode}
              onChange={(e) => setTerminalMode(e.target.value as POSTerminalMode)}
              className="bg-gray-800 text-yellow-300 border border-gray-600 text-xs px-2 py-0.5 font-mono focus:outline-none"
            >
              <option value="START_OF_DAY_VERIFY">1. Start of Day (Date/Time)</option>
              <option value="START_OF_DAY_CLOSE">2. Start of Day (Close Setup)</option>
              <option value="POS_RELOADER">3. POS Reloader Screen</option>
              <option value="USER_LOGIN">4. User Login</option>
              <option value="ACTIVE_REGISTER">5. Active Sales Register</option>
            </select>
          </div>
          <div className="text-gray-400 text-[11px] hidden sm:inline">
            {activeScenario ? `Guided Mode: ${activeScenario.title}` : "Free Exploration Mode"}
          </div>
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

      {/* EXACT POS TERMINAL CONTAINER */}
      <div className="flex-1 p-2 sm:p-4 flex items-center justify-center relative overflow-y-auto overflow-x-hidden min-h-0">
        <div
          className={`w-full max-w-[1080px] h-[600px] bg-[#D4D0C8] border-4 border-[#7A8A99] shadow-2xl flex flex-col font-sans overflow-hidden flex-shrink-0 relative transition-transform duration-500 ease-in-out ${
            isExternalReceiptShowing ? "-translate-x-16 xl:-translate-x-32" : "translate-x-0"
          }`}
        >
          {showItemNotFound && (
            <div
              role="alert"
              className="pointer-events-none absolute left-3 top-3 z-30 border-2 border-gray-800 bg-white px-4 py-3 font-bold text-black shadow-lg"
            >
              Item not found
            </div>
          )}

          {/* SCREEN 1: START OF DAY VERIFY */}
          {terminalMode === "START_OF_DAY_VERIFY" && (
            <StartOfDayVerifyScreen
              now={now}
              selectedButton={selectedSodButton}
              onVerifyYes={handleVerifyDateYes}
              onVerifyNo={() => {
                setSelectedSodButton("NO");
                validateScenarioStep("VERIFY_DATE_NO");
              }}
            />
          )}

          {/* SCREEN 2: START OF DAY CLOSE */}
          {terminalMode === "START_OF_DAY_CLOSE" && (
            <StartOfDayCloseScreen onCloseWindow={handleCloseSodWindow} />
          )}

          {/* SCREEN 2B: POS RELOADER */}
          {terminalMode === "POS_RELOADER" && (
            <PosReloaderScreen onReloadToLogin={handleReloadToLogin} />
          )}

          {/* SCREEN 3: USER LOGIN */}
          {terminalMode === "USER_LOGIN" && (
            <UserLoginScreen
              loginUsername={loginUsername}
              loginPassword={loginPassword}
              onUsernameChange={setLoginUsername}
              onPasswordChange={setLoginPassword}
              onSubmit={handleLoginSubmit}
              onCancel={() => {
                setLoginUsername("");
                setLoginPassword("");
              }}
            />
          )}

          {/* SCREEN 4: ACTIVE REGISTER */}
          {terminalMode === "ACTIVE_REGISTER" && (
            <>
              {state.currentPage === "LOOKUP" ? (
                <F2LookupScreen
                  clerkName={state.cashierName}
                  terminalId={state.terminalId}
                  branchCode={state.branchCode}
                  trxNumber={state.transactionNumber || "1023202629990004001558"}
                  onCancel={() => {
                    dispatch({ type: "CLOSE_LOOKUP" });
                    validateScenarioStep("CLOSE_LOOKUP");
                  }}
                  onSelectItem={(sku) => {
                    setBarcodeInput(sku);
                    dispatch({ type: "ADD_ITEM_BY_CODE", code: sku });
                    validateScenarioStep("ADD_ITEM", sku);
                    dispatch({ type: "CLOSE_LOOKUP" });
                    setBarcodeInput("");
                  }}
                  onSearchModeChange={(mode) => {
                    validateScenarioStep("LOOKUP_SEARCH", mode);
                  }}
                  initialSearch={state.lookupSearchTerm}
                />
              ) : isTrxDiscOpen ? (
                <TransactionDiscountModal
                  onApply={(discount) => {
                    dispatch({ type: "APPLY_DISCOUNT", discount });
                    setIsTrxDiscOpen(false);
                    validateScenarioStep("APPLY_DISCOUNT", discount.name);
                  }}
                  onCancel={() => setIsTrxDiscOpen(false)}
                />
              ) : isRecallOpen ? (
                <RecallModal
                  suspendedList={state.suspendedTransactions.map((s) => ({
                    id: s.id,
                    transactionNumber: s.trxNumber,
                    suspendedAt: s.timeStr,
                    totalAmount: s.total,
                    itemCount: s.items.length,
                    items: s.items,
                  }))}
                  onRecall={(id) => {
                    dispatch({ type: "RECALL_TRANSACTION", transactionId: id });
                    setIsRecallOpen(false);
                    validateScenarioStep("CONFIRM_RECALL", id);
                  }}
                  onCancel={() => setIsRecallOpen(false)}
                />
              ) : isReprintOpen ? (
                <ReprintModal
                  clerkName={state.cashierName}
                  onPrint={(orNo: string) => {
                    setIsReprintOpen(false);
                    setIsReprintReceiptOpen(true);
                    validateScenarioStep("CONFIRM_REPRINT", orNo);
                  }}
                  onCancel={() => setIsReprintOpen(false)}
                />
              ) : isSdvOpen ? (
                <SdvModal
                  onClose={() => setIsSdvOpen(false)}
                />
              ) : readingsType !== null ? (
                <ReadingsModal
                  readingType={readingsType}
                  cashierName={state.cashierName}
                  terminalId={state.terminalId}
                  branchCode={state.branchCode}
                  onClose={() => setReadingsType(null)}
                />
              ) : isBonusBuyOpen ? (
                <BonusBuyScreen
                  transactionTotal={totals.subtotal}
                  clerkName={state.cashierName}
                  terminalId={state.terminalId}
                  branchCode={state.branchCode}
                  trxNumber={state.transactionNumber || "1023202629990004001559"}
                  onConfirm={(promo) => {
                    if (promo) {
                      dispatch({
                        type: "APPLY_BEST_BUY",
                        promoName: promo.promoItem,
                        promoSku: promo.promoCode,
                        promoPrice: promo.eventPrice,
                        quantity: promo.quantity,
                      });
                    }
                    setIsBonusBuyOpen(false);
                  }}
                  onCancel={() => {
                    setIsBonusBuyOpen(false);
                  }}
                />
              ) : isLoyaltyOptionOpen ? (
                <ChooseOptionScreen
                  trxNumber={state.transactionNumber || "1023202629990004001560"}
                  clerkName={state.cashierName}
                  branchCode={state.branchCode}
                  terminalId={state.terminalId}
                  onSelectOption={(optionNum) => {
                    handleSelectLoyalty(optionNum);
                  }}
                  onCancel={() => {
                    setIsLoyaltyOptionOpen(false);
                  }}
                />
              ) : isLnqrScanScreenOpen ? (
                /* LNQR SCAN SCREEN */
                <div className="flex-1 min-h-0 flex flex-col bg-white font-sans select-none overflow-hidden">
                  {/* TOP HEADER BAR: Authentic Light Grey Monospace Bar */}
                  <div className="bg-[#BCC4CC] border-b border-gray-400 px-4 py-1 flex items-center justify-between text-[11px] font-mono text-gray-900 border-t border-t-white flex-shrink-0 h-7 select-none w-full">
                    <span><span className="font-bold">Trx.:</span> {state.transactionNumber || "1023202629990004001558"}</span>
                    <span><span className="font-bold">Clerk:</span> {state.cashierName || "Jan Angela"}</span>
                    <span><span className="font-bold">Str No.:</span> {state.branchCode || "2999"}</span>
                    <span><span className="font-bold">Reg No.:</span> {state.terminalId || "0004"}</span>
                    <span className="font-bold">{fmtDate(now)}</span>
                  </div>

                  {/* Yellow Banner */}
                  <div className="bg-[#FFF275] border-b border-gray-400 py-2 text-center font-bold text-sm text-gray-900 tracking-wide uppercase flex-shrink-0">
                    LNQR / LNQR PLUS
                  </div>

                  {/* Center QR Input Area */}
                  <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 bg-white min-h-0 overflow-y-auto">
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm font-sans font-bold text-gray-800">
                      <span>Scan Customer QR</span>
                      <span className="hidden sm:inline font-bold">:</span>
                      <input
                        type="text"
                        value={customerQrInput}
                        onChange={(e) => setCustomerQrInput(e.target.value)}
                        placeholder="20221003LN000004"
                        className="w-72 bg-white border-2 border-gray-500 px-3 py-1 font-mono font-bold text-sm text-gray-900 shadow-inner text-center focus:outline-none focus:ring-2 focus:ring-green-600"
                        autoFocus
                      />
                    </div>
                    <div className="text-xs text-gray-500 font-sans text-center max-w-md pt-2">
                      Scan or manually enter the Customer LNQR Code. Press <kbd className="bg-gray-100 px-1 border border-gray-300 font-bold text-gray-800">TAB</kbd> to focus [Ok], then press <kbd className="bg-gray-100 px-1 border border-gray-300 font-bold text-gray-800">ENTER</kbd>.
                    </div>
                  </div>

                  {/* Bottom Green Taskbar with Ok & Cancel Buttons */}
                  <div className="bg-[#228B22] px-4 py-2 flex items-center justify-center space-x-4 border-t border-green-700 flex-shrink-0">
                    <button
                      type="button"
                      onClick={handleConfirmLnqr}
                      className={`min-w-[90px] px-6 py-1.5 text-xs font-bold font-sans transition-all border-2 ${
                        selectedLnqrButton === "OK"
                          ? "bg-[#D4D0C8] border-red-600 ring-2 ring-red-500 shadow-inner text-black font-extrabold"
                          : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-900 hover:bg-[#E2E0DC]"
                      }`}
                    >
                      Ok
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsLnqrScanScreenOpen(false)}
                      className={`min-w-[90px] px-6 py-1.5 text-xs font-bold font-sans transition-all border-2 ${
                        selectedLnqrButton === "CANCEL"
                          ? "bg-[#D4D0C8] border-red-600 ring-2 ring-red-500 shadow-inner text-black font-extrabold"
                          : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-900 hover:bg-[#E2E0DC]"
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : isLncCardScreenOpen ? (
                /* LAKING NATIONAL CARD SCREEN (Option 2 Intermediate Screen) */
                <div className="flex-1 min-h-0 flex flex-col bg-white font-sans select-none overflow-hidden">
                  {/* TOP HEADER BAR: Authentic Light Grey Monospace Bar */}
                  <div className="bg-[#BCC4CC] border-b border-gray-400 px-4 py-1 flex items-center justify-between text-[11px] font-mono text-gray-900 border-t border-t-white flex-shrink-0 h-7 select-none w-full">
                    <span><span className="font-bold">Trx.:</span> {state.transactionNumber || "1023202629990004001558"}</span>
                    <span><span className="font-bold">Clerk:</span> {state.cashierName || "Jan Angela"}</span>
                    <span><span className="font-bold">Str No.:</span> {state.branchCode || "2999"}</span>
                    <span><span className="font-bold">Reg No.:</span> {state.terminalId || "0004"}</span>
                    <span className="font-bold">{fmtDate(now)}</span>
                  </div>

                  {/* Yellow Banner */}
                  <div className="bg-[#FFF275] border-b border-gray-400 py-2 text-center font-bold text-sm text-gray-900 tracking-wide uppercase flex-shrink-0">
                    Laking National Card
                  </div>

                  {/* Center Card Input Area */}
                  <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 bg-white min-h-0 overflow-y-auto">
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm font-sans font-bold text-gray-800">
                      <span>Enter / Swipe Card No.</span>
                      <span className="hidden sm:inline font-bold">:</span>
                      <input
                        type="text"
                        value={customerLncInput}
                        onChange={(e) => setCustomerLncInput(e.target.value)}
                        placeholder="1008-2024-9901"
                        className="w-72 bg-white border-2 border-gray-500 px-3 py-1 font-mono font-bold text-sm text-gray-900 shadow-inner text-center focus:outline-none focus:ring-2 focus:ring-green-600"
                        autoFocus
                      />
                    </div>
                    <div className="text-xs text-gray-500 font-sans text-center max-w-md pt-2">
                      Swipe physical card or manually enter Laking National Card number. Press <kbd className="bg-gray-100 px-1 border border-gray-300 font-bold text-gray-800">TAB</kbd> to focus [Ok], then press <kbd className="bg-gray-100 px-1 border border-gray-300 font-bold text-gray-800">ENTER</kbd>.
                    </div>
                  </div>

                  {/* Bottom Green Taskbar with Ok & Cancel Buttons */}
                  <div className="bg-[#228B22] px-4 py-2 flex items-center justify-center space-x-4 border-t border-green-700 flex-shrink-0">
                    <button
                      type="button"
                      onClick={handleConfirmLnc}
                      className={`min-w-[90px] px-6 py-1.5 text-xs font-bold font-sans transition-all border-2 ${
                        selectedLncButton === "OK"
                          ? "bg-[#D4D0C8] border-red-600 ring-2 ring-red-500 shadow-inner text-black font-extrabold"
                          : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-900 hover:bg-[#E2E0DC]"
                      }`}
                    >
                      Ok
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsLncCardScreenOpen(false)}
                      className={`min-w-[90px] px-6 py-1.5 text-xs font-bold font-sans transition-all border-2 ${
                        selectedLncButton === "CANCEL"
                          ? "bg-[#D4D0C8] border-red-600 ring-2 ring-red-500 shadow-inner text-black font-extrabold"
                          : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-900 hover:bg-[#E2E0DC]"
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : isTrxCommentOpen ? (
                <TransactionCommentScreen
                  initialComments={state.transactionComments || undefined}
                  trxNumber={state.transactionNumber}
                  clerkName={state.cashierName}
                  branchCode={state.branchCode}
                  terminalId={state.terminalId}
                  dateStr={fmtDate(now)}
                  onSave={(comments) => {
                    dispatch({
                      type: "SET_TRANSACTION_COMMENTS",
                      comments: {
                        customerName: comments.customerName || "",
                        address: comments.address || "",
                        tin: comments.tin || "",
                        remarks: comments.remarks || "",
                      },
                    });
                    setIsTrxCommentOpen(false);
                    validateScenarioStep("SAVE_TRX_COMMENT");
                  }}
                  onCancel={() => setIsTrxCommentOpen(false)}
                />
              ) : (state.currentPage === "PAYMENT" || isLnqrCashPaymentOpen) ? (
                /* AUTHENTIC FULL PAYMENT SCREEN */
                <div className="flex-1 min-h-0 flex flex-col bg-white font-sans select-none overflow-hidden">
                  {/* TOP HEADER BAR: Authentic Light Grey Monospace Bar */}
                  <div className="bg-[#BCC4CC] border-b border-gray-400 px-4 py-1 flex items-center justify-between text-[11px] font-mono text-gray-900 border-t border-t-white flex-shrink-0 h-7 select-none w-full">
                    <span><span className="font-bold">Trx.:</span> {state.transactionNumber || "1023202629990004001558"}</span>
                    <span><span className="font-bold">Clerk:</span> {state.cashierName || "Jan Angela"}</span>
                    <span><span className="font-bold">Str No.:</span> {state.branchCode || "2999"}</span>
                    <span><span className="font-bold">Reg No.:</span> {state.terminalId || "0004"}</span>
                    <span className="font-bold">{fmtDate(now)}</span>
                  </div>

                  {/* Top Yellow Bar across columns 1-10 */}
                  <div className="grid grid-cols-12 h-6 border-b border-gray-400 flex-shrink-0">
                    <div className="col-span-10 bg-[#FFF275]" />
                    <div className="col-span-2 bg-[#9AA5B1]" />
                  </div>

                  <div className="flex-1 grid grid-cols-12 bg-white min-h-0 overflow-hidden">
                    {/* Left Panel: Electronic Journal */}
                    <div className="col-span-5 border-r-2 border-gray-400 flex flex-col bg-[#F3F4F6] text-[11px] font-mono p-2 overflow-hidden min-h-0">
                      <div className="bg-[#D4D0C8] text-center font-bold font-sans py-1 border border-gray-400 text-xs mb-1.5 flex-shrink-0 shadow-sm">
                        Electronic Journal
                      </div>
                      {(() => {
                        const totalSales = totals.totalAmount;
                        const vatable = state.isZeroRated ? 0 : totalSales / 1.12;
                        const vatAmount = state.isZeroRated ? 0 : totalSales - vatable;
                        const tenderVal = isLnqrTenderProcessed && parseFloat(lnqrCashTenderInput) ? parseFloat(lnqrCashTenderInput) : 0;
                        const changeVal = Math.max(0, tenderVal - totalSales);

                        return (
                          <div className="bg-white border border-gray-400 p-2 text-gray-900 leading-tight space-y-1 shadow-inner flex-1 overflow-y-auto font-mono text-[10px] min-h-0">
                            <div className="text-center font-bold uppercase leading-tight space-y-0.5">
                              <div>NATIONAL BOOK STORE</div>
                              <div>OWNED &amp; OPERATED BY:</div>
                              <div>ABACUS BOOK &amp; CARD CORPORATION</div>
                              <div>QUAD ALPHA CENTRUM 125 PIONEER ST.</div>
                              <div>HIGHWAY HILLS 1550 MANDALUYONG CITY</div>
                              <div>VAT Registered TIN: 000-299-299-00000</div>
                              <div>MIN : 140355124</div>
                              <div>Serial No. : AT14-AP0164</div>
                              <div>ACCREDTN : </div>
                            </div>

                            <div className="flex justify-between pt-1">
                              <span>
                                {(receiptGeneratedAt || new Date()).toLocaleDateString("en-US", {
                                  month: "2-digit",
                                  day: "2-digit",
                                  year: "numeric",
                                })}
                              </span>
                              <span>
                                {(receiptGeneratedAt || new Date()).toLocaleTimeString("en-US", {
                                  hour12: false,
                                })}
                              </span>
                            </div>
                            <div>
                              <div>TrxNo &nbsp; &nbsp; &nbsp;: {state.transactionNumber}</div>
                              <div className="flex justify-between">
                                <span>Clerk &nbsp; &nbsp; &nbsp;: 241209</span>
                                <span>Term. No.: 0004</span>
                              </div>
                            </div>

                            <div className="border-t border-dashed border-gray-400 my-1" />

                            {/* Items list */}
                            {state.lineItems.length > 0 ? (
                              state.lineItems.map((item, idx) => {
                                const isVoid = item.isVoided || item.quantity < 0;
                                const displayQty = isVoid ? -Math.abs(item.quantity) : item.quantity;
                                const displayTotal = isVoid ? -Math.abs(item.total) : item.total;
                                return (
                                  <div key={item.id} className="leading-tight mb-1">
                                    <div className="flex justify-between">
                                      <span>
                                        {idx + 1}&nbsp; &nbsp;{item.sku} @ {item.unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </span>
                                      <span className={isVoid ? "text-red-700 font-bold" : ""}>
                                        {displayTotal < 0 ? "-" : ""}{Math.abs(displayTotal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {isVoid ? "-V" : item.total > 0 ? "V" : ""}
                                      </span>
                                    </div>
                                    <div className="pl-6 text-[9px] text-gray-800">{item.description}</div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="leading-tight mb-1">
                                <div className="flex justify-between">
                                  <span>1&nbsp; &nbsp;505 @ 2,990.00</span>
                                  <span>2,990.00 V</span>
                                </div>
                                <div className="pl-6 text-[9px] text-gray-800">PHO PRKR RBALL POINT</div>
                              </div>
                            )}

                            <div className="border-t border-dashed border-gray-400 my-1" />

                            <div className="space-y-0.5">
                              <div className="flex justify-between font-bold">
                                <span>No. of Items</span>
                                <span>{totals.totalQty || (state.lineItems.length > 0 ? state.lineItems.length : 1)}</span>
                              </div>
                              <div className="flex justify-between font-bold">
                                <span>Amount Due</span>
                                <span>{totalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                              {sulitCoinsEarnedAmount !== null && (
                                <div className="flex justify-between font-bold">
                                  <span>LNQR Sulit Coins</span>
                                  <span>{sulitCoinsEarnedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                              )}
                              {selectedTenderMethod === "CASH" && isLnqrTenderProcessed && (
                                <>
                                  <div className="flex justify-between font-bold text-red-600">
                                    <span>Change -&gt;</span>
                                    <span>{changeVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                  <div className="flex justify-between font-bold">
                                    <span>Cash</span>
                                    <span>{tenderVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                </>
                              )}
                              {selectedTenderMethod === "BANK_CARD" && (
                                <div className="flex justify-between font-bold text-gray-800">
                                  <span>Change -&gt;</span>
                                  <span>0.00</span>
                                </div>
                              )}
                              {selectedTenderMethod === "BANK_CARD" && bankCardStep === "FINAL_TEAROFF" && (
                                isEwalletCardType(selectedBankCardType) ? (
                                  <div className="pt-1 text-[10px] font-mono leading-tight">
                                    <div className="flex justify-between font-bold">
                                      <span>{selectedBankCardType}</span>
                                      <span>{totalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="text-[9px] font-mono space-y-0.5 pt-0.5">
                                      <div>
                                        Ref No &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; :{bankCardRefNo || (selectedBankCardType === "MAYA" ? mayaTraceNumber : "100293847561")}
                                      </div>
                                      <div className="flex justify-between font-bold font-mono pt-0.5">
                                        <span>Credit Amt. &nbsp; &nbsp; &nbsp; &nbsp;:</span>
                                        <span>{totalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="pt-1 text-[10px] font-mono leading-tight">
                                    <div className="flex justify-between font-bold">
                                      <span>{bankCardTerminal === "-SELECT-" ? "BDO" : bankCardTerminal.replace(" POS", "")}</span>
                                      <span>{totalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="text-[9px] font-mono space-y-0.5 pt-0.5">
                                      <div>Card Number &nbsp; &nbsp; &nbsp; &nbsp;:XXXXXXXXXXXX{bankCardSwipeNum ? bankCardSwipeNum.slice(-4) : "0000"}</div>
                                      <div>Card Holder &nbsp; &nbsp; &nbsp; &nbsp;:{bankCardHolder || "X"}</div>
                                      <div>Expiry Date &nbsp; &nbsp; &nbsp; &nbsp;:XXXX-XX-XX</div>
                                      <div>Authorization Code :{bankCardAuthCode || "000000"}</div>
                                      <div>Sales Slip # &nbsp; &nbsp; &nbsp; :{bankCardSlipNo || "000000"}</div>
                                      <div className="flex justify-between font-bold font-mono pt-0.5">
                                        <span>Credit Amt. &nbsp; &nbsp; &nbsp; &nbsp;:</span>
                                        <span>{totalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>

                            <div className="border-t border-dashed border-gray-400 my-1.5" />

                            <div className="text-center space-y-1">
                              <div className="tracking-widest">******************************************</div>
                              <div className="font-bold">Join Laking National for free!</div>
                              <div>Visit : <br /><span className="underline">lakingnational.com</span></div>
                              <div className="text-[9px]">for more details or download the app in your phone&apos;s app store.</div>
                              <div className="tracking-widest">******************************************</div>
                            </div>

                            {/* Transaction Comments  */}
                            {state.transactionComments && (
                              <div className="border-t border-b border-dashed border-gray-400 my-1.5 py-1 text-left font-mono text-[10px] space-y-0.5">
                                <div className="font-bold">{state.transactionComments.customerName.toUpperCase()}</div>
                                <div>{state.transactionComments.tin}</div>
                                <div>{state.transactionComments.address.toUpperCase()}</div>
                              </div>
                            )}

                            {/* Tax Info */}
                            <div className="pt-2 space-y-0.5">
                              <div className="text-center font-bold pb-1">Tax Info</div>
                              <div className="flex justify-between">
                                <span>Non-Vatable</span>
                                <span>0.00</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Vatable</span>
                                <span>{vatable.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>VAT Zero-Rated Sale</span>
                                <span>0.00</span>
                              </div>
                              <div className="flex justify-between">
                                <span>VAT Exempt Sale</span>
                                <span>0.00</span>
                              </div>
                              <div className="flex justify-between">
                                <span>VAT(12%)</span>
                                <span>{vatAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                              <div className="flex justify-between font-bold border-t border-gray-300 pt-0.5">
                                <span>Total Sales</span>
                                <span>{totalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            </div>

                            {/* Buyer Info */}
                            <div className="pt-3 space-y-1">
                              <div>
                                BUYER&apos;S NAME : {state.transactionComments?.customerName ? state.transactionComments.customerName.toUpperCase() : "__________________________"}
                              </div>
                              <div>
                                ADDRESS &nbsp; &nbsp; &nbsp;: {state.transactionComments?.address ? state.transactionComments.address.toUpperCase() : "__________________________"}
                              </div>
                              <div>
                                TIN &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;: {state.transactionComments?.tin || "__________________________"}
                              </div>
                              {state.transactionComments?.remarks && (
                                <div>
                                  REMARKS &nbsp; &nbsp; &nbsp;: {state.transactionComments.remarks.toUpperCase()}
                                </div>
                              )}
                            </div>

                            {/* Footer Accreditation & Return Policy */}
                            <div className="pt-3 text-[9px] text-center leading-tight space-y-1 text-gray-700">
                              <div>ABACUS BOOK &amp; CARD CORPORATION</div>
                              <div>QUAD ALPHA CENTRUM 125 PIONEER ST.</div>
                              <div>HIGHWAY HILLS 1550 MANDALUYONG CITY</div>
                              <div>VAT Registered TIN : 000-299-299-00000</div>
                              <div>ACCREDTN: </div>
                              <div>DATE ISSUED: 06/28/2005</div>
                              <div>Permit No.:0514-116-188261-054</div>
                              <div className="pt-2 text-[8px] leading-tight text-left">
                                fully marked down due to various reasons, including any damage that may not be physically apparent.
                                These items are sold on an AS IS basis. Thus, items sold are considered as final sale.
                                Regular items may be returned or exchanged within 7 days from the date of purchase.
                                Any regular item returned must be in the same condition at the time of purchase and in the original packaging.
                                Please present a copy of the receipt upon return or exchange.
                              </div>
                              <div className="pt-2 font-bold text-[10px]">
                                SI No.: {state.transactionNumber}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Center Panel: Green Box & Cash Payment Details OR Final Tear-Off View */}
                    <div className="col-span-5 flex flex-col border-r-2 border-gray-400 bg-[#BDC3C7] min-h-0 overflow-hidden">
                      {isFinalTenderStep ? (
                        <>
                          {/* 4-Row Green Box matching media_1792734842818_4f88c6fe.jpg */}
                          <div className="bg-[#22A838] p-3 text-white space-y-2 border-b-2 border-green-700 select-none flex-shrink-0">
                            {/* Unit */}
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-base tracking-wide">Unit</span>
                              <span className="bg-white text-black font-sans font-bold text-xl px-4 py-1 border border-gray-300 min-w-[170px] text-right shadow-inner">
                                {totals.totalQty || (state.lineItems.length > 0 ? state.lineItems.length : 1)}
                              </span>
                            </div>

                            {/* Sales */}
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-base tracking-wide">Sales</span>
                              <span className="bg-white text-black font-sans font-bold text-xl px-4 py-1 border border-gray-300 min-w-[170px] text-right shadow-inner">
                                {(totals.totalAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>

                            {/* Tendered */}
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-base tracking-wide">Tendered</span>
                              <span className="bg-white text-black font-sans font-bold text-xl px-4 py-1 border border-gray-300 min-w-[170px] text-right shadow-inner">
                                {selectedTenderMethod === "BANK_CARD"
                                  ? (totals.totalAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                  : (parseFloat(lnqrCashTenderInput) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>

                            {/* Change */}
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-base tracking-wide">Change</span>
                              <span className="bg-white text-black font-sans font-bold text-xl px-4 py-1 border border-gray-300 min-w-[170px] text-right shadow-inner">
                                {selectedTenderMethod === "BANK_CARD"
                                  ? "0.00"
                                  : Math.max(0, (parseFloat(lnqrCashTenderInput) || 0) - totals.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          {/* Sky-Blue Stripe Divider */}
                          <div className="h-5 bg-[#67B8DE] border-b border-gray-400 flex-shrink-0" />

                          {/* Message Body */}
                          <div className="flex-1 bg-[#BDC3C7] p-4 flex flex-col items-center justify-center space-y-3 min-h-0 select-none">
                            {selectedTenderMethod === "BANK_CARD" ? (
                              <div className="text-gray-900 font-bold text-base text-center leading-snug">
                                <div>Please Tear-Off the OR</div>
                                <div>Thank You!!</div>
                              </div>
                            ) : (
                              <>
                                <div className="text-gray-900 font-bold text-sm text-center leading-snug">
                                  <div>Please Tear-Off the OR and</div>
                                  <div>Close the Cash Register.</div>
                                  <div>Thank You!!</div>
                                </div>

                                {/* Cash Drawer Status Indicator */}
                                {(() => {
                                  const tenderVal = parseFloat(lnqrCashTenderInput) || 0;
                                  const changeDue = tenderVal - totals.totalAmount;
                                  const hasChange = changeDue > 0;
                                  return hasChange ? (
                                    <div className="inline-flex items-center space-x-1.5 bg-amber-100 border-2 border-amber-500 text-amber-900 font-extrabold text-xs px-3 py-1 rounded shadow-sm">
                                      <span className="text-sm">🔔</span>
                                      <span>[ CASH DRAWER: OPEN ] Change: ₱{changeDue.toFixed(2)}</span>
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center space-x-1.5 bg-gray-200 border border-gray-500 text-gray-700 font-bold text-xs px-3 py-1 rounded">
                                      <span className="text-sm">🔒</span>
                                      <span>[ CASH DRAWER: CLOSED ] (Exact Amount)</span>
                                    </div>
                                  );
                                })()}
                              </>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Top Green Box: Unit, Sales, Tender / Tendered */}
                          <div className="bg-[#22A838] p-3 text-white space-y-2 border-b-2 border-green-700 select-none flex-shrink-0">
                            {/* Unit */}
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-base tracking-wide">Unit</span>
                              <span className="bg-white text-black font-sans font-bold text-xl px-4 py-1 border border-gray-300 min-w-[170px] text-right shadow-inner">
                                {totals.totalQty || (state.lineItems.length > 0 ? state.lineItems.length : 1)}
                              </span>
                            </div>

                            {/* Sales */}
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-base tracking-wide">Sales</span>
                              <span className="bg-white text-black font-sans font-bold text-xl px-4 py-1 border border-gray-300 min-w-[170px] text-right shadow-inner">
                                {(totals.totalAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>

                            {/* Tender / Tendered */}
                            <div className="flex items-center justify-between">
                              {selectedTenderMethod === "CASH" && isLnqrTenderProcessed ? (
                                <span className="text-red-600 font-black text-base tracking-wide animate-pulse">
                                  Change
                                </span>
                              ) : selectedTenderMethod === "BANK_CARD" ? (
                                <span className="font-bold text-base tracking-wide">
                                  Tendered
                                </span>
                              ) : (
                                <span className="font-bold text-base tracking-wide">
                                  Tender
                                </span>
                              )}
                              <span className="bg-white text-black font-sans font-bold text-xl px-4 py-1 border border-gray-300 min-w-[170px] text-right shadow-inner">
                                {selectedTenderMethod === "BANK_CARD"
                                  ? "0.00"
                                  : isLnqrTenderProcessed
                                  ? Math.max(0, (parseFloat(lnqrCashTenderInput) || 0) - totals.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                  : (parseFloat(lnqrCashTenderInput) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          {/* Cash / Card Payment Details Header */}
                          <div className="bg-[#67B8DE] text-gray-900 font-bold px-3 py-1 text-sm border-b border-gray-400 text-center tracking-wide flex-shrink-0">
                            {selectedTenderMethod === "CASH"
                              ? "Cash Payment Details"
                              : selectedTenderMethod === "BANK_CARD"
                              ? (isEwalletCardType(selectedBankCardType)
                                  ? `${selectedBankCardType} Payment Details`
                                  : "Card Payment Details")
                              : selectedTenderMethod === "CHECK"
                              ? "Check Payment Details"
                              : selectedTenderMethod === "GIFT_CERT"
                              ? "Gift Certificate Details"
                              : selectedTenderMethod === "COUPON"
                              ? (couponEntryMode === "SELECT" ? "Coupon Type" : "Coupon Details")
                              : selectedTenderMethod === "EPURSE"
                              ? "E-Purse Payment Details"
                              : "Credit Memo Details"}
                          </div>

                          {/* Details / Input Body */}
                          <div className="flex-1 bg-[#D4D0C8] p-4 flex flex-col items-center justify-center overflow-y-auto min-h-0">
                            {selectedTenderMethod === "CASH" ? (
                              !isLnqrTenderProcessed ? (
                                <form onSubmit={handleConfirmLnqrCashTender} className="w-full max-w-xs space-y-2 flex flex-col items-center font-sans">
                                  <label className="text-xs font-bold text-gray-900 text-center font-sans">
                                    Enter Amount:
                                  </label>
                                  <input
                                    ref={cashTenderInputRef}
                                    type="number"
                                    step="0.01"
                                    value={lnqrCashTenderInput}
                                    onChange={(e) => setLnqrCashTenderInput(e.target.value)}
                                    placeholder=""
                                    className="w-56 bg-white border-2 border-gray-600 px-3 py-1 text-center font-mono font-bold text-xl text-gray-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    autoFocus
                                  />
                                  <button
                                    type="submit"
                                    className="mt-2 px-6 py-1.5 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer"
                                  >
                                    Process Payment (Enter)
                                  </button>
                                </form>
                              ) : (
                                <div className="text-center space-y-2 font-sans select-none flex flex-col items-center">
                                  <div className="text-red-600 font-bold text-sm tracking-tight leading-tight animate-pulse">
                                    Dont press any key..<br/>
                                    Please wait...
                                  </div>
                                  <div className="text-xs font-bold text-gray-900 text-center pt-1">
                                    Enter Amount:
                                  </div>
                                  <div className="w-56 bg-white border-2 border-gray-600 px-3 py-1 text-center font-mono font-bold text-xl text-gray-900 shadow-inner">
                                    {lnqrCashTenderInput}
                                  </div>
                                </div>
                              )
                            ) : selectedTenderMethod === "BANK_CARD" ? (
                              bankCardStep === "SELECT_TYPE" ? (
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    let cardType = selectedBankCardType;
                                    if (cardType === "-SELECT-") {
                                      cardType = "CREDIT CARD";
                                      setSelectedBankCardType("CREDIT CARD");
                                    }
                                    if (isEwalletCardType(cardType)) {
                                      handleConfirmEwalletType(cardType);
                                    } else {
                                      handleConfirmBankCardType();
                                    }
                                  }}
                                  className="w-full flex flex-col items-center justify-center space-y-3 font-sans select-none"
                                >
                                  <div className="text-gray-900 font-bold text-sm tracking-wide">
                                    Please Select Card Type
                                  </div>
                                  <div className="w-64">
                                    <select
                                      value={selectedBankCardType}
                                      onChange={(e) => setSelectedBankCardType(e.target.value)}
                                      className="w-full bg-white border-2 border-gray-600 px-3 py-1 font-sans text-xs font-bold text-gray-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                                      autoFocus
                                    >
                                      {CARD_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                          {type}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </form>
                              ) : bankCardStep === "EWALLET_DETAILS" ? (
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    handleConfirmBankCardPayment();
                                  }}
                                  className="w-full max-w-sm space-y-3 px-6 font-sans select-none"
                                >
                                  <div className="flex items-center justify-between">
                                    <label className="font-bold text-gray-900 text-sm w-36">
                                      Amount
                                    </label>
                                    <input
                                      type="text"
                                      value={bankCardAmountInput || (totals.totalAmount ? totals.totalAmount.toFixed(2) : "2990.00")}
                                      onChange={(e) => setBankCardAmountInput(e.target.value)}
                                      className="w-48 bg-white border-2 border-gray-500 px-2 py-1 font-mono text-sm font-bold text-gray-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <label className="font-bold text-gray-900 text-sm w-36">
                                    {selectedBankCardType === "LNQR Sulit Coins"
                                              ? "Scan QR Code"
                                              : "Reference No"}
                                    </label>
                                    <input
                                      type="text"
                                      value={
                                          selectedBankCardType === "LNQR Sulit Coins"
                                            ? customerQrInput
                                            : bankCardRefNo
                                        }
                                        onChange={(e) => {
                                          if (selectedBankCardType === "LNQR Sulit Coins") {
                                            setCustomerQrInput(e.target.value);
                                          } else {
                                            setBankCardRefNo(e.target.value);
                                          }
                                        }}
                                      autoFocus
                                      placeholder=""
                                      className="w-48 bg-white border-2 border-gray-500 px-2 py-1 font-mono text-sm font-bold text-gray-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                  </div>
                                </form>
                              ) : bankCardStep === "SWIPE_CARD" ? (
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    setBankCardStep("DETAILS");
                                  }}
                                  className="w-full flex flex-col items-center justify-center space-y-3 font-sans select-none"
                                >
                                  <div className="text-gray-900 font-bold text-sm tracking-wide">
                                    Please Swipe Credit Card
                                  </div>
                                  <div className="w-80">
                                    <input
                                      type="text"
                                      value={bankCardSwipeNum}
                                      onChange={(e) => setBankCardSwipeNum(e.target.value)}
                                      placeholder=""
                                      autoFocus
                                      className="w-full bg-white border-2 border-gray-600 px-3 py-1 font-mono text-sm font-bold text-gray-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                  </div>
                                </form>
                              ) : (
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    handleConfirmBankCardPayment();
                                  }}
                                  className="w-full max-w-sm space-y-1.5 text-xs font-sans text-gray-900 px-2"
                                >
                                  <div className="grid grid-cols-5 items-center gap-1">
                                    <span className="col-span-2 font-bold text-gray-800">Card Number</span>
                                    <input
                                      type="text"
                                      readOnly
                                      value={
                                        bankCardSwipeNum
                                          ? "********* " + bankCardSwipeNum.slice(-4)
                                          : "********* 0000"
                                      }
                                      className="col-span-3 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold text-gray-800"
                                    />
                                  </div>
                                  <div className="grid grid-cols-5 items-center gap-1">
                                    <span className="col-span-2 font-bold text-gray-800">Card Holder</span>
                                    <input
                                      type="text"
                                      value={bankCardHolder}
                                      onChange={(e) => setBankCardHolder(e.target.value)}
                                      className="col-span-3 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold uppercase"
                                    />
                                  </div>
                                  <div className="grid grid-cols-5 items-center gap-1">
                                    <span className="col-span-2 font-bold text-gray-800">Card Terminal/Hypercom</span>
                                    <select
                                      value={bankCardTerminal}
                                      onChange={(e) => setBankCardTerminal(e.target.value)}
                                      className="col-span-3 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold"
                                    >
                                      {TERMINAL_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="grid grid-cols-5 items-center gap-1">
                                    <span className="col-span-2 font-bold text-gray-800">Valid Until</span>
                                    <input
                                      type="text"
                                      value={bankCardValidUntil}
                                      onChange={(e) => setBankCardValidUntil(e.target.value)}
                                      placeholder="(YYYY-mm-dd)"
                                      className="col-span-3 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold"
                                    />
                                  </div>
                                  <div className="grid grid-cols-5 items-center gap-1">
                                    <span className="col-span-2 font-bold text-gray-800">Credit Amount</span>
                                    <input
                                      type="text"
                                      readOnly
                                      value={(totals.totalAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      className="col-span-3 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold text-blue-900"
                                    />
                                  </div>
                                  <div className="grid grid-cols-5 items-center gap-1">
                                    <span className="col-span-2 font-bold text-gray-800">Authorization Code</span>
                                    <input
                                      type="text"
                                      value={bankCardAuthCode}
                                      maxLength={6}
                                      onChange={(e) =>
                                        setBankCardAuthCode(
                                          e.target.value
                                            .toUpperCase()
                                            .replace(/[^A-Z0-9]/g, "")
                                            .slice(0, 6)
                                        )
                                      }
                                      className="col-span-3 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold"
                                    />
                                  </div>
                                  <div className="grid grid-cols-5 items-center gap-1">
                                    <span className="col-span-2 font-bold text-gray-800">Sales Slip No.</span>
                                    <input
                                      type="text"
                                      value={bankCardSlipNo}
                                      inputMode="numeric"
                                      maxLength={6}
                                      onChange={(e) =>
                                        setBankCardSlipNo(
                                          e.target.value.replace(/\D/g, "").slice(0, 6)
                                        )
                                      }
                                      className="col-span-3 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold"
                                    />
                                  </div>
                                </form>
                              )
                        ) : selectedTenderMethod === "GIFT_CERT" ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleConfirmElectronicTender("Gift Certificate", totals.totalAmount || 500);
                            }}
                            className="w-full max-w-xs space-y-2 text-xs font-sans text-gray-800"
                          >
                            <div className="grid grid-cols-3 items-center">
                              <span className="font-bold">GC Type:</span>
                              <select
                                value={giftCertType}
                                onChange={(e) => setGiftCertType(e.target.value)}
                                className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 text-xs font-bold"
                              >
                                <option>-SELECT-</option>
                                <option>NBS Gift Certificate</option>
                                <option>Sodexo Premium Pass</option>
                              </select>
                            </div>
                            <div className="grid grid-cols-3 items-center">
                              <span className="font-bold">GC Number:</span>
                              <input
                                type="text"
                                value={giftCertNumber}
                                onChange={(e) => setGiftCertNumber(e.target.value)}
                                className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold"
                              />
                            </div>
                            <div className="grid grid-cols-3 items-center">
                              <span className="font-bold">Amount:</span>
                              <input
                                type="text"
                                defaultValue={(totals.totalAmount || 500).toFixed(2)}
                                className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold text-blue-900"
                              />
                            </div>
                            <div className="flex justify-center pt-2">
                              <button
                                type="submit"
                                className="px-6 py-1.5 bg-[#D4D0C8] hover:bg-[#E2E0DC] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow cursor-pointer"
                              >
                                Process Payment (Enter)
                              </button>
                            </div>
                          </form>
                        ) : selectedTenderMethod === "COUPON" ? (
                          couponEntryMode === "SELECT" ? (
                            <div className="flex w-full max-w-xs flex-col items-center gap-2 font-sans text-xs text-gray-900">
                              <label htmlFor="coupon-entry-mode" className="font-bold">
                                Select Coupon Type
                              </label>
                              <select
                                id="coupon-entry-mode"
                                value={couponEntryMode}
                                onChange={(e) => {
                                  if (e.target.value !== "SELECT") {
                                    setCouponEntryMode(e.target.value as "WITH_SERIES" | "WITHOUT_SERIES");
                                  }
                                }}
                                className="w-56 bg-white border-2 border-gray-500 px-2 py-1 text-xs font-bold shadow-inner"
                              >
                                <option value="SELECT">--PLEASE SELECT--</option>
                                <option value="WITH_SERIES">With Series</option>
                                <option value="WITHOUT_SERIES">Without Series</option>
                              </select>
                            </div>
                          ) : (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleConfirmElectronicTender("Coupon", totals.totalAmount || 50);
                              }}
                              className="w-full max-w-xs space-y-1.5 text-xs font-sans text-gray-800"
                            >
                              {couponEntryMode === "WITH_SERIES" && (
                                <div className="grid grid-cols-3 items-center">
                                  <span className="font-bold">Series:</span>
                                  <select
                                    value={couponSeries}
                                    onChange={(e) => setCouponSeries(e.target.value)}
                                    className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 text-xs font-bold"
                                  >
                                    <option>-SELECT-</option>
                                    <option>Series A</option>
                                    <option>Series B</option>
                                  </select>
                                </div>
                              )}
                              <div className="grid grid-cols-3 items-center">
                                <span className="font-bold">Coupon Type:</span>
                                <select
                                  value={couponType}
                                  onChange={(e) => setCouponType(e.target.value)}
                                  className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 text-xs font-bold"
                                >
                                  <option>--PLEASE SELECT--</option>
                                  <option>BEAR_BRAND_PROMO</option>
                                  <option>EO_VOUCHER</option>
                                  <option>GIFTAWAY</option>
                                  <option>KOKO_KRUNCH_PROMO</option>
                                  <option>NBS</option>
                                  <option>PNB_PROMO</option>
                                  <option>SUNSILK</option>
                                </select>
                              </div>
                              <div className="grid grid-cols-3 items-center">
                                <span className="font-bold">Coupon No:</span>
                                <input
                                  type="text"
                                  value={couponNumber}
                                  onChange={(e) => setCouponNumber(e.target.value)}
                                  className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold"
                                />
                              </div>
                              <div className="grid grid-cols-3 items-center">
                                <span className="font-bold">Coupon Denomination:</span>
                                <input
                                  type="text"
                                  value={couponDenom}
                                  onChange={(e) => setCouponDenom(e.target.value)}
                                  className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold"
                                />
                              </div>

                               <div className="grid grid-cols-3 items-center">
                                <span className="font-bold">Avail Amount:</span>
                                <input
                                  type="text"
                                  value={couponDenom}
                                  onChange={(e) => setCouponDenom(e.target.value)}
                                  className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold"
                                />
                              </div>

                               <div className="grid grid-cols-3 items-center">
                                    <span className="col-span-2 font-bold text-gray-800">Redemption Date:</span>
                                    <input
                                      type="text"
                                      value={bankCardValidUntil}
                                      onChange={(e) => setBankCardValidUntil(e.target.value)}
                                      placeholder="(YYYY-mm-dd)"
                                      className="col-span-3 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold"
                                    />
                                  </div>

                              <div className="grid grid-cols-3 items-center">
                                    <span className="col-span-2 font-bold text-gray-800">Valid Until</span>
                                    <input
                                      type="text"
                                      value={bankCardValidUntil}
                                      onChange={(e) => setBankCardValidUntil(e.target.value)}
                                      placeholder="(YYYY-mm-dd)"
                                      className="col-span-3 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold"
                                    />
                                  </div>


                              <div className="flex justify-center pt-2">
                                <button
                                  type="submit"
                                  className="px-6 py-1.5 bg-[#D4D0C8] hover:bg-[#E2E0DC] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow cursor-pointer"
                                >
                                  Process Payment (Enter)
                                </button>
                              </div>
                            </form>
                          )
                        ) : selectedTenderMethod === "CREDIT_MEMO" ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleConfirmElectronicTender("Credit Memo", totals.totalAmount || 2990);
                            }}
                            className="w-full max-w-xs space-y-2 text-xs font-sans text-gray-800"
                          >
                            <div className="grid grid-cols-3 items-center">
                              <span className="font-bold">Credit Memo:</span>
                              <input
                                type="text"
                                value={creditMemoNumber}
                                onChange={(e) => setCreditMemoNumber(e.target.value)}
                                className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold"
                              />
                            </div>
                            <div className="grid grid-cols-3 items-center">
                              <span className="font-bold">Amount:</span>
                              <input
                                type="text"
                                value={creditMemoAmount}
                                onChange={(e) => setCreditMemoAmount(e.target.value)}
                                className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold text-blue-900"
                              />
                            </div>
                            <div className="flex justify-center pt-2">
                              <button
                                type="submit"
                                className="px-6 py-1.5 bg-[#D4D0C8] hover:bg-[#E2E0DC] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow cursor-pointer"
                              >
                                Process Payment (Enter)
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="text-center space-y-3">
                            <div className="text-sm font-bold text-gray-800">
                              {selectedTenderMethod.replace("_", " ")} Selected
                            </div>
                            <button
                              type="button"
                              onClick={() => handleConfirmElectronicTender(selectedTenderMethod)}
                              className="px-5 py-2 bg-[#D4D0C8] hover:bg-[#E2E0DC] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-xs font-bold text-gray-900 shadow cursor-pointer"
                            >
                              Process Tender (Enter)
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                    {/* Far Right: Function Keys Column */}
                    <div className="col-span-2 bg-[#9AA5B1] p-1 flex flex-col justify-between border-l border-gray-400 space-y-1 min-h-0 overflow-hidden select-none">
                      {[
                        {
                          id: "HELP",
                          label: "Help",
                          shortcut: "F1",
                          method: null,
                          variant: "gray",
                          onClick: () => {
                            dispatch({ type: "CLOSE_PAYMENT" });
                            setIsLnqrCashPaymentOpen(false);
                            setIsLnqrTenderProcessed(false);
                            setSelectedTenderMethod("CASH");
                            setBankCardStep("SELECT_TYPE");
                          },
                        },
                        {
                          id: "CASH",
                          label: "Cash",
                          shortcut: "F2",
                          method: "CASH",
                          variant: "yellow",
                          onClick: () => {
                            setSelectedTenderMethod("CASH");
                            setBankCardStep("SELECT_TYPE");
                            validateScenarioStep("PAY_CASH");
                          },
                        },
                        {
                          id: "BANK_CARD",
                          label: "Bank Card",
                          shortcut: "F3",
                          method: "BANK_CARD",
                          variant: "gray",
                          onClick: () => {
                            setSelectedTenderMethod("BANK_CARD");
                            setBankCardStep("SELECT_TYPE");
                            validateScenarioStep("PAY_CARD");
                          },
                        },
                        {
                          id: "CHECK",
                          label: "Check",
                          shortcut: "F4",
                          method: "CHECK",
                          variant: "red",
                          onClick: () => setSelectedTenderMethod("CHECK"),
                        },
                        {
                          id: "GIFT_CERT",
                          label: "Gift Cert.",
                          shortcut: "F5",
                          method: "GIFT_CERT",
                          variant: "gray",
                          onClick: () => {
                            setSelectedTenderMethod("GIFT_CERT");
                            setElectronicPaymentType("Gift Certificate Series");
                            validateScenarioStep("PAY_GC");
                          },
                        },
                        {
                          id: "COUPON",
                          label: "Coupon",
                          shortcut: "F6",
                          method: "COUPON",
                          variant: "gray",
                          onClick: () => {
                            setSelectedTenderMethod("COUPON");
                            setCouponEntryMode("SELECT");
                            setElectronicPaymentType("Promo Coupon");
                            validateScenarioStep("PAY_COUPON");
                          },
                        },
                        {
                          id: "EPURSE",
                          label: "E-Purse",
                          shortcut: "F7",
                          method: "EPURSE",
                          variant: "red",
                          onClick: () => {
                            setSelectedTenderMethod("EPURSE");
                            setElectronicPaymentType("GCash / QR PH");
                          },
                        },
                        {
                          id: "CREDIT_MEMO",
                          label: "Credit Memo",
                          shortcut: "F8",
                          method: "CREDIT_MEMO",
                          variant: "gray",
                          onClick: () => {
                            setSelectedTenderMethod("CREDIT_MEMO");
                            setElectronicPaymentType("Debit Card / BancNet");
                            validateScenarioStep("PAY_CREDIT_MEMO");
                          },
                        },
                      ].map((item) => {
                        const isAllDisabled = isLnqrTenderProcessed || isFinalTenderStep;
                        const isBankCardMode = selectedTenderMethod === "BANK_CARD" && !isFinalTenderStep;
                        const isCurrentSelected = selectedTenderMethod === item.method;
                        const isBankCardItem = item.id === "BANK_CARD";

                        const isDisabled = isAllDisabled || (isBankCardMode && !isBankCardItem);

                        let btnClass = "";
                        let shortcutClass = "";

                        if (isAllDisabled) {
                          btnClass = "bg-[#E4002B] text-white border-red-700 font-bold cursor-not-allowed opacity-100";
                          shortcutClass = "text-yellow-300";
                        } else if (isBankCardMode) {
                          if (isBankCardItem) {
                            btnClass = "bg-[#FFF275] border-2 border-yellow-500 text-gray-900 font-black cursor-pointer";
                            shortcutClass = "text-yellow-700";
                          } else {
                            btnClass = "bg-[#E4002B] text-white border-red-700 font-bold cursor-not-allowed opacity-100";
                            shortcutClass = "text-yellow-300";
                          }
                        } else if (isCurrentSelected) {
                          btnClass = "bg-[#FFF275] border-2 border-yellow-500 text-gray-900 font-black cursor-pointer";
                          shortcutClass = "text-yellow-700";
                        } else if (item.variant === "red") {
                          btnClass = "bg-[#E4002B] hover:bg-[#C10024] text-white border-red-700 font-bold cursor-pointer";
                          shortcutClass = "text-yellow-300";
                        } else {
                          btnClass = "bg-[#D2D7DF] hover:bg-[#E2E6EC] text-gray-900 border-gray-400 font-bold cursor-pointer";
                          shortcutClass = "text-[#1D4ED8]";
                        }

                        return (
                          <button
                            key={item.id}
                            type="button"
                            disabled={isDisabled}
                            onClick={item.onClick}
                            className={
                              "w-full flex-1 p-1 flex flex-col items-center justify-center border font-sans select-none shadow-sm transition-all " +
                              btnClass
                            }
                          >
                            <span className="text-[11px] font-bold leading-tight uppercase">
                              {item.label}
                            </span>
                            <span
                              className={
                                "text-[10px] font-extrabold " + shortcutClass
                              }
                            >
                              {item.shortcut}
                            </span>
                          </button>
                        );
                      })}

                      <div className="text-center font-mono text-[9px] text-gray-700 pt-1 border-t border-gray-400">
                        Page: 0/0
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer Bar */}
                  <div className="grid grid-cols-12 border-t-2 border-gray-400 h-9 font-sans select-none items-stretch flex-shrink-0">
                    {/* Left 5 cols (Electronic Journal bottom) */}
                    <div className="col-span-5 bg-[#BDC3C7] border-r-2 border-gray-400" />

                    {/* Center 5 cols (Green with Ok and Cancel buttons) */}
                    <div className="col-span-5 bg-[#22A838] border-r-2 border-gray-400 flex items-center justify-center px-2 space-x-3">
                      <button
                        ref={paymentOkBtnRef}
                        type="button"
                        onClick={handlePaymentOkClick}
                        className={`min-w-[90px] h-[24px] px-5 bg-[#C6C9DB] hover:bg-[#D4D6E6] active:bg-[#B4B7CB] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] flex items-center justify-center font-bold text-xs text-[#000080] shadow-sm cursor-pointer ${
                          isFinalTenderStep ? "outline-dotted outline-2 outline-black ring-1 ring-black" : ""
                        }`}
                      >
                        Ok
                      </button>
                      {selectedTenderMethod === "BANK_CARD" && bankCardStep !== "FINAL_TEAROFF" && (
                        <button
                          type="button"
                          onClick={() => {
                            if (bankCardStep !== "SELECT_TYPE") {
                              setBankCardStep("SELECT_TYPE");
                            } else {
                              setSelectedTenderMethod("CASH");
                            }
                          }}
                          className="min-w-[90px] h-[24px] px-5 bg-[#C6C9DB] hover:bg-[#D4D6E6] active:bg-[#B4B7CB] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] flex items-center justify-center font-bold text-xs text-[#000080] shadow-sm cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    {/* Right 2 cols */}
                    <div className="col-span-2 bg-[#22A838] flex items-center justify-center px-1 text-black font-bold font-sans text-xs tracking-tight">
                      {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* TOP HEADER BAR: Authentic Light Grey Monospace Bar */}
                  <div className="bg-[#BCC4CC] border-b border-gray-400 px-4 py-1 flex items-center justify-between text-[11px] font-mono text-gray-900 border-t border-t-white flex-shrink-0 h-7 select-none w-full">
                    <span><span className="font-bold">Trx.:</span> {state.transactionNumber || "1023202629990004001558"}</span>
                    <span><span className="font-bold">Clerk:</span> {state.cashierName || "Jan Angela"}</span>
                    <span><span className="font-bold">Str No.:</span> {state.branchCode || "2999"}</span>
                    <span><span className="font-bold">Reg No.:</span> {state.terminalId || "0004"}</span>
                  </div>

                  {/* MAIN WORKING AREA */}
                  <div className="flex-1 grid grid-cols-12 min-h-0 overflow-hidden bg-white">
            
            <div className="col-span-10 flex flex-col border-r-2 border-gray-400 min-h-0 overflow-hidden">
              
              <div className="grid grid-cols-12 border-b-2 border-gray-400 flex-shrink-0">
                
                <div className="col-span-6 border-r-2 border-gray-400 flex flex-col justify-between">

                  <div className="bg-[#FFF275] p-2 flex flex-col justify-center flex-1">
                    <div className="text-center font-bold text-xs text-gray-900 tracking-wide mb-1 font-sans">
                      <div>
                        {isVoidSkuMode ? "Select Item to Void" : isRefundSkuMode ? "Enter Refund UPC" : "Scan or Enter UPC"}
                      </div>
                      {isVoidSkuMode && (
                        <div className="text-[10px] text-red-700 font-bold mt-0.5">
                          Press Alt+Enter or Click Below
                        </div>
                      )}
                    </div>
                    <form onSubmit={handleBarcodeSubmit}>
                      <input
                        ref={barcodeRef}
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        placeholder={isVoidSkuMode ? "Select line item or scan barcode, then Alt+Enter" : ""}
                        className="w-full bg-white border border-gray-500 px-2 py-1 text-sm font-mono font-bold text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-inner"
                      />
                    </form>
                    {isVoidSkuMode && (
                      <div className="mt-1 flex gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => executeItemVoid()}
                          className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-[10px] py-1 px-1.5 rounded shadow transition-all cursor-pointer"
                        >
                          Confirm Void Item &lt;Alt+Enter&gt;
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsVoidSkuMode(false);
                            setSelectedVoidItemId(null);
                            setPendingVoidReason(null);
                          }}
                          className="bg-gray-300 hover:bg-gray-400 active:bg-gray-500 text-gray-800 font-bold text-[10px] py-1 px-1.5 rounded shadow transition-all cursor-pointer"
                        >
                          Cancel &lt;ESC&gt;
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 4 HORIZONTAL FUNCTION BUTTONS  */}
                  <div className="grid grid-cols-4 bg-[#C2CAD0] border-t-2 border-gray-400 text-center font-sans h-[48px]">
                    {/* F11 (Up Arrow) */}
                    <button
                      type="button"
                      onClick={() => handleAction("PAGE_UP")}
                      className="border-r border-gray-400 bg-[#D2D7DF] hover:bg-[#E2E6EC] active:bg-[#B8BFC9] flex flex-col items-center justify-center p-1 transition-all select-none cursor-pointer"
                    >
                      <div className="w-0 h-0 border-x-[7px] border-x-transparent border-b-[10px] border-b-[#16A34A] mb-0.5"></div>
                      <span className="text-[10px] font-bold text-gray-900">F11</span>
                    </button>

                    {/* F12 (Down Arrow) */}
                    <button
                      type="button"
                      onClick={() => handleAction("PAGE_DOWN")}
                      className="border-r border-gray-400 bg-[#D2D7DF] hover:bg-[#E2E6EC] active:bg-[#B8BFC9] flex flex-col items-center justify-center p-1 transition-all select-none cursor-pointer"
                    >
                      <div className="w-0 h-0 border-x-[7px] border-x-transparent border-t-[10px] border-t-[#16A34A] mb-0.5"></div>
                      <span className="text-[10px] font-bold text-gray-900">F12</span>
                    </button>

                    {/* F10 (CSA ON/OFF) */}
                    <button
                      type="button"
                      onClick={() => handleAction("CSA_TOGGLE")}
                      className="border-r border-gray-400 bg-[#D2D7DF] hover:bg-[#E2E6EC] active:bg-[#B8BFC9] flex flex-col items-center justify-center p-1 transition-all select-none cursor-pointer"
                    >
                      <span className="text-[10px] font-bold text-gray-900 leading-tight">CSA</span>
                      <span className="text-[9px] font-bold text-gray-900 leading-none">ON/OFF</span>
                      <span className="text-[10px] font-extrabold text-[#1D4ED8]">F10</span>
                    </button>

                    {/* F2 (Lookup) */}
                    <button
                      type="button"
                      onClick={() => handleAction("LOOKUP")}
                      className="bg-[#D2D7DF] hover:bg-[#E2E6EC] active:bg-[#B8BFC9] flex flex-col items-center justify-center p-1 transition-all select-none cursor-pointer"
                    >
                      <span className="text-[11px] font-bold text-gray-900 leading-tight">Lookup</span>
                      <span className="text-[10px] font-extrabold text-[#1D4ED8]">F2</span>
                    </button>
                  </div>
                </div>

                {/* Right 6 Cols: Black Real-Time Price/Subtotal Display Box */}
                <div className="col-span-6 bg-black text-white p-3 font-mono flex flex-col justify-between">
                  <div className="grid grid-cols-2 text-xs">
                    <div className="space-y-1">
                      <div className="text-[#38BDF8] font-bold">SubTotal:</div>
                      <div className="text-white font-bold">Quantity:</div>
                      <div className="text-[#4ADE80] font-bold">Unit Price:</div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-[#38BDF8] font-bold">{totals.totalAmount.toFixed(2)}</div>
                      <div className="text-white font-bold">{totals.totalQty}</div>
                      <div className="text-[#4ADE80] font-bold">
                        {lastItem ? lastItem.unitPrice.toFixed(2) : "0.00"}
                      </div>
                    </div>
                  </div>

                  {/* Huge Bright Green Total Display */}
                  <div className="text-right text-4xl sm:text-5xl font-mono font-bold text-[#00FF66] tracking-wider pt-2">
                    {totals.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* TABLE COLUMN HEADERS */}
              <div className="bg-[#B8C2CC] border-b border-gray-400 px-2 py-1 text-[11px] font-bold text-gray-800 grid grid-cols-12 text-center uppercase tracking-tight flex-shrink-0">
                <span className="col-span-1 text-left">LN</span>
                <span className="col-span-3 text-left">UPC</span>
                <span className="col-span-4 text-left">Description</span>
                <span className="col-span-1">Qty</span>
                <span className="col-span-1 text-right">SRP</span>
                <span className="col-span-1 text-right">Amount</span>
                <span className="col-span-1 text-right">Type</span>
              </div>

              {/* LINE ITEM SCREEN PAGE */}
              <div className="flex-1 bg-white overflow-y-auto p-1 font-mono text-xs divide-y divide-gray-100 min-h-0">
                {state.lineItems.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400 italic text-xs py-16">
                    Line item screen page (Scan or Enter UPC above)
                  </div>
                ) : (
                  state.lineItems.map((item, idx) => {
                    const isVoidLine = item.isVoided || item.quantity < 0;
                    const itemType = isVoidLine ? "V" : state.isZeroRated ? "VZ" : "REG";
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (isVoidSkuMode && !item.isVoided) {
                            setSelectedVoidItemId(item.id);
                          }
                        }}
                        className={`grid grid-cols-12 py-1 px-1 items-center text-[11px] font-mono ${
                          selectedVoidItemId === item.id
                            ? "ring-2 ring-inset ring-blue-600 bg-blue-50"
                            : isVoidLine
                              ? "text-red-600 font-bold bg-red-50"
                              : isVoidSkuMode
                                ? "text-gray-900 cursor-pointer hover:bg-blue-50"
                                : "text-gray-900"
                        }`}
                      >
                        <span className="col-span-1 text-left font-bold">{idx + 1}</span>
                        <span className="col-span-3 text-left truncate">{item.sku}</span>
                        <span className="col-span-4 text-left font-bold truncate pr-1">{item.description}</span>
                        <span className="col-span-1 text-center font-bold">
                          {item.quantity < 0 ? item.quantity : item.isVoided ? `-${item.quantity}` : item.quantity}
                        </span>
                        <span className="col-span-1 text-right text-gray-700">{item.unitPrice.toFixed(2)}</span>
                        <span className="col-span-1 text-right font-bold">
                          {item.isVoided && item.total > 0 ? `-${item.total.toFixed(2)}` : item.total.toFixed(2)}
                        </span>
                        <span className="col-span-1 text-right font-bold text-gray-600">{itemType}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT 2 COLS: VERTICAL FUNCTION KEYS PANEL */}
            <div className="col-span-2 bg-[#9AA5B1] p-1 flex flex-col justify-between border-l border-gray-400 space-y-1 min-h-0 overflow-hidden">
              {rightKeys.map((kDef) => {
                const isF4Payment = kDef.key === "F4" && state.currentPage === "MAIN";
                const isRed = isF4Payment
                  ? state.lineItems.length === 0
                  : kDef.variant === "red";
                const isVoidSkuHighlight = isVoidSkuMode && kDef.key === "F7";
                return (
                  <button
                    key={kDef.key}
                    disabled={kDef.disabled}
                    onClick={() => handleAction(kDef.actionId)}
                    className={
                      "w-full flex-1 min-h-[50px] p-1 flex flex-col items-center justify-center border font-sans select-none shadow-sm transition-all " +
                      (kDef.disabled
                        ? "bg-gray-400 border-gray-500 text-gray-600 cursor-not-allowed opacity-50"
                        : isVoidSkuHighlight
                        ? "bg-[#FFF275] border-2 border-yellow-500 text-gray-900 font-black"
                        : isRed
                        ? "bg-[#E4002B] hover:bg-[#C10024] active:bg-[#9B001D] text-white border-red-700"
                        : "bg-[#D2D7DF] hover:bg-[#E2E6EC] active:bg-[#B8BFC9] text-gray-900 border-gray-400")
                    }
                  >
                    <span className="text-[11px] font-bold leading-tight uppercase">
                      {isVoidSkuHighlight ? "Void SKU" : kDef.label}
                    </span>
                    <span
                      className={
                        "text-[10px] font-extrabold " +
                        (isVoidSkuHighlight ? "text-red-600" : isRed ? "text-yellow-300" : "text-[#1D4ED8]")
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

          {/* 3. BOTTOM FOOTER STATUS BAR */}
          <div className="bg-[#D4D0C8] border-t-2 border-gray-500 grid grid-cols-12 text-xs font-sans items-stretch flex-shrink-0 h-9">
            
            {/* Total Qty */}
            <div className="col-span-4 bg-[#FFF275] border-r-2 border-gray-500 px-3 py-1.5 flex items-center justify-between">
              <span className="font-bold text-gray-900">Total Qty</span>
              <span className="font-mono font-bold text-base bg-white px-3 py-0.5 border border-gray-400 text-gray-900 min-w-[50px] text-center">
                {totals.totalQty}
              </span>
            </div>

            {/* Total Sales */}
            <div className="col-span-4 bg-[#16A34A] border-r-2 border-gray-500 px-3 py-1.5 flex items-center justify-between text-white">
              <div className="flex items-center space-x-1">
                <span className="font-bold">Total Sales:</span>
                {state.isZeroRated && (
                  <span className="bg-blue-600 text-white text-[9px] px-1 py-0.5 font-bold uppercase rounded">
                    ZERO
                  </span>
                )}
                {state.appliedDiscount && (
                  <span className="bg-yellow-400 text-gray-900 text-[9px] px-1 py-0.5 font-bold uppercase rounded">
                    -{state.appliedDiscount.percent}%
                  </span>
                )}
              </div>
              <span className="font-mono font-bold text-base bg-white px-3 py-0.5 border border-gray-400 text-gray-900 min-w-[70px] text-right">
                {totals.totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Date Display */}
            <div className="col-span-2 bg-[#C2CAD0] border-r-2 border-gray-500 px-2 py-1.5 flex items-center justify-center font-bold text-gray-800 text-[11px]">
              {fmtDate(now)}
            </div>

            {/* Time Display */}
            <div className="col-span-2 bg-[#C2CAD0] px-2 py-1.5 flex items-center justify-center font-bold text-gray-800 text-[11px]">
              {fmtTime(now)}
            </div>
          </div>
            </>
          )}
          </>
        )}
        </div>
        {selectedTenderMethod === "BANK_CARD" &&
         selectedBankCardType === "CREDIT CARD" &&
         bankCardStep !== "SELECT_TYPE" && (
           <BdoCardTerminal
             isExternalReceiptShowing={isExternalReceiptShowing}
             invoiceNumber={receiptInvoiceNumber}
             authCode={receiptAuthCode}
             generatedAt={cardReceiptGeneratedAt}
             totalAmount={totals.totalAmount}
           />
         )}

        {selectedTenderMethod === "BANK_CARD" &&
         selectedBankCardType === "GCASH" &&
         bankCardStep === "EWALLET_DETAILS" && (
           <GcashTerminalPreview
             isExternalReceiptShowing={isExternalReceiptShowing}
             referenceNumber={gcashReferenceNumber}
           />
         )}

        {selectedTenderMethod === "BANK_CARD" &&
         selectedBankCardType === "MAYA" &&
         (bankCardStep === "EWALLET_DETAILS" || bankCardStep === "FINAL_TEAROFF") && (
           <MayaTerminalReceipt
             isExternalReceiptShowing={isExternalReceiptShowing}
             traceNumber={mayaTraceNumber}
             referenceNumber={mayaReferenceNumber}
             generatedAt={mayaGeneratedAt}
             totalAmount={totals.totalAmount}
           />
         )}
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        selectedButton={selectedLogoutButton}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />

      {/* LNQR HAS BEEN UPDATED MODAL */}
      <LnqrUpdatedModal
        isOpen={isLnqrUpdatedModalOpen}
        onConfirm={handleConfirmLnqrUpdated}
        sulitCoinsEarnedAmount={sulitCoinsEarnedAmount}
      />

      {/* QUICK CATALOG PICKER */}
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

      {/* F3 QUANTITY MODAL */}
      {(isQuantityModalOpen || state.isQuantityInputActive) && (
        <QuantityModal
          initialQuantity={1}
          onConfirm={handleConfirmQuantity}
          onCancel={() => {
            setIsQuantityModalOpen(false);
            dispatch({ type: "SET_QUANTITY_CANCEL" });
          }}
        />
      )}

      {/* ITEM VOID REASON MODAL */}
      {isItemVoidModalOpen && (
        <ItemVoidModal
          onConfirm={(reason) => {
            setPendingVoidReason(reason);
            setSelectedVoidItemId(null);
            setIsItemVoidModalOpen(false);
            setIsVoidSkuMode(true);
            validateScenarioStep("CONFIRM_ITEM_VOID", reason);
          }}
          onCancel={() => {
            setIsItemVoidModalOpen(false);
            setIsVoidSkuMode(false);
            setSelectedVoidItemId(null);
            setPendingVoidReason(null);
          }}
        />
      )}

      {/* TRANSACTION VOID MODAL */}
      {isTrxVoidModalOpen && (
        <TrxVoidModal
          onConfirm={(reason) => {
            dispatch({ type: "VOID_TRANSACTION" });
            setIsTrxVoidModalOpen(false);
            validateScenarioStep("CONFIRM_OVERRIDE");
            validateScenarioStep("CONFIRM_TRX_VOID", reason);
          }}
          onCancel={() => setIsTrxVoidModalOpen(false)}
        />
      )}

      {/* SUSPEND TRANSACTION MODAL */}
      {isSuspendModalOpen && (
        <SuspendModal
          onConfirm={() => {
            dispatch({ type: "SUSPEND_TRANSACTION" });
            setIsSuspendModalOpen(false);
            validateScenarioStep("SUSPEND");
            validateScenarioStep("CONFIRM_SUSPEND");
          }}
          onCancel={() => setIsSuspendModalOpen(false)}
        />
      )}



      {/* AUTHENTIC RETRO MANAGER OVERRIDE MODAL */}
      {state.managerOverrideOpen && (
        <ManagerOverrideModal
          targetAction={state.managerOverrideTarget || "Restricted Operation"}
          onConfirm={handleConfirmOverride}
          onCancel={() => dispatch({ type: "CANCEL_MANAGER_OVERRIDE" })}
        />
      )}

      {/* REPRINT RECEIPT MODAL VIEW */}
      {isReprintReceiptOpen && (
        <ReceiptModal
          state={state}
          isReprint={true}
          onClose={() => setIsReprintReceiptOpen(false)}
          onReset={() => setIsReprintReceiptOpen(false)}
        />
      )}


      {/* F8 RETURN / F10 REFUND MODAL */}
      {returnRefundMode !== null && (
        <ReturnRefundModal
          mode={returnRefundMode}
          onConfirmReturn={(data) => {
            dispatch({
              type: "PROCESS_RETURN_ITEM",
              sku: data.sku,
              reason: data.reason,
              siNumber: data.orNumber,
            });
            setReturnRefundMode(null);
            validateScenarioStep("CONFIRM_RETURN", data.sku);
          }}
          onConfirmRefund={(data) => {
            dispatch({
              type: "PROCESS_REFUND",
              orNumber: data.orNumber,
              reason: data.reason,
            });
            setReturnRefundMode(null);
            validateScenarioStep("CONFIRM_REFUND", data.amount);
          }}
          onCancel={() => setReturnRefundMode(null)}
        />
      )}

      {/* MODULE 8 ELECTRONIC / CARD PAYMENT MODAL */}
      {isElectronicPaymentOpen && (
        <ElectronicPaymentModal
          initialType={electronicPaymentType}
          totalDue={totals.totalAmount}
          onConfirmPayment={(data) => {
            dispatch({ type: "TENDER_PAYMENT", amount: data.amount });
            dispatch({ type: "SELECT_PAYMENT_METHOD", method: data.tenderType });
            setIsElectronicPaymentOpen(false);
            dispatch({ type: "CLOSE_PAYMENT" });
            dispatch({ type: "RESET_TRANSACTION" });
            setIsLnqrCashPaymentOpen(false);
            setIsLnqrTenderProcessed(false);
            setHasBonusBuyBeenPrompted(false);
            setLoyaltyType("NONE");
            setSelectedTenderMethod("CASH");
            validateScenarioStep("CONFIRM_TENDER", data.amount);
          }}
          onCancel={() => setIsElectronicPaymentOpen(false)}
        />
      )}


      {/* F2 POST VOID MODAL */}
      {isPostVoidOpen && (
        <PostVoidModal
          currentOrNumber={state.transactionNumber}
          onAuthorizeOverride={() => validateScenarioStep("CONFIRM_OVERRIDE")}
          onConfirm={(data) => {
            dispatch({ type: "POST_VOID_TRANSACTION", orNumber: data.orNumber, reason: data.reason });
            setIsPostVoidOpen(false);
            validateScenarioStep("CONFIRM_POST_VOID", data.orNumber);
          }}
          onCancel={() => setIsPostVoidOpen(false)}
        />
      )}

      {/* F3 PRICE CHANGE MODAL */}
      {isPriceChangeOpen && (
        <PriceChangeModal
          items={state.lineItems}
          onAuthorizeOverride={() => validateScenarioStep("CONFIRM_OVERRIDE")}
          onConfirm={(data) => {
            dispatch({
              type: "CHANGE_ITEM_PRICE",
              itemId: data.itemId,
              newPrice: data.newPrice,
              reason: data.reason,
            });
            setIsPriceChangeOpen(false);
            validateScenarioStep("CONFIRM_PRICE_CHANGE", data.newPrice);
          }}
          onCancel={() => setIsPriceChangeOpen(false)}
        />
      )}

      {/* F6 NON-MERCHANDISE VARIANCE MODAL (1st Page F6) */}
      {isNonMdseOpen && (
        <NonMdseModal
          onConfirm={(data) => {
            dispatch({
              type: "ADD_NON_MDSE_ITEM",
              description: data.description,
              amount: data.amount,
              referenceNo: data.referenceNo,
            });
            setIsNonMdseOpen(false);
            validateScenarioStep("CONFIRM_NON_MDSE", data.amount);
          }}
          onCancel={() => setIsNonMdseOpen(false)}
        />
      )}

      {/* F4 / F6 ELECTRONIC JOURNAL VIEWER MODAL (3rd Page F4/F6) */}
      {journalModalMode !== null && (
        <JournalViewerModal
          mode={journalModalMode}
          state={state}
          onClose={() => setJournalModalMode(null)}
        />
      )}

      {/* F4 NON-SALES DEPOSIT / GIFT CARD MODAL (4th Page F4) */}
      {isNonSalesOpen && (
        <NonSalesModal
          onConfirm={(data) => {
            setIsNonSalesOpen(false);
            validateScenarioStep("CONFIRM_NON_SALES", data.amount);
          }}
          onCancel={() => setIsNonSalesOpen(false)}
        />
      )}



      {/* CONGRATULATIONS PRACTICE COMPLETE POPUP */}
      <ScenarioCompleteModal
        isOpen={isExamCompleted}
        scenario={activeScenario}
        mistakesCount={mistakes.length}
        isLessonSpecific={isLessonSpecific}
        returnLessonUrl={returnLessonUrl}
        returnButtonLabel={returnButtonLabel}
        onResetExam={handleResetExam}
      />
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
