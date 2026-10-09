// =============================================================================
// srv/handlers/order-functions.js
// CAP-aware handler for unbound function: getOrderSummary
// =============================================================================
import cds from "@sap/cds";

const log = cds.log("sales-order");

/**
 * Registers unbound function handlers on the service.
 *
 * @param {cds.ApplicationService} srv
 */
export function registerFunctionHandlers(srv) {
  const { SalesOrders } = srv.entities;

  // -------------------------------------------------------------------------
  // FUNCTION: getOrderSummary – aggregate statistics for a sales org
  // -------------------------------------------------------------------------
  srv.on("getOrderSummary", async (req) => {
    const correlationId = req.headers?.["x-correlation-id"] ?? "n/a";
    const { salesOrg } = req.data;

    log.info({ correlationId, salesOrg }, "Fetching order summary");

    // Single batch query – no loops, no wildcards
    const orders = await SELECT.from(SalesOrders, ["ID", "grossAmount", "status_code", "isBlocked"])
      .where(salesOrg ? { salesOrg } : {})
      .limit(10000)
      .via(req.tx);

    const totalOrders = orders.length;
    const totalValue = orders.reduce((sum, o) => sum + Number(o.grossAmount ?? 0), 0);
    const blockedOrders = orders.filter((o) => o.isBlocked).length;
    const newOrders = orders.filter((o) => o.status_code === "NW").length;

    log.info({ correlationId, salesOrg, totalOrders, totalValue }, "Order summary computed");

    return {
      totalOrders,
      totalValue: Math.round(totalValue * 100) / 100,
      blockedOrders,
      newOrders
    };
  });
}
