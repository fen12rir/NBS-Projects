export interface SyntheticProduct {
  sku: string;
  barcode: string;
  description: string;
  category: string;
  srp: number;
  promoPrice?: number;
  isVatable: boolean;
}

export const SYNTHETIC_PRODUCTS: SyntheticProduct[] = [
  {
    sku: "2903000514608",
    barcode: "2903000514608",
    description: "PHO ELECTRICAL CIRCUITS",
    category: "School Supplies",
    srp: 45.00,
    promoPrice: 39.50,
    isVatable: true,
  },
  {
    sku: "2903002276009",
    barcode: "2903002276009",
    description: "Pilot G-Tech 0.3 Black Gel Pen",
    category: "Writing Instruments",
    srp: 85.00,
    isVatable: true,
  },
  {
    sku: "NBS-BK-003",
    barcode: "4803456789012",
    description: "Bestfiles Clear Book A4 20P",
    category: "Office Supplies",
    srp: 120.00,
    promoPrice: 99.00,
    isVatable: true,
  },
  {
    sku: "NBS-PAP-004",
    barcode: "4804567890123",
    description: "Hard Copy Bond Paper Short 70gsm 500s",
    category: "Paper Products",
    srp: 235.00,
    isVatable: true,
  },
  {
    sku: "NBS-ART-005",
    barcode: "4805678901234",
    description: "Crayola Crayons 24 Colors Standard",
    category: "Art Supplies",
    srp: 95.00,
    isVatable: true,
  },
  {
    sku: "NBS-NOV-006",
    barcode: "4806789012345",
    description: "The Little Prince (Philippine Edition)",
    category: "Books",
    srp: 295.00,
    isVatable: false, // Books are often VAT-exempt in PH
  },
  {
    sku: "NBS-CALC-007",
    barcode: "4807890123456",
    description: "Casio Scientific Calculator FX-991ES Plus",
    category: "Electronics",
    srp: 1450.00,
    isVatable: true,
  }
];

export const SYNTHETIC_CASHIERS = [
  { id: "CASH-8812", name: "Maria Santos (Trainee)" },
  { id: "CASH-7419", name: "Juan Dela Cruz (Trainee)" }
];

export const SYNTHETIC_BRANCH = {
  code: "BR-014",
  name: "National Book Store - Grand Central",
  terminalId: "TERM-02"
};
