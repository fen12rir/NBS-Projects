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

/**
 * Checks if expected data matches logged data loosely (e.g. "500" vs 500, case-insensitive strings).
 */
function isDataMatch(expected?: string | number, actual?: string | number): boolean {
  if (expected === undefined) return true;
  if (actual === undefined) return false;
  return String(expected).trim().toLowerCase() === String(actual).trim().toLowerCase();
}

/**
 * Grades an individual practical case based on the trainee's raw action log and end state.
 */
export function gradeCase(
  examCase: PracticalExamCase,
  actionLog: TraineeActionLog[],
  finalSnapshot: CaseFinalSnapshot,
  userGivenChange?: number,
  timeSpentSeconds: number = 0
): CaseGradingResult {
  const feedback: string[] = [];
  let logPointer = 0;
  let earnedMilestonePoints = 0;
  const totalPossibleMilestonePoints = examCase.milestones.reduce((acc, m) => acc + m.points, 0) || 1;
  let missedCritical: string | undefined = undefined;
  let milestonesPassed = 0;

  // 1. Milestone ordered subsequence evaluation (60% weight)
  for (const milestone of examCase.milestones) {
    let matched = false;
    while (logPointer < actionLog.length) {
      const logged = actionLog[logPointer];
      logPointer++;
      if (logged.action === milestone.action && isDataMatch(milestone.expectedData, logged.data)) {
        matched = true;
        break;
      }
    }

    if (matched) {
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

  // 2. Final state fidelity check (25% weight)
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

  if (checks.discountType && finalSnapshot.discountType !== checks.discountType) {
    finalStatePoints -= 10;
    feedback.push(`Expected ${checks.discountType} discount was not applied.`);
  }

  const finalStateScore = Math.max(0, finalStatePoints);

  // 3. Change computation check (10% weight)
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

  // 4. Efficiency & pace (5% weight)
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

/**
 * Aggregates all case results to compute overall exam session score and certification eligibility.
 */
export function gradeExamSession(
  session: PracticalExamSession,
  caseResults: CaseGradingResult[],
  totalTimeSpentSeconds: number
): ExamSessionGradingResult {
  const casesTotal = session.cases.length;
  const casesCompleted = caseResults.length;
  const passedCasesCount = caseResults.filter((r) => r.passed).length;
  const failedCasesCount = casesTotal - passedCasesCount;

  const totalScore = Math.round(
    caseResults.reduce((acc, r) => acc + r.score, 0) / (casesTotal || 1)
  );

  // Passing criteria: overall >= 80% AND no more than 1 failed case
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
    caseResults,
    summaryFeedback,
  };
}
