import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CustomerPanel } from "@/components/simulator/customer-panel";
import {
  getNextExamEventIndex,
  PRACTICAL_CASE_POOL,
  type ExamCustomerEvent,
} from "@/data/practical-exam";

describe("Practical exam customer events", () => {
  it("advances the dialogue only when the next event's action occurs", () => {
    const events: ExamCustomerEvent[] = [
      { say: "Ring up my notebook." },
      {
        triggerAfterAction: "ADD_ITEM",
        triggerAfterActionCount: 2,
        say: "Please void the paper.",
      },
      { triggerAfterAction: "CONFIRM_SUSPEND", say: "I'm back." },
    ];

    expect(getNextExamEventIndex(events, 0, "GO_PAYMENT")).toBe(0);
    expect(getNextExamEventIndex(events, 0, "ADD_ITEM", 1)).toBe(0);
    expect(getNextExamEventIndex(events, 0, "ADD_ITEM", 2)).toBe(1);
    expect(getNextExamEventIndex(events, 1, "ADD_ITEM", 2)).toBe(1);
    expect(getNextExamEventIndex(events, 1, "CONFIRM_SUSPEND")).toBe(2);
  });

  it("shows the active event dialogue alongside items to scan", () => {
    const currentCase = PRACTICAL_CASE_POOL.find((item) => item.id === "case-item-void")!;
    const markup = renderToStaticMarkup(
      React.createElement(CustomerPanel, {
        currentCase,
        activeEventIndex: 1,
        caseIndex: 0,
        totalCases: 1,
        remainingSeconds: 60,
      }),
    );

    expect(markup).toContain("Wait! I changed my mind about the copy paper.");
    expect(markup).toContain("NBS Classic Notebook Spiral 80L");
  });
});
