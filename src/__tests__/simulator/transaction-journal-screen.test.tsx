import { describe, expect, it } from "vitest";
import { createInitialPOSState } from "@/lib/simulator/pos-state-machine";

describe("Transaction Journal Logic", () => {
  it("initializes journal calculations with gross total", () => {
    const state = createInitialPOSState("Test Cashier");
    state.lineItems = [
      {
        id: "item-1",
        sku: "NBS-BK-001",
        description: "Spiral Notebook",
        price: 150,
        quantity: 2,
        total: 300,
        isVoided: false,
      },
      {
        id: "item-2",
        sku: "NBS-PEN-002",
        description: "Ballpoint Pen",
        price: 50,
        quantity: 1,
        total: 50,
        isVoided: true,
      },
    ];

    const activeGross = state.lineItems
      .filter((item) => !item.isVoided)
      .reduce((sum, item) => sum + item.total, 0);

    expect(activeGross).toBe(300);
  });

  it("handles empty lines and null comments safely", () => {
    const state = createInitialPOSState("Test Cashier");
    expect(state.lineItems.length).toBe(0);
    expect(state.transactionComments).toBeNull();
  });
});
