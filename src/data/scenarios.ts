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
  {
    id: "scen-mod-1",
    title: "Module 1: Screen Layout & Terminal Familiarization",
    description: "Explore the 12 key screen regions, practice item barcode lookup with F2, and navigate function pages using F5.",
    moduleRef: "mod-1",
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
    title: "Module 2: Complete Opening & Cashier Shift Routine",
    description: "Practice the complete start-of-day sequence across all Module 2 lessons: verify date and time, close setup window, reload POS, sign in with credentials, navigate options, and execute approved cashier sign-out.",
    moduleRef: "mod-2",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1 (Lesson 2-1): You're at the terminal before store opening. Verify date & time on Start of Day screen. Press TAB to [Yes] and press ENTER (or click [Yes]).",
        expectedAction: "VERIFY_DATE_YES",
        hint: "Press TAB to highlight the 'Yes' button and press ENTER, or click the [Yes] button.",
        errorFeedback: "Verify the date and time by clicking [Yes] or pressing TAB then Enter."
      },
      {
        stepNumber: 2,
        instruction: "Step 2 (Lesson 2-1): Date verified! Now close the setup window by pressing Ctrl+Alt+C (or click 'Close Window (Ctrl+Alt+C)').",
        expectedAction: "CLOSE_SOD_WINDOW",
        hint: "Press Ctrl+Alt+C on your keyboard or click 'Close Window (Ctrl+Alt+C)'.",
        errorFeedback: "Press Ctrl+Alt+C or click to close the setup window."
      },
      {
        stepNumber: 3,
        instruction: "Step 3 (Lesson 2-1): The browser displays 'POS Reloader'. Press F5 (or click 'Reload Page (F5)') to reload and open the USER LOGIN screen.",
        expectedAction: "RELOAD_POS_LOGIN",
        hint: "Press F5 on your keyboard or click 'Reload Page (F5)' to load the login page.",
        errorFeedback: "Press F5 or click to reload and open the login page."
      },
      {
        stepNumber: 4,
        instruction: "Step 4 (Lesson 2-2): In the USER LOGIN window, verify UserName '241209' and Password, then click [Ok] or press ENTER to sign in.",
        expectedAction: "LOGIN_SUBMIT",
        hint: "Click [Ok] or press ENTER in the USER LOGIN dialog to log in.",
        errorFeedback: "Enter your cashier credentials and click [Ok] to log in."
      },
      {
        stepNumber: 5,
        instruction: "Step 5 (Lesson 2-2): You are now logged into the sales register. Navigate to the 2nd screen to access logout. Press F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Press F5 on your keyboard or click F5 OPTION on the right column.",
        errorFeedback: "Press F5 to advance to the 2nd Screen."
      },
      {
        stepNumber: 6,
        instruction: "Step 6 (Lesson 2-2): On the 2nd Screen, initiate safe cashier sign-out by clicking F8 (LOGOUT).",
        expectedAction: "TRIGGER_LOGOUT",
        hint: "Click F8 LOGOUT in the right function key column or press F8.",
        errorFeedback: "Click F8 LOGOUT on the 2nd screen."
      },
      {
        stepNumber: 7,
        instruction: "Step 7 (Lesson 2-2): The LOGOUT prompt appears ('Are you sure you want to LOGOUT?'). Press TAB to [Yes] and press ENTER (or click [Yes]).",
        expectedAction: "CONFIRM_LOGOUT_YES",
        hint: "Click [Yes] or press TAB then ENTER to confirm logout and return to the User Login screen.",
        errorFeedback: "Confirm logout by selecting [Yes] on the prompt."
      }
    ]
  },
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
    title: "Module 3: Complete Item Inquiry & Loyalty (LNQR) Routine",
    description: "Complete all Module 3 procedures: inspect item pricing and promos via F2 Lookup, return to the sale, scan item barcode, proceed to payment, tag the customer's LNQR mobile barcode, enter cash tender, and confirm transaction completion.",
    moduleRef: "mod-3",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1 (Lesson 3-1): Customer inquires about item pricing. Open Product Lookup by pressing F2 (LOOKUP).",
        expectedAction: "LOOKUP",
        hint: "Press F2 on your keyboard or click F2 Lookup under the barcode scanner.",
        errorFeedback: "Press F2 (LOOKUP) to open the product lookup screen."
      },
      {
        stepNumber: 2,
        instruction: "Step 2 (Lesson 3-1): Inspect item details and promos. Press F3 (Description) or search by SKU/barcode.",
        expectedAction: "LOOKUP_SEARCH",
        hint: "Press F3 on your keyboard or click F3 Description in the lookup bar.",
        errorFeedback: "Press F3 or use F2 to search items in lookup."
      },
      {
        stepNumber: 3,
        instruction: "Step 3 (Lesson 3-1): Close lookup to return to active sale. Click CANCEL <Alt-B> (or press ESC on your keyboard).",
        expectedAction: "CLOSE_LOOKUP",
        hint: "Click CANCEL <Alt-B> on the green bottom bar or press ESC on your keyboard.",
        errorFeedback: "Click CANCEL <Alt-B> or press ESC to return to the active register."
      },
      {
        stepNumber: 4,
        instruction: "Step 4 (Lesson 3-2): Customer wants to purchase. Scan or enter 'NBS-BK-001' into the Barcode field and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-BK-001",
        hint: "Type NBS-BK-001 in the yellow barcode field and press Enter.",
        errorFeedback: "Please scan or enter NBS-BK-001 into the register."
      },
      {
        stepNumber: 5,
        instruction: "Step 5 (Lesson 3-2): The customer is ready to pay. Press F4 (Payment) on the right function keypad.",
        expectedAction: "GO_PAYMENT",
        hint: "Press F4 on your keyboard or click F4 Payment in the right column.",
        errorFeedback: "Press F4 (Payment) to proceed to payment."
      },
      {
        stepNumber: 6,
        instruction: "Step 6 (Lesson 3-2): The 'Choose Option' loyalty prompt appears. Customer has LNQR - press 3 on your keyboard (or click '3. LNQR / LNQR PLUS').",
        expectedAction: "CHOOSE_LNQR_OPTION",
        hint: "Press key 3 on your keyboard or click '3. LNQR / LNQR PLUS'.",
        errorFeedback: "Press 3 to choose LNQR / LNQR PLUS."
      },
      {
        stepNumber: 7,
        instruction: "Step 7 (Lesson 3-2): The LNQR input screen appears. Scan or verify the customer QR code '20221003LN000004', press TAB to highlight [Ok], then press ENTER (or click [Ok]).",
        expectedAction: "SUBMIT_LNQR",
        hint: "Press TAB to highlight [Ok] and press ENTER, or click the [Ok] button.",
        errorFeedback: "Submit the customer QR code by clicking [Ok] or pressing Enter."
      },
      {
        stepNumber: 8,
        instruction: "Step 8 (Lesson 3-2): On the Cash Payment Details screen, enter the tendered cash amount '3000' and press ENTER (or click [Ok]).",
        expectedAction: "SUBMIT_CASH_TENDER",
        hint: "Enter 3000 in the Enter Amount field and press Enter.",
        errorFeedback: "Enter the cash amount and press Enter to process payment."
      },
      {
        stepNumber: 9,
        instruction: "Step 9 (Lesson 3-2): The system displays the red blinking 'Change' and updates LNQR. When the 'LNQR has been updated!' confirmation appears, press ENTER (or click [OK]) to return to the active register.",
        expectedAction: "CONFIRM_LNQR_UPDATED",
        hint: "Click [OK] or press ENTER in the confirmation popup to finish the transaction.",
        errorFeedback: "Confirm the LNQR updated dialog by pressing Enter or clicking [OK]."
      }
    ]
  },
  {
    id: "scen-cash-sale-basic",
    title: "Module 4: Cash Sale with Quantity Multiplier",
    description: "Scan items, set multiplier quantity, tender payment in Philippine Peso cash, and generate customer official receipt.",
    moduleRef: "mod-4",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Check the price of the spiral notebook. Press F2 (LOOKUP).",
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
        instruction: "Step 3: The customer wants 3 pieces of gel pens. First, press F3 (QUANTITY).",
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
        instruction: "Step 7: The customer pays in cash. Press F2 (CASH) on the Payment screen.",
        expectedAction: "PAY_CASH",
        hint: "On the Payment screen, press F2 (CASH).",
        errorFeedback: "Press F2 for Cash payment."
      },
      {
        stepNumber: 8,
        instruction: "Step 8: Customer hands you a â‚±500 bill. Enter '500' and press ENTER to confirm tender.",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 500,
        hint: "Type 500 and press Enter to complete the transaction.",
        errorFeedback: "Enter 500 as the cash amount handed by the customer."
      }
    ]
  },
  {
    id: "scen-mod-5",
    title: "Module 5: Second Screen Functions & Verification",
    description: "Inspect Second Screen utilities including SDV Check and screen navigation.",
    moduleRef: "mod-5",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Switch from the Main screen to the 2nd screen. Press F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Click F5 OPTION on the right button column.",
        errorFeedback: "Press F5 to switch to the 2nd screen."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Run a System Data Verification check by clicking F6 (SDV CHECK).",
        expectedAction: "SDV_CHECK",
        hint: "Click F6 SDV CHECK in the right function key column.",
        errorFeedback: "Click F6 SDV CHECK."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Press F5 (OPTION) to advance to the 3rd screen.",
        expectedAction: "NAV_THIRD",
        hint: "Click F5 OPTION to go to the 3rd screen.",
        errorFeedback: "Press F5 to advance to the 3rd screen."
      }
    ]
  },
  {
    id: "scen-mod-6",
    title: "Module 6: Third Screen Utilities",
    description: "Navigate to the 3rd screen and inspect reprint and supervisor utilities.",
    moduleRef: "mod-6",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Navigate to the 2nd screen. Press F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Press F5 on the right column.",
        errorFeedback: "Press F5 to go to the 2nd screen."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Navigate to the 3rd screen. Press F5 (OPTION).",
        expectedAction: "NAV_THIRD",
        hint: "Press F5 again to go to the 3rd screen.",
        errorFeedback: "Press F5 to go to the 3rd screen."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Inspect the 3rd screen functions, then press F5 (OPTION) to advance to the 4th screen.",
        expectedAction: "NAV_FOURTH",
        hint: "Press F5 to proceed to the 4th screen.",
        errorFeedback: "Press F5 to advance to the 4th screen."
      }
    ]
  },
  {
    id: "scen-mod-7",
    title: "Module 7: Fourth Screen Functions & Quick Return",
    description: "Navigate to the 4th screen and use F2 to return immediately to the Main Screen.",
    moduleRef: "mod-7",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Advance to 2nd screen. Press F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Press F5.",
        errorFeedback: "Press F5."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Advance to 3rd screen. Press F5 (OPTION).",
        expectedAction: "NAV_THIRD",
        hint: "Press F5.",
        errorFeedback: "Press F5."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Advance to 4th screen. Press F5 (OPTION).",
        expectedAction: "NAV_FOURTH",
        hint: "Press F5.",
        errorFeedback: "Press F5."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: On the 4th screen, press F2 (BACK TO MAIN) to return directly to the Main Screen.",
        expectedAction: "NAV_MAIN",
        hint: "Click F2 BACK TO MAIN in the right function key column.",
        errorFeedback: "Press F2 to return to the Main Screen."
      }
    ]
  },
  {
    id: "scen-mod-8",
    title: "Module 8: Payment Methods & Tenders",
    description: "Scan copy paper, enter payment menu, select tender method, and finalize transaction.",
    moduleRef: "mod-8",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Scan or enter barcode 'NBS-PAP-003' (A4 Copy Paper) and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-PAP-003",
        hint: "Type NBS-PAP-003 into the barcode box and press Enter.",
        errorFeedback: "Please scan or type NBS-PAP-003."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Press F4 (PAYMENT) to open the payment screen.",
        expectedAction: "GO_PAYMENT",
        hint: "Click F4 PAYMENT on screen or press F4.",
        errorFeedback: "Press F4 to open the payment screen."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Select Cash payment by pressing F2 (CASH).",
        expectedAction: "PAY_CASH",
        hint: "Click F2 CASH on the payment tender options.",
        errorFeedback: "Press F2 for Cash payment."
      },
      {
        stepNumber: 4,
        instruction: "Step 4: Enter cash tender amount '250' and press ENTER to complete transaction.",
        expectedAction: "CONFIRM_TENDER",
        expectedData: 250,
        hint: "Type 250 and press Enter.",
        errorFeedback: "Type 250 and press Enter."
      }
    ]
  },
  {
    id: "scen-mod-9",
    title: "Module 9: Item Void & Manager Override",
    description: "Scan an item, perform an Item Void (F7), and confirm manager override authorization.",
    moduleRef: "mod-9",
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
  }
];

export function getScenarioForModule(moduleRef: string): TrainingScenario | null {
  // Prefer a module-level scenario (no lessonRef), fallback to first lesson scenario
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




