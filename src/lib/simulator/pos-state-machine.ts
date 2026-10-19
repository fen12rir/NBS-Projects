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
    lastMessage: {
      type: "info",
      text: "Terminal Ready. Scan item or press F2 for Lookup, F3 for Quantity.",
    },
  };
}

export function calculateTotals(items: POSLineItem[]) {
  const activeItems = items.filter((item) => !item.isVoided);
  const totalAmount = activeItems.reduce((acc, item) => acc + item.total, 0);
  const totalQty = activeItems.reduce((acc, item) => acc + item.quantity, 0);
  return {
    subtotal: totalAmount,
    totalAmount,
    totalQty,
    itemCount: activeItems.length,
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
  | { type: "RECALL_TRANSACTION" }
  | { type: "TRIGGER_READING"; readingType: "Y" | "Z" }
  | { type: "RUN_SDV_CHECK" }
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
      const totals = calculateTotals(state.lineItems);
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
      const totals = calculateTotals(state.lineItems);
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

    case "CONFIRM_MANAGER_OVERRIDE":
      return {
        ...state,
        managerOverrideOpen: false,
        managerOverrideTarget: null,
        lastMessage: {
          type: "success",
          text: "Manager Override approved (Training Mode Authorization).",
        },
      };

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
      const updated = state.lineItems.map((item) =>
        item.id === action.itemId ? { ...item, isVoided: true } : item
      );
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
      return {
        ...state,
        isSuspended: true,
        lastMessage: {
          type: "info",
          text: "Transaction suspended. You may recall it on the 2nd Page (F7 Recall).",
        },
      };
    }

    case "RECALL_TRANSACTION": {
      return {
        ...state,
        isSuspended: false,
        lastMessage: {
          type: "success",
          text: "Suspended transaction successfully recalled to active terminal.",
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

    case "RESET_TRANSACTION":
      return createInitialPOSState(state.cashierName);

    default:
      return state;
  }
}
