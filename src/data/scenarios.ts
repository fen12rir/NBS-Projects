import { TRAINING_MODULES } from "./modules";

export interface ScenarioStep {
  stepNumber: number;
  instruction: string;
  expectedAction: string;
  expectedData?: string | number;
  hint: string;
  errorFeedback: string;
}

export interface TrainingScenario {
  id: string;
  title: string;
  description: string;
  moduleRef: string;
  lessonRef?: string; 
  passingScore: number; 
  steps: ScenarioStep[];
}

export const TRAINING_SCENARIOS: TrainingScenario[] = [
  // =========================================================================
  // MODULE 1: POS BASICS & SCREEN LAYOUT
  // =========================================================================
  {
    id: "scen-les-1-1",
    title: "Lesson 1-1 Practice: Screen Layout & Function Pages",
    description: "Explore the 12 key screen regions, practice item barcode lookup with F2, and navigate function pages using F5.",
    moduleRef: "mod-1",
    lessonRef: "les-1-1",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Open the Product Lookup screen. Press F2 (LOOKUP) under the barcode scanner.",
        expectedAction: "LOOKUP",
        hint: "Click F2 Lookup under the barcode scanner or press F2 on your keyboard.",
        errorFeedback: "Press F2 (LOOKUP) to inspect product pricing."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Exit the Lookup screen and return to the active terminal. Click CANCEL <Alt-B> or press ESC.",
        expectedAction: "CLOSE_LOOKUP",
        hint: "Click CANCEL <Alt-B> on the green bottom bar or press ESC on your keyboard.",
        errorFeedback: "Click CANCEL <Alt-B> or press ESC to return to the Main Screen."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Explore the right function keypad. Press F5 (OPTION) to advance from the Main Screen to the 2nd Screen.",
        expectedAction: "NAV_SECOND",
        hint: "Click F5 OPTION on the right button column or press F5 on your keyboard.",
        errorFeedback: "Press F5 (OPTION) on the right column to advance to the 2nd Screen."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Press F5 (NEXT OPTION) on the 2nd Screen to advance to the 3rd Screen.",
        expectedAction: "NAV_THIRD",
        hint: "Click F5 NEXT OPTION on the right button column or press F5 on your keyboard.",
        errorFeedback: "Press F5 to advance to the 3rd Screen."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Press F5 (NEXT OPTION) on the 3rd Screen to advance to the 4th Screen.",
        expectedAction: "NAV_FOURTH",
        hint: "Click F5 NEXT OPTION on the right button column or press F5 on your keyboard.",
        errorFeedback: "Press F5 to advance to the 4th Screen."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Press F5 (NEXT OPTION) on the 4th Screen to return to the Main Screen.",
        expectedAction: "NAV_MAIN",
        hint: "Click F5 NEXT OPTION on the right button column to complete the page cycle.",
        errorFeedback: "Press F5 on the 4th Screen to return to the Main Screen."
      }
    ]
  },
  {
    id: "scen-mod-1",
    title: "Module 1 Assessment: Terminal Anatomy & Live Screen Inspection",
    description: "Test your mastery of the POS interface by toggling Customer Service Assistant (CSA), scanning a test item to inspect live LED and line-item regions, checking Lookup, and cycling all 4 function screens.",
    moduleRef: "mod-1",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Test the horizontal utility bar under the barcode scanner. Press F10 (CSA ON/OFF) to toggle the Customer Service Assistant.",
        expectedAction: "CSA_TOGGLE",
        hint: "Click the CSA ON/OFF (F10) button below the yellow barcode field or press F10.",
        errorFeedback: "Press F10 (CSA ON/OFF) under the barcode input area."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Scan or enter 'NBS-CAL-005' (Casio Scientific Calculator) into the Barcode field and press ENTER to observe the Line Item table and green LED display update.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-CAL-005",
        hint: "Type NBS-CAL-005 in the yellow Scan or Enter UPC box and press Enter.",
        errorFeedback: "Enter 'NBS-CAL-005' and press Enter to populate the line item table."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Open Product Lookup to verify catalog pricing. Press F2 (LOOKUP).",
        expectedAction: "LOOKUP",
        hint: "Press F2 on your keyboard or click Lookup F2.",
        errorFeedback: "Press F2 (LOOKUP) to open the Product Lookup screen."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Exit Product Lookup back to the Main Screen. Click CANCEL <Alt-B> or press ESC.",
        expectedAction: "CLOSE_LOOKUP",
        hint: "Click CANCEL <Alt-B> on the bottom bar or press ESC.",
        errorFeedback: "Close the Lookup screen using CANCEL <Alt-B> or ESC."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Navigate from the Main Screen to the 2nd Screen by pressing F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Click F5 Option on the right function keypad.",
        errorFeedback: "Press F5 to open the 2nd Screen."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Advance to the 3rd Screen by pressing F5 (NEXT OPTION).",
        expectedAction: "NAV_THIRD",
        hint: "Click F5 Next Option on the right function keypad.",
        errorFeedback: "Press F5 to open the 3rd Screen."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: Advance to the 4th Screen by pressing F5 (NEXT OPTION), then press F5 once more in Step 8 to return to Main.",
        expectedAction: "NAV_FOURTH",
        hint: "Click F5 Next Option to reach the 4th Screen.",
        errorFeedback: "Press F5 to open the 4th Screen."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: Complete the full keypad cycle by pressing F5 (NEXT OPTION) to return to the Main Screen.",
        expectedAction: "NAV_MAIN",
        hint: "Click F5 Next Option on the 4th Screen to return to the Main Screen.",
        errorFeedback: "Press F5 to return to the Main Screen."
      }
    ]
  },

  // =========================================================================
  // MODULE 2: START OF DAY, LOGIN, AND LOGOUT
  // =========================================================================
  {
    id: "scen-les-2-1",
    title: "Lesson 2-1 Practice: Start of Day Verification",
    description: "Practice the start-of-day terminal sequence: verify date and time, close setup window with Ctrl+Alt+C, and reload with F5 to reach the login screen.",
    moduleRef: "mod-2",
    lessonRef: "les-2-1",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: You're at the terminal before the store opens. Verify the date and time on the Start of Day screen. Press TAB to select [Yes] and press ENTER (or click [Yes]).",
        expectedAction: "VERIFY_DATE_YES",
        hint: "Press TAB to highlight the 'Yes' button and press ENTER, or click the [Yes] button.",
        errorFeedback: "Verify the date and time by clicking [Yes] or pressing TAB then Enter."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Date verified! Now close the setup window by pressing Ctrl+Alt+C (or click 'Close Window (Ctrl+Alt+C)').",
        expectedAction: "CLOSE_SOD_WINDOW",
        hint: "Press Ctrl+Alt+C on your keyboard or click 'Close Window (Ctrl+Alt+C)'.",
        errorFeedback: "Press Ctrl+Alt+C or click to close the setup window."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: The browser now displays 'POS Reloader'. Press F5 (or click 'Reload Page (F5)') to reload and open the USER LOGIN screen.",
        expectedAction: "RELOAD_POS_LOGIN",
        hint: "Press F5 on your keyboard or click 'Reload Page (F5)' to load the login page.",
        errorFeedback: "Press F5 or click to reload and open the login page."
      }
    ]
  },
  {
    id: "scen-les-2-2",
    title: "Lesson 2-2 Practice: Cashier Login & Safe Logout",
    description: "Practice entering your credentials in USER LOGIN, opening the register, and executing the approved F5 → F8 safe logout sequence.",
    moduleRef: "mod-2",
    lessonRef: "les-2-2",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: In the USER LOGIN window, enter or verify UserName '241209' and Password, then click [Ok] or press ENTER to sign in.",
        expectedAction: "LOGIN_SUBMIT",
        hint: "Click [Ok] or press ENTER in the USER LOGIN dialog to log in.",
        errorFeedback: "Enter your cashier credentials and click [Ok] to log in."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: You are now logged into the sales register. Navigate to the 2nd screen where cashier logout is located. Press F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Press F5 on your keyboard or click F5 OPTION on the right column.",
        errorFeedback: "Press F5 to advance to the 2nd Screen."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: On the 2nd Screen, initiate safe cashier sign-out by clicking F8 (LOGOUT).",
        expectedAction: "TRIGGER_LOGOUT",
        hint: "Click F8 LOGOUT in the right function key column or press F8.",
        errorFeedback: "Click F8 LOGOUT on the 2nd screen."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: The LOGOUT prompt appears ('Are you sure you want to LOGOUT?'). Press TAB to [Yes] and press ENTER (or click [Yes]) to safely return to the User Login screen.",
        expectedAction: "CONFIRM_LOGOUT_YES",
        hint: "Click [Yes] or press TAB then ENTER to confirm logout and return to the User Login screen.",
        errorFeedback: "Confirm logout by selecting [Yes] on the prompt."
      }
    ]
  },
  {
    id: "scen-mod-2",
    title: "Module 2 Assessment: Full Opening, Active Shift Check & Safe Handover",
    description: "Complete an end-to-end shift assessment: verify Start-of-Day date/time, close setup, reload POS, sign in, verify the register by scanning an item and voiding/clearing before break, and execute safe F5 -> F8 logout.",
    moduleRef: "mod-2",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Verify POS Date & Time on the Start of Day prompt. Press TAB to [Yes] and press ENTER (or click [Yes]).",
        expectedAction: "VERIFY_DATE_YES",
        hint: "Press TAB to highlight 'Yes' and press ENTER, or click [Yes].",
        errorFeedback: "Verify the date and time by clicking [Yes] or pressing TAB then Enter."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Close the Start-of-Day setup window by pressing Ctrl+Alt+C (or click 'Close Window (Ctrl+Alt+C)').",
        expectedAction: "CLOSE_SOD_WINDOW",
        hint: "Press Ctrl+Alt+C on your keyboard or click 'Close Window (Ctrl+Alt+C)'.",
        errorFeedback: "Press Ctrl+Alt+C or click to close the setup window."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: On the 'POS Reloader' screen, press F5 (or click 'Reload Page (F5)') to launch the USER LOGIN screen.",
        expectedAction: "RELOAD_POS_LOGIN",
        hint: "Press F5 on your keyboard or click 'Reload Page (F5)'.",
        errorFeedback: "Press F5 or click to reload and open the login page."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Sign in with your cashier credentials ('241209') by clicking [Ok] or pressing ENTER.",
        expectedAction: "LOGIN_SUBMIT",
        hint: "Click [Ok] or press ENTER in the USER LOGIN dialog.",
        errorFeedback: "Submit your cashier login credentials to open the register."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Once inside the active register, perform a quick price-lookup check before your shift starts by pressing F2 (LOOKUP).",
        expectedAction: "LOOKUP",
        hint: "Press F2 or click Lookup F2 under the barcode field.",
        errorFeedback: "Press F2 (LOOKUP) to verify the catalog lookup screen."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Close the Lookup screen (click CANCEL <Alt-B> or press ESC) to return to the Main Screen.",
        expectedAction: "CLOSE_LOOKUP",
        hint: "Click CANCEL <Alt-B> on the green bottom bar or press ESC.",
        errorFeedback: "Exit Lookup using CANCEL <Alt-B> or ESC."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: Time for shift handover! Navigate to the 2nd Screen by pressing F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Press F5 or click F5 OPTION on the right column.",
        errorFeedback: "Press F5 to advance to the 2nd Screen."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: On the 2nd Screen, press F8 (LOGOUT) to initiate cashier sign-out.",
        expectedAction: "TRIGGER_LOGOUT",
        hint: "Click F8 LOGOUT in the right function key column or press F8.",
        errorFeedback: "Click F8 LOGOUT on the 2nd screen."
      },
      {
        stepNumber: 9,
        instruction: "Step 9: Confirm the LOGOUT prompt by pressing TAB to [Yes] and pressing ENTER (or click [Yes]).",
        expectedAction: "CONFIRM_LOGOUT_YES",
        hint: "Click [Yes] or press TAB then ENTER to complete logout.",
        errorFeedback: "Confirm logout by selecting [Yes] on the prompt."
      }
    ]
  },

  // =========================================================================
  // MODULE 3: ITEM LOOKUP & CUSTOMER LOYALTY (LNQR)
  // =========================================================================
  {
    id: "scen-les-3-1",
    title: "Lesson 3-1 Practice: Product Lookup (SRP & Promo)",
    description: "Inquire about item prices using F2 Lookup, search by SKU or description, and verify promotional and SRP pricing.",
    moduleRef: "mod-3",
    lessonRef: "les-3-1",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Open the Product Lookup screen. Press F2 (LOOKUP) under the barcode scanner.",
        expectedAction: "LOOKUP",
        hint: "Press F2 on your keyboard or click F2 Lookup under the barcode scanner.",
        errorFeedback: "Press F2 (LOOKUP) to open the product lookup screen."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Inspect item pricing and promos. Press F3 (Description) or search by SKU/barcode.",
        expectedAction: "LOOKUP_SEARCH",
        hint: "Press F3 on your keyboard or click F3 Description in the lookup bar.",
        errorFeedback: "Press F3 or use F2 to search items in lookup."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Close lookup to return to active sale. Click CANCEL <Alt-B> (or press ESC on your keyboard).",
        expectedAction: "CLOSE_LOOKUP",
        hint: "Click CANCEL <Alt-B> on the green bottom bar or press ESC on your keyboard.",
        errorFeedback: "Click CANCEL <Alt-B> or press ESC to return to the active register."
      }
    ]
  },
  {
    id: "scen-les-3-2",
    title: "Lesson 3-2 Practice: NBS Loyalty (LNQR Flow)",
    description: "Complete the authentic NBS Loyalty flow: input product, proceed to payment, choose option 3 for LNQR, enter customer QR code, tender cash, observe the red blinking change, and confirm the LNQR updated dialog.",
    moduleRef: "mod-3",
    lessonRef: "les-3-2",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Input a product to start the sale. Type or scan 'NBS-BK-001' into the Barcode field (or click Catalog Quick-Fill) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-BK-001",
        hint: "Type NBS-BK-001 in the yellow barcode field and press Enter.",
        errorFeedback: "Please scan or enter NBS-BK-001 into the register."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: The customer is ready to pay. Press F4 (Payment) on the right function keypad.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 on your keyboard or click F4 Payment in the right column.",
        errorFeedback: "Press F4 (Payment) to proceed to payment."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: The 'Choose Option' loyalty prompt appears. The customer has LNQR - press 3 on your keyboard (or click '3. LNQR / LNQR PLUS').",
        expectedAction: "CHOOSE_LNQR_OPTION",
        hint: "Press key 3 on your keyboard or click '3. LNQR / LNQR PLUS'.",
        errorFeedback: "Press 3 to choose LNQR / LNQR PLUS."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: The LNQR input screen appears. Scan or verify the customer QR code '20221003LN000004', press TAB to highlight [Ok], then press ENTER (or click [Ok]).",
        expectedAction: "SUBMIT_LNQR",
        hint: "Press TAB to highlight [Ok] and press ENTER, or click the [Ok] button.",
        errorFeedback: "Submit the customer QR code by clicking [Ok] or pressing Enter."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: On the Cash Payment Details screen, enter the tendered cash amount '3000' and press ENTER (or click [Ok]).",
        expectedAction: "SUBMIT_CASH_TENDER",
        hint: "Enter 3000 in the Enter Amount field and press Enter.",
        errorFeedback: "Enter the cash amount and press Enter to process payment."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: The system displays the red blinking 'Change' and connects to the LNQR Server. When the 'LNQR has been updated!' confirmation appears, press ENTER (or click [OK]) to return to the active register.",
        expectedAction: "CONFIRM_LNQR_UPDATED",
        hint: "Click [OK] or press ENTER in the confirmation popup to finish the transaction.",
        errorFeedback: "Confirm the LNQR updated dialog by pressing Enter or clicking [OK]."
      }
    ]
  },
  {
    id: "scen-mod-3",
    title: "Module 3 Assessment: Multi-Item Price Inquiry & LNQR Loyalty Checkout",
    description: "Test your Module 3 mastery with a different customer basket: perform a price inquiry on Lookup, scan two different items (A4 Copy Paper and Color Pencils), process LNQR loyalty tagging, and complete cash tender.",
    moduleRef: "mod-3",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: A customer asks to check book and supply prices first. Open Product Lookup by pressing F2 (LOOKUP).",
        expectedAction: "LOOKUP",
        hint: "Press F2 on your keyboard or click F2 Lookup under the barcode scanner.",
        errorFeedback: "Press F2 (LOOKUP) to open the product lookup screen."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Search the catalog inside Lookup by pressing F3 (Description) or F2 (SKU/Barcode).",
        expectedAction: "LOOKUP_SEARCH",
        hint: "Press F3 on your keyboard or click F3 Description in the lookup bar.",
        errorFeedback: "Press F3 or F2 to search items in lookup."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Exit Lookup to begin scanning the customer's items. Click CANCEL <Alt-B> (or press ESC).",
        expectedAction: "CLOSE_LOOKUP",
        hint: "Click CANCEL <Alt-B> on the green bottom bar or press ESC.",
        errorFeedback: "Click CANCEL <Alt-B> or press ESC to return to the active register."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Scan the customer's first item: enter 'NBS-PAP-003' (Hard Copy A4 Bond Paper) into the Barcode field and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-PAP-003",
        hint: "Type NBS-PAP-003 in the yellow barcode field and press Enter.",
        errorFeedback: "Please scan or enter 'NBS-PAP-003' (A4 Copy Paper) into the register."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Scan the customer's second item: enter 'NBS-ART-004' (Faber-Castell Color Pencils) into the Barcode field and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-ART-004",
        hint: "Type NBS-ART-004 in the yellow barcode field and press Enter.",
        errorFeedback: "Please scan or enter 'NBS-ART-004' (Color Pencils) into the register."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Both items are scanned. Proceed to payment by pressing F4 (Payment).",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 on your keyboard or click F4 Payment in the right column.",
        errorFeedback: "Press F4 (Payment) to proceed to payment."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: In the 'Choose Option' loyalty dialog, select LNQR / LNQR PLUS by pressing 3 (or clicking option 3).",
        expectedAction: "CHOOSE_LNQR_OPTION",
        hint: "Press key 3 on your keyboard or click '3. LNQR / LNQR PLUS'.",
        errorFeedback: "Press 3 to choose LNQR / LNQR PLUS."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: Verify the customer's LNQR code '20221003LN000004' and submit by pressing TAB then ENTER (or clicking [Ok]).",
        expectedAction: "SUBMIT_LNQR",
        hint: "Press TAB to highlight [Ok] and press ENTER, or click [Ok].",
        errorFeedback: "Submit the customer QR code by clicking [Ok] or pressing Enter."
      },
      {
        stepNumber: 9,
        instruction: "Step 9: On the Cash Payment Details screen, enter or confirm the tendered cash amount and press ENTER (or click [Ok]).",
        expectedAction: "SUBMIT_CASH_TENDER",
        hint: "Press Enter or click Process Payment / Ok to tender cash.",
        errorFeedback: "Submit the cash tender amount to process payment."
      },
      {
        stepNumber: 10,
        instruction: "Step 10: Wait for the red blinking 'Change' and 'LNQR has been updated!' popup, then press ENTER (or click [OK]) to complete the assessment.",
        expectedAction: "CONFIRM_LNQR_UPDATED",
        hint: "Click [OK] or press ENTER in the confirmation popup.",
        errorFeedback: "Confirm the LNQR updated dialog by pressing Enter or clicking [OK]."
      }
    ]
  },

  // =========================================================================
  // MODULE 4: MAIN-PAGE KEYS & TRANSACTION BASICS
  // =========================================================================
  {
    id: "scen-les-4-1",
    title: "Lesson 4-1 Practice: Quantity Multiplier & Item Scanning",
    description: "Practice using F3 (Quantity) to set an item multiplier before scanning a barcode so multiple identical items record in a single scan.",
    moduleRef: "mod-4",
    lessonRef: "les-4-1",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: A customer is buying 5 spiral notebooks. First, press F3 (QUANTITY) on the right function keypad.",
        expectedAction: "SET_QTY_MODE",
        hint: "Click F3 Quantity on the right column or press F3 on your keyboard.",
        errorFeedback: "Press F3 (QUANTITY) before typing the item count."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Type quantity '5' in the quantity prompt and press ENTER.",
        expectedAction: "CONFIRM_QTY",
        expectedData: 5,
        hint: "Type 5 and press Enter to confirm the multiplier.",
        errorFeedback: "Enter 5 as the quantity multiplier."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Now scan or enter 'NBS-BK-001' (Spiral Notebook) and press ENTER to record all 5 notebooks at once.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-BK-001",
        hint: "Type NBS-BK-001 into the barcode input and press Enter.",
        errorFeedback: "Enter 'NBS-BK-001' to add 5 Spiral Notebooks."
      }
    ]
  },
  {
    id: "scen-les-4-2",
    title: "Lesson 4-2 Practice: Item Void (F7) & Transaction Void (F8)",
    description: "Practice line-level Item Void (F7) and full Transaction Void (F8) with Manager Override authorization, strictly matching the lesson video walkthroughs.",
    moduleRef: "mod-4",
    lessonRef: "les-4-2",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Scan or enter 'NBS-PEN-002' (Pilot G-Tech Pen) into the Barcode field and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-PEN-002",
        hint: "Type NBS-PEN-002 in the yellow barcode box and press Enter.",
        errorFeedback: "Enter 'NBS-PEN-002' to add the Pilot G-Tech Pen."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: The customer changed their mind about the pen. Press F7 (ITEM VOID) on the right function column.",
        expectedAction: "ITEM_VOID",
        hint: "Click F7 Item Void on the right keypad or press F7.",
        errorFeedback: "Press F7 (ITEM VOID) to initiate line cancellation."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: The Manager Override prompt appears. Authorize the line void by clicking 'Confirm Override'.",
        expectedAction: "CONFIRM_OVERRIDE",
        hint: "Click the 'Confirm Override' button in the supervisor modal.",
        errorFeedback: "Click Confirm Override to approve the Item Void."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Now scan 'NBS-BK-001' (Spiral Notebook) into the Barcode field and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-BK-001",
        hint: "Type NBS-BK-001 in the barcode box and press Enter.",
        errorFeedback: "Scan or enter 'NBS-BK-001'."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Customer decides to cancel the entire sale. Press F8 (TRX VOID) on the right function column.",
        expectedAction: "TRX_VOID",
        hint: "Click F8 Trx Void on the right keypad or press F8.",
        errorFeedback: "Press F8 (TRX VOID) to cancel the entire transaction."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Authorize the total transaction cancellation by clicking 'Confirm Override' in the supervisor modal.",
        expectedAction: "CONFIRM_OVERRIDE",
        hint: "Click Confirm Override in the Manager Override modal.",
        errorFeedback: "Click Confirm Override to approve the Transaction Void."
      }
    ]
  },
  {
    id: "scen-cash-sale-basic",
    title: "Module 4 Assessment: Multi-Item Quantity & Cash Sale Checkout",
    description: "End-of-module practical assessment: perform price lookup, scan items, apply F3 quantity multiplier, proceed through loyalty selection, and complete a full cash checkout.",
    moduleRef: "mod-4",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Check the price of the spiral notebook first. Press F2 (LOOKUP).",
        expectedAction: "LOOKUP",
        hint: "Press the F2 key on your keyboard or click 'F2 LOOKUP' on the screen.",
        errorFeedback: "Incorrect key! You should press F2 (LOOKUP) on the Main POS Screen."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Close lookup or scan item. Type or scan 'NBS-BK-001' into the Barcode field and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-BK-001",
        hint: "Enter 'NBS-BK-001' or select it from the item dropdown, then press Enter.",
        errorFeedback: "Make sure you enter 'NBS-BK-001' to add the NBS Classic Notebook Spiral."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: The customer also wants 3 pieces of gel pens. First, press F3 (QUANTITY).",
        expectedAction: "SET_QTY_MODE",
        hint: "Press F3 (QUANTITY) to open the quantity multiplier before scanning.",
        errorFeedback: "You need to press F3 (QUANTITY) before entering the count."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Enter quantity '3' and press ENTER.",
        expectedAction: "CONFIRM_QTY",
        expectedData: 3,
        hint: "Type 3 in the prompt dialog and press Enter.",
        errorFeedback: "Please enter 3 as the item quantity."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Now enter the Pilot G-Tech Pen SKU: 'NBS-PEN-002' and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-PEN-002",
        hint: "Type 'NBS-PEN-002' and press Enter to record 3 pieces.",
        errorFeedback: "Please scan or enter 'NBS-PEN-002'."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Customer is ready to pay. Press F4 (PAYMENT) to open the Payment options.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 on your keyboard or click 'F4 PAYMENT' on screen.",
        errorFeedback: "Press F4 (PAYMENT) to open the payment menu."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: The customer has no loyalty card. In the 'Choose Option' prompt, press 1 on your keyboard (or click '1. None') to open the Payment Screen.",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 1,
        hint: "Press key 1 on your keyboard or click '1. None'.",
        errorFeedback: "Select option 1 (None) to proceed to the Payment Screen."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: On the Payment Screen, cash payment is active. Press F2 (CASH) or proceed to enter tender.",
        expectedAction: "PAY_CASH",
        hint: "On the Payment screen, press F2 (CASH) or check the cash tender input.",
        errorFeedback: "Press F2 for Cash payment."
      },
      {
        stepNumber: 9,
        instruction: "Step 9: Customer hands you a 500 bill. Enter '500' and press ENTER (or click Process Payment / Ok) to confirm tender.",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 500,
        hint: "Type 500 and press Enter to complete the transaction.",
        errorFeedback: "Enter 500 as the cash amount handed by the customer."
      }
    ]
  },

  // =========================================================================
  // MODULE 5: SECOND-PAGE FUNCTIONS & DISCOUNTS
  // =========================================================================
  {
    id: "scen-les-5-1",
    title: "Lesson 5-1 Practice: Transaction Discounts (TRX Disc)",
    description: "Practice scanning an item, navigating to the 2nd Screen, and applying a Transaction Discount (F6 Trx Disc) with Manager Override.",
    moduleRef: "mod-5",
    lessonRef: "les-5-1",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Scan or enter 'NBS-PAP-003' (A4 Copy Paper) into the Barcode field and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-PAP-003",
        hint: "Type NBS-PAP-003 in the yellow barcode input and press Enter.",
        errorFeedback: "Enter 'NBS-PAP-003' into the barcode field."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Navigate from the Main Screen to the 2nd Screen by pressing F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Click F5 Option on the right column or press F5.",
        errorFeedback: "Press F5 (OPTION) to open the 2nd Screen."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: On the 2nd Screen, press F6 (TRX DISC) to open the statutory discount menu.",
        expectedAction: "TRX_DISC",
        hint: "Click F6 Trx Disc on the right keypad or press F6.",
        errorFeedback: "Press F6 (TRX DISC) on the 2nd Screen."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: In the Transaction Discount dialog, select a discount (e.g. Senior Citizen 20% or press 1) and confirm to apply.",
        expectedAction: "APPLY_DISCOUNT",
        hint: "Select option 1 (Senior Citizen 20%) or press 1, then confirm to apply the discount.",
        errorFeedback: "Select a discount category and apply it."
      }
    ]
  },
  {
    id: "scen-les-5-2",
    title: "Lesson 5-2 Practice: Suspend, Recall & Reprint",
    description: "Practice suspending an active transaction (F9) when a customer steps away, then recalling it from the 2nd Screen (F7 Recall).",
    moduleRef: "mod-5",
    lessonRef: "les-5-2",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Scan or enter 'NBS-BK-001' (Spiral Notebook) into the Barcode field and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-BK-001",
        hint: "Type NBS-BK-001 in the barcode box and press Enter.",
        errorFeedback: "Scan 'NBS-BK-001' to start the transaction."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: The customer forgot their wallet at another counter. Suspend the transaction by pressing F9 (SUSPEND) on the Main Screen.",
        expectedAction: "SUSPEND",
        hint: "Click F9 Suspend on the right keypad or press F9.",
        errorFeedback: "Press F9 (SUSPEND) on the Main Screen."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: The customer returns! Navigate to the 2nd Screen by pressing F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Click F5 Option on the right keypad or press F5.",
        errorFeedback: "Press F5 (OPTION) to reach the 2nd Screen."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: On the 2nd Screen, press F7 (RECALL) to retrieve the suspended transaction.",
        expectedAction: "RECALL",
        hint: "Click F7 Recall on the right keypad or press F7.",
        errorFeedback: "Press F7 (RECALL) on the 2nd Screen."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: In the Recall buffer dialog, select the suspended transaction and click 'Recall Transaction' (or press Alt+Enter) to restore it.",
        expectedAction: "CONFIRM_RECALL",
        hint: "Click 'Recall Transaction' on the suspended entry to restore the transaction.",
        errorFeedback: "Select and confirm the suspended transaction to recall it."
      }
    ]
  },
  {
    id: "scen-mod-5",
    title: "Module 5 Assessment: Suspend, Recall, Discount & Receipt Reprint",
    description: "Test all Module 5 skills in one combined scenario: scan an item, suspend and recall the transaction, apply a 2nd-screen Transaction Discount, and execute an Official Receipt Reprint.",
    moduleRef: "mod-5",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Scan 'NBS-CAL-005' (Casio Scientific Calculator) into the Barcode field and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-CAL-005",
        hint: "Type NBS-CAL-005 into the barcode field and press Enter.",
        errorFeedback: "Enter 'NBS-CAL-005' to add the calculator."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Put the transaction on hold while the customer grabs another item: press F9 (SUSPEND).",
        expectedAction: "SUSPEND",
        hint: "Click F9 Suspend on the Main Screen.",
        errorFeedback: "Press F9 (SUSPEND) to hold the transaction."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Switch to the 2nd Screen by pressing F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Click F5 Option on the right keypad.",
        errorFeedback: "Press F5 to open the 2nd Screen."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Recall the held transaction by pressing F7 (RECALL) on the 2nd Screen.",
        expectedAction: "RECALL",
        hint: "Click F7 Recall on the 2nd Screen.",
        errorFeedback: "Press F7 (RECALL) to retrieve the suspended sale."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Select the suspended transaction in the dialog and click 'Recall Transaction' (or press Alt+Enter).",
        expectedAction: "CONFIRM_RECALL",
        hint: "Click 'Recall Transaction' to restore the transaction.",
        errorFeedback: "Confirm recall of the transaction."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: While on the 2nd Screen, apply an Employee/Senior Discount by pressing F6 (TRX DISC).",
        expectedAction: "TRX_DISC",
        hint: "Click F6 Trx Disc on the 2nd Screen.",
        errorFeedback: "Press F6 (TRX DISC) on the 2nd Screen."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: In the Transaction Discount dialog, select a discount code (e.g. Senior Citizen 20% or press 1) and confirm.",
        expectedAction: "APPLY_DISCOUNT",
        hint: "Select option 1 and apply the discount.",
        errorFeedback: "Select and apply the discount."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: Finally, test reprinting an Official Receipt on the 2nd Screen by pressing F2 (REPRINT).",
        expectedAction: "REPRINT",
        hint: "Click F2 Reprint at the top of the 2nd Screen function column.",
        errorFeedback: "Press F2 (REPRINT) on the 2nd Screen."
      },
      {
        stepNumber: 9,
        instruction: "Step 9: In the Reprint Official Receipt dialog, verify the OR number and click 'Reprint Receipt' (or press Enter).",
        expectedAction: "CONFIRM_REPRINT",
        hint: "Click 'Reprint Receipt' to complete the receipt reprint.",
        errorFeedback: "Confirm reprint of the Official Receipt to finish Module 5 assessment."
      }
    ]
  },

  // =========================================================================
  // MODULE 6: THIRD-PAGE FUNCTIONS & STORE READINGS
  // =========================================================================
  {
    id: "scen-les-6-1",
    title: "Lesson 6-1 Practice: Cashier (Y) & Terminal (Z) Readings",
    description: "Navigate to the 3rd Screen and generate both the shift Cashier Reading (F8) and end-of-day Terminal Reading (F9).",
    moduleRef: "mod-6",
    lessonRef: "les-6-1",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: From the Main Screen, press F5 (OPTION) to advance to the 2nd Screen.",
        expectedAction: "NAV_SECOND",
        hint: "Click F5 Option on the right column.",
        errorFeedback: "Press F5 to go to the 2nd Screen."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Press F5 (NEXT OPTION) again to advance to the 3rd Screen.",
        expectedAction: "NAV_THIRD",
        hint: "Click F5 Next Option to reach the 3rd Screen.",
        errorFeedback: "Press F5 to go to the 3rd Screen."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Print your end-of-shift Cashier (Y) Reading by pressing F8 (CASHIER RDG).",
        expectedAction: "READING_Y",
        hint: "Click F8 Cashier Rdg on the 3rd Screen.",
        errorFeedback: "Press F8 (CASHIER RDG) on the 3rd Screen."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Generate the end-of-day Terminal (Z) Reading by pressing F9 (TERMINAL RDG).",
        expectedAction: "READING_Z",
        hint: "Click F9 Terminal Rdg on the 3rd Screen.",
        errorFeedback: "Press F9 (TERMINAL RDG) on the 3rd Screen."
      }
    ]
  },
  {
    id: "scen-les-6-2",
    title: "Lesson 6-2 Practice: Sales Data Verification (SDV)",
    description: "Navigate to the 3rd Screen and run a Sales Data Verification (F10 SDV) check to ensure Header, Detail, and PayDetail counts tally.",
    moduleRef: "mod-6",
    lessonRef: "les-6-2",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Advance from the Main Screen to the 2nd Screen by pressing F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Click F5 Option on the right column.",
        errorFeedback: "Press F5 to go to the 2nd Screen."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Advance from the 2nd Screen to the 3rd Screen by pressing F5 (NEXT OPTION).",
        expectedAction: "NAV_THIRD",
        hint: "Click F5 Next Option on the right column.",
        errorFeedback: "Press F5 to go to the 3rd Screen."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: On the 3rd Screen, run Sales Data Verification by pressing F10 (SDV).",
        expectedAction: "SDV_CHECK",
        hint: "Click F10 SDV at the bottom of the 3rd Screen function keypad.",
        errorFeedback: "Press F10 (SDV) on the 3rd Screen to verify database tallies."
      }
    ]
  },
  {
    id: "scen-mod-6",
    title: "Module 6 Assessment: Post-Void Audit & Complete Closing Readings",
    description: "Put all 3rd-Screen accounting utilities to the test: navigate to the 3rd Screen, execute a Post Void with supervisor override, verify database integrity via SDV (F10), and run both Y-Reading (F8) and Z-Reading (F9).",
    moduleRef: "mod-6",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Navigate to the 2nd Screen. Press F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Press F5 on the right column.",
        errorFeedback: "Press F5 to go to the 2nd Screen."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Navigate to the 3rd Screen. Press F5 (NEXT OPTION).",
        expectedAction: "NAV_THIRD",
        hint: "Press F5 again to go to the 3rd Screen.",
        errorFeedback: "Press F5 to go to the 3rd Screen."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Before closing the terminal, a completed receipt must be post-voided. Press F2 (POST VOID) on the 3rd Screen.",
        expectedAction: "POST_VOID",
        hint: "Click F2 Post Void at the top of the 3rd Screen function column.",
        errorFeedback: "Press F2 (POST VOID) on the 3rd Screen."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: In the Post Void dialog, select or confirm the invoice to void and click 'Confirm Void'.",
        expectedAction: "CONFIRM_POST_VOID",
        hint: "Click 'Confirm Void' in the Post Void dialog.",
        errorFeedback: "Confirm the Post Void in the dialog."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Run a Sales Data Verification check first to confirm all tables tally before printing readings. Press F10 (SDV).",
        expectedAction: "SDV_CHECK",
        hint: "Click F10 SDV on the 3rd Screen function keypad.",
        errorFeedback: "Press F10 (SDV) on the 3rd Screen."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Generate the Cashier shift reconciliation report by pressing F8 (CASHIER RDG).",
        expectedAction: "READING_Y",
        hint: "Click F8 Cashier Rdg on the 3rd Screen.",
        errorFeedback: "Press F8 (CASHIER RDG) to run the Y-Reading."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: Generate the final End-of-Day Terminal reconciliation by pressing F9 (TERMINAL RDG).",
        expectedAction: "READING_Z",
        hint: "Click F9 Terminal Rdg on the 3rd Screen.",
        errorFeedback: "Press F9 (TERMINAL RDG) to complete the Z-Reading."
      }
    ]
  },

  // =========================================================================
  // MODULE 7: FOURTH-PAGE FUNCTIONS & EXCEPTIONS
  // =========================================================================
  {
    id: "scen-les-7-1",
    title: "Lesson 7-1 Practice: Transaction Comments (TIN & Corporate Billing)",
    description: "Navigate to the 4th Screen and open Transaction Comments (F3 Trx Comment) to record corporate billing and TIN details.",
    moduleRef: "mod-7",
    lessonRef: "les-7-1",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Advance to the 2nd Screen by pressing F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Click F5 Option on the right column.",
        errorFeedback: "Press F5 to go to the 2nd Screen."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Advance to the 3rd Screen by pressing F5 (NEXT OPTION).",
        expectedAction: "NAV_THIRD",
        hint: "Click F5 Next Option.",
        errorFeedback: "Press F5 to go to the 3rd Screen."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Advance to the 4th Screen by pressing F5 (NEXT OPTION).",
        expectedAction: "NAV_FOURTH",
        hint: "Click F5 Next Option to reach the 4th Screen.",
        errorFeedback: "Press F5 to go to the 4th Screen."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: On the 4th Screen, press F3 (TRX COMMENT) to attach corporate TIN and billing details.",
        expectedAction: "TRX_COMMENT",
        hint: "Click F3 Trx Comment on the 4th Screen.",
        errorFeedback: "Press F3 (TRX COMMENT) on the 4th Screen."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: In the Transaction Comments dialog, enter or review customer TIN and company details, then click [Save Comments].",
        expectedAction: "SAVE_TRX_COMMENT",
        hint: "Click Save Comments in the dialog to record corporate details.",
        errorFeedback: "Save the transaction comment to continue."
      }
    ]
  },
  {
    id: "scen-les-7-2",
    title: "Lesson 7-2 Practice: Returns, Refunds & Zero-Rated Sales",
    description: "Navigate to the 4th Screen and practice initiating an item Return (F8 Return) and Refund (F10 Refund) with supervisory approval.",
    moduleRef: "mod-7",
    lessonRef: "les-7-2",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Press F5 (OPTION) to go to the 2nd Screen.",
        expectedAction: "NAV_SECOND",
        hint: "Click F5 Option.",
        errorFeedback: "Press F5."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Press F5 (NEXT OPTION) to go to the 3rd Screen.",
        expectedAction: "NAV_THIRD",
        hint: "Click F5 Next Option.",
        errorFeedback: "Press F5."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Press F5 (NEXT OPTION) to reach the 4th Screen.",
        expectedAction: "NAV_FOURTH",
        hint: "Click F5 Next Option.",
        errorFeedback: "Press F5."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: On the 4th Screen, initiate a customer item return by pressing F8 (RETURN).",
        expectedAction: "RETURN_EXCHANGE",
        hint: "Click F8 Return on the 4th Screen keypad.",
        errorFeedback: "Press F8 (RETURN) on the 4th Screen."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: In the Return / Refund dialog, verify the Sales Invoice (SI) number, the returned SKU, and click 'Confirm Return'.",
        expectedAction: "CONFIRM_RETURN",
        hint: "Click 'Confirm Return' in the dialog.",
        errorFeedback: "Confirm the item return in the dialog."
      }
    ]
  },
  {
    id: "scen-mod-7",
    title: "Module 7 Assessment: Zero-Rated Corporate Sale & Refund Exception",
    description: "Test all 4th-Screen exception workflows: navigate to the 4th Screen, record Corporate TIN Comments (F3), activate Zero-Rated VAT exemption (F7), process a Refund (F10), and cycle back to the Main Screen (F5).",
    moduleRef: "mod-7",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Advance from Main to the 2nd Screen. Press F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Press F5.",
        errorFeedback: "Press F5."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Advance to the 3rd Screen. Press F5 (NEXT OPTION).",
        expectedAction: "NAV_THIRD",
        hint: "Press F5.",
        errorFeedback: "Press F5."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Advance to the 4th Screen. Press F5 (NEXT OPTION).",
        expectedAction: "NAV_FOURTH",
        hint: "Press F5.",
        errorFeedback: "Press F5."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Attach corporate buyer TIN details first by pressing F3 (TRX COMMENT) on the 4th Screen.",
        expectedAction: "TRX_COMMENT",
        hint: "Click F3 Trx Comment on the 4th Screen.",
        errorFeedback: "Press F3 (TRX COMMENT) on the 4th Screen."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: In the Transaction Comments dialog, enter or verify corporate billing information and click [Save Comments].",
        expectedAction: "SAVE_TRX_COMMENT",
        hint: "Click Save Comments in the dialog.",
        errorFeedback: "Save the transaction comment to continue."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Apply VAT Zero-Rating for the tax-exempt corporate buyer by pressing F7 (ZERO RATED).",
        expectedAction: "ZERO_RATED",
        hint: "Click F7 Zero Rated on the 4th Screen.",
        errorFeedback: "Press F7 (ZERO RATED) on the 4th Screen."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: Next, initiate a cash Refund exception by pressing F10 (REFUND) on the 4th Screen.",
        expectedAction: "REFUND",
        hint: "Click F10 Refund at the bottom of the 4th Screen keypad.",
        errorFeedback: "Press F10 (REFUND) on the 4th Screen."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: In the Refund dialog, verify the original OR number and click 'Confirm Refund'.",
        expectedAction: "CONFIRM_REFUND",
        hint: "Click 'Confirm Refund' in the dialog.",
        errorFeedback: "Confirm the refund in the dialog."
      },
      {
        stepNumber: 9,
        instruction: "Step 9: Return to the Main Screen by pressing F5 (NEXT OPTION) on the 4th Screen.",
        expectedAction: "NAV_MAIN",
        hint: "Click F5 Next Option on the 4th Screen to return to the Main Screen.",
        errorFeedback: "Press F5 to return to the Main Screen."
      }
    ]
  },

  // =========================================================================
  // MODULE 8: PAYMENT SCREEN & TENDER METHODS
  // =========================================================================
  {
    id: "scen-les-8-1",
    title: "Lesson 8-1 Practice: Cash Tender & Change Computation",
    description: "Scan A4 Copy Paper, open Payment, select option 1 (None) for non-loyalty customers, and tender PHP 250.00 cash to compute change due.",
    moduleRef: "mod-8",
    lessonRef: "les-8-1",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Scan or enter barcode 'NBS-PAP-003' (A4 Copy Paper, ₱240.00) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-PAP-003",
        hint: "Type NBS-PAP-003 into the barcode box and press Enter.",
        errorFeedback: "Please scan or type NBS-PAP-003."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Press F4 (PAYMENT) on the right function keypad to proceed to payment.",
        expectedAction: "GO_PAYMENT",
        hint: "Click F4 PAYMENT on screen or press F4.",
        errorFeedback: "Press F4 to open the payment screen."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: The customer has no loyalty card. Select option 1 (None) by pressing 1 on your keyboard (or clicking '1. None').",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 1,
        hint: "Press 1 on your keyboard or click '1. None'.",
        errorFeedback: "Select option 1 (None) to proceed to the Payment Screen."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: On the Payment Screen, cash payment is active. Press F2 (CASH) or check the cash tender box.",
        expectedAction: "PAY_CASH",
        hint: "Click F2 CASH on the payment keypad or inspect the Enter Amount box.",
        errorFeedback: "Press F2 for Cash payment."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Enter cash tender amount '250' and press ENTER (or click Process Payment / Ok) to complete the transaction.",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 250,
        hint: "Type 250 and press Enter.",
        errorFeedback: "Type 250 and press Enter."
      }
    ]
  },
  {
    id: "scen-les-8-2",
    title: "Lesson 8-2 Practice: Bank Card / GCash Electronic Tender",
    description: "Practice scanning an item, opening Payment, choosing option 1 (None), and tendering payment via F3 (Bank Card / GCash).",
    moduleRef: "mod-8",
    lessonRef: "les-8-2",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Scan or enter barcode 'NBS-ART-004' (Faber-Castell Color Pencils, ₱180.00) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-ART-004",
        hint: "Type NBS-ART-004 into the barcode box and press Enter.",
        errorFeedback: "Please scan or type NBS-ART-004."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Press F4 (PAYMENT) to open the payment flow.",
        expectedAction: "GO_PAYMENT",
        hint: "Click F4 PAYMENT on screen or press F4.",
        errorFeedback: "Press F4 to open the payment flow."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: The customer has no loyalty card. Select option 1 (None) by pressing 1 on your keyboard (or clicking '1. None').",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 1,
        hint: "Press 1 on your keyboard or click '1. None'.",
        errorFeedback: "Select option 1 (None) to proceed to the Payment Screen."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: The customer is paying via Bank Card / GCash. Press F3 (BANK CARD) on the Payment Screen.",
        expectedAction: "PAY_CARD",
        hint: "Click F3 Bank Card on the right function column or press F3.",
        errorFeedback: "Press F3 (BANK CARD) for card/GCash tender."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Enter the exact electronic tender amount '180' and press ENTER (or click Process Tender) to finalize the receipt.",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 180,
        hint: "Type 180 and press Enter.",
        errorFeedback: "Enter 180 to complete the card payment."
      }
    ]
  },
  {
    id: "scen-mod-8",
    title: "Module 8 Assessment: Multi-Unit Electronics & Card/GCash Checkout",
    description: "Test your payment tender mastery with a high-value multi-item purchase: set quantity to 2, scan Casio Scientific Calculators (₱840.00 total), scan Copy Paper, open Payment, select option 1 (None), select Bank Card / GCash (F3), and tender PHP 1,080.00.",
    moduleRef: "mod-8",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: A customer is purchasing 2 Casio Scientific Calculators. First, press F3 (QUANTITY).",
        expectedAction: "SET_QTY_MODE",
        hint: "Press F3 (QUANTITY) on the Main Screen.",
        errorFeedback: "Press F3 (QUANTITY) to set the multiplier first."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Enter quantity '2' and press ENTER.",
        expectedAction: "CONFIRM_QTY",
        expectedData: 2,
        hint: "Type 2 and press Enter.",
        errorFeedback: "Enter 2 as the quantity."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Scan or enter 'NBS-CAL-005' (Casio Scientific Calculator, ₱420.00 each) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-CAL-005",
        hint: "Type NBS-CAL-005 into the barcode box and press Enter.",
        errorFeedback: "Please scan or type 'NBS-CAL-005'."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Also add 1 pack of A4 Copy Paper: scan or enter 'NBS-PAP-003' (₱240.00) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-PAP-003",
        hint: "Type NBS-PAP-003 into the barcode box and press Enter.",
        errorFeedback: "Please scan or type 'NBS-PAP-003'."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Total is ₱1,080.00. Press F4 (PAYMENT) to open the payment flow.",
        expectedAction: "GO_PAYMENT",
        hint: "Click F4 PAYMENT on the right column or press F4.",
        errorFeedback: "Press F4 to open the payment screen."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: In the 'Choose Option' dialog, select option 1 (None) by pressing 1 on your keyboard (or clicking '1. None').",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 1,
        hint: "Press 1 on your keyboard or click '1. None'.",
        errorFeedback: "Select option 1 (None) to proceed to the Payment Screen."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: Select Bank Card / GCash tender by pressing F3 (BANK CARD).",
        expectedAction: "PAY_CARD",
        hint: "Click F3 Bank Card on the Payment Screen.",
        errorFeedback: "Press F3 (BANK CARD) on the Payment Screen."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: Enter tender amount '1080' and press ENTER to complete the transaction and generate the Official Receipt.",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 1080,
        hint: "Type 1080 and press Enter.",
        errorFeedback: "Enter 1080 and press Enter to finalize the payment."
      }
    ]
  },

  // =========================================================================
  // MODULE 9: KNOWLEDGE CHECK & PRACTICAL CERTIFICATION
  // =========================================================================
  {
    id: "scen-les-9-1",
    title: "Lesson 9-1 Practice: Pre-Certification Warmup (Void & Readiness)",
    description: "Warm up for your final practical certification by scanning an item, performing an Item Void (F7), and authorizing with Manager Override.",
    moduleRef: "mod-9",
    lessonRef: "les-9-1",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Scan or enter barcode 'NBS-ART-004' (Faber-Castell Color Pencils) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-ART-004",
        hint: "Type NBS-ART-004 into the barcode box and press Enter.",
        errorFeedback: "Please scan or type NBS-ART-004."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Customer decides to cancel this item. Press F7 (ITEM VOID).",
        expectedAction: "ITEM_VOID",
        hint: "Click F7 ITEM VOID in the right column or press F7.",
        errorFeedback: "Press F7 for Item Void."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: The Manager Override dialog opens. Click Confirm Override to authorize the void.",
        expectedAction: "CONFIRM_OVERRIDE",
        hint: "Click Confirm Override in the manager authorization dialog.",
        errorFeedback: "Click Confirm Override to complete the void."
      }
    ]
  },
  {
    id: "scen-mod-9",
    title: "Module 9 Capstone Assessment: Comprehensive Cashier Certification",
    description: "Final practical certification combining Lookup, Quantity Multiplier, Multi-Item Scanning, Item Void with Manager Override, Loyalty prompt selection, and Cash Tender checkout.",
    moduleRef: "mod-9",
    passingScore: 75,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: A customer asks to check product availability first. Open Product Lookup by pressing F2 (LOOKUP).",
        expectedAction: "LOOKUP",
        hint: "Press F2 or click Lookup F2.",
        errorFeedback: "Press F2 (LOOKUP) to open Product Lookup."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Exit Lookup back to the register (click CANCEL <Alt-B> or press ESC).",
        expectedAction: "CLOSE_LOOKUP",
        hint: "Click CANCEL <Alt-B> or press ESC.",
        errorFeedback: "Close Lookup using CANCEL <Alt-B> or ESC."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: The customer buys 4 Spiral Notebooks. Press F3 (QUANTITY) to set the multiplier.",
        expectedAction: "SET_QTY_MODE",
        hint: "Press F3 (QUANTITY) on the right keypad.",
        errorFeedback: "Press F3 (QUANTITY) before entering the quantity."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Enter quantity '4' and press ENTER.",
        expectedAction: "CONFIRM_QTY",
        expectedData: 4,
        hint: "Type 4 and press Enter.",
        errorFeedback: "Enter 4 as the item quantity."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Scan 'NBS-BK-001' (Spiral Notebook, ₱35.00 promo each = ₱140.00) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-BK-001",
        hint: "Type NBS-BK-001 and press Enter.",
        errorFeedback: "Enter 'NBS-BK-001' to add 4 Spiral Notebooks."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Next, scan 'NBS-ART-004' (Faber-Castell Color Pencils, ₱180.00) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-ART-004",
        hint: "Type NBS-ART-004 and press Enter.",
        errorFeedback: "Enter 'NBS-ART-004' to add the Color Pencils."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: Scan 'NBS-PEN-002' (Pilot G-Tech Pen, ₱85.00) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-PEN-002",
        hint: "Type NBS-PEN-002 and press Enter.",
        errorFeedback: "Enter 'NBS-PEN-002' to add the Pilot G-Tech Pen."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: The customer asks to void an item using supervisor approval. Press F7 (ITEM VOID).",
        expectedAction: "ITEM_VOID",
        hint: "Click F7 Item Void on the right keypad.",
        errorFeedback: "Press F7 (ITEM VOID)."
      },
      {
        stepNumber: 9,
        instruction: "Step 9: Authorize the Item Void by clicking 'Confirm Override'.",
        expectedAction: "CONFIRM_OVERRIDE",
        hint: "Click Confirm Override in the manager dialog.",
        errorFeedback: "Click Confirm Override to approve."
      },
      {
        stepNumber: 10,
        instruction: "Step 10: Proceed to checkout by pressing F4 (PAYMENT).",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 or click F4 Payment.",
        errorFeedback: "Press F4 (PAYMENT) to open the payment screen."
      },
      {
        stepNumber: 11,
        instruction: "Step 11: In the 'Choose Option' dialog, select option 1 (None) by pressing 1 on your keyboard (or clicking '1. None').",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 1,
        hint: "Press 1 on your keyboard or click '1. None'.",
        errorFeedback: "Select option 1 (None) to proceed to the Payment Screen."
      },
      {
        stepNumber: 12,
        instruction: "Step 12: Select Cash tender by pressing F2 (CASH) or check the cash tender input.",
        expectedAction: "PAY_CASH",
        hint: "Press F2 Cash on the Payment Screen.",
        errorFeedback: "Press F2 (CASH) to select cash payment."
      },
      {
        stepNumber: 13,
        instruction: "Step 13: The customer hands you PHP 500.00. Enter '500' and press ENTER (or click Process Payment / Ok) to complete your certification!",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 500,
        hint: "Type 500 and press Enter.",
        errorFeedback: "Enter 500 and press Enter to complete the transaction."
      }
    ]
  }
];

export function getScenarioForModule(moduleRef: string): TrainingScenario | null {
  // Prefer a module-level assessment scenario (no lessonRef), fallback to first lesson scenario
  return (
    TRAINING_SCENARIOS.find((s) => s.moduleRef === moduleRef && !s.lessonRef) ||
    TRAINING_SCENARIOS.find((s) => s.moduleRef === moduleRef) ||
    null
  );
}

export function getScenarioById(id: string): TrainingScenario | null {
  return TRAINING_SCENARIOS.find((s) => s.id === id) || null;
}

export function getScenarioForLesson(lessonRef: string): TrainingScenario | null {
  const direct = TRAINING_SCENARIOS.find((s) => s.lessonRef === lessonRef);
  if (direct) return direct;
  const mod = TRAINING_MODULES.find((m) => m.lessons.some((l) => l.id === lessonRef));
  if (mod) {
    return getScenarioForModule(mod.id);
  }
  return null;
}
