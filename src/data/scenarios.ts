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
  passingScore: number; // percentage, e.g. 70
  steps: ScenarioStep[];
}

export const TRAINING_SCENARIOS: TrainingScenario[] = [
  {
    id: "scen-mod-1",
    title: "Module 1: Screen Layout & Lookup Exploration",
    description: "Inspect the 12 key screen sections, check product lookup with F2, and practice page navigation with F5.",
    moduleRef: "mod-1",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Open the price and item inquiry window. Press F2 (LOOKUP).",
        expectedAction: "LOOKUP",
        hint: "Press the F2 key on your keyboard or click F2 LOOKUP on the screen.",
        errorFeedback: "Press F2 (LOOKUP) to inspect product pricing."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Press F5 (OPTION) to navigate to the 2nd screen function keys.",
        expectedAction: "NAV_SECOND",
        hint: "Click F5 OPTION on the right column to advance to the next screen.",
        errorFeedback: "Press F5 (OPTION) to view the 2nd screen."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Cycle through the screens by pressing F5 (OPTION) until you return to the Main Screen.",
        expectedAction: "NAV_MAIN",
        hint: "Cycle through the pages or press F2 on the 4th page to return to the Main screen.",
        errorFeedback: "Navigate back to the Main screen."
      }
    ]
  },
  {
    id: "scen-mod-2",
    title: "Module 2: Start of Day, CSA & Cashier Logout",
    description: "Verify date and time, toggle Customer Service Assistant (F10), and execute safe cashier logout (F5 -> F8).",
    moduleRef: "mod-2",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Toggle the Customer Service Assistant indicator by pressing F10 (CSA ON/OFF).",
        expectedAction: "CSA_TOGGLE",
        hint: "Click F10 CSA ON/OFF at the top row of function buttons or press F10.",
        errorFeedback: "Press F10 to toggle the CSA mode."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Navigate to the 2nd screen where the logout option is located. Press F5 (OPTION).",
        expectedAction: "NAV_SECOND",
        hint: "Press F5 on the right button column.",
        errorFeedback: "Press F5 to open the 2nd screen."
      },
      {
        stepNumber: 3,
        instruction: "Step 3: Initiate safe cashier sign-out by clicking F8 (LOGOUT).",
        expectedAction: "LOGOUT",
        hint: "On the 2nd screen, click F8 LOGOUT in the right column.",
        errorFeedback: "Click F8 LOGOUT on the 2nd screen."
      }
    ]
  },
  {
    id: "scen-mod-3",
    title: "Module 3: Item Lookup & Pricing Inquiry",
    description: "Inquire about item prices using F2 Lookup and check promotional and SRP details.",
    moduleRef: "mod-3",
    passingScore: 70,
    steps: [
      {
        stepNumber: 1,
        instruction: "Step 1: Open the Product Lookup dialog by pressing F2 (LOOKUP).",
        expectedAction: "LOOKUP",
        hint: "Click F2 LOOKUP at the top row or press F2.",
        errorFeedback: "Press F2 to open the item lookup modal."
      },
      {
        stepNumber: 2,
        instruction: "Step 2: Now scan or type barcode 'NBS-BK-001' into the Barcode field and press ENTER.",
        expectedAction: "ADD_ITEM",
        expectedData: "NBS-BK-001",
        hint: "Type NBS-BK-001 in the yellow barcode box and press Enter.",
        errorFeedback: "Please scan or type NBS-BK-001."
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
        instruction: "Step 8: Customer hands you a ₱500 bill. Enter '500' and press ENTER to confirm tender.",
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
  return TRAINING_SCENARIOS.find((s) => s.moduleRef === moduleRef) || null;
}

export function getScenarioById(id: string): TrainingScenario | null {
  return TRAINING_SCENARIOS.find((s) => s.id === id) || null;
}
