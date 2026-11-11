import { describe, it, expect } from "vitest";
import { PRACTICAL_CASE_POOL, generatePracticalExamSession } from "@/data/practical-exam";
import { gradeCase, gradeExamSession } from "@/lib/simulator/exam-grader";

describe("Practical Hands-On Exam Engine", () => {
  it("generates a balanced practical exam session with opening, middle cases, and closing shift", () => {
    const session = generatePracticalExamSession();
    expect(session.cases.length).toBeGreaterThanOrEqual(6);
    expect(session.totalTimeLimitSeconds).toBe(15 * 60);
    expect(session.passingScore).toBe(80);

    // First case must be opening shift
    expect(session.cases[0].id).toBe("case-open-shift");
    // Last case must be closing shift
    expect(session.cases[session.cases.length - 1].id).toBe("case-close-shift");

    // All cases have titles, events, and milestones
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
    // Trainee completely forgot to scan the notebook
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
});
