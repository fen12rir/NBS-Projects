"use client";

import React, { useReducer, useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { ReceiptModal } from "@/components/simulator/receipt-modal";
import { GuidedStepBar } from "@/components/simulator/guided-step-bar";
import { F2LookupScreen } from "@/components/simulator/f2-lookup-screen";
import { ManagerOverrideModal } from "@/components/simulator/manager-override-modal";
import { ItemVoidModal } from "@/components/simulator/item-void-modal";
import { TransactionDiscountModal } from "@/components/simulator/transaction-discount-modal";
import { TrxVoidModal } from "@/components/simulator/trx-void-modal";
import { QuantityModal } from "@/components/simulator/quantity-modal";
import { SuspendModal, RecallModal } from "@/components/simulator/suspend-recall-modal";
import { ReprintModal } from "@/components/simulator/reprint-modal";
import { SdvModal } from "@/components/simulator/sdv-modal";
import { ReadingsModal } from "@/components/simulator/readings-modal";
import { TransactionCommentModal } from "@/components/simulator/transaction-comment-modal";
import { ReturnRefundModal } from "@/components/simulator/return-refund-modal";
import { ElectronicPaymentModal, CardTenderType } from "@/components/simulator/electronic-payment-modal";
import { PostVoidModal } from "@/components/simulator/post-void-modal";
import { PriceChangeModal } from "@/components/simulator/price-change-modal";
import { NonMdseModal } from "@/components/simulator/non-mdse-modal";
import { JournalViewerModal } from "@/components/simulator/journal-viewer-modal";
import { NonSalesModal } from "@/components/simulator/non-sales-modal";
import { BestBuyModal } from "@/components/simulator/best-buy-modal";
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
  const [lnqrCashTenderInput, setLnqrCashTenderInput] = useState("3000");
  const [isLnqrTenderProcessed, setIsLnqrTenderProcessed] = useState(false);
  const [isLnqrUpdatedModalOpen, setIsLnqrUpdatedModalOpen] = useState(false);

  // Authentic Functional Modals (Modules 4-8)
  const [isItemVoidModalOpen, setIsItemVoidModalOpen] = useState(false);
  const [isTrxVoidModalOpen, setIsTrxVoidModalOpen] = useState(false);
  const [isVoidSkuMode, setIsVoidSkuMode] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [isRefundSkuMode, setIsRefundSkuMode] = useState(false);

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
  const [isBestBuyOpen, setIsBestBuyOpen] = useState(false);

  const [state, dispatch] = useReducer(
    posReducer,
    createInitialPOSState("Jan Angela")
  );

  const [barcodeInput, setBarcodeInput] = useState("");
  const barcodeRef = useRef<HTMLInputElement>(null);

  const [qtyInput, setQtyInput] = useState("");
  const qtyInputRef = useRef<HTMLInputElement>(null);

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
    if (state.lineItems.length === 0) {
      dispatch({ type: "ADD_ITEM_BY_CODE", code: "NBS-BK-001" });
    }

    // Pre-fill tender amount for upcoming scenario steps if available
    const upcomingTenderStep = activeScenario?.steps.slice(currentStepIndex).find(
      (s) => (s.expectedAction === "CONFIRM_TENDER" || s.expectedAction === "SUBMIT_CASH_TENDER") && s.expectedData
    );
    const currentTotals = calculateTotals(
      state.lineItems,
      state.appliedDiscount?.percent || 0,
      state.isZeroRated
    );
    if (upcomingTenderStep?.expectedData) {
      setLnqrCashTenderInput(String(upcomingTenderStep.expectedData));
    } else if (currentTotals.totalAmount > 0) {
      setLnqrCashTenderInput(String(Math.ceil(currentTotals.totalAmount)));
    }

    if (optionNum === 1) {
      // 1. None: Directly navigate to Payment screen
      setLoyaltyType("NONE");
      setIsLoyaltyOptionOpen(false);
      setSelectedTenderMethod("CASH");
      setIsLnqrTenderProcessed(false);
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
      setLnqrCashTenderInput("3000");
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
    dispatch({ type: "OPEN_PAYMENT" });
    setIsLnqrCashPaymentOpen(true);
    validateScenarioStep("SUBMIT_LNQR", customerQrInput);
  };

  const handleConfirmLnqrCashTender = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLnqrTenderProcessed(true);
    const tenderVal = parseFloat(lnqrCashTenderInput) || 3000;
    dispatch({ type: "TENDER_PAYMENT", amount: tenderVal });
    validateScenarioStep("SUBMIT_CASH_TENDER", lnqrCashTenderInput);
    validateScenarioStep("CONFIRM_TENDER", tenderVal);
    if (loyaltyType === "LNQR") {
      setTimeout(() => {
        setIsLnqrUpdatedModalOpen(true);
      }, 1500);
    }
  };

  const handleConfirmLnqrUpdated = () => {
    setIsLnqrUpdatedModalOpen(false);
    setIsLnqrCashPaymentOpen(false);
    setIsLnqrTenderProcessed(false);
    setIsLnqrScanScreenOpen(false);
    setIsLncCardScreenOpen(false);
    setIsLoyaltyOptionOpen(false);
    dispatch({ type: "RESET_TRANSACTION" });
    validateScenarioStep("CONFIRM_LNQR_UPDATED");
  };

  const handlePaymentOkClick = () => {
    if (!isLnqrTenderProcessed) {
      handleConfirmLnqrCashTender();
      return;
    }
    if (loyaltyType === "LNQR") {
      setIsLnqrUpdatedModalOpen(true);
    } else {
      dispatch({ type: "CLOSE_PAYMENT" });
      setIsLnqrCashPaymentOpen(false);
      setIsLnqrTenderProcessed(false);
    }
  };

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
      !isBestBuyOpen
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
    isBestBuyOpen,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

      // 4c-1. LNC Card Input Screen (Tab to toggle Ok/Cancel, Enter to confirm, Escape)
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

      // 4c-2. LNQR Scan Input Screen (Tab to toggle Ok/Cancel, Enter to confirm, Escape)
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
        if (e.key === "Escape" || e.key === "F1") {
          e.preventDefault();
          dispatch({ type: "CLOSE_PAYMENT" });
          setIsLnqrCashPaymentOpen(false);
          setIsLnqrTenderProcessed(false);
          return;
        }
        if (e.key === "F2") {
          e.preventDefault();
          setSelectedTenderMethod("CASH");
          validateScenarioStep("PAY_CASH");
          return;
        }
        if (e.key === "F3") {
          e.preventDefault();
          setSelectedTenderMethod("BANK_CARD");
          setElectronicPaymentType("Credit Card");
          setIsElectronicPaymentOpen(true);
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
          setIsElectronicPaymentOpen(true);
          validateScenarioStep("PAY_GC");
          return;
        }
        if (e.key === "F6") {
          e.preventDefault();
          setSelectedTenderMethod("COUPON");
          setElectronicPaymentType("Promo Coupon");
          setIsElectronicPaymentOpen(true);
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
        if (isBestBuyOpen) {
          e.preventDefault();
          setIsBestBuyOpen(false);
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
      isBestBuyOpen
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
        setIsLoyaltyOptionOpen(true);
        setSelectedLoyaltyOption(null);
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
        setElectronicPaymentType("Credit Card");
        validateScenarioStep("PAY_CARD");
        break;
      case "PAY_GC":
        setSelectedTenderMethod("GIFT_CERT");
        setElectronicPaymentType("Gift Certificate Series");
        validateScenarioStep("PAY_GC");
        break;
      case "PAY_COUPON":
        setSelectedTenderMethod("COUPON");
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
      case "BEST_BUY":
        setIsBestBuyOpen(true);
        validateScenarioStep("BEST_BUY");
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
      dispatch({ type: "VOID_ITEM", itemId: code });
      setIsVoidSkuMode(false);
      validateScenarioStep("SCAN_VOID_SKU", code);
      validateScenarioStep("ADD_ITEM", code);
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
      setIsItemVoidModalOpen(true);
    } else if (target === "Recall") {
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
    setLnqrCashTenderInput("3000");
    setIsLnqrTenderProcessed(false);
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
    setIsBestBuyOpen(false);
    setScenarioStartTime(Date.now());
    setTerminalMode(getInitialTerminalMode(activeScenario));
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
      <div className="flex-1 p-2 sm:p-4 flex items-center justify-center">
        <div className="w-full max-w-[1080px] bg-[#B0B8C0] border-4 border-[#7A8A99] shadow-2xl flex flex-col font-sans overflow-hidden">
          
          {/* SCREEN 1: START OF DAY VERIFY */}
          {terminalMode === "START_OF_DAY_VERIFY" && (
            <div className="flex-1 bg-white min-h-[530px] flex flex-col items-center justify-center p-6 select-none relative">
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
                    onClick={handleVerifyDateYes}
                    className={`min-w-[85px] px-5 py-1.5 text-sm font-bold font-sans transition-all border-2 ${
                      selectedSodButton === "YES"
                        ? "bg-[#D4D0C8] border-red-600 ring-2 ring-red-500 shadow-inner text-black font-extrabold"
                        : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 hover:bg-[#E2E0DC]"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSodButton("NO");
                      validateScenarioStep("VERIFY_DATE_NO");
                    }}
                    className={`min-w-[85px] px-5 py-1.5 text-sm font-bold font-sans transition-all border-2 ${
                      selectedSodButton === "NO"
                        ? "bg-[#D4D0C8] border-red-600 ring-2 ring-red-500 shadow-inner text-black font-extrabold"
                        : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 hover:bg-[#E2E0DC]"
                    }`}
                  >
                    No
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* SCREEN 2: START OF DAY CLOSE */}
          {terminalMode === "START_OF_DAY_CLOSE" && (
            <div className="flex-1 bg-white min-h-[530px] flex flex-col items-center justify-center p-6 select-none relative">
              <div className="max-w-lg w-full bg-white border border-gray-300 p-8 shadow-sm flex flex-col items-center text-center space-y-6">
                <div className="space-y-2 text-[#E4002B] font-bold text-xl font-sans">
                  <p>You can now start using your POS terminal.</p>
                  <p>Have a nice day.</p>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 text-[#E4002B] font-bold text-base leading-relaxed max-w-md">
                  Press <kbd className="bg-white px-2 py-0.5 border border-red-300 text-red-900 font-mono text-sm">Ctrl+Alt+C</kbd> to close this window and<br />
                  Press <kbd className="bg-white px-2 py-0.5 border border-red-300 text-red-900 font-mono text-sm">(F5)</kbd> to go to login page.
                </div>

                <button
                  type="button"
                  onClick={handleCloseSodWindow}
                  className="px-6 py-2.5 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-sm font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer font-sans"
                >
                  Close Window (Ctrl+Alt+C)
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 2B: POS RELOADER */}
          {terminalMode === "POS_RELOADER" && (
            <div className="flex-1 bg-white min-h-[530px] flex flex-col select-none relative font-sans">
              {/* Retro Browser Menu Bar */}
              <div className="bg-[#ECE9D8] border-b border-gray-400 px-3 py-1 flex items-center space-x-4 text-xs text-gray-800 font-sans">
                <span className="hover:bg-blue-600 hover:text-white px-1 cursor-default">File</span>
                <span className="hover:bg-blue-600 hover:text-white px-1 cursor-default">Edit</span>
                <span className="hover:bg-blue-600 hover:text-white px-1 cursor-default">View</span>
                <span className="hover:bg-blue-600 hover:text-white px-1 cursor-default">History</span>
                <span className="hover:bg-blue-600 hover:text-white px-1 cursor-default">Bookmarks</span>
                <span className="hover:bg-blue-600 hover:text-white px-1 cursor-default">Tools</span>
                <span className="hover:bg-blue-600 hover:text-white px-1 cursor-default">Help</span>
              </div>

              {/* Retro Browser Navigation / Address Bar */}
              <div className="bg-[#ECE9D8] border-b border-gray-400 px-3 py-1.5 flex items-center space-x-2 text-xs">
                {/* Back / Forward / Refresh */}
                <div className="flex items-center space-x-1 text-gray-500 font-mono text-sm select-none">
                  <span className="px-1 border border-gray-300 bg-gray-100 opacity-60">{'\u2190'}</span>
                  <span className="px-1 border border-gray-300 bg-gray-100 opacity-60">{'\u2192'}</span>
                  <span className="px-1 border border-gray-300 bg-gray-100">{'\u21BA'}</span>
                  <span className="px-1 border border-gray-300 bg-gray-100">{'\u2715'}</span>
                  <span className="px-1 border border-gray-300 bg-gray-100">{'\u2302'}</span>
                </div>

                {/* URL Address Input */}
                <div className="flex-1 bg-white border border-gray-500 px-2 py-0.5 flex items-center justify-between text-xs font-mono text-gray-900 shadow-inner">
                  <span>http://localhost/dv3/pos_nbs/</span>
                  <span className="text-gray-400 text-[10px]">{'\u25BC'}</span>
                </div>

                {/* Search / Go */}
                <div className="w-36 bg-white border border-gray-500 px-2 py-0.5 text-xs text-gray-500 font-sans flex items-center justify-between shadow-inner">
                  <span>Google</span>
                  <span className="text-gray-400 text-[10px]">{'\u{1F50D}'}</span>
                </div>
              </div>

              {/* Browser Bookmarks Bar */}
              <div className="bg-[#ECE9D8] border-b border-gray-300 px-3 py-0.5 flex items-center space-x-4 text-[11px] text-gray-700">
                <span className="flex items-center space-x-1">
                  <span className="text-red-600 font-bold">{'\u25CF'}</span>
                  <span>Getting Started</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="text-orange-500 font-bold">{'\u{1F4F0}'}</span>
                  <span>Latest Headlines</span>
                </span>
              </div>

              {/* POS Reloader Web Page Body */}
              <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-base font-serif text-gray-900">
                    POS Reloader
                  </h2>
                </div>

                {/* Trainee Helper Guidance Banner */}
                <div className="border border-blue-200 bg-blue-50 p-4 max-w-lg mx-auto text-center space-y-3">
                  <p className="text-xs text-blue-900 font-medium">
                    The setup window has closed. The POS terminal is now in the browser reloader state.
                  </p>
                  <p className="text-sm font-bold text-blue-950">
                    Press <kbd className="bg-white px-2 py-1 border border-blue-400 text-blue-900 font-mono text-sm">F5</kbd> on your keyboard to reload into the <strong>USER LOGIN</strong> page.
                  </p>
                  <div>
                    <button
                      type="button"
                      onClick={handleReloadToLogin}
                      className="px-5 py-2 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer font-sans"
                    >
                      Reload Page (F5)
                    </button>
                  </div>
                </div>

                {/* Bottom spacer */}
                <div className="h-4" />
              </div>
            </div>
          )}

          {/* SCREEN 3: USER LOGIN */}
          {terminalMode === "USER_LOGIN" && (
            <div className="flex-1 bg-white min-h-[530px] flex flex-col select-none relative">
              <div className="h-6 bg-[#FFF275] border-b border-gray-300" />

              <div className="flex-1 bg-[#ECE9D8] flex flex-col items-center justify-center p-6">
                <form
                  onSubmit={handleLoginSubmit}
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
                        onChange={(e) => setLoginUsername(e.target.value)}
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
                        onChange={(e) => setLoginPassword(e.target.value)}
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
                        onClick={() => {
                          setLoginUsername("");
                          setLoginPassword("");
                        }}
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
          )}

          {/* SCREEN 4: ACTIVE REGISTER */}
          {terminalMode === "ACTIVE_REGISTER" && (
            <>
              {state.currentPage === "LOOKUP" ? (
                <F2LookupScreen
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
              ) : isLnqrScanScreenOpen ? (
                /* LNQR SCAN SCREEN (Matches screenshot: No blue header, yellow title bar, scan input, green bottom bar) */
                <div className="flex-1 flex flex-col min-h-[500px] bg-white font-sans select-none">
                  {/* Yellow Banner */}
                  <div className="bg-[#FFF275] border-b border-gray-400 py-2 text-center font-bold text-sm text-gray-900 tracking-wide uppercase">
                    LNQR / LNQR PLUS
                  </div>

                  {/* Center QR Input Area */}
                  <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 bg-white">
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
                  <div className="bg-[#228B22] px-4 py-2 flex items-center justify-center space-x-4 border-t border-green-700">
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
                <div className="flex-1 flex flex-col min-h-[500px] bg-white font-sans select-none">
                  {/* Yellow Banner */}
                  <div className="bg-[#FFF275] border-b border-gray-400 py-2 text-center font-bold text-sm text-gray-900 tracking-wide uppercase">
                    Laking National Card
                  </div>

                  {/* Center Card Input Area */}
                  <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 bg-white">
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
                  <div className="bg-[#228B22] px-4 py-2 flex items-center justify-center space-x-4 border-t border-green-700">
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
              ) : (state.currentPage === "PAYMENT" || isLnqrCashPaymentOpen) ? (
                /* AUTHENTIC FULL PAYMENT SCREEN (Matches user screenshot) */
                <div className="flex-1 flex flex-col min-h-[500px] bg-white font-sans select-none">
                  {/* Top Yellow Bar */}
                  <div className="bg-[#FFF275] border-b border-gray-400 h-6" />

                  <div className="flex-1 grid grid-cols-12 bg-white">
                    {/* Left Panel: Electronic Journal */}
                    <div className="col-span-5 border-r-2 border-gray-400 flex flex-col bg-[#F3F4F6] text-[11px] font-mono p-3 overflow-y-auto">
                      <div className="bg-[#B0B8C0] text-center font-bold font-sans py-0.5 border border-gray-400 text-xs mb-2">
                        Electronic Journal
                      </div>
                      <div className="bg-white border border-gray-400 p-2 text-gray-800 leading-tight space-y-1 shadow-inner flex-1">
                        <div className="text-center font-bold text-[10px]">
                          ABACUS BOOK AND CARD CORP.<br />
                          NATIONAL BOOK STORE<br />
                          GROUND FLOOR QUAD ALPHA CENTRUM<br />
                          125 PIONEER ST. MANDALUYONG CITY<br />
                          VAT Registered TIN: 000-325-972-054
                        </div>
                        <div className="border-t border-dashed border-gray-400 my-1" />
                        <div>TrxNo : 0511202629990005002807</div>
                        <div>Clerk : 02122026 &nbsp;&nbsp;&nbsp;&nbsp; Term. No.: 0005</div>
                        <div className="border-t border-dashed border-gray-400 my-1" />
                        {state.lineItems.length > 0 ? (
                          state.lineItems.map((item, idx) => (
                            <div key={item.id} className="flex justify-between">
                              <span>{idx + 1}&nbsp; {item.description}</span>
                              <span>{formatCurrency(item.total)}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex justify-between">
                            <span>1&nbsp; PHO PRKR RBALL POINT</span>
                            <span>2,990.00</span>
                          </div>
                        )}
                        <div className="border-t border-dashed border-gray-400 my-1" />
                        <div className="flex justify-between font-bold">
                          <span>No. of Items</span>
                          <span>{totals.totalQty || (state.lineItems.length > 0 ? state.lineItems.length : 1)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Amount Due</span>
                          <span>{formatCurrency(totals.totalAmount || 2990)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Tendered Cash</span>
                          <span>{isLnqrTenderProcessed ? formatCurrency(parseFloat(lnqrCashTenderInput) || 3000) : "0.00"}</span>
                        </div>
                        <div className="flex justify-between font-bold text-red-600">
                          <span>Change Due</span>
                          <span>{isLnqrTenderProcessed ? formatCurrency(Math.max(0, (parseFloat(lnqrCashTenderInput) || 3000) - (totals.totalAmount || 2990))) : "0.00"}</span>
                        </div>
                        {loyaltyType === "LNQR" && (
                          <div className="border-t border-dashed border-gray-400 my-1 pt-1 text-[10px] text-gray-600">
                            ***********************************<br />
                            Join Laking National for free!<br />
                            Visit : lakingnational.com<br />
                            LNQR No. : {customerQrInput}<br />
                            Earned Sulit Coins : {((totals.totalAmount || 2990) * 0.01).toFixed(2)}<br />
                            ***********************************
                          </div>
                        )}
                        {loyaltyType === "LNC" && (
                          <div className="border-t border-dashed border-gray-400 my-1 pt-1 text-[10px] text-gray-600">
                            ***********************************<br />
                            LAKING NATIONAL CARD<br />
                            Card No. : {customerLncInput}<br />
                            Earned Sulit Coins : {((totals.totalAmount || 2990) * 0.01).toFixed(2)}<br />
                            ***********************************
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Center Panel: Green Box & Cash Payment Details */}
                    <div className="col-span-5 flex flex-col border-r-2 border-gray-400">
                      {/* Top Green Box: Unit, Sales, Tendered / Blinking Change */}
                      <div className="bg-[#16A34A] p-4 text-white space-y-2 border-b-2 border-gray-400">
                        {/* Unit */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">Unit</span>
                          <span className="bg-white text-gray-900 font-mono font-bold text-lg px-4 py-0.5 border border-gray-400 min-w-[100px] text-right">
                            {totals.totalQty || (state.lineItems.length > 0 ? state.lineItems.length : 1)}
                          </span>
                        </div>

                        {/* Sales */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">Sales</span>
                          <span className="bg-white text-gray-900 font-mono font-bold text-lg px-4 py-0.5 border border-gray-400 min-w-[100px] text-right">
                            {(totals.totalAmount || 2990).toFixed(2)}
                          </span>
                        </div>

                        {/* Tendered or Blinking Red Change */}
                        <div className="flex items-center justify-between">
                          {isLnqrTenderProcessed ? (
                            <span className="font-black text-sm text-red-600 bg-[#16A34A] px-1.5 py-0.5 tracking-wide animate-pulse">
                              Change
                            </span>
                          ) : (
                            <span className="font-bold text-sm">Tendered</span>
                          )}
                          <span className="bg-white text-gray-900 font-mono font-bold text-lg px-4 py-0.5 border border-gray-400 min-w-[100px] text-right">
                            {isLnqrTenderProcessed
                              ? Math.max(0, (parseFloat(lnqrCashTenderInput) || 3000) - (totals.totalAmount || 2990)).toFixed(2)
                              : "0.00"}
                          </span>
                        </div>
                      </div>

                      {/* Cash Payment Details Header */}
                      <div className="bg-[#67B8DE] text-gray-900 font-bold px-3 py-1.5 text-sm border-b border-gray-400 text-center tracking-wide">
                        {selectedTenderMethod === "CASH"
                          ? "Cash Payment Details"
                          : selectedTenderMethod === "BANK_CARD"
                          ? "Bank Card Payment Details"
                          : selectedTenderMethod === "CHECK"
                          ? "Check Payment Details"
                          : selectedTenderMethod === "GIFT_CERT"
                          ? "Gift Certificate Details"
                          : selectedTenderMethod === "COUPON"
                          ? "Coupon Details"
                          : selectedTenderMethod === "EPURSE"
                          ? "E-Purse Payment Details"
                          : "Credit Memo Details"}
                      </div>

                      {/* Cash Payment Details Body */}
                      <div className="flex-1 bg-[#ECE9D8] p-4 flex flex-col items-center justify-center overflow-y-auto">
                        {selectedTenderMethod === "CASH" ? (
                          !isLnqrTenderProcessed ? (
                            <form onSubmit={handleConfirmLnqrCashTender} className="w-full max-w-xs space-y-3 flex flex-col items-center">
                              <label className="text-xs font-bold text-gray-800 text-center font-sans">
                                Enter Amount:
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={lnqrCashTenderInput}
                                onChange={(e) => setLnqrCashTenderInput(e.target.value)}
                                placeholder="3000"
                                className="w-48 bg-white border-2 border-gray-600 px-3 py-1 text-center font-mono font-bold text-xl text-gray-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                            <div className="text-center space-y-4">
                              {loyaltyType === "LNQR" ? (
                                <>
                                  <div className="text-red-600 font-black text-base tracking-tight animate-pulse font-sans">
                                    Dont press any key.. Please wait...
                                  </div>
                                  <div className="text-gray-700 font-bold text-xs font-sans">
                                    Please wait connecting LNQR Server
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="text-green-800 font-black text-base tracking-tight font-sans">
                                    Payment Tendered Successfully!
                                  </div>
                                  <div className="text-gray-700 font-bold text-xs font-sans">
                                    Press [ Ok ] below to finalize and generate Official Receipt.
                                  </div>
                                </>
                              )}
                            </div>
                          )
                        ) : selectedTenderMethod === "BANK_CARD" ? (
                          !isLnqrTenderProcessed ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const amt = parseFloat(gcashAmount) || totals.totalAmount || 2990;
                                handleConfirmElectronicTender(cardSubtype, amt);
                              }}
                              className="w-full max-w-sm space-y-2 font-sans"
                            >
                              {/* Subtype Selector */}
                              <div className="grid grid-cols-4 gap-1 pb-1">
                                {[
                                  { id: "CREDIT_CARD", label: "Credit Card" },
                                  { id: "GCASH", label: "GCash" },
                                  { id: "NBS_GIFTCARD", label: "NBS Giftcard" },
                                  { id: "SULIT_COINS", label: "Sulit Coins" },
                                ].map((tab) => (
                                  <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setCardSubtype(tab.id as any)}
                                    className={`py-1 text-[10px] font-bold border ${
                                      cardSubtype === tab.id
                                        ? "bg-[#2E7D32] text-white border-green-800 shadow"
                                        : "bg-[#D4D0C8] text-gray-800 border-gray-400 hover:bg-[#E2E0DC]"
                                    }`}
                                  >
                                    {tab.label}
                                  </button>
                                ))}
                              </div>

                              {cardSubtype === "CREDIT_CARD" && (
                                <div className="space-y-1.5 text-xs text-gray-800">
                                  <div className="grid grid-cols-3 items-center">
                                    <span className="font-bold">Card Number:</span>
                                    <input
                                      type="text"
                                      value={creditCardNum}
                                      onChange={(e) => setCreditCardNum(e.target.value)}
                                      className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold"
                                    />
                                  </div>
                                  <div className="grid grid-cols-3 items-center">
                                    <span className="font-bold">Cardholder:</span>
                                    <input
                                      type="text"
                                      value={creditCardHolder}
                                      onChange={(e) => setCreditCardHolder(e.target.value)}
                                      className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 text-xs font-bold uppercase"
                                    />
                                  </div>
                                  <div className="grid grid-cols-3 items-center">
                                    <span className="font-bold">Terminal:</span>
                                    <select
                                      value={creditCardTerminal}
                                      onChange={(e) => setCreditCardTerminal(e.target.value)}
                                      className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 text-xs font-bold"
                                    >
                                      <option>-SELECT-</option>
                                      <option>TERMINAL 1</option>
                                      <option>TERMINAL 2</option>
                                      <option>BDO POS</option>
                                      <option>MAYA POS</option>
                                    </select>
                                  </div>
                                  <div className="grid grid-cols-3 items-center">
                                    <span className="font-bold">Auth Code:</span>
                                    <input
                                      type="text"
                                      value={creditCardAuth}
                                      onChange={(e) => setCreditCardAuth(e.target.value)}
                                      className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs"
                                    />
                                  </div>
                                  <div className="grid grid-cols-3 items-center">
                                    <span className="font-bold">Amount:</span>
                                    <input
                                      type="text"
                                      value={gcashAmount}
                                      onChange={(e) => setGcashAmount(e.target.value)}
                                      className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold text-blue-900"
                                    />
                                  </div>
                                </div>
                              )}

                              {cardSubtype === "GCASH" && (
                                <div className="space-y-1.5 text-xs text-gray-800">
                                  <div className="grid grid-cols-3 items-center">
                                    <span className="font-bold">GCash Ref No:</span>
                                    <input
                                      type="text"
                                      value={gcashRef}
                                      onChange={(e) => setGcashRef(e.target.value)}
                                      className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold"
                                    />
                                  </div>
                                  <div className="grid grid-cols-3 items-center">
                                    <span className="font-bold">Amount:</span>
                                    <input
                                      type="text"
                                      value={gcashAmount}
                                      onChange={(e) => setGcashAmount(e.target.value)}
                                      className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold text-blue-900"
                                    />
                                  </div>
                                </div>
                              )}

                              {cardSubtype === "NBS_GIFTCARD" && (
                                <div className="space-y-1.5 text-xs text-gray-800">
                                  <div className="grid grid-cols-3 items-center">
                                    <span className="font-bold">Gift Card No:</span>
                                    <input
                                      type="text"
                                      value={giftCardCode}
                                      onChange={(e) => setGiftCardCode(e.target.value)}
                                      className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold"
                                    />
                                  </div>
                                  <div className="grid grid-cols-3 items-center">
                                    <span className="font-bold">Amount:</span>
                                    <input
                                      type="text"
                                      value={giftCardAmount}
                                      onChange={(e) => setGiftCardAmount(e.target.value)}
                                      className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold text-blue-900"
                                    />
                                  </div>
                                </div>
                              )}

                              {cardSubtype === "SULIT_COINS" && (
                                <div className="space-y-1.5 text-xs text-gray-800">
                                  <div className="grid grid-cols-3 items-center">
                                    <span className="font-bold">LNQR Scan:</span>
                                    <input
                                      type="text"
                                      value={sulitCoinsQr}
                                      onChange={(e) => setSulitCoinsQr(e.target.value)}
                                      className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold"
                                    />
                                  </div>
                                  <div className="grid grid-cols-3 items-center">
                                    <span className="font-bold">Sulit Coins:</span>
                                    <input
                                      type="text"
                                      value={sulitCoinsAmount}
                                      onChange={(e) => setSulitCoinsAmount(e.target.value)}
                                      className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold text-blue-900"
                                    />
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-center pt-2">
                                <button
                                  type="submit"
                                  className="px-6 py-1.5 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow cursor-pointer"
                                >
                                  Process Payment (Enter)
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="text-center space-y-4">
                              <div className="text-green-800 font-black text-base tracking-tight font-sans">
                                Card Payment Tendered Successfully!
                              </div>
                              <div className="text-gray-700 font-bold text-xs font-sans">
                                Press [ Ok ] below to finalize and generate Official Receipt.
                              </div>
                            </div>
                          )
                        ) : selectedTenderMethod === "GIFT_CERT" ? (
                          !isLnqrTenderProcessed ? (
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
                          ) : (
                            <div className="text-center space-y-4">
                              <div className="text-green-800 font-black text-base tracking-tight font-sans">
                                Gift Cert Tendered Successfully!
                              </div>
                              <div className="text-gray-700 font-bold text-xs font-sans">
                                Press [ Ok ] below to finalize and generate Official Receipt.
                              </div>
                            </div>
                          )
                        ) : selectedTenderMethod === "COUPON" ? (
                          !isLnqrTenderProcessed ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleConfirmElectronicTender("Coupon", totals.totalAmount || 50);
                              }}
                              className="w-full max-w-xs space-y-1.5 text-xs font-sans text-gray-800"
                            >
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
                              <div className="grid grid-cols-3 items-center">
                                <span className="font-bold">Type:</span>
                                <select
                                  value={couponType}
                                  onChange={(e) => setCouponType(e.target.value)}
                                  className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 text-xs font-bold"
                                >
                                  <option>--PLEASE SELECT--</option>
                                  <option>Book Promo 50</option>
                                  <option>School Supplies 100</option>
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
                                <span className="font-bold">Denom:</span>
                                <input
                                  type="text"
                                  value={couponDenom}
                                  onChange={(e) => setCouponDenom(e.target.value)}
                                  className="col-span-2 bg-white border border-gray-500 px-2 py-0.5 font-mono text-xs font-bold"
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
                            <div className="text-center space-y-4">
                              <div className="text-green-800 font-black text-base tracking-tight font-sans">
                                Coupon Tendered Successfully!
                              </div>
                              <div className="text-gray-700 font-bold text-xs font-sans">
                                Press [ Ok ] below to finalize and generate Official Receipt.
                              </div>
                            </div>
                          )
                        ) : selectedTenderMethod === "CREDIT_MEMO" ? (
                          !isLnqrTenderProcessed ? (
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
                            <div className="text-center space-y-4">
                              <div className="text-green-800 font-black text-base tracking-tight font-sans">
                                Credit Memo Tendered Successfully!
                              </div>
                              <div className="text-gray-700 font-bold text-xs font-sans">
                                Press [ Ok ] below to finalize and generate Official Receipt.
                              </div>
                            </div>
                          )
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
                    </div>

                    {/* Far Right: Function Keys Column (Interactive) */}
                    <div className="col-span-2 bg-[#C2CAD0] flex flex-col p-1 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          dispatch({ type: "CLOSE_PAYMENT" });
                          setIsLnqrCashPaymentOpen(false);
                          setIsLnqrTenderProcessed(false);
                        }}
                        className="bg-[#D2D7DF] hover:bg-[#E2E6EC] border border-gray-400 text-center py-2 text-[11px] font-bold text-gray-700 cursor-pointer"
                      >
                        Help<br/><span className="text-[10px] text-gray-500">F1</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTenderMethod("CASH");
                          validateScenarioStep("PAY_CASH");
                        }}
                        className={`${
                          selectedTenderMethod === "CASH"
                            ? "bg-[#FFF275] border-2 border-yellow-500 text-gray-900 font-black shadow"
                            : "bg-[#D2D7DF] hover:bg-[#E2E6EC] border border-gray-400 text-gray-700 font-bold"
                        } text-center py-2 text-[11px] cursor-pointer`}
                      >
                        Cash<br/><span className="text-[10px] text-yellow-700">F2</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTenderMethod("BANK_CARD");
                          setElectronicPaymentType("Credit Card");
                          validateScenarioStep("PAY_CARD");
                        }}
                        className={`${
                          selectedTenderMethod === "BANK_CARD"
                            ? "bg-[#FFF275] border-2 border-yellow-500 text-gray-900 font-black shadow"
                            : "bg-[#D2D7DF] hover:bg-[#E2E6EC] border border-gray-400 text-gray-700 font-bold"
                        } text-center py-2 text-[11px] cursor-pointer`}
                      >
                        Bank Card<br/><span className="text-[10px] text-gray-500">F3</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTenderMethod("CHECK")}
                        className={`${
                          selectedTenderMethod === "CHECK"
                            ? "bg-[#FFF275] border-2 border-yellow-500 text-gray-900 font-black shadow"
                            : "bg-[#D2D7DF] hover:bg-[#E2E6EC] border border-gray-400 text-gray-700 font-bold"
                        } text-center py-2 text-[11px] cursor-pointer`}
                      >
                        Check<br/><span className="text-[10px] text-gray-500">F4</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTenderMethod("GIFT_CERT");
                          setElectronicPaymentType("Gift Certificate Series");
                          validateScenarioStep("PAY_GC");
                        }}
                        className={`${
                          selectedTenderMethod === "GIFT_CERT"
                            ? "bg-[#FFF275] border-2 border-yellow-500 text-gray-900 font-black shadow"
                            : "bg-[#D2D7DF] hover:bg-[#E2E6EC] border border-gray-400 text-gray-700 font-bold"
                        } text-center py-2 text-[11px] cursor-pointer`}
                      >
                        Gift Cert.<br/><span className="text-[10px] text-gray-500">F5</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTenderMethod("COUPON");
                          setElectronicPaymentType("Promo Coupon");
                          validateScenarioStep("PAY_COUPON");
                        }}
                        className={`${
                          selectedTenderMethod === "COUPON"
                            ? "bg-[#FFF275] border-2 border-yellow-500 text-gray-900 font-black shadow"
                            : "bg-[#D2D7DF] hover:bg-[#E2E6EC] border border-gray-400 text-gray-700 font-bold"
                        } text-center py-2 text-[11px] cursor-pointer`}
                      >
                        Coupon<br/><span className="text-[10px] text-gray-500">F6</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTenderMethod("EPURSE");
                          setElectronicPaymentType("GCash / QR PH");
                        }}
                        className={`${
                          selectedTenderMethod === "EPURSE"
                            ? "bg-[#FFF275] border-2 border-yellow-500 text-gray-900 font-black shadow"
                            : "bg-[#D2D7DF] hover:bg-[#E2E6EC] border border-gray-400 text-gray-700 font-bold"
                        } text-center py-2 text-[11px] cursor-pointer`}
                      >
                        E-Purse<br/><span className="text-[10px] text-gray-500">F7</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTenderMethod("CREDIT_MEMO");
                          setElectronicPaymentType("Debit Card / BancNet");
                          validateScenarioStep("PAY_CREDIT_MEMO");
                        }}
                        className={`${
                          selectedTenderMethod === "CREDIT_MEMO"
                            ? "bg-[#FFF275] border-2 border-yellow-500 text-gray-900 font-black shadow"
                            : "bg-[#D2D7DF] hover:bg-[#E2E6EC] border border-gray-400 text-gray-700 font-bold"
                        } text-center py-2 text-[11px] cursor-pointer`}
                      >
                        Credit Memo<br/><span className="text-[10px] text-gray-500">F8</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Footer Bar */}
                  <div className="grid grid-cols-12 border-t-2 border-gray-400 h-8 font-sans select-none items-stretch">
                    {/* Left 5 cols */}
                    <div className="col-span-5 bg-[#9AA5B1] border-r-2 border-gray-400" />

                    {/* Center 5 cols */}
                    <div className="col-span-5 bg-[#16A34A] border-r-2 border-gray-400 flex items-center justify-center px-2">
                      <button
                        type="button"
                        onClick={handlePaymentOkClick}
                        className="min-w-[95px] h-[22px] px-5 bg-[#C6C9DB] hover:bg-[#D4D6E6] active:bg-[#B4B7CB] border-2 border-t-white border-l-white border-r-[#B05090] border-b-[#B05090] outline outline-1 outline-[#D870B0] flex items-center justify-center font-bold text-xs text-[#0000CD] shadow-sm cursor-pointer"
                      >
                        Ok
                      </button>
                    </div>

                    {/* Right 2 cols */}
                    <div className="col-span-2 bg-[#16A34A] flex items-center justify-center px-1 text-gray-900 font-bold font-mono text-[11px] tracking-tight">
                      {fmtTime(now)}
                    </div>
                  </div>
                </div>
              ) : (
                <>
            {/* MAIN WORKING AREA */}
            <div className="flex-1 grid grid-cols-12 min-h-[500px] bg-white">
            
            <div className="col-span-10 flex flex-col border-r-2 border-gray-400">
              
              <div className="grid grid-cols-12 border-b-2 border-gray-400">
                
                <div className="col-span-6 border-r-2 border-gray-400 flex flex-col justify-between">

                  <div className="bg-[#FFF275] p-2 flex flex-col justify-center flex-1">
                    <div className="text-center font-bold text-xs text-gray-900 tracking-wide mb-1 font-sans">
                      {isVoidSkuMode ? "Void SKU" : isRefundSkuMode ? "Enter Refund UPC" : "Scan or Enter UPC"}
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
              <div className="bg-[#B8C2CC] border-b border-gray-400 px-2 py-1 text-[11px] font-bold text-gray-800 grid grid-cols-12 text-center uppercase tracking-tight">
                <span className="col-span-1 text-left">LN</span>
                <span className="col-span-3 text-left">UPC</span>
                <span className="col-span-4 text-left">Description</span>
                <span className="col-span-1">Qty</span>
                <span className="col-span-1 text-right">SRP</span>
                <span className="col-span-1 text-right">Amount</span>
                <span className="col-span-1 text-right">Type</span>
              </div>

              {/* LINE ITEM SCREEN PAGE */}
              <div className="flex-1 bg-white overflow-y-auto p-1 font-mono text-xs divide-y divide-gray-100 min-h-[300px]">
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
                        className={`grid grid-cols-12 py-1 px-1 items-center text-[11px] font-mono ${
                          isVoidLine ? "text-red-600 font-bold bg-red-50" : "text-gray-900"
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
            <div className="col-span-2 bg-[#9AA5B1] p-1 flex flex-col justify-between border-l border-gray-400 space-y-1">
              {rightKeys.map((kDef) => {
                const isRed = kDef.variant === "red";
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
          <div className="bg-[#B0B8C0] border-t-2 border-gray-500 grid grid-cols-12 text-xs font-sans items-stretch">
            
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
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      {isLogoutModalOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={handleCancelLogout}
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
                    onClick={handleConfirmLogout}
                    className={`min-w-[80px] px-5 py-1.5 text-xs font-bold font-sans transition-all border-2 ${
                      selectedLogoutButton === "YES"
                        ? "bg-[#D4D0C8] border-red-600 ring-2 ring-red-500 shadow-inner text-black font-extrabold"
                        : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 hover:bg-[#E2E0DC]"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelLogout}
                    className={`min-w-[80px] px-5 py-1.5 text-xs font-bold font-sans transition-all border-2 ${
                      selectedLogoutButton === "NO"
                        ? "bg-[#D4D0C8] border-red-600 ring-2 ring-red-500 shadow-inner text-black font-extrabold"
                        : "bg-[#D4D0C8] border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-gray-800 hover:bg-[#E2E0DC]"
                    }`}
                  >
                    No
                  </button>
                </div>

                <div className="text-center text-[11px] text-gray-500 font-mono">
                  Press <kbd className="bg-white px-1 border text-gray-800 font-bold">TAB</kbd> to toggle, <kbd className="bg-white px-1 border text-gray-800 font-bold">ENTER</kbd> to confirm
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CHOOSE OPTION MODAL */}
      {isLoyaltyOptionOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsLoyaltyOptionOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
            <div className="w-[360px] bg-[#D4D0C8] border-4 border-[#228B22] shadow-2xl font-sans pointer-events-auto">
              {/* Green Header */}
              <div className="bg-[#228B22] text-white py-1.5 px-3 text-center font-bold text-sm uppercase tracking-wide">
                Choose Option
              </div>

              {/* Gray Content Body */}
              <div className="p-6 bg-[#B0B8C0] space-y-3">
                <button
                  type="button"
                  onClick={() => handleSelectLoyalty(1)}
                  className={`w-full text-left px-4 py-2.5 font-bold text-sm border shadow-sm transition-all cursor-pointer ${
                    selectedLoyaltyOption === 1
                      ? "bg-white text-gray-900 border-2 border-red-500 ring-2 ring-red-400 font-extrabold"
                      : "bg-white/80 hover:bg-white text-gray-900 border-gray-400"
                  }`}
                >
                  1. None
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectLoyalty(2)}
                  className={`w-full text-left px-4 py-2.5 font-bold text-sm border shadow-sm transition-all cursor-pointer ${
                    selectedLoyaltyOption === 2
                      ? "bg-white text-gray-900 border-2 border-red-500 ring-2 ring-red-400 font-extrabold"
                      : "bg-white/80 hover:bg-white text-gray-900 border-gray-400"
                  }`}
                >
                  2. Laking National Card
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectLoyalty(3)}
                  className={`w-full text-left px-4 py-2.5 font-bold text-sm border shadow-sm transition-all cursor-pointer ${
                    selectedLoyaltyOption === 3
                      ? "bg-white text-gray-900 border-2 border-red-500 ring-2 ring-red-400 font-extrabold"
                      : "bg-white/80 hover:bg-white text-gray-900 border-gray-400"
                  }`}
                >
                  3. LNQR / LNQR PLUS
                </button>

                <div className="text-center text-xs font-mono text-gray-700 pt-2">
                  Press key <kbd className="bg-white px-1.5 py-0.5 border border-gray-400 font-bold">1</kbd>, <kbd className="bg-white px-1.5 py-0.5 border border-gray-400 font-bold">2</kbd>, or <kbd className="bg-white px-1.5 py-0.5 border border-gray-400 font-bold">3</kbd> on your keyboard
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* LNQR HAS BEEN UPDATED MODAL */}
      {isLnqrUpdatedModalOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={handleConfirmLnqrUpdated}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none pointer-events-none">
            <div className="w-[380px] bg-[#D6D3CE] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-2xl font-sans pointer-events-auto">
              {/* Window Title Bar */}
              <div className="bg-gradient-to-r from-[#1C4158] to-[#2E5874] text-white px-2 py-1 flex items-center justify-between text-xs font-semibold select-none">
                <div className="flex items-center space-x-1 truncate">
                  <span className="text-[10px] leading-none">{'\u2022'}</span>
                  <span className="text-[11px] truncate tracking-wide text-gray-100">
                    The page at http://localhost says:
                  </span>
                </div>
                <div className="flex items-center space-x-0.5">
                  <div className="w-3.5 h-3.5 bg-[#4A6475] border border-[#7A93A4] flex items-center justify-center text-[9px] text-gray-200">_</div>
                  <div className="w-3.5 h-3.5 bg-[#4A6475] border border-[#7A93A4] flex items-center justify-center text-[9px] text-gray-200">
                    <div className="w-2 h-2 border border-gray-200" />
                  </div>
                  <button
                    type="button"
                    onClick={handleConfirmLnqrUpdated}
                    className="w-3.5 h-3.5 bg-[#4A6475] hover:bg-red-700 border border-[#7A93A4] flex items-center justify-center text-[10px] text-gray-200 leading-none cursor-pointer"
                  >
                    {'\u2715'}
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
                    <div className="font-bold text-sm text-gray-900 mb-1">LNQR has been updated!</div>
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
                    onClick={handleConfirmLnqrUpdated}
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
      )}

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
            setIsItemVoidModalOpen(false);
            setIsVoidSkuMode(true);
            validateScenarioStep("CONFIRM_ITEM_VOID", reason);
          }}
          onCancel={() => setIsItemVoidModalOpen(false)}
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

      {/* F3 TRANSACTION COMMENT (TIN / CORPORATE BILLING) MODAL */}
      {isTrxCommentOpen && (
        <TransactionCommentModal
          initialComments={state.transactionComments || undefined}
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
            validateScenarioStep("CONFIRM_TENDER", data.amount);
          }}
          onCancel={() => setIsElectronicPaymentOpen(false)}
        />
      )}


      {/* F2 POST VOID MODAL (3rd Page F2) */}
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

      {/* F3 PRICE CHANGE MODAL (2nd Page F3) */}
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

      {/* F2 BEST BUY / BONUS BUY PROMO MODAL (4th Page F2) */}
      {isBestBuyOpen && (
        <BestBuyModal
          onConfirm={(promo) => {
            dispatch({
              type: "APPLY_BEST_BUY",
              promoName: promo.promoName,
              promoSku: promo.promoSku,
              promoPrice: promo.promoPrice,
            });
            setIsBestBuyOpen(false);
            validateScenarioStep("CONFIRM_BEST_BUY", promo.promoSku);
          }}
          onCancel={() => setIsBestBuyOpen(false)}
        />
      )}

      {/* CONGRATULATIONS PRACTICE COMPLETE POPUP */}
      {isExamCompleted && activeScenario && (
        <>
          <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200 pointer-events-none">
            <div className="bg-[#D4D0C8] border-4 border-[#228B22] shadow-2xl max-w-md w-full overflow-hidden font-sans pointer-events-auto">
              {/* Retro Green Header */}
              <div className="bg-[#228B22] text-white px-4 py-2 font-bold text-sm flex items-center justify-between uppercase tracking-wide">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-yellow-300" />
                  <span>PRACTICE COMPLETED!</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-5 text-gray-900">
                {/* Badge & Title */}
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">
                      Congratulations!
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5 font-medium">
                      You successfully finished all steps for:
                    </p>
                    <div className="text-xs font-bold text-[#E4002B] mt-1 bg-white border border-gray-400 py-1 px-2 shadow-inner font-mono">
                      {activeScenario.title}
                    </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="bg-white border-2 border-gray-400 p-3 grid grid-cols-3 gap-2 text-center text-xs font-mono shadow-inner">
                  <div className="border-r border-gray-300 pr-1">
                    <div className="text-gray-500 text-[10px] uppercase font-bold">Steps</div>
                    <div className="font-extrabold text-sm text-gray-900">
                      {activeScenario.steps.length}/{activeScenario.steps.length}
                    </div>
                  </div>
                  <div className="border-r border-gray-300 pr-1">
                    <div className="text-gray-500 text-[10px] uppercase font-bold">Mistakes</div>
                    <div className={"font-extrabold text-sm " + (mistakes.length === 0 ? "text-emerald-600" : "text-amber-600")}>
                      {mistakes.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-[10px] uppercase font-bold">Score</div>
                    <div className="font-extrabold text-sm text-emerald-600">
                      {Math.max(0, 100 - mistakes.length * 10)}%
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleResetExam}
                    className="flex-1 px-4 py-2 bg-[#D4D0C8] hover:bg-[#E2E0DC] active:bg-[#BDB8AF] text-xs font-bold text-gray-900 border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow flex items-center justify-center space-x-1.5 cursor-pointer font-sans"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Practice Again</span>
                  </button>

                  {(() => {
                    const finalScore = Math.max(0, 100 - mistakes.length * 10);
                    const modalReturnUrl = isLessonSpecific
                      ? `${returnLessonUrl}?fromPractice=true&score=${finalScore}`
                      : returnLessonUrl;

                    return (
                      <Link
                        href={modalReturnUrl}
                        className="flex-1"
                      >
                        <button
                          type="button"
                          className="w-full px-4 py-2 bg-[#E4002B] hover:bg-[#C10024] active:bg-[#9B001D] text-xs font-bold text-white border-2 border-red-800 shadow flex items-center justify-center space-x-1.5 cursor-pointer font-sans"
                        >
                          <span>{returnButtonLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </>
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




