// =============================================================================
// test/unit/order-calculations.test.js
// Unit tests for pure business logic in srv/lib/order-calculations.js
// No DB, No HTTP, No CAP runtime – pure function tests only.
// =============================================================================
import { describe, it, expect } from "vitest";
import {
  calculateItemAmounts,
  rollUpOrderAmounts,
  isValidStatusTransition,
  validateOrderMandatoryFields
} from "../../srv/lib/order-calculations.js";
import validOrder from "../fixtures/order-valid-standard.json" with { type: "json" };

describe("calculateItemAmounts", () => {
  it("should calculate correct amounts for a standard item", () => {
    const result = calculateItemAmounts({ quantity: 10, unitPrice: 50, taxRate: 10 });
    expect(result.netAmount).toBe(500);
    expect(result.taxAmount).toBe(50);
    expect(result.grossAmount).toBe(550);
  });

  it("should default taxRate to 10% when not provided", () => {
    const result = calculateItemAmounts({ quantity: 5, unitPrice: 100 });
    expect(result.netAmount).toBe(500);
    expect(result.taxAmount).toBe(50);
    expect(result.grossAmount).toBe(550);
  });

  it("should return zero amounts when quantity is zero", () => {
    const result = calculateItemAmounts({ quantity: 0, unitPrice: 100, taxRate: 10 });
    expect(result.netAmount).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.grossAmount).toBe(0);
  });

  it("should handle decimal quantities correctly", () => {
    const result = calculateItemAmounts({ quantity: 1.5, unitPrice: 20, taxRate: 10 });
    expect(result.netAmount).toBe(30);
    expect(result.taxAmount).toBe(3);
    expect(result.grossAmount).toBe(33);
  });

  it("should handle items with missing quantity and unitPrice properties safely", () => {
    const result = calculateItemAmounts({ quantity: null, unitPrice: undefined, taxRate: 10 });
    expect(result.netAmount).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.grossAmount).toBe(0);
  });

  it("should handle items with missing taxRate properties safely", () => {
    const result = calculateItemAmounts({ quantity: 1.5, unitPrice: 20 });
    expect(result.netAmount).toBe(30);
    expect(result.taxAmount).toBe(3);
    expect(result.grossAmount).toBe(33);
  });
});

describe("rollUpOrderAmounts", () => {
  it("should sum amounts across all items", () => {
    const items = [
      { netAmount: 100, taxAmount: 10, grossAmount: 110 },
      { netAmount: 200, taxAmount: 20, grossAmount: 220 }
    ];
    const result = rollUpOrderAmounts(items);
    expect(result.netAmount).toBe(300);
    expect(result.taxAmount).toBe(30);
    expect(result.grossAmount).toBe(330);
  });

  it("should return zeros for an empty item list", () => {
    const result = rollUpOrderAmounts([]);
    expect(result.netAmount).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.grossAmount).toBe(0);
  });

  it("should handle null/undefined amounts gracefully", () => {
    const items = [{ netAmount: null, taxAmount: undefined, grossAmount: 110 }];
    const result = rollUpOrderAmounts(items);
    expect(result.netAmount).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.grossAmount).toBe(110);
  });

  it("should treat null/undefined grossAmount as zero", () => {
    const items = [{ netAmount: 100, taxAmount: 10, grossAmount: null }];
    const result = rollUpOrderAmounts(items);
    expect(result.netAmount).toBe(100);
    expect(result.taxAmount).toBe(10);
    expect(result.grossAmount).toBe(0);
  });
});

describe("isValidStatusTransition", () => {
  it("should allow NW → IP", () => {
    expect(isValidStatusTransition("NW", "IP")).toBe(true);
  });

  it("should allow NW → CA", () => {
    expect(isValidStatusTransition("NW", "CA")).toBe(true);
  });

  it("should allow IP → DL", () => {
    expect(isValidStatusTransition("IP", "DL")).toBe(true);
  });

  it("should allow DL → CO", () => {
    expect(isValidStatusTransition("DL", "CO")).toBe(true);
  });

  it("should not allow NW → DL (skip step)", () => {
    expect(isValidStatusTransition("NW", "DL")).toBe(false);
  });

  it("should not allow CO → NW (reopen)", () => {
    expect(isValidStatusTransition("CO", "NW")).toBe(false);
  });

  it("should not allow CA → IP (resurrect)", () => {
    expect(isValidStatusTransition("CA", "IP")).toBe(false);
  });

  it("should return false for an unknown/invalid current status", () => {
    expect(isValidStatusTransition("UNKNOWN", "IP")).toBe(false);
  });
});

describe("validateOrderMandatoryFields", () => {
  it("should return no errors for a fully populated order", () => {
    /*const order = {
      orderNumber: 'SO-001',
      customerName: 'Test Customer',
      orderDate: '2024-01-01',
      salesOrg: '1000',
      distributionChannel: '10',
    };*/

    // GIVEN: The static valid order fixture
    const order = validOrder;

    // WHEN: We validate the fields
    const missingFields = validateOrderMandatoryFields(order);

    // THEN: No fields should be missing
    expect(missingFields).toHaveLength(0);
  });

  it("should return missing field names when fields are absent", () => {
    const order = { orderNumber: "SO-001" };
    const missing = validateOrderMandatoryFields(order);
    expect(missing).toContain("customerName");
    expect(missing).toContain("orderDate");
    expect(missing).toContain("salesOrg");
    expect(missing).toContain("distributionChannel");
  });

  it("should flag empty string as missing", () => {
    const order = {
      orderNumber: "",
      customerName: "Test",
      orderDate: "2024-01-01",
      salesOrg: "1000",
      distributionChannel: "10"
    };
    const missing = validateOrderMandatoryFields(order);
    expect(missing).toContain("orderNumber");
  });
});
