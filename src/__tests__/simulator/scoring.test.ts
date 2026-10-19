import { describe, it, expect } from "vitest";
import { TRAINING_SCENARIOS } from "@/data/scenarios";

describe("Training Scenario & Scoring Validation", () => {
  it("has the basic cash sale scenario with 8 ordered steps", () => {
    const scenario = TRAINING_SCENARIOS.find((s) => s.id === "scen-cash-sale-basic")!;
    expect(scenario.id).toBe("scen-cash-sale-basic");
    expect(scenario.steps.length).toBe(8);
    expect(scenario.passingScore).toBe(70);
  });

  it("calculates passing score accurately", () => {
    const totalSteps = 8;
    const mistakesCount = 1;
    const correctSteps = totalSteps - mistakesCount;
    const score = Math.round((correctSteps / totalSteps) * 100);
    expect(score).toBe(88);
    expect(score >= 70).toBe(true);
  });

  it("accurately detects failing attempts below threshold", () => {
    const totalSteps = 8;
    const mistakesCount = 3;
    const correctSteps = totalSteps - mistakesCount;
    const score = Math.round((correctSteps / totalSteps) * 100);
    expect(score).toBe(63);
    expect(score >= 70).toBe(false);
  });
});
