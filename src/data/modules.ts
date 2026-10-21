export interface Lesson {
  id: string;
  title: string;
  objective: string;
  deckSlideRef: string;
  instructions: string[];
  keyCallouts: string[];
  visualAsset?: {
    src: string;
    caption: string;
    alt: string;
  };
  visualAssets?: {
    src: string;
    caption: string;
    alt: string;
  }[];
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
        visualAsset: {
          src: "/assets/modules/module-1-pos-basics/images/pos-screen-details.png",
          caption: "POS Screen Details Anatomy (National Book Store POS System)",
          alt: "Diagram of National Book Store POS Screen Details labeling all 12 key screen regions"
        },
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
        objective: "Perform proper start-of-day sequence and confirm date/time accuracy upon booting terminal.",
        deckSlideRef: "Slides 7-9",
        visualAssets: [
          {
            src: "/assets/modules/module-2-start-of-day/images/start-of-day-verify-date.png",
            caption: "Step 1: Check POS Date & Time, press TAB to Yes, then press ENTER.",
            alt: "POS Start of Day date and time verification prompt"
          },
          {
            src: "/assets/modules/module-2-start-of-day/images/start-of-day-close-window.png",
            caption: "Step 2: Start of Day setup complete prompt with instructions to close window.",
            alt: "Start of Day setup completed message"
          },
          {
            src: "/assets/modules/module-2-start-of-day/images/pos-reloader-screen.png",
            caption: "Step 3: Press Ctrl+Alt+C to close the setup window. The browser displays 'POS Reloader'. Then press F5 to reload and enter the User Login page.",
            alt: "POS Reloader screen after closing setup window"
          }
        ],
        instructions: [
          "Upon terminal boot, verify that the POS Date & Time matches current store opening time.",
          "Press TAB to highlight the 'YES' button, then press ENTER.",
          "Press CTRL + ALT + C to close the setup dialog. The browser terminal displays 'POS Reloader'.",
          "Press F5 to reload the page and proceed to the USER LOGIN screen."
        ],
        keyCallouts: ["TAB: Navigate buttons", "ENTER: Confirm", "CTRL+ALT+C: Close setup window", "F5: Reload to Login"]
      },
      {
        id: "les-2-2",
        title: "Cashier Login & Safe Logout",
        objective: "Follow the approved F5 -> F8 sequence to safely sign out of your terminal.",
        deckSlideRef: "Slides 10-15",
        visualAssets: [
          {
            src: "/assets/modules/module-2-start-of-day/images/pos-login-credentials.png",
            caption: "Cashier Login: Enter employee username (e.g. 241209) and password to open POS register.",
            alt: "User Login window on POS terminal"
          },
          {
            src: "/assets/modules/module-2-start-of-day/images/pos-logout-step1-f5.png",
            caption: "Logout Step 1: On the Main Screen, press F5 (Option) to open the 2nd Screen.",
            alt: "Main screen with F5 Option key highlighted"
          },
          {
            src: "/assets/modules/module-2-start-of-day/images/pos-logout-step2-f8.png",
            caption: "Logout Step 2: On the 2nd Screen, press F8 (Logout).",
            alt: "2nd Screen with F8 Logout key highlighted"
          },
          {
            src: "/assets/modules/module-2-start-of-day/images/pos-logout-step3-confirm.png",
            caption: "Logout Step 3: 'Are you sure you want to LOGOUT?' Press TAB to Yes, then press ENTER.",
            alt: "Logout confirmation prompt"
          },
          {
            src: "/assets/modules/module-2-start-of-day/images/pos-logout-step4-user-login.png",
            caption: "Logout Step 4: After logout, the terminal returns to the User Login prompt.",
            alt: "Terminal returns to User Login prompt after successful logout"
          }
        ],
        instructions: [
          "Enter your assigned employee username and password to log in.",
          "To log out: Press F5 (Option) from the Main screen to view the 2nd screen.",
          "Press F8 (Logout).",
          "Press TAB key to move focus to the 'YES' button, then press ENTER to confirm.",
          "Verify the terminal displays the User Login window ready for the next shift."
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
        visualAssets: [
          {
            src: "/assets/modules/module-3-item-lookup-loyalty/images/f2-lookup-by-sku.png",
            caption: "F2 SKU/BARCODE - Search an item by its GTIN barcode or SKU number. The table shows SKU, Description, Author, SRP, and any active PROMO price.",
            alt: "F2 Lookup by SKU / Barcode screen"
          },
          {
            src: "/assets/modules/module-3-item-lookup-loyalty/images/f2-lookup-by-description.png",
            caption: "F3 DESCRIPTION - Type a keyword (e.g. 'harvard') to find all matching titles. Red highlighted row indicates a currently active promo price on the right column.",
            alt: "F2 Lookup by Description screen showing promo prices"
          }
        ],
        instructions: [
          "Press F2 (Lookup) from the main POS screen - the Lookup screen will open.",
          "Press F2 again inside Lookup to search by SKU / Barcode: scan or type the GTIN then press ENTER.",
          "Press F3 inside Lookup to search by Description: type a keyword and results appear instantly.",
          "The PROMO column on the right shows any active promotional price. Red rows indicate a promo is applied.",
          "Press ENTER or double-click a row to select the item, or press ALT+B (CANCEL) to exit without selecting."
        ],
        keyCallouts: ["F2: Open Lookup", "F2 (inside Lookup): SKU/Barcode search", "F3 (inside Lookup): Description search", "F11/F12: Scroll results up/down", "ENTER: Select item"]
      },
      {
        id: "les-3-2",
        title: "NBS Loyalty (LNC & LNQR)",
        objective: "Correctly prompt and tag customer loyalty membership and complete the LNQR flow during a transaction.",
        deckSlideRef: "Slides 21-24",
        visualAssets: [
          {
            src: "/assets/modules/module-3-item-lookup-loyalty/images/lnqr-choose-option-menu.png",
            caption: "After pressing F4 (Payment), the 'Choose Option' loyalty dialog appears. Press 1 for None, 2 for LNC Card, or 3 for LNQR / LNQR Plus.",
            alt: "Choose Option loyalty dialog with 1. None, 2. Laking National Card, 3. LNQR/LNQR Plus"
          },
          {
            src: "/assets/modules/module-3-item-lookup-loyalty/images/lnqr-select-option-3.png",
            caption: "Press 3 to select LNQR / LNQR PLUS. The option is highlighted in the dialog.",
            alt: "Choose Option dialog with option 3 LNQR/LNQR PLUS highlighted"
          },
          {
            src: "/assets/modules/module-3-item-lookup-loyalty/images/lnqr-scan-input-screen.png",
            caption: "The LNQR / LNQR PLUS input screen appears. Scan the customer's QR code or manually type the Customer LNQR Code. Press TAB to move to OK, then press ENTER.",
            alt: "LNQR input screen showing Scan Customer QR field with sample code 20221003LN000004"
          },
          {
            src: "/assets/modules/module-3-item-lookup-loyalty/images/lnqr-payment-cash-input.png",
            caption: "After confirming LNQR, the Cash Payment Details screen appears. Enter the tendered amount in the 'Enter Amount' field and press ENTER to process.",
            alt: "Cash Payment Details screen with Enter Amount field"
          },
          {
            src: "/assets/modules/module-3-item-lookup-loyalty/images/lnqr-payment-change-display.png",
            caption: "After processing, the 'Change' row turns red/blinking showing the change due to the customer. The message 'Dont press any key.. Please wait...' appears while the LNQR server is updating.",
            alt: "Payment screen showing Change row in red and Please wait message"
          },
          {
            src: "/assets/modules/module-3-item-lookup-loyalty/images/lnqr-updated-modal.png",
            caption: "A confirmation popup appears: 'LNQR has been updated!' showing the customer's name, card number, previous balance, earned Sulit Coins, and current balance. Press ENTER or click OK to return to the active register.",
            alt: "LNQR has been updated confirmation popup showing customer details and Sulit Coins"
          },
          {
            src: "/assets/modules/module-3-item-lookup-loyalty/images/lnqr-updated-confirmation-popup.png",
            caption: "The LNQR information is also printed on the receipt, including LNQR No. and Earned Sulit Coins - confirming the loyalty transaction is complete.",
            alt: "Receipt with LNQR information printed and LNQR updated popup"
          }
        ],
        instructions: [
          "Scan or enter the item(s) into the active register, then press F4 (Payment) to proceed to payment.",
          "A 'Choose Option' loyalty dialog appears - ask the customer if they have an NBS Loyalty membership:",
          "  • Press 1 - if the customer has NO loyalty card or QR code.",
          "  • Press 2 - if the customer has a physical Laking National Card (LNC).",
          "  • Press 3 - if the customer has LNQR or LNQR Plus (mobile app QR code).",
          "For LNQR (option 3): The LNQR input screen opens. Scan the customer QR code OR manually type the LNQR code. Press TAB to move focus to [Ok], then press ENTER.",
          "The Cash Payment Details screen appears. Enter the tendered cash amount and press ENTER to process the payment.",
          "The 'Change' field turns red and blinks - hand the change to the customer. The screen shows 'Dont press any key.. Please wait...' while contacting the LNQR server.",
          "A popup confirms: 'LNQR has been updated!' showing the customer name, card number, previous balance, earned Sulit Coins, and new balance. Press ENTER or click OK.",
          "The terminal returns to the active register home. The receipt automatically prints LNQR details including earned Sulit Coins."
        ],
        keyCallouts: ["F4: Payment", "1: No Loyalty", "2: LNC Card", "3: LNQR / LNQR Plus", "TAB: Move to OK", "ENTER: Confirm", "Change = Red blinking row"]
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
         visualAssets: [
          {
            src: "/assets/modules/module-4-main-page-keys/images/function-keys-mainpage.png",
            caption: "When a customer buys multiples of the same item, press F3 (Quantity), located on the function key row.",
            alt: ""
          },
          {
            src: "/assets/modules/module-4-main-page-keys/images/pos-quantity-step1-f3.png",
            caption: "Press F3 key on keyboard and enter how many pieces of items customer will buy, then press Enter key.",
            alt: "Checkout screen showing F3 Quantity prompt with sample input of 5"
          },
          {
            src: "/assets/modules/module-4-main-page-keys/images/pos-quantity-step2-f3.png",
            caption: "Scan or enter the item GTIN. The line item will immediately record with the entered quantity.",
            alt: "Checkout screen showing item scanned with quantity of 2"
          }
         
        ],
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

        visualAssets: [
          {
            src: "/assets/modules/module-4-main-page-keys/images/pos-itemvoid-step1-f7.png",
            caption: "Press F7 (Item Void) to cancel a single line item. The system requests manager override. Enter manager override username and password, then press ENTER.",
            alt: ""
          },
          {
            src: "/assets/modules/module-4-main-page-keys/images/pos-itemvoid-step2-f7.png",
            caption: "Select a cancellation reason and press Alt + Enter.",
            alt: ""
          },
          {
            src: "/assets/modules/module-4-main-page-keys/images/pos-itemvoid-step3-f7.png",
            caption: "Select item to void and press Alt + Enter.",
            alt: ""
          },
          {
            src: "/assets/modules/module-4-main-page-keys/images/pos-itemvoid-step4-f7.png",
            caption: "Quantity will turn negative, indicating the item has been voided.",
            alt: ""
          },

          {
            src: "/assets/modules/module-4-main-page-keys/images/pos-trxvoid-step1-f8.png",
            caption: "Press F8 (Trx Void) to cancel the entire transaction. The system requests manager override. Enter manager override username and password, then press ENTER.",
            alt: ""
          },

          {
            src: "/assets/modules/module-4-main-page-keys/images/pos-trxvoid-step2-f8.png",
            caption: "Press Y to confirm transaction void.",
            alt: ""
          },

          {
            src: "/assets/modules/module-4-main-page-keys/images/pos-trxvoid-step3-f8.png",
            caption: "Select a reason for trx void, and press Alt + Enter to continue.",
            alt: ""
          },
         
        ],
        
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
        visualAssets: [
          {
            src: "/assets/modules/module-5-second-page-functions/images/functionkeys-2ndpage.png",
            caption: "Press F5 (Option) from the Main Screen to enter the 2nd Page.",
            alt: ""
          },
        
          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-trxdisc-step1-f6.png",
            caption: "Navigate to 2nd page of POS.",
            alt: ""
          },
          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-trxdisc-step2-f6.png",
            caption: "Press F6 (TRX Disc) to open the discount category list.",
            alt: ""
          },
          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-trxdisc-step3-f6.png",
            caption: "Select the appropriate type of discount and press Alt + Enter.",
            alt: ""
          },

          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-trxdisc-step4-f6.png",
            caption: "Input manager override credentials when prompted.",
            alt: ""
          },

          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-famdisc-step1-f6.png",
            caption: "Navigate to 2nd page of POS, and press F6 (TRX Disc) to open the discount category list.",
            alt: ""
          },

          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-famdisc-step2-f6.png",
            caption: "Select the ZQFD LNQR family discount option and press Alt + Enter.",
            alt: ""
          },

          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-famdisc-step3-f6.png",
            caption: "Input manager override credentials when prompted. Press TAB key to YES and Enter to confirm.",
            alt: ""
          },
         {
            src: "/assets/modules/module-5-second-page-functions/images/pos-famdisc-step4-f6.png",
            caption: "Scan or enter manually the customers QR code. Press TAB key to OK, then click Enter key.",
            alt: ""
          }
         
        ],
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

        visualAssets: [

           {
            src: "/assets/modules/module-5-second-page-functions/images/pos-suspend-f9.png",
            caption: "On Main Screen, Press F9 (Suspend) to access the suspend function.",
            alt: ""
          },
        

          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-recall-step1-f7.png",
            caption: "Press F7 (Recall) to access the recall function.",
            alt: ""
          },

          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-recall-step2-f7.png",
            caption: "The system requests manager override. Enter manager override username and password, then press ENTER.",
            alt: ""
          },

          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-recall-step3-f7.png",
            caption: "Select the suspended transaction to recall and press Alt + Enter.",
            alt: ""
          },

          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-reprint-step1-f2.png",
            caption: "On the second page. Press F2 (Reprint) to access the reprint function.",
            alt: ""
          },

          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-reprint-step2-f2.png",
            caption: "Enter manager override credentials when prompted. Press TAB key to YES, then press ENTER.",
            alt: ""
          },

          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-reprint-step3-f2.png",
            caption: "Select OR Number and press Enter.",
            alt: ""
          }
        ],
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

