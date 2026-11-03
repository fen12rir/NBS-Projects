import { describe, expect, it } from "vitest";
import { NON_MDSE_OPTIONS } from "@/components/simulator/screens/non-merchandise-screen";

describe("Non-Merchandise Screen Options", () => {
  it("includes ZSOI Sodexho Variance as the primary option", () => {
    const zsoi = NON_MDSE_OPTIONS.find((opt) => opt.code === "ZSOI");
    expect(zsoi).toBeDefined();
    expect(zsoi?.description).toBe("SODEXHO VARIANCE");
    expect(zsoi?.defaultAmount).toBe("7.00");
  });

  it("includes standard NBS non-merchandise variance options", () => {
    const codes = NON_MDSE_OPTIONS.map((opt) => opt.code);
    expect(codes).toContain("ZSOI");
    expect(codes).toContain("VAR-001");
    expect(codes).toContain("VAR-025");
    expect(codes).toContain("VAR-100");
  });
});
