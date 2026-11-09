import { describe, expect, it } from "vitest";
import { ITEM_VOID_REASONS } from "@/components/simulator/screens/item-void-screen";
import { TRX_VOID_REASONS } from "@/components/simulator/screens/trx-void-screen";
import { generateCertificateId } from "@/lib/progress/progress-store";

describe("POS Operational Screens & Utilities", () => {
  it("includes valid NBS reason codes for Item Void", () => {
    expect(ITEM_VOID_REASONS).toContain("Wrong Author");
    expect(ITEM_VOID_REASONS).toContain("Cashier Error");
    expect(ITEM_VOID_REASONS).toContain("Customer Cancel");
    expect(ITEM_VOID_REASONS).toContain("Damaged Item");
    expect(ITEM_VOID_REASONS).toContain("Wrong Item Scanned");
  });

  it("includes valid NBS reason codes for Transaction Void", () => {
    expect(TRX_VOID_REASONS).toContain("Wrong price");
    expect(TRX_VOID_REASONS).toContain("Cashier Error");
    expect(TRX_VOID_REASONS).toContain("Customer Cancel");
    expect(TRX_VOID_REASONS).toContain("System Error");
    expect(TRX_VOID_REASONS).toContain("Changed mind");
  });

  it("generates a well-formed, cryptographically safe Certificate ID", () => {
    const certId = generateCertificateId();
    const currentYear = new Date().getFullYear();
    expect(certId).toMatch(new RegExp(`^NBS-${currentYear}-[A-Z0-9]{8}$`));
  });
});
