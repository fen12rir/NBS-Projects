import { describe, it, expect } from "vitest";
import { TRAINING_SCENARIOS } from "@/data/scenarios";
import { TRAINING_MODULES } from "@/data/modules";

describe("Comprehensive Audit of All Scenarios and Modules", () => {
  it("audits all scenarios for step numbering and integrity", () => {
    TRAINING_SCENARIOS.forEach((scenario) => {
      expect(scenario.id).toBeTruthy();
      expect(scenario.title).toBeTruthy();
      expect(scenario.steps.length).toBeGreaterThan(0);

      if (!scenario.lessonRef) {
        expect(
          scenario.timeLimitSeconds,
          `End-of-Module Assessment '${scenario.id}' must define timeLimitSeconds`
        ).toBeGreaterThan(0);
      }

      scenario.steps.forEach((step, idx) => {
        expect(step.stepNumber).toBe(idx + 1);
        expect(step.instruction).toBeTruthy();
        expect(step.expectedAction).toBeTruthy();
        expect(step.hint).toBeTruthy();
        expect(step.errorFeedback).toBeTruthy();

        const match = step.instruction.match(/^Step (\d+):/i);
        if (match) {
          expect(Number(match[1])).toBe(step.stepNumber);
        }
      });
    });
  });

  it("checks payment flow scenarios include Bonus Buy List before Choose Option", () => {
    TRAINING_SCENARIOS.forEach((scenario) => {
      if (!scenario.lessonRef) {
        expect(
          scenario.timeLimitSeconds,
          `End-of-Module Assessment '${scenario.id}' must define timeLimitSeconds`
        ).toBeGreaterThan(0);
      }

      scenario.steps.forEach((step, idx) => {
        if (step.expectedAction === "CHOOSE_LNQR_OPTION") {
          const prevStep = scenario.steps[idx - 1];
          expect(prevStep).toBeDefined();
          expect(prevStep.expectedAction).toBe("GO_PAYMENT");

          const bonusBuyStep = scenario.steps[idx - 2];
          expect(bonusBuyStep).toBeDefined();
          expect(bonusBuyStep.expectedAction).toBe("CONFIRM_BEST_BUY");

          const stepMinus3 = scenario.steps[idx - 3];
          expect(stepMinus3).toBeDefined();
          if (stepMinus3.expectedAction === "CHECK_BONUS_BUY") {
            const firstGoPayment = scenario.steps[idx - 4];
            expect(firstGoPayment).toBeDefined();
            expect(firstGoPayment.expectedAction).toBe("GO_PAYMENT");
          } else {
            expect(stepMinus3.expectedAction).toBe("GO_PAYMENT");
          }
        }
      });
    });
  });

  it("enforces strict topic isolation across modules (Lookup only in Module 3 & Module 9)", () => {
    TRAINING_SCENARIOS.forEach((scenario) => {
      if (["mod-1", "mod-2", "mod-4", "mod-5", "mod-6", "mod-7", "mod-8"].includes(scenario.moduleRef)) {
        const hasLookup = scenario.steps.some((s) => s.expectedAction === "LOOKUP");
        expect(hasLookup, `Scenario '${scenario.id}' (${scenario.moduleRef}) should not contain LOOKUP steps`).toBe(false);
      }
    });
  });

  it("simulates POS screen state across every step of all 21 scenarios with zero navigation desyncs", () => {
    const SCREEN_REQUIRED: Record<string, "MAIN" | "SECOND" | "THIRD" | "FOURTH"> = {
      LOOKUP: "MAIN",
      CSA_TOGGLE: "MAIN",
      SET_QTY_MODE: "MAIN",
      ADD_ITEM: "MAIN",
      GO_PAYMENT: "MAIN",
      NON_MDSE: "MAIN",
      ITEM_VOID: "MAIN",
      TRX_VOID: "MAIN",
      SUSPEND: "MAIN",
      SCAN_REFUND_SKU: "MAIN",
      NAV_SECOND: "MAIN",
      PRICE_CHANGE: "SECOND",
      ON_OFF_DISCOUNT: "SECOND",
      TRX_DISC: "SECOND",
      NO_SALE: "SECOND",
      RECALL: "SECOND",
      REPRINT: "SECOND",
      TRIGGER_LOGOUT: "SECOND",
      NAV_THIRD: "SECOND",
      POST_VOID: "THIRD",
      TRX_JOURNAL: "THIRD",
      SALES_JOURNAL: "THIRD",
      READING_Y: "THIRD",
      READING_Z: "THIRD",
      SDV_CHECK: "THIRD",
      NAV_FOURTH: "THIRD",
      TRX_COMMENT: "FOURTH",
      NON_SALES: "FOURTH",
      ZERO_RATED: "FOURTH",
      RETURN_EXCHANGE: "FOURTH",
      REFUND: "FOURTH",
    };

    const AUTO_RETURNS_TO_MAIN = new Set([
      "CONFIRM_PRICE_CHANGE",
      "APPLY_DISCOUNT",
      "CONFIRM_RECALL",
      "CONFIRM_REPRINT",
      "SAVE_TRX_COMMENT",
      "CONFIRM_NON_SALES",
      "CONFIRM_RETURN",
      "CONFIRM_REFUND",
      "CONFIRM_NON_MDSE",
      "CONFIRM_BEST_BUY",
      "SCAN_VOID_SKU",
      "CONFIRM_TENDER",
      "SUBMIT_CASH_TENDER",
      "CONFIRM_LNQR_UPDATED",
    ]);

    TRAINING_SCENARIOS.forEach((scenario) => {
      let currentPage: "MAIN" | "SECOND" | "THIRD" | "FOURTH" = "MAIN";
      let pendingOverrideTarget: string | null = null;

      scenario.steps.forEach((step) => {
        const action = step.expectedAction;
        const requiredScreen = SCREEN_REQUIRED[action];
        if (requiredScreen) {
          expect(
            currentPage,
            `Scenario '${scenario.id}' Step ${step.stepNumber} (${action}) expected POS to be on ${requiredScreen} screen, but it was on ${currentPage}`
          ).toBe(requiredScreen);
        }

        // Update simulated page state
        if (action === "NAV_SECOND") currentPage = "SECOND";
        else if (action === "NAV_THIRD") currentPage = "THIRD";
        else if (action === "NAV_FOURTH") currentPage = "FOURTH";
        else if (action === "PAGE_DOWN") {
          const nextMap: Record<string, "MAIN" | "SECOND" | "THIRD" | "FOURTH"> = {
            MAIN: "SECOND",
            SECOND: "THIRD",
            THIRD: "FOURTH",
            FOURTH: "MAIN",
          };
          currentPage = nextMap[currentPage];
        } else if (action === "PAGE_UP") {
          const prevMap: Record<string, "MAIN" | "SECOND" | "THIRD" | "FOURTH"> = {
            MAIN: "FOURTH",
            FOURTH: "THIRD",
            THIRD: "SECOND",
            SECOND: "MAIN",
          };
          currentPage = prevMap[currentPage];
        } else if (action === "ZERO_RATED" || action === "NO_SALE") {
          pendingOverrideTarget = action;
        } else if (action === "CONFIRM_OVERRIDE") {
          if (pendingOverrideTarget === "ZERO_RATED" || pendingOverrideTarget === "NO_SALE") {
            currentPage = "MAIN";
            pendingOverrideTarget = null;
          }
        } else if (AUTO_RETURNS_TO_MAIN.has(action)) {
          currentPage = "MAIN";
        }
      });
    });
  });

  it("verifies full POS function coverage across the scenario suite and excludes unused/no-op keys", () => {
    const allActions = new Set(
      TRAINING_SCENARIOS.flatMap((s) => s.steps.map((st) => st.expectedAction))
    );

    // Ensure disabled / non-functional keys are never included in guided steps
    const excludedActions = [
      "CSA_TOGGLE",
      "ON_OFF_DISCOUNT",
      "ITEM_DISC",
      "CASH_COUNT",
      "REPORT_WIZARD",
      "CUSTOMER",
      "STORE_OPENING",
      "RESERVED_TRX",
    ];
    excludedActions.forEach((excluded) => {
      expect(allActions.has(excluded), `Unused/disabled POS action should not be in scenarios: ${excluded}`).toBe(false);
    });

    // Ensure every LOOKUP step actually searches or adds an item before closing
    TRAINING_SCENARIOS.forEach((scenario) => {
      if (!scenario.lessonRef) {
        expect(
          scenario.timeLimitSeconds,
          `End-of-Module Assessment '${scenario.id}' must define timeLimitSeconds`
        ).toBeGreaterThan(0);
      }

      scenario.steps.forEach((step, idx) => {
        if (step.expectedAction === "LOOKUP") {
          const nextStep = scenario.steps[idx + 1];
          expect(nextStep, `Scenario '${scenario.id}' opens LOOKUP at step ${step.stepNumber} without a next step`).toBeDefined();
          expect(
            ["LOOKUP_SEARCH", "LOOKUP_QUERY", "ADD_ITEM"].includes(nextStep.expectedAction),
            `Scenario '${scenario.id}' opens LOOKUP at step ${step.stepNumber} and immediately does '${nextStep.expectedAction}' without searching or selecting an item`
          ).toBe(true);
        }
      });
    });

    const requiredActions = [
      "VERIFY_DATE_NO",
      "BACK_TO_SOD_VERIFY",
      "VERIFY_DATE_YES",
      "CLOSE_SOD_WINDOW",
      "RELOAD_POS_LOGIN",
      "LOGIN_SUBMIT",
      "TRIGGER_LOGOUT",
      "CONFIRM_LOGOUT_YES",
      "LOOKUP",
      "LOOKUP_SEARCH",
      "LOOKUP_QUERY",
      "CLOSE_LOOKUP",
      "SET_QTY_MODE",
      "CONFIRM_QTY",
      "ADD_ITEM",
      "NON_MDSE",
      "CONFIRM_NON_MDSE",
      "ITEM_VOID",
      "TRX_VOID",
      "SUSPEND",
      "PRICE_CHANGE",
      "CONFIRM_PRICE_CHANGE",
      "TRX_DISC",
      "APPLY_DISCOUNT",
      "NO_SALE",
      "RECALL",
      "CONFIRM_RECALL",
      "REPRINT",
      "CONFIRM_REPRINT",
      "TRX_JOURNAL",
      "SALES_JOURNAL",
      "CLOSE_JOURNAL",
      "POST_VOID",
      "CONFIRM_POST_VOID",
      "SDV_CHECK",
      "CLOSE_SDV",
      "READING_Y",
      "PRINT_READING_Y",
      "READING_Z",
      "CONFIRM_Z_CLEARING",
      "PRINT_READING_Z",
      "TRX_COMMENT",
      "SAVE_TRX_COMMENT",
      "NON_SALES",
      "CONFIRM_NON_SALES",
      "ZERO_RATED",
      "RETURN_EXCHANGE",
      "CONFIRM_RETURN",
      "SCAN_REFUND_SKU",
      "REFUND",
      "REFUND_ORNO",
      "CONFIRM_REFUND",
      "GO_PAYMENT",
      "CHECK_BONUS_BUY",
      "CONFIRM_BEST_BUY",
      "CHOOSE_LNQR_OPTION",
      "SUBMIT_LNC",
      "SUBMIT_LNQR",
      "PAY_CARD",
      "SELECT_CARD_TYPE",
      "SWIPE_CARD",
      "REDEEM_SULIT_COINS",
      "PAY_GC",
      "PAY_COUPON",
      "SELECT_COUPON_MODE",
      "PAY_CREDIT_MEMO",
      "CONFIRM_TENDER",
      "PAGE_UP",
      "PAGE_DOWN",
    ];

    requiredActions.forEach((reqAction) => {
      expect(allActions.has(reqAction), `Missing POS action in scenarios: ${reqAction}`).toBe(true);
    });
  });

  it("checks no scenario uses F5 on 4th screen to cycle to main", () => {
    TRAINING_SCENARIOS.forEach((scenario) => {
      scenario.steps.forEach((step) => {
        if (step.expectedAction === "PAGE_DOWN") {
          expect(step.instruction.toLowerCase()).not.toContain("press f5");
        }
      });
    });
  });

  it("checks all modules and lessons are defined", () => {
    expect(TRAINING_MODULES.length).toBe(9);
    TRAINING_MODULES.forEach((mod) => {
      expect(mod.id).toBeTruthy();
      expect(mod.title).toBeTruthy();
      expect(mod.lessons.length).toBeGreaterThan(0);

      mod.lessons.forEach((lesson) => {
        expect(lesson.id).toBeTruthy();
        expect(lesson.title).toBeTruthy();
        expect(lesson.instructions.length).toBeGreaterThan(0);

        lesson.instructions.forEach((inst) => {
          if (inst.toLowerCase().includes("4th page") || inst.toLowerCase().includes("4th screen")) {
            expect(inst.toLowerCase()).not.toContain("press f5 to return");
            expect(inst.toLowerCase()).not.toContain("f5 to return to main");
          }
        });
      });
    });
  });
});
