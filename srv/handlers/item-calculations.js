// =============================================================================
// srv/handlers/item-calculations.js
// CAP-aware event handlers for sales order item amount calculations.
// Delegates math to srv/lib/order-calculations.js (pure functions).
// =============================================================================
import cds from '@sap/cds';
import {
  calculateItemAmounts,
  rollUpOrderAmounts,
} from '../lib/order-calculations.js';

const log = cds.log('sales-order');

/**
 * Registers item calculation handlers on the service.
 *
 * @param {cds.ApplicationService} srv
 */
export function registerItemCalculationHandlers(srv) {
  const { SalesOrders, SalesOrderItems } = srv.entities;

  // -------------------------------------------------------------------------
  // BEFORE CREATE/UPDATE on SalesOrderItems – compute derived amounts
  // -------------------------------------------------------------------------
  srv.before(['CREATE', 'UPDATE'], SalesOrderItems, (req) => {
    const item = req.data;
    if (item.quantity !== null && item.unitPrice !== null) {
      const amounts = calculateItemAmounts(item);
      Object.assign(req.data, amounts);
    }
  });

  // -------------------------------------------------------------------------
  // AFTER CREATE/UPDATE/DELETE on SalesOrderItems – roll up to order header
  // -------------------------------------------------------------------------
  srv.after(['CREATE', 'UPDATE', 'DELETE'], SalesOrderItems, async (_, req) => {
    const correlationId = req.headers?.['x-correlation-id'] ?? 'n/a';
    const orderId = req.data?.order_ID ?? req.data?.order?.ID;
    if (!orderId) return;

    // Batch-read all items for this order (no N+1 loop)
    const items = await SELECT
      .from(SalesOrderItems, ['netAmount', 'taxAmount', 'grossAmount'])
      .where({ order_ID: orderId })
      .via(req.tx);

    const totals = rollUpOrderAmounts(items);

    await UPDATE(SalesOrders)
      .set(totals)
      .where({ ID: orderId })
      .via(req.tx);

    log.info({ correlationId, orderId }, 'Order header amounts rolled up from items');
  });
}
