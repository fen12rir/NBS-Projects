import { PracticalExamCase, PracticalExamSession } from "@/data/practical-exam";

export interface TraineeActionLog {
  action: string;
  data?: string | number;
  timestamp: number;
}

export interface CaseFinalSnapshot {
  lineItemsCount: number;
  totalSales: number;
  tenderMethod?: string;
  tenderAmount?: number;
  changeGiven?: number;
  loyaltyType?: "NONE" | "LNC" | "LNQR";
  voidCount?: number;
  discountType?: string;
  isZeroRated?: boolean;
}

export interface CaseGradingResult {
  caseId: string;
  title: string;
  caseNumber: number;
  score: number; // 0 - 100
  passed: boolean;
  timeSpentSeconds: number;
  milestonesPassed: number;
  milestonesTotal: number;
  missedCriticalMilestone?: string;
  details: {
    milestonesScore: number; // max 60
    finalStateScore: number; // max 25
    changeScore: number;     // max 10
    efficiencyScore: number; // max 5
  };
  feedback: string[];
}

export interface ExamSessionGradingResult {
  sessionId: string;
  totalScore: number; // 0 - 100
  passed: boolean;
  timeSpentSeconds: number;
  casesCompleted: number;
  casesTotal: number;
  passedCasesCount: number;
  failedCasesCount: number;
  caseResults: CaseGradingResult[];
  summaryFeedback: string;
}

// Action Alias Matcher
function isActionMatch(expectedAction: string, loggedAction: string): boolean {
  if (expectedAction === loggedAction) return true;
  // Navigation Aliases
  if (expectedAction === "PAGE_DOWN" && (loggedAction === "NAV_MAIN" || loggedAction === "PAGE_DOWN" || loggedAction === "PAGE_UP")) return true;
  if (expectedAction === "NAV_MAIN" && (loggedAction === "PAGE_DOWN" || loggedAction === "NAV_MAIN" || loggedAction === "PAGE_UP")) return true;
  if (expectedAction === "NAV_SECOND" && (loggedAction === "PAGE_DOWN" || loggedAction === "NAV_SECOND" || loggedAction === "PAGE_UP")) return true;
  if (expectedAction === "NAV_THIRD" && (loggedAction === "PAGE_DOWN" || loggedAction === "NAV_THIRD" || loggedAction === "PAGE_UP")) return true;
  if (expectedAction === "NAV_FOURTH" && (loggedAction === "PAGE_DOWN" || loggedAction === "NAV_FOURTH" || loggedAction === "PAGE_UP")) return true;
  // Lookup Aliases: directly selecting an item from Lookup satisfies the search query milestone
  if (expectedAction === "LOOKUP_QUERY" && (loggedAction === "LOOKUP_QUERY" || loggedAction === "LOOKUP_SEARCH" || loggedAction === "ADD_ITEM")) return true;
  // Logout Aliases
  if (expectedAction === "TRIGGER_LOGOUT" && (loggedAction === "TRIGGER_LOGOUT" || loggedAction === "CONFIRM_LOGOUT_YES" || loggedAction === "LOGOUT")) return true;
  if (expectedAction === "CONFIRM_LOGOUT_YES" && (loggedAction === "TRIGGER_LOGOUT" || loggedAction === "CONFIRM_LOGOUT_YES" || loggedAction === "LOGOUT")) return true;
  // Tender Aliases
  if (expectedAction === "CONFIRM_TENDER" && (loggedAction === "SUBMIT_CASH_TENDER" || loggedAction === "CONFIRM_TENDER")) return true;
  if (expectedAction === "SUBMIT_CASH_TENDER" && (loggedAction === "CONFIRM_TENDER" || loggedAction === "SUBMIT_CASH_TENDER")) return true;
  return false;
}

// Action Data Matcher
function isDataMatch(expected?: string | number, actual?: string | number): boolean {
  if (expected === undefined) return true;
  if (actual === undefined) return false;
  const exp = String(expected).trim().toLowerCase();
  const act = String(actual).trim().toLowerCase();
  if (exp === act) return true;
  // Normalize statutory discount codes/descriptions (e.g. "ZPWD" <-> "PWD", "ZSEN" <-> "Senior Citizen Discount")
  if ((exp === "pwd" || exp === "zpwd") && (act === "pwd" || act === "zpwd" || act.includes("pwd"))) return true;
  if ((exp === "zsen" || exp.includes("senior")) && (act === "zsen" || act.includes("senior"))) return true;
  return false;
}

