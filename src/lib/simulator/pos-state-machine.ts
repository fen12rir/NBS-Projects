import { POSPage } from "@/data/function-keys";
import { SyntheticProduct, SYNTHETIC_PRODUCTS } from "@/data/products";

export interface POSLineItem {
  id: string;
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  isVoided: boolean;
}

export interface POSTransactionState {
  currentPage: POSPage;
  transactionNumber: string;
  terminalId: string;
  branchCode: string;
  cashierName: string;
  dateStr: string;
  timeStr: string;
  lineItems: POSLineItem[];
  pendingQuantity: number;
  isQuantityInputActive: boolean;
  activeLookupOpen: boolean;
  lookupSearchTerm: string;
  lookupResults: SyntheticProduct[];
  managerOverrideOpen: boolean;
  managerOverrideTarget: string | null;
  paymentDialogOpen: boolean;
  selectedPaymentMethod: string | null;
  tenderAmount: number;
  changeDue: number;
  isTransactionCompleted: boolean;
  isSuspended: boolean;
  appliedDiscount: { name: string; percent: number } | null;
  isZeroRated: boolean;
  transactionComments: { customerName: string; address: string; tin: string; remarks?: string } | null;
  suspendedTransactions: { id: string; trxNumber: string; items: POSLineItem[]; timeStr: string; total: number }[];
  lastMessage: {
    type: "info" | "success" | "error" | "warning";
    text: string;
  };
}

export function createInitialPOSState(cashierName: string = "Maria Santos (Trainee)"): POSTransactionState {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour12: false });
  const randomTrx = "TRX-" + Math.floor(100000 + Math.random() * 900000);

  return {
    currentPage: "MAIN",
    transactionNumber: randomTrx,
    terminalId: "TERM-02",
    branchCode: "BR-014",
    cashierName,
    dateStr,
    timeStr,
    lineItems: [],
    pendingQuantity: 1,
    isQuantityInputActive: false,
    activeLookupOpen: false,
    lookupSearchTerm: "",
    lookupResults: [],
    managerOverrideOpen: false,
    managerOverrideTarget: null,
    paymentDialogOpen: false,
    selectedPaymentMethod: null,
    tenderAmount: 0,
    changeDue: 0,
    isTransactionCompleted: false,
    isSuspended: false,
    appliedDiscount: null,
    isZeroRated: false,
    transactionComments: null,
    suspendedTransactions: [],
    lastMessage: {
      type: "info",
      text: "Terminal Ready. Scan item or press F2 for Lookup, F3 for Quantity.",
    },
  };
}

export function calculateTotals(items: POSLineItem[], discountPercent: number = 0, isZeroRated: boolean = false) {
  const activeItems = items.filter((item) => !item.isVoided);
  const rawTotal = activeItems.reduce((acc, item) => acc + item.total, 0);
  const totalQty = activeItems.reduce((acc, item) => acc + item.quantity, 0);

  const baseTotal = isZeroRated ? rawTotal / 1.12 : rawTotal;
  const discountAmount = discountPercent > 0 ? (baseTotal * discountPercent) / 100 : 0;
  const totalAmount = Math.max(0, baseTotal - discountAmount);

  return {
    subtotal: rawTotal,
    discountAmount,
    totalAmount,
    totalQty,
    itemCount: activeItems.length,
    isZeroRated,
  };
}

export type POSAction =
  | { type: "NAVIGATE_PAGE"; page: POSPage }
  | { type: "SET_QUANTITY_START" }
  | { type: "SET_QUANTITY_CONFIRM"; quantity: number }
  | { type: "SET_QUANTITY_CANCEL" }
  | { type: "ADD_ITEM_BY_CODE"; code: string }
  | { type: "OPEN_LOOKUP" }
  | { type: "CLOSE_LOOKUP" }
  | { type: "SEARCH_LOOKUP"; term: string }
  | { type: "OPEN_PAYMENT" }
  | { type: "SELECT_PAYMENT_METHOD"; method: string }
  | { type: "TENDER_PAYMENT"; amount: number }
  | { type: "CLOSE_PAYMENT" }
  | { type: "REQUEST_MANAGER_OVERRIDE"; targetAction: string }
  | { type: "CONFIRM_MANAGER_OVERRIDE" }
  | { type: "CANCEL_MANAGER_OVERRIDE" }
  | { type: "VOID_ITEM"; itemId: string }
  | { type: "VOID_TRANSACTION" }
  | { type: "SUSPEND_TRANSACTION" }
  | { type: "RECALL_TRANSACTION"; transactionId?: string }
  | { type: "TRIGGER_READING"; readingType: "Y" | "Z" }
  | { type: "RUN_SDV_CHECK" }
  | { type: "APPLY_DISCOUNT"; discount: { name: string; percent: number } }
  | { type: "SET_ZERO_RATED"; isZeroRated: boolean }
  | { type: "SET_TRANSACTION_COMMENTS"; comments: { customerName: string; address: string; tin: string; remarks?: string } }
  | { type: "PROCESS_RETURN_ITEM"; sku: string; reason: string; siNumber: string }
  | { type: "PROCESS_REFUND"; orNumber: string; reason: string }
  | { type: "CHANGE_ITEM_PRICE"; itemId: string; newPrice: number; reason: string }
  | { type: "ADD_NON_MDSE_ITEM"; description: string; amount: number; referenceNo: string }
  | { type: "POST_VOID_TRANSACTION"; orNumber: string; reason: string }
  | { type: "APPLY_BEST_BUY"; promoName: string; promoSku: string; promoPrice: number }
  | { type: "RESET_TRANSACTION" };

