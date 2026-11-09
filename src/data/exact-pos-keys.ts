export type POSPage = "MAIN" | "SECOND" | "THIRD" | "FOURTH" | "PAYMENT" | "LOOKUP";

export interface RightFunctionKeyDef {
  key: string;
  label: string;
  actionId: string;
  variant: "silver" | "red";
  disabled?: boolean;
}

export interface HorizontalFunctionKeyDef {
  key: string;
  label: string;
  sublabel?: string;
  actionId: string;
  variant: "silver" | "red" | "cyan" | "csa";
  disabled?: boolean;
  arrow?: "up" | "down";
}

export const RIGHT_FUNCTION_KEYS: Record<POSPage, RightFunctionKeyDef[]> = {
  LOOKUP: [],
  MAIN: [
    { key: "F3", label: "Quantity", actionId: "SET_QTY", variant: "silver" },
    { key: "F4", label: "Payment", actionId: "GO_PAYMENT", variant: "red" },
    { key: "F5", label: "Option", actionId: "NAV_SECOND", variant: "silver" },
    { key: "F6", label: "Non Mdse", actionId: "NON_MDSE", variant: "silver" },
    { key: "F7", label: "Item Void", actionId: "ITEM_VOID", variant: "red" },
    { key: "F8", label: "Trx Void", actionId: "TRX_VOID", variant: "red" },
    { key: "F9", label: "Suspend", actionId: "SUSPEND", variant: "red" },
  ],
  SECOND: [
    { key: "F3", label: "Price Change", actionId: "PRICE_CHANGE", variant: "red" },
    { key: "F4", label: "Item Disc", actionId: "ITEM_DISC", variant: "red", disabled: true },
    { key: "F5", label: "Next Option", actionId: "NAV_THIRD", variant: "silver" },
    { key: "F6", label: "Trx Disc", actionId: "TRX_DISC", variant: "silver" },
    { key: "F7", label: "Recall", actionId: "RECALL", variant: "silver" },
    { key: "F8", label: "Logout", actionId: "LOGOUT", variant: "silver" },
    { key: "F9", label: "No Sale", actionId: "NO_SALE", variant: "silver" },
    { key: "F10", label: "ON/OFF DISCOUNT", actionId: "ON_OFF_DISCOUNT", variant: "red" },
  ],
  THIRD: [
    { key: "F3", label: "Cash Count", actionId: "CASH_COUNT", variant: "red", disabled: true },
    { key: "F4", label: "Trx Journal", actionId: "TRX_JOURNAL", variant: "silver" },
    { key: "F5", label: "Next Option", actionId: "NAV_FOURTH", variant: "silver" },
    { key: "F6", label: "Sales Journal", actionId: "SALES_JOURNAL", variant: "silver" },
    { key: "F7", label: "Report Wizard", actionId: "REPORT_WIZARD", variant: "red", disabled: true },
    { key: "F8", label: "Cashier Reading", actionId: "READING_Y", variant: "silver" },
    { key: "F9", label: "Terminal Reading", actionId: "READING_Z", variant: "silver" },
    { key: "F10", label: "SDV", actionId: "SDV_CHECK", variant: "silver" },
  ],
  FOURTH: [
    { key: "F3", label: "Trx Comment", actionId: "TRX_COMMENT", variant: "silver" },
    { key: "F4", label: "Non Sales", actionId: "NON_SALES", variant: "silver" },
    { key: "F5", label: "Customer", actionId: "CUSTOMER", variant: "silver", disabled: true },
    { key: "F6", label: "Store Opening", actionId: "STORE_OPENING", variant: "red", disabled: true },
    { key: "F7", label: "Zero Rated", actionId: "ZERO_RATED", variant: "silver" },
    { key: "F8", label: "Return", actionId: "RETURN_EXCHANGE", variant: "silver" },
    { key: "F9", label: "Reserved Trx", actionId: "RESERVED_TRX", variant: "red", disabled: true },
    { key: "F10", label: "Refund", actionId: "REFUND", variant: "silver" },
  ],
  PAYMENT: [
    { key: "F1", label: "Cancel / ESC", actionId: "PAY_BACK", variant: "silver" },
    { key: "F2", label: "Cash", actionId: "PAY_CASH", variant: "red" },
    { key: "F3", label: "Bank Card", actionId: "PAY_CARD", variant: "red" },
    { key: "F5", label: "Gift Cert", actionId: "PAY_GC", variant: "silver" },
    { key: "F6", label: "Coupon", actionId: "PAY_COUPON", variant: "silver" },
    { key: "F8", label: "Credit Memo", actionId: "PAY_CREDIT_MEMO", variant: "silver" },
    { key: "F9", label: "Sulit Coins", actionId: "PAY_SULIT_COINS", variant: "red" },
  ],
};

export const HORIZONTAL_FUNCTION_KEYS: Record<POSPage, HorizontalFunctionKeyDef[]> = {
  LOOKUP: [],
  MAIN: [
    { key: "F11", label: "F11", actionId: "PAGE_UP", variant: "silver", arrow: "up" },
    { key: "F12", label: "F12", actionId: "PAGE_DOWN", variant: "silver", arrow: "down" },
    { key: "F10", label: "CSA", sublabel: "ON/OFF", actionId: "CSA_TOGGLE", variant: "csa" },
    { key: "F2", label: "Lookup", actionId: "LOOKUP", variant: "silver" },
  ],
  SECOND: [
    { key: "F11", label: "F11", actionId: "PAGE_UP", variant: "silver", arrow: "up" },
    { key: "F12", label: "F12", actionId: "PAGE_DOWN", variant: "silver", arrow: "down" },
    { key: "F1", label: "Help", actionId: "HELP", variant: "red", disabled: true },
    { key: "F2", label: "Reprint", actionId: "REPRINT", variant: "silver" },
  ],
  THIRD: [
    { key: "F11", label: "F11", actionId: "PAGE_UP", variant: "silver", arrow: "up" },
    { key: "F12", label: "F12", actionId: "PAGE_DOWN", variant: "silver", arrow: "down" },
    { key: "F1", label: "Help", actionId: "HELP", variant: "red", disabled: true },
    { key: "F2", label: "Post Void", actionId: "POST_VOID", variant: "silver" },
  ],
  FOURTH: [
    { key: "F11", label: "F11", actionId: "PAGE_UP", variant: "silver", arrow: "up" },
    { key: "F12", label: "F12", actionId: "PAGE_DOWN", variant: "silver", arrow: "down" },
    { key: "F1", label: "Help", actionId: "HELP", variant: "red", disabled: true },
    { key: "F2", label: "Bonus Buy", actionId: "BONUS_BUY", variant: "silver" },
  ],
  PAYMENT: [],
};
