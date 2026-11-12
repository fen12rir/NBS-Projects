"use client";

import React, { useReducer, useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { GuidedStepBar } from "@/components/simulator/guided-step-bar";
import { F2LookupScreen } from "@/components/simulator/screens/f2-lookup-screen";
import { ManagerOverrideScreen } from "@/components/simulator/screens/manager-override-screen";
import { ItemVoidScreen } from "@/components/simulator/screens/item-void-screen";
import { TransactionDiscountScreen } from "@/components/simulator/screens/transaction-discount-screen";
import { TrxVoidScreen } from "@/components/simulator/screens/trx-void-screen";
import { QuantityModal } from "@/components/simulator/modals/quantity-modal";
import { SuspendScreen } from "@/components/simulator/screens/suspend-screen";
import { RecallModal } from "@/components/simulator/modals/suspend-recall-modal";
import { ReprintModal } from "@/components/simulator/modals/reprint-modal";
import { SdvModal } from "@/components/simulator/modals/sdv-modal";
import { ReadingsScreen } from "@/components/simulator/screens/readings-screen";
import { TransactionCommentScreen } from "@/components/simulator/screens/transaction-comment-screen";
import { TransactionJournalScreen } from "@/components/simulator/screens/transaction-journal-screen";
import { ReturnRefundScreen } from "@/components/simulator/screens/return-refund-screen";
import { ElectronicPaymentModal, CardTenderType } from "@/components/simulator/modals/electronic-payment-modal";
import { PostVoidModal } from "@/components/simulator/modals/post-void-modal";
import { PriceChangeModal } from "@/components/simulator/modals/price-change-modal";
import { NonMerchandiseScreen } from "@/components/simulator/screens/non-merchandise-screen";
import { NonSalesModal } from "@/components/simulator/modals/non-sales-modal";
import { BonusBuyScreen } from "@/components/simulator/screens/bonus-buy-screen";
import { ChooseOptionScreen } from "@/components/simulator/screens/choose-option-screen";
import { BdoCardTerminal } from "@/components/simulator/terminals/bdo-card-terminal";
import { GcashTerminalPreview } from "@/components/simulator/terminals/gcash-terminal-preview";
import { MayaTerminalReceipt } from "@/components/simulator/terminals/maya-terminal-receipt";
import { CustomerPanel } from "@/components/simulator/customer-panel";
import { ChangeCheckModal } from "@/components/simulator/modals/change-check-modal";
import { PosAlertModal, PosAlertState } from "@/components/simulator/modals/pos-alert-modal";
import { MobileKeyStrip } from "@/components/simulator/mobile-key-strip";
import { LogoutScreen } from "@/components/simulator/screens/logout-screen";
import { LnqrUpdatedModal } from "@/components/simulator/modals/lnqr-updated-modal";
import { ScenarioCompleteModal } from "@/components/simulator/modals/scenario-complete-modal";
import { StartOfDayVerifyScreen } from "@/components/simulator/screens/start-of-day-verify-screen";
import { StartOfDayIncorrectScreen } from "@/components/simulator/screens/start-of-day-incorrect-screen";
import { StartOfDayCloseScreen } from "@/components/simulator/screens/start-of-day-close-screen";
import { PosReloaderScreen } from "@/components/simulator/screens/pos-reloader-screen";
import { UserLoginScreen } from "@/components/simulator/screens/user-login-screen";
import { 
  PracticalExamSession, 
  generatePracticalExamSession 
} from "@/data/practical-exam";
import { 
  gradeCase, 
  gradeExamSession, 
  TraineeActionLog, 
  CaseGradingResult, 
  CaseFinalSnapshot,
  ExamSessionGradingResult 
} from "@/lib/simulator/exam-grader";
import { 
  posReducer, 
  createInitialPOSState, 
  calculateTotals, 
} from "@/lib/simulator/pos-state-machine";
import { RIGHT_FUNCTION_KEYS, HORIZONTAL_FUNCTION_KEYS, RightFunctionKeyDef, HorizontalFunctionKeyDef } from "@/data/exact-pos-keys";
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
import { 
  ArrowLeft, 
  ShieldAlert, 
  Trophy, 
  CheckCircle, 
  RotateCcw, 
  ArrowRight, 
  Sparkles, 
  User, 
  Bell, 
  X, 
  Smartphone, 
  Maximize2, 
  AlertTriangle, 
  RotateCw, 
  ChevronUp, 
  ChevronDown,
  Coins,
  Banknote,
  CreditCard,
  ClipboardList
} from "lucide-react";

export type POSTerminalMode = "START_OF_DAY_VERIFY" | "START_OF_DAY_INCORRECT" | "START_OF_DAY_CLOSE" | "POS_RELOADER" | "USER_LOGIN" | "ACTIVE_REGISTER";

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
    t === "NBS GIFTCARD" ||
    t === "LNQR E-GC" ||
    t === "LNQR SULIT COINS"
  );
};

