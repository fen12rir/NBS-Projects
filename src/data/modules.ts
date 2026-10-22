export interface VisualAsset {
  src: string;
  caption: string;
  alt: string;
  type?: "image" | "video";
}

export interface Lesson {
  id: string;
  title: string;
  objective: string;
  deckSlideRef: string;
  instructions: string[];
  keyCallouts: string[];
  visualAsset?: VisualAsset;
  visualAssets?: VisualAsset[];
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
  // =========================================================================
  // MODULE 1: POS Basics and Screen Layout
  // =========================================================================
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
        visualAssets: [
          {
            src: "/assets/modules/module-1-pos-basics/images/pos-screen-details.png",
            caption: "POS Screen Anatomy: Key screen regions including Transaction Info, Barcode Scanner Box, Function Keys Panel, and Totals Display.",
            alt: "Diagram of National Book Store POS Screen Details labeling all 12 key screen regions"
          }
        ],
        instructions: [
          "Understand that POS combines hardware (terminal, barcode scanner, receipt printer) and software.",
          "Familiarize with the 12 screen regions: Transaction No, Cashier ID, Branch Code, Barcode input, Textfield area, POS Terminal, Function Keys panel, Line item table, Total Sales, Current Date, Total Quantity, and Time.",
          "Verify the top header information matches your assigned terminal and cashier profile."
        ],
        keyCallouts: ["F2: Lookup", "F3: Quantity", "F4: Payment", "F5: Option / Next Page"]
      }
    ]
  },

  // =========================================================================
  // MODULE 2: Start of Day, Login, and Logout
  // =========================================================================
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
            caption: "Step 1: Check POS Date & Time, press TAB to highlight [Yes], then press ENTER to verify.",
            alt: "POS Start of Day date and time verification prompt"
          },
          {
            src: "/assets/modules/module-2-start-of-day/images/start-of-day-close-window.png",
            caption: "Step 2: Start of Day setup complete prompt with instructions to close window.",
            alt: "Start of Day setup completed message"
          },
          {
            src: "/assets/modules/module-2-start-of-day/images/pos-reloader-screen.png",
            caption: "Step 3: Press Ctrl+Alt+C to close the setup window. The terminal displays 'POS Reloader'. Press F5 to reload and enter the User Login page.",
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
            caption: "Logout Step 3: 'Are you sure you want to LOGOUT?' Press TAB to highlight [Yes], then press ENTER.",
            alt: "Logout confirmation prompt"
          },
          {
            src: "/assets/modules/module-2-start-of-day/images/pos-logout-step4-user-login.png",
            caption: "Logout Step 4: After logout, the terminal returns to the User Login prompt for the next shift.",
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

  // =========================================================================
  // MODULE 3: Item Lookup & Customer Loyalty (LNQR)
  // =========================================================================
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
            caption: "F3 DESCRIPTION - Type a keyword (e.g. 'harvard') to find matching titles. The highlighted row indicates the currently selected item (navigated via F11/F12), while the PROMO column on the right displays any active promotional price.",
            alt: "F2 Lookup by Description screen showing promo prices"
          }
        ],
        instructions: [
          "Press F2 (Lookup) from the main POS screen - the Lookup screen will open.",
          "Press F2 again inside Lookup to search by SKU / Barcode: scan or type the GTIN then press ENTER.",
          "Press F3 inside Lookup to search by Description: type a keyword and results appear instantly.",
          "The PROMO column on the right displays any active promotional price alongside the regular SRP. The highlighted bar indicates your currently selected item.",
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
        keyCallouts: ["F4: Payment", "1: No Loyalty", "2: LNC Card", "3: LNQR / LNQR Plus", "TAB: Move to OK", "ENTER: Confirm"]
      }
    ]
  },

  // =========================================================================
  // MODULE 4: Main-Page Keys & Transaction Basics
  // =========================================================================
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
            caption: "Main POS Screen Function Key Panel: F3 Quantity multiplier key located on the right function keys panel.",
            alt: "Main POS screen function keys column highlighting F3 Quantity button"
          },
          {
            src: "/assets/modules/module-4-main-page-keys/images/pos-quantity-step1-f3.png",
            caption: "Step 1: Press F3 (Quantity) to open the quantity multiplier prompt, enter the number of pieces (e.g. 5), then press ENTER.",
            alt: "Checkout screen displaying the F3 Quantity prompt with multiplier input"
          },
          {
            src: "/assets/modules/module-4-main-page-keys/images/pos-quantity-step2-f3.png",
            caption: "Step 2: Scan or type the item GTIN barcode. The line item automatically records with the designated multiplier quantity.",
            alt: "Line item table showing scanned merchandise with multiplied quantity"
          },
          {
            src: "/assets/modules/module-4-main-page-keys/videos/pos-quantity-video-f3.mp4",
            caption: "Video Walkthrough: Demonstrating setting item quantity multiplier via F3 and scanning items.",
            alt: "Video demonstration of setting item quantity in POS"
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
            caption: "Item Void Step 1: Press F7 (Item Void). Enter Manager Override username and password, then press ENTER.",
            alt: "Manager Override dialog for Item Void"
          },
          {
            src: "/assets/modules/module-4-main-page-keys/images/pos-itemvoid-step2-f7.png",
            caption: "Item Void Step 2: Select a cancellation reason code from the menu and press Alt + Enter.",
            alt: "Item void reason code selection prompt"
          },
          {
            src: "/assets/modules/module-4-main-page-keys/images/pos-itemvoid-step3-f7.png",
            caption: "Item Void Step 3: Highlight the line item to void and press Alt + Enter.",
            alt: "Selecting line item to cancel from the transaction list"
          },
          {
            src: "/assets/modules/module-4-main-page-keys/images/pos-itemvoid-step4-f7.png",
            caption: "Item Void Step 4: Line item quantity turns negative with red strikethrough in the transaction log.",
            alt: "Audit log showing negative voided line item"
          },
          {
            src: "/assets/modules/module-4-main-page-keys/videos/pos-itemvoid-video-f7.mp4",
            caption: "Video Walkthrough: Demonstrating single line Item Void with supervisor override.",
            alt: "Video demonstration of Item Void procedure"
          },
          {
            src: "/assets/modules/module-4-main-page-keys/images/pos-trxvoid-step1-f8.png",
            caption: "Trx Void Step 1: Press F8 (Trx Void) to cancel the entire sale. Enter Manager Override credentials and press ENTER.",
            alt: "Manager Override authorization prompt for Transaction Void"
          },
          {
            src: "/assets/modules/module-4-main-page-keys/images/pos-trxvoid-step2-f8.png",
            caption: "Trx Void Step 2: Press Y to confirm total transaction void cancellation.",
            alt: "Transaction void confirmation prompt"
          },
          {
            src: "/assets/modules/module-4-main-page-keys/images/pos-trxvoid-step3-f8.png",
            caption: "Trx Void Step 3: Select the reason code for transaction void and press Alt + Enter to finalize.",
            alt: "Transaction void reason code selection"
          },
          {
            src: "/assets/modules/module-4-main-page-keys/videos/pos-trxvoid-video-f8.mp4",
            caption: "Video Walkthrough: Demonstrating full Transaction Void cancellation.",
            alt: "Video demonstration of Transaction Void procedure"
          }
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

  // =========================================================================
  // MODULE 5: Second-Page Functions & Discounts
  // =========================================================================
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
            caption: "Press F5 (Option) from the Main Screen to enter the 2nd Screen function key panel.",
            alt: "2nd Screen function key layout showing Reprint, Trx Disc, Recall, and Logout"
          },
          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-trxdisc-step1-f6.png",
            caption: "Step 1: Navigate to the 2nd Screen of the POS register.",
            alt: "2nd Screen of POS register"
          },
          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-trxdisc-step2-f6.png",
            caption: "Step 2: Press F6 (TRX Disc) to open the discount category list.",
            alt: "Discount category list showing Senior, PWD, and Employee options"
          },
          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-trxdisc-step3-f6.png",
            caption: "Step 3: Select the appropriate statutory discount type (e.g. Senior 20%) and press Alt + Enter.",
            alt: "Selecting discount code and pressing Alt Enter"
          },
          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-trxdisc-step4-f6.png",
            caption: "Step 4: Input Manager Override credentials when prompted to apply the discount.",
            alt: "Manager Override authorization prompt for Transaction Discount"
          },
          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-famdisc-step1-f6.png",
            caption: "LNQR Family Discount: Navigate to the 2nd Screen and press F6 (TRX Disc).",
            alt: "2nd Screen with F6 TRX Disc highlighted for family discount"
          },
          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-famdisc-step2-f6.png",
            caption: "Select the ZQFD LNQR Family Discount option and press Alt + Enter.",
            alt: "Selecting ZQFD LNQR family discount option"
          },
          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-famdisc-step3-f6.png",
            caption: "Enter Manager Override credentials, press TAB to YES, and press ENTER to confirm.",
            alt: "Manager Override confirmation for LNQR Family Discount"
          },
          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-famdisc-step4-f6.png",
            caption: "Scan or manually enter customer's mobile QR code, press TAB to OK, and press ENTER.",
            alt: "Customer QR code entry screen for Family Discount"
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
            caption: "Suspend Step: On Main Screen, press F9 (Suspend) to temporarily place the active sale in the holding buffer.",
            alt: "Main screen with F9 Suspend highlighted"
          },
          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-recall-step1-f7.png",
            caption: "Recall Step 1: Navigate to 2nd Screen (F5) and press F7 (Recall) to access held transactions.",
            alt: "2nd Screen with F7 Recall highlighted"
          },
          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-recall-step2-f7.png",
            caption: "Recall Step 2: The system requests manager override. Enter manager credentials, then press ENTER.",
            alt: "Manager Override dialog for Recall Transaction"
          },
          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-recall-step3-f7.png",
            caption: "Recall Step 3: Select the suspended transaction from the queue and press Alt + Enter to restore.",
            alt: "Selecting suspended transaction from buffer list"
          },
          {
            src: "/assets/modules/module-5-second-page-functions/videos/pos-recall-video.mp4",
            caption: "Video Walkthrough: Demonstrating transaction suspension on Main Screen and recall on 2nd Screen.",
            alt: "Video demonstration of Suspend and Recall procedure"
          },
          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-reprint-step1-f2.png",
            caption: "Reprint Step 1: On the 2nd Screen, press F2 (Reprint) to initiate Official Receipt reprinting.",
            alt: "2nd Screen with F2 Reprint button highlighted"
          },
          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-reprint-step2-f2.png",
            caption: "Reprint Step 2: Enter Manager Override credentials when prompted, press TAB to YES, and press ENTER.",
            alt: "Manager Override authorization for Reprint Receipt"
          },
          {
            src: "/assets/modules/module-5-second-page-functions/images/pos-reprint-step3-f2.png",
            caption: "Reprint Step 3: Select the desired Official Receipt (OR) Number and press ENTER to print duplicate.",
            alt: "Selecting Official Receipt number for reprint"
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

  // =========================================================================
  // MODULE 6: Third-Page Functions & Store Readings
  // =========================================================================
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
        visualAssets: [
          {
            src: "/assets/modules/module-6-third-page-functions/images/function-keys-3rdpage.png",
            caption: "3rd Screen Function Keys Overview: Post Void, Sales Journal, Cashier Reading, Terminal Reading, and SDV.",
            alt: "3rd Screen function keys column diagram"
          },
          {
            src: "/assets/modules/module-6-third-page-functions/images/function-keys-3rdpage-2.png",
            caption: "Press F5 twice to cycle through function screens: Main -> 2nd -> 3rd Screen.",
            alt: "Navigation sequence to reach 3rd screen"
          },
          {
            src: "/assets/modules/module-6-third-page-functions/images/pos-cashierread-step1-f8.png",
            caption: "Cashier Y-Reading Step 1: Press F8 (Cashier Rdg) on the 3rd Screen for end-of-shift reconciliation.",
            alt: "3rd Screen with F8 Cashier Rdg button highlighted"
          },
          {
            src: "/assets/modules/module-6-third-page-functions/images/pos-cashierread-step2-f8.png",
            caption: "Cashier Y-Reading Step 2: Press ENTER to generate and print the shift Y-Reading financial summary.",
            alt: "Generating Y-Reading summary printout"
          },
          {
            src: "/assets/modules/module-6-third-page-functions/images/pos-terminalread-step1-f9.png",
            caption: "Terminal Z-Reading Step 1: Press F9 (Terminal Rdg) on the 3rd Screen for end-of-day store closing.",
            alt: "3rd Screen with F9 Terminal Rdg button highlighted"
          },
          {
            src: "/assets/modules/module-6-third-page-functions/images/pos-terminalread-step2-f9.png",
            caption: "Terminal Z-Reading Step 2: A confirmation prompt appears. Press TAB to highlight [Yes], then press ENTER.",
            alt: "Terminal Reading confirmation prompt"
          },
          {
            src: "/assets/modules/module-6-third-page-functions/images/pos-terminalread-step3-f9.png",
            caption: "Terminal Z-Reading Step 3: Press ENTER to generate and print the final Z-Reading report.",
            alt: "Final Z-Reading accounting report generation"
          }
        ],
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
        visualAssets: [
          {
            src: "/assets/modules/module-6-third-page-functions/images/pos-sdv-step1-f10.png",
            caption: "SDV Step 1: On the 3rd Screen, press F10 (SDV) at the bottom of the function key column.",
            alt: "3rd Screen with F10 SDV button highlighted"
          },
          {
            src: "/assets/modules/module-6-third-page-functions/images/pos-sdv-step2-f10.png",
            caption: "SDV Step 2: Inspect the SDV audit table and ensure Header, Detail, and PayDetail counts indicate 'Tally'.",
            alt: "Sales Data Verification audit screen confirming all counts tally"
          }
        ],
        instructions: [
          "On the 3rd Page, press F10 (SDV).",
          "Check whether the Header, Detail, and PayDetail counts are listed as 'Tally'.",
          "If any row indicates 'Not Tally', take note of the discrepancy and immediately contact the Service Desk."
        ],
        keyCallouts: ["F10 (3rd): SDV Check"]
      }
    ]
  },

  // =========================================================================
  // MODULE 7: Fourth-Page Functions & Exceptions
  // =========================================================================
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
        visualAssets: [
          {
            src: "/assets/modules/module-7-fourth-page-functions/images/functionkeys-4thpage.png",
            caption: "Press F5 three times to advance from Main -> 2nd -> 3rd -> 4th Screen.",
            alt: "4th Screen function key layout showing Best Buy, Trx Comment, Non Sales, Zero Rated, Return, Refund"
          },
          {
            src: "/assets/modules/module-7-fourth-page-functions/images/pos-trxcomment-step1-f3.png",
            caption: "Step 1: Press F3 (TRX Comment) on the 4th Screen to open corporate billing details.",
            alt: "4th Screen with F3 TRX Comment button highlighted"
          },
          {
            src: "/assets/modules/module-7-fourth-page-functions/images/pos-trxcomment-step2-f3.png",
            caption: "Step 2: Enter customer company name, registered business address, and TIN, then press OK.",
            alt: "Transaction Comment entry dialog for corporate customer details"
          },
          {
            src: "/assets/modules/module-7-fourth-page-functions/images/pos-trxcomment-step3-f3.png",
            caption: "Step 3: The transaction comments are recorded and will automatically print on the official sales invoice receipt.",
            alt: "Receipt preview with corporate TIN and buyer address printed"
          }
        ],
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
        visualAssets: [
          {
            src: "/assets/modules/module-7-fourth-page-functions/images/pos-return-step1-f8.png",
            caption: "Return Step 1: Press F8 (Return) on the 4th Screen and enter Manager Override credentials when prompted.",
            alt: "Manager Override prompt for Item Return"
          },
          {
            src: "/assets/modules/module-7-fourth-page-functions/images/pos-return-step2-f8.png",
            caption: "Return Step 2: Select the return reason code, input the customer's Sales Invoice (SI) number, and press Alt + Enter.",
            alt: "Return reason code and Sales Invoice entry screen"
          },
          {
            src: "/assets/modules/module-7-fourth-page-functions/images/pos-return-step3-f8.png",
            caption: "Return Step 3: Enter the GTIN barcode of the returned item; credit calculations reflect automatically upon pressing ENTER.",
            alt: "Scanning returned item GTIN barcode"
          },
          {
            src: "/assets/modules/module-7-fourth-page-functions/videos/pos-return-video.mp4",
            caption: "Video Walkthrough: Demonstrating customer item Return/Exchange workflow.",
            alt: "Video demonstration of Item Return procedure"
          },
          {
            src: "/assets/modules/module-7-fourth-page-functions/images/pos-refund-step1-f10.png",
            caption: "Refund Step 1: Press F10 (Refund) on the 4th Screen and enter Manager Override credentials when prompted.",
            alt: "Manager Override prompt for Cash Refund"
          },
          {
            src: "/assets/modules/module-7-fourth-page-functions/images/pos-refund-step2-f10.png",
            caption: "Refund Step 2: Enter the original Official Receipt (OR) Number for the refund, then press Alt + Enter to proceed.",
            alt: "Entering original OR number for cash refund"
          },
          {
            src: "/assets/modules/module-7-fourth-page-functions/images/pos-zerorated-step1-f7.png",
            caption: "Zero-Rated Step 1: Press F7 (Zero Rated) on the 4th Screen before scanning items.",
            alt: "4th Screen with F7 Zero Rated button highlighted"
          },
          {
            src: "/assets/modules/module-7-fourth-page-functions/images/pos-zerorated-step2-f7.png",
            caption: "Zero-Rated Step 2: Enter Manager Override credentials to authorize VAT-exempt status.",
            alt: "Manager Override authorization for Zero-Rated Sale"
          },
          {
            src: "/assets/modules/module-7-fourth-page-functions/images/pos-zerorated-step3-f7.png",
            caption: "Zero-Rated Step 3: Scan tax-exempt items with VAT automatically removed from the total.",
            alt: "Scanning items under Zero-Rated VAT exemption"
          },
          {
            src: "/assets/modules/module-7-fourth-page-functions/videos/pos-zerorated-video.mp4",
            caption: "Video Walkthrough: Demonstrating Zero-Rated sale authorization and scanning.",
            alt: "Video demonstration of Zero-Rated transaction"
          }
        ],
        instructions: [
          "For Returns: Press F8 (Return) on 4th Page, enter override, input customer Sales Invoice (SI), and enter returned GTIN.",
          "For Refunds: Press F10 (Refund), supply manager override, and enter the original ORNO.",
          "For Zero-Rated sales: Press F7 (Zero Rated) before scanning vatable items to apply VAT exemption."
        ],
        keyCallouts: ["F8 (4th): Return", "F10 (4th): Refund", "F7 (4th): Zero Rated"]
      }
    ]
  },

  // =========================================================================
  // MODULE 8: Payment Screen & Tender Methods
  // =========================================================================
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
        visualAssets: [
          {
            src: "/assets/modules/module-8-payment-screens/images/functionkeys-paymentscreen.png",
            caption: "Payment Screen Function Keys: F1 Cancel, F2 Cash, F3 Bank Card, F5 Gift Cert, F6 Coupon, F8 Credit Memo, F9 Sulit Coins.",
            alt: "Payment screen tender buttons layout"
          },
          {
            src: "/assets/modules/module-8-payment-screens/images/pos-cashpayment-step1-f2.png",
            caption: "Cash Tender: Press F2 (Cash) on Payment Screen to enter amount handed by customer.",
            alt: "Payment screen with F2 Cash tender button highlighted"
          }
        ],
        instructions: [
          "When all items are entered on the Main screen, press F4 (Payment).",
          "In the Choose Option dialog, select option 1 (None) if the customer has no loyalty card (or 2 for LNC / 3 for LNQR).",
          "On the authentic Payment Screen, cash payment is active by default (or press F2 Cash).",
          "Type the amount handed by the customer (e.g. 250.00 or 500.00).",
          "Press Enter or click [Ok] to confirm tender.",
          "Observe the calculated Change due to the customer and wait for the simulated receipt to generate."
        ],
        keyCallouts: ["F4: Payment Flow", "1: None (or 2/3 for Loyalty)", "F2 / Enter: Cash Tender"]
      },
      {
        id: "les-8-2",
        title: "Bank Cards, GCash, Gift Certificates & Sulit Coins",
        objective: "Tender electronic payments, mobile wallets, and voucher codes.",
        deckSlideRef: "Slides 104-116",
        visualAssets: [
          {
            src: "/assets/modules/module-8-payment-screens/images/pos-cardpayment-step1-f3.png",
            caption: "Card Payment Step 1: Press F3 (Bank Card) on Payment Screen, choose Credit Card, and enter the card number.",
            alt: "Credit Card tender entry screen"
          },
          {
            src: "/assets/modules/module-8-payment-screens/images/pos-cardpayment-step2-f3.png",
            caption: "Card Payment Step 2: Fill out required authorization details and confirmation.",
            alt: "Card authorization details prompt"
          },
          {
            src: "/assets/modules/module-8-payment-screens/images/pos-gcash-step1-f3.png",
            caption: "GCash Tender: Press F3 (Bank Card), select GCash option, and enter the 12-digit transaction reference number.",
            alt: "GCash mobile wallet payment entry screen"
          },
          {
            src: "/assets/modules/module-8-payment-screens/images/pos-giftcard-step1-f3.png",
            caption: "NBS Gift Card: Press F3 (Bank Card), select NBS Giftcard, and input the voucher credentials.",
            alt: "NBS Gift Card redemption screen"
          },
          {
            src: "/assets/modules/module-8-payment-screens/images/pos-giftcert-step1-f5.png",
            caption: "Gift Certificate Step 1: Press F5 (Gift Cert), select certificate series type, and scan or type GC number.",
            alt: "Gift Certificate category selection"
          },
          {
            src: "/assets/modules/module-8-payment-screens/images/pos-giftcert-step2-f5.png",
            caption: "Gift Certificate Step 2: Fill in the required verification details of the gift certificate.",
            alt: "Gift Certificate details entry prompt"
          },
          {
            src: "/assets/modules/module-8-payment-screens/images/pos-coupon-step1-f6.png",
            caption: "Coupon Step 1: Press F6 (Coupon), choose series category, and select the promotional coupon type.",
            alt: "Coupon category selection screen"
          },
          {
            src: "/assets/modules/module-8-payment-screens/images/pos-coupon-step2-f6.png",
            caption: "Coupon Step 2: Fill in the required details of the promotional coupon.",
            alt: "Coupon details entry prompt"
          },
          {
            src: "/assets/modules/module-8-payment-screens/images/pos-sulitcoins-step1.png",
            caption: "Sulit Coins Step 1: Press F3 (Bank Card), select LNQR Sulit Coins, press TAB to highlight [Ok], and press ENTER.",
            alt: "Selecting LNQR Sulit Coins option on Payment screen"
          },
          {
            src: "/assets/modules/module-8-payment-screens/images/pos-sulitcoins-step2.png",
            caption: "Sulit Coins Step 2: Enter the Sulit Coins amount to redeem, press TAB, scan customer's LNQR barcode, and confirm.",
            alt: "Sulit Coins amount and customer QR code entry screen"
          },
          {
            src: "/assets/modules/module-8-payment-screens/images/pos-sulitcoins-step3.png",
            caption: "Sulit Coins Step 3: Confirmation popup displays completed LNQR processing; press ENTER to finalize receipt.",
            alt: "Confirmation popup for completed Sulit Coins redemption"
          },
          {
            src: "/assets/modules/module-8-payment-screens/videos/pos-sulitcoins-video.mp4",
            caption: "Video Walkthrough: Demonstrating full LNQR Sulit Coins loyalty redemption and payment.",
            alt: "Video demonstration of Sulit Coins payment flow"
          }
        ],
        instructions: [
          "When items are entered, press F4 (Payment) and select loyalty option (Option 1 None if no loyalty, 2 for LNC, 3 for LNQR).",
          "On the Payment Screen, press F3 (Bank Card) for Credit/Debit Card, GCash, or QR PH.",
          "For GCash: Enter the 12-digit transaction reference number and tender amount.",
          "For Gift Certificates: Press F5 (Gift Cert), select series type, and enter the certificate code.",
          "For Sulit Coins: Press F3 (Bank Card), select LNQR Sulit Coins, input coin amount, and enter the customer's LNQR code."
        ],
        keyCallouts: ["F4: Payment", "Option 1: None", "F3: Bank Card / GCash", "F5: Gift Cert", "F6: Coupon"]
      }
    ]
  },

  // =========================================================================
  // MODULE 9: Knowledge Check & Practical Certification
  // =========================================================================
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
        visualAssets: [
          {
            src: "/assets/modules/module-9-finalreview/images/exam-feedback.png",
            caption: "Practical Certification Assessment Preview: Comprehensive evaluation across all 5 POS screens and function keys.",
            alt: "Exam feedback overview illustrating practical simulator certification assessment"
          }
        ],
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
