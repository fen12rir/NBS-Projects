export type POSPage = "MAIN" | "SECOND" | "THIRD" | "FOURTH" | "PAYMENT";

export interface FunctionKeyDef {
  key: string;       // e.g. "F2", "F3", "F11"
  label: string;     // e.g. "LOOKUP", "QUANTITY"
  subtext?: string;
  actionId: string;
  disabled?: boolean;
  requiresOverride?: boolean;
  deckPageRef?: string;
}

export const POS_FUNCTION_KEYS: Record<POSPage, FunctionKeyDef[]> = {
  MAIN: [
    { key: "F2", label: "LOOKUP", subtext: "Item Inquiry", actionId: "LOOKUP", deckPageRef: "Slides 17-18, 28" },
    { key: "F3", label: "QUANTITY", subtext: "Set count", actionId: "SET_QTY", deckPageRef: "Slides 27, 29-30" },
    { key: "F4", label: "PAYMENT", subtext: "Proceed to pay", actionId: "GO_PAYMENT", deckPageRef: "Slides 27, 102" },
    { key: "F5", label: "OPTION", subtext: "2nd Page", actionId: "NAV_SECOND", deckPageRef: "Slides 27, 43" },
    { key: "F6", label: "NON MDSE", subtext: "Variance entry", actionId: "NON_MDSE", deckPageRef: "Slides 27, 32" },
    { key: "F7", label: "ITEM VOID", subtext: "Void item line", actionId: "ITEM_VOID", requiresOverride: true, deckPageRef: "Slides 27, 35-38" },
    { key: "F8", label: "TRX VOID", subtext: "Void entire trx", actionId: "TRX_VOID", requiresOverride: true, deckPageRef: "Slides 27, 40-42" },
    { key: "F9", label: "SUSPEND", subtext: "Hold transaction", actionId: "SUSPEND", deckPageRef: "Slides 27, 44" },
    { key: "F10", label: "CSA ON/OFF", subtext: "Not in use", actionId: "CSA_TOGGLE", disabled: true, deckPageRef: "Slide 28" },
    { key: "F11", label: "PAGE UP", subtext: "Scroll items", actionId: "PAGE_UP", deckPageRef: "Slide 28" },
    { key: "F12", label: "PAGE DOWN", subtext: "Scroll items", actionId: "PAGE_DOWN", deckPageRef: "Slide 28" },
  ],
  SECOND: [
    { key: "F1", label: "HELP", subtext: "Disabled", actionId: "HELP", disabled: true, deckPageRef: "Slide 49" },
    { key: "F2", label: "REPRINT", subtext: "Print past OR", actionId: "REPRINT", requiresOverride: true, deckPageRef: "Slides 49, 59" },
    { key: "F3", label: "PRICE CHANGE", subtext: "Modify item price", actionId: "PRICE_CHANGE", requiresOverride: true, deckPageRef: "Slide 48" },
    { key: "F4", label: "ITEM DISC", subtext: "Disabled", actionId: "ITEM_DISC", disabled: true, deckPageRef: "Slide 48" },
    { key: "F5", label: "NEXT OPTION", subtext: "3rd Page", actionId: "NAV_THIRD", deckPageRef: "Slide 48" },
    { key: "F6", label: "TRX DISC", subtext: "Senior/PWD/Emp", actionId: "TRX_DISC", requiresOverride: true, deckPageRef: "Slides 48, 50-53" },
    { key: "F7", label: "RECALL", subtext: "Retrieve held trx", actionId: "RECALL", requiresOverride: true, deckPageRef: "Slides 48, 55-57" },
    { key: "F8", label: "LOGOUT", subtext: "Logout cashier", actionId: "LOGOUT", deckPageRef: "Slides 12-15, 48" },
    { key: "F9", label: "NO SALE", subtext: "Open cash drawer", actionId: "NO_SALE", deckPageRef: "Slide 48" },
    { key: "F10", label: "ON/OFF DISC", subtext: "Block stocks only", actionId: "TOGGLE_DISC", deckPageRef: "Slide 48" },
    { key: "F11", label: "PAGE UP", subtext: "Scroll items", actionId: "PAGE_UP", deckPageRef: "Slide 49" },
    { key: "F12", label: "PAGE DOWN", subtext: "Scroll items", actionId: "PAGE_DOWN", deckPageRef: "Slide 49" },
  ],
  THIRD: [
    { key: "F1", label: "HELP", subtext: "Disabled", actionId: "HELP", disabled: true, deckPageRef: "Slide 69" },
    { key: "F2", label: "POST VOID", subtext: "Void past OR", actionId: "POST_VOID", requiresOverride: true, deckPageRef: "Slides 69, 77-80" },
    { key: "F3", label: "CASH COUNT", subtext: "Disabled", actionId: "CASH_COUNT", disabled: true, deckPageRef: "Slide 68" },
    { key: "F4", label: "TRX JOURNAL", subtext: "View journal", actionId: "TRX_JOURNAL", deckPageRef: "Slide 68" },
    { key: "F5", label: "NEXT OPTION", subtext: "4th Page", actionId: "NAV_FOURTH", deckPageRef: "Slide 68" },
    { key: "F6", label: "SALES JOURNAL", subtext: "View sales log", actionId: "SALES_JOURNAL", deckPageRef: "Slide 68" },
    { key: "F7", label: "REPORT WIZ", subtext: "Disabled", actionId: "REPORT_WIZ", disabled: true, deckPageRef: "Slide 68" },
    { key: "F8", label: "CASHIER RDG", subtext: "Y Reading", actionId: "READING_Y", deckPageRef: "Slides 68, 72-73" },
    { key: "F9", label: "TERMINAL RDG", subtext: "Z Reading", actionId: "READING_Z", deckPageRef: "Slides 68, 74-76" },
    { key: "F10", label: "SDV", subtext: "Sales Data Verify", actionId: "SDV_CHECK", deckPageRef: "Slides 68, 70-71" },
    { key: "F11", label: "PAGE UP", subtext: "Scroll items", actionId: "PAGE_UP", deckPageRef: "Slide 69" },
    { key: "F12", label: "PAGE DOWN", subtext: "Scroll items", actionId: "PAGE_DOWN", deckPageRef: "Slide 69" },
  ],
  FOURTH: [
    { key: "F1", label: "HELP", subtext: "Disabled", actionId: "HELP", disabled: true, deckPageRef: "Slide 84" },
    { key: "F2", label: "BEST BUY", subtext: "Bonus Buy Items", actionId: "BEST_BUY", deckPageRef: "Slide 84" },
    { key: "F3", label: "TRX COMMENT", subtext: "Cust Name / TIN", actionId: "TRX_COMMENT", deckPageRef: "Slides 83, 86-88" },
    { key: "F4", label: "NON SALES", subtext: "Downpayment/GC", actionId: "NON_SALES", deckPageRef: "Slide 83" },
    { key: "F5", label: "CUSTOMER", subtext: "Disabled", actionId: "CUSTOMER", disabled: true, deckPageRef: "Slide 83" },
    { key: "F6", label: "STORE OPENING", subtext: "Disabled", actionId: "STORE_OPENING", disabled: true, deckPageRef: "Slide 83" },
    { key: "F7", label: "ZERO RATED", subtext: "VAT exemption", actionId: "ZERO_RATED", requiresOverride: true, deckPageRef: "Slides 83, 90-92" },
    { key: "F8", label: "RETURN", subtext: "Item return/SI", actionId: "RETURN_EXCHANGE", requiresOverride: true, deckPageRef: "Slides 83, 94-96" },
    { key: "F9", label: "RESERVED TRX", subtext: "Disabled", actionId: "RESERVED_TRX", disabled: true, deckPageRef: "Slide 83" },
    { key: "F10", label: "REFUND", subtext: "ORNO Refund", actionId: "REFUND", requiresOverride: true, deckPageRef: "Slides 83, 98-99" },
    { key: "F11", label: "PAGE UP", subtext: "Scroll items", actionId: "PAGE_UP", deckPageRef: "Slide 84" },
    { key: "F12", label: "PAGE DOWN", subtext: "Scroll items", actionId: "PAGE_DOWN", deckPageRef: "Slide 84" },
  ],
  PAYMENT: [
    { key: "F1", label: "BACK / ESC", subtext: "Cancel to Main", actionId: "PAY_BACK", deckPageRef: "Slide 102" },
    { key: "F2", label: "CASH", subtext: "PHP Currency", actionId: "PAY_CASH", deckPageRef: "Slides 102, 103" },
    { key: "F3", label: "BANK CARD", subtext: "Debit/Credit/GCash", actionId: "PAY_CARD", deckPageRef: "Slides 102, 113-116" },
    { key: "F4", label: "DISABLED", subtext: "None", actionId: "DISABLED", disabled: true, deckPageRef: "Slide 102" },
    { key: "F5", label: "GIFT CERT", subtext: "NBS / Sodexo GC", actionId: "PAY_GC", deckPageRef: "Slides 102, 104-105" },
    { key: "F6", label: "COUPON", subtext: "Promotional coupon", actionId: "PAY_COUPON", deckPageRef: "Slides 102, 106-107" },
    { key: "F7", label: "DISABLED", subtext: "None", actionId: "DISABLED", disabled: true, deckPageRef: "Slide 102" },
    { key: "F8", label: "CREDIT MEMO", subtext: "Refund/Exchange memo", actionId: "PAY_CREDIT_MEMO", deckPageRef: "Slides 102, 108" },
    { key: "F9", label: "SULIT COINS", subtext: "LNQR Sulit Coins", actionId: "PAY_SULIT_COINS", deckPageRef: "Slides 109-111" },
    { key: "F10", label: "DISABLED", subtext: "None", actionId: "DISABLED", disabled: true, deckPageRef: "Slide 102" },
    { key: "F11", label: "PAGE UP", subtext: "Scroll items", actionId: "PAGE_UP", deckPageRef: "Slide 102" },
    { key: "F12", label: "PAGE DOWN", subtext: "Scroll items", actionId: "PAGE_DOWN", deckPageRef: "Slide 102" },
  ]
};
