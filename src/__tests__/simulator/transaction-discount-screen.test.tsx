import { describe, expect, it } from "vitest";
import { getDiscountPercent } from "@/components/simulator/screens/transaction-discount-screen";

describe("transaction discount rates", () => {
  it("returns 20% for senior citizen discount", () => {
    expect(getDiscountPercent("ZSEN")).toBe(20);
  });

  it("returns 15% for employee discount codes", () => {
    expect(getDiscountPercent("ZEM1")).toBe(15);
    expect(getDiscountPercent("ZEM2")).toBe(15);
  });

  it("returns no rate for an unknown discount code", () => {
    expect(getDiscountPercent("UNKNOWN")).toBeUndefined();
  });
});
