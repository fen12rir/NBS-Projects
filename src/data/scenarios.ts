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
  timeLimitSeconds?: number;
}

export const TRAINING_SCENARIOS: TrainingScenario[] = [
  // =========================================================================
  // MODULE 1: POS BASICS & SCREEN LAYOUT
  // =========================================================================
  {
    id: "scen-les-1-1",
    title: "Lesson 1-1 Practice: Screen Layout & Function Pages",
    description: "Explore the 12 key screen regions by scanning a sample item to observe the green LED and line-item table, then navigate all 4 function pages forward and backward using F5, F12, and F11.",
    moduleRef: "mod-1",
    lessonRef: "les-1-1",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Scan or enter 'NBS-BK-001' (Spiral Notebook) into the yellow Barcode field and press ENTER to observe how the Line Item table, green LED display, Total Qty, and Total Sales update.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-BK-001",
        hint: "Type NBS-BK-001 in the yellow Scan or Enter UPC box and press Enter.",
        errorFeedback: "Enter 'NBS-BK-001' and press Enter to populate the line item table and LED display."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Explore the right function keypad. Press F5 (OPTION) to advance from the Main Screen to the 2nd Screen.",
        expectedAction: "NAV_SECOND",
        hint: "Click F5 OPTION on the right button column or press F5 on your keyboard.",
        errorFeedback: "Press F5 (OPTION) on the right column to advance to the 2nd Screen."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Press F5 (NEXT OPTION) on the 2nd Screen to advance to the 3rd Screen.",
        expectedAction: "NAV_THIRD",
        hint: "Click F5 NEXT OPTION on the right button column or press F5 on your keyboard.",
        errorFeedback: "Press F5 to advance to the 3rd Screen."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Press F5 (NEXT OPTION) on the 3rd Screen to advance to the 4th Screen.",
        expectedAction: "NAV_FOURTH",
        hint: "Click F5 NEXT OPTION on the right button column or press F5 on your keyboard.",
        errorFeedback: "Press F5 to advance to the 4th Screen."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: On the 4th Screen, press F12 (PAGE DOWN) to return to the Main Screen.",
        expectedAction: "PAGE_DOWN",
        hint: "Press F12 on your keyboard or click F12 Page Down to return to the Main Screen.",
        errorFeedback: "Press F12 (PAGE DOWN) on the 4th Screen to return to the Main Screen."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Test reverse wrap-around navigation: from the Main Screen, press F11 (PAGE UP) to jump directly to the 4th Screen.",
        expectedAction: "PAGE_UP",
        hint: "Press F11 on your keyboard or click the F11 Page Up arrow button under the barcode box.",
        errorFeedback: "Press F11 (PAGE UP) on the Main Screen to jump directly to the 4th Screen."
      }
    ]
  },
  {
    id: "scen-mod-1",
    title: "Module 1 Assessment: Terminal Anatomy & Live Screen Inspection",
    description: "Test your mastery of the POS interface by scanning test items to inspect live LED and line-item regions, and cycling all 4 function screens forward and backward using F5, F12, and F11.",
    moduleRef: "mod-1",
    passingScore: 70,
    timeLimitSeconds: 3 * 60,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Scan or enter 'NBS-CAL-005' (Casio Scientific Calculator) into the Barcode field and press ENTER to observe the Line Item table and green LED display update.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-CAL-005",
        hint: "Type NBS-CAL-005 in the yellow Scan or Enter UPC box and press Enter.",
        errorFeedback: "Enter 'NBS-CAL-005' and press Enter to populate the line item table."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Navigate from the Main Screen to the 2nd Screen by pressing F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Click F5 Option on the right function keypad.",
        errorFeedback: "Press F5 to open the 2nd Screen."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Advance to the 3rd Screen by pressing F5 (NEXT OPTION).",
        expectedAction: "NAV_THIRD",
        hint: "Click F5 Next Option on the right function keypad.",
        errorFeedback: "Press F5 to open the 3rd Screen."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Advance to the 4th Screen by pressing F5 (NEXT OPTION).",
        expectedAction: "NAV_FOURTH",
        hint: "Click F5 Next Option to reach the 4th Screen.",
        errorFeedback: "Press F5 to open the 4th Screen."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Complete the forward cycle by pressing F12 (PAGE DOWN) on the 4th Screen to return to the Main Screen.",
        expectedAction: "PAGE_DOWN",
        hint: "Press F12 on your keyboard or click F12 Page Down on the 4th Screen to return to the Main Screen.",
        errorFeedback: "Press F12 (PAGE DOWN) to return to the Main Screen."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Test reverse wrap-around navigation: from the Main Screen, press F11 (PAGE UP) to jump directly to the 4th Screen.",
        expectedAction: "PAGE_UP",
        hint: "Press F11 on your keyboard or click the F11 Page Up arrow button under the barcode box.",
        errorFeedback: "Press F11 (PAGE UP) on the Main Screen to jump directly to the 4th Screen."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: Press F12 (PAGE DOWN) on the 4th Screen to return to the Main Screen.",
        expectedAction: "PAGE_DOWN",
        hint: "Press F12 on your keyboard or click F12 Page Down to return to the Main Screen.",
        errorFeedback: "Press F12 (PAGE DOWN) to return to the Main Screen."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: Scan a second item 'NBS-PEN-002' (Pilot G-Tech Pen) into the Barcode field and press ENTER to observe multi-line item numbering and running Total Sales update.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-PEN-002",
        hint: "Type NBS-PEN-002 in the yellow Scan or Enter UPC box and press Enter.",
        errorFeedback: "Enter 'NBS-PEN-002' and press Enter to complete the Module 1 assessment."
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
        instruction: "Step 4: The LOGOUT screen appears ('Are you sure you want to LOGOUT?'). Press TAB to [Yes] and press ENTER (or click [Yes]) to safely return to the User Login screen.",
        expectedAction: "CONFIRM_LOGOUT_YES",
        hint: "Click [Yes] or press TAB then ENTER to confirm logout and return to the User Login screen.",
        errorFeedback: "Confirm logout by selecting [Yes] on the Logout screen."
      }
    ]
  },
  {
    id: "scen-mod-2",
    title: "Module 2 Assessment: Full Opening, Date Discrepancy Check & Safe Handover",
    description: "Complete an end-to-end shift opening and closing assessment: test the Start-of-Day incorrect date alert ([No]), return and verify [Yes], close setup, reload POS, sign in, and execute safe F5 -> F8 logout.",
    moduleRef: "mod-2",
    passingScore: 70,
    timeLimitSeconds: 3 * 60,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Suppose you notice a date/time discrepancy during Start of Day. Select [No] (press ENTER on [No] or click [No]) to test the Service Desk alert screen.",
        expectedAction: "VERIFY_DATE_NO",
        hint: "Click [No] or press Enter while [No] is highlighted.",
        errorFeedback: "Select [No] to test the incorrect date/time alert."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: The 'Kindly contact the Service Desk' warning appears. After IT resolves the clock, press ESC or ENTER (or click 'Back to Verification (Esc)') to return to the Date & Time check.",
        expectedAction: "BACK_TO_SOD_VERIFY",
        hint: "Press ESC or ENTER, or click 'Back to Verification (Esc)'.",
        errorFeedback: "Return to the Start of Day verification screen using ESC, ENTER, or the Back button."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Now confirm the corrected POS Date & Time: press TAB to highlight [Yes] and press ENTER (or click [Yes]).",
        expectedAction: "VERIFY_DATE_YES",
        hint: "Press TAB to highlight 'Yes' and press ENTER, or click [Yes].",
        errorFeedback: "Verify the date and time by clicking [Yes] or pressing TAB then Enter."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Close the Start-of-Day setup window by pressing Ctrl+Alt+C (or click 'Close Window (Ctrl+Alt+C)').",
        expectedAction: "CLOSE_SOD_WINDOW",
        hint: "Press Ctrl+Alt+C on your keyboard or click 'Close Window (Ctrl+Alt+C)'.",
        errorFeedback: "Press Ctrl+Alt+C or click to close the setup window."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: On the 'POS Reloader' screen, press F5 (or click 'Reload Page (F5)') to launch the USER LOGIN screen.",
        expectedAction: "RELOAD_POS_LOGIN",
        hint: "Press F5 on your keyboard or click 'Reload Page (F5)'.",
        errorFeedback: "Press F5 or click to reload and open the login page."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Sign in with your cashier credentials ('241209') by clicking [Ok] or pressing ENTER.",
        expectedAction: "LOGIN_SUBMIT",
        hint: "Click [Ok] or press ENTER in the USER LOGIN dialog.",
        errorFeedback: "Submit your cashier login credentials to open the register."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: Time for shift handover! Navigate from the Main Screen to the 2nd Screen by pressing F5 (OPTION).",
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
        instruction: "Step 9: Confirm on the LOGOUT screen by pressing TAB to [Yes] and pressing ENTER (or click [Yes]).",
        expectedAction: "CONFIRM_LOGOUT_YES",
        hint: "Click [Yes] or press TAB then ENTER to complete logout.",
        errorFeedback: "Confirm logout by selecting [Yes] on the Logout screen."
      }
    ]
  },

  // =========================================================================
  // MODULE 3: ITEM LOOKUP & CUSTOMER LOYALTY (LNQR)
  // =========================================================================
  {
    id: "scen-les-3-1",
    title: "Lesson 3-1 Practice: Product Lookup (F2 SKU, F3 Description & F4 Author)",
    description: "Master all 3 search modes of the Product Lookup screen: search by F2 SKU/Barcode, switch to F3 Description to search a keyword, test F4 Author/Brand mode, and exit with Alt+B.",
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
        instruction: "Step 2: Lookup opens in F2 (SKU / Barcode) mode by default. Type 'NBS-BK-001' in the 'Look for:' search box and press ENTER to verify its SRP (₱45.00) and PROMO price (₱35.00).",
        expectedAction: "LOOKUP_QUERY",
        expectedData: "NBS-BK-001",
        hint: "Type NBS-BK-001 in the 'Look for:' field and press Enter.",
        errorFeedback: "Type 'NBS-BK-001' in 'Look for:' and press Enter."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Switch to Description search mode by pressing F3 (Description) inside the Lookup bar.",
        expectedAction: "LOOKUP_SEARCH",
        expectedData: "DESCRIPTION",
        hint: "Press F3 on your keyboard or click F3 Description in the lookup bar.",
        errorFeedback: "Press F3 (Description) inside Lookup to switch search mode."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Type 'harvard' (or 'notebook') in the 'Look for:' search box and press ENTER to search matching items by description.",
        expectedAction: "LOOKUP_QUERY",
        hint: "Type harvard in the 'Look for:' field and press Enter.",
        errorFeedback: "Type a keyword (e.g. 'harvard' or 'notebook') in 'Look for:' and press Enter."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Now switch to Author / Brand search mode by pressing F4 (Author) inside the Lookup bar.",
        expectedAction: "LOOKUP_SEARCH",
        expectedData: "AUTHOR",
        hint: "Press F4 on your keyboard or click F4 Author in the lookup bar.",
        errorFeedback: "Press F4 (Author) inside Lookup to switch to Author/Brand search mode."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Close lookup to return to the active sale. Click CANCEL <Alt-B> (or press Alt+B / ESC on your keyboard).",
        expectedAction: "CLOSE_LOOKUP",
        hint: "Click CANCEL <Alt-B> on the green bottom bar or press Alt+B / ESC on your keyboard.",
        errorFeedback: "Click CANCEL <Alt-B> or press Alt+B / ESC to return to the active register."
      }
    ]
  },
  {
    id: "scen-les-3-2",
    title: "Lesson 3-2 Practice: Bonus Buy Paper Bag & NBS Loyalty (LNQR Flow)",
    description: "Complete the authentic Bonus Buy + LNQR flow: scan a calculator, press F4 Payment, check the Bonus Buy Paper Bag checkbox and confirm with Alt+Enter [OK], press F4 Payment again, choose option 3 for LNQR, scan the customer QR code, tender cash, and confirm the LNQR updated dialog.",
    moduleRef: "mod-3",
    lessonRef: "les-3-2",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Scan or enter 'NBS-CAL-005' (Casio Scientific Calculator, ₱420.00) into the Barcode field and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-CAL-005",
        hint: "Type NBS-CAL-005 in the yellow barcode field and press Enter.",
        errorFeedback: "Please scan or enter NBS-CAL-005 into the register."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: The customer is ready to pay and wants a paper bag. Press F4 (Payment) on the right function keypad to open the BONUS BUY LIST.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 on your keyboard or click F4 Payment in the right column.",
        errorFeedback: "Press F4 (Payment) to open the Bonus Buy List."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: On the BONUS BUY LIST, the customer requests a Bleached Paper Bag. Click the checkbox in the QUANTITY column next to a paper bag promo item to enable the [OK] button.",
        expectedAction: "CHECK_BONUS_BUY",
        hint: "Click the checkbox next to the quantity '1' in the QUANTITY column of the Bonus Buy List.",
        errorFeedback: "Check the checkbox in the QUANTITY column to select a Bonus Buy paper bag."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: With the paper bag checked, press Alt+Enter (or click [OK] Alt-Enter) and confirm [Yes] in the prompt to add the paper bag to the sale and return to the Main Screen.",
        expectedAction: "CONFIRM_BEST_BUY",
        hint: "Click [OK] Alt-Enter at the bottom (or press Alt+Enter) and confirm [Yes].",
        errorFeedback: "Click [OK] (Alt+Enter) and confirm [Yes] to apply the selected Bonus Buy paper bag."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Back on the Main Screen (with the paper bag added), press F4 (Payment) again to continue to the 'Choose Option' loyalty prompt.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 on your keyboard or click F4 Payment in the right column.",
        errorFeedback: "Press F4 (Payment) again to open the 'Choose Option' prompt."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: The 'Choose Option' loyalty prompt appears. The customer has LNQR - press 3 on your keyboard (or click '3. LNQR / LNQR PLUS').",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 3,
        hint: "Press key 3 on your keyboard or click '3. LNQR / LNQR PLUS'.",
        errorFeedback: "Press 3 to choose LNQR / LNQR PLUS."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: The LNQR input screen appears. Scan or verify the customer QR code '20221003LN000004', press TAB to highlight [Ok], then press ENTER (or click [Ok]).",
        expectedAction: "SUBMIT_LNQR",
        hint: "Press TAB to highlight [Ok] and press ENTER, or click the [Ok] button.",
        errorFeedback: "Submit the customer QR code by clicking [Ok] or pressing Enter."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: On the Cash Payment Details screen, enter the tendered cash amount '3000' and press ENTER (or click [Ok]).",
        expectedAction: "SUBMIT_CASH_TENDER",
        hint: "Enter 3000 in the Enter Amount field and press Enter.",
        errorFeedback: "Enter the cash amount and press Enter to process payment."
      },
      {
        stepNumber: 9,
        instruction: "Step 9: The system displays the red blinking 'Change' and connects to the LNQR Server. When the 'LNQR has been updated!' confirmation appears, press ENTER (or click [OK]) to finish.",
        expectedAction: "CONFIRM_LNQR_UPDATED",
        hint: "Click [OK] or press ENTER in the confirmation popup to finish the transaction.",
        errorFeedback: "Confirm the LNQR updated dialog by pressing Enter or clicking [OK]."
      }
    ]
  },
  {
    id: "scen-mod-3",
    title: "Module 3 Assessment: Lookup Item Selection & Laking National Card (LNC) Checkout",
    description: "Test your Module 3 mastery: find an item without a barcode using F2 Lookup (F3 Description search) and add it directly to the sale with CONTINUE <Alt-Enter>, scan a second item, skip the Bonus Buy bag with Alt+B, attach a physical Laking National Card (Option 2), and complete cash tender.",
    moduleRef: "mod-3",
    passingScore: 70,
    timeLimitSeconds: 4 * 60,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: A customer brings a calculator with a damaged barcode label. Open Product Lookup by pressing F2 (LOOKUP).",
        expectedAction: "LOOKUP",
        hint: "Press F2 on your keyboard or click F2 Lookup under the barcode scanner.",
        errorFeedback: "Press F2 (LOOKUP) to open the product lookup screen."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Switch to Description search by pressing F3 (Description) in the Lookup bar.",
        expectedAction: "LOOKUP_SEARCH",
        expectedData: "DESCRIPTION",
        hint: "Press F3 on your keyboard or click F3 Description in the lookup bar.",
        errorFeedback: "Press F3 (Description) in the Lookup bar."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Type 'calculator' in the 'Look for:' search box and press ENTER to locate the Casio Scientific Calculator.",
        expectedAction: "LOOKUP_QUERY",
        expectedData: "calculator",
        hint: "Type calculator in the 'Look for:' box and press Enter.",
        errorFeedback: "Type 'calculator' in the 'Look for:' box and press Enter."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Add the selected Casio Scientific Calculator ('NBS-CAL-005') directly from Lookup to the register by pressing Alt+Enter (or clicking 'CONTINUE <Alt-Enter>' / double-clicking the row).",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-CAL-005",
        hint: "Click CONTINUE <Alt-Enter> on the bottom bar, press Alt+Enter, or double-click the calculator row.",
        errorFeedback: "Add 'NBS-CAL-005' directly from Lookup using CONTINUE <Alt-Enter> or double-clicking the row."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Back on the Main Screen, scan the customer's second item: enter 'NBS-PAP-003' (Hard Copy A4 Bond Paper) into the Barcode field and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-PAP-003",
        hint: "Type NBS-PAP-003 in the yellow barcode field and press Enter.",
        errorFeedback: "Please scan or enter 'NBS-PAP-003' (A4 Copy Paper) into the register."
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
        instruction: "Step 7: The BONUS BUY LIST appears first. The customer brings their own eco-bag, so press Alt+B (or click [CANCEL]) and confirm [Yes] to return to the Main Screen without adding a paper bag.",
        expectedAction: "CONFIRM_BEST_BUY",
        hint: "Press Alt+B or click [CANCEL] then press ENTER on [Yes].",
        errorFeedback: "Close the Bonus Buy List with [CANCEL] (Alt+B) and confirm [Yes]."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: Back on the Main Screen, press F4 (Payment) again to continue to the 'Choose Option' loyalty prompt.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 on your keyboard or click F4 Payment in the right column.",
        errorFeedback: "Press F4 (Payment) again to open the 'Choose Option' prompt."
      },
      {
        stepNumber: 9,
        instruction: "Step 9: The customer presents a physical Laking National Card (LNC). In the 'Choose Option' dialog, press 2 (or click '2. Laking National Card').",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 2,
        hint: "Press key 2 on your keyboard or click '2. Laking National Card'.",
        errorFeedback: "Press 2 to choose Laking National Card."
      },
      {
        stepNumber: 10,
        instruction: "Step 10: On the Laking National Card screen, verify the card number '1008-2024-9901' and press ENTER (or click [Ok]).",
        expectedAction: "SUBMIT_LNC",
        hint: "Press ENTER or click [Ok] to attach the Laking National Card.",
        errorFeedback: "Submit the Laking National Card number by clicking [Ok] or pressing Enter."
      },
      {
        stepNumber: 11,
        instruction: "Step 11: On the Cash Payment Details screen, enter '1000' and press ENTER (or click Process Payment / Ok) to complete the assessment.",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 1000,
        hint: "Type 1000 and press Enter or click Process Payment / Ok.",
        errorFeedback: "Enter 1000 and press Enter to process the cash payment."
      }
    ]
  },

  // =========================================================================
  // MODULE 4: MAIN-PAGE KEYS & TRANSACTION BASICS
  // =========================================================================
  {
    id: "scen-les-4-1",
    title: "Lesson 4-1 Practice: Quantity Multiplier & Non-Merchandise Entry",
    description: "Practice using F3 (Quantity) to set an item multiplier before scanning a barcode, and F6 (Non Mdse) to record unused coupon balance/variance and issue a new coupon as change.",
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
      },
      {
        stepNumber: 4,
        instruction: "Step 4: The customer did not fully consume their coupon and needs a new coupon issued for the unused balance. Press F6 (NON MDSE) on the Main Screen.",
        expectedAction: "NON_MDSE",
        hint: "Click F6 Non Mdse on the right function column or press F6.",
        errorFeedback: "Press F6 (NON MDSE) on the Main Screen."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: On the Non-Merchandise screen, select the coupon variance/change item, verify the amount, and click [Ok] (or press ENTER) to generate the new coupon and return to the Main Screen.",
        expectedAction: "CONFIRM_NON_MDSE",
        hint: "Select the coupon variance item and click [Ok] or press Enter.",
        errorFeedback: "Confirm the Non-Merchandise coupon variance by clicking [Ok] or pressing Enter."
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
        instruction: "Step 4: Choose 'Customer Cancel' as the reason for voiding the pen, then confirm.",
        expectedAction: "CONFIRM_ITEM_VOID",
        expectedData: "Customer Cancel",
        hint: "Select Customer Cancel in the Item Void reason list and confirm.",
        errorFeedback: "Select Customer Cancel and confirm the item-void reason."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Select the Pilot G-Tech Pen line item and confirm the void with Alt+Enter.",
        expectedAction: "SCAN_VOID_SKU",
        expectedData: "NBS-PEN-002",
        hint: "Click the NBS-PEN-002 line item, then click Confirm Void Item or press Alt+Enter.",
        errorFeedback: "Select NBS-PEN-002 and confirm the item void."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Scan 'NBS-BK-001' (Spiral Notebook) into the Barcode field and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-BK-001",
        hint: "Type NBS-BK-001 in the barcode box and press Enter.",
        errorFeedback: "Scan or enter 'NBS-BK-001'."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: Customer decides to cancel the entire sale. Press F8 (TRX VOID) on the right function column.",
        expectedAction: "TRX_VOID",
        hint: "Click F8 Trx Void on the right keypad or press F8.",
        errorFeedback: "Press F8 (TRX VOID) to cancel the entire transaction."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: Authorize the transaction void by clicking 'Confirm Override' in the manager prompt.",
        expectedAction: "CONFIRM_OVERRIDE",
        hint: "Click Confirm Override in the Manager Override modal.",
        errorFeedback: "Click Confirm Override to approve the Transaction Void."
      },
      {
        stepNumber: 9,
        instruction: "Step 9: Confirm that you want to void the transaction by choosing Yes.",
        expectedAction: "TRX_VOID_CONFIRM",
        hint: "Choose Yes on the Transaction Void confirmation screen.",
        errorFeedback: "Choose Yes to continue with the transaction void."
      },
      {
        stepNumber: 10,
        instruction: "Step 10: Select 'Changed mind' as the transaction-void reason and confirm.",
        expectedAction: "CONFIRM_TRX_VOID",
        expectedData: "Changed mind",
        hint: "Select Changed mind in the reason list, then confirm with Alt+Enter.",
        errorFeedback: "Select Changed mind and confirm the transaction void."
      }
    ]
  },
  {
    id: "scen-cash-sale-basic",
    title: "Module 4 Assessment: Quantity Multiplier, Non-Merchandise & Cash Checkout",
    description: "End-of-module practical assessment: apply the F3 quantity multiplier, scan gel pens, issue a new coupon for unused coupon balance via F6 Non-Merchandise, proceed through Bonus Buy and loyalty selection, and complete a full cash checkout.",
    moduleRef: "mod-4",
    passingScore: 70,
    timeLimitSeconds: 4 * 60,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: A customer is buying 3 pieces of gel pens. First, press F3 (QUANTITY) on the Main Screen.",
        expectedAction: "SET_QTY_MODE",
        hint: "Press F3 (QUANTITY) to open the quantity multiplier before scanning.",
        errorFeedback: "You need to press F3 (QUANTITY) before entering the count."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Enter quantity '3' and press ENTER.",
        expectedAction: "CONFIRM_QTY",
        expectedData: 3,
        hint: "Type 3 in the prompt dialog and press Enter.",
        errorFeedback: "Please enter 3 as the item quantity."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Now enter the Pilot G-Tech Pen SKU: 'NBS-PEN-002' and press ENTER to record 3 pens.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-PEN-002",
        hint: "Type 'NBS-PEN-002' and press Enter to record 3 pieces.",
        errorFeedback: "Please scan or enter 'NBS-PEN-002'."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: The customer did not fully consume their coupon and needs a new coupon for the remaining change. Press F6 (NON MDSE) on the Main Screen.",
        expectedAction: "NON_MDSE",
        hint: "Press F6 on your keyboard or click F6 Non Mdse on the right column.",
        errorFeedback: "Press F6 (NON MDSE) on the Main Screen."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: On the Non-Merchandise screen, select the coupon variance/change item and click [Ok] (or press ENTER) to issue the new coupon and return to the Main Screen.",
        expectedAction: "CONFIRM_NON_MDSE",
        hint: "Select the coupon variance item and click [Ok] or press Enter.",
        errorFeedback: "Confirm the Non-Merchandise coupon variance by clicking [Ok] or pressing Enter."
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
        instruction: "Step 7: The BONUS BUY LIST appears first. Since no paper bag is selected, press Alt+B (or click [CANCEL]) and confirm [Yes] to return to the Main Screen.",
        expectedAction: "CONFIRM_BEST_BUY",
        hint: "Press Alt+B or click [CANCEL] then press ENTER on [Yes].",
        errorFeedback: "Close the Bonus Buy List with [CANCEL] (Alt+B) and confirm [Yes]."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: Back on the Main Screen, press F4 (Payment) again to continue to the 'Choose Option' loyalty prompt.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 on your keyboard or click F4 Payment in the right column.",
        errorFeedback: "Press F4 (Payment) again to open the 'Choose Option' prompt."
      },
      {
        stepNumber: 9,
        instruction: "Step 9: The customer has no loyalty card. In the 'Choose Option' prompt, press 1 on your keyboard (or click '1. None') to open the Payment Screen.",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 1,
        hint: "Press key 1 on your keyboard or click '1. None'.",
        errorFeedback: "Select option 1 (None) to proceed to the Payment Screen."
      },
      {
        stepNumber: 10,
        instruction: "Step 10: Customer hands you a 500 bill. Enter '500' and press ENTER (or click Process Payment / Ok) to confirm tender.",
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
    title: "Lesson 5-1 Practice: Price Change & Transaction Discounts",
    description: "Practice scanning an item, navigating to the 2nd Screen, executing a Price Change (F3) with Manager Override, and applying a Transaction Discount (F6 Trx Disc).",
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
        instruction: "Step 3: A shelf price discrepancy requires a manual price adjustment. Press F3 (PRICE CHANGE) on the 2nd Screen.",
        expectedAction: "PRICE_CHANGE",
        hint: "Click F3 Price Change on the 2nd Screen or press F3.",
        errorFeedback: "Press F3 (PRICE CHANGE) on the 2nd Screen."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Enter the Supervisor PIN ('9999' or '1234') and click 'Authorize (Enter)' to approve the price override.",
        expectedAction: "CONFIRM_OVERRIDE",
        hint: "Type 9999 in the Supervisor PIN box and press Enter.",
        errorFeedback: "Enter the Supervisor PIN (9999) and authorize the Price Change."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Verify or enter the adjusted unit price and click 'Apply Price Change (Enter)' (which returns you to the Main Screen).",
        expectedAction: "CONFIRM_PRICE_CHANGE",
        hint: "Click 'Apply Price Change (Enter)' or press Enter to confirm.",
        errorFeedback: "Confirm the adjusted unit price in the Price Change dialog."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Back on the Main Screen, press F5 (OPTION) to return to the 2nd Screen.",
        expectedAction: "NAV_SECOND",
        hint: "Click F5 Option on the right column or press F5.",
        errorFeedback: "Press F5 (OPTION) to open the 2nd Screen."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: Now press F6 (TRX DISC) on the 2nd Screen to open the Transaction Discount screen.",
        expectedAction: "TRX_DISC",
        hint: "Click F6 Trx Disc on the right keypad or press F6.",
        errorFeedback: "Press F6 (TRX DISC) on the 2nd Screen."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: On the Transaction Discount screen, select Senior Citizen / PWD / LNQR Family Discount and confirm to apply (returning to the Main Screen).",
        expectedAction: "APPLY_DISCOUNT",
        hint: "Select a discount category (e.g. ZSEN 20%), enter details if prompted, and press Enter / Ok to apply.",
        errorFeedback: "Select a discount category and apply it."
      }
    ]
  },
  {
    id: "scen-les-5-2",
    title: "Lesson 5-2 Practice: Suspend, No Sale, Recall & Reprint",
    description: "Practice suspending an active transaction (F9), authorizing a No Sale drawer open (F9 on 2nd Screen), and recalling the suspended sale (F7 Recall).",
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
        instruction: "Step 3: Confirm that you want to suspend the transaction by choosing Yes.",
        expectedAction: "CONFIRM_SUSPEND",
        hint: "Choose Yes in the Suspend confirmation dialog.",
        errorFeedback: "Confirm the transaction suspension by choosing Yes."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Navigate to the 2nd Screen by pressing F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Click F5 Option on the right keypad or press F5.",
        errorFeedback: "Press F5 (OPTION) to reach the 2nd Screen."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: A supervisor needs to verify change in the till without a sale. Press F9 (NO SALE) on the 2nd Screen.",
        expectedAction: "NO_SALE",
        hint: "Click F9 No Sale on the 2nd Screen or press F9.",
        errorFeedback: "Press F9 (NO SALE) on the 2nd Screen."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Authorize the No Sale drawer open by confirming the Manager Override (which returns to the Main Screen).",
        expectedAction: "CONFIRM_OVERRIDE",
        hint: "Complete the Manager Override prompt to authorize No Sale.",
        errorFeedback: "Confirm the Manager Override to authorize No Sale."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: The customer returns! Press F5 (OPTION) on the Main Screen to go back to the 2nd Screen.",
        expectedAction: "NAV_SECOND",
        hint: "Click F5 Option on the right keypad or press F5.",
        errorFeedback: "Press F5 (OPTION) to reach the 2nd Screen."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: On the 2nd Screen, press F7 (RECALL) to retrieve the suspended transaction.",
        expectedAction: "RECALL",
        hint: "Click F7 Recall on the right keypad or press F7.",
        errorFeedback: "Press F7 (RECALL) on the 2nd Screen."
      },
      {
        stepNumber: 9,
        instruction: "Step 9: Authorize access to the Recall screen by confirming the Manager Override.",
        expectedAction: "CONFIRM_OVERRIDE",
        hint: "Complete the Manager Override prompt to open the Recall screen.",
        errorFeedback: "Confirm the Manager Override to continue to Recall."
      },
      {
        stepNumber: 10,
        instruction: "Step 10: In the Recall buffer screen, select the suspended transaction and click 'Recall Transaction' (or press Alt+Enter) to restore it to the Main Screen.",
        expectedAction: "CONFIRM_RECALL",
        hint: "Click 'Recall Transaction' on the suspended entry to restore the transaction.",
        errorFeedback: "Select and confirm the suspended transaction to recall it."
      }
    ]
  },
  {
    id: "scen-mod-5",
    title: "Module 5 Assessment: Suspend, Recall, Discount & Receipt Reprint",
    description: "Test all Module 5 skills in one combined scenario: scan an item, suspend and recall the transaction, navigate back to the 2nd Screen to apply a Transaction Discount, and execute an Official Receipt Reprint.",
    moduleRef: "mod-5",
    passingScore: 70,
    timeLimitSeconds: 5 * 60,
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
        instruction: "Step 3: Confirm that you want to suspend the transaction by choosing Yes.",
        expectedAction: "CONFIRM_SUSPEND",
        hint: "Choose Yes on the Suspend confirmation screen.",
        errorFeedback: "Confirm the transaction suspension by choosing Yes."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Switch to the 2nd Screen by pressing F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Click F5 Option on the right keypad.",
        errorFeedback: "Press F5 to open the 2nd Screen."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Recall the held transaction by pressing F7 (RECALL) on the 2nd Screen.",
        expectedAction: "RECALL",
        hint: "Click F7 Recall on the 2nd Screen.",
        errorFeedback: "Press F7 (RECALL) to retrieve the suspended sale."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Authorize access to the Recall screen by confirming the Manager Override.",
        expectedAction: "CONFIRM_OVERRIDE",
        hint: "Complete the Manager Override prompt to open the Recall screen.",
        errorFeedback: "Confirm the Manager Override to continue to Recall."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: In the Recall buffer, select the suspended transaction and click 'Recall Transaction' (or press Alt+Enter) to restore it to the Main Screen.",
        expectedAction: "CONFIRM_RECALL",
        hint: "Click 'Recall Transaction' to restore the transaction.",
        errorFeedback: "Confirm recall of the transaction."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: Now back on the Main Screen, press F5 (OPTION) to open the 2nd Screen.",
        expectedAction: "NAV_SECOND",
        hint: "Click F5 Option on the right keypad or press F5.",
        errorFeedback: "Press F5 (OPTION) to navigate to the 2nd Screen."
      },
      {
        stepNumber: 9,
        instruction: "Step 9: On the 2nd Screen, apply an Employee/Senior Discount by pressing F6 (TRX DISC).",
        expectedAction: "TRX_DISC",
        hint: "Click F6 Trx Disc on the 2nd Screen.",
        errorFeedback: "Press F6 (TRX DISC) on the 2nd Screen."
      },
      {
        stepNumber: 10,
        instruction: "Step 10: On the Transaction Discount screen, select Senior Citizen Discount (ZSEN, 20%) and confirm (returning to the Main Screen).",
        expectedAction: "APPLY_DISCOUNT",
        hint: "Select Senior Citizen Discount (ZSEN, 20%) and apply the discount.",
        errorFeedback: "Select and apply the discount."
      },
      {
        stepNumber: 11,
        instruction: "Step 11: Back on the Main Screen, press F5 (OPTION) to open the 2nd Screen for receipt reprinting.",
        expectedAction: "NAV_SECOND",
        hint: "Click F5 Option on the right keypad or press F5.",
        errorFeedback: "Press F5 (OPTION) to navigate to the 2nd Screen."
      },
      {
        stepNumber: 12,
        instruction: "Step 12: On the 2nd Screen, initiate reprinting an Official Receipt by pressing F2 (REPRINT).",
        expectedAction: "REPRINT",
        hint: "Click F2 Reprint at the top of the 2nd Screen function column.",
        errorFeedback: "Press F2 (REPRINT) on the 2nd Screen."
      },
      {
        stepNumber: 13,
        instruction: "Step 13: Authorize the receipt reprint by confirming the Manager Override.",
        expectedAction: "CONFIRM_OVERRIDE",
        hint: "Click Confirm Override to authorize the receipt reprint.",
        errorFeedback: "Authorize receipt reprint in the Manager Override screen."
      },
      {
        stepNumber: 14,
        instruction: "Step 14: In the Reprint Official Receipt window, verify the OR number and click 'Reprint Receipt' (or press Enter) to finish.",
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
    title: "Lesson 6-1 Practice: Journals, Cashier (Y) & Terminal (Z) Readings",
    description: "Navigate to the 3rd Screen, inspect and close the Transaction Journal (F4) and Sales Journal (F6), print the shift Cashier Reading (F8 -> Print), and complete the end-of-day Terminal Reading (F9 -> Yes -> Print).",
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
        instruction: "Step 3: On the 3rd Screen, open the electronic Transaction Journal by pressing F4 (TRX JOURNAL).",
        expectedAction: "TRX_JOURNAL",
        hint: "Click F4 Trx Journal on the 3rd Screen or press F4.",
        errorFeedback: "Press F4 (TRX JOURNAL) on the 3rd Screen."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Review the Transaction Journal tape, then click 'Back (Alt + B)' or press ESC to return to the 3rd Screen.",
        expectedAction: "CLOSE_JOURNAL",
        hint: "Click Back (Alt + B) or press ESC.",
        errorFeedback: "Close the Transaction Journal with Back (Alt + B) or ESC."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Next, inspect the daily Sales Journal by pressing F6 (SALES JOURNAL) on the 3rd Screen.",
        expectedAction: "SALES_JOURNAL",
        hint: "Click F6 Sales Journal on the 3rd Screen or press F6.",
        errorFeedback: "Press F6 (SALES JOURNAL) on the 3rd Screen."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Review the Sales Journal record, then click 'Back (Alt + B)' or press ESC to return to the 3rd Screen.",
        expectedAction: "CLOSE_JOURNAL",
        hint: "Click Back (Alt + B) or press ESC.",
        errorFeedback: "Close the Sales Journal with Back (Alt + B) or ESC."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: Open your end-of-shift Cashier (Y) Reading by pressing F8 (CASHIER RDG).",
        expectedAction: "READING_Y",
        hint: "Click F8 Cashier Rdg on the 3rd Screen or press F8.",
        errorFeedback: "Press F8 (CASHIER RDG) on the 3rd Screen."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: On the Y-Reading screen, press ENTER or click 'Print (Enter)' to generate and print the shift summary.",
        expectedAction: "PRINT_READING_Y",
        hint: "Click 'Print (Enter)' or press Enter to print the Y-Reading.",
        errorFeedback: "Press Enter or click 'Print (Enter)' to print the Y-Reading."
      },
      {
        stepNumber: 9,
        instruction: "Step 9: Open the end-of-day Terminal (Z) Reading by pressing F9 (TERMINAL RDG) on the 3rd Screen.",
        expectedAction: "READING_Z",
        hint: "Click F9 Terminal Rdg on the 3rd Screen or press F9.",
        errorFeedback: "Press F9 (TERMINAL RDG) on the 3rd Screen."
      },
      {
        stepNumber: 10,
        instruction: "Step 10: In the REGISTER CLEARING prompt ('Are you sure you want to clear all totals?'), press ENTER on [Yes] (or click [Yes]).",
        expectedAction: "CONFIRM_Z_CLEARING",
        hint: "Click [Yes] or press Enter in the Register Clearing prompt.",
        errorFeedback: "Confirm [Yes] in the Register Clearing dialog."
      },
      {
        stepNumber: 11,
        instruction: "Step 11: On the Z-Reading screen, press ENTER or click 'Print (Enter)' to generate the final Z-Reading report.",
        expectedAction: "PRINT_READING_Z",
        hint: "Click 'Print (Enter)' or press Enter to print the Z-Reading.",
        errorFeedback: "Press Enter or click 'Print (Enter)' to print the Z-Reading."
      }
    ]
  },
  {
    id: "scen-les-6-2",
    title: "Lesson 6-2 Practice: Post Void (F2) & Sales Data Verification (SDV)",
    description: "Navigate to the 3rd Screen, execute a same-day Post Void (F2) with supervisor override, and run a Sales Data Verification (F10 SDV) check.",
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
        instruction: "Step 3: On the 3rd Screen, initiate a same-day receipt cancellation by pressing F2 (POST VOID).",
        expectedAction: "POST_VOID",
        hint: "Click F2 Post Void at the top of the 3rd Screen function column.",
        errorFeedback: "Press F2 (POST VOID) on the 3rd Screen."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Enter the supervisor PIN ('9999' or '1234') and authorize the Post Void.",
        expectedAction: "CONFIRM_OVERRIDE",
        hint: "Enter the supervisor PIN (9999 or 1234) and click Authorize.",
        errorFeedback: "Enter and authorize with the supervisor PIN."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: On the Post Void screen, verify the OR number and reason, then click 'Confirm Void'.",
        expectedAction: "CONFIRM_POST_VOID",
        hint: "Click 'Confirm Void' in the Post Void dialog.",
        errorFeedback: "Confirm the Post Void in the dialog."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Now run Sales Data Verification on the 3rd Screen by pressing F10 (SDV) to verify that Header, Detail, and PayDetail counts tally.",
        expectedAction: "SDV_CHECK",
        hint: "Click F10 SDV at the bottom of the 3rd Screen function keypad.",
        errorFeedback: "Press F10 (SDV) on the 3rd Screen to verify database tallies."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: Confirm that Saleshdr, Salesdtl, and Paydtl tally with no missing OR, then click 'CANCEL <Alt-B>' (or press ESC) to close SDV.",
        expectedAction: "CLOSE_SDV",
        hint: "Click CANCEL <Alt-B> on the green bottom bar or press ESC.",
        errorFeedback: "Click CANCEL <Alt-B> or press ESC to close the SDV screen."
      }
    ]
  },
  {
    id: "scen-mod-6",
    title: "Module 6 Assessment: Journal Review, Post-Void Audit & Closing Readings",
    description: "Put all 3rd-Screen accounting utilities to the test: navigate to the 3rd Screen, review the Transaction Journal (F4), execute a Post Void (F2) with supervisor override, verify database integrity via SDV (F10), and print both Y-Reading (F8) and Z-Reading (F9).",
    moduleRef: "mod-6",
    passingScore: 70,
    timeLimitSeconds: 5 * 60,
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
        instruction: "Step 3: Inspect the electronic Transaction Journal first by pressing F4 (TRX JOURNAL).",
        expectedAction: "TRX_JOURNAL",
        hint: "Click F4 Trx Journal on the 3rd Screen or press F4.",
        errorFeedback: "Press F4 (TRX JOURNAL) on the 3rd Screen."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Close the Transaction Journal by clicking 'Back (Alt + B)' or pressing ESC.",
        expectedAction: "CLOSE_JOURNAL",
        hint: "Click Back (Alt + B) or press ESC to return to the 3rd Screen.",
        errorFeedback: "Close the Transaction Journal using Back (Alt + B) or ESC."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Before closing the terminal, a completed receipt must be post-voided. Press F2 (POST VOID) on the 3rd Screen.",
        expectedAction: "POST_VOID",
        hint: "Click F2 Post Void at the top of the 3rd Screen function column.",
        errorFeedback: "Press F2 (POST VOID) on the 3rd Screen."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Enter the supervisor PIN ('9999' or '1234') and authorize the Post Void.",
        expectedAction: "CONFIRM_OVERRIDE",
        hint: "Enter the supervisor PIN (9999 or 1234) and authorize to continue.",
        errorFeedback: "Enter and authorize with the supervisor PIN."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: On the Post Void screen, select or confirm the invoice to void and click 'Confirm Void'.",
        expectedAction: "CONFIRM_POST_VOID",
        hint: "Click 'Confirm Void' in the Post Void dialog.",
        errorFeedback: "Confirm the Post Void in the dialog."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: Run a Sales Data Verification check first to confirm all tables tally before printing readings. Press F10 (SDV).",
        expectedAction: "SDV_CHECK",
        hint: "Click F10 SDV on the 3rd Screen function keypad.",
        errorFeedback: "Press F10 (SDV) on the 3rd Screen."
      },
      {
        stepNumber: 9,
        instruction: "Step 9: After verifying that Sales Header, Detail, and Pay Detail tally, click 'CANCEL <Alt-B>' (or press ESC) to return to the 3rd Screen.",
        expectedAction: "CLOSE_SDV",
        hint: "Click CANCEL <Alt-B> on the green bottom bar or press ESC.",
        errorFeedback: "Close SDV using CANCEL <Alt-B> or ESC."
      },
      {
        stepNumber: 10,
        instruction: "Step 10: Open the Cashier shift reconciliation report by pressing F8 (CASHIER RDG).",
        expectedAction: "READING_Y",
        hint: "Click F8 Cashier Rdg on the 3rd Screen or press F8.",
        errorFeedback: "Press F8 (CASHIER RDG) to open the Y-Reading."
      },
      {
        stepNumber: 11,
        instruction: "Step 11: Print the Cashier Y-Reading report by pressing ENTER or clicking 'Print (Enter)'.",
        expectedAction: "PRINT_READING_Y",
        hint: "Click 'Print (Enter)' or press Enter.",
        errorFeedback: "Press Enter or click 'Print (Enter)' to print the Y-Reading."
      },
      {
        stepNumber: 12,
        instruction: "Step 12: Open the final End-of-Day Terminal reconciliation by pressing F9 (TERMINAL RDG).",
        expectedAction: "READING_Z",
        hint: "Click F9 Terminal Rdg on the 3rd Screen or press F9.",
        errorFeedback: "Press F9 (TERMINAL RDG) to open the Z-Reading."
      },
      {
        stepNumber: 13,
        instruction: "Step 13: Confirm Register Clearing by pressing ENTER on [Yes] (or clicking [Yes]).",
        expectedAction: "CONFIRM_Z_CLEARING",
        hint: "Click [Yes] or press Enter in the Register Clearing prompt.",
        errorFeedback: "Confirm [Yes] in the Register Clearing prompt."
      },
      {
        stepNumber: 14,
        instruction: "Step 14: Print the final Terminal Z-Reading report by pressing ENTER or clicking 'Print (Enter)'.",
        expectedAction: "PRINT_READING_Z",
        hint: "Click 'Print (Enter)' or press Enter to complete the Z-Reading.",
        errorFeedback: "Press Enter or click 'Print (Enter)' to print the Z-Reading."
      }
    ]
  },

  // =========================================================================
  // MODULE 7: FOURTH-PAGE FUNCTIONS & EXCEPTIONS
  // =========================================================================
  {
    id: "scen-les-7-1",
    title: "Lesson 7-1 Practice: Transaction Comments (F3) & Non-Sales (F4)",
    description: "Navigate to the 4th Screen, record corporate billing and TIN details in Transaction Comments (F3), and process a Non-Sales deposit/gift card reload (F4).",
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
        instruction: "Step 5: On the Transaction Comments screen, enter or review customer TIN and company details, then click [Save Comments] (which returns to the Main Screen).",
        expectedAction: "SAVE_TRX_COMMENT",
        hint: "Click Save Comments in the dialog to record corporate details.",
        errorFeedback: "Save the transaction comment to continue."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Back on the Main Screen, use the reverse page shortcut by pressing F11 (PAGE UP) to jump directly to the 4th Screen.",
        expectedAction: "PAGE_UP",
        hint: "Press F11 on your keyboard or click the F11 Page Up button under the barcode box.",
        errorFeedback: "Press F11 (PAGE UP) to jump directly to the 4th Screen."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: On the 4th Screen, press F4 (NON SALES) to record a non-sales deposit or card reload.",
        expectedAction: "NON_SALES",
        hint: "Click F4 Non Sales on the 4th Screen or press F4.",
        errorFeedback: "Press F4 (NON SALES) on the 4th Screen."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: Verify the Non-Sales transaction type, amount, and reference number, then click 'Process Non-Sales (Enter)' to return to the Main Screen.",
        expectedAction: "CONFIRM_NON_SALES",
        hint: "Click 'Process Non-Sales (Enter)' or press Enter in the dialog.",
        errorFeedback: "Confirm the Non-Sales transaction in the dialog."
      }
    ]
  },
  {
    id: "scen-les-7-2",
    title: "Lesson 7-2 Practice: Item Returns (F8) & Returned SKU Entry",
    description: "Navigate to the 4th Screen, initiate an item Return (F8 Return) with SI verification, and scan the returned item barcode on the Main Screen.",
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
        instruction: "Step 5: On the Return screen, verify the Sales Invoice (SI) number and reason, then click 'Confirm Return' (returning to the Main Screen in Return UPC mode).",
        expectedAction: "CONFIRM_RETURN",
        hint: "Click 'Confirm Return' in the dialog.",
        errorFeedback: "Confirm the item return in the dialog."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Back on the Main Screen ('Enter Refund UPC'), scan or enter the returned item SKU 'NBS-BK-001' and press ENTER to post the negative return line.",
        expectedAction: "SCAN_REFUND_SKU",
        expectedData: "NBS-BK-001",
        hint: "Type NBS-BK-001 in the yellow 'Enter Refund UPC' box and press Enter.",
        errorFeedback: "Scan or enter 'NBS-BK-001' to record the returned item."
      }
    ]
  },
  {
    id: "scen-mod-7",
    title: "Module 7 Assessment: Zero-Rated Corporate Sale & Refund Exception",
    description: "Test all 4th-Screen exception workflows: navigate to the 4th Screen, record Corporate TIN Comments (F3), return to the 4th Screen to activate Zero-Rated VAT exemption (F7), and process a Cash Refund (F10) with supervisor override.",
    moduleRef: "mod-7",
    passingScore: 70,
    timeLimitSeconds: 5 * 60,
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
        instruction: "Step 5: On the Transaction Comments screen, enter or verify corporate billing information and click [Save Comments] (returning to the Main Screen).",
        expectedAction: "SAVE_TRX_COMMENT",
        hint: "Click Save Comments in the dialog.",
        errorFeedback: "Save the transaction comment to continue."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Back on the Main Screen, press F11 (PAGE UP) to jump directly back to the 4th Screen.",
        expectedAction: "PAGE_UP",
        hint: "Press F11 on your keyboard or click the F11 Page Up arrow button.",
        errorFeedback: "Press F11 (PAGE UP) to return to the 4th Screen."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: Apply VAT Zero-Rating for the tax-exempt corporate buyer by pressing F7 (ZERO RATED) on the 4th Screen.",
        expectedAction: "ZERO_RATED",
        hint: "Click F7 Zero Rated on the 4th Screen.",
        errorFeedback: "Press F7 (ZERO RATED) on the 4th Screen."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: Enter the manager override to authorize Zero Rated (which applies Zero Rated and returns to the Main Screen).",
        expectedAction: "CONFIRM_OVERRIDE",
        hint: "Complete the Manager Override prompt to apply Zero Rated.",
        errorFeedback: "Authorize Zero Rated in the Manager Override prompt."
      },
      {
        stepNumber: 9,
        instruction: "Step 9: Back on the Main Screen, press F11 (PAGE UP) to jump directly back to the 4th Screen.",
        expectedAction: "PAGE_UP",
        hint: "Press F11 on your keyboard or click the F11 Page Up arrow button.",
        errorFeedback: "Press F11 (PAGE UP) to return to the 4th Screen."
      },
      {
        stepNumber: 10,
        instruction: "Step 10: Initiate a cash Refund exception by pressing F10 (REFUND) on the 4th Screen.",
        expectedAction: "REFUND",
        hint: "Click F10 Refund at the bottom of the 4th Screen keypad.",
        errorFeedback: "Press F10 (REFUND) on the 4th Screen."
      },
      {
        stepNumber: 11,
        instruction: "Step 11: Enter the manager override PIN to authorize the refund.",
        expectedAction: "CONFIRM_OVERRIDE",
        hint: "Complete the Manager Override prompt for Refund.",
        errorFeedback: "Authorize the refund in the Manager Override prompt."
      },
      {
        stepNumber: 12,
        instruction: "Step 12: Enter or verify the ORNO and continue to the refund confirmation screen.",
        expectedAction: "REFUND_ORNO",
        hint: "Enter the ORNO in the Refund form and press Alt+Enter or click Ok.",
        errorFeedback: "Enter the ORNO and continue to the refund confirmation screen."
      },
      {
        stepNumber: 13,
        instruction: "Step 13: Review the refund confirmation screen and receipt, then confirm the refund (which completes the refund and returns to the Main Screen).",
        expectedAction: "CONFIRM_REFUND",
        hint: "Review the displayed receipt and click Yes or press Enter to confirm the refund.",
        errorFeedback: "Review the refund receipt and confirm the refund."
      }
    ]
  },

  // =========================================================================
  // MODULE 8: PAYMENT SCREEN & TENDER METHODS
  // =========================================================================
  {
    id: "scen-les-8-1",
    title: "Lesson 8-1 Practice: Cash Tender & Change Computation",
    description: "Scan A4 Copy Paper, open Payment, skip the Bonus Buy bag with Alt+B, select option 1 (None) for non-loyalty customers, and tender PHP 250.00 cash to compute change due.",
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
        instruction: "Step 3: The BONUS BUY LIST appears first. Since no paper bag is selected, press Alt+B (or click [CANCEL]) and confirm [Yes] to return to the Main Screen.",
        expectedAction: "CONFIRM_BEST_BUY",
        hint: "Press Alt+B or click [CANCEL] then press ENTER on [Yes].",
        errorFeedback: "Close the Bonus Buy List with [CANCEL] (Alt+B) and confirm [Yes]."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Back on the Main Screen, press F4 (Payment) again to continue to the 'Choose Option' loyalty prompt.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 on your keyboard or click F4 Payment in the right column.",
        errorFeedback: "Press F4 (Payment) again to open the 'Choose Option' prompt."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: The customer has no loyalty card. Select option 1 (None) by pressing 1 on your keyboard (or clicking '1. None').",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 1,
        hint: "Press 1 on your keyboard or click '1. None'.",
        errorFeedback: "Select option 1 (None) to proceed to the Payment Screen."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Notice F2 Cash is already selected by default! Enter cash tender amount '250' and press ENTER (or click Process Payment / Ok) to complete the transaction.",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 250,
        hint: "Type 250 and press Enter.",
        errorFeedback: "Type 250 and press Enter."
      }
    ]
  },
  {
    id: "scen-les-8-2",
    title: "Lesson 8-2 Practice: Credit Card Terminal & E-Wallets (GCash / Maya)",
    description: "Practice two back-to-back customer electronic checkouts under F3 Bank Card: Customer 1 pays by Credit Card (with card swipe & terminal approval), and Customer 2 pays via GCash E-Wallet.",
    moduleRef: "mod-8",
    lessonRef: "les-8-2",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Customer 1 buys Color Pencils. Scan or enter barcode 'NBS-ART-004' (Faber-Castell Color Pencils, ₱180.00) and press ENTER.",
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
        instruction: "Step 3: The BONUS BUY LIST appears first. Since no paper bag is selected, press Alt+B (or click [CANCEL]) and confirm [Yes] to return to the Main Screen.",
        expectedAction: "CONFIRM_BEST_BUY",
        hint: "Press Alt+B or click [CANCEL] then press ENTER on [Yes].",
        errorFeedback: "Close the Bonus Buy List with [CANCEL] (Alt+B) and confirm [Yes]."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Back on the Main Screen, press F4 (Payment) again to continue to the 'Choose Option' loyalty prompt.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 on your keyboard or click F4 Payment in the right column.",
        errorFeedback: "Press F4 (Payment) again to open the 'Choose Option' prompt."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Customer 1 has no loyalty card. Select option 1 (None) by pressing 1 on your keyboard (or clicking '1. None').",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 1,
        hint: "Press 1 on your keyboard or click '1. None'.",
        errorFeedback: "Select option 1 (None) to proceed to the Payment Screen."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Customer 1 is paying by credit card. Press F3 (BANK CARD) on the Payment Screen.",
        expectedAction: "PAY_CARD",
        hint: "Click F3 Bank Card on the right function column or press F3.",
        errorFeedback: "Press F3 (BANK CARD) for the customer's credit card payment."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: Select CREDIT CARD from the card type list and press Ok.",
        expectedAction: "SELECT_CARD_TYPE",
        expectedData: "CREDIT CARD",
        hint: "Select CREDIT CARD from Please Select Card Type, then press Ok.",
        errorFeedback: "Select CREDIT CARD and confirm the card type."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: Swipe the credit card by entering its number and pressing Enter.",
        expectedAction: "SWIPE_CARD",
        hint: "Enter the card number in the Swipe Card field and submit it.",
        errorFeedback: "Swipe or enter the credit card number to continue."
      },
      {
        stepNumber: 9,
        instruction: "Step 9: Verify the card holder, terminal, expiry, authorization code, and invoice details, then press Ok to finalize Customer 1's PHP 180.00 payment.",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 180,
        hint: "Review the card details and press Ok (or Enter) to complete Customer 1's payment.",
        errorFeedback: "Complete the card details and confirm the PHP 180.00 payment."
      },
      {
        stepNumber: 10,
        instruction: "Step 10: Customer 2 approaches to pay via GCash! Scan or enter 'NBS-CAL-005' (Casio Scientific Calculator, ₱420.00) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-CAL-005",
        hint: "Type NBS-CAL-005 in the yellow barcode box and press Enter.",
        errorFeedback: "Scan or enter 'NBS-CAL-005' for Customer 2."
      },
      {
        stepNumber: 11,
        instruction: "Step 11: Press F4 (PAYMENT) to open the payment flow for Customer 2.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 or click F4 Payment.",
        errorFeedback: "Press F4 (PAYMENT) to proceed."
      },
      {
        stepNumber: 12,
        instruction: "Step 12: On the BONUS BUY LIST, press Alt+B (or click [CANCEL]) and confirm [Yes] to return to the Main Screen.",
        expectedAction: "CONFIRM_BEST_BUY",
        hint: "Press Alt+B or click [CANCEL] then press ENTER on [Yes].",
        errorFeedback: "Close the Bonus Buy List with [CANCEL] (Alt+B) and confirm [Yes]."
      },
      {
        stepNumber: 13,
        instruction: "Step 13: Back on the Main Screen, press F4 (Payment) again to open the 'Choose Option' prompt.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 or click F4 Payment.",
        errorFeedback: "Press F4 (Payment) again."
      },
      {
        stepNumber: 14,
        instruction: "Step 14: Select option 1 (None) by pressing 1 on your keyboard (or clicking '1. None').",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 1,
        hint: "Press 1 on your keyboard or click '1. None'.",
        errorFeedback: "Select option 1 (None)."
      },
      {
        stepNumber: 15,
        instruction: "Step 15: Customer 2 is paying via GCash. Press F3 (BANK CARD) on the Payment Screen.",
        expectedAction: "PAY_CARD",
        hint: "Click F3 Bank Card on the right column or press F3.",
        errorFeedback: "Press F3 (BANK CARD) to access GCash."
      },
      {
        stepNumber: 16,
        instruction: "Step 16: Select 'GCASH' from the card type list and click [Ok] (or press Enter).",
        expectedAction: "SELECT_CARD_TYPE",
        expectedData: "GCASH",
        hint: "Select GCASH in the Please Select Card Type dropdown and click [Ok].",
        errorFeedback: "Select GCASH from the card type dropdown and click [Ok]."
      },
      {
        stepNumber: 17,
        instruction: "Step 17: On the GCASH Payment Details screen, verify the amount ('420.00') and Reference/Approval Code, then click [Ok] (or press Enter) to complete the e-wallet checkout.",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 420,
        hint: "Verify the GCash Reference No. and amount 420.00, then click [Ok] or press Enter.",
        errorFeedback: "Confirm the PHP 420.00 GCash payment by clicking [Ok] or pressing Enter."
      }
    ]
  },
  {
    id: "scen-les-8-3",
    title: "Lesson 8-3 Practice: LNQR Sulit Coins Redemption & NBS Gift Card",
    description: "Practice two specialized tenders under F3 Bank Card: Customer 1 redeems PHP 29.00 in LNQR Sulit Coins and settles the remaining balance in Cash, and Customer 2 pays with an NBS Gift Card.",
    moduleRef: "mod-8",
    lessonRef: "les-8-3",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Customer 1 buys a calculator and wants to redeem Sulit Coins. Scan 'NBS-CAL-005' (Casio Scientific Calculator, ₱420.00) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-CAL-005",
        hint: "Type NBS-CAL-005 in the yellow barcode box and press Enter.",
        errorFeedback: "Scan or enter 'NBS-CAL-005'."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Press F4 (PAYMENT) to open the payment flow.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 or click F4 Payment.",
        errorFeedback: "Press F4 (PAYMENT) to proceed."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: On the BONUS BUY LIST, press Alt+B (or click [CANCEL]) and confirm [Yes] to return to the Main Screen.",
        expectedAction: "CONFIRM_BEST_BUY",
        hint: "Press Alt+B or click [CANCEL] then press ENTER on [Yes].",
        errorFeedback: "Close the Bonus Buy List with [CANCEL] (Alt+B) and confirm [Yes]."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Back on the Main Screen, press F4 (Payment) again to open the 'Choose Option' prompt.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 or click F4 Payment.",
        errorFeedback: "Press F4 (Payment) again."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: The customer has LNQR! Select option 3 (LNQR / LNQR PLUS) by pressing 3 on your keyboard (or clicking '3. LNQR / LNQR PLUS').",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 3,
        hint: "Press 3 on your keyboard or click '3. LNQR / LNQR PLUS'.",
        errorFeedback: "Select option 3 (LNQR / LNQR PLUS)."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: On the LNQR scan screen, scan or verify the customer QR code '20221003LN000004', then press ENTER (or click [Ok]).",
        expectedAction: "SUBMIT_LNQR",
        expectedData: "20221003LN000004",
        hint: "Verify customer QR code '20221003LN000004' and press Enter or click [Ok].",
        errorFeedback: "Scan or submit customer QR code '20221003LN000004'."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: On the Payment Screen, press F3 (BANK CARD) to access LNQR Sulit Coins redemption.",
        expectedAction: "PAY_CARD",
        hint: "Click F3 Bank Card on the right column or press F3.",
        errorFeedback: "Press F3 (BANK CARD) on the Payment Screen."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: Select 'LNQR Sulit Coins' from the Please Select Card Type list and click [Ok].",
        expectedAction: "SELECT_CARD_TYPE",
        expectedData: "LNQR Sulit Coins",
        hint: "Choose 'LNQR Sulit Coins' in the card type dropdown and click [Ok].",
        errorFeedback: "Select 'LNQR Sulit Coins' and click [Ok]."
      },
      {
        stepNumber: 9,
        instruction: "Step 9: On the LNQR Sulit Coins Payment Details screen, verify or enter '29.00' in Enter Amount and the customer QR code ('20221003LN000004'), then click [Ok] (or press Enter) to deduct ₱29.00.",
        expectedAction: "REDEEM_SULIT_COINS",
        expectedData: 29,
        hint: "Verify Enter Amount is 29.00 and QR code is 20221003LN000004, then click [Ok].",
        errorFeedback: "Submit the PHP 29.00 LNQR Sulit Coins redemption by clicking [Ok]."
      },
      {
        stepNumber: 10,
        instruction: "Step 10: The POS switches to Cash Payment Details for the remaining ₱391.00 balance. Verify or enter '3000.00' (or '500') and press ENTER (or click [Ok]).",
        expectedAction: "SUBMIT_CASH_TENDER",
        hint: "Press Enter or click [Ok] on the Cash Payment Details screen to tender the remaining balance.",
        errorFeedback: "Submit the cash tender for the remaining balance."
      },
      {
        stepNumber: 11,
        instruction: "Step 11: When the 'LNQR has been updated!' confirmation dialog appears, press ENTER (or click [OK]) to finish Customer 1's transaction.",
        expectedAction: "CONFIRM_LNQR_UPDATED",
        hint: "Click [OK] or press Enter in the 'LNQR has been updated!' popup.",
        errorFeedback: "Confirm the LNQR updated dialog by clicking [OK] or pressing Enter."
      },
      {
        stepNumber: 12,
        instruction: "Step 12: Customer 2 approaches with an NBS Gift Card! Scan or enter 'NBS-PAP-003' (A4 Copy Paper, ₱240.00) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-PAP-003",
        hint: "Type NBS-PAP-003 in the yellow barcode box and press Enter.",
        errorFeedback: "Scan or enter 'NBS-PAP-003' for Customer 2."
      },
      {
        stepNumber: 13,
        instruction: "Step 13: Press F4 (PAYMENT) to open the payment flow.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 or click F4 Payment.",
        errorFeedback: "Press F4 (PAYMENT) to proceed."
      },
      {
        stepNumber: 14,
        instruction: "Step 14: On the BONUS BUY LIST, press Alt+B (or click [CANCEL]) and confirm [Yes] to return to the Main Screen.",
        expectedAction: "CONFIRM_BEST_BUY",
        hint: "Press Alt+B or click [CANCEL] then press ENTER on [Yes].",
        errorFeedback: "Close the Bonus Buy List with [CANCEL] (Alt+B) and confirm [Yes]."
      },
      {
        stepNumber: 15,
        instruction: "Step 15: Back on the Main Screen, press F4 (Payment) again to open the 'Choose Option' prompt.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 or click F4 Payment.",
        errorFeedback: "Press F4 (Payment) again."
      },
      {
        stepNumber: 16,
        instruction: "Step 16: Select option 1 (None) by pressing 1 on your keyboard (or clicking '1. None').",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 1,
        hint: "Press 1 on your keyboard or click '1. None'.",
        errorFeedback: "Select option 1 (None)."
      },
      {
        stepNumber: 17,
        instruction: "Step 17: Press F3 (BANK CARD) on the Payment Screen to select NBS Gift Card.",
        expectedAction: "PAY_CARD",
        hint: "Click F3 Bank Card on the right column or press F3.",
        errorFeedback: "Press F3 (BANK CARD) on the Payment Screen."
      },
      {
        stepNumber: 18,
        instruction: "Step 18: Select 'NBS GIFTCARD' from the Please Select Card Type list and click [Ok].",
        expectedAction: "SELECT_CARD_TYPE",
        expectedData: "NBS GIFTCARD",
        hint: "Choose 'NBS GIFTCARD' in the card type dropdown and click [Ok].",
        errorFeedback: "Select 'NBS GIFTCARD' and click [Ok]."
      },
      {
        stepNumber: 19,
        instruction: "Step 19: On the NBS GIFTCARD Payment Details screen, verify the amount ('240.00') and Gift Card number, then click [Ok] (or press Enter) to complete Lesson 8-3.",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 240,
        hint: "Verify the Gift Card details and click [Ok] or press Enter.",
        errorFeedback: "Confirm the PHP 240.00 NBS Gift Card payment by clicking [Ok] or pressing Enter."
      }
    ]
  },
  {
    id: "scen-les-8-4",
    title: "Lesson 8-4 Practice: Gift Certificates (F5), Promo Coupons (F6) & Credit Memo (F8)",
    description: "Master all remaining right-column tender methods on the Payment Screen across 3 customer checkouts: Customer 1 pays by Gift Certificate (F5), Customer 2 redeems a Promo Coupon (F6), and Customer 3 applies a Credit Memo (F8).",
    moduleRef: "mod-8",
    lessonRef: "les-8-4",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Customer 1 presents a Sodexo / NBS Gift Certificate. Scan 'NBS-PAP-003' (A4 Copy Paper, ₱240.00) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-PAP-003",
        hint: "Type NBS-PAP-003 in the yellow barcode box and press Enter.",
        errorFeedback: "Scan or enter 'NBS-PAP-003'."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Press F4 (PAYMENT) to open the payment flow.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 or click F4 Payment.",
        errorFeedback: "Press F4 (PAYMENT) to proceed."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: On the BONUS BUY LIST, press Alt+B (or click [CANCEL]) and confirm [Yes] to return to the Main Screen.",
        expectedAction: "CONFIRM_BEST_BUY",
        hint: "Press Alt+B or click [CANCEL] then press ENTER on [Yes].",
        errorFeedback: "Close the Bonus Buy List with [CANCEL] (Alt+B) and confirm [Yes]."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Back on the Main Screen, press F4 (Payment) again to open the 'Choose Option' prompt.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 or click F4 Payment.",
        errorFeedback: "Press F4 (Payment) again."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Select option 1 (None) by pressing 1 on your keyboard (or clicking '1. None').",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 1,
        hint: "Press 1 on your keyboard or click '1. None'.",
        errorFeedback: "Select option 1 (None)."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: On the Payment Screen, press F5 (GIFT CERT.) in the right function column.",
        expectedAction: "PAY_GC",
        hint: "Click F5 Gift Cert. on the right column or press F5.",
        errorFeedback: "Press F5 (GIFT CERT.) on the Payment Screen."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: In Gift Certificate Details, enter the GC denomination '240' in Enter Amount and press ENTER (or click [Ok]) to complete Customer 1's sale.",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 240,
        hint: "Type 240 in Enter Amount and press Enter or click [Ok].",
        errorFeedback: "Enter 240 and confirm the Gift Certificate tender."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: Customer 2 presents a Promo Coupon! Scan or enter 'NBS-PEN-002' (Pilot G-Tech Pen, ₱85.00) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-PEN-002",
        hint: "Type NBS-PEN-002 in the yellow barcode box and press Enter.",
        errorFeedback: "Scan or enter 'NBS-PEN-002' for Customer 2."
      },
      {
        stepNumber: 9,
        instruction: "Step 9: Press F4 (PAYMENT) to open the payment flow.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 or click F4 Payment.",
        errorFeedback: "Press F4 (PAYMENT) to proceed."
      },
      {
        stepNumber: 10,
        instruction: "Step 10: On the BONUS BUY LIST, press Alt+B (or click [CANCEL]) and confirm [Yes] to return to the Main Screen.",
        expectedAction: "CONFIRM_BEST_BUY",
        hint: "Press Alt+B or click [CANCEL] then press ENTER on [Yes].",
        errorFeedback: "Close the Bonus Buy List with [CANCEL] (Alt+B) and confirm [Yes]."
      },
      {
        stepNumber: 11,
        instruction: "Step 11: Back on the Main Screen, press F4 (Payment) again to open the 'Choose Option' prompt.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 or click F4 Payment.",
        errorFeedback: "Press F4 (Payment) again."
      },
      {
        stepNumber: 12,
        instruction: "Step 12: Select option 1 (None) by pressing 1 on your keyboard (or clicking '1. None').",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 1,
        hint: "Press 1 on your keyboard or click '1. None'.",
        errorFeedback: "Select option 1 (None)."
      },
      {
        stepNumber: 13,
        instruction: "Step 13: On the Payment Screen, press F6 (COUPON) in the right function column.",
        expectedAction: "PAY_COUPON",
        hint: "Click F6 Coupon on the right column or press F6.",
        errorFeedback: "Press F6 (COUPON) on the Payment Screen."
      },
      {
        stepNumber: 14,
        instruction: "Step 14: In Please Select Coupon Entry Mode, select '1 - WITHOUT SERIES NO.' (or '2 - WITH SERIES NO.') and click [Ok].",
        expectedAction: "SELECT_COUPON_MODE",
        hint: "Click [Ok] in the Coupon Entry Mode panel.",
        errorFeedback: "Confirm the Coupon Entry Mode by clicking [Ok]."
      },
      {
        stepNumber: 15,
        instruction: "Step 15: In Coupon Details, enter '85' in Enter Amount and press ENTER (or click [Ok]) to complete Customer 2's coupon checkout.",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 85,
        hint: "Type 85 in Enter Amount and press Enter or click [Ok].",
        errorFeedback: "Enter 85 and confirm the Coupon tender."
      },
      {
        stepNumber: 16,
        instruction: "Step 16: Customer 3 presents a store Credit Memo from a prior return! Scan 'NBS-ART-004' (Faber-Castell Color Pencils, ₱180.00) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-ART-004",
        hint: "Type NBS-ART-004 in the yellow barcode box and press Enter.",
        errorFeedback: "Scan or enter 'NBS-ART-004' for Customer 3."
      },
      {
        stepNumber: 17,
        instruction: "Step 17: Press F4 (PAYMENT) to open the payment flow.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 or click F4 Payment.",
        errorFeedback: "Press F4 (PAYMENT) to proceed."
      },
      {
        stepNumber: 18,
        instruction: "Step 18: On the BONUS BUY LIST, press Alt+B (or click [CANCEL]) and confirm [Yes] to return to the Main Screen.",
        expectedAction: "CONFIRM_BEST_BUY",
        hint: "Press Alt+B or click [CANCEL] then press ENTER on [Yes].",
        errorFeedback: "Close the Bonus Buy List with [CANCEL] (Alt+B) and confirm [Yes]."
      },
      {
        stepNumber: 19,
        instruction: "Step 19: Back on the Main Screen, press F4 (Payment) again to open the 'Choose Option' prompt.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 or click F4 Payment.",
        errorFeedback: "Press F4 (Payment) again."
      },
      {
        stepNumber: 20,
        instruction: "Step 20: Select option 1 (None) by pressing 1 on your keyboard (or clicking '1. None').",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 1,
        hint: "Press 1 on your keyboard or click '1. None'.",
        errorFeedback: "Select option 1 (None)."
      },
      {
        stepNumber: 21,
        instruction: "Step 21: On the Payment Screen, press F8 (CREDIT MEMO) in the right function column.",
        expectedAction: "PAY_CREDIT_MEMO",
        hint: "Click F8 Credit Memo on the right column or press F8.",
        errorFeedback: "Press F8 (CREDIT MEMO) on the Payment Screen."
      },
      {
        stepNumber: 22,
        instruction: "Step 22: In Credit Memo Details, enter '180' in Enter Amount (with Trx/Reg/Store details pre-filled) and press ENTER (or click [Ok]) to complete Lesson 8-4.",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 180,
        hint: "Type 180 in Enter Amount and press Enter or click [Ok].",
        errorFeedback: "Enter 180 and confirm the Credit Memo tender."
      }
    ]
  },
  {
    id: "scen-mod-8",
    title: "Module 8 Assessment: Multi-Customer Tender Mastery (Card, GCash & Gift Cert)",
    description: "Test your payment tender mastery across two customer transactions: Customer 1 buys 2 Calculators + Copy Paper (₱1,080.00) using a Credit Card, and Customer 2 buys Color Pencils (₱180.00) using a Gift Certificate (F5).",
    moduleRef: "mod-8",
    passingScore: 70,
    timeLimitSeconds: 6 * 60,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Customer 1 is purchasing 2 Casio Scientific Calculators. First, press F3 (QUANTITY).",
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
        instruction: "Step 6: The BONUS BUY LIST appears first. Since no paper bag is selected, press Alt+B (or click [CANCEL]) and confirm [Yes] to return to the Main Screen.",
        expectedAction: "CONFIRM_BEST_BUY",
        hint: "Press Alt+B or click [CANCEL] then press ENTER on [Yes].",
        errorFeedback: "Close the Bonus Buy List with [CANCEL] (Alt+B) and confirm [Yes]."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: Back on the Main Screen, press F4 (Payment) again to continue to the 'Choose Option' loyalty prompt.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 on your keyboard or click F4 Payment in the right column.",
        errorFeedback: "Press F4 (Payment) again to open the 'Choose Option' prompt."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: In the 'Choose Option' dialog, select option 1 (None) by pressing 1 on your keyboard (or clicking '1. None').",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 1,
        hint: "Press 1 on your keyboard or click '1. None'.",
        errorFeedback: "Select option 1 (None) to proceed to the Payment Screen."
      },
      {
        stepNumber: 9,
        instruction: "Step 9: Customer 1 is paying the ₱1,080.00 balance by Credit Card. Press F3 (BANK CARD).",
        expectedAction: "PAY_CARD",
        hint: "Click F3 Bank Card on the Payment Screen or press F3.",
        errorFeedback: "Press F3 (BANK CARD) on the Payment Screen."
      },
      {
        stepNumber: 10,
        instruction: "Step 10: Select CREDIT CARD from the card type list and press Ok.",
        expectedAction: "SELECT_CARD_TYPE",
        expectedData: "CREDIT CARD",
        hint: "Select CREDIT CARD from Please Select Card Type, then press Ok.",
        errorFeedback: "Select CREDIT CARD and confirm the card type."
      },
      {
        stepNumber: 11,
        instruction: "Step 11: Swipe the credit card by entering its number and pressing Enter.",
        expectedAction: "SWIPE_CARD",
        hint: "Enter the card number in the Swipe Card field and submit it.",
        errorFeedback: "Swipe or enter the credit card number to continue."
      },
      {
        stepNumber: 12,
        instruction: "Step 12: Verify the terminal invoice and authorization code details and press Ok to finalize Customer 1's PHP 1,080.00 payment.",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 1080,
        hint: "Review the card details and press Ok.",
        errorFeedback: "Complete the card details and confirm the PHP 1,080.00 payment."
      },
      {
        stepNumber: 13,
        instruction: "Step 13: Customer 2 approaches with a Gift Certificate! Scan or enter 'NBS-ART-004' (Faber-Castell Color Pencils, ₱180.00) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-ART-004",
        hint: "Type NBS-ART-004 into the barcode box and press Enter.",
        errorFeedback: "Scan or enter 'NBS-ART-004' for Customer 2."
      },
      {
        stepNumber: 14,
        instruction: "Step 14: Press F4 (PAYMENT) to open the payment flow.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 or click F4 Payment.",
        errorFeedback: "Press F4 (PAYMENT) to proceed."
      },
      {
        stepNumber: 15,
        instruction: "Step 15: On the BONUS BUY LIST, press Alt+B (or click [CANCEL]) and confirm [Yes] to return to the Main Screen.",
        expectedAction: "CONFIRM_BEST_BUY",
        hint: "Press Alt+B or click [CANCEL] then press ENTER on [Yes].",
        errorFeedback: "Close the Bonus Buy List with [CANCEL] (Alt+B) and confirm [Yes]."
      },
      {
        stepNumber: 16,
        instruction: "Step 16: Back on the Main Screen, press F4 (Payment) again to open the 'Choose Option' prompt.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 or click F4 Payment.",
        errorFeedback: "Press F4 (Payment) again."
      },
      {
        stepNumber: 17,
        instruction: "Step 17: Select option 1 (None) by pressing 1 on your keyboard (or clicking '1. None').",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 1,
        hint: "Press 1 on your keyboard or click '1. None'.",
        errorFeedback: "Select option 1 (None)."
      },
      {
        stepNumber: 18,
        instruction: "Step 18: Press F5 (GIFT CERT.) on the Payment Screen to accept Customer 2's Gift Certificate.",
        expectedAction: "PAY_GC",
        hint: "Click F5 Gift Cert. on the right column or press F5.",
        errorFeedback: "Press F5 (GIFT CERT.) on the Payment Screen."
      },
      {
        stepNumber: 19,
        instruction: "Step 19: In Gift Certificate Details, enter '180' in Enter Amount and press ENTER (or click [Ok]) to complete the Module 8 Assessment!",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 180,
        hint: "Type 180 in Enter Amount and press Enter or click [Ok].",
        errorFeedback: "Enter 180 and confirm the Gift Certificate tender."
      }
    ]
  },

  // =========================================================================
  // MODULE 9: KNOWLEDGE CHECK & PRACTICAL CERTIFICATION
  // =========================================================================
  {
    id: "scen-les-9-1",
    title: "Lesson 9-1 Practice: Pre-Certification Warmup (Void & Readiness)",
    description: "Quick warmup before the final certification: scan an item, initiate Item Void with supervisor override, select the void reason, and complete the line void to ensure total register readiness.",
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
        instruction: "Step 3: The Manager Override screen opens. Click Confirm Override to authorize the void.",
        expectedAction: "CONFIRM_OVERRIDE",
        hint: "Click Confirm Override in the Manager Override screen.",
        errorFeedback: "Click Confirm Override to continue with the void."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Choose 'Customer Cancel' as the reason for voiding the item, then confirm.",
        expectedAction: "CONFIRM_ITEM_VOID",
        expectedData: "Customer Cancel",
        hint: "Select Customer Cancel in the Item Void reason list and confirm.",
        errorFeedback: "Select Customer Cancel and confirm the item-void reason."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Select the Faber-Castell Color Pencils line item and confirm the void with Alt+Enter.",
        expectedAction: "SCAN_VOID_SKU",
        expectedData: "NBS-ART-004",
        hint: "Click the NBS-ART-004 line item, then click Confirm Void Item or press Alt+Enter.",
        errorFeedback: "Select NBS-ART-004 and confirm the item void."
      }
    ]
  },
  {
    id: "scen-mod-9",
    title: "Module 9 Practical Assessment: Comprehensive Cashier Certification",
    description: "Final practical certification combining Lookup search, Quantity Multiplier, Multi-Item Scanning, Item Void with Manager Override, Loyalty prompt selection, and Cash Tender checkout.",
    moduleRef: "mod-9",
    passingScore: 75,
    timeLimitSeconds: 6 * 60,
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
        instruction: "Step 2: In the 'Look for:' search box, type 'NBS-BK-001' (or 'notebook') and press ENTER to verify its price.",
        expectedAction: "LOOKUP_QUERY",
        hint: "Type NBS-BK-001 in 'Look for:' and press Enter.",
        errorFeedback: "Type 'NBS-BK-001' in the 'Look for:' box and press Enter."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Exit Lookup back to the register (click CANCEL <Alt-B> or press ESC).",
        expectedAction: "CLOSE_LOOKUP",
        hint: "Click CANCEL <Alt-B> or press ESC.",
        errorFeedback: "Close Lookup using CANCEL <Alt-B> or ESC."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: The customer buys 4 Spiral Notebooks. Press F3 (QUANTITY) to set the multiplier.",
        expectedAction: "SET_QTY_MODE",
        hint: "Press F3 (QUANTITY) on the right keypad.",
        errorFeedback: "Press F3 (QUANTITY) before entering the quantity."
      },
      {
        stepNumber: 5,
        instruction: "Step 5: Enter quantity '4' and press ENTER.",
        expectedAction: "CONFIRM_QTY",
        expectedData: 4,
        hint: "Type 4 and press Enter.",
        errorFeedback: "Enter 4 as the item quantity."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Scan 'NBS-BK-001' (Spiral Notebook, ₱35.00 promo each = ₱140.00) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-BK-001",
        hint: "Type NBS-BK-001 and press Enter.",
        errorFeedback: "Enter 'NBS-BK-001' to add 4 Spiral Notebooks."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: Next, scan 'NBS-ART-004' (Faber-Castell Color Pencils, ₱180.00) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-ART-004",
        hint: "Type NBS-ART-004 and press Enter.",
        errorFeedback: "Enter 'NBS-ART-004' to add the Color Pencils."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: Scan 'NBS-PEN-002' (Pilot G-Tech Pen, ₱85.00) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-PEN-002",
        hint: "Type NBS-PEN-002 and press Enter.",
        errorFeedback: "Enter 'NBS-PEN-002' to add the Pilot G-Tech Pen."
      },
      {
        stepNumber: 9,
        instruction: "Step 9: The customer asks to void an item using supervisor approval. Press F7 (ITEM VOID).",
        expectedAction: "ITEM_VOID",
        hint: "Click F7 Item Void on the right keypad.",
        errorFeedback: "Press F7 (ITEM VOID)."
      },
      {
        stepNumber: 10,
        instruction: "Step 10: The Manager Override prompt appears. Authorize the line void by clicking 'Confirm Override'.",
        expectedAction: "CONFIRM_OVERRIDE",
        hint: "Click the 'Confirm Override' button in the supervisor modal.",
        errorFeedback: "Click Confirm Override to approve the Item Void."
      },
      {
        stepNumber: 11,
        instruction: "Step 11: Choose 'Customer Cancel' as the reason for voiding the pen, then confirm.",
        expectedAction: "CONFIRM_ITEM_VOID",
        expectedData: "Customer Cancel",
        hint: "Select Customer Cancel in the Item Void reason list and confirm.",
        errorFeedback: "Select Customer Cancel and confirm the item-void reason."
      },
      {
        stepNumber: 12,
        instruction: "Step 12: Select the Pilot G-Tech Pen line item and confirm the void with Alt+Enter.",
        expectedAction: "SCAN_VOID_SKU",
        expectedData: "NBS-PEN-002",
        hint: "Click the NBS-PEN-002 line item, then click Confirm Void Item or press Alt+Enter.",
        errorFeedback: "Select NBS-PEN-002 and confirm the item void."
      },
      {
        stepNumber: 13,
        instruction: "Step 13: Proceed to checkout by pressing F4 (PAYMENT).",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 or click F4 Payment.",
        errorFeedback: "Press F4 (PAYMENT) to open the payment screen."
      },
      {
        stepNumber: 14,
        instruction: "Step 14: The BONUS BUY LIST appears first. Since no paper bag is selected, press Alt+B (or click [CANCEL]) and confirm [Yes] to return to the Main Screen (or check a bag and press Alt+Enter [OK]).",
        expectedAction: "CONFIRM_BEST_BUY",
        hint: "Press Alt+B or click [CANCEL] then press ENTER on [Yes] (or check a bag checkbox first to use [OK] Alt+Enter).",
        errorFeedback: "Close the Bonus Buy List with [CANCEL] (Alt+B) and confirm [Yes] (or check a bag and press [OK])."
      },
      {
        stepNumber: 15,
        instruction: "Step 15: Back on the Main Screen, press F4 (Payment) again to continue to the 'Choose Option' loyalty prompt.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 on your keyboard or click F4 Payment in the right column.",
        errorFeedback: "Press F4 (Payment) again to open the 'Choose Option' prompt."
      },
      {
        stepNumber: 16,
        instruction: "Step 16: In the 'Choose Option' dialog, select option 1 (None) by pressing 1 on your keyboard (or clicking '1. None').",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 1,
        hint: "Press 1 on your keyboard or click '1. None'.",
        errorFeedback: "Select option 1 (None) to proceed to the Payment Screen."
      },
      {
        stepNumber: 17,
        instruction: "Step 17: The customer hands you PHP 500.00. Enter '500' and press ENTER (or click Process Payment / Ok) to complete your certification!",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 500,
        hint: "Type 500 and press Enter.",
        errorFeedback: "Enter 500 and press Enter to complete the transaction."
      }
    ]
  },

  {
  id: "scen-practical-assessment",
  title: "Practical Assessment: Full Shift Operations & POS Mastery",
  description: "Complete an end-to-end practical assessment covering terminal opening, price inquiries, quantity sales, PWD discounts, corporate billing comments, zero-rated sales, item voids, closing readings (SDV, Y, Z), and safe cashier sign-out.",
  moduleRef: "mod-9", // Use the relevant existing module ID
  passingScore: 80,
  timeLimitSeconds: 10 * 60,
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
      },

      {
        stepNumber: 4,
        instruction: "Step 4: In the USER LOGIN window, enter or verify UserName '241209' and Password, then click [Ok] or press ENTER to sign in.",
        expectedAction: "LOGIN_SUBMIT",
        hint: "Click [Ok] or press ENTER in the USER LOGIN dialog to log in.",
        errorFeedback: "Enter your cashier credentials and click [Ok] to log in."
      },

      {
        stepNumber: 5,
        instruction: "Step 5: Open the Product Lookup screen. Press F2 (LOOKUP) under the barcode scanner.",
        expectedAction: "LOOKUP",
        hint: "Press F2 on your keyboard or click F2 Lookup under the barcode scanner.",
        errorFeedback: "Press F2 (LOOKUP) to open the product lookup screen."
      },
      {
        stepNumber: 6,
        instruction: "Step 6: Switch to Description search by pressing F3 (Description) in the Lookup bar.",
        expectedAction: "LOOKUP_SEARCH",
        hint: "Press F3 on your keyboard or click F3 Description in the lookup bar.",
        errorFeedback: "Press F3 to switch to Description search in lookup."
      },
      {
        stepNumber: 7,
        instruction: "Step 7: Type 'harvard' (or 'notebook') in the 'Look for:' search box and press ENTER to display matching items.",
        expectedAction: "LOOKUP_QUERY",
        hint: "Type harvard in the 'Look for:' field and press Enter.",
        errorFeedback: "Type a keyword in 'Look for:' and press Enter to search."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: Close lookup to return to active sale. Click CANCEL <Alt-B> (or press ESC on your keyboard).",
        expectedAction: "CLOSE_LOOKUP",
        hint: "Click CANCEL <Alt-B> on the green bottom bar or press ESC on your keyboard.",
        errorFeedback: "Click CANCEL <Alt-B> or press ESC to return to the active register."
      }, 

      {
        stepNumber: 9,
        instruction: "Step 9: A customer approaches the register with 3 pieces of gel pens. First, press F3 (QUANTITY).",
        expectedAction: "SET_QTY_MODE",
        hint: "Press F3 (QUANTITY) to open the quantity multiplier before scanning.",
        errorFeedback: "You need to press F3 (QUANTITY) before entering the count."
      },
      {
        stepNumber: 10,
        instruction: "Step 10: Enter quantity '3' and press ENTER.",
        expectedAction: "CONFIRM_QTY",
        expectedData: 3,
        hint: "Type 3 in the prompt dialog and press Enter.",
        errorFeedback: "Please enter 3 as the item quantity."
      },
      {
        stepNumber: 11,
        instruction: "Step 11: Now enter the Pilot G-Tech Pen SKU: 'NBS-PEN-002' and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-PEN-002",
        hint: "Type 'NBS-PEN-002' and press Enter to record 3 pieces.",
        errorFeedback: "Please scan or enter 'NBS-PEN-002'."
      },
      {
        stepNumber: 12,
        instruction: "Step 12: Customer is ready to pay. Press F4 (PAYMENT) to open the Payment options.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 on your keyboard or click 'F4 PAYMENT' on screen.",
        errorFeedback: "Press F4 (PAYMENT) to open the payment menu."
      },
      {
        stepNumber: 13,
        instruction: "Step 13: The BONUS BUY LIST appears first. Since no paper bag is selected, press Alt+B (or click [CANCEL]) and confirm [Yes] to return to the Main Screen (or check a bag and press Alt+Enter [OK]).",
        expectedAction: "CONFIRM_BEST_BUY",
        hint: "Press Alt+B or click [CANCEL] then press ENTER on [Yes] (or check a bag checkbox first to use [OK] Alt+Enter).",
        errorFeedback: "Close the Bonus Buy List with [CANCEL] (Alt+B) and confirm [Yes] (or check a bag and press [OK])."
      },
      {
        stepNumber: 14,
        instruction: "Step 14: Back on the Main Screen, press F4 (Payment) again to continue to the 'Choose Option' loyalty prompt.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 on your keyboard or click F4 Payment in the right column.",
        errorFeedback: "Press F4 (Payment) again to open the 'Choose Option' prompt."
      },
      {
        stepNumber: 15,
        instruction: "Step 15: The customer has no loyalty card. In the 'Choose Option' prompt, press 1 on your keyboard (or click '1. None') to open the Payment Screen.",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 1,
        hint: "Press key 1 on your keyboard or click '1. None'.",
        errorFeedback: "Select option 1 (None) to proceed to the Payment Screen."
      },
      {
        stepNumber: 16,
        instruction: "Step 16: Customer hands you a 500 bill. Enter '500' and press ENTER (or click Process Payment / Ok) to confirm tender.",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 500,
        hint: "Type 500 and press Enter to complete the transaction.",
        errorFeedback: "Enter 500 as the cash amount handed by the customer."
      },

      {
        stepNumber: 17,
        instruction: "Step 17: Another customer approaches. Scan or enter 'NBS-PAP-003' (A4 Copy Paper) into the Barcode field and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-PAP-003",
        hint: "Type NBS-PAP-003 in the yellow barcode input and press Enter.",
        errorFeedback: "Enter 'NBS-PAP-003' into the barcode field."
      },
      {
        stepNumber: 18,
        instruction: "Step 18: The customer hands you a PWD Card. Navigate from the Main Screen to the 2nd Screen by pressing F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Click F5 Option on the right column or press F5.",
        errorFeedback: "Press F5 (OPTION) to open the 2nd Screen."
      },
      {
        stepNumber: 19,
        instruction: "Step 19: On the 2nd Screen, press F6 (TRX DISC) to open the statutory discount menu.",
        expectedAction: "TRX_DISC",
        hint: "Click F6 Trx Disc on the right keypad or press F6.",
        errorFeedback: "Press F6 (TRX DISC) on the 2nd Screen."
      },
      {
        stepNumber: 20,
        instruction: "Step 20: On the Transaction Discount screen, select PWD Discount (ZPWD, 20%) and confirm to apply (returning to the Main Screen).",
        expectedAction: "APPLY_DISCOUNT",
        hint: "Select PWD Discount (ZPWD, 20%), then confirm to apply the discount.",
        errorFeedback: "Select a discount category and apply it."
      },
      {
        stepNumber: 21,
        instruction: "Step 21: Back on the Main Screen, total price has been discounted. Press F4 (PAYMENT) to open the payment flow.",
        expectedAction: "GO_PAYMENT",
        hint: "Click F4 PAYMENT on the right column or press F4.",
        errorFeedback: "Press F4 to open the payment screen."
      },
      {
        stepNumber: 22,
        instruction: "Step 22: The BONUS BUY LIST appears first. Since no paper bag is selected, press Alt+B (or click [CANCEL]) and confirm [Yes] to return to the Main Screen (or check a bag and press Alt+Enter [OK]).",
        expectedAction: "CONFIRM_BEST_BUY",
        hint: "Press Alt+B or click [CANCEL] then press ENTER on [Yes] (or check a bag checkbox first to use [OK] Alt+Enter).",
        errorFeedback: "Close the Bonus Buy List with [CANCEL] (Alt+B) and confirm [Yes] (or check a bag and press [OK])."
      },
      {
        stepNumber: 23,
        instruction: "Step 23: Back on the Main Screen, press F4 (Payment) again to continue to the 'Choose Option' loyalty prompt.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 on your keyboard or click F4 Payment in the right column.",
        errorFeedback: "Press F4 (Payment) again to open the 'Choose Option' prompt."
      },
      {
        stepNumber: 24,
        instruction: "Step 24: In the 'Choose Option' dialog, select option 1 (None) by pressing 1 on your keyboard (or clicking '1. None').",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 1,
        hint: "Press 1 on your keyboard or click '1. None'.",
        errorFeedback: "Select option 1 (None) to proceed to the Payment Screen."
      },
      {
        stepNumber: 25,
        instruction: "Step 25: Select Bank Card / GCash tender by pressing F3 (BANK CARD).",
        expectedAction: "PAY_CARD",
        hint: "Click F3 Bank Card on the Payment Screen.",
        errorFeedback: "Press F3 (BANK CARD) on the Payment Screen."
      },
      {
        stepNumber: 26,
        instruction: "Step 26: Select CREDIT CARD from the card type list and press Ok.",
        expectedAction: "SELECT_CARD_TYPE",
        expectedData: "CREDIT CARD",
        hint: "Select CREDIT CARD from Please Select Card Type, then press Ok.",
        errorFeedback: "Select CREDIT CARD and confirm the card type."
      },
      {
        stepNumber: 27,
        instruction: "Step 27: Swipe the credit card by entering its number and pressing Enter.",
        expectedAction: "SWIPE_CARD",
        hint: "Enter the card number in the Swipe Card field and submit it.",
        errorFeedback: "Swipe or enter the credit card number to continue."
      },
      {
        stepNumber: 28,
        instruction: "Step 28: Enter the invoice and authorization code found on the terminal receipt to complete the card details and confirm the payment to finalize the receipt.",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 192,
        hint: "Review or enter the card holder, terminal, expiry, authorization code, and invoice details, then press Ok.",
        errorFeedback: "Complete the card details and confirm the PHP 180.00 payment."
      },

      {
        stepNumber: 29,
        instruction: "Step 29: A customer hands you a paper with company details on it. Advance from Main to the 2nd Screen. Press F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Press F5.",
        errorFeedback: "Press F5."
      },
      {
        stepNumber: 30,
        instruction: "Step 30: Advance to the 3rd Screen. Press F5 (NEXT OPTION).",
        expectedAction: "NAV_THIRD",
        hint: "Press F5.",
        errorFeedback: "Press F5."
      },
      {
        stepNumber: 31,
        instruction: "Step 31: Advance to the 4th Screen. Press F5 (NEXT OPTION).",
        expectedAction: "NAV_FOURTH",
        hint: "Press F5.",
        errorFeedback: "Press F5."
      },
      {
        stepNumber: 32,
        instruction: "Step 32: Attach corporate buyer TIN details first by pressing F3 (TRX COMMENT) on the 4th Screen.",
        expectedAction: "TRX_COMMENT",
        hint: "Click F3 Trx Comment on the 4th Screen.",
        errorFeedback: "Press F3 (TRX COMMENT) on the 4th Screen."
      },
      {
        stepNumber: 33,
        instruction: "Step 33: On the Transaction Comments screen, enter or verify corporate billing information and click [Save Comments] (returning to the Main Screen).",
        expectedAction: "SAVE_TRX_COMMENT",
        hint: "Click Save Comments in the dialog.",
        errorFeedback: "Save the transaction comment to continue."
      },
      {
        stepNumber: 34,
        instruction: "Step 34: Back on the Main Screen, press F11 (PAGE UP) to jump directly back to the 4th Screen.",
        expectedAction: "PAGE_UP",
        hint: "Press F11 on your keyboard or click the F11 Page Up arrow button.",
        errorFeedback: "Press F11 (PAGE UP) to return to the 4th Screen."
      },
      {
        stepNumber: 35,
        instruction: "Step 35: Apply VAT Zero-Rating for the tax-exempt corporate buyer by pressing F7 (ZERO RATED) on the 4th Screen.",
        expectedAction: "ZERO_RATED",
        hint: "Click F7 Zero Rated on the 4th Screen.",
        errorFeedback: "Press F7 (ZERO RATED) on the 4th Screen."
      },
      {
        stepNumber: 36,
        instruction: "Step 36: Enter the manager override to authorize Zero Rated (which applies Zero Rated and returns to the Main Screen).",
        expectedAction: "CONFIRM_OVERRIDE",
        hint: "Complete the Manager Override prompt to apply Zero Rated.",
        errorFeedback: "Authorize Zero Rated in the Manager Override prompt."
      },
      {
        stepNumber: 37,
        instruction: "Step 37: Back on the Main Screen, the customer wants to purchase 2 Casio Scientific Calculators. First, press F3 (QUANTITY).",
        expectedAction: "SET_QTY_MODE",
        hint: "Press F3 (QUANTITY) on the Main Screen.",
        errorFeedback: "Press F3 (QUANTITY) to set the multiplier first."
      },
      {
        stepNumber: 38,
        instruction: "Step 38: Enter quantity '2' and press ENTER.",
        expectedAction: "CONFIRM_QTY",
        expectedData: 2,
        hint: "Type 2 and press Enter.",
        errorFeedback: "Enter 2 as the quantity."
      },
      {
        stepNumber: 39,
        instruction: "Step 39: Scan or enter 'NBS-CAL-005' (Casio Scientific Calculator, ₱420.00 each) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-CAL-005",
        hint: "Type NBS-CAL-005 into the barcode box and press Enter.",
        errorFeedback: "Please scan or type 'NBS-CAL-005'."
      },

      {
        stepNumber: 40,
        instruction: "Step 40: The customer also wants 3 packs of A4 Copy Paper: Press F3 (QUANTITY).",
        expectedAction: "SET_QTY_MODE",
        hint: "Press F3 (QUANTITY) on the Main Screen.",
        errorFeedback: "Press F3 (QUANTITY) to set the multiplier first."
      },

      {
        stepNumber: 41,
        instruction: "Step 41: Enter quantity '3' and press ENTER.",
        expectedAction: "CONFIRM_QTY",
        expectedData: 3,
        hint: "Type 3 and press Enter.",
        errorFeedback: "Enter 3 as the quantity."
      },

      {
        stepNumber: 42,
        instruction: "Step 42: Input of A4 Copy Paper: scan or enter 'NBS-PAP-003' (₱240.00) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-PAP-003",
        hint: "Type NBS-PAP-003 into the barcode box and press Enter.",
        errorFeedback: "Please scan or type 'NBS-PAP-003'."
      },
    

      {
        stepNumber: 43,
        instruction: "Step 43: The customer changed their mind about the calculators. Press F7 (ITEM VOID) on the right function column.",
        expectedAction: "ITEM_VOID",
        hint: "Click F7 Item Void on the right keypad or press F7.",
        errorFeedback: "Press F7 (ITEM VOID) to initiate line cancellation."
      },
      {
        stepNumber: 44,
        instruction: "Step 44: The Manager Override prompt appears. Authorize the line void by clicking 'Confirm Override'.",
        expectedAction: "CONFIRM_OVERRIDE",
        hint: "Click the 'Confirm Override' button in the supervisor modal.",
        errorFeedback: "Click Confirm Override to approve the Item Void."
      },
      {
        stepNumber: 45,
        instruction: "Step 45: Choose 'Customer Cancel' as the reason for voiding the calculators, then confirm.",
        expectedAction: "CONFIRM_ITEM_VOID",
        expectedData: "Customer Cancel",
        hint: "Select Customer Cancel in the Item Void reason list and confirm.",
        errorFeedback: "Select Customer Cancel and confirm the item-void reason."
      },
      {
        stepNumber: 46,
        instruction: "Step 46: Select the Casio Scientific Calculator line item and confirm the void with Alt+Enter.",
        expectedAction: "SCAN_VOID_SKU",
        expectedData: "NBS-CAL-005",
        hint: "Click the NBS-CAL-005 line item, then click Confirm Void Item or press Alt+Enter.",
        errorFeedback: "Select NBS-CAL-005 and confirm the item void."
      },

      {
        stepNumber: 47,
        instruction: "Step 47: Customer is ready to pay. Press F4 (PAYMENT) to open the Payment options.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 on your keyboard or click 'F4 PAYMENT' on screen.",
        errorFeedback: "Press F4 (PAYMENT) to open the payment menu."
      },
      {
        stepNumber: 48,
        instruction: "Step 48: The BONUS BUY LIST appears first. Since no paper bag is selected, press Alt+B (or click [CANCEL]) and confirm [Yes] to return to the Main Screen (or check a bag and press Alt+Enter [OK]).",
        expectedAction: "CONFIRM_BEST_BUY",
        hint: "Press Alt+B or click [CANCEL] then press ENTER on [Yes] (or check a bag checkbox first to use [OK] Alt+Enter).",
        errorFeedback: "Close the Bonus Buy List with [CANCEL] (Alt+B) and confirm [Yes] (or check a bag and press [OK])."
      },
      {
        stepNumber: 49,
        instruction: "Step 49: Back on the Main Screen, press F4 (Payment) again to continue to the 'Choose Option' loyalty prompt.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 on your keyboard or click F4 Payment in the right column.",
        errorFeedback: "Press F4 (Payment) again to open the 'Choose Option' prompt."
      },
      {
        stepNumber: 50,
        instruction: "Step 50: The customer has no loyalty card. In the 'Choose Option' prompt, press 1 on your keyboard (or click '1. None') to open the Payment Screen.",
        expectedAction: "CHOOSE_LNQR_OPTION",
        expectedData: 1,
        hint: "Press key 1 on your keyboard or click '1. None'.",
        errorFeedback: "Select option 1 (None) to proceed to the Payment Screen."
      },
      {
        stepNumber: 51,
        instruction: "Step 51: Customer hands you a 1000 bill. Enter '1000' and press ENTER (or click Process Payment / Ok) to confirm tender.",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 1000,
        hint: "Type 1000 and press Enter to complete the transaction.",
        errorFeedback: "Enter 1000 as the cash amount handed by the customer."
      },

      {
        stepNumber: 52,
        instruction: "Step 52: Your shift is almost over. Advance from Main to the 2nd Screen. Press F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Press F5.",
        errorFeedback: "Press F5."
      },
      {
        stepNumber: 53,
        instruction: "Step 53: Advance to the 3rd Screen. Press F5 (NEXT OPTION).",
        expectedAction: "NAV_THIRD",
        hint: "Press F5.",
        errorFeedback: "Press F5."
      },
     
      {
        stepNumber: 54,
        instruction: "Step 54: Run a Sales Data Verification check first to confirm all tables tally before printing readings. Press F10 (SDV).",
        expectedAction: "SDV_CHECK",
        hint: "Click F10 SDV on the 3rd Screen function keypad.",
        errorFeedback: "Press F10 (SDV) on the 3rd Screen."
      },
      {
        stepNumber: 55,
        instruction: "Step 55: Confirm that Saleshdr, Salesdtl, and Paydtl tally, then click 'CANCEL <Alt-B>' (or press ESC) to return to the 3rd Screen.",
        expectedAction: "CLOSE_SDV",
        hint: "Click CANCEL <Alt-B> or press ESC to close SDV.",
        errorFeedback: "Close SDV with CANCEL <Alt-B> or ESC."
      },
      {
        stepNumber: 56,
        instruction: "Step 56: Open the Cashier shift reconciliation report by pressing F8 (CASHIER RDG).",
        expectedAction: "READING_Y",
        hint: "Click F8 Cashier Rdg on the 3rd Screen.",
        errorFeedback: "Press F8 (CASHIER RDG) to open the Y-Reading."
      },
      {
        stepNumber: 57,
        instruction: "Step 57: Print the Cashier Y-Reading summary by pressing ENTER or clicking 'Print (Enter)'.",
        expectedAction: "PRINT_READING_Y",
        hint: "Click 'Print (Enter)' or press Enter.",
        errorFeedback: "Press Enter or click 'Print (Enter)' to print the Y-Reading."
      },
      {
        stepNumber: 58,
        instruction: "Step 58: Open the final End-of-Day Terminal reconciliation by pressing F9 (TERMINAL RDG).",
        expectedAction: "READING_Z",
        hint: "Click F9 Terminal Rdg on the 3rd Screen.",
        errorFeedback: "Press F9 (TERMINAL RDG) to open the Z-Reading."
      },
      {
        stepNumber: 59,
        instruction: "Step 59: Confirm Register Clearing by pressing ENTER on [Yes] (or clicking [Yes]).",
        expectedAction: "CONFIRM_Z_CLEARING",
        hint: "Click [Yes] or press Enter in the Register Clearing prompt.",
        errorFeedback: "Confirm [Yes] in the Register Clearing prompt."
      },
      {
        stepNumber: 60,
        instruction: "Step 60: Print the final Terminal Z-Reading report by pressing ENTER or clicking 'Print (Enter)'.",
        expectedAction: "PRINT_READING_Z",
        hint: "Click 'Print (Enter)' or press Enter.",
        errorFeedback: "Press Enter or click 'Print (Enter)' to print the Z-Reading."
      },
      {
        stepNumber: 61,
        instruction: "Step 61: Advance to the 4th Screen. Press F5 (NEXT OPTION).",
        expectedAction: "NAV_FOURTH",
        hint: "Click F5 NEXT OPTION on the 3rd Screen.",
        errorFeedback: "Press F5 on the 3rd Screen to advance to the 4th Screen."
      },
      {
        stepNumber: 62,
        instruction: "Step 62: On the 4th Screen, press F12 (PAGE DOWN) to return to the Main Screen.",
        expectedAction: "PAGE_DOWN",
        hint: "Press F12 on your keyboard or click F12 Page Down on the 4th Screen to return to the Main Screen.",
        errorFeedback: "Press F12 (PAGE DOWN) to return to the Main Screen."
      },
      {
        stepNumber: 63,
        instruction: "Step 63: Advance from Main to the 2nd Screen. Press F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Press F5.",
        errorFeedback: "Press F5."
      },
      {
        stepNumber: 64,
        instruction: "Step 64: On the 2nd Screen, initiate safe cashier sign-out by clicking F8 (LOGOUT).",
        expectedAction: "TRIGGER_LOGOUT",
        hint: "Click F8 LOGOUT in the right function key column or press F8.",
        errorFeedback: "Click F8 LOGOUT on the 2nd screen."
      },
      {
        stepNumber: 65,
        instruction: "Step 65: The LOGOUT screen appears ('Are you sure you want to LOGOUT?'). Press TAB to [Yes] and press ENTER (or click [Yes]) to safely return to the User Login screen.",
        expectedAction: "CONFIRM_LOGOUT_YES",
        hint: "Click [Yes] or press TAB then ENTER to confirm logout and return to the User Login screen.",
        errorFeedback: "Confirm logout by selecting [Yes] on the Logout screen."
      }

    


   
  ],
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
