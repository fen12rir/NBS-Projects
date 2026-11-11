export interface ExamCustomerItem {
  sku: string;
  barcode?: string;
  qty: number;
  label: string;
  unitPrice: number;
  noBarcode?: boolean;
}

export interface ExamCustomerTender {
  kind:
    | "CASH"
    | "GCASH"
    | "MAYA"
    | "CREDIT_CARD"
    | "GIFT_CARD"
    | "GC"
    | "COUPON"
    | "CREDIT_MEMO"
    | "SULIT_COINS";
  amount?: number;
  reference?: string;
  slipAuth?: string;
  slipInvoice?: string;
}

export interface ExamCustomerEvent {
  say?: string;
  hands?: ExamCustomerItem[];
  tender?: ExamCustomerTender;
  shows?: "LNC_CARD" | "LNQR_QR" | "PWD_ID" | "SENIOR_ID" | "RECEIPT" | "TIN_INFO";
  note?: string;
  triggerAfterAction?: string;
}

export interface ExamMilestone {
  id: string;
  action: string;
  expectedData?: string | number;
  label: string;
  points: number;
  critical?: boolean;
}

export interface PracticalExamCase {
  id: string;
  caseNumber?: number;
  title: string;
  customerName: string;
  customerAvatar?: string;
  customerQuote: string;
  difficulty: 1 | 2 | 3;
  targetSeconds: number;
  modulesCovered: string[];
  events: ExamCustomerEvent[];
  milestones: ExamMilestone[];
  finalChecks: {
    minLineItems?: number;
    tenderMethod?: string;
    expectedTenderAmount?: number;
    expectedChange?: number;
    loyaltyType?: "NONE" | "LNC" | "LNQR";
    voidPerformed?: boolean;
    discountType?: string;
    isZeroRated?: boolean;
  };
}

export interface PracticalExamSession {
  sessionId: string;
  totalTimeLimitSeconds: number;
  passingScore: number;
  cases: PracticalExamCase[];
}

