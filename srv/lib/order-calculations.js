// =============================================================================
// srv/lib/order-calculations.js
// Pure, framework-agnostic business logic.
// NO access to req, cds, or any I/O. Fully unit-testable.
// =============================================================================

/**
 * Calculates the derived monetary amounts for a single line item.
 *
 * @param {object} item - Line item data containing quantity, unitPrice, taxRate
 * @returns {{ netAmount: number, taxAmount: number, grossAmount: number }}
 */
export function calculateItemAmounts(item) {
  const quantity  = Number(item.quantity  ?? 0);
  const unitPrice = Number(item.unitPrice ?? 0);
  const taxRate   = Number(item.taxRate   ?? 10);

  const netAmount   = Math.round(quantity * unitPrice * 100) / 100;
  const taxAmount   = Math.round(netAmount * (taxRate / 100) * 100) / 100;
  const grossAmount = Math.round((netAmount + taxAmount) * 100) / 100;

  return { netAmount, taxAmount, grossAmount };
}

/**
 * Rolls up item-level amounts to the order header.
 *
 * @param {Array<{ netAmount: number, taxAmount: number, grossAmount: number }>} items
 * @returns {{ netAmount: number, taxAmount: number, grossAmount: number }}
 */
export function rollUpOrderAmounts(items) {
  const totals = items.reduce(
    (acc, item) => {
      acc.netAmount   += Number(item.netAmount   ?? 0);
      acc.taxAmount   += Number(item.taxAmount   ?? 0);
      acc.grossAmount += Number(item.grossAmount ?? 0);
      return acc;
    },
    { netAmount: 0, taxAmount: 0, grossAmount: 0 }
  );

  return {
    netAmount:   Math.round(totals.netAmount   * 100) / 100,
    taxAmount:   Math.round(totals.taxAmount   * 100) / 100,
    grossAmount: Math.round(totals.grossAmount * 100) / 100,
  };
}

/**
 * Determines whether a status transition is valid.
 *
 * @param {string} currentStatus - Current status code (e.g. 'NW')
 * @param {string} targetStatus  - Desired status code (e.g. 'IP')
 * @returns {boolean}
 */
export function isValidStatusTransition(currentStatus, targetStatus) {
  const ALLOWED_TRANSITIONS = {
    NW: ['IP', 'CA'],
    IP: ['DL', 'CA'],
    DL: ['CO'],
    CO: [],
    CA: [],
  };

  const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
  return allowed.includes(targetStatus);
}

/**
 * Validates that all mandatory order header fields are present.
 *
 * @param {object} order - Order payload
 * @returns {string[]} Array of missing field names (empty = valid)
 */
export function validateOrderMandatoryFields(order) {
  const required = [
    'orderNumber',
    'customerName',
    'orderDate',
    'salesOrg',
    'distributionChannel',
  ];
  return required.filter(field => !order[field]);
}
