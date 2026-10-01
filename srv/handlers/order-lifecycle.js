// =============================================================================
// srv/handlers/order-lifecycle.js
// CAP-aware event handlers for order lifecycle actions.
// Delegates all business logic to srv/lib/order-calculations.js.
// =============================================================================
import cds from '@sap/cds';
import {
  isValidStatusTransition,
  validateOrderMandatoryFields,
} from '../lib/order-calculations.js';

const log = cds.log('sales-order');

/**
 * Registers all order lifecycle event handlers on the service.
 *
 * @param {cds.ApplicationService} srv
 */
export function registerOrderLifecycleHandlers(srv) {
  const { SalesOrders } = srv.entities;

  // -------------------------------------------------------------------------
  // BEFORE CREATE – validate mandatory fields and set defaults
  // -------------------------------------------------------------------------
  srv.before('CREATE', SalesOrders, async (req) => {
    const correlationId = req.headers?.['x-correlation-id'] ?? 'n/a';
    const order = req.data;

    log.info({ correlationId, orderNumber: order.orderNumber }, 'Validating new sales order');

    const missingFields = validateOrderMandatoryFields(order);
    if (missingFields.length > 0) {
      return req.error({
        code:    'MISSING_MANDATORY_FIELDS',
        message: 'MISSING_MANDATORY_FIELDS',
        target:  missingFields[0],
        status:  400,
      });
    }

    // Default status to 'New' if not provided
    if (!order.status_code) {
      order.status_code = 'NW';
    }
  });

  // -------------------------------------------------------------------------
  // BEFORE UPDATE – prevent modification of completed/cancelled orders
  // -------------------------------------------------------------------------
  srv.before('UPDATE', SalesOrders, async (req) => {
    const correlationId = req.headers?.['x-correlation-id'] ?? 'n/a';
    const { ID } = req.data;

    const [existing] = await SELECT
      .from(SalesOrders, ['ID', 'status_code', 'isBlocked'])
      .where({ ID })
      .limit(1)
      .via(req.tx);

    if (!existing) return;

    if (['CO', 'CA'].includes(existing.status_code)) {
      log.warn({ correlationId, ID, status: existing.status_code }, 'Attempt to modify a closed order');
      return req.error({
        code:    'ORDER_NOT_MODIFIABLE',
        message: 'ORDER_NOT_MODIFIABLE',
        target:  'status_code',
        status:  422,
      });
    }

    if (existing.isBlocked) {
      log.warn({ correlationId, ID }, 'Attempt to modify a blocked order');
      return req.error({
        code:    'ORDER_BLOCKED',
        message: 'ORDER_BLOCKED',
        target:  'isBlocked',
        status:  422,
      });
    }
  });

  // -------------------------------------------------------------------------
  // ACTION: submitOrder – transitions NW → IP
  // -------------------------------------------------------------------------
  srv.on('submitOrder', SalesOrders, async (req) => {
    const correlationId = req.headers?.['x-correlation-id'] ?? 'n/a';
    const { ID } = req.params[0];

    const [order] = await SELECT
      .from(SalesOrders, ['ID', 'orderNumber', 'status_code', 'isBlocked', 'isCreditHold'])
      .where({ ID })
      .limit(1)
      .via(req.tx);

    if (!order) {
      return req.error({ code: 'ORDER_NOT_FOUND', message: 'ORDER_NOT_FOUND', status: 404 });
    }

    if (order.isBlocked) {
      return req.error({ code: 'ORDER_BLOCKED', message: 'ORDER_BLOCKED', target: 'isBlocked', status: 422 });
    }

    if (order.isCreditHold) {
      return req.error({ code: 'ORDER_CREDIT_HOLD', message: 'ORDER_CREDIT_HOLD', target: 'isCreditHold', status: 422 });
    }

    if (!isValidStatusTransition(order.status_code, 'IP')) {
      return req.error({
        code:    'INVALID_STATUS_TRANSITION',
        message: 'INVALID_STATUS_TRANSITION',
        target:  'status_code',
        status:  422,
      });
    }

    await UPDATE(SalesOrders)
      .set({ status_code: 'IP' })
      .where({ ID })
      .via(req.tx);

    log.info({ correlationId, ID, orderNumber: order.orderNumber }, 'Sales order submitted for processing');

    const [updated] = await SELECT
      .from(SalesOrders)
      .where({ ID })
      .limit(1)
      .via(req.tx);

    return updated;
  });

  // -------------------------------------------------------------------------
  // ACTION: cancelOrder – transitions current → CA
  // -------------------------------------------------------------------------
  srv.on('cancelOrder', SalesOrders, async (req) => {
    const correlationId = req.headers?.['x-correlation-id'] ?? 'n/a';
    const { ID } = req.params[0];
    const { reason } = req.data;

    const [order] = await SELECT
      .from(SalesOrders, ['ID', 'orderNumber', 'status_code'])
      .where({ ID })
      .limit(1)
      .via(req.tx);

    if (!order) {
      return req.error({ code: 'ORDER_NOT_FOUND', message: 'ORDER_NOT_FOUND', status: 404 });
    }

    if (!isValidStatusTransition(order.status_code, 'CA')) {
      return req.error({
        code:    'INVALID_STATUS_TRANSITION',
        message: 'INVALID_STATUS_TRANSITION',
        target:  'status_code',
        status:  422,
      });
    }

    const updatePayload = { status_code: 'CA' };
    if (reason) updatePayload.rejectionReason_code = reason;

    await UPDATE(SalesOrders)
      .set(updatePayload)
      .where({ ID })
      .via(req.tx);

    log.info({ correlationId, ID, orderNumber: order.orderNumber, reason }, 'Sales order cancelled');

    const [updated] = await SELECT
      .from(SalesOrders)
      .where({ ID })
      .limit(1)
      .via(req.tx);

    return updated;
  });

  // -------------------------------------------------------------------------
  // ACTION: releaseCreditHold
  // -------------------------------------------------------------------------
  srv.on('releaseCreditHold', SalesOrders, async (req) => {
    const correlationId = req.headers?.['x-correlation-id'] ?? 'n/a';
    const { ID } = req.params[0];

    const [order] = await SELECT
      .from(SalesOrders, ['ID', 'orderNumber', 'isCreditHold'])
      .where({ ID })
      .limit(1)
      .via(req.tx);

    if (!order) {
      return req.error({ code: 'ORDER_NOT_FOUND', message: 'ORDER_NOT_FOUND', status: 404 });
    }

    if (!order.isCreditHold) {
      return req.error({
        code:    'ORDER_NOT_ON_CREDIT_HOLD',
        message: 'ORDER_NOT_ON_CREDIT_HOLD',
        target:  'isCreditHold',
        status:  422,
      });
    }

    await UPDATE(SalesOrders)
      .set({ isCreditHold: false })
      .where({ ID })
      .via(req.tx);

    log.info({ correlationId, ID, orderNumber: order.orderNumber }, 'Credit hold released');

    const [updated] = await SELECT
      .from(SalesOrders)
      .where({ ID })
      .limit(1)
      .via(req.tx);

    return updated;
  });
}