export const PRACTICAL_CASE_POOL: PracticalExamCase[] = [
  // 1. Shift Opening (Fixed opening case)
  {
    id: "case-open-shift",
    title: "Morning Shift Opening & Cashier Sign-In",
    customerName: "Store Supervisor",
    customerQuote: "Good morning! Please verify the terminal date and time, reload the POS, and log in with your cashier ID (241209) to open the register.",
    difficulty: 1,
    targetSeconds: 60,
    modulesCovered: ["mod-2"],
    events: [
      {
        say: "Verify the terminal date and time on the Start of Day screen. If correct, press Yes, close the setup dialog, and reload into User Login.",
        note: "Cashier credentials: User ID 241209, Password default.",
      },
    ],
    milestones: [
      { id: "m-sod-yes", action: "VERIFY_DATE_YES", label: "Verify Date & Time [Yes]", points: 10, critical: true },
      { id: "m-sod-close", action: "CLOSE_SOD_WINDOW", label: "Close SOD Setup Window", points: 10 },
      { id: "m-pos-reload", action: "RELOAD_POS_LOGIN", label: "Reload POS Reloader", points: 10 },
      { id: "m-login", action: "LOGIN_SUBMIT", label: "Cashier Sign-In", points: 20, critical: true },
    ],
    finalChecks: {},
  },

  // 2. Simple Cash Sale with ₱500 bill
  {
    id: "case-simple-cash",
    title: "Quick Cash Sale: NBS Classic Spiral Notebook",
    customerName: "Maria Santos",
    customerQuote: "Hi, just this NBS Classic spiral notebook, please. I'm paying with cash.",
    difficulty: 1,
    targetSeconds: 45,
    modulesCovered: ["mod-4", "mod-8"],
    events: [
      {
        say: "Here's the notebook. How much is it?",
        hands: [
          { sku: "NBS-BK-001", barcode: "NBS-BK-001", qty: 1, label: "NBS Classic Notebook Spiral 80L", unitPrice: 35.0 },
        ],
        tender: { kind: "CASH", amount: 500 },
      },
    ],
    milestones: [
      { id: "m-scan", action: "ADD_ITEM", expectedData: "NBS-BK-001", label: "Scan NBS-BK-001", points: 15, critical: true },
      { id: "m-f4-1", action: "GO_PAYMENT", label: "Press F4 Payment", points: 5 },
      { id: "m-bb-cancel", action: "CONFIRM_BEST_BUY", label: "Dismiss Bonus Buy (Alt+B)", points: 10 },
      { id: "m-f4-2", action: "GO_PAYMENT", label: "Open Choose Option", points: 5 },
      { id: "m-opt-none", action: "CHOOSE_LNQR_OPTION", expectedData: 1, label: "Select 1. None", points: 10 },
      { id: "m-tender", action: "SUBMIT_CASH_TENDER", label: "Tender ₱500 Cash", points: 15, critical: true },
    ],
    finalChecks: {
      minLineItems: 1,
      tenderMethod: "CASH",
      expectedTenderAmount: 500,
      expectedChange: 465.0,
      loyaltyType: "NONE",
    },
  },

  // 3. Multi-Quantity Sale (F3 Quantity)
  {
    id: "case-qty-pens",
    title: "Multi-Pack Sale: 3x Pilot G-Tec Gel Pens",
    customerName: "Carlo Reyes",
    customerQuote: "Hello! Our group needs 3 of these Pilot G-Tec pens. Here's a ₱500 bill.",
    difficulty: 1,
    targetSeconds: 50,
    modulesCovered: ["mod-4", "mod-8"],
    events: [
      {
        say: "I have 3 pieces of the same Pilot G-Tec pen.",
        hands: [
          { sku: "NBS-PEN-002", barcode: "NBS-PEN-002", qty: 3, label: "Pilot G-Tech 0.3 Black Gel Pen", unitPrice: 85.0 },
        ],
        tender: { kind: "CASH", amount: 500 },
      },
    ],
    milestones: [
      { id: "m-qty-mode", action: "SET_QTY_MODE", label: "Press F3 Quantity", points: 10 },
      { id: "m-qty-val", action: "CONFIRM_QTY", expectedData: 3, label: "Set Quantity to 3", points: 10, critical: true },
      { id: "m-scan-pen", action: "ADD_ITEM", expectedData: "NBS-PEN-002", label: "Scan NBS-PEN-002", points: 10, critical: true },
      { id: "m-f4-1", action: "GO_PAYMENT", label: "Press F4 Payment", points: 5 },
      { id: "m-bb-cancel", action: "CONFIRM_BEST_BUY", label: "Dismiss Bonus Buy", points: 5 },
      { id: "m-f4-2", action: "GO_PAYMENT", label: "Open Choose Option", points: 5 },
      { id: "m-opt-none", action: "CHOOSE_LNQR_OPTION", expectedData: 1, label: "Choose 1. None", points: 5 },
      { id: "m-cash", action: "SUBMIT_CASH_TENDER", label: "Tender ₱500 Cash", points: 10, critical: true },
    ],
    finalChecks: {
      minLineItems: 1,
      tenderMethod: "CASH",
      expectedTenderAmount: 500,
      expectedChange: 245.0,
    },
  },

  // 4. Missing Barcode: F2 Product Lookup
  {
    id: "case-lookup-calc",
    title: "Missing Barcode Lookup: Casio Calculator",
    customerName: "Elena Cruz",
    customerQuote: "Excuse me, the barcode sticker on this Casio calculator was scratched off. Can you still ring it up? I'll pay exact cash.",
    difficulty: 2,
    targetSeconds: 65,
    modulesCovered: ["mod-3", "mod-8"],
    events: [
      {
        say: "The barcode is missing on this Casio Scientific Calculator (₱420.00).",
        hands: [
          { sku: "NBS-CAL-005", qty: 1, label: "Casio Scientific Calculator", unitPrice: 420.0, noBarcode: true },
        ],
        tender: { kind: "CASH", amount: 500 },
      },
    ],
    milestones: [
      { id: "m-f2-lookup", action: "LOOKUP", label: "Press F2 Lookup", points: 10, critical: true },
      { id: "m-f3-desc", action: "LOOKUP_SEARCH", label: "Switch to Description Search (F3)", points: 10 },
      { id: "m-query", action: "LOOKUP_QUERY", label: "Search for 'casio' / 'calculator'", points: 15, critical: true },
      { id: "m-add-item", action: "ADD_ITEM", expectedData: "NBS-CAL-005", label: "Add Casio Calculator", points: 10, critical: true },
      { id: "m-f4-1", action: "GO_PAYMENT", label: "Press F4 Payment", points: 5 },
      { id: "m-bb-cancel", action: "CONFIRM_BEST_BUY", label: "Dismiss Bonus Buy", points: 5 },
      { id: "m-f4-2", action: "GO_PAYMENT", label: "Open Choose Option", points: 5 },
      { id: "m-opt-none", action: "CHOOSE_LNQR_OPTION", expectedData: 1, label: "Select 1. None", points: 5 },
      { id: "m-cash", action: "SUBMIT_CASH_TENDER", label: "Tender ₱500", points: 10 },
    ],
    finalChecks: {
      minLineItems: 1,
      tenderMethod: "CASH",
      expectedChange: 80.0,
    },
  },

  // 5. Physical Laking National Card (Option 2)
  {
    id: "case-loyalty-lnc",
    title: "Laking National Card (LNC) Loyalty Member",
    customerName: "Patricia Lim",
    customerQuote: "Good day! I have my physical Laking National Card. Here is my card and a watercolor set.",
    difficulty: 2,
    targetSeconds: 60,
    modulesCovered: ["mod-3", "mod-8"],
    events: [
      {
        say: "Please swipe or input my Laking National Card before charging.",
        hands: [
          { sku: "NBS-ART-004", barcode: "NBS-ART-004", qty: 1, label: "Faber-Castell Classic Color Pencils 12s", unitPrice: 180.0 },
        ],
        shows: "LNC_CARD",
        tender: { kind: "CASH", amount: 500 },
      },
    ],
    milestones: [
      { id: "m-scan", action: "ADD_ITEM", expectedData: "NBS-ART-004", label: "Scan NBS-ART-004", points: 10, critical: true },
      { id: "m-f4-1", action: "GO_PAYMENT", label: "Press F4 Payment", points: 5 },
      { id: "m-bb-cancel", action: "CONFIRM_BEST_BUY", label: "Dismiss Bonus Buy", points: 5 },
      { id: "m-f4-2", action: "GO_PAYMENT", label: "Open Choose Option", points: 5 },
      { id: "m-opt-lnc", action: "CHOOSE_LNQR_OPTION", expectedData: 2, label: "Choose 2. Laking National Card", points: 15, critical: true },
      { id: "m-submit-lnc", action: "SUBMIT_LNC", label: "Enter / Confirm LNC Number", points: 15, critical: true },
      { id: "m-cash", action: "SUBMIT_CASH_TENDER", label: "Tender ₱500 Cash", points: 10 },
    ],
    finalChecks: {
      loyaltyType: "LNC",
      tenderMethod: "CASH",
      expectedChange: 320.0,
    },
  },

  // 6. Mobile LNQR Member (Option 3)
  {
    id: "case-loyalty-lnqr",
    title: "Digital LNQR App Member Checkout",
    customerName: "Miguel Tan",
    customerQuote: "Hi! I have the NBS Mobile LNQR barcode on my phone. Scanning copy paper, please.",
    difficulty: 2,
    targetSeconds: 60,
    modulesCovered: ["mod-3", "mod-8"],
    events: [
      {
        say: "Here's my phone with the LNQR barcode (20221003LN000004).",
        hands: [
          { sku: "NBS-PAP-003", barcode: "NBS-PAP-003", qty: 1, label: "A4 Copy Paper 80gsm", unitPrice: 240.0 },
        ],
        shows: "LNQR_QR",
        tender: { kind: "CASH", amount: 500 },
      },
    ],
    milestones: [
      { id: "m-scan", action: "ADD_ITEM", expectedData: "NBS-PAP-003", label: "Scan NBS-PAP-003", points: 10, critical: true },
      { id: "m-f4-1", action: "GO_PAYMENT", label: "Press F4 Payment", points: 5 },
      { id: "m-bb-cancel", action: "CONFIRM_BEST_BUY", label: "Dismiss Bonus Buy", points: 5 },
      { id: "m-f4-2", action: "GO_PAYMENT", label: "Open Choose Option", points: 5 },
      { id: "m-opt-lnqr", action: "CHOOSE_LNQR_OPTION", expectedData: 3, label: "Choose 3. LNQR / LNQR PLUS", points: 15, critical: true },
      { id: "m-submit-lnqr", action: "SUBMIT_LNQR", expectedData: "20221003LN000004", label: "Scan LNQR Barcode", points: 15, critical: true },
      { id: "m-cash", action: "SUBMIT_CASH_TENDER", label: "Tender ₱500 Cash", points: 10 },
      { id: "m-confirm-lnqr", action: "CONFIRM_LNQR_UPDATED", label: "Confirm 'LNQR Updated' Dialog", points: 10, critical: true },
    ],
    finalChecks: {
      loyaltyType: "LNQR",
      tenderMethod: "CASH",
    },
  },

  // 7. LNQR Sulit Coins Redemption + Cash Balance
  {
    id: "case-sulit-coins",
    title: "LNQR Sulit Coins Redemption & Cash Balance",
    customerName: "Jan Angela",
    customerQuote: "I have LNQR and want to redeem ₱29 in Sulit Coins towards this Casio calculator, then pay the remaining balance with a ₱500 bill.",
    difficulty: 3,
    targetSeconds: 80,
    modulesCovered: ["mod-8"],
    events: [
      {
        say: "I have LNQR! Deduct ₱29.00 Sulit Coins and I will pay the remaining ₱391.00 with a ₱500 bill.",
        hands: [
          { sku: "NBS-CAL-005", barcode: "NBS-CAL-005", qty: 1, label: "Casio Scientific Calculator", unitPrice: 420.0 },
        ],
        shows: "LNQR_QR",
        tender: { kind: "CASH", amount: 500 },
      },
    ],
    milestones: [
      { id: "m-scan", action: "ADD_ITEM", expectedData: "NBS-CAL-005", label: "Scan NBS-CAL-005", points: 10, critical: true },
      { id: "m-f4-1", action: "GO_PAYMENT", label: "Press F4 Payment", points: 5 },
      { id: "m-bb-cancel", action: "CONFIRM_BEST_BUY", label: "Dismiss Bonus Buy", points: 5 },
      { id: "m-f4-2", action: "GO_PAYMENT", label: "Open Choose Option", points: 5 },
      { id: "m-opt-3", action: "CHOOSE_LNQR_OPTION", expectedData: 3, label: "Select Option 3 LNQR", points: 10, critical: true },
      { id: "m-submit-qr", action: "SUBMIT_LNQR", label: "Scan LNQR Code", points: 10 },
      { id: "m-pay-card", action: "PAY_CARD", label: "Press F3 Bank Card", points: 10, critical: true },
      { id: "m-sel-sulit", action: "SELECT_CARD_TYPE", expectedData: "LNQR Sulit Coins", label: "Select 'LNQR Sulit Coins'", points: 15, critical: true },
      { id: "m-redeem", action: "REDEEM_SULIT_COINS", expectedData: 29, label: "Redeem ₱29.00 Coins", points: 15, critical: true },
      { id: "m-cash", action: "SUBMIT_CASH_TENDER", label: "Tender Remaining Balance (₱500)", points: 10, critical: true },
      { id: "m-confirm-update", action: "CONFIRM_LNQR_UPDATED", label: "Confirm LNQR Updated", points: 10 },
    ],
    finalChecks: {
      loyaltyType: "LNQR",
      tenderMethod: "CASH",
      expectedChange: 109.0,
    },
  },

  // 8. E-Wallet Payment: GCash
  {
    id: "case-pay-gcash",
    title: "E-Wallet Payment via GCash QR",
    customerName: "Ramon Valdez",
    customerQuote: "I'll pay for this NBS spiral notebook using GCash. I just scanned the store counter QR.",
    difficulty: 2,
    targetSeconds: 60,
    modulesCovered: ["mod-8"],
    events: [
      {
        say: "Here's my phone showing GCash payment confirmation for ₱35.00.",
        hands: [
          { sku: "NBS-BK-001", barcode: "NBS-BK-001", qty: 1, label: "NBS Classic Notebook Spiral 80L", unitPrice: 35.0 },
        ],
        tender: { kind: "GCASH", amount: 35.0, reference: "GC88492019" },
      },
    ],
    milestones: [
      { id: "m-scan", action: "ADD_ITEM", expectedData: "NBS-BK-001", label: "Scan NBS-BK-001", points: 10, critical: true },
      { id: "m-f4-1", action: "GO_PAYMENT", label: "Press F4 Payment", points: 5 },
      { id: "m-bb-cancel", action: "CONFIRM_BEST_BUY", label: "Dismiss Bonus Buy", points: 5 },
      { id: "m-f4-2", action: "GO_PAYMENT", label: "Open Choose Option", points: 5 },
      { id: "m-opt-none", action: "CHOOSE_LNQR_OPTION", expectedData: 1, label: "Select 1. None", points: 5 },
      { id: "m-f3-card", action: "PAY_CARD", label: "Press F3 Bank Card", points: 10, critical: true },
      { id: "m-sel-gcash", action: "SELECT_CARD_TYPE", expectedData: "GCASH", label: "Select GCASH", points: 15, critical: true },
      { id: "m-tender", action: "CONFIRM_TENDER", label: "Confirm GCash Payment", points: 15, critical: true },
    ],
    finalChecks: {
      tenderMethod: "BANK_CARD",
    },
  },

  // 9. Credit Card Sale with BDO Terminal Slip
  {
    id: "case-pay-credit-card",
    title: "Credit Card Payment with BDO POS Slip",
    customerName: "Atty. Fernando Gomez",
    customerQuote: "Charging this Parker Sonnet pen to my Visa Credit Card, please.",
    difficulty: 2,
    targetSeconds: 70,
    modulesCovered: ["mod-8"],
    events: [
      {
        say: "Here is my BDO Visa credit card.",
        hands: [
          { sku: "505", barcode: "505", qty: 1, label: "Parker Sonnet Rollerball Pen", unitPrice: 2990.0 },
        ],
        tender: { kind: "CREDIT_CARD", amount: 2990.0, slipAuth: "AP8812", slipInvoice: "004921" },
      },
    ],
    milestones: [
      { id: "m-scan", action: "ADD_ITEM", expectedData: "505", label: "Scan Parker Pen (505)", points: 10, critical: true },
      { id: "m-f4-1", action: "GO_PAYMENT", label: "Press F4 Payment", points: 5 },
      { id: "m-bb-cancel", action: "CONFIRM_BEST_BUY", label: "Dismiss Bonus Buy", points: 5 },
      { id: "m-f4-2", action: "GO_PAYMENT", label: "Open Choose Option", points: 5 },
      { id: "m-opt-none", action: "CHOOSE_LNQR_OPTION", expectedData: 1, label: "Select 1. None", points: 5 },
      { id: "m-f3-card", action: "PAY_CARD", label: "Press F3 Bank Card", points: 10, critical: true },
      { id: "m-sel-cc", action: "SELECT_CARD_TYPE", expectedData: "CREDIT CARD", label: "Select CREDIT CARD", points: 15, critical: true },
      { id: "m-confirm-cc", action: "CONFIRM_TENDER", label: "Input Slip Details & Confirm [Ok]", points: 20, critical: true },
    ],
    finalChecks: {
      tenderMethod: "BANK_CARD",
    },
  },

  // 10. Mid-Sale Correction: Item Void with Manager Override
  {
    id: "case-item-void",
    title: "Mid-Sale Item Cancellation (Item Void)",
    customerName: "Jessica Lee",
    customerQuote: "Wait! I changed my mind about the copy paper. Please remove it from my bill. I'll just take the notebook.",
    difficulty: 2,
    targetSeconds: 75,
    modulesCovered: ["mod-5", "mod-8"],
    events: [
      {
        say: "I have a notebook and copy paper.",
        hands: [
          { sku: "NBS-BK-001", barcode: "NBS-BK-001", qty: 1, label: "NBS Classic Notebook Spiral 80L", unitPrice: 35.0 },
          { sku: "NBS-PAP-003", barcode: "NBS-PAP-003", qty: 1, label: "A4 Copy Paper 80gsm", unitPrice: 240.0 },
        ],
      },
      {
        triggerAfterAction: "ADD_ITEM",
        say: "Actually, please void the A4 Copy Paper (₱240). I don't have enough cash.",
        tender: { kind: "CASH", amount: 100 },
      },
    ],
    milestones: [
      { id: "m-scan-1", action: "ADD_ITEM", label: "Scan First Item", points: 5 },
      { id: "m-scan-2", action: "ADD_ITEM", label: "Scan Second Item", points: 5 },
      { id: "m-req-void", action: "ITEM_VOID", label: "Press F9 Item Void", points: 10, critical: true },
      { id: "m-override", action: "CONFIRM_OVERRIDE", label: "Manager Override Sign-Off", points: 15, critical: true },
      { id: "m-sel-void-sku", action: "SCAN_VOID_SKU", expectedData: "NBS-PAP-003", label: "Select NBS-PAP-003 to Void", points: 15, critical: true },
      { id: "m-f4-1", action: "GO_PAYMENT", label: "Press F4 Payment", points: 5 },
      { id: "m-bb-cancel", action: "CONFIRM_BEST_BUY", label: "Dismiss Bonus Buy", points: 5 },
      { id: "m-f4-2", action: "GO_PAYMENT", label: "Open Choose Option", points: 5 },
      { id: "m-opt-none", action: "CHOOSE_LNQR_OPTION", expectedData: 1, label: "Select 1. None", points: 5 },
      { id: "m-cash", action: "SUBMIT_CASH_TENDER", label: "Tender ₱100 Cash", points: 10 },
    ],
    finalChecks: {
      voidPerformed: true,
      tenderMethod: "CASH",
      expectedChange: 65.0,
    },
  },

  // 11. Customer Leaves: Transaction Void
  {
    id: "case-trx-void",
    title: "Customer Abandons Sale: Transaction Void",
    customerName: "Dante Alcantara",
    customerQuote: "Oh no! I forgot my wallet at the coffee shop! Please cancel everything, I'm so sorry!",
    difficulty: 2,
    targetSeconds: 50,
    modulesCovered: ["mod-5"],
    events: [
      {
        say: "Ring up these two items first.",
        hands: [
          { sku: "NBS-BK-001", barcode: "NBS-BK-001", qty: 1, label: "NBS Classic Notebook Spiral 80L", unitPrice: 35.0 },
          { sku: "NBS-CAL-005", barcode: "NBS-CAL-005", qty: 1, label: "Casio Scientific Calculator", unitPrice: 420.0 },
        ],
      },
      {
        triggerAfterAction: "ADD_ITEM",
        say: "Never mind, cancel the whole transaction! I don't have money on me.",
      },
    ],
    milestones: [
      { id: "m-scan-1", action: "ADD_ITEM", label: "Scan Item 1", points: 5 },
      { id: "m-scan-2", action: "ADD_ITEM", label: "Scan Item 2", points: 5 },
      { id: "m-trx-void", action: "TRX_VOID", label: "Press F10 Transaction Void", points: 15, critical: true },
      { id: "m-override", action: "CONFIRM_OVERRIDE", label: "Manager Override Sign-Off", points: 15, critical: true },
      { id: "m-reason", action: "CONFIRM_TRX_VOID", label: "Confirm Trx Void Reason", points: 10, critical: true },
    ],
    finalChecks: {},
  },

  // 12. PWD / Senior Citizen Statutory Discount
  {
    id: "case-discount-pwd",
    title: "Statutory 20% PWD Discount Application",
    customerName: "Corazon Aquino",
    customerQuote: "Good morning, dear. Here is my PWD booklet and ID for my discount on this notebook. Paying cash.",
    difficulty: 2,
    targetSeconds: 70,
    modulesCovered: ["mod-6", "mod-8"],
    events: [
      {
        say: "Here is my government-issued PWD ID (ID #PWD-2024-0091).",
        hands: [
          { sku: "NBS-BK-001", barcode: "NBS-BK-001", qty: 1, label: "NBS Classic Notebook Spiral 80L", unitPrice: 35.0 },
        ],
        shows: "PWD_ID",
        tender: { kind: "CASH", amount: 100 },
      },
    ],
    milestones: [
      { id: "m-scan", action: "ADD_ITEM", expectedData: "NBS-BK-001", label: "Scan NBS-BK-001", points: 10, critical: true },
      { id: "m-nav-2", action: "NAV_SECOND", label: "Navigate to 2nd Screen (F5)", points: 5 },
      { id: "m-trx-disc", action: "TRX_DISC", label: "Press F4 Trx Discount", points: 10, critical: true },
      { id: "m-apply-pwd", action: "APPLY_DISCOUNT", expectedData: "PWD", label: "Select PWD Discount (Option 4)", points: 15, critical: true },
      { id: "m-f4-1", action: "GO_PAYMENT", label: "Press F4 Payment", points: 5 },
      { id: "m-bb-cancel", action: "CONFIRM_BEST_BUY", label: "Dismiss Bonus Buy", points: 5 },
      { id: "m-f4-2", action: "GO_PAYMENT", label: "Open Choose Option", points: 5 },
      { id: "m-opt-none", action: "CHOOSE_LNQR_OPTION", expectedData: 1, label: "Select 1. None", points: 5 },
      { id: "m-cash", action: "SUBMIT_CASH_TENDER", label: "Tender ₱100 Cash", points: 10 },
    ],
    finalChecks: {
      discountType: "PWD",
      tenderMethod: "CASH",
    },
  },

  // 13. Suspend Sale & Recall
  {
    id: "case-suspend-recall",
    title: "Suspend Sale (Customer Forgot Item) & Recall",
    customerName: "Eduardo Manalo",
    customerQuote: "Wait, I forgot an eraser in aisle 3! Please hold my items so you can serve the customer behind me.",
    difficulty: 2,
    targetSeconds: 70,
    modulesCovered: ["mod-5"],
    events: [
      {
        say: "Ring up my spiral notebook first.",
        hands: [
          { sku: "NBS-BK-001", barcode: "NBS-BK-001", qty: 1, label: "NBS Classic Notebook Spiral 80L", unitPrice: 35.0 },
        ],
      },
      {
        triggerAfterAction: "ADD_ITEM",
        say: "Please suspend this transaction (press F11 Suspend) so I can run back and grab an eraser!",
      },
      {
        triggerAfterAction: "CONFIRM_SUSPEND",
        say: "I'm back with the eraser! Please recall my transaction (press F5 to 2nd screen, then F9 Recall, select transaction and confirm).",
      },
    ],
    milestones: [
      { id: "m-scan", action: "ADD_ITEM", expectedData: "NBS-BK-001", label: "Scan NBS-BK-001", points: 10 },
      { id: "m-suspend", action: "SUSPEND", label: "Press F11 Suspend", points: 15, critical: true },
      { id: "m-nav-2", action: "NAV_SECOND", label: "Navigate to 2nd Screen (F5)", points: 5 },
      { id: "m-recall", action: "RECALL", label: "Press F9 Recall", points: 15, critical: true },
      { id: "m-confirm-recall", action: "CONFIRM_RECALL", label: "Select & Confirm Recalled Trx", points: 15, critical: true },
    ],
    finalChecks: {},
  },

  // 14. Corporate Invoice: Transaction Comments (TIN & Company Details)
  {
    id: "case-trx-comment-tin",
    title: "Corporate Purchase: Add Buyer TIN & Company Info",
    customerName: "Ms. Cynthia Villar (Purchaser)",
    customerQuote: "Good day! Our office is purchasing 5 sets of copy paper. Please enter our company TIN and address on the Official Receipt.",
    difficulty: 3,
    targetSeconds: 85,
    modulesCovered: ["mod-7", "mod-8"],
    events: [
      {
        say: "Please bill to: Prime Holdings Inc., TIN: 123-456-789-000, 150 Pioneer St. Mandaluyong.",
        hands: [
          { sku: "NBS-PAP-003", barcode: "NBS-PAP-003", qty: 1, label: "A4 Copy Paper 80gsm", unitPrice: 240.0 },
        ],
        shows: "TIN_INFO",
        tender: { kind: "CASH", amount: 500 },
      },
    ],
    milestones: [
      { id: "m-scan", action: "ADD_ITEM", expectedData: "NBS-PAP-003", label: "Scan Item", points: 10 },
      { id: "m-nav-2", action: "NAV_SECOND", label: "F5 Page Down to 2nd", points: 5 },
      { id: "m-nav-3", action: "NAV_THIRD", label: "F5 Page Down to 3rd", points: 5 },
      { id: "m-nav-4", action: "NAV_FOURTH", label: "F5 Page Down to 4th", points: 5 },
      { id: "m-comment", action: "TRX_COMMENT", label: "Press F2 Trx Comment", points: 15, critical: true },
      { id: "m-save-comm", action: "SAVE_TRX_COMMENT", label: "Fill & Save Buyer Name, Address, TIN", points: 15, critical: true },
      { id: "m-f4-1", action: "GO_PAYMENT", label: "Press F4 Payment", points: 5 },
      { id: "m-bb-cancel", action: "CONFIRM_BEST_BUY", label: "Dismiss Bonus Buy", points: 5 },
      { id: "m-f4-2", action: "GO_PAYMENT", label: "Open Choose Option", points: 5 },
      { id: "m-opt-none", action: "CHOOSE_LNQR_OPTION", expectedData: 1, label: "Select 1. None", points: 5 },
      { id: "m-cash", action: "SUBMIT_CASH_TENDER", label: "Tender ₱500", points: 10 },
    ],
    finalChecks: {
      tenderMethod: "CASH",
    },
  },

  // 15. Shift Closing (Fixed closing case)
  {
    id: "case-close-shift",
    title: "End-of-Day Shift Close: SDV, Y & Z Readings + Logout",
    customerName: "Supervisor (Shift End)",
    customerQuote: "Great work on your shift today! Time to perform terminal balancing: generate SDV, Y Reading, Z Reading, and log out.",
    difficulty: 2,
    targetSeconds: 75,
    modulesCovered: ["mod-9"],
    events: [
      {
        say: "Run daily shift balance readings (SDV Check, Y Reading, Z Reading) on the 3rd Screen and sign off.",
      },
    ],
    milestones: [
      { id: "m-nav-2", action: "NAV_SECOND", label: "F5 Page Down to 2nd", points: 5 },
      { id: "m-nav-3", action: "NAV_THIRD", label: "F5 Page Down to 3rd", points: 5 },
      { id: "m-sdv", action: "SDV_CHECK", label: "Press F9 SDV Check", points: 15, critical: true },
      { id: "m-reading-y", action: "READING_Y", label: "Press F7 Y Reading", points: 15, critical: true },
      { id: "m-reading-z", action: "READING_Z", label: "Press F8 Z Reading", points: 15, critical: true },
      { id: "m-nav-4", action: "NAV_FOURTH", label: "F5 to 4th Screen", points: 5 },
      { id: "m-nav-1", action: "PAGE_DOWN", label: "F12 to Main Screen", points: 5 },
      { id: "m-nav-2b", action: "NAV_SECOND", label: "F5 to 2nd Screen", points: 5 },
      { id: "m-logout", action: "TRIGGER_LOGOUT", label: "Press F11 Logout", points: 15, critical: true },
    ],
    finalChecks: {},
  },
];

