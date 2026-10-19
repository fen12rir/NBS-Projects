export interface Lesson {
  id: string;
  title: string;
  objective: string;
  deckSlideRef: string;
  instructions: string[];
  keyCallouts: string[];
}

export interface TrainingModule {
  id: string;
  number: number;
  title: string;
  shortDesc: string;
  deckPages: string;
  lessons: Lesson[];
}

export const TRAINING_MODULES: TrainingModule[] = [
  {
    id: "mod-1",
    number: 1,
    title: "POS Basics and Screen Layout",
    shortDesc: "Understand the 12 core screen sections, cashier login status, and transaction details.",
    deckPages: "Slides 3-6",
    lessons: [
      {
        id: "les-1-1",
        title: "Introduction to Point of Sale & Terminal Layout",
        objective: "Identify the 12 key sections of the NBS POS screen including barcode entry, line items, and function keys.",
        deckSlideRef: "Slides 3-6",
        instructions: [
          "Understand that POS combines hardware (terminal, barcode scanner, receipt printer) and software.",
          "Familiarize with the 12 screen regions: Transaction No, Cashier ID, Branch Code, Barcode input, Textfield area, POS Terminal, Function Keys panel, Line item table, Total Sales, Current Date, Total Quantity, and Time.",
          "Verify the top header information matches your assigned terminal and cashier profile."
        ],
        keyCallouts: ["F2: Lookup", "F3: Quantity", "F4: Payment", "F5: Option / Next Page"]
      }
    ]
  },
  {
    id: "mod-2",
    number: 2,
    title: "Start of Day, Login, and Logout",
    shortDesc: "Initial cashier routine: verifying date & time, opening terminal, and safe logout.",
    deckPages: "Slides 7-16",
    lessons: [
      {
        id: "les-2-1",
        title: "Start of Day Verification",
        objective: "Perform proper start-of-day sequence and confirm date/time accuracy.",
        deckSlideRef: "Slides 7-9",
        instructions: [
          "Upon terminal boot, verify that the POS Date & Time matches current store opening time.",
          "Press TAB to highlight the 'YES' button, then press ENTER.",
          "Press CTRL + ALT + C to close the setup dialog, then press F5 to enter active cashier mode."
        ],
        keyCallouts: ["TAB: Navigate buttons", "ENTER: Confirm", "CTRL+ALT+C: Close dialog", "F5: Proceed"]
      },
      {
        id: "les-2-2",
        title: "Cashier Login & Safe Logout",
        objective: "Follow the approved F5 -> F8 sequence to safely sign out of your terminal.",
        deckSlideRef: "Slides 10-15",
        instructions: [
          "Enter your assigned employee username and password to log in.",
          "To log out: Press F5 (Option) from the Main screen to view the 2nd screen.",
          "Press F8 (Logout).",
          "Press TAB key to move focus to the 'YES' button, then press ENTER to confirm."
        ],
        keyCallouts: ["F5: Option", "F8: Logout (on 2nd page)", "TAB -> ENTER: Confirm"]
      }
    ]
  },
  {
    id: "mod-3",
    number: 3,
    title: "Item Lookup & Customer Loyalty (LNQR)",
    shortDesc: "Inquiring SRP and promo prices, searching by barcode or description, and recording Laking National cards.",
    deckPages: "Slides 17-25",
    lessons: [
      {
        id: "les-3-1",
        title: "Product Lookup (SRP & Promo)",
        objective: "Search items without scanning directly into an active sale to check prices or promotions.",
        deckSlideRef: "Slides 17-20",
        instructions: [
          "Press F2 (Lookup) from the main POS screen.",
          "Use F2 (SKU/Barcode) to scan or type a GTIN/barcode, OR press F3 (Description) to search by item name.",
          "Observe the right side of the lookup dialog where promotional discounts or special prices are indicated.",
          "Press ESC or Enter to return to the active sale."
        ],
        keyCallouts: ["F2: Lookup", "F2: SKU Search", "F3: Description Search"]
      },
      {
        id: "les-3-2",
        title: "NBS Loyalty (LNC & LNQR)",
        objective: "Correctly prompt and tag customer loyalty membership during the transaction.",
        deckSlideRef: "Slides 21-24",
        instructions: [
          "Ask customer if they have Laking National QR or card: Press 1 for None, 2 for Physical LNC Card, 3 for LNQR App / LNQR Plus.",
          "If customer has LNQR, select 3, scan the QR code or manually enter the customer ID, then press Tab to OK and Enter.",
          "Ensure LNQR details print on the receipt to allow points accrual."
        ],
        keyCallouts: ["1: No Loyalty", "2: LNC Card", "3: LNQR Plus Mobile"]
      }
    ]
  },
  {
    id: "mod-4",
    number: 4,
    title: "Main-Page Keys & Transaction Basics",
    shortDesc: "Setting quantities, adding items, item voids, transaction voids, and non-merchandise variance.",
    deckPages: "Slides 27-47",
    lessons: [
      {
        id: "les-4-1",
        title: "Quantity Entry & Scanning Items",
        objective: "Set item multiplier before scanning to avoid repetitive single-item entries.",
        deckSlideRef: "Slides 27, 29-31",
        instructions: [
          "When a customer buys multiples of the same item, press F3 (Quantity).",
          "Type the number of pieces (e.g. 5) and press ENTER.",
          "Scan the barcode or enter the item SKU. The line item will immediately record with the entered quantity."
        ],
        keyCallouts: ["F3: Quantity Entry", "ENTER: Confirm count"]
      },
      {
        id: "les-4-2",
        title: "Item Void & Transaction Void (Manager Override)",
        objective: "Execute line-level and transaction-level cancellations with required supervisory approval.",
        deckSlideRef: "Slides 35-43",
        instructions: [
          "For line cancellation: Press F7 (Item Void). The system requests manager override.",
          "Select the cancellation reason code and press Alt + Enter.",
          "Highlight the item to cancel and press Alt + Enter. Notice the quantity turns negative in the transaction log.",
          "For total cancellation: Press F8 (Trx Void), confirm with 'Y', enter override, and choose reason."
        ],
        keyCallouts: ["F7: Item Void", "F8: Trx Void", "Alt+Enter: Select & Confirm"]
      }
    ]
  },
  {
    id: "mod-5",
    number: 5,
    title: "Second-Page Functions & Discounts",
    shortDesc: "Transaction discounts (Senior, PWD, Employee), reprint receipt, suspend & recall, and No Sale.",
    deckPages: "Slides 48-67",
    lessons: [
      {
        id: "les-5-1",
        title: "Transaction Discounts (Senior Citizen, PWD, Employee)",
        objective: "Apply mandated statutory or company discounts with supervisor authorization.",
        deckSlideRef: "Slides 48, 50-53, 63-66",
        instructions: [
          "Press F5 (Option) from the Main Screen to enter the 2nd Page.",
          "Press F6 (TRX Disc) to open the discount category list.",
          "Select appropriate discount (e.g., Senior 20%, Employee 15%, LNQR Family Discount) and press Alt + Enter.",
          "Input manager override credentials when prompted."
        ],
        keyCallouts: ["F5: Option", "F6: TRX Disc", "Alt+Enter: Apply"]
      },
      {
        id: "les-5-2",
        title: "Suspend, Recall, and Reprint",
        objective: "Safely hold transactions when a customer needs to grab an extra item, and reprint past receipts.",
        deckSlideRef: "Slides 44, 48, 55-61",
        instructions: [
          "To suspend: Press F9 (Suspend) on Main Page, then press ENTER.",
          "To recall: Go to 2nd Page via F5, press F7 (Recall), provide override, and pick the suspended transaction.",
          "To reprint: Press F2 (Reprint) on 2nd Page, provide manager override, select OR number, and confirm."
        ],
        keyCallouts: ["F9 (Main): Suspend", "F7 (2nd): Recall", "F2 (2nd): Reprint"]
      }
    ]
  },
  {
    id: "mod-6",
    number: 6,
    title: "Third-Page Functions & Store Readings",
    shortDesc: "End-of-shift Cashier (Y) Reading, End-of-day Terminal (Z) Reading, and Sales Data Verification (SDV).",
    deckPages: "Slides 68-82",
    lessons: [
      {
        id: "les-6-1",
        title: "Cashier (Y) Reading & Terminal (Z) Reading",
        objective: "Perform formal shift and daily reconciliations mandated by store accounting.",
        deckSlideRef: "Slides 68-76",
        instructions: [
          "Press F5 twice to navigate from Main -> 2nd -> 3rd Page.",
          "For cashier change of shift: Press F8 (Cashier Reading) to print the Y-Reading summary.",
          "For terminal closing: Press F9 (Terminal Reading), press Tab to YES, and press ENTER to generate the final Z-Reading."
        ],
        keyCallouts: ["F8 (3rd): Cashier Y-Reading", "F9 (3rd): Terminal Z-Reading"]
      },
      {
        id: "les-6-2",
        title: "Sales Data Verification (SDV)",
        objective: "Ensure sales header, item detail, and payment tallies align across the POS database.",
        deckSlideRef: "Slides 70-71",
        instructions: [
          "On the 3rd Page, press F10 (SDV).",
          "Check whether the Header, Detail, and PayDetail counts are listed as 'Tally'.",
          "If any row indicates 'Not Tally', take note of the discrepancy and immediately contact the Service Desk."
        ],
        keyCallouts: ["F10 (3rd): SDV Check"]
      }
    ]
  },
  {
    id: "mod-7",
    number: 7,
    title: "Fourth-Page Functions & Exceptions",
    shortDesc: "Customer transaction comments (TIN/Invoice details), zero-rated sales, returns, and refunds.",
    deckPages: "Slides 83-101",
    lessons: [
      {
        id: "les-7-1",
        title: "Transaction Comments (TIN & Corporate Billing)",
        objective: "Enter BIR-compliant customer details for corporate or tax-exempt transactions.",
        deckSlideRef: "Slides 83, 86-88",
        instructions: [
          "Press F5 three times to advance to the 4th Page.",
          "Press F3 (TRX Comment).",
          "Type the customer's registered company name, address, and TIN, then press OK.",
          "These comments will automatically print on the official sales invoice receipt."
        ],
        keyCallouts: ["F3 (4th): TRX Comment"]
      },
      {
        id: "les-7-2",
        title: "Returns, Refunds, and Zero-Rated Transactions",
        objective: "Execute returns and refunds with supervisory approval and original receipt references.",
        deckSlideRef: "Slides 90-99",
        instructions: [
          "For Returns: Press F8 (Return) on 4th Page, enter override, input customer Sales Invoice (SI), and enter returned GTIN.",
          "For Refunds: Press F10 (Refund), supply manager override, and enter the original ORNO.",
          "For Zero-Rated sales: Press F7 (Zero Rated) before scanning vatable items to apply VAT exemption."
        ],
        keyCallouts: ["F8 (4th): Return", "F10 (4th): Refund", "F7 (4th): Zero Rated"]
      }
    ]
  },
  {
    id: "mod-8",
    number: 8,
    title: "Payment Screen & Tender Methods",
    shortDesc: "Processing Cash with change calculation, Bank Cards, GCash, NBS Gift Cards, Coupons, and Sulit Coins.",
    deckPages: "Slides 102-118",
    lessons: [
      {
        id: "les-8-1",
        title: "Cash Tender & Change Computation",
        objective: "Navigate to the payment screen, enter tender amount, and confirm change balance.",
        deckSlideRef: "Slides 102-103",
        instructions: [
          "When all items are entered on the Main screen, press F4 (Payment).",
          "Press F2 (Cash) on the Payment screen.",
          "Type the amount handed by the customer (e.g. 500.00).",
          "Press Tab to select OK, then press ENTER.",
          "Observe the calculated Change due to the customer and wait for the simulated receipt to generate."
        ],
        keyCallouts: ["F4: Open Payment", "F2: Cash Tender", "Tab -> Enter: Confirm"]
      },
      {
        id: "les-8-2",
        title: "Bank Cards, GCash, Gift Certificates & Sulit Coins",
        objective: "Tender electronic payments, mobile wallets, and voucher codes.",
        deckSlideRef: "Slides 104-116",
        instructions: [
          "From Payment screen: Press F3 (Bank Card) for Credit Card, GCash, or NBS Gift Card.",
          "For GCash: Enter the 12-digit transaction reference number.",
          "For Gift Certificates: Press F5 (Gift Cert), select series type, and enter the certificate code.",
          "For Sulit Coins: Press F9 (Sulit Coins), input coin amount, and enter the customer's LNQR code."
        ],
        keyCallouts: ["F3: Bank Card / GCash", "F5: Gift Certificate", "F6: Coupon", "F8: Credit Memo", "F9: Sulit Coins"]
      }
    ]
  },
  {
    id: "mod-9",
    number: 9,
    title: "Knowledge Check & Practical Certification",
    shortDesc: "Recap evaluation and preparation for hands-on cashier simulator assessment.",
    deckPages: "Slides 119-120",
    lessons: [
      {
        id: "les-9-1",
        title: "Final Review & Assessment Readiness",
        objective: "Verify comprehension of function key mappings and prepare for practical simulation.",
        deckSlideRef: "Slides 119-120",
        instructions: [
          "Review function key actions across all 5 POS screens (Main, 2nd, 3rd, 4th, Payment).",
          "Ensure you remember which operations require a manager override (Item Void, Trx Void, Reprint, Discounts, Readings).",
          "Proceed to the Practical POS Simulator to complete your graded cashier scenario."
        ],
        keyCallouts: ["Start Practical Assessment: Test your skills"]
      }
    ]
  }
];