// Individual Case Grader
export function gradeCase(
  examCase: PracticalExamCase,
  actionLog: TraineeActionLog[],
  finalSnapshot: CaseFinalSnapshot,
  userGivenChange?: number,
  timeSpentSeconds: number = 0
): CaseGradingResult {
  const feedback: string[] = [];
  const usedIndices = new Set<number>();
  let earnedMilestonePoints = 0;
  const totalPossibleMilestonePoints = examCase.milestones.reduce((acc, m) => acc + m.points, 0) || 1;
  let missedCritical: string | undefined = undefined;
  let milestonesPassed = 0;

  // 1. Milestone Evaluation (60% Weight)
  for (const milestone of examCase.milestones) {
    let matchIndex = -1;
    for (let i = 0; i < actionLog.length; i++) {
      if (!usedIndices.has(i)) {
        const logged = actionLog[i];
        if (isActionMatch(milestone.action, logged.action) && isDataMatch(milestone.expectedData, logged.data)) {
          matchIndex = i;
          break;
        }
      }
    }

    if (matchIndex !== -1) {
      usedIndices.add(matchIndex);
      earnedMilestonePoints += milestone.points;
      milestonesPassed++;
    } else {
      feedback.push(`Missed step: ${milestone.label}`);
      if (milestone.critical && !missedCritical) {
        missedCritical = milestone.label;
      }
    }
  }

  const milestonesScore = (earnedMilestonePoints / totalPossibleMilestonePoints) * 60;

  // 2. Final State Check (25% Weight)
  let finalStatePoints = 25;
  const checks = examCase.finalChecks;

  if (checks.minLineItems && finalSnapshot.lineItemsCount < checks.minLineItems) {
    finalStatePoints -= 8;
    feedback.push(`Expected items were not registered on the sale.`);
  }

  if (checks.tenderMethod && finalSnapshot.tenderMethod && finalSnapshot.tenderMethod !== checks.tenderMethod) {
    finalStatePoints -= 10;
    feedback.push(`Incorrect tender method used (expected ${checks.tenderMethod}).`);
  }

  if (checks.loyaltyType && finalSnapshot.loyaltyType !== checks.loyaltyType) {
    finalStatePoints -= 7;
    feedback.push(`Loyalty member identification was not properly set (expected ${checks.loyaltyType}).`);
  }

  if (checks.voidPerformed && (finalSnapshot.voidCount || 0) === 0) {
    finalStatePoints -= 10;
    feedback.push(`Required item or transaction void was not completed.`);
  }

  if (checks.discountType && !isDataMatch(checks.discountType, finalSnapshot.discountType)) {
    finalStatePoints -= 10;
    feedback.push(`Expected ${checks.discountType} discount was not applied.`);
  }

  const finalStateScore = Math.max(0, finalStatePoints);

  // 3. Change Computation Check (10% Weight)
  let changeScore = 10;
  if (checks.expectedChange !== undefined) {
    const given = userGivenChange ?? finalSnapshot.changeGiven;
    if (given === undefined) {
      changeScore = 0;
      feedback.push(`Change was not calculated or verified.`);
    } else if (Math.abs(given - checks.expectedChange) > 0.05) {
      changeScore = 0;
      feedback.push(`Incorrect change handed (handed ₱${given.toFixed(2)}, expected ₱${checks.expectedChange.toFixed(2)}).`);
    }
  }

  // 4. Efficiency & Pace (5% Weight)
  let efficiencyScore = 5;
  if (examCase.targetSeconds && timeSpentSeconds > examCase.targetSeconds * 2) {
    efficiencyScore = Math.max(1, efficiencyScore - 3);
    feedback.push(`Pacing was slow (${Math.round(timeSpentSeconds)}s vs target ${examCase.targetSeconds}s).`);
  }

  const rawScore = milestonesScore + finalStateScore + changeScore + efficiencyScore;
  const score = Math.round(Math.min(100, Math.max(0, rawScore)));
  const passed = score >= 70 && !missedCritical;

  if (missedCritical) {
    feedback.unshift(`Critical requirement not met: ${missedCritical}`);
  }

  return {
    caseId: examCase.id,
    title: examCase.title,
    caseNumber: examCase.caseNumber || 1,
    score,
    passed,
    timeSpentSeconds,
    milestonesPassed,
    milestonesTotal: examCase.milestones.length,
    missedCriticalMilestone: missedCritical,
    details: {
      milestonesScore: Math.round(milestonesScore),
      finalStateScore: Math.round(finalStateScore),
      changeScore: Math.round(changeScore),
      efficiencyScore: Math.round(efficiencyScore),
    },
    feedback,
  };
}

// Exam Session Grader
export function gradeExamSession(
  session: PracticalExamSession,
  caseResults: CaseGradingResult[],
  totalTimeSpentSeconds: number
): ExamSessionGradingResult {
  // Case Results Deduplication
  const uniqueResultsMap = new Map<string, CaseGradingResult>();
  for (const r of caseResults) {
    uniqueResultsMap.set(r.caseId, r);
  }
  const uniqueResults = Array.from(uniqueResultsMap.values());

  const casesTotal = session.cases.length;
  const casesCompleted = uniqueResults.length;
  const passedCasesCount = uniqueResults.filter((r) => r.passed).length;
  const failedCasesCount = casesTotal - passedCasesCount;

  const totalScore = Math.round(
    uniqueResults.reduce((acc, r) => acc + r.score, 0) / (casesTotal || 1)
  );

  // Passing Criteria
  const passed = totalScore >= session.passingScore && failedCasesCount <= 1;

  let summaryFeedback = "";
  if (passed) {
    summaryFeedback = `Congratulations! You successfully passed the Practical Hands-On Exam with ${totalScore}%. You demonstrated confident, independent counter operations across opening, customer checkouts, corrections, and closing procedures.`;
  } else {
    summaryFeedback = `Practical Exam not yet passed (${totalScore}% / required ${session.passingScore}%). Focus on reviewing the missed customer interactions and standard procedures before reattempting.`;
  }

  return {
    sessionId: session.sessionId,
    totalScore,
    passed,
    timeSpentSeconds: totalTimeSpentSeconds,
    casesCompleted,
    casesTotal,
    passedCasesCount,
    failedCasesCount,
    caseResults: uniqueResults,
    summaryFeedback,
  };
}
