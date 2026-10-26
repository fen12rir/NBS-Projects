export type POSPage = "MAIN" | "SECOND" | "THIRD" | "FOURTH" | "PAYMENT" | "LOOKUP";

export interface RightFunctionKeyDef {
  key: string;          // e.g. "F3"
  label: string;        // e.g. "Quantity"
  actionId: string;
  variant: "silver" | "red"; // Silver vs Red button in real POS
  disabled?: boolean;
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
    { key: "F2", label: "Reprint", actionId: "REPRINT", variant: "silver" },
    { key: "F3", label: "Price Change", actionId: "PRICE_CHANGE", variant: "silver" },
    { key: "F4", label: "Item Disc", actionId: "ITEM_DISC", variant: "silver", disabled: true },
    { key: "F5", label: "Next Option", actionId: "NAV_THIRD", variant: "silver" },
    { key: "F6", label: "Trx Disc", actionId: "TRX_DISC", variant: "red" },
    { key: "F7", label: "Recall", actionId: "RECALL", variant: "silver" },
    { key: "F8", label: "Logout", actionId: "LOGOUT", variant: "red" },
  ],
  THIRD: [
    { key: "F2", label: "Post Void", actionId: "POST_VOID", variant: "red" },
    { key: "F4", label: "Trx Journal", actionId: "TRX_JOURNAL", variant: "silver" },
    { key: "F5", label: "Next Option", actionId: "NAV_FOURTH", variant: "silver" },
    { key: "F6", label: "Sales Journal", actionId: "SALES_JOURNAL", variant: "silver" },
    { key: "F8", label: "Cashier Rdg", actionId: "READING_Y", variant: "red" },
    { key: "F9", label: "Terminal Rdg", actionId: "READING_Z", variant: "red" },
    { key: "F10", label: "SDV", actionId: "SDV_CHECK", variant: "silver" },
  ],
  FOURTH: [
    { key: "F2", label: "Bonus Buy", actionId: "BONUS_BUY", variant: "silver" },
    { key: "F3", label: "Trx Comment", actionId: "TRX_COMMENT", variant: "silver" },
    { key: "F4", label: "Non Sales", actionId: "NON_SALES", variant: "silver" },
    { key: "F5", label: "Next Option", actionId: "NAV_MAIN", variant: "silver" },
    { key: "F7", label: "Zero Rated", actionId: "ZERO_RATED", variant: "red" },
    { key: "F8", label: "Return", actionId: "RETURN_EXCHANGE", variant: "red" },
    { key: "F10", label: "Refund", actionId: "REFUND", variant: "red" },
  ],
  PAYMENT: [
    { key: "F1", label: "Cancel / ESC", actionId: "PAY_BACK", variant: "silver" },
    { key: "F2", label: "Cash", actionId: "PAY_CASH", variant: "red" },
    { key: "F3", label: "Bank Card", actionId: "PAY_CARD", variant: "red" },
    { key: "F5", label: "Gift Cert", actionId: "PAY_GC", variant: "silver" },
    { key: "F6", label: "Coupon", actionId: "PAY_COUPON", variant: "silver" },
    { key: "F8", label: "Credit Memo", actionId: "PAY_CREDIT_MEMO", variant: "silver" },
    { key: "F9", label: "Sulit Coins", actionId: "PAY_SULIT_COINS", variant: "red" },
  ]
};
