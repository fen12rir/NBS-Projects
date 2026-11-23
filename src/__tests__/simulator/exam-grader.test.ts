import { describe, it, expect } from "vitest";
import { PRACTICAL_CASE_POOL, generatePracticalExamSession } from "@/data/practical-exam";
import { gradeCase, gradeExamSession } from "@/lib/simulator/exam-grader";

describe("Practical Hands-On Exam Engine", () => {
  it("generates a balanced practical exam session with opening, middle cases, and closing shift", () => {
    const session = generatePracticalExamSession();
    expect(session.cases.length).toBeGreaterThanOrEqual(6);
    expect(session.totalTimeLimitSeconds).toBe(15 * 60);
    expect(session.passingScore).toBe(80);

    // Opening Shift Case
    expect(session.cases[0].id).toBe("case-open-shift");
    // Closing Shift Case
    expect(session.cases[session.cases.length - 1].id).toBe("case-close-shift");

    // Case Structure Validation
    session.cases.forEach((c) => {
      expect(c.title).toBeTruthy();
      expect(c.customerQuote).toBeTruthy();
      expect(c.events.length).toBeGreaterThan(0);
      expect(c.milestones.length).toBeGreaterThan(0);
    });
  });

  it("grades a perfect cash sale case correctly", () => {
    const simpleCashCase = PRACTICAL_CASE_POOL.find((c) => c.id === "case-simple-cash")!;
    const actionLog = [
      { action: "ADD_ITEM", data: "NBS-BK-001", timestamp: 1000 },
      { action: "GO_PAYMENT", timestamp: 2000 },
      { action: "CONFIRM_BEST_BUY", timestamp: 3000 },
      { action: "GO_PAYMENT", timestamp: 4000 },
      { action: "CHOOSE_LNQR_OPTION", data: 1, timestamp: 5000 },
      { action: "SUBMIT_CASH_TENDER", data: "500.00", timestamp: 6000 },
    ];

    const finalSnapshot = {
      lineItemsCount: 1,
      totalSales: 35.0,
      tenderMethod: "CASH",
      tenderAmount: 500.0,
      changeGiven: 465.0,
      loyaltyType: "NONE" as const,
    };

    const result = gradeCase(simpleCashCase, actionLog, finalSnapshot, 465.0, 35);
    expect(result.passed).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(95);
    expect(result.milestonesPassed).toBe(simpleCashCase.milestones.length);
    expect(result.missedCriticalMilestone).toBeUndefined();
  });

  it("fails a case when a critical milestone is missed or wrong change is given", () => {
    const simpleCashCase = PRACTICAL_CASE_POOL.find((c) => c.id === "case-simple-cash")!;
    // Missing Item Scan Action Log
    const actionLog = [
      { action: "GO_PAYMENT", timestamp: 2000 },
      { action: "CONFIRM_BEST_BUY", timestamp: 3000 },
      { action: "GO_PAYMENT", timestamp: 4000 },
      { action: "CHOOSE_LNQR_OPTION", data: 1, timestamp: 5000 },
      { action: "SUBMIT_CASH_TENDER", data: "500.00", timestamp: 6000 },
    ];

    const finalSnapshot = {
      lineItemsCount: 0,
      totalSales: 0,
      tenderMethod: "CASH",
      tenderAmount: 500.0,
      changeGiven: 100.0, // Wrong change
    };

    const result = gradeCase(simpleCashCase, actionLog, finalSnapshot, 100.0, 40);
    expect(result.passed).toBe(false);
    expect(result.missedCriticalMilestone).toBeTruthy();
  });

  it("grades an overall session and enforces pass thresholds", () => {
    const session = generatePracticalExamSession();
    const mockCaseResults = session.cases.map((c) => ({
      caseId: c.id,
      title: c.title,
      caseNumber: c.caseNumber || 1,
      score: 85,
      passed: true,
      timeSpentSeconds: 45,
      milestonesPassed: c.milestones.length,
      milestonesTotal: c.milestones.length,
      details: { milestonesScore: 55, finalStateScore: 20, changeScore: 10, efficiencyScore: 5 },
      feedback: [],
    }));

    const sessionResult = gradeExamSession(session, mockCaseResults, 300);
    expect(sessionResult.passed).toBe(true);
    expect(sessionResult.totalScore).toBe(85);
  });

  it("grades PWD discount and shift close cases at 100% regardless of navigation keys used (e.g. F11 vs F5)", () => {
    const pwdCase = PRACTICAL_CASE_POOL.find((c) => c.id === "case-discount-pwd")!;
    const pwdLog = [
      { action: "TRX_DISC", timestamp: 1000 },
      { action: "APPLY_DISCOUNT", data: "ZPWD", timestamp: 2000 },
      { action: "ADD_ITEM", data: "NBS-BK-001", timestamp: 3000 },
      { action: "GO_PAYMENT", timestamp: 4000 },
      { action: "CONFIRM_BEST_BUY", timestamp: 5000 },
      { action: "GO_PAYMENT", timestamp: 6000 },
      { action: "CHOOSE_LNQR_OPTION", data: 1, timestamp: 7000 },
      { action: "SUBMIT_CASH_TENDER", data: "100.00", timestamp: 8000 },
    ];
    const pwdSnapshot = {
      lineItemsCount: 1,
      totalSales: 28.0,
      tenderMethod: "CASH",
      tenderAmount: 100.0,
      changeGiven: 72.0,
      discountType: "Pwd",
    };
    const pwdRes = gradeCase(pwdCase, pwdLog, pwdSnapshot, 72.0, 40);
    expect(pwdRes.passed).toBe(true);
    expect(pwdRes.score).toBe(100);
    expect(pwdRes.feedback).toEqual([]);

    const closeCase = PRACTICAL_CASE_POOL.find((c) => c.id === "case-close-shift")!;
    // Trainee uses F11 (NAV_SECOND) to go back from 3rd screen to 2nd screen and logs out
    const closeLog = [
      { action: "NAV_SECOND", timestamp: 1000 },
      { action: "NAV_THIRD", timestamp: 2000 },
      { action: "SDV_CHECK", timestamp: 3000 },
      { action: "READING_Y", timestamp: 4000 },
      { action: "READING_Z", timestamp: 5000 },
      { action: "NAV_SECOND", timestamp: 6000 },
      { action: "TRIGGER_LOGOUT", timestamp: 7000 },
      { action: "CONFIRM_LOGOUT_YES", timestamp: 8000 },
    ];
    const closeRes = gradeCase(closeCase, closeLog, { lineItemsCount: 0, totalSales: 0 }, undefined, 45);
    expect(closeRes.passed).toBe(true);
    expect(closeRes.score).toBe(100);
    expect(closeRes.feedback).toEqual([]);
  });
});
