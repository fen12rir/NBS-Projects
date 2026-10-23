import { describe, it, expect } from "vitest";
import {
  createInitialPOSState,
  posReducer,
  calculateTotals,
} from "@/lib/simulator/pos-state-machine";

describe("POS State Machine", () => {
  it("initializes with default values and MAIN page", () => {
    const state = createInitialPOSState("Test Cashier");
    expect(state.currentPage).toBe("MAIN");
    expect(state.cashierName).toBe("Test Cashier");
    expect(state.lineItems).toEqual([]);
    expect(state.pendingQuantity).toBe(1);
    expect(state.isTransactionCompleted).toBe(false);
  });

  it("navigates between POS pages (F5 Option chain)", () => {
    let state = createInitialPOSState();
    state = posReducer(state, { type: "NAVIGATE_PAGE", page: "SECOND" });
    expect(state.currentPage).toBe("SECOND");
    state = posReducer(state, { type: "NAVIGATE_PAGE", page: "THIRD" });
    expect(state.currentPage).toBe("THIRD");
    state = posReducer(state, { type: "NAVIGATE_PAGE", page: "FOURTH" });
    expect(state.currentPage).toBe("FOURTH");
    state = posReducer(state, { type: "NAVIGATE_PAGE", page: "MAIN" });
    expect(state.currentPage).toBe("MAIN");
  });

  it("adds an item by valid SKU and calculates totals correctly", () => {
    let state = createInitialPOSState();
    state = posReducer(state, { type: "ADD_ITEM_BY_CODE", code: "NBS-BK-001" });
    expect(state.lineItems.length).toBe(1);
    expect(state.lineItems[0].sku).toBe("NBS-BK-001");
    expect(state.lineItems[0].quantity).toBe(1);

    const totals = calculateTotals(state.lineItems);
    expect(totals.totalQty).toBe(1);
    expect(totals.totalAmount).toBeGreaterThan(0);
  });

  it("respects F3 quantity multiplier when adding items", () => {
    let state = createInitialPOSState();
    state = posReducer(state, { type: "SET_QUANTITY_START" });
    expect(state.isQuantityInputActive).toBe(true);

    state = posReducer(state, { type: "SET_QUANTITY_CONFIRM", quantity: 3 });
    expect(state.pendingQuantity).toBe(3);
    expect(state.isQuantityInputActive).toBe(false);

    state = posReducer(state, { type: "ADD_ITEM_BY_CODE", code: "NBS-PEN-002" });
    expect(state.lineItems.length).toBe(1);
    expect(state.lineItems[0].quantity).toBe(3);
    expect(state.pendingQuantity).toBe(1); // resets back to 1
  });

  it("prevents entering payment when transaction has 0 items", () => {
    let state = createInitialPOSState();
    state = posReducer(state, { type: "OPEN_PAYMENT" });
    expect(state.paymentDialogOpen).toBe(false);
    expect(state.lastMessage.type).toBe("error");
  });

  it("completes cash tender flow and calculates correct change", () => {
    let state = createInitialPOSState();
    state = posReducer(state, { type: "ADD_ITEM_BY_CODE", code: "NBS-BK-001" }); // promo 39.50
    const totals = calculateTotals(state.lineItems);

    state = posReducer(state, { type: "OPEN_PAYMENT" });
    expect(state.paymentDialogOpen).toBe(true);

    state = posReducer(state, { type: "SELECT_PAYMENT_METHOD", method: "CASH" });
    expect(state.selectedPaymentMethod).toBe("CASH");

    // Pay with 100 PHP
    state = posReducer(state, { type: "TENDER_PAYMENT", amount: 100 });
    expect(state.isTransactionCompleted).toBe(true);
    expect(state.tenderAmount).toBe(100);
    expect(state.changeDue).toBeCloseTo(100 - totals.totalAmount);
  });

  it("correctly handles item voiding", () => {
    let state = createInitialPOSState();
    state = posReducer(state, { type: "ADD_ITEM_BY_CODE", code: "NBS-BK-001" });
    const itemId = state.lineItems[0].id;

    state = posReducer(state, { type: "VOID_ITEM", itemId });
    expect(state.lineItems[0].isVoided).toBe(true);

    const totals = calculateTotals(state.lineItems);
    expect(totals.totalAmount).toBe(0);
    expect(totals.totalQty).toBe(0);
  });

  it("does not void an item when manager override is confirmed for Item Void", () => {
    let state = createInitialPOSState();
    state = posReducer(state, { type: "ADD_ITEM_BY_CODE", code: "NBS-BK-001" });
    state = posReducer(state, {
      type: "REQUEST_MANAGER_OVERRIDE",
      targetAction: "Item Void",
    });

    state = posReducer(state, { type: "CONFIRM_MANAGER_OVERRIDE" });

    expect(state.lineItems).toHaveLength(1);
    expect(state.lineItems[0].isVoided).toBe(false);
    expect(state.managerOverrideOpen).toBe(false);
    expect(state.managerOverrideTarget).toBeNull();
  });
});