function getInitialTerminalMode(scenario: TrainingScenario | null, isExam = false): POSTerminalMode {
  if (isExam) return "START_OF_DAY_VERIFY";
  if (!scenario) return "ACTIVE_REGISTER";
  if (scenario.id === "scen-les-2-1" || scenario.id === "scen-mod-2" || scenario.id === "scen-practical-assessment") return "START_OF_DAY_VERIFY";
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
  const examParam = searchParams.get("exam");
  const isExamMode = examParam === "practical" || scenarioParam === "scen-practical-assessment";

  const [examSession, setExamSession] = useState<PracticalExamSession | null>(null);
  const [examCaseIndex, setExamCaseIndex] = useState(0);
  const [examActionLog, setExamActionLog] = useState<TraineeActionLog[]>([]);
  const examActionLogRef = useRef<TraineeActionLog[]>([]);
  const isAdvancingCaseRef = useRef(false);
  const [caseResults, setCaseResults] = useState<CaseGradingResult[]>([]);
  const [caseStartTime, setCaseStartTime] = useState<number>(Date.now());
  const [isChangeCheckModalOpen, setIsChangeCheckModalOpen] = useState(false);
  const [pendingCashTender, setPendingCashTender] = useState<number>(0);
  const [customerNotice, setCustomerNotice] = useState<{
    name: string;
    avatar: string;
    quote: string;
    caseNumber: number;
    totalCases: number;
  } | null>(null);

  const logExamAction = (action: string, data?: any) => {
    const entry = { action, data, timestamp: Date.now() };
    examActionLogRef.current.push(entry);
    setExamActionLog((prev) => [...prev, entry]);
  };

  // Mobile / Focus Mode States (Forced Landscape)
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [terminalScale, setTerminalScale] = useState(1);
  const [userZoomLevel, setUserZoomLevel] = useState(1);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [forceRotatePortrait, setForceRotatePortrait] = useState(true);
  const [isFocusHeaderExpanded, setIsFocusHeaderExpanded] = useState(false);

  // POS Green & Silver Alert Modal state
  const [posAlert, setPosAlert] = useState<PosAlertState | null>(null);
  const showPosAlert = (
    message: string,
    title?: string,
    type: PosAlertState["type"] = "info",
    onClose?: () => void
  ) => {
    setPosAlert({ isOpen: true, message, title, type, onClose });
  };

  // User-selected input zoom tracking (strictly on mobile view when tapped/selected by the user)
  useEffect(() => {
    let isUserTap = false;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "SELECT" || target.tagName === "TEXTAREA")
      ) {
        isUserTap = true;
      } else {
        isUserTap = false;
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      const isMobile =
        typeof window !== "undefined" &&
        (window.innerWidth < 768 || window.innerHeight > window.innerWidth);

      // ONLY zoom in on mobile view if the user explicitly clicked/tapped the input field
      if (isUserTap && isMobile) {
        setIsInputFocused(true);
      } else {
        setIsInputFocused(false);
      }
      isUserTap = false;
    };

    const handleFocusOut = () => {
      setIsInputFocused(false);
      isUserTap = false;
    };

    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  const enterFocusMode = async () => {
    setIsFocusMode(true);
    // Push history state so mobile back gesture exits focus mode without leaving simulator
    try {
      window.history.pushState({ posFocusMode: true }, "");
    } catch {}

    // 1. Fullscreen API
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();
      }
    } catch {}

    // 2. Lock to landscape where API is supported
    try {
      const orientation = (screen as any).orientation || (screen as any).mozOrientation || (screen as any).msOrientation;
      if (orientation && typeof orientation.lock === "function") {
        await orientation.lock("landscape");
      } else if ((screen as any).lockOrientation) {
        (screen as any).lockOrientation("landscape");
      }
    } catch {}
  };

  const exitFocusMode = async (triggerHistoryBack = true) => {
    setIsFocusMode(false);
    setUserZoomLevel(1);
    if (triggerHistoryBack && typeof window !== "undefined" && window.history.state?.posFocusMode) {
      window.history.back();
    }
    // 1. Unlock screen orientation
    try {
      const orientation = (screen as any).orientation || (screen as any).mozOrientation || (screen as any).msOrientation;
      if (orientation && typeof orientation.unlock === "function") {
        orientation.unlock();
      } else if ((screen as any).unlockOrientation) {
        (screen as any).unlockOrientation();
      }
    } catch {}

    // 2. Exit fullscreen
    try {
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch {}
  };

  const toggleFocusMode = () => {
    if (isFocusMode) {
      exitFocusMode();
    } else {
      enterFocusMode();
    }
  };

  // Mobile Hardware / Browser Back button handling in Focus Mode
  useEffect(() => {
    const handlePopState = () => {
      if (isFocusMode) {
        exitFocusMode(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isFocusMode]);

  // Initialize Practical Exam Session
  useEffect(() => {
    if (isExamMode && !examSession) {
      const session = generatePracticalExamSession();
      setExamSession(session);
      setExamCaseIndex(0);
      setExamActionLog([]);
      setCaseResults([]);
      setCaseStartTime(Date.now());
      if (session.cases[0]?.id === "case-open-shift") {
        setTerminalMode("START_OF_DAY_VERIFY");
      }
    }
  }, [isExamMode, examSession]);

  // Synchronize payment terminal slip data whenever practical exam case changes
  useEffect(() => {
    if (!isExamMode || !examSession) return;
    const currentCase = examSession.cases[examCaseIndex];
    if (!currentCase) return;

    const cardEvent = currentCase.events.find((e) => e.tender?.kind === "CREDIT_CARD");
    if (cardEvent?.tender) {
      setReceiptInvoiceNumber(cardEvent.tender.slipInvoice || "004921");
      setReceiptAuthCode(cardEvent.tender.slipAuth || "AP8812");
      setCardReceiptGeneratedAt(new Date());
    }

    const gcashEvent = currentCase.events.find((e) => e.tender?.kind === "GCASH");
    if (gcashEvent?.tender) {
      setGcashReferenceNumber(gcashEvent.tender.reference || "GC88492019");
    }

    const mayaEvent = currentCase.events.find((e) => e.tender?.kind === "MAYA");
    if (mayaEvent?.tender) {
      setMayaTraceNumber("001249");
      setMayaReferenceNumber(mayaEvent.tender.reference || "MY994821");
      setMayaGeneratedAt(new Date());
    }
  }, [isExamMode, examSession, examCaseIndex]);

  const initialScenario = isExamMode
    ? null
    : scenarioParam 
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
    getInitialTerminalMode(initialScenario, isExamMode)
  );

  const [selectedSodButton, setSelectedSodButton] = useState<"YES" | "NO" | null>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLogoutScreenOpen, setIsLogoutScreenOpen] = useState(false);
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

  // Payment Screen States
  const [isLnqrCashPaymentOpen, setIsLnqrCashPaymentOpen] = useState(false);
  const [selectedTenderMethod, setSelectedTenderMethod] = useState<
    "CASH" | "BANK_CARD" | "CHECK" | "GIFT_CERT" | "COUPON" | "EPURSE" | "CREDIT_MEMO" | null
  >("CASH");
  const [lnqrCashTenderInput, setLnqrCashTenderInput] = useState("");
  const [isLnqrTenderProcessed, setIsLnqrTenderProcessed] = useState(false);
  const [isFinalTenderStep, setIsFinalTenderStep] = useState(false);
  const tenderTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isLnqrUpdatedModalOpen, setIsLnqrUpdatedModalOpen] = useState(false);

  // Functional Modals (Modules 4-8)
  const [isItemVoidModalOpen, setIsItemVoidModalOpen] = useState(false);
  const [isTrxVoidModalOpen, setIsTrxVoidModalOpen] = useState(false);
  const [selectedVoidItemId, setSelectedVoidItemId] = useState<string | null>(null);
  const [pendingVoidReason, setPendingVoidReason] = useState<string | null>(null);
  const [isVoidSkuMode, setIsVoidSkuMode] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [isRefundSkuMode, setIsRefundSkuMode] = useState(false);
  const [pendingReturn, setPendingReturn] = useState<{ reason: string; siNumber: string } | null>(null);
  const [isBonusBuyOpen, setIsBonusBuyOpen] = useState(false);
  const [hasBonusBuyBeenPrompted, setHasBonusBuyBeenPrompted] = useState(false);

  // Bank Card In-Screen Flow (Credit Card & E-Wallets like GCash / Maya & Sodexho)
  const [bankCardStep, setBankCardStep] = useState<"SELECT_TYPE" | "SWIPE_CARD" | "DETAILS" | "EWALLET_DETAILS" | "SODEXHO_SERIES" | "SODEXHO_DETAILS" | "FINAL_TEAROFF">("SELECT_TYPE");
  const [sodexhoSeriesType, setSodexhoSeriesType] = useState("-SELECT-");
  const [sodexhoNumber, setSodexhoNumber] = useState("1");
  const [sodexhoValidUntil, setSodexhoValidUntil] = useState("2026-12-31");
  const [sodexhoDenom, setSodexhoDenom] = useState("--Select Sodexho Denom--");
  const [sodexhoAvailAmount, setSodexhoAvailAmount] = useState("");
  const [pendingSodexhoVariance, setPendingSodexhoVariance] = useState<number | null>(null);
  const [pendingSodexhoNotice, setPendingSodexhoNotice] = useState<string | null>(null);
  const [isCompletedReceiptOpen, setIsCompletedReceiptOpen] = useState(false);
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
  const [sulitCoinsRedeemedAmount, setSulitCoinsRedeemedAmount] = useState<number | null>(null);
  const [sulitCoinsRefNo, setSulitCoinsRefNo] = useState("");
  const [isConnectingLnqrServer, setIsConnectingLnqrServer] = useState(false);
  const [isSulitLoading, setIsSulitLoading] = useState(false);
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

  const examTenderKind = examSession?.cases[examCaseIndex]?.events.find(
    (e) => e.tender?.kind === "CREDIT_CARD" || e.tender?.kind === "GCASH" || e.tender?.kind === "MAYA"
  )?.tender?.kind;

  const isExternalReceiptShowing =
    selectedTenderMethod === "BANK_CARD" &&
    selectedBankCardType !== "-SELECT-" &&
    bankCardStep !== "SELECT_TYPE" &&
    (
      selectedBankCardType === "CREDIT CARD" ||
      selectedBankCardType === "VISA" ||
      selectedBankCardType === "MASTERCARD" ||
      (selectedBankCardType === "GCASH" && bankCardStep === "EWALLET_DETAILS") ||
      (selectedBankCardType === "MAYA" && (bankCardStep === "EWALLET_DETAILS" || bankCardStep === "FINAL_TEAROFF"))
    );

  const activeExternalTerminalType: "BDO" | "GCASH" | "MAYA" =
    selectedBankCardType === "GCASH"
      ? "GCASH"
      : selectedBankCardType === "MAYA"
      ? "MAYA"
      : "BDO";

  const currentGcashRef =
    gcashReferenceNumber ||
    (isExamMode
      ? examSession?.cases[examCaseIndex]?.events.find((e) => e.tender?.kind === "GCASH")?.tender?.reference
      : null) ||
    "GC88492019";

  const currentMayaTrace = mayaTraceNumber || "001249";
  const currentMayaRef =
    mayaReferenceNumber ||
    (isExamMode
      ? examSession?.cases[examCaseIndex]?.events.find((e) => e.tender?.kind === "MAYA")?.tender?.reference
      : null) ||
    "MY994821";

  const currentCardInvoice =
    receiptInvoiceNumber ||
    (isExamMode
      ? examSession?.cases[examCaseIndex]?.events.find((e) => e.tender?.kind === "CREDIT_CARD")?.tender?.slipInvoice
      : null) ||
    "004921";

  const currentCardAuth =
    receiptAuthCode ||
    (isExamMode
      ? examSession?.cases[examCaseIndex]?.events.find((e) => e.tender?.kind === "CREDIT_CARD")?.tender?.slipAuth
      : null) ||
    "AP8812";

  const checkViewport = () => {
    if (typeof window === "undefined") return;
    // When virtual keyboard opens on mobile, prevent crushing scale
    if (isInputFocused) return;

    const portrait = window.innerHeight > window.innerWidth;
    setIsPortrait(portrait);

    const effectiveWidth = isFocusMode && portrait && forceRotatePortrait
      ? window.innerHeight
      : window.innerWidth;
    const overhead = isFocusMode ? (isFocusHeaderExpanded ? 160 : 70) : 65;
    const effectiveHeight = isFocusMode && portrait && forceRotatePortrait
      ? window.innerWidth - overhead
      : window.innerHeight - overhead;

    const targetWidth = isExternalReceiptShowing ? 1360 : 1080;
    const availWidth = effectiveWidth - 16;
    const scaleByWidth = Math.max(0.25, availWidth / targetWidth);
    const scaleByHeight = Math.max(0.25, effectiveHeight / 600);
    const scale = Math.min(1, scaleByWidth, scaleByHeight);

    setTerminalScale(scale);
  };

  useEffect(() => {
    checkViewport();
    window.addEventListener("resize", checkViewport);
    window.addEventListener("orientationchange", checkViewport);
    return () => {
      window.removeEventListener("resize", checkViewport);
      window.removeEventListener("orientationchange", checkViewport);
    };
  }, [isFocusMode, forceRotatePortrait, isFocusHeaderExpanded, isExternalReceiptShowing]);

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
  const posContainerRef = useRef<HTMLDivElement>(null);
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
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [timedOut, setTimedOut] = useState(false);
  const [isExamCompleted, setIsExamCompleted] = useState(false);
  const hasRecordedAttemptRef = useRef(false);

  // Auto-quit Focus Mode when practice scenario or assessment completes
  useEffect(() => {
    if ((isExamCompleted || timedOut) && isFocusMode) {
      exitFocusMode();
    }
  }, [isExamCompleted, timedOut, isFocusMode]);

  // Error Feedback State
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isTerminalShaking, setIsTerminalShaking] = useState(false);
  const errorTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerErrorEffect = (message?: string) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.22, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      }
    } catch {}

    setIsTerminalShaking(true);
    setTimeout(() => setIsTerminalShaking(false), 450);

    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setErrorNotice(message || "Incorrect action. Please follow current step instructions.");
    errorTimerRef.current = setTimeout(() => {
      setErrorNotice(null);
    }, 3800);
  };

  const remainingSeconds = isExamMode
    ? Math.max(
        0,
        (examSession?.totalTimeLimitSeconds || 900) -
          Math.floor((now.getTime() - scenarioStartTime) / 1000)
      )
    : activeScenario?.timeLimitSeconds == null
    ? null
    : Math.max(
        0,
        activeScenario.timeLimitSeconds -
          Math.floor((now.getTime() - scenarioStartTime) / 1000)
      );

  useEffect(() => {
    if (
      remainingSeconds === 0 &&
      !isExamCompleted &&
      !timedOut &&
      (isExamMode || activeScenario?.timeLimitSeconds != null)
    ) {
      setTimedOut(true);
      if (isExamMode) {
        handleFinishExamSession(true);
      }
    }
  }, [remainingSeconds, isExamCompleted, timedOut, activeScenario, isExamMode]);

  

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
    if ((isExamCompleted || timedOut) && activeScenario && !hasRecordedAttemptRef.current) {
      hasRecordedAttemptRef.current = true;
      const timeSpent = Math.max(1, Math.round((Date.now() - scenarioStartTime) / 1000));
      const penalty = mistakes.length * 10;
      const score = timedOut ? 0 : Math.max(0, 100 - penalty);
      recordScenarioAttempt({
        id: "attempt-" + Date.now(),
        scenarioId: activeScenario.id,
        scenarioTitle: activeScenario.title,
        timestamp: new Date().toISOString(),
        score,
        passed: !timedOut && score >= activeScenario.passingScore,
        stepsCompleted: currentStepIndex,
        totalSteps: activeScenario.steps.length,
        mistakes,
        hintsUsed,
        timeSpentSeconds: timeSpent,
      });
    }
  }, [
    isExamCompleted,
    timedOut,
    activeScenario,
    scenarioStartTime,
    mistakes,
    currentStepIndex,
    hintsUsed,
  ]);

  const handleVerifyDateYes = () => {
    setSelectedSodButton(null);
    setTerminalMode("START_OF_DAY_CLOSE");
    validateScenarioStep("VERIFY_DATE_YES");
    if (isExamMode) logExamAction("VERIFY_DATE_YES");
  };

  const handleVerifyDateNo = () => {
    setSelectedSodButton("NO");
    validateScenarioStep("VERIFY_DATE_NO");
    setTerminalMode("START_OF_DAY_INCORRECT");
    if (isExamMode) logExamAction("VERIFY_DATE_NO");
  };

  const handleCloseSodWindow = () => {
    setTerminalMode("POS_RELOADER");
    validateScenarioStep("CLOSE_SOD_WINDOW");
    if (isExamMode) logExamAction("CLOSE_SOD_WINDOW");
  };

  const handleReloadToLogin = () => {
    setTerminalMode("USER_LOGIN");
    validateScenarioStep("RELOAD_POS_LOGIN");
    if (isExamMode) logExamAction("RELOAD_POS_LOGIN");
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const userToSubmit = loginUsername.trim() || "241209";
    setTerminalMode("ACTIVE_REGISTER");
    validateScenarioStep("LOGIN_SUBMIT", userToSubmit);
    if (isExamMode) {
      logExamAction("LOGIN_SUBMIT", userToSubmit);
      if (examSession?.cases[examCaseIndex]?.id === "case-open-shift") {
        setTimeout(() => {
          handleAdvanceExamCase();
        }, 800);
      }
    }
  };

  const handleConfirmLogout = () => {
    setIsLogoutScreenOpen(false);
    setSelectedLogoutButton(null);
    setTerminalMode("USER_LOGIN");
    validateScenarioStep("CONFIRM_LOGOUT_YES");
    if (isExamMode) {
      logExamAction("CONFIRM_LOGOUT_YES");
      if (examSession?.cases[examCaseIndex]?.id === "case-close-shift") {
        setTimeout(() => {
          handleAdvanceExamCase();
        }, 500);
      }
    }
  };

  const handleCancelLogout = () => {
    setIsLogoutScreenOpen(false);
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
    const netDue = Math.max(0, totals.totalAmount - (sulitCoinsRedeemedAmount || 0));
    const currentCaseTender = isExamMode && examSession
      ? examSession.cases[examCaseIndex]?.events.find((e) => e.tender?.kind === "CASH")?.tender?.amount
      : null;
    const rawVal = parseFloat(lnqrCashTenderInput);
    const tenderVal = !isNaN(rawVal) && rawVal > 0 ? rawVal : (currentCaseTender || netDue);
    if (!tenderVal || tenderVal <= 0) {
      return;
    }
    if (tenderVal < netDue) {
      showPosAlert(
        `Amount tendered (₱${tenderVal.toFixed(2)}) is less than amount due (₱${netDue.toFixed(2)})!`,
        "Tender Error",
        "warning"
      );
      return;
    }
    setIsLnqrTenderProcessed(true);
    setIsFinalTenderStep(false);
    dispatch({ type: "TENDER_PAYMENT", amount: tenderVal });
    if (isExamMode) {
      setPendingCashTender(tenderVal);
    }

    if (tenderTimerRef.current) {
      clearTimeout(tenderTimerRef.current);
    }

    if (sulitCoinsRedeemedAmount !== null || loyaltyType === "LNQR") {
      setIsConnectingLnqrServer(true);
      tenderTimerRef.current = setTimeout(() => {
        setIsLnqrUpdatedModalOpen(true);
      }, 1000);
      validateScenarioStep("SUBMIT_CASH_TENDER", lnqrCashTenderInput);
      return;
    }

    const processingDelay = isExamMode ? 1800 : 3000;
    tenderTimerRef.current = setTimeout(() => {
      setIsFinalTenderStep(true);
      if (isExamMode) {
        setTimeout(() => {
          setIsChangeCheckModalOpen(true);
        }, 800);
      }
    }, processingDelay);
    validateScenarioStep("SUBMIT_CASH_TENDER", lnqrCashTenderInput);
    validateScenarioStep("CONFIRM_TENDER", tenderVal);
  };

  const handleConfirmLnqrUpdated = () => {
    if (tenderTimerRef.current) {
      clearTimeout(tenderTimerRef.current);
      tenderTimerRef.current = null;
    }
    setIsLnqrUpdatedModalOpen(false);
    setIsConnectingLnqrServer(false);
    if (activeScenario?.id === "scen-les-8-3") {
      dispatch({ type: "CLOSE_PAYMENT" });
      dispatch({ type: "RESET_TRANSACTION" });
      setIsLnqrCashPaymentOpen(false);
      setIsLnqrTenderProcessed(false);
      setIsFinalTenderStep(false);
      setLnqrCashTenderInput("");
      setIsLnqrScanScreenOpen(false);
      setIsLncCardScreenOpen(false);
      setIsLoyaltyOptionOpen(false);
      setHasBonusBuyBeenPrompted(false);
      setLoyaltyType("NONE");
      setSelectedTenderMethod("CASH");
      setSulitCoinsEarnedAmount(null);
      setSulitCoinsRedeemedAmount(null);
      setSulitCoinsRefNo("");
    } else {
      setIsFinalTenderStep(true);
      if (isExamMode) {
        setTimeout(() => {
          setIsChangeCheckModalOpen(true);
        }, 800);
      }
    }
    validateScenarioStep("CONFIRM_LNQR_UPDATED");
  };

  const handleConfirmBankCardPayment = () => {
    if (
      bankCardStep === "EWALLET_DETAILS" &&
      selectedBankCardType.toUpperCase() === "LNQR SULIT COINS"
    ) {
      const redeemedCoins = Number(bankCardAmountInput.trim());
      if (!bankCardAmountInput.trim() || !Number.isFinite(redeemedCoins) || redeemedCoins < 0) {
        showPosAlert("Please enter a valid Sulit Coins amount.", "Sulit Coins Error", "warning");
        return;
      }

      const refNo = customerQrInput.trim() || bankCardRefNo.trim() || "20260511LN000006";
      setSulitCoinsRedeemedAmount(redeemedCoins);
      setSulitCoinsRefNo(refNo);
      setSulitCoinsEarnedAmount(29.70);
      setIsSulitLoading(true);
      validateScenarioStep("REDEEM_SULIT_COINS", redeemedCoins);

      setTimeout(() => {
        setIsSulitLoading(false);
        const remainingDue = Math.max(0, totals.totalAmount - redeemedCoins);
        // If remaining balance exists, allow cashier to select tender method again (Cash or Bank Card)
        if (remainingDue > 0) {
          setSelectedTenderMethod(null);
          setSelectedBankCardType("-SELECT-");
          setBankCardStep("SELECT_TYPE");
          setIsLnqrCashPaymentOpen(true);
          setIsLnqrTenderProcessed(false);
          setIsFinalTenderStep(false);
          setLnqrCashTenderInput("");
        } else {
          // Exactly paid off by Sulit Coins
          setSelectedTenderMethod("BANK_CARD");
          setIsFinalTenderStep(true);
        }
      }, 800);
      return;
    }

    // Auto-fallback to terminal receipt details if trainee submits without re-typing
    if (!bankCardAuthCode.trim() && currentCardAuth) {
      setBankCardAuthCode(currentCardAuth);
    }
    if (!bankCardSlipNo.trim() && currentCardInvoice) {
      setBankCardSlipNo(currentCardInvoice);
    }
    if (!bankCardRefNo.trim()) {
      if (selectedBankCardType.toUpperCase() === "GCASH" && currentGcashRef) {
        setBankCardRefNo(currentGcashRef);
      } else if (selectedBankCardType.toUpperCase() === "MAYA" && currentMayaRef) {
        setBankCardRefNo(currentMayaRef);
      }
    }

    dispatch({ type: "TENDER_PAYMENT", amount: totals.totalAmount });
    dispatch({ type: "SELECT_PAYMENT_METHOD", method: "BANK_CARD" });
    setBankCardStep("FINAL_TEAROFF");
    setIsFinalTenderStep(true);
    validateScenarioStep("CONFIRM_TENDER", totals.totalAmount);
    if (isExamMode) {
      logExamAction("CONFIRM_TENDER", selectedBankCardType);
      setTimeout(() => {
        handleAdvanceExamCase(0);
      }, 1200);
    }
  };

  const handleConfirmSodexhoPayment = () => {
    const tenderVal = parseFloat(sodexhoAvailAmount || sodexhoDenom) || 0;
    if (tenderVal <= 0) {
      showPosAlert("Please select or enter a valid Sodexho denomination.", "Sodexho Tender", "warning");
      return;
    }

    const currentTotal = totals.totalAmount;
    if (tenderVal > currentTotal + 0.009) {
      const diff = tenderVal - currentTotal;
      const changeDifference = diff > 0 ? diff : 0;
      setPendingSodexhoVariance(changeDifference);
      showPosAlert(
        "Sodexho Amount is greater than total transaction amount. Please perform Variance or use other payments.",
        "Sodexho Amount Error",
        "warning"
      );
      dispatch({ type: "CLOSE_PAYMENT" });
      setSelectedTenderMethod("CASH");
      setSelectedBankCardType("-SELECT-");
      setBankCardStep("SELECT_TYPE");
      return;
    } else if (tenderVal < currentTotal - 0.009) {
      showPosAlert(
        "Sodexho Amount is less than total transaction amount. Please enter the full amount or split tender.",
        "Sodexho Amount Error",
        "warning"
      );
      return;
    }

    const varianceItem = state.lineItems.find(
      (it) => !it.isVoided && (it.sku === "ZSOI" || it.description.toUpperCase().includes("SODEXHO"))
    );
    const varianceAmt = varianceItem ? varianceItem.total : 0;

    dispatch({
      type: "TENDER_PAYMENT",
      amount: currentTotal,
      sodexhoDetails: {
        number: sodexhoNumber || "PP12345678",
        validUntil: sodexhoValidUntil || "2026-12-31",
        denom: tenderVal,
        seriesType: sodexhoSeriesType,
        varianceAmount: varianceAmt,
      },
    });
    dispatch({ type: "SELECT_PAYMENT_METHOD", method: "SODEXHO" });
    validateScenarioStep("CONFIRM_TENDER", currentTotal);
    setBankCardStep("FINAL_TEAROFF");
    setIsFinalTenderStep(true);
  };

  const handleCloseCompletedReceipt = () => {
    dispatch({ type: "CLOSE_PAYMENT" });
    dispatch({ type: "RESET_TRANSACTION" });
    setSelectedTenderMethod("CASH");
    setSelectedBankCardType("-SELECT-");
    setBankCardStep("SELECT_TYPE");
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
    setSulitCoinsEarnedAmount(null);
    setSulitCoinsRedeemedAmount(null);
    setSulitCoinsRefNo("");
    setIsConnectingLnqrServer(false);
    setBankCardSwipeNum("");
    setBankCardHolder("X");
    setBankCardTerminal("BDO POS");
    setBankCardValidUntil("2028-12-31");
    setBankCardAuthCode("");
    setBankCardSlipNo("");
    const examCardTender = isExamMode && examSession
      ? examSession.cases[examCaseIndex]?.events.find((e) => e.tender?.kind === "CREDIT_CARD")?.tender
      : null;
    const examGcashTender = isExamMode && examSession
      ? examSession.cases[examCaseIndex]?.events.find((e) => e.tender?.kind === "GCASH")?.tender
      : null;
    const examMayaTender = isExamMode && examSession
      ? examSession.cases[examCaseIndex]?.events.find((e) => e.tender?.kind === "MAYA")?.tender
      : null;

    setReceiptAuthCode(examCardTender?.slipAuth || "AP8812");
    setReceiptInvoiceNumber(examCardTender?.slipInvoice || "004921");
    setCardReceiptGeneratedAt(null);
    setBankCardRefNo("");
    setBankCardAmountInput("");
    setGcashReferenceNumber(examGcashTender?.reference || "GC88492019");
    setMayaTraceNumber("001249");
    setMayaReferenceNumber(examMayaTender?.reference || "MY994821");
    setMayaGeneratedAt(null);
    setPendingSodexhoVariance(null);
    setPendingSodexhoNotice(null);
  };

  const handleConfirmBankCardType = () => {
    const cardType =
      selectedBankCardType === "-SELECT-" ? "CREDIT CARD" : selectedBankCardType;
    setSelectedBankCardType(cardType);
    validateScenarioStep("SELECT_CARD_TYPE", cardType);

    if (cardType === "SODEXHO") {
      setBankCardStep("SODEXHO_SERIES");
      return;
    }

    if (cardType === "CREDIT CARD") {
      const examCardTender = isExamMode && examSession
        ? examSession.cases[examCaseIndex]?.events.find((e) => e.tender?.kind === "CREDIT_CARD")?.tender
        : null;
      setReceiptInvoiceNumber(examCardTender?.slipInvoice || "004921");
      setReceiptAuthCode(examCardTender?.slipAuth || "AP8812");
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
    validateScenarioStep("SELECT_CARD_TYPE", cardType);
    setBankCardAmountInput((totals.totalAmount || 2990).toFixed(2));
    setBankCardRefNo("");
    if (cardType.toUpperCase() === "GCASH") {
      const examGcashTender = isExamMode && examSession
        ? examSession.cases[examCaseIndex]?.events.find((e) => e.tender?.kind === "GCASH")?.tender
        : null;
      setGcashReferenceNumber(examGcashTender?.reference || "GC88492019");
      setMayaTraceNumber("");
      setMayaReferenceNumber("");
      setMayaGeneratedAt(null);
    } else if (cardType.toUpperCase() === "MAYA") {
      const examMayaTender = isExamMode && examSession
        ? examSession.cases[examCaseIndex]?.events.find((e) => e.tender?.kind === "MAYA")?.tender
        : null;
      setMayaTraceNumber("001249");
      setMayaReferenceNumber(examMayaTender?.reference || "MY994821");
      setMayaGeneratedAt(new Date());
      setGcashReferenceNumber("");
    } else if (cardType.toUpperCase() === "LNQR SULIT COINS") {
      setCustomerQrInput((prev) => prev.trim() || "20221003LN000004");
      setBankCardAmountInput("29.00");
      setGcashReferenceNumber("");
      setMayaTraceNumber("");
      setMayaReferenceNumber("");
      setMayaGeneratedAt(null);
    } else {
      setGcashReferenceNumber("");
      setMayaTraceNumber("");
      setMayaReferenceNumber("");
      setMayaGeneratedAt(null);
    }
    setSulitCoinsRedeemedAmount(null);
    setSulitCoinsRefNo("");
    setIsConnectingLnqrServer(false);
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
        if (cardType.toUpperCase() === "SODEXHO") {
          setSelectedBankCardType("SODEXHO");
          validateScenarioStep("SELECT_CARD_TYPE", "SODEXHO");
          setBankCardStep("SODEXHO_SERIES");
          return;
        }
        if (isEwalletCardType(cardType)) {
          handleConfirmEwalletType(cardType);
        } else {
          handleConfirmBankCardType();
        }
        return;
      }
      if (bankCardStep === "SODEXHO_SERIES") {
        if (sodexhoSeriesType === "-SELECT-") {
          setSodexhoSeriesType("Without Series");
        }
        setBankCardStep("SODEXHO_DETAILS");
        return;
      }
      if (bankCardStep === "SODEXHO_DETAILS") {
        handleConfirmSodexhoPayment();
        return;
      }
      if (bankCardStep === "SWIPE_CARD") {
        validateScenarioStep("SWIPE_CARD", bankCardSwipeNum || "4000123456789010");
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
        handleCloseCompletedReceipt();
        return;
      }
     
    }

    if (!isLnqrTenderProcessed) {
      if (selectedTenderMethod === "GIFT_CERT") {
        setIsFinalTenderStep(true);
        handleConfirmElectronicTender("Gift Certificate", totals.totalAmount || 500);
        return;
      }
      if (selectedTenderMethod === "COUPON") {
        if (couponEntryMode === "SELECT") {
          setCouponEntryMode("WITHOUT_SERIES");
          validateScenarioStep("SELECT_COUPON_MODE", "WITHOUT_SERIES");
          return;
        }
        setIsFinalTenderStep(true);
        handleConfirmElectronicTender("Coupon", totals.totalAmount || 50);
        return;
      }
      if (selectedTenderMethod === "CREDIT_MEMO") {
        setIsFinalTenderStep(true);
        handleConfirmElectronicTender("Credit Memo", totals.totalAmount || 2990);
        return;
      }
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
    setSulitCoinsRedeemedAmount(null);
    setSulitCoinsRefNo("");
    setIsConnectingLnqrServer(false);
    setIsSulitLoading(false);
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
      const isMobileDevice = typeof window !== "undefined" && (window.innerWidth < 768 || "ontouchstart" in window);
      if (!isMobileDevice) {
        cashTenderInputRef.current?.focus({ preventScroll: true });
      }
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
      !isLogoutScreenOpen &&
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
      !isBonusBuyOpen &&
      !isLogoutScreenOpen
    ) {
      const isMobileDevice = typeof window !== "undefined" && (window.innerWidth < 768 || "ontouchstart" in window);
      if (!isMobileDevice) {
        barcodeRef.current?.focus({ preventScroll: true });
      }
    }
  }, [
    terminalMode,
    state.isQuantityInputActive,
    state.activeLookupOpen,
    state.managerOverrideOpen,
    state.paymentDialogOpen,
    state.currentPage,
    isLogoutScreenOpen,
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
    dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
    validateScenarioStep("SCAN_VOID_SKU", selectedItem.sku);
    validateScenarioStep("CONFIRM_ITEM_VOID", pendingVoidReason || "Customer changed mind");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept keystrokes when ChangeCheckModal is active
      if (isChangeCheckModalOpen) {
        return;
      }

      // Tab Navigation
      if (e.key === "Tab" && posContainerRef.current) {
        // Sub-modes
        if (
          terminalMode === "START_OF_DAY_VERIFY" ||
          isLncCardScreenOpen ||
          isLnqrScanScreenOpen
        ) {
          // Sub-mode handling
        } else {
          const focusable = Array.from(
            posContainerRef.current.querySelectorAll<HTMLElement>(
              'input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])'
            )
          ).filter((el) => el.offsetParent !== null || el.getClientRects().length > 0);

          if (focusable.length > 0) {
            const isInsidePos = posContainerRef.current.contains(document.activeElement);
            const firstElement = focusable[0];
            const lastElement = focusable[focusable.length - 1];

            // Focus Restore
            if (!isInsidePos) {
              e.preventDefault();
              if (e.shiftKey) {
                lastElement.focus();
              } else {
                firstElement.focus();
              }
              return;
            }

            // Payment OK Navigation
            if (state.currentPage === "PAYMENT" || isLnqrCashPaymentOpen) {
              if (paymentOkBtnRef.current) {
                const active = document.activeElement;
                if (active === paymentOkBtnRef.current) {
                  if (e.shiftKey) {
                    e.preventDefault();
                    const inputs = focusable.filter(
                      (el) => el !== paymentOkBtnRef.current && (el.tagName === "INPUT" || el.tagName === "SELECT")
                    );
                    if (inputs.length > 0) {
                      inputs[inputs.length - 1].focus();
                    } else {
                      firstElement.focus();
                    }
                    return;
                  } else {
                    const otherButtons = focusable.filter(
                      (el) => el !== paymentOkBtnRef.current && el.tagName === "BUTTON"
                    );
                    if (otherButtons.length > 0) {
                      e.preventDefault();
                      otherButtons[0].focus();
                      return;
                    } else {
                      e.preventDefault();
                      firstElement.focus();
                      return;
                    }
                  }
                } else if (active && (active.tagName === "INPUT" || active.tagName === "SELECT")) {
                  const inputs = focusable.filter(
                    (el) => el !== paymentOkBtnRef.current && (el.tagName === "INPUT" || el.tagName === "SELECT")
                  );
                  const currentIdx = inputs.indexOf(active as HTMLElement);
                  if (!e.shiftKey && (currentIdx === -1 || currentIdx === inputs.length - 1)) {
                    e.preventDefault();
                    paymentOkBtnRef.current.focus();
                    return;
                  }
                }
              }
            }

            // Tab Wrap
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
                return;
              }
            } else {
              if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
                return;
              }
            }
          } else {
            e.preventDefault();
            return;
          }
        }
      }

      // Item Selection Navigation
      if (
        isVoidSkuMode &&
        !e.altKey &&
        (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "F11" || e.key === "F12")
      ) {
        e.preventDefault();
        const activeItems = state.lineItems.filter((item) => !item.isVoided);
        if (activeItems.length === 0) return;

        const currentArrayIndex = activeItems.findIndex(
          (item) => item.id === selectedVoidItemId
        );
        const currentVisualIdx =
          currentArrayIndex < 0 ? 0 : activeItems.length - 1 - currentArrayIndex;

        const isGoingDown = e.key === "ArrowDown" || e.key === "F12";
        const nextVisualIdx = isGoingDown
          ? Math.min(activeItems.length - 1, currentVisualIdx + 1)
          : Math.max(0, currentVisualIdx - 1);

        setSelectedVoidItemId(activeItems[activeItems.length - 1 - nextVisualIdx].id);
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
            handleVerifyDateNo();
          }
          return;
        }
      }

      // 1b. If in START_OF_DAY_INCORRECT mode
      if (terminalMode === "START_OF_DAY_INCORRECT") {
        if (e.key === "Escape" || e.key === "Enter" || e.key === "Backspace") {
          e.preventDefault();
          setSelectedSodButton(null);
          setTerminalMode("START_OF_DAY_VERIFY");
          validateScenarioStep("BACK_TO_SOD_VERIFY");
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
      if (isLogoutScreenOpen) {
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
          if (selectedLogoutButton === "NO") {
            handleCancelLogout();
          } else {
            handleConfirmLogout();
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

      // 4e. Payment Screen Keybinds
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
          return;
        }
        if (e.key === "F8") {
          e.preventDefault();
          setSelectedTenderMethod("CREDIT_MEMO");
          setElectronicPaymentType("Debit Card / BancNet");
          validateScenarioStep("PAY_CREDIT_MEMO");
          return;
        }
      }

      // 4f. Modal Escape Key Dismissals
      if (e.key === "Escape") {
        if (isCompletedReceiptOpen) {
          e.preventDefault();
          handleCloseCompletedReceipt();
          return;
        }
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
        if (isTrxDiscOpen) {
          e.preventDefault();
          setIsTrxDiscOpen(false);
          return;
        }
        if (journalModalMode !== null) {
          e.preventDefault();
          setJournalModalMode(null);
          if (activeScenario?.steps[currentStepIndex]?.expectedAction === "CLOSE_JOURNAL") {
            validateScenarioStep("CLOSE_JOURNAL");
          }
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
    if (readingsType !== null || isSdvOpen || journalModalMode !== null) {
      if (
        fKey === "F2" ||
        fKey === "F4" ||
        fKey === "F6" ||
        fKey === "F8" ||
        fKey === "F9" ||
        fKey === "F10" ||
        fKey === "F5" ||
        fKey === "F11" ||
        fKey === "F12"
      ) {
        setReadingsType(null);
        setIsSdvOpen(false);
        setJournalModalMode(null);
      } else {
        return;
      }
    }

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
      isSdvOpen ||
      isTrxCommentOpen ||
      returnRefundMode !== null ||
      isElectronicPaymentOpen ||
      isPostVoidOpen ||
      isPriceChangeOpen ||
      isNonMdseOpen ||
      journalModalMode !== null ||
      isNonSalesOpen ||
      isBonusBuyOpen ||
      isLogoutScreenOpen
    ) {
      return;
    }

    const currentKeys = RIGHT_FUNCTION_KEYS[state.currentPage] || [];
    const matched = currentKeys.find((k) => k.key === fKey);
    if (matched) {
      if (
        state.currentPage === "MAIN" &&
        state.lineItems.length === 0 &&
        (matched.key === "F4" || matched.key === "F7" || matched.key === "F8" || matched.key === "F9")
      ) {
        if (activeScenario) {
          handleAction(matched.actionId);
        }
        return;
      }
      if (matched.disabled) {
        if (activeScenario) {
          handleAction(matched.actionId);
        }
        return;
      }
      handleAction(matched.actionId);
      return;
    }

    const currentHorizKeys = HORIZONTAL_FUNCTION_KEYS[state.currentPage] || [];
    const matchedHoriz = currentHorizKeys.find((k) => k.key === fKey);
    if (matchedHoriz && !matchedHoriz.disabled) {
      handleAction(matchedHoriz.actionId);
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

  const isStepMatch = (actionId: string, dataVal?: string | number): boolean => {
    if (!activeScenario || isExamCompleted) return true;
    const currentStep = activeScenario.steps[currentStepIndex];
    if (!currentStep) return true;

    let actionMatches = currentStep.expectedAction === actionId;

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

    if (
      (currentStep.expectedAction === "CONFIRM_TENDER" && actionId === "SUBMIT_CASH_TENDER") ||
      (currentStep.expectedAction === "SUBMIT_CASH_TENDER" && actionId === "CONFIRM_TENDER")
    ) {
      actionMatches = true;
    }

    if (
      (currentStep.expectedAction === "REFUND_ORNO" && (actionId === "SUBMIT_REFUND_ORNO" || actionId === "REFUND_ORNO")) ||
      (currentStep.expectedAction === "SUBMIT_REFUND_ORNO" && (actionId === "SUBMIT_REFUND_ORNO" || actionId === "REFUND_ORNO"))
    ) {
      actionMatches = true;
    }

    if (
      (currentStep.expectedAction === "PAY_CASH" && (actionId === "CONFIRM_TENDER" || actionId === "SUBMIT_CASH_TENDER")) ||
      (currentStep.expectedAction === "CONFIRM_TENDER" && actionId === "PAY_CASH")
    ) {
      actionMatches = true;
    }

    if (
      currentStep.expectedAction === "CHOOSE_LNQR_OPTION" &&
      (actionId === "PAY_CASH" || actionId === "PAY_CARD")
    ) {
      actionMatches = true;
    }

    if (
      (currentStep.expectedAction === "LOOKUP_SEARCH" && (actionId === "LOOKUP_SEARCH" || actionId === "LOOKUP_QUERY" || actionId === "ADD_ITEM")) ||
      (currentStep.expectedAction === "LOOKUP_QUERY" && (actionId === "LOOKUP_QUERY" || actionId === "ADD_ITEM"))
    ) {
      actionMatches = true;
    }

    if (currentStep.expectedAction === "SUSPEND" && actionId === "CONFIRM_SUSPEND") {
      actionMatches = true;
    }

    if (currentStep.expectedAction === "RECALL" && (actionId === "CONFIRM_OVERRIDE" || actionId === "CONFIRM_RECALL")) {
      actionMatches = true;
    }

    if (currentStep.expectedAction === "POST_VOID" && (actionId === "CONFIRM_OVERRIDE" || actionId === "CONFIRM_POST_VOID")) {
      actionMatches = true;
    }

    if (actionId === "PAGE_DOWN") {
      const pageCycle: Record<string, string> = {
        MAIN: "NAV_SECOND",
        SECOND: "NAV_THIRD",
        THIRD: "NAV_FOURTH",
        FOURTH: "NAV_MAIN",
      };
      if (
        pageCycle[state.currentPage] === currentStep.expectedAction ||
        (state.currentPage === "FOURTH" && (currentStep.expectedAction === "PAGE_DOWN" || currentStep.expectedAction === "NAV_MAIN"))
      ) {
        actionMatches = true;
      }
    }
    if (actionId === "PAGE_UP") {
      const pageCycleRev: Record<string, string> = {
        MAIN: "NAV_FOURTH",
        FOURTH: "NAV_THIRD",
        THIRD: "NAV_SECOND",
        SECOND: "NAV_MAIN",
      };
      if (pageCycleRev[state.currentPage] === currentStep.expectedAction) {
        actionMatches = true;
      }
    }
    if (
      (currentStep.expectedAction === "PAGE_DOWN" && (actionId === "PAGE_DOWN" || actionId === "NAV_MAIN")) ||
      (currentStep.expectedAction === "NAV_MAIN" && (actionId === "PAGE_DOWN" || actionId === "NAV_MAIN"))
    ) {
      actionMatches = true;
    }

    if (
      (currentStep.expectedAction === "TRIGGER_LOGOUT" && (actionId === "LOGOUT" || actionId === "TRIGGER_LOGOUT")) ||
      (currentStep.expectedAction === "LOGOUT" && (actionId === "LOGOUT" || actionId === "TRIGGER_LOGOUT"))
    ) {
      actionMatches = true;
    }

    if (
      (currentStep.expectedAction === "SET_QTY" && (actionId === "SET_QTY_MODE" || actionId === "SET_QTY")) ||
      (currentStep.expectedAction === "SET_QTY_MODE" && (actionId === "SET_QTY_MODE" || actionId === "SET_QTY"))
    ) {
      actionMatches = true;
    }

    if (
      (currentStep.expectedAction === "RETURN" && (actionId === "RETURN_EXCHANGE" || actionId === "RETURN")) ||
      (currentStep.expectedAction === "RETURN_EXCHANGE" && (actionId === "RETURN_EXCHANGE" || actionId === "RETURN"))
    ) {
      actionMatches = true;
    }

    if (
      (currentStep.expectedAction === "DISCOUNT" && (actionId === "TRX_DISC" || actionId === "DISCOUNT")) ||
      (currentStep.expectedAction === "TRX_DISC" && (actionId === "TRX_DISC" || actionId === "DISCOUNT"))
    ) {
      actionMatches = true;
    }

    if (
      (currentStep.expectedAction === "SDV" && (actionId === "SDV_CHECK" || actionId === "SDV")) ||
      (currentStep.expectedAction === "SDV_CHECK" && (actionId === "SDV_CHECK" || actionId === "SDV"))
    ) {
      actionMatches = true;
    }

    if (
      (currentStep.expectedAction === "BEST_BUY" && (actionId === "BONUS_BUY" || actionId === "BEST_BUY")) ||
      (currentStep.expectedAction === "BONUS_BUY" && (actionId === "BONUS_BUY" || actionId === "BEST_BUY"))
    ) {
      actionMatches = true;
    }

    if (
      (currentStep.expectedAction === "TOGGLE_DISC" && (actionId === "ON_OFF_DISCOUNT" || actionId === "TOGGLE_DISC")) ||
      (currentStep.expectedAction === "ON_OFF_DISCOUNT" && (actionId === "ON_OFF_DISCOUNT" || actionId === "TOGGLE_DISC"))
    ) {
      actionMatches = true;
    }

    if (
      (currentStep.expectedAction === "CHOOSE_LNC_OPTION" && (actionId === "CHOOSE_LNQR_OPTION" || actionId === "CHOOSE_LNC_OPTION")) ||
      (currentStep.expectedAction === "CHOOSE_LNQR_OPTION" && actionId === "CHOOSE_LNC_OPTION")
    ) {
      actionMatches = true;
    }

    if (
      (currentStep.expectedAction === "CONFIRM_LNC_CARD" && (actionId === "SUBMIT_LNC" || actionId === "CONFIRM_LNC_CARD")) ||
      (currentStep.expectedAction === "SUBMIT_LNC" && (actionId === "SUBMIT_LNC" || actionId === "CONFIRM_LNC_CARD"))
    ) {
      actionMatches = true;
    }

    if (
      (currentStep.expectedAction === "CONFIRM_GC_TENDER" && (actionId === "CONFIRM_TENDER" || actionId === "CONFIRM_GC_TENDER")) ||
      (currentStep.expectedAction === "CONFIRM_TENDER" && actionId === "CONFIRM_GC_TENDER")
    ) {
      actionMatches = true;
    }

    if (
      (currentStep.expectedAction === "PAGE_UP" && (actionId === "PAGE_UP" || actionId === "NAV_FOURTH" || actionId === "NAV_THIRD" || actionId === "NAV_SECOND" || actionId === "NAV_MAIN")) ||
      (currentStep.expectedAction === "NAV_FOURTH" && actionId === "PAGE_UP" && state.currentPage === "MAIN")
    ) {
      actionMatches = true;
    }

    let dataMatches = true;
    if (currentStep.expectedData !== undefined && dataVal !== undefined) {
      if (currentStep.expectedAction === "LOOKUP_QUERY") {
        dataMatches = String(dataVal).trim().length > 0;
      } else if (typeof currentStep.expectedData === "number" || !isNaN(Number(currentStep.expectedData))) {
        dataMatches =
          Number(currentStep.expectedData) === Number(dataVal) ||
          (actionId === "CONFIRM_TENDER" && Number(dataVal) > 0);
      } else {
        dataMatches = String(currentStep.expectedData).toUpperCase() === String(dataVal).toUpperCase();
      }
    }

    return actionMatches && dataMatches;
  };

  const isActionAllowedInScenario = (actionId: string, dataVal?: string | number): boolean => {
    if (isStepMatch(actionId, dataVal)) return true;
    if (!activeScenario || isExamCompleted) return true;
    const currentStep = activeScenario.steps[currentStepIndex];
    if (!currentStep) return true;

    // Target Screen Navigation
    const SCREEN_OF_ACTION: Record<string, "MAIN" | "SECOND" | "THIRD" | "FOURTH"> = {
      SET_QTY: "MAIN",
      SET_QTY_MODE: "MAIN",
      GO_PAYMENT: "MAIN",
      NON_MDSE: "MAIN",
      ITEM_VOID: "MAIN",
      TRX_VOID: "MAIN",
      SUSPEND: "MAIN",
      LOOKUP: "MAIN",
      CSA_TOGGLE: "MAIN",
      PRICE_CHANGE: "SECOND",
      TRX_DISC: "SECOND",
      DISCOUNT: "SECOND",
      RECALL: "SECOND",
      LOGOUT: "SECOND",
      TRIGGER_LOGOUT: "SECOND",
      NO_SALE: "SECOND",
      ON_OFF_DISCOUNT: "SECOND",
      TOGGLE_DISC: "SECOND",
      REPRINT: "SECOND",
      TRX_JOURNAL: "THIRD",
      SALES_JOURNAL: "THIRD",
      READING_Y: "THIRD",
      READING_Z: "THIRD",
      SDV: "THIRD",
      SDV_CHECK: "THIRD",
      POST_VOID: "THIRD",
      TRX_COMMENT: "FOURTH",
      NON_SALES: "FOURTH",
      ZERO_RATED: "FOURTH",
      RETURN: "FOURTH",
      RETURN_EXCHANGE: "FOURTH",
      REFUND: "FOURTH",
      BONUS_BUY: "FOURTH",
      BEST_BUY: "FOURTH",
    };

    const targetScreen = SCREEN_OF_ACTION[currentStep.expectedAction];
    if (targetScreen) {
      if (actionId === "NAV_SECOND" && state.currentPage === "MAIN" && targetScreen !== "MAIN") {
        return true;
      }
      if (actionId === "NAV_THIRD" && state.currentPage === "SECOND" && (targetScreen === "THIRD" || targetScreen === "FOURTH")) {
        return true;
      }
      if (actionId === "NAV_FOURTH" && state.currentPage === "THIRD" && targetScreen === "FOURTH") {
        return true;
      }
      if ((actionId === "PAGE_DOWN" || actionId === "NAV_MAIN") && targetScreen === "MAIN") {
        return true;
      }
      if (actionId === "PAGE_UP" || actionId === "PAGE_DOWN") {
        return true;
      }
    }

    return false;
  };

  const handleFinishExamSession = (timedOutOccurred = false) => {
    if (!examSession) return;
    if (isFocusMode) {
      exitFocusMode();
    }
    const totalExamTime = Math.round((Date.now() - scenarioStartTime) / 1000);
    const finalGraded = gradeExamSession(examSession, caseResults, totalExamTime);
    setIsExamCompleted(true);

    const attemptId = `att-prac-${Date.now()}`;
    recordScenarioAttempt({
      id: attemptId,
      scenarioId: "exam-practical",
      scenarioTitle: "Practical Hands-On Exam (Full Shift Operations)",
      timestamp: new Date().toISOString(),
      score: timedOutOccurred ? 0 : finalGraded.totalScore,
      passed: timedOutOccurred ? false : finalGraded.passed,
      stepsCompleted: finalGraded.passedCasesCount,
      totalSteps: finalGraded.casesTotal,
      mistakes: [],
      hintsUsed: 0,
      timeSpentSeconds: totalExamTime,
      caseResults: finalGraded.caseResults.map((c) => ({
        caseId: c.caseId,
        title: c.title,
        caseNumber: c.caseNumber,
        score: c.score,
        passed: c.passed,
        timeSpentSeconds: c.timeSpentSeconds,
        feedback: c.feedback,
      })),
    });

    router.push(`/results/${attemptId}`);
  };

  const handleAdvanceExamCase = (userChange?: number) => {
    if (!examSession) return;
    if (isAdvancingCaseRef.current) return;
    isAdvancingCaseRef.current = true;

    const currentCase = examSession.cases[examCaseIndex];
    if (!currentCase) {
      isAdvancingCaseRef.current = false;
      return;
    }

    const timeSpent = Math.max(1, Math.round((Date.now() - caseStartTime) / 1000));
    const tenderAmountVal = pendingCashTender || totals.totalAmount;
    const remainingDue = Math.max(0, totals.totalAmount - (sulitCoinsRedeemedAmount || 0));
    const computedChange = Math.max(0, tenderAmountVal - remainingDue);
    const snapshot: CaseFinalSnapshot = {
      lineItemsCount: state.lineItems.length,
      totalSales: totals.totalAmount,
      tenderMethod: selectedTenderMethod || "CASH",
      tenderAmount: tenderAmountVal,
      changeGiven: userChange ?? computedChange,
      loyaltyType: loyaltyType,
      voidCount: state.lineItems.filter((i) => i.isVoided).length,
      discountType: state.appliedDiscount?.name,
      isZeroRated: state.isZeroRated,
    };

    const currentActions = [...examActionLogRef.current];
    const graded = gradeCase(currentCase, currentActions, snapshot, userChange, timeSpent);
    const updatedCaseResults = [...caseResults, graded];
    setCaseResults(updatedCaseResults);

    // Reset simulator transaction state for next customer
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
    setPendingCashTender(0);
    setSulitCoinsRedeemedAmount(null);
    setSulitCoinsEarnedAmount(null);
    setSulitCoinsRefNo("");
    setIsChangeCheckModalOpen(false);
    examActionLogRef.current = [];
    setExamActionLog([]);
    setCaseStartTime(Date.now());

    const nextIndex = examCaseIndex + 1;
    if (nextIndex < examSession.cases.length) {
      setExamCaseIndex(nextIndex);
      const nextCase = examSession.cases[nextIndex];
      setCustomerNotice({
        name: nextCase.customerName,
        avatar: nextCase.customerName.charAt(0),
        quote: nextCase.customerQuote,
        caseNumber: nextIndex + 1,
        totalCases: examSession.cases.length,
      });
      setTimeout(() => {
        setCustomerNotice(null);
      }, 5500);
      if (nextCase.id === "case-close-shift") {
        setTerminalMode("ACTIVE_REGISTER");
      }
      setTimeout(() => {
        isAdvancingCaseRef.current = false;
      }, 800);
    } else {
      // Completed all cases
      if (isFocusMode) {
        exitFocusMode();
      }
      const totalExamTime = Math.round((Date.now() - scenarioStartTime) / 1000);
      const finalGraded = gradeExamSession(examSession, updatedCaseResults, totalExamTime);
      setIsExamCompleted(true);
      isAdvancingCaseRef.current = false;

      const attemptId = `att-prac-${Date.now()}`;
      recordScenarioAttempt({
        id: attemptId,
        scenarioId: "exam-practical",
        scenarioTitle: "Practical Hands-On Exam (Full Shift Operations)",
        timestamp: new Date().toISOString(),
        score: finalGraded.totalScore,
        passed: finalGraded.passed,
        stepsCompleted: finalGraded.passedCasesCount,
        totalSteps: finalGraded.casesTotal,
        mistakes: [],
        hintsUsed: 0,
        timeSpentSeconds: totalExamTime,
        caseResults: finalGraded.caseResults.map((c) => ({
          caseId: c.caseId,
          title: c.title,
          caseNumber: c.caseNumber,
          score: c.score,
          passed: c.passed,
          timeSpentSeconds: c.timeSpentSeconds,
          feedback: c.feedback,
        })),
      });

      router.push(`/results/${attemptId}`);
    }
  };

  const handleSyntheticKeyPress = (key: string, altKey = false, ctrlKey = false) => {
    if (key === "Enter") {
      // 1. If yellow barcode input on MAIN page has content, trigger barcode scan directly
      if (state.currentPage === "MAIN" && barcodeInput.trim()) {
        handleBarcodeSubmit({ preventDefault: () => {} } as React.FormEvent);
        return;
      }

      // 2. If a form input is currently focused in the DOM, submit its form
      const activeEl = document.activeElement as HTMLElement | null;
      if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "SELECT")) {
        const form = (activeEl as HTMLInputElement).form;
        if (form) {
          if (typeof form.requestSubmit === "function") {
            form.requestSubmit();
          } else {
            form.submit();
          }
          return;
        }
      }
    }

    const evt = new KeyboardEvent("keydown", {
      key,
      altKey,
      ctrlKey,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(evt);
  };

  const validateScenarioStep = (actionId: string, dataVal?: string | number): boolean => {
    if (isExamMode) {
      const entry = { action: actionId, data: dataVal, timestamp: Date.now() };
      examActionLogRef.current.push(entry);
      setExamActionLog((prev) => [...prev, entry]);
      return true;
    }
    if (!activeScenario || isExamCompleted) return true;
    const currentStep = activeScenario.steps[currentStepIndex];
    if (!currentStep) return true;

    // Auto-advance if trainee tenders cash while at PAY_CASH step
    if (
      currentStep.expectedAction === "PAY_CASH" &&
      (actionId === "CONFIRM_TENDER" || actionId === "SUBMIT_CASH_TENDER")
    ) {
      setErrorNotice(null);
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
          return true;
        }
      }
      setCurrentStepIndex(nextIndex);
      return true;
    }

    // Auto-advance if trainee tenders while at CHOOSE_LNQR_OPTION
    if (
      currentStep.expectedAction === "CHOOSE_LNQR_OPTION" &&
      (actionId === "PAY_CASH" || actionId === "PAY_CARD")
    ) {
      setErrorNotice(null);
      setActiveHint(null);
      setCurrentStepIndex(currentStepIndex + 1);
      return true;
    }

    if (isStepMatch(actionId, dataVal)) {
      setErrorNotice(null);
      setActiveHint(null);
      let nextIndex = currentStepIndex + 1;
      if (
        nextIndex < activeScenario.steps.length &&
        (activeScenario.steps[nextIndex].expectedAction === "PAGE_DOWN" || activeScenario.steps[nextIndex].expectedAction === "NAV_MAIN") &&
        state.currentPage === "MAIN"
      ) {
        nextIndex++;
      }
      setCurrentStepIndex(nextIndex);
      if (nextIndex >= activeScenario.steps.length) {
        setIsExamCompleted(true);
      } else {
        const nextExpected = activeScenario.steps[nextIndex]?.expectedAction;
        const isFinishingPayment =
          currentStep.expectedAction === "CONFIRM_TENDER" ||
          currentStep.expectedAction === "CONFIRM_GC_TENDER" ||
          currentStep.expectedAction === "CONFIRM_LNQR_UPDATED";
        if (
          isFinishingPayment &&
          nextExpected &&
          nextExpected !== "CONFIRM_LNQR_UPDATED" &&
          nextExpected !== "CONFIRM_TENDER"
        ) {
          if (tenderTimerRef.current) {
            clearTimeout(tenderTimerRef.current);
            tenderTimerRef.current = null;
          }
          handleCloseCompletedReceipt();
        }
      }
      return true;
    }

    // Strict navigation validation per target screen

    // If choosing loyalty option (1. None or 2. LNC) in non-loyalty scenario, do not record mistake:
    if (actionId === "CHOOSE_LNQR_OPTION" && currentStep.expectedAction !== "CHOOSE_LNQR_OPTION") {
      return true;
    }

    // If trainee presses F2 (PAY_CASH) while at CONFIRM_TENDER step, do not record mistake:
    if (currentStep.expectedAction === "CONFIRM_TENDER" && actionId === "PAY_CASH") {
      return true;
    }

    // If trainee switches lookup search mode (F2/F3/F4) while at LOOKUP_QUERY step, allow without mistake:
    if (currentStep.expectedAction === "LOOKUP_QUERY" && actionId === "LOOKUP_SEARCH") {
      return true;
    }

    // If trainee toggles Bonus Buy checkbox while at CONFIRM_BEST_BUY step, allow without mistake:
    if (currentStep.expectedAction === "CONFIRM_BEST_BUY" && actionId === "CHECK_BONUS_BUY") {
      return true;
    }

    // In Lookup, if step expects LOOKUP_QUERY and trainee selects/double-clicks an item directly:
    if ((currentStep.expectedAction === "LOOKUP_SEARCH" || currentStep.expectedAction === "LOOKUP_QUERY") && actionId === "ADD_ITEM") {
      setErrorNotice(null);
      setActiveHint(null);
      const nextStep = activeScenario.steps[currentStepIndex + 1];
      const nextIndex = nextStep?.expectedAction === "CLOSE_LOOKUP" ? currentStepIndex + 2 : currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      if (nextIndex >= activeScenario.steps.length) {
        setIsExamCompleted(true);
      }
      return true;
    }

    triggerErrorEffect(currentStep.errorFeedback || "Incorrect action. Please check instructions.");
    setMistakes((prev) => [
      ...prev,
      {
        step: currentStepIndex + 1,
        actionAttempted: actionId + (dataVal ? " (" + dataVal + ")" : ""),
        expected: currentStep.expectedAction,
        feedback: currentStep.errorFeedback,
      },
    ]);
    return false;
  };

  const handleAction = (actionId: string) => {
    // In guided scenario, validate action before execution
    if (activeScenario && !isExamCompleted && !isExamMode) {
      const currentStep = activeScenario.steps[currentStepIndex];
      if (actionId === "HELP") {
        handleShowHint();
        return;
      }
      if (isVoidSkuMode && (actionId === "PAGE_DOWN" || actionId === "PAGE_UP")) {
        // Allowed for navigating items
      } else if (!isActionAllowedInScenario(actionId)) {
        const feedbackMsg =
          state.currentPage === "FOURTH" && (actionId === "CUSTOMER" || actionId === "NAV_FOURTH")
            ? "On the 4th Screen, F5 is Customer. Press F12 (PAGE DOWN) to return to the Main Screen."
            : (currentStep?.errorFeedback || "Incorrect action for the current step.");
        triggerErrorEffect(feedbackMsg);
        setMistakes((prev) => [
          ...prev,
          {
            step: currentStepIndex + 1,
            actionAttempted: actionId,
            expected: currentStep?.expectedAction || "",
            feedback: feedbackMsg,
          },
        ]);
        return; // Block execution and prevent page transition!
      }
    }

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
      case "PAGE_DOWN": {
        if (isVoidSkuMode) {
          const activeItems = state.lineItems.filter((item) => !item.isVoided);
          if (activeItems.length > 0) {
            const currentArrayIndex = activeItems.findIndex(
              (item) => item.id === selectedVoidItemId
            );
            const currentVisualIdx =
              currentArrayIndex < 0 ? 0 : activeItems.length - 1 - currentArrayIndex;
            const nextVisualIdx = Math.min(activeItems.length - 1, currentVisualIdx + 1);
            setSelectedVoidItemId(activeItems[activeItems.length - 1 - nextVisualIdx].id);
            return;
          }
        }
        const pageCycle: Record<string, string> = {
          MAIN: "SECOND",
          SECOND: "THIRD",
          THIRD: "FOURTH",
          FOURTH: "MAIN",
        };
        const next = pageCycle[state.currentPage];
        if (next) {
          dispatch({ type: "NAVIGATE_PAGE", page: next as any });
          validateScenarioStep(`NAV_${next}`);
        }
        break;
      }
      case "PAGE_UP": {
        if (isVoidSkuMode) {
          const activeItems = state.lineItems.filter((item) => !item.isVoided);
          if (activeItems.length > 0) {
            const currentArrayIndex = activeItems.findIndex(
              (item) => item.id === selectedVoidItemId
            );
            const currentVisualIdx =
              currentArrayIndex < 0 ? 0 : activeItems.length - 1 - currentArrayIndex;
            const nextVisualIdx = Math.max(0, currentVisualIdx - 1);
            setSelectedVoidItemId(activeItems[activeItems.length - 1 - nextVisualIdx].id);
            return;
          }
        }
        const pageCycleRev: Record<string, string> = {
          MAIN: "FOURTH",
          FOURTH: "THIRD",
          THIRD: "SECOND",
          SECOND: "MAIN",
        };
        const prev = pageCycleRev[state.currentPage];
        if (prev) {
          dispatch({ type: "NAVIGATE_PAGE", page: prev as any });
          validateScenarioStep(`NAV_${prev}`);
        }
        break;
      }
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
        if (state.lineItems.length === 0) return;
        dispatch({ type: "REQUEST_MANAGER_OVERRIDE", targetAction: "Item Void" });
        validateScenarioStep("ITEM_VOID");
        break;
      case "TRX_VOID":
        if (state.lineItems.length === 0) return;
        dispatch({ type: "REQUEST_MANAGER_OVERRIDE", targetAction: "Trx Void" });
        validateScenarioStep("TRX_VOID");
        break;
      case "TRX_DISC":
        setIsTrxDiscOpen(true);
        validateScenarioStep("TRX_DISC");
        break;
      case "SUSPEND":
        if (state.lineItems.length === 0) return;
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
      case "NO_SALE":
        dispatch({ type: "REQUEST_MANAGER_OVERRIDE", targetAction: "No Sale" });
        validateScenarioStep("NO_SALE");
        break;
      case "ON_OFF_DISCOUNT":
        validateScenarioStep("ON_OFF_DISCOUNT");
        break;
      case "ITEM_DISC":
      case "CASH_COUNT":
      case "CUSTOMER":
      case "REPORT_WIZARD":
      case "STORE_OPENING":
      case "RESERVED_TRX":
      case "HELP":
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
        setIsLogoutScreenOpen(true);
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
      if (!pendingReturn) {
        console.error("Refund UPC entry requires pending return details.");
        setIsRefundSkuMode(false);
        setBarcodeInput("");
        return;
      }

      dispatch({
        type: "PROCESS_RETURN_ITEM",
        sku: code,
        reason: pendingReturn.reason,
        siNumber: pendingReturn.siNumber,
      });
      setIsRefundSkuMode(false);
      setPendingReturn(null);
      validateScenarioStep("SCAN_REFUND_SKU", code);
      validateScenarioStep("ADD_ITEM", code);
      setBarcodeInput("");
      return;
    }

    if (activeScenario && !isExamCompleted) {
      const currentStep = activeScenario.steps[currentStepIndex];
      if (!isActionAllowedInScenario("ADD_ITEM", code)) {
        triggerErrorEffect(currentStep?.errorFeedback || `Expected ${currentStep?.expectedData || "different item"}, but entered '${code}'.`);
        setMistakes((prev) => [
          ...prev,
          {
            step: currentStepIndex + 1,
            actionAttempted: `ADD_ITEM (${code})`,
            expected: `ADD_ITEM (${currentStep?.expectedData || ""})`,
            feedback: currentStep?.errorFeedback || "Incorrect item barcode entered.",
          },
        ]);
        setBarcodeInput("");
        return;
      }
    }

    dispatch({ type: "ADD_ITEM_BY_CODE", code });
    validateScenarioStep("ADD_ITEM", code);
    setBarcodeInput("");
  };

  const handleConfirmQuantity = (qtyVal?: number) => {
    const qty = qtyVal !== undefined ? qtyVal : parseInt(qtyInput, 10) || 1;
    if (activeScenario && !isExamCompleted) {
      const currentStep = activeScenario.steps[currentStepIndex];
      if (!isActionAllowedInScenario("CONFIRM_QTY", qty)) {
        triggerErrorEffect(currentStep?.errorFeedback || `Expected quantity ${currentStep?.expectedData}, but entered ${qty}.`);
        setMistakes((prev) => [
          ...prev,
          {
            step: currentStepIndex + 1,
            actionAttempted: `CONFIRM_QTY (${qty})`,
            expected: `CONFIRM_QTY (${currentStep?.expectedData || ""})`,
            feedback: currentStep?.errorFeedback || "Incorrect quantity entered.",
          },
        ]);
        return;
      }
    }
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
    if (isExamMode) {
      logExamAction("CONFIRM_TENDER", tenderName);
      setTimeout(() => {
        handleAdvanceExamCase(0);
      }, 1000);
    }
  };

  const handleConfirmTender = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(cashTenderInput) || 0;
    dispatch({ type: "TENDER_PAYMENT", amount });
    validateScenarioStep("CONFIRM_TENDER", amount);
    if (isExamMode) {
      setPendingCashTender(amount);
      setTimeout(() => {
        setIsFinalTenderStep(true);
        setTimeout(() => {
          setIsChangeCheckModalOpen(true);
        }, 800);
      }, 1800);
    }
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
    } else if (target === "Trx Void") {
      setIsTrxVoidModalOpen(true);
    } else if (target === "Recall") {
      setIsRecallOpen(true);
    } else if (target === "Reprint") {
      setIsReprintOpen(true);
    } else if (target === "Zero Rated") {
      dispatch({ type: "SET_ZERO_RATED", isZeroRated: !state.isZeroRated });
      dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
    } else if (target === "No Sale") {
      dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
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
    setTimedOut(false);
    hasRecordedAttemptRef.current = false;
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
    if (isExamMode) {
      setExamCaseIndex(0);
      setExamActionLog([]);
      setCaseResults([]);
      setCaseStartTime(Date.now());
      setTerminalMode("START_OF_DAY_VERIFY");
    } else {
      setTerminalMode(getInitialTerminalMode(activeScenario));
    }
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
    setTimedOut(false);
    setScenarioStartTime(Date.now());
    hasRecordedAttemptRef.current = false;
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
  const horizKeys = HORIZONTAL_FUNCTION_KEYS[state.currentPage] || [];


  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-900 font-sans select-none">
      {/* Top Trainer Navigation Bar */}
      <header className="relative z-50 bg-black text-white px-2 sm:px-3 py-1 flex items-center justify-between text-xs font-mono border-b border-gray-800 shrink-0">
        <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
          {returnLessonUrl !== "/dashboard" ? (
            <Link href={returnLessonUrl} className="flex items-center space-x-1 text-gray-400 hover:text-white shrink-0 text-[11px]">
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">{returnButtonLabel}</span>
              <span className="xs:hidden">Back</span>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center space-x-1 text-gray-400 hover:text-white shrink-0 text-[11px]">
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">Dashboard</span>
            </Link>
          )}
          <span className="text-gray-600 shrink-0">|</span>
          <span className="font-bold text-red-500 uppercase hidden lg:inline truncate text-[11px]">
            NBS Cashier POS Screen Fidelity Simulator
          </span>
          <span className="font-bold text-red-500 uppercase hidden sm:inline lg:hidden truncate text-[11px]">
            NBS POS Simulator
          </span>
          <span className="font-bold text-red-500 uppercase sm:hidden truncate text-[11px]">
            NBS POS
          </span>
        </div>
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <button
            type="button"
            onClick={toggleFocusMode}
            className="bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white border border-emerald-500 px-2 py-0.5 sm:px-2.5 sm:py-0.5 text-[10px] sm:text-[11px] font-mono font-bold flex items-center space-x-1 cursor-pointer rounded shadow-xs shrink-0"
          >
            {isFocusMode ? (
              <>
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 shrink-0" />
                <span>Exit Focus</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 shrink-0" />
                <span>Focus Mode</span>
              </>
            )}
          </button>
          {!isExamMode && (
            <div className="flex items-center space-x-1 hidden sm:flex">
              <span className="text-gray-400 text-[10px] hidden md:inline">POS Screen:</span>
              <select
                value={terminalMode}
                onChange={(e) => setTerminalMode(e.target.value as POSTerminalMode)}
                className="bg-gray-800 text-yellow-300 border border-gray-600 text-[11px] px-1.5 py-0.5 font-mono focus:outline-none rounded max-w-[150px] sm:max-w-none"
              >
                <option value="START_OF_DAY_VERIFY">1. Start of Day (Date/Time)</option>
                <option value="START_OF_DAY_INCORRECT">1b. Start of Day (Incorrect Date)</option>
                <option value="START_OF_DAY_CLOSE">2. Start of Day (Close Setup)</option>
                <option value="POS_RELOADER">3. POS Reloader Screen</option>
                <option value="USER_LOGIN">4. User Login</option>
                <option value="ACTIVE_REGISTER">5. Active Sales Register</option>
              </select>
            </div>
          )}
        </div>
      </header>

      {/* Portrait Mode Quick Landscape / Focus Tip Strip */}
      {isPortrait && !isFocusMode && (
        <div className="w-full bg-[#005A36] text-white px-3 py-1 flex items-center justify-between text-[11px] font-medium border-b border-[#004D26] shadow-inner sm:hidden">
          <div className="flex items-center space-x-1.5 truncate">
            <Smartphone className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
            <span className="truncate">Tip: Rotate to Landscape or tap Focus for full-screen view.</span>
          </div>
          <button
            type="button"
            onClick={toggleFocusMode}
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wider shrink-0 ml-2 shadow-xs cursor-pointer active:scale-95 flex items-center space-x-1"
          >
            <Maximize2 className="w-3 h-3 shrink-0" />
            <span>Focus POS</span>
          </button>
        </div>
      )}

      {/* New Customer Arrival Notification Toast (POS Green & Silver Theme) */}
      {customerNotice && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#D4D0C8] text-gray-900 border-4 border-[#006633] px-3.5 py-2.5 rounded shadow-2xl flex items-center space-x-3 max-w-lg w-[92%] sm:w-auto animate-in slide-in-from-top-4 fade-in duration-300 border-t-white border-l-white border-r-[#404040] border-b-[#404040]">
          <div className="w-9 h-9 rounded-full bg-[#006633] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-inner border border-emerald-400">
            <User className="w-5 h-5 text-white shrink-0" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold bg-[#006633] text-white border border-[#004D26] px-1.5 py-0.2 rounded uppercase">
                Next Customer ({customerNotice.caseNumber}/{customerNotice.totalCases})
              </span>
            </div>
            <div className="font-extrabold text-sm text-gray-900 truncate mt-0.5">
              {customerNotice.name}
            </div>
            <p className="text-xs text-gray-700 italic truncate">
              &ldquo;{customerNotice.quote}&rdquo;
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCustomerNotice(null)}
            className="bg-[#D4D0C8] hover:bg-[#ECE9D8] text-gray-700 hover:text-gray-900 border border-gray-400 p-1 text-xs font-bold rounded cursor-pointer shrink-0"
            title="Dismiss Notice"
          >
            <X className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      )}

      {/* Guided Instruction Bar OR Customer Interaction Panel (when not in Focus Mode) */}
      {!isFocusMode && (
        isExamMode && examSession ? (
          <CustomerPanel
            currentCase={examSession.cases[examCaseIndex]}
            caseIndex={examCaseIndex}
            totalCases={examSession.cases.length}
            remainingSeconds={remainingSeconds}
            hasSuspendedTrx={state.suspendedTransactions.length > 0}
          />
        ) : (
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
            remainingSeconds={remainingSeconds}
          />
        )
      )}

      {/* POS Terminal Wrapper (Forced Landscape in Focus Mode) */}
      <div
        className={`${
          isFocusMode
            ? isPortrait && forceRotatePortrait
              ? "fixed z-50 bg-black flex flex-col justify-start p-0 overflow-hidden"
              : "fixed inset-0 z-50 bg-black flex flex-col justify-start p-0 overflow-hidden"
            : "flex-1 p-2 sm:p-4 flex flex-col items-center justify-center relative overflow-y-auto overflow-x-hidden min-h-0"
        }`}
        style={
          isFocusMode && isPortrait && forceRotatePortrait
            ? {
                width: "100vh",
                height: "100vw",
                position: "fixed",
                top: 0,
                left: "100%",
                transform: "rotate(90deg)",
                transformOrigin: "top left",
              }
            : undefined
        }
      >
        {isFocusMode && (
          <div className="w-full bg-gray-900 border-b border-gray-800 px-3 py-1 flex items-center justify-between text-xs text-white z-20 shrink-0">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="font-bold text-red-500 uppercase tracking-wider text-[11px] shrink-0">
                NBS POS FOCUS MODE
              </span>
              {!isFocusHeaderExpanded && (
                <button
                  type="button"
                  onClick={() => setIsFocusHeaderExpanded(true)}
                  className="hidden xs:flex items-center space-x-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] px-2 py-0.5 rounded cursor-pointer truncate border border-gray-700 text-left"
                  title="Click to view full instructions"
                >
                  <span className="truncate max-w-[160px] sm:max-w-xs text-emerald-400 font-medium">
                    {isExamMode && examSession
                      ? `Customer #${examCaseIndex + 1}/${examSession.cases.length}: ${examSession.cases[examCaseIndex]?.customerName || "Customer"}`
                      : activeScenario
                      ? `${activeScenario.title} (Step ${currentStepIndex + 1}/${activeScenario.steps.length})`
                      : "Free Exploration Sandbox"}
                  </span>
                  <span className="text-gray-400 text-[9px] shrink-0 font-mono">(Hidden)</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              {/* Manual Zoom Controls in Focus Mode */}
              <div className="flex items-center bg-gray-800 rounded px-1.5 py-0.5 border border-gray-700">
                <button
                  type="button"
                  onClick={() => setUserZoomLevel((prev) => Math.max(0.7, Number((prev - 0.15).toFixed(2))))}
                  className="w-5 h-5 flex items-center justify-center text-[12px] font-mono hover:bg-gray-700 text-gray-200 rounded cursor-pointer"
                  title="Zoom Out"
                >
                  -
                </button>
                <span className="text-[10px] font-mono font-bold text-gray-300 min-w-[34px] text-center select-none">
                  {Math.round(userZoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setUserZoomLevel((prev) => Math.min(2.0, Number((prev + 0.15).toFixed(2))))}
                  className="w-5 h-5 flex items-center justify-center text-[12px] font-mono hover:bg-gray-700 text-gray-200 rounded cursor-pointer"
                  title="Zoom In"
                >
                  +
                </button>
                {userZoomLevel !== 1 && (
                  <button
                    type="button"
                    onClick={() => setUserZoomLevel(1)}
                    className="text-[9px] text-yellow-400 hover:text-yellow-300 ml-1 underline cursor-pointer"
                    title="Reset Zoom"
                  >
                    100%
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsFocusHeaderExpanded((prev) => !prev)}
                title={isFocusHeaderExpanded ? "Hide instructions to enlarge terminal" : "Show customer instructions"}
                className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold border transition-colors cursor-pointer shrink-0 ${
                  isFocusHeaderExpanded
                    ? "bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700 hover:text-white"
                    : "bg-[#006633] text-white border-green-600 hover:bg-[#005229] shadow-sm"
                }`}
              >
                {isFocusHeaderExpanded ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">Hide Guide</span>
                    <span className="sm:hidden">Hide</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">Show Guide</span>
                    <span className="sm:hidden">Guide</span>
                  </>
                )}
              </button>

              {isPortrait && (
                <button
                  type="button"
                  onClick={() => setForceRotatePortrait((prev) => !prev)}
                  title="Toggle Forced Landscape"
                  className="bg-gray-800 hover:bg-gray-700 text-yellow-300 px-2 py-0.5 rounded text-[10px] font-mono border border-gray-700 cursor-pointer flex items-center space-x-1"
                >
                  <RotateCw className="w-3 h-3 shrink-0" />
                  <span className="hidden sm:inline">{forceRotatePortrait ? "Reset Rotation" : "Force Landscape"}</span>
                  <span className="sm:hidden">{forceRotatePortrait ? "Reset" : "Rotate"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => exitFocusMode()}
                className="bg-red-700 hover:bg-red-600 text-white font-bold px-2.5 py-0.5 rounded text-[11px] cursor-pointer"
              >
                Exit [Esc]
              </button>
            </div>
          </div>
        )}

        {/* In Focus Mode: Guided Instruction Bar OR Customer Interaction Panel */}
        {isFocusMode && isFocusHeaderExpanded && (
          <div className="w-full shrink-0 z-20 overflow-y-auto max-h-36 sm:max-h-48 border-b border-gray-700 bg-gray-900 shadow-md">
            {isExamMode && examSession ? (
              <CustomerPanel
                currentCase={examSession.cases[examCaseIndex]}
                caseIndex={examCaseIndex}
                totalCases={examSession.cases.length}
                remainingSeconds={remainingSeconds}
                hasSuspendedTrx={state.suspendedTransactions.length > 0}
              />
            ) : (
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
                remainingSeconds={remainingSeconds}
              />
            )}
          </div>
        )}

        <div
          className={`flex-1 flex flex-col items-center justify-center min-h-0 w-full transition-all duration-200 ${
            isFocusMode
              ? userZoomLevel > 1 || isInputFocused
                ? "overflow-auto touch-pan-x touch-pan-y py-1 px-1"
                : "overflow-hidden py-0 px-1"
              : "overflow-hidden p-2"
          }`}
        >
          {(() => {
            const currentZoom = isInputFocused ? Math.max(userZoomLevel, 1.2) : userZoomLevel;
            const finalScale = terminalScale * currentZoom;
            return (
              <div
                style={{
                  width: `${Math.round((isExternalReceiptShowing ? 1360 : 1080) * finalScale)}px`,
                  height: `${Math.round(600 * finalScale)}px`,
                  position: "relative",
                }}
                className="shrink-0 flex items-start justify-start"
              >
                <div
                  style={{
                    width: isExternalReceiptShowing ? "1360px" : "1080px",
                    height: "600px",
                    transform: finalScale < 1 || currentZoom > 1 ? `scale(${finalScale})` : undefined,
                    transformOrigin: isInputFocused ? "top center" : "top left",
                  }}
                  className="flex items-center justify-center gap-4 shrink-0 transition-transform duration-200 ease-out"
                >
              <div
                ref={posContainerRef}
                className={`w-[1080px] h-[600px] bg-[#D4D0C8] border-4 border-[#7A8A99] shadow-2xl flex flex-col font-sans overflow-hidden flex-shrink-0 relative ${
                  isTerminalShaking ? "pos-shake-error ring-4 ring-red-600" : ""
                }`}
              >
          {/* In-Terminal Mistake Notice */}
          {errorNotice && (
            <div
              role="alert"
              className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-[#E4002B] text-white px-5 py-2 text-xs font-bold font-sans shadow-2xl border-2 border-white flex items-center space-x-2.5 animate-in fade-in slide-in-from-top-2 tracking-wide max-w-xl text-center"
            >
              <AlertTriangle className="w-4 h-4 text-white shrink-0" />
              <span>{errorNotice}</span>
              <button
                type="button"
                onClick={() => setErrorNotice(null)}
                className="text-white hover:text-yellow-300 font-extrabold ml-2 p-0.5 cursor-pointer shrink-0"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          )}
          {showItemNotFound && (
            <div
              role="alert"
              className="pointer-events-none absolute left-3 top-3 z-30 border-2 border-gray-800 bg-white px-4 py-3 font-bold text-black shadow-lg"
            >
              Item not found
            </div>
          )}



          {/* Start of Day Verify */}
          {terminalMode === "START_OF_DAY_VERIFY" && (
            <StartOfDayVerifyScreen
              now={now}
              selectedButton={selectedSodButton}
              onVerifyYes={handleVerifyDateYes}
              onVerifyNo={handleVerifyDateNo}
            />
          )}

          {/* Start of Day Incorrect */}
          {terminalMode === "START_OF_DAY_INCORRECT" && (
            <StartOfDayIncorrectScreen
              onBackToVerify={() => {
                setSelectedSodButton(null);
                setTerminalMode("START_OF_DAY_VERIFY");
                validateScenarioStep("BACK_TO_SOD_VERIFY");
              }}
            />
          )}

          {/* Start of Day Close */}
          {terminalMode === "START_OF_DAY_CLOSE" && (
            <StartOfDayCloseScreen onCloseWindow={handleCloseSodWindow} />
          )}

          {/* POS Reloader */}
          {terminalMode === "POS_RELOADER" && (
            <PosReloaderScreen onReloadToLogin={handleReloadToLogin} />
          )}

          {/* User Login */}
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

          {/* Active Register */}
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
                    const currentStep = activeScenario?.steps[currentStepIndex];
                    if (
                      currentStep &&
                      (currentStep.expectedAction === "LOOKUP_QUERY" || currentStep.expectedAction === "LOOKUP_SEARCH") &&
                      activeScenario?.steps[currentStepIndex + 1]?.expectedAction === "CLOSE_LOOKUP"
                    ) {
                      validateScenarioStep("LOOKUP_QUERY", sku);
                      return;
                    }
                    setBarcodeInput(sku);
                    dispatch({ type: "ADD_ITEM_BY_CODE", code: sku });
                    validateScenarioStep("ADD_ITEM", sku);
                    dispatch({ type: "CLOSE_LOOKUP" });
                    setBarcodeInput("");
                  }}
                  onSearchModeChange={(mode) => {
                    validateScenarioStep("LOOKUP_SEARCH", mode);
                  }}
                  onSearchSubmit={(query) => {
                    validateScenarioStep("LOOKUP_QUERY", query);
                  }}
                  initialSearch={state.lookupSearchTerm}
                />
              ) : returnRefundMode !== null ? (
                <ReturnRefundScreen
                  mode={returnRefundMode}
                  clerkName={state.cashierName}
                  terminalId={state.terminalId}
                  branchCode={state.branchCode}
                  trxNumber={state.transactionNumber}
                  totalQty={totals.totalQty}
                  totalSales={totals.totalAmount}
                  onConfirmReturn={(data) => {
                    setPendingReturn({ reason: data.reason, siNumber: data.orNumber });
                    setBarcodeInput("");
                    setIsRefundSkuMode(true);
                    setReturnRefundMode(null);
                    dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
                    validateScenarioStep("CONFIRM_RETURN", data.orNumber);
                  }}
                  onRefundOrnoSubmit={(orNumber: string) => {
                    validateScenarioStep("SUBMIT_REFUND_ORNO", orNumber);
                    validateScenarioStep("REFUND_ORNO", orNumber);
                  }}
                  onConfirmRefund={(data) => {
                    dispatch({
                      type: "PROCESS_REFUND",
                      orNumber: data.orNumber,
                      reason: data.reason,
                    });
                    setReturnRefundMode(null);
                    dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
                    validateScenarioStep("CONFIRM_REFUND", data.amount);
                  }}
                  onCancel={() => setReturnRefundMode(null)}
                />
              ) : state.managerOverrideOpen ? (
                <ManagerOverrideScreen
                  targetAction={state.managerOverrideTarget || "Restricted Operation"}
                  clerkName={state.cashierName}
                  terminalId={state.terminalId}
                  branchCode={state.branchCode}
                  trxNumber={state.transactionNumber}
                  totalQty={totals.totalQty}
                  totalSales={totals.totalAmount}
                  onConfirm={handleConfirmOverride}
                  onCancel={() => dispatch({ type: "CANCEL_MANAGER_OVERRIDE" })}
                />
              ) : isItemVoidModalOpen ? (
                <ItemVoidScreen
                  clerkName={state.cashierName}
                  terminalId={state.terminalId}
                  branchCode={state.branchCode}
                  trxNumber={state.transactionNumber}
                  totalQty={totals.totalQty}
                  totalSales={totals.totalAmount}
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
              ) : isTrxVoidModalOpen ? (
                <TrxVoidScreen
                  clerkName={state.cashierName}
                  terminalId={state.terminalId}
                  branchCode={state.branchCode}
                  trxNumber={state.transactionNumber}
                  totalQty={totals.totalQty}
                  totalSales={totals.totalAmount}
                  onProceed={() => validateScenarioStep("TRX_VOID_CONFIRM")}
                  onConfirm={(reason) => {
                    dispatch({ type: "VOID_TRANSACTION" });
                    setIsTrxVoidModalOpen(false);
                    setHasBonusBuyBeenPrompted(false);
                    validateScenarioStep("CONFIRM_TRX_VOID", reason);
                    if (isExamMode && examSession?.cases[examCaseIndex]?.id === "case-trx-void") {
                      logExamAction("CONFIRM_TRX_VOID", reason);
                      setTimeout(() => {
                        handleAdvanceExamCase();
                      }, 1000);
                    }
                  }}
                  onCancel={() => setIsTrxVoidModalOpen(false)}
                />
              ) : isSuspendModalOpen ? (
                <SuspendScreen
                  clerkName={state.cashierName}
                  terminalId={state.terminalId}
                  branchCode={state.branchCode}
                  trxNumber={state.transactionNumber}
                  totalQty={totals.totalQty}
                  totalSales={totals.totalAmount}
                  onConfirm={() => {
                    dispatch({ type: "SUSPEND_TRANSACTION" });
                    setIsSuspendModalOpen(false);
                    setHasBonusBuyBeenPrompted(false);
                    validateScenarioStep("CONFIRM_SUSPEND");
                  }}
                  onCancel={() => setIsSuspendModalOpen(false)}
                />
              ) : journalModalMode !== null ? (
                <TransactionJournalScreen
                  mode={journalModalMode}
                  state={state}
                  onClose={() => {
                    setJournalModalMode(null);
                    if (activeScenario?.steps[currentStepIndex]?.expectedAction === "CLOSE_JOURNAL") {
                      validateScenarioStep("CLOSE_JOURNAL");
                    }
                  }}
                />
                            ) : isNonMdseOpen ? (
                <NonMerchandiseScreen
                  clerkName={state.cashierName}
                  terminalId={state.terminalId}
                  branchCode={state.branchCode}
                  totalQty={totals.totalQty}
                  totalSales={totals.totalAmount}
                  initialCategory={pendingSodexhoVariance !== null ? "Sodexho Variance (ZSOI)" : undefined}
                  initialAmount={pendingSodexhoVariance !== null ? pendingSodexhoVariance.toFixed(2) : undefined}
                  initialReferenceNo={sodexhoNumber || "PP12345678"}
                  onCancel={() => {
                    setIsNonMdseOpen(false);
                    dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
                  }}
                  onSubmit={(data) => {
                    dispatch({
                      type: "ADD_NON_MDSE_ITEM",
                      description: data.description,
                      amount: data.amount,
                      referenceNo: data.referenceNo,
                      sku: data.sku,
                    });
                    setIsNonMdseOpen(false);
                    setPendingSodexhoVariance(null);
                    setPendingSodexhoNotice(null);
                    dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
                    validateScenarioStep("CONFIRM_NON_MDSE", data.amount);
                  }}
                />
) : isTrxDiscOpen ? (
                <TransactionDiscountScreen
                  clerkName={state.cashierName}
                  terminalId={state.terminalId}
                  branchCode={state.branchCode}
                  onCancel={() => {
                    setIsTrxDiscOpen(false);
                    dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
                  }}
                  onSubmit={(discount) => {
                    dispatch({
                      type: "APPLY_DISCOUNT",
                      discount: {
                        name: discount.description,
                        percent: discount.percent,
                      },
                    });
                    setIsTrxDiscOpen(false);
                    dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
                    validateScenarioStep("APPLY_DISCOUNT", discount.code);
                  }}
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
                    dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
                    validateScenarioStep("CONFIRM_RECALL", id);
                    if (isExamMode && examSession?.cases[examCaseIndex]?.id === "case-suspend-recall") {
                      logExamAction("CONFIRM_RECALL", id);
                      setTimeout(() => {
                        handleAdvanceExamCase();
                      }, 1200);
                    }
                  }}
                  onCancel={() => {
                    setIsRecallOpen(false);
                    dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
                  }}
                />
              ) : isReprintOpen ? (
                <ReprintModal
                  clerkName={state.cashierName}
                  onPrint={(orNo: string) => {
                    setIsReprintOpen(false);
                    setIsReprintReceiptOpen(true);
                    dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
                    validateScenarioStep("CONFIRM_REPRINT", orNo);
                  }}
                  onCancel={() => setIsReprintOpen(false)}
                />
              ) : isSdvOpen ? (
                <SdvModal
                  onClose={() => {
                    setIsSdvOpen(false);
                    if (activeScenario?.steps[currentStepIndex]?.expectedAction === "CLOSE_SDV") {
                      validateScenarioStep("CLOSE_SDV");
                    }
                  }}
                />
              ) : readingsType !== null ? (
                <ReadingsScreen
                  readingType={readingsType}
                  cashierName={state.cashierName}
                  terminalId={state.terminalId}
                  branchCode={state.branchCode}
                  trxNumber={state.transactionNumber}
                  totalQty={totals.totalQty}
                  totalSales={totals.totalAmount}
                  onConfirmZClearing={() => {
                    if (activeScenario?.steps[currentStepIndex]?.expectedAction === "CONFIRM_Z_CLEARING") {
                      validateScenarioStep("CONFIRM_Z_CLEARING");
                    }
                  }}
                  onPrint={() => {
                    const expected = activeScenario?.steps[currentStepIndex]?.expectedAction;
                    if (expected === "PRINT_READING_Y" || expected === "PRINT_READING_Z") {
                      validateScenarioStep(expected);
                    }
                  }}
                  onShowAlert={(msg, title, type) => showPosAlert(msg, title, type)}
                  onClose={() => setReadingsType(null)}
                />
              ) : isBonusBuyOpen ? (
                <BonusBuyScreen
                  transactionTotal={totals.subtotal}
                  clerkName={state.cashierName}
                  terminalId={state.terminalId}
                  branchCode={state.branchCode}
                  trxNumber={state.transactionNumber || "1023202629990004001559"}
                  onCheckPromo={(rowIdx, checked) => {
                    if (checked) {
                      validateScenarioStep("CHECK_BONUS_BUY", rowIdx);
                    }
                  }}
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
                    dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
                    validateScenarioStep("CONFIRM_BEST_BUY");
                  }}
                  onCancel={() => {
                    setIsBonusBuyOpen(false);
                    dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
                    validateScenarioStep("CONFIRM_BEST_BUY");
                  }}
                />
              ) : isLogoutScreenOpen ? (
                <LogoutScreen
                  clerkName={state.cashierName}
                  terminalId={state.terminalId}
                  branchCode={state.branchCode}
                  trxNumber={state.transactionNumber}
                  currentTime={fmtTime(now)}
                  currentDate={fmtDate(now)}
                  selectedButton={selectedLogoutButton}
                  onConfirm={handleConfirmLogout}
                  onCancel={handleCancelLogout}
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
                <div className="flex-1 min-h-0 flex flex-col bg-white font-sans select-none overflow-hidden">
                  {/* LNQR Scan */}
                  {/* TOP HEADER BAR */}
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
                <div className="flex-1 min-h-0 flex flex-col bg-white font-sans select-none overflow-hidden">
                  {/* Laking National Card */}
                  {/* TOP HEADER BAR */}
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
                    dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
                    validateScenarioStep("SAVE_TRX_COMMENT");
                  }}
                  onCancel={() => {
                    setIsTrxCommentOpen(false);
                    dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
                  }}
                />
              ) : (state.currentPage === "PAYMENT" || isLnqrCashPaymentOpen) ? (
                <div className="flex-1 min-h-0 flex flex-col bg-white font-sans select-none overflow-hidden">
                  {/* Payment */}
                  {/* TOP HEADER BAR */}
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
                        const tenderVal = parseFloat(lnqrCashTenderInput) ? parseFloat(lnqrCashTenderInput) : (isLnqrTenderProcessed ? 3000 : 0);
                        const totalTenderVal = tenderVal + (sulitCoinsRedeemedAmount || 0);
                        const changeVal = Math.max(0, totalTenderVal - totalSales);

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
                                <span>Term. No.: 0003</span>
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
                                        {displayTotal < 0 ? "-" : ""}{Math.abs(displayTotal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {isVoid ? "-V" : item.sku === "ZSOI" || item.description.includes("SODEXHO") ? "NV" : item.total > 0 ? "V" : ""}
                                      </span>
                                    </div>
                                    <div className="pl-6 text-[9px] text-gray-800">{item.description}</div>
                                  </div>
                                );
                              })
                            ) : (
                              <>
                                <div className="leading-tight mb-1">
                                  <div className="flex justify-between">
                                    <span>1&nbsp; &nbsp;505 @ 2,990.00</span>
                                    <span>2,990.00 V</span>
                                  </div>
                                  <div className="pl-6 text-[9px] text-gray-800">PHO PRKR RBALL POINT</div>
                                </div>
                                <div className="leading-tight mb-1">
                                  <div className="flex justify-between">
                                    <span>1&nbsp; &nbsp;34 @ 9.00</span>
                                    <span>9.00 V</span>
                                  </div>
                                  <div className="pl-6 text-[9px] text-gray-800">PHO PICKS XPM-3G POI</div>
                                </div>
                              </>
                            )}

                            <div className="border-t border-dashed border-gray-400 my-1" />

                            <div className="space-y-0.5">
                              <div className="flex justify-between font-bold">
                                <span>No. of Items</span>
                                <span>{totals.totalQty || (state.lineItems.length > 0 ? state.lineItems.length : 2)}</span>
                              </div>
                              <div className="flex justify-between font-bold">
                                <span>Amount Due</span>
                                <span>{totalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                              {sulitCoinsRedeemedAmount !== null ? (
                                <>
                                  <div className="flex justify-between font-bold text-red-600">
                                    <span>Change -&gt;</span>
                                    <span>{changeVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                  <div className="flex justify-between font-bold">
                                    <span>Cash</span>
                                    <span>{tenderVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                  <div className="pt-0.5 font-mono text-[9px] leading-tight space-y-0.5">
                                    <div className="flex justify-between font-bold text-[10px]">
                                      <span>LNQR Sulit Coins</span>
                                      <span>{sulitCoinsRedeemedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Reference No.</span>
                                      <span>:{sulitCoinsRefNo || customerQrInput || "20260511LN000006"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Amount</span>
                                      <span>:{sulitCoinsRedeemedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="text-center tracking-tighter pt-1 font-bold text-[9px]">
                                      ************** LNQR Information **************
                                    </div>
                                    <div className="flex justify-between">
                                      <span>LNQR No.</span>
                                      <span>:{sulitCoinsRefNo || customerQrInput || "20260511LN000006"}</span>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                selectedTenderMethod === "CASH" && isLnqrTenderProcessed && (
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
                                )
                              )}
                              {selectedTenderMethod === "BANK_CARD" && (
                                <div className="flex justify-between font-bold text-gray-800">
                                  <span>Change -&gt;</span>
                                  <span>0.00</span>
                                </div>
                              )}
                              {selectedTenderMethod === "BANK_CARD" && bankCardStep === "FINAL_TEAROFF" && (
                                selectedBankCardType === "SODEXHO" ? (
                                  <div className="pt-1 text-[10px] font-mono leading-tight">
                                    {(() => {
                                      const sodexhoVar = state.lineItems.find(
                                        (it) => !it.isVoided && (it.sku === "ZSOI" || it.description.toUpperCase().includes("SODEXHO"))
                                      );
                                      const varAmt = sodexhoVar ? sodexhoVar.total : 0;
                                      const merchAmt = Math.max(0, totalSales - varAmt);
                                      return (
                                        <div className="space-y-0.5 pt-0.5 font-bold">
                                          <div className="flex justify-between">
                                            <span>Sodexho</span>
                                            <span>{merchAmt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                          </div>
                                          {varAmt > 0 && (
                                            <div className="flex justify-between">
                                              <span>Sodexho Other Income</span>
                                              <span>{varAmt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                ) : isEwalletCardType(selectedBankCardType) ? (
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
                            {(() => {
                              const nonVatableItems = state.lineItems
                                .filter((it) => !it.isVoided && (it.sku === "ZSOI" || it.description.toUpperCase().includes("SODEXHO") || it.description.toUpperCase().includes("NON-MDSE")))
                                .reduce((acc, it) => acc + it.total, 0);
                              const actualVatableSales = state.isZeroRated ? 0 : Math.max(0, totalSales - nonVatableItems);
                              const actualVatable = state.isZeroRated ? 0 : actualVatableSales / 1.12;
                              const actualVatAmount = state.isZeroRated ? 0 : actualVatableSales - actualVatable;
                              return (
                                <div className="pt-2 space-y-0.5">
                                  <div className="text-center font-bold pb-1">Tax Info</div>
                                  <div className="flex justify-between">
                                    <span>Non-Vatable</span>
                                    <span>{nonVatableItems.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Vatable</span>
                                    <span>{actualVatable.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>VAT Zero-Rated Sale</span>
                                    <span>{(state.isZeroRated ? totalSales : 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>VAT Exempt Sale</span>
                                    <span>0.00</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>VAT(12%)</span>
                                    <span>{actualVatAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                  <div className="flex justify-between font-bold border-t border-gray-300 pt-0.5">
                                    <span>Total Sales</span>
                                    <span>{totalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                </div>
                              );
                            })()}

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

                    {/* Center Panel */}
                    <div className="col-span-5 flex flex-col border-r-2 border-gray-400 bg-[#BDC3C7] min-h-0 overflow-hidden">
                      {isFinalTenderStep || isConnectingLnqrServer || (isLnqrUpdatedModalOpen && sulitCoinsRedeemedAmount !== null) ? (
                        <>
                          {/* 4-Row Green Box */}
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
                                {(selectedTenderMethod === "BANK_CARD"
                                  ? (totals.totalAmount || 0)
                                  : (parseFloat(lnqrCashTenderInput) || (isLnqrTenderProcessed ? 3000 : 0)) + (sulitCoinsRedeemedAmount || 0)
                                ).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>

                            {/* Change */}
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-base tracking-wide">Change</span>
                              <span className="bg-white text-black font-sans font-bold text-xl px-4 py-1 border border-gray-300 min-w-[170px] text-right shadow-inner">
                                {(selectedTenderMethod === "BANK_CARD"
                                  ? 0
                                  : Math.max(0, ((parseFloat(lnqrCashTenderInput) || (isLnqrTenderProcessed ? 3000 : 0)) + (sulitCoinsRedeemedAmount || 0)) - totals.totalAmount)
                                ).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          <div className="h-5 bg-[#67B8DE] border-b border-gray-400 flex-shrink-0" />

                          {/* Message Body */}
                          <div className="flex-1 bg-[#BDC3C7] p-4 flex flex-col items-center justify-center space-y-3 min-h-0 select-none">
                            {isConnectingLnqrServer || (isLnqrUpdatedModalOpen && sulitCoinsRedeemedAmount !== null) ? (
                              <div className="text-gray-900 font-bold text-sm tracking-wide text-center">
                                Please wait connecting LNQR Server......
                              </div>
                            ) : selectedTenderMethod === "BANK_CARD" ? (
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
                                  const tenderVal = parseFloat(lnqrCashTenderInput) || (isLnqrTenderProcessed ? 3000 : 0);
                                  const totalTender = tenderVal + (sulitCoinsRedeemedAmount || 0);
                                  const changeDue = Math.max(0, totalTender - totals.totalAmount);
                                  const hasChange = changeDue > 0;
                                  return (
                                    <div className="inline-flex items-center space-x-1.5 bg-amber-100 border-2 border-amber-500 text-amber-900 font-extrabold text-xs px-3 py-1 rounded shadow-sm">
                                      <Bell className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                      <span>
                                        [ CASH DRAWER: OPEN ] {hasChange ? `Change: ₱${changeDue.toFixed(2)}` : "Change: ₱0.00 (Exact Amount)"}
                                      </span>
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
                            {selectedBankCardType === "SODEXHO" && bankCardStep === "FINAL_TEAROFF" ? (
                              <>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-base tracking-wide">Tendered</span>
                                  <span className="bg-white text-black font-sans font-bold text-xl px-4 py-1 border border-gray-300 min-w-[170px] text-right shadow-inner">
                                    {(totals.totalAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-base tracking-wide">Change</span>
                                  <span className="bg-white text-black font-sans font-bold text-xl px-4 py-1 border border-gray-300 min-w-[170px] text-right shadow-inner">
                                    0.00
                                  </span>
                                </div>
                              </>
                            ) : (
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
                                    ? Math.max(0, ((parseFloat(lnqrCashTenderInput) || 0) + (sulitCoinsRedeemedAmount || 0)) - totals.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                    : (parseFloat(lnqrCashTenderInput) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Cash / Card Payment Details Header */}
                          <div className="bg-[#67B8DE] text-gray-900 font-bold px-3 py-1 text-sm border-b border-gray-400 text-center tracking-wide flex-shrink-0">
                            {selectedTenderMethod === "CASH"
                              ? "Cash Payment Details"
                              : selectedTenderMethod === "BANK_CARD"
                              ? (selectedBankCardType === "SODEXHO"
                                  ? "Sodexho Payment Details"
                                  : isEwalletCardType(selectedBankCardType)
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
                              : selectedTenderMethod === "CREDIT_MEMO"
                              ? "Credit Memo Details"
                              : "Select Tender Method"}
                          </div>

                          {/* Details / Input Body */}
                          <div className="flex-1 bg-[#D4D0C8] p-4 flex flex-col items-center justify-center overflow-y-auto min-h-0">
                            {isSulitLoading ? (
                              <div className="text-center space-y-2 font-sans select-none flex flex-col items-center">
                                <div className="text-gray-900 font-bold text-sm tracking-wide">
                                  Please wait...
                                </div>
                              </div>
                            ) : selectedTenderMethod === null ? (
                              <div className="text-center space-y-3 font-sans select-none flex flex-col items-center p-4">
                                <div className="text-sm font-bold text-gray-900 flex items-center justify-center space-x-1.5">
                                  {sulitCoinsRedeemedAmount !== null ? (
                                    <>
                                      <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                                      <span>₱{sulitCoinsRedeemedAmount.toFixed(2)} Sulit Coins Redeemed</span>
                                    </>
                                  ) : (
                                    <span>Select Payment Tender</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-700 max-w-xs leading-relaxed">
                                  {sulitCoinsRedeemedAmount !== null ? (
                                    <span>
                                      Remaining Due:{" "}
                                      <strong className="text-blue-900 font-mono text-base font-bold">
                                        ₱{(Math.max(0, totals.totalAmount - sulitCoinsRedeemedAmount)).toFixed(2)}
                                      </strong>
                                      <br />
                                      Select <strong className="text-gray-900 font-bold">Cash (F2)</strong> or <strong className="text-gray-900 font-bold">Bank Card (F3)</strong> to tender balance.
                                    </span>
                                  ) : (
                                    "Press F2 for Cash or F3 for Bank Card to proceed with payment."
                                  )}
                                </div>
                                <div className="flex items-center space-x-3 pt-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedTenderMethod("CASH");
                                      setBankCardStep("SELECT_TYPE");
                                      validateScenarioStep("PAY_CASH");
                                    }}
                                    className="px-4 py-2 bg-[#D4D0C8] hover:bg-[#E2E0DC] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow cursor-pointer flex items-center space-x-1.5"
                                  >
                                    <Banknote className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                    <span>Cash (F2)</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedTenderMethod("BANK_CARD");
                                      setBankCardStep("SELECT_TYPE");
                                      validateScenarioStep("PAY_CARD");
                                    }}
                                    className="px-4 py-2 bg-[#D4D0C8] hover:bg-[#E2E0DC] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow cursor-pointer flex items-center space-x-1.5"
                                  >
                                    <CreditCard className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                                    <span>Bank Card (F3)</span>
                                  </button>
                                </div>
                              </div>
                            ) : selectedTenderMethod === "CASH" ? (
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
                                    placeholder={(totals.totalAmount - (sulitCoinsRedeemedAmount || 0)).toFixed(2)}
                                    className="w-56 bg-white border-2 border-gray-600 px-3 py-1 text-center font-mono font-bold text-xl text-gray-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    autoFocus
                                  />
                                  <button
                                    type="submit"
                                    tabIndex={-1}
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
                                      if (cardType.toUpperCase() === "SODEXHO") {
                                        setSelectedBankCardType("SODEXHO");
                                        setBankCardStep("SODEXHO_SERIES");
                                        return;
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
                                ) : bankCardStep === "SODEXHO_SERIES" ? (
                                  <div className="w-full flex flex-col items-center justify-center space-y-4 font-sans select-none py-8">
                                    <div className="text-gray-900 font-bold text-sm tracking-wide">
                                      Please select Sodexho
                                    </div>
                                    <div className="w-64">
                                      <select
                                        value={sodexhoSeriesType}
                                        onChange={(e) => setSodexhoSeriesType(e.target.value)}
                                        className="w-full bg-white border-2 border-gray-600 px-3 py-1.5 font-sans text-sm font-bold text-gray-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                                        autoFocus
                                      >
                                        <option value="-SELECT-">-SELECT-</option>
                                        <option value="Without Series">Without Series</option>
                                        <option value="With Series">With Series</option>
                                      </select>
                                    </div>
                                  </div>
                                ) : bankCardStep === "SODEXHO_DETAILS" ? (
                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      handleConfirmSodexhoPayment();
                                    }}
                                    className="w-full max-w-md space-y-3 py-2 px-4 font-sans select-none"
                                  >
                                    {/* Sodexho Number */}
                                    <div className="flex items-center">
                                      <label className="w-36 text-xs font-bold text-gray-900">
                                        Sodexho Number
                                      </label>
                                      <div className="flex items-center space-x-2 flex-1">
                                        <input
                                          type="text"
                                          value={sodexhoNumber}
                                          onChange={(e) => setSodexhoNumber(e.target.value)}
                                          autoFocus
                                          className="w-44 bg-white border-2 border-gray-600 px-2 py-0.5 font-mono text-xs font-bold text-gray-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-600"
                                        />
                                        <span className="text-red-600 font-bold text-xs font-mono">
                                          ( e.g. PP12345678 )
                                        </span>
                                      </div>
                                    </div>

                                    {/* Valid Until */}
                                    <div className="flex items-center">
                                      <label className="w-36 text-xs font-bold text-gray-900">
                                        Valid Until
                                      </label>
                                      <div className="flex items-center space-x-2 flex-1">
                                        <input
                                          type="text"
                                          value={sodexhoValidUntil}
                                          onChange={(e) => setSodexhoValidUntil(e.target.value)}
                                          placeholder="YYYY-mm-dd"
                                          className="w-36 bg-white border-2 border-gray-600 px-2 py-0.5 font-mono text-xs font-bold text-gray-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-600"
                                        />
                                        <span className="text-red-600 font-bold text-xs font-mono">
                                          (YYYY-mm-dd)
                                        </span>
                                      </div>
                                    </div>

                                    {/* Denomination */}
                                    <div className="flex items-center">
                                      <label className="w-36 text-xs font-bold text-gray-900">
                                        Denomination
                                      </label>
                                      <div className="flex items-center space-x-2 flex-1">
                                        <select
                                          value={sodexhoDenom}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setSodexhoDenom(val);
                                            if (val && val !== "--Select Sodexho Denom--") {
                                              setSodexhoAvailAmount(val);
                                            }
                                          }}
                                          className="w-56 bg-white border-2 border-gray-600 px-2 py-0.5 text-xs font-bold text-gray-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                                        >
                                          <option value="--Select Sodexho Denom--">--Select Sodexho Denom--</option>
                                          <option value="50.00">50.00</option>
                                          <option value="100.00">100.00</option>
                                          <option value="200.00">200.00</option>
                                          <option value="500.00">500.00</option>
                                          <option value="1000.00">1000.00</option>
                                        </select>
                                      </div>
                                    </div>

                                    {/* Avail Amount */}
                                    <div className="flex items-center">
                                      <label className="w-36 text-xs font-bold text-gray-900">
                                        Avail Amount
                                      </label>
                                      <div className="flex items-center space-x-2 flex-1">
                                        <input
                                          type="text"
                                          value={sodexhoAvailAmount}
                                          onChange={(e) => setSodexhoAvailAmount(e.target.value)}
                                          className="w-56 bg-white border-2 border-gray-600 px-2 py-0.5 font-mono text-xs font-bold text-gray-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-600"
                                        />
                                      </div>
                                    </div>
                                  </form>
                                ) : bankCardStep === "FINAL_TEAROFF" && selectedBankCardType === "SODEXHO" ? (
                                  <div className="w-full flex-1 flex flex-col items-center justify-center space-y-3 font-sans select-none py-6">
                                    <div className="text-gray-900 font-bold text-center space-y-1">
                                      <div className="text-sm sm:text-base font-bold tracking-wide">Please Tear-Off the OR</div>
                                      <div className="text-sm sm:text-base font-bold tracking-wide">Thank You!!</div>
                                    </div>
                                  </div>
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
                                      {selectedBankCardType.toUpperCase() === "NBS GIFTCARD"
                                        ? "Voucher Amount"
                                        : "Amount"}
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
                                      {selectedBankCardType.toUpperCase() === "NBS GIFTCARD"
                                        ? "Voucher Code"
                                        : selectedBankCardType === "LNQR Sulit Coins"
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
                                      placeholder={
                                        selectedBankCardType.toUpperCase() === "GCASH"
                                          ? (currentGcashRef || "GC88492019")
                                          : selectedBankCardType.toUpperCase() === "MAYA"
                                          ? (currentMayaRef || "MY994821")
                                          : ""
                                      }
                                      className="w-48 bg-white border-2 border-gray-500 px-2 py-1 font-mono text-sm font-bold text-gray-900 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                  </div>
                                  {(selectedBankCardType.toUpperCase() === "GCASH" || selectedBankCardType.toUpperCase() === "MAYA") && (
                                    <div className="flex justify-end pt-0.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (selectedBankCardType.toUpperCase() === "GCASH") {
                                            setBankCardRefNo(currentGcashRef || "GC88492019");
                                          } else {
                                            setBankCardRefNo(currentMayaRef || "MY994821");
                                          }
                                        }}
                                        className="cursor-pointer text-[10px] font-mono font-bold text-blue-800 hover:text-blue-950 bg-blue-100 hover:bg-blue-200 border border-blue-400 rounded px-2 py-0.5 shadow-2xs transition-colors flex items-center"
                                        title="Click to copy reference number from customer device into POS"
                                      >
                                        <ClipboardList className="w-3 h-3 mr-1 inline-block" /> Auto-fill Reference ({selectedBankCardType.toUpperCase() === "GCASH" ? (currentGcashRef || "GC88492019") : (currentMayaRef || "MY994821")})
                                      </button>
                                    </div>
                                  )}
                                </form>
                              ) : bankCardStep === "SWIPE_CARD" ? (
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    validateScenarioStep("SWIPE_CARD", bankCardSwipeNum || "4000123456789010");
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
                                      placeholder={currentCardAuth || "AP8812"}
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
                                      placeholder={currentCardInvoice || "004921"}
                                      onChange={(e) =>
                                        setBankCardSlipNo(
                                          e.target.value.replace(/\D/g, "").slice(0, 6)
                                        )
                                      }
                                      className="col-span-3 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold"
                                    />
                                  </div>
                                  <div className="flex justify-end pt-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setBankCardAuthCode(currentCardAuth || "AP8812");
                                        setBankCardSlipNo(currentCardInvoice || "004921");
                                      }}
                                      className="cursor-pointer text-[10px] font-mono font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-400 rounded px-2 py-0.5 shadow-2xs transition-colors flex items-center"
                                      title="Fill Auth Code and Sales Slip No. from the terminal receipt"
                                    >
                                      <ClipboardList className="w-3 h-3 mr-1 inline-block" /> Auto-fill from Slip ({currentCardAuth || "AP8812"} / {currentCardInvoice || "004921"})
                                    </button>
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
                                    const modeVal = e.target.value as "WITH_SERIES" | "WITHOUT_SERIES";
                                    setCouponEntryMode(modeVal);
                                    validateScenarioStep("SELECT_COUPON_MODE", modeVal);
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
                              tabIndex={-1}
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
                            tabIndex={-1}
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
                    {/* Left 5 */}
                    <div className="col-span-5 bg-[#BDC3C7] border-r-2 border-gray-400" />

                    {/* Center 5 */}
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
                            if (bankCardStep === "SODEXHO_DETAILS") {
                              setBankCardStep("SODEXHO_SERIES");
                            } else if (bankCardStep === "SODEXHO_SERIES") {
                              setBankCardStep("SELECT_TYPE");
                            } else if (bankCardStep !== "SELECT_TYPE") {
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
                    <div className="col-span-2 bg-[#22A838]" />
                  </div>
                </div>
              ) : (
                <>
                  {pendingSodexhoNotice && (
                    <div className="bg-[#FFF275] border-b-2 border-yellow-600 px-4 py-1.5 text-xs font-bold text-gray-900 flex justify-between items-center shadow-md animate-in fade-in flex-shrink-0">
                      <div className="flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                        <span>{pendingSodexhoNotice}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPendingSodexhoNotice(null)}
                        className="text-gray-700 hover:text-black font-extrabold ml-2 p-0.5 cursor-pointer shrink-0"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    </div>
                  )}
                  {/* TOP HEADER BAR */}
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
                        placeholder={
                          isVoidSkuMode
                            ? "Select line item or scan barcode, then Alt+Enter"
                            : isRefundSkuMode
                            ? ""
                            : ""
                        }
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
                    {horizKeys.map((kDef, idx) => {
                      const isLast = idx === horizKeys.length - 1;
                      const borderClass = isLast ? "" : "border-r border-gray-400 ";

                      if (kDef.arrow === "up") {
                        return (
                          <button
                            key={`${state.currentPage}-${kDef.key}-${idx}`}
                            tabIndex={-1}
                            type="button"
                            onClick={() => handleAction(kDef.actionId)}
                            className={`${borderClass}bg-[#D2D7DF] hover:bg-[#E2E6EC] active:bg-[#B8BFC9] flex flex-col items-center justify-center p-1 transition-all select-none cursor-pointer`}
                          >
                            <div className="w-0 h-0 border-x-[7px] border-x-transparent border-b-[10px] border-b-[#16A34A] mb-0.5"></div>
                            <span className="text-[10px] font-bold text-gray-900">{kDef.key}</span>
                          </button>
                        );
                      }

                      if (kDef.arrow === "down") {
                        return (
                          <button
                            key={`${state.currentPage}-${kDef.key}-${idx}`}
                            tabIndex={-1}
                            type="button"
                            onClick={() => handleAction(kDef.actionId)}
                            className={`${borderClass}bg-[#D2D7DF] hover:bg-[#E2E6EC] active:bg-[#B8BFC9] flex flex-col items-center justify-center p-1 transition-all select-none cursor-pointer`}
                          >
                            <div className="w-0 h-0 border-x-[7px] border-x-transparent border-t-[10px] border-t-[#16A34A] mb-0.5"></div>
                            <span className="text-[10px] font-bold text-gray-900">{kDef.key}</span>
                          </button>
                        );
                      }

                      if (kDef.variant === "red") {
                        return (
                          <button
                            key={`${state.currentPage}-${kDef.key}-${idx}`}
                            tabIndex={-1}
                            type="button"
                            disabled={kDef.disabled}
                            onClick={() => handleAction(kDef.actionId)}
                            className={`${borderClass}bg-[#E4002B] text-white flex flex-col items-center justify-center p-1 transition-all select-none ${
                              kDef.disabled
                                ? "opacity-90 cursor-not-allowed"
                                : "hover:bg-[#C10024] active:bg-[#9B001D] cursor-pointer"
                            }`}
                          >
                            <span className="text-[11px] font-bold leading-tight">{kDef.label}</span>
                            <span className="text-[10px] font-extrabold text-[#000080]">{kDef.key}</span>
                          </button>
                        );
                      }

                      if (kDef.variant === "csa") {
                        return (
                          <button
                            key={`${state.currentPage}-${kDef.key}-${idx}`}
                            tabIndex={-1}
                            type="button"
                            onClick={() => handleAction(kDef.actionId)}
                            className={`${borderClass}bg-[#D2D7DF] hover:bg-[#E2E6EC] active:bg-[#B8BFC9] flex flex-col items-center justify-center p-1 transition-all select-none cursor-pointer`}
                          >
                            <span className="text-[10px] font-bold text-gray-900 leading-tight">CSA</span>
                            <span className="text-[9px] font-bold text-gray-900 leading-none">ON/OFF</span>
                            <span className="text-[10px] font-extrabold text-[#1D4ED8]">{kDef.key}</span>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={`${state.currentPage}-${kDef.key}-${idx}`}
                          tabIndex={-1}
                          type="button"
                          disabled={kDef.disabled}
                          onClick={() => handleAction(kDef.actionId)}
                          className={`${borderClass}bg-[#D2D7DF] hover:bg-[#E2E6EC] active:bg-[#B8BFC9] flex flex-col items-center justify-center p-1 transition-all select-none cursor-pointer`}
                        >
                          <span className="text-[11px] font-bold text-gray-900 leading-tight">{kDef.label}</span>
                          <span className="text-[10px] font-extrabold text-[#1D4ED8]">{kDef.key}</span>
                        </button>
                      );
                    })}
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
                    Line item screen page ({isRefundSkuMode ? "Enter Refund UPC above" : "Scan or Enter UPC above"})
                  </div>
                ) : (
                  [...state.lineItems]
                    .map((item, originalIdx) => ({ item, originalIdx }))
                    .reverse()
                    .map(({ item, originalIdx }, reverseIdx) => {
                      const isVoidLine = item.isVoided || item.quantity < 0;
                      const isNonMdse =
                        item.sku === "ZSOI" ||
                        item.description.toUpperCase().includes("SODEXHO") ||
                        item.description.toUpperCase().includes("NON-MDSE");
                      const itemType = isVoidLine ? "-V" : isNonMdse ? "NV" : state.isZeroRated ? "VZ" : "V";
                      const isLatestItem = reverseIdx === 0;

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (isVoidSkuMode && !item.isVoided) {
                              setSelectedVoidItemId(item.id);
                            }
                          }}
                          className={`grid grid-cols-12 py-1 px-1 items-center text-[11px] font-mono font-bold ${
                            selectedVoidItemId === item.id
                              ? "ring-2 ring-inset ring-blue-600 bg-blue-50 text-red-600"
                              : isLatestItem
                                ? "bg-[#9ACD32] text-red-600"
                                : "text-red-600"
                          } ${isVoidSkuMode ? "cursor-pointer hover:opacity-80" : ""}`}
                        >
                          <span className="col-span-1 text-left">{originalIdx + 1}</span>
                          <span className="col-span-3 text-left truncate">{item.sku}</span>
                          <span className="col-span-4 text-left truncate pr-1">{item.description}</span>
                          <span className="col-span-1 text-center">
                            {item.quantity < 0 ? item.quantity : item.isVoided ? `-${item.quantity}` : item.quantity}
                          </span>
                          <span className="col-span-1 text-right">{item.unitPrice.toFixed(2)}</span>
                          <span className="col-span-1 text-right">
                            {item.isVoided && item.total > 0 ? `-${item.total.toFixed(2)}` : item.total.toFixed(2)}
                          </span>
                          <span className="col-span-1 text-right">{itemType}</span>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* RIGHT 2 COLS: VERTICAL FUNCTION KEYS PANEL */}
            <div className="col-span-2 bg-[#9AA5B1] p-1 flex flex-col justify-between border-l border-gray-400 space-y-1 min-h-0 overflow-hidden">
              {rightKeys.map((kDef) => {
                const isItemAction =
                  state.currentPage === "MAIN" &&
                  (kDef.key === "F4" || kDef.key === "F7" || kDef.key === "F8" || kDef.key === "F9");
                const isActionDisabled = isItemAction && state.lineItems.length === 0;
                const isRed = isItemAction
                  ? state.lineItems.length === 0
                  : kDef.variant === "red";
                const isVoidSkuHighlight = isVoidSkuMode && kDef.key === "F7";
                const isDisabled = kDef.disabled || isActionDisabled;
                return (
                  <button
                    key={kDef.key}
                    tabIndex={-1}
                    disabled={isDisabled && !activeScenario}
                    onClick={() => {
                      if (isDisabled && !activeScenario) return;
                      handleAction(kDef.actionId);
                    }}
                    className={
                      "w-full flex-1 min-h-[50px] p-1 flex flex-col items-center justify-center border font-sans select-none shadow-sm transition-all " +
                      (kDef.disabled
                        ? "bg-gray-400 border-gray-500 text-gray-600 cursor-not-allowed opacity-50"
                        : isVoidSkuHighlight
                        ? "bg-[#FFF275] border-2 border-yellow-500 text-gray-900 font-black"
                        : isRed
                        ? "bg-[#E4002B] text-white border-red-700 " +
                          (isActionDisabled
                            ? "cursor-not-allowed opacity-90"
                            : "hover:bg-[#C10024] active:bg-[#9B001D]")
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

              {state.currentPage === "MAIN" && (
                <div className="text-center font-mono text-[9px] text-gray-700 pt-1 border-t border-gray-400">
                  Page: 0 / 0
                </div>
              )}
            </div>
          </div>

          {/* Footer Status Bar */}
          <div className="bg-[#D4D0C8] border-t-2 border-gray-500 grid grid-cols-12 text-xs font-sans items-stretch flex-shrink-0 h-10">
            
            {/* Total Qty */}
            <div className="col-span-4 bg-[#FFF275] border-r-2 border-gray-500 px-3 flex items-center justify-between">
              <span className="font-bold text-gray-900">Total Qty</span>
              <span className="font-mono font-bold text-sm bg-white px-3 h-[24px] flex items-center justify-center border border-gray-400 text-gray-900 min-w-[50px] text-center shadow-inner">
                {totals.totalQty}
              </span>
            </div>

            {/* Total Sales */}
            <div className="col-span-4 bg-[#16A34A] border-r-2 border-gray-500 px-3 flex items-center justify-between text-white">
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
              <span className="font-mono font-bold text-sm bg-white px-3 h-[24px] flex items-center justify-end border border-gray-400 text-gray-900 min-w-[70px] text-right shadow-inner">
                {totals.totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Date Display */}
            <div className="col-span-2 bg-[#C2CAD0] border-r-2 border-gray-500 px-2 flex items-center justify-center font-bold text-gray-800 text-[11px]">
              {fmtDate(now)}
            </div>

            {/* Time Display */}
            <div className="col-span-2 bg-[#C2CAD0] px-2 flex items-center justify-center font-bold text-gray-800 text-[11px]">
              {fmtTime(now)}
            </div>
          </div>
            </>
          )}
          </>
        )}
        </div>
        {/* EXTERNAL CARD / EWALLET TERMINAL SLIP BESIDE POS */}
        {isExternalReceiptShowing && (
          <div className="shrink-0 flex items-center justify-center animate-in fade-in slide-in-from-right-4 duration-300">
            {activeExternalTerminalType === "GCASH" ? (
              <GcashTerminalPreview
                isExternalReceiptShowing={isExternalReceiptShowing}
                referenceNumber={currentGcashRef}
                onUseRef={() => setBankCardRefNo(currentGcashRef)}
              />
            ) : activeExternalTerminalType === "MAYA" ? (
              <MayaTerminalReceipt
                isExternalReceiptShowing={isExternalReceiptShowing}
                traceNumber={currentMayaTrace}
                referenceNumber={currentMayaRef}
                generatedAt={mayaGeneratedAt || new Date()}
                totalAmount={totals.totalAmount || 2990}
              />
            ) : (
              <BdoCardTerminal
                isExternalReceiptShowing={isExternalReceiptShowing}
                invoiceNumber={currentCardInvoice}
                authCode={currentCardAuth}
                generatedAt={cardReceiptGeneratedAt || new Date()}
                totalAmount={totals.totalAmount || 2990}
                onUseSlip={() => {
                  setBankCardAuthCode(currentCardAuth);
                  setBankCardSlipNo(currentCardInvoice);
                }}
              />
            )}
          </div>
        )}
            </div>
            {/* End Scaled Terminal Container */}
          </div>
        );
      })()}
      </div>

        {/* Touch Key Strip Footer - Consumes the whole width below the terminal */}
        {(isFocusMode || terminalScale < 1) && (
          <div className="w-full shrink-0 z-30">
            <MobileKeyStrip onKeyPress={handleSyntheticKeyPress} />
          </div>
        )}
      </div>

      {/* CHANGE CHECK EXAM MODAL */}
      <ChangeCheckModal
        isOpen={isChangeCheckModalOpen}
        totalSales={totals.totalAmount}
        sulitCoinsRedeemed={sulitCoinsRedeemedAmount || 0}
        expectedTenderAmount={pendingCashTender || totals.totalAmount}
        onConfirmChange={(val) => {
          setIsChangeCheckModalOpen(false);
          const remainingDue = Math.max(0, totals.totalAmount - (sulitCoinsRedeemedAmount || 0));
          const computedChange = Math.max(0, (pendingCashTender || totals.totalAmount) - remainingDue);
          const actualChange = val ?? computedChange;
          if (isExamMode) {
            handleAdvanceExamCase(actualChange);
          }
        }}
      />

      {/* Keyframe Styles */}
      <style jsx global>{`
        @keyframes posTerminalShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .pos-shake-error {
          animation: posTerminalShake 0.4s ease-in-out;
        }
      `}</style>

      {/* LNQR HAS BEEN UPDATED MODAL */}
      <LnqrUpdatedModal
        isOpen={isLnqrUpdatedModalOpen}
        onConfirm={handleConfirmLnqrUpdated}
        sulitCoinsEarnedAmount={sulitCoinsEarnedAmount ?? 29.70}
        customerName="Jan Angela Catindig"
        cardNumber={sulitCoinsRefNo || customerQrInput || "20260511LN000006"}
        previousBalance={0.90}
        currentBalance={30.60}
      />

      {/* QUICK CATALOG PICKER */}
      {!isExamMode && (
        <div className="max-w-[1080px] w-full mx-auto px-4 pb-4 hidden md:block">
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
      )}

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
            dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
            validateScenarioStep("CONFIRM_PRICE_CHANGE", data.newPrice);
          }}
          onCancel={() => {
            setIsPriceChangeOpen(false);
            dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
          }}
        />
      )}

      

      {/* F4 NON-SALES DEPOSIT / GIFT CARD MODAL */}
      {isNonSalesOpen && (
        <NonSalesModal
          onConfirm={(data) => {
            setIsNonSalesOpen(false);
            dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
            validateScenarioStep("CONFIRM_NON_SALES", data.amount);
          }}
          onCancel={() => {
            setIsNonSalesOpen(false);
            dispatch({ type: "NAVIGATE_PAGE", page: "MAIN" });
          }}
        />
      )}



      {/* CONGRATULATIONS PRACTICE COMPLETE POPUP */}
      <ScenarioCompleteModal
        isOpen={isExamCompleted || timedOut}
        timedOut={timedOut}
        stepsCompleted={currentStepIndex}
        scenario={activeScenario}
        mistakesCount={mistakes.length}
        isLessonSpecific={isLessonSpecific}
        returnLessonUrl={returnLessonUrl}
        returnButtonLabel={returnButtonLabel}
        onResetExam={handleResetExam}
      />

      {/* POS Green Beveled Alert Modal */}
      <PosAlertModal alert={posAlert} onClose={() => setPosAlert(null)} />
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