export function posReducer(state: POSTransactionState, action: POSAction): POSTransactionState {
  switch (action.type) {
    case "NAVIGATE_PAGE":
      return {
        ...state,
        currentPage: action.page,
        lastMessage: {
          type: "info",
          text: `Navigated to ${action.page} screen.`,
        },
      };

    case "SET_QUANTITY_START":
      return {
        ...state,
        isQuantityInputActive: true,
        lastMessage: {
          type: "info",
          text: "Enter quantity multiplier then press ENTER.",
        },
      };

    case "SET_QUANTITY_CONFIRM":
      return {
        ...state,
        pendingQuantity: Math.max(1, action.quantity),
        isQuantityInputActive: false,
        lastMessage: {
          type: "success",
          text: `Quantity set to ${action.quantity}. Scan next item.`,
        },
      };

    case "SET_QUANTITY_CANCEL":
      return {
        ...state,
        isQuantityInputActive: false,
      };

    case "ADD_ITEM_BY_CODE": {
      const cleanCode = action.code.trim().toUpperCase();
      const product = SYNTHETIC_PRODUCTS.find(
        (p) => p.sku.toUpperCase() === cleanCode || p.barcode === cleanCode
      );

      if (!product) {
        return {
          ...state,
          lastMessage: {
            type: "error",
            text: `Item code "${action.code}" not found in synthetic catalog.`,
          },
        };
      }

      const qty = state.pendingQuantity || 1;
      const unitPrice = product.promoPrice ?? product.srp;
      const total = unitPrice * qty;

      const newItem: POSLineItem = {
        id: "line-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
        sku: product.sku,
        description: product.description,
        quantity: qty,
        unitPrice,
        total,
        isVoided: false,
      };

      return {
        ...state,
        lineItems: [...state.lineItems, newItem],
        pendingQuantity: 1, // reset quantity after scanning
        activeLookupOpen: false,
        lastMessage: {
          type: "success",
          text: `Added ${qty}x ${product.description}`,
        },
      };
    }

    case "OPEN_LOOKUP":
      return {
        ...state,
        currentPage: "LOOKUP",
        activeLookupOpen: true,
        lookupSearchTerm: "",
        lookupResults: SYNTHETIC_PRODUCTS,
        lastMessage: {
          type: "info",
          text: "Item Lookup screen active. Search by SKU, Description, or Author.",
        },
      };

    case "CLOSE_LOOKUP":
      return {
        ...state,
        currentPage: "MAIN",
        activeLookupOpen: false,
      };

    case "SEARCH_LOOKUP": {
      const term = action.term.toLowerCase();
      const results = SYNTHETIC_PRODUCTS.filter(
        (p) =>
          p.sku.toLowerCase().includes(term) ||
          p.barcode.includes(term) ||
          p.description.toLowerCase().includes(term)
      );
      return {
        ...state,
        lookupSearchTerm: action.term,
        lookupResults: results,
      };
    }

    case "OPEN_PAYMENT": {
      const totals = calculateTotals(state.lineItems, state.appliedDiscount?.percent || 0, state.isZeroRated);
      if (totals.totalAmount <= 0) {
        return {
          ...state,
          lastMessage: {
            type: "error",
            text: "Cannot proceed to payment: Transaction has no balance due.",
          },
        };
      }
      return {
        ...state,
        currentPage: "PAYMENT",
        paymentDialogOpen: true,
        selectedPaymentMethod: null,
        lastMessage: {
          type: "info",
          text: "Select payment method (F2 Cash, F3 Card/GCash, F5 Gift Cert, etc).",
        },
      };
    }

    case "SELECT_PAYMENT_METHOD":
      return {
        ...state,
        selectedPaymentMethod: action.method,
        lastMessage: {
          type: "info",
          text: `Selected tender method: ${action.method}. Enter amount.`,
        },
      };

    case "TENDER_PAYMENT": {
      const totals = calculateTotals(state.lineItems, state.appliedDiscount?.percent || 0, state.isZeroRated);
      const amount = action.amount;
      if (amount < totals.totalAmount) {
        return {
          ...state,
          lastMessage: {
            type: "error",
            text: `Insufficient amount: Tendered ₱${amount.toFixed(2)} is less than total ₱${totals.totalAmount.toFixed(2)}.`,
          },
        };
      }
      const changeDue = amount - totals.totalAmount;
      return {
        ...state,
        tenderAmount: amount,
        changeDue,
        isTransactionCompleted: true,
        paymentDialogOpen: false,
        lastMessage: {
          type: "success",
          text: `Payment accepted! Change due: ₱${changeDue.toFixed(2)}. Simulated Official Receipt printed.`,
        },
      };
    }

    case "CLOSE_PAYMENT":
      return {
        ...state,
        currentPage: "MAIN",
        paymentDialogOpen: false,
      };

    case "REQUEST_MANAGER_OVERRIDE":
      return {
        ...state,
        managerOverrideOpen: true,
        managerOverrideTarget: action.targetAction,
        lastMessage: {
          type: "warning",
          text: `Manager Override required for "${action.targetAction}". (Training Simulator: Enter any training password)`,
        },
      };

    case "CONFIRM_MANAGER_OVERRIDE": {
      let updatedLineItems = state.lineItems;
      let lastMsg = "Manager Override approved (Training Mode Authorization).";

      if (state.managerOverrideTarget === "Item Void") {
        const lastActiveIndex = state.lineItems.map((i) => !i.isVoided).lastIndexOf(true);
        if (lastActiveIndex >= 0) {
          updatedLineItems = state.lineItems.map((item, idx) =>
            idx === lastActiveIndex ? { ...item, isVoided: true } : item
          );
          lastMsg = "Item voided by Manager Override.";
        }
      } else if (state.managerOverrideTarget === "Transaction Void") {
        updatedLineItems = [];
        lastMsg = "Entire transaction voided by Manager Override.";
      }

      return {
        ...state,
        managerOverrideOpen: false,
        managerOverrideTarget: null,
        lineItems: updatedLineItems,
        lastMessage: {
          type: "success",
          text: lastMsg,
        },
      };
    }

    case "CANCEL_MANAGER_OVERRIDE":
      return {
        ...state,
        managerOverrideOpen: false,
        managerOverrideTarget: null,
        lastMessage: {
          type: "info",
          text: "Manager override cancelled.",
        },
      };

    case "VOID_ITEM": {
      const matchIndex = state.lineItems
        .map((i) => !i.isVoided && (i.id === action.itemId || i.sku.toUpperCase() === action.itemId.toUpperCase()))
        .lastIndexOf(true);
      const updated = matchIndex >= 0
        ? state.lineItems.map((item, idx) => (idx === matchIndex ? { ...item, isVoided: true } : item))
        : state.lineItems.map((item) => (item.id === action.itemId ? { ...item, isVoided: true } : item));
      return {
        ...state,
        lineItems: updated,
        lastMessage: {
          type: "warning",
          text: "Item voided. Marked with negative indicator in audit log.",
        },
      };
    }

    case "VOID_TRANSACTION": {
      return {
        ...state,
        lineItems: [],
        lastMessage: {
          type: "warning",
          text: "Entire transaction voided by manager authorization.",
        },
      };
    }

    case "SUSPEND_TRANSACTION": {
      const activeLines = state.lineItems.filter((i) => !i.isVoided);
      const totals = calculateTotals(state.lineItems, state.appliedDiscount?.percent || 0, state.isZeroRated);
      const newSuspended = {
        id: "susp-" + Date.now(),
        trxNumber: state.transactionNumber,
        items: [...state.lineItems],
        timeStr: state.timeStr,
        total: totals.totalAmount,
      };

      return {
        ...state,
        isSuspended: true,
        lineItems: [],
        suspendedTransactions: [...state.suspendedTransactions, newSuspended],
        lastMessage: {
          type: "info",
          text: `Transaction ${state.transactionNumber} suspended (${activeLines.length} items, ₱${totals.totalAmount.toFixed(2)}). You may recall it on the 2nd Page (F7 Recall).`,
        },
      };
    }

    case "RECALL_TRANSACTION": {
      if (state.suspendedTransactions.length === 0) {
        return {
          ...state,
          lastMessage: {
            type: "warning",
            text: "No suspended transactions found in holding buffer.",
          },
        };
      }

      const targetSusp = action.transactionId
        ? state.suspendedTransactions.find((s) => s.id === action.transactionId) || state.suspendedTransactions[state.suspendedTransactions.length - 1]
        : state.suspendedTransactions[state.suspendedTransactions.length - 1];

      return {
        ...state,
        isSuspended: false,
        lineItems: targetSusp.items,
        suspendedTransactions: state.suspendedTransactions.filter((s) => s.id !== targetSusp.id),
        lastMessage: {
          type: "success",
          text: `Suspended transaction ${targetSusp.trxNumber} successfully recalled to active terminal.`,
        },
      };
    }

    case "APPLY_DISCOUNT": {
      return {
        ...state,
        appliedDiscount: action.discount,
        lastMessage: {
          type: "success",
          text: `Applied ${action.discount.name} (${action.discount.percent}% discount).`,
        },
      };
    }

    case "SET_ZERO_RATED": {
      return {
        ...state,
        isZeroRated: action.isZeroRated,
        lastMessage: {
          type: "success",
          text: action.isZeroRated
            ? "VAT Zero-Rating enabled. 12% VAT exemption applied to vatable items."
            : "VAT Zero-Rating disabled. Regular retail VAT applied.",
        },
      };
    }

    case "SET_TRANSACTION_COMMENTS": {
      return {
        ...state,
        transactionComments: action.comments,
        lastMessage: {
          type: "success",
          text: `Corporate comments recorded for ${action.comments.customerName} (TIN: ${action.comments.tin}).`,
        },
      };
    }

    case "PROCESS_RETURN_ITEM": {
      const cleanSku = action.sku.trim().toUpperCase();
      const product = SYNTHETIC_PRODUCTS.find(
        (p) => p.sku.toUpperCase() === cleanSku || p.barcode === cleanSku
      );

      const price = product ? (product.promoPrice ?? product.srp) : 100;
      const desc = product ? product.description : `Returned Item (${cleanSku})`;

      const returnItem: POSLineItem = {
        id: "ret-" + Date.now(),
        sku: cleanSku,
        description: `[RETURN: ${action.reason}] ${desc}`,
        quantity: -1,
        unitPrice: price,
        total: -price,
        isVoided: false,
      };

      return {
        ...state,
        lineItems: [...state.lineItems, returnItem],
        lastMessage: {
          type: "warning",
          text: `Processed Return/Exchange for SI ${action.siNumber}: Credit ₱${price.toFixed(2)} for ${desc}.`,
        },
      };
    }

    case "PROCESS_REFUND": {
      return {
        ...state,
        lineItems: [],
        lastMessage: {
          type: "success",
          text: `Authorized cash refund for OR ${action.orNumber} (${action.reason}). Transaction closed.`,
        },
      };
    }

    case "TRIGGER_READING": {
      return {
        ...state,
        lastMessage: {
          type: "info",
          text: `Generated training ${action.readingType}-Reading summary. Accounting tally balanced.`,
        },
      };
    }

    case "RUN_SDV_CHECK": {
      return {
        ...state,
        lastMessage: {
          type: "success",
          text: "Sales Data Verification (SDV): Header, Detail, and PayDetail counts are TALLY.",
        },
      };
    }

    case "CHANGE_ITEM_PRICE": {
      const updatedLineItems = state.lineItems.map((item) =>
        item.id === action.itemId
          ? { ...item, unitPrice: action.newPrice, total: action.newPrice * item.quantity }
          : item
      );
      return {
        ...state,
        lineItems: updatedLineItems,
        lastMessage: {
          type: "success",
          text: `Price changed to ${action.newPrice.toFixed(2)} PHP (${action.reason}).`,
        },
      };
    }

    case "ADD_NON_MDSE_ITEM": {
      const nonMdseItem: POSLineItem = {
        id: `NMDSE-${Date.now()}`,
        sku: `VAR-${action.referenceNo || "001"}`,
        description: `NON-MDSE: ${action.description}`,
        quantity: 1,
        unitPrice: action.amount,
        total: action.amount,
        isVoided: false,
      };
      return {
        ...state,
        lineItems: [...state.lineItems, nonMdseItem],
        lastMessage: {
          type: "info",
          text: `Added Non-Merchandise line: ${action.description} (${action.amount.toFixed(2)} PHP).`,
        },
      };
    }

    case "POST_VOID_TRANSACTION": {
      return {
        ...state,
        lastMessage: {
          type: "success",
          text: `Transaction ${action.orNumber} has been Post-Voided (${action.reason}).`,
        },
      };
    }

    case "APPLY_BEST_BUY": {
      const bestBuyItem: POSLineItem = {
        id: `BB-${Date.now()}`,
        sku: action.promoSku,
        description: `BEST BUY: ${action.promoName}`,
        quantity: 1,
        unitPrice: action.promoPrice,
        total: action.promoPrice,
        isVoided: false,
      };
      return {
        ...state,
        lineItems: [...state.lineItems, bestBuyItem],
        lastMessage: {
          type: "success",
          text: `Best Buy promo applied: ${action.promoName} (${action.promoPrice.toFixed(2)} PHP).`,
        },
      };
    }

    case "RESET_TRANSACTION":
      return createInitialPOSState(state.cashierName);

    default:
      return state;
  }
}