/**
 * Creates a randomized exam session:
 * - Case 1: Start of Day (opening shift)
 * - Cases 2-6: 4 to 5 randomly picked scenarios balancing cash, cards, corrections, loyalty
 * - Final Case: End of Day Readings & Logout
 */
export function generatePracticalExamSession(seed?: string): PracticalExamSession {
  const openingCase = PRACTICAL_CASE_POOL.find((c) => c.id === "case-open-shift")!;
  const closingCase = PRACTICAL_CASE_POOL.find((c) => c.id === "case-close-shift")!;

  // Eligible middle cases
  const middlePool = PRACTICAL_CASE_POOL.filter(
    (c) => c.id !== "case-open-shift" && c.id !== "case-close-shift"
  );

  // Categorize for representative sampling
  const cashCases = middlePool.filter((c) => ["case-simple-cash", "case-qty-pens", "case-lookup-calc"].includes(c.id));
  const loyaltyCases = middlePool.filter((c) => ["case-loyalty-lnc", "case-loyalty-lnqr", "case-sulit-coins"].includes(c.id));
  const cardCases = middlePool.filter((c) => ["case-pay-gcash", "case-pay-credit-card"].includes(c.id));
  const overrideCases = middlePool.filter((c) => ["case-item-void", "case-trx-void", "case-discount-pwd", "case-trx-comment-tin"].includes(c.id));

  // Deterministic or pseudo-random picker
  const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const selectedMiddle: PracticalExamCase[] = [
    pickRandom(cashCases),
    pickRandom(loyaltyCases),
    pickRandom(cardCases),
    pickRandom(overrideCases),
  ];

  // Pick 1 more from the remaining middle pool without duplicates
  const alreadyChosenIds = new Set(selectedMiddle.map((c) => c.id));
  const remaining = middlePool.filter((c) => !alreadyChosenIds.has(c.id));
  if (remaining.length > 0) {
    selectedMiddle.push(pickRandom(remaining));
  }

  const allCases = [openingCase, ...selectedMiddle, closingCase].map((c, idx) => ({
    ...c,
    caseNumber: idx + 1,
  }));

  return {
    sessionId: `exam-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    totalTimeLimitSeconds: 15 * 60, // 15 minutes overall
    passingScore: 80,
    cases: allCases,
  };
}
