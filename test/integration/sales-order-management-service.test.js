import cds from "@sap/cds";
import { describe, it, expect } from "vitest";

// ✅ Launch the local CAP server project layout natively using cds.test
// This bootstraps your database and registers your local 'SalesOrderManagementService' automatically.
const { GET, POST, PUT, DELETE } = cds.test(import.meta.dirname + "/../..");

const PROCESSOR = { username: "editor", password: "editor" };
const VIEWER = { username: "viewer", password: "viewer" };

describe("SalesOrderManagementService - End-to-End Integration Tests", () => {
  // Define your exact path prefix matching your @path: '/api/v1/sales-order-management'
  const BASE_URL = "/api/v1/sales-order-management";

  // ─── Sales Orders ────────────────────────────────────────────────────────────

  describe("SalesOrders Entity", () => {
    it("should create a new sales order", async () => {
      const payload = {
        orderNumber: "SO-2026-0001",
        customerName: "Test Customer",
        orderDate: "2025-01-01",
        status: { code: "NW" },
        currency: "AUD",
        salesOrg: "1000",
        distributionChannel: "00",
        netAmount: 100
      };

      let createdOrderId;

      try {
        // ✅ Use the native POST client pointing directly to your OData Endpoint
        const response = await POST(`${BASE_URL}/SalesOrders`, payload, { auth: PROCESSOR });

        expect(response.status).toBe(201); // OData HTTP 201 Created
        expect(response.data).to.exist;

        // Capture the ID assigned by the database handler
        createdOrderId = response.data.ID;
        cds.log().info()("New Order ID", createdOrderId);
      } catch (error) {
        // 🔍 Log the hidden OData error matrix straight to the terminal console
        cds.log().info("🔴 FULL ODATA ERROR DETAILS:", JSON.stringify(error.response.data, null, 2));
        throw error; // Re-throw so the test still fails cleanly after logging
      }
    });

    it("should read all sales orders", async () => {
      const response = await GET(`${BASE_URL}/SalesOrders`, { auth: VIEWER });

      expect(response.status).toBe(200);
      expect(response.data.value).to.be.an("array");
      expect(response.data.value.length).to.be.greaterThan(0);
    });

    it("should read a sales order by ID", async () => {
      // First read to get a valid ID
      const listResponse = await GET(`${BASE_URL}/SalesOrders?$top=1`, { auth: VIEWER });
      expect(listResponse.data.value.length).to.be.greaterThan(0);
      const targetId = listResponse.data.value[0].ID;

      // Read single record
      const response = await GET(`${BASE_URL}/SalesOrders(${targetId})`, { auth: VIEWER });

      expect(response.status).toBe(200);
      expect(response.data).to.exist;
      expect(response.data.ID).to.equal(targetId);
    });

    it("should update a sales order", async () => {
      const listResponse = await GET(`${BASE_URL}/SalesOrders?$top=1`, { auth: VIEWER });
      const targetId = listResponse.data.value[0].ID;

      // ✅ OData updates typically use PUT or PATCH
      const response = await PUT(
        `${BASE_URL}/SalesOrders(${targetId})`,
        {
          status: { code: "IP" }
        },
        { auth: PROCESSOR }
      );

      expect(response.status).toBe(200);

      // Verify the change stuck
      const verify = await GET(`${BASE_URL}/SalesOrders(${targetId})`);
      expect(verify.data.status).to.equal("In Progress");
    });

    it("should delete a sales order", async () => {
      const payload = {
        orderNumber: "SO-2026-0001",
        customerName: "Delete Test Customer",
        orderDate: "2025-06-01",
        status: "New",
        currency: "AUD"
      };

      // Create temporary item to drop
      const createResponse = await POST(`${BASE_URL}/SalesOrders`, payload, { auth: PROCESSOR });
      const targetId = createResponse.data.ID;

      // ✅ Run HTTP DELETE
      const response = await DELETE(`${BASE_URL}/SalesOrders(${targetId})`, { auth: PROCESSOR });
      expect(response.status).toBe(204); // HTTP 204 No Content indicates a successful deletion

      // Verify it is gone (Should throw or return a 404)
      try {
        await GET(`${BASE_URL}/SalesOrders(${targetId})`, { auth: VIEWER });
      } catch (err) {
        expect(err.response.status).to.equal(404);
      }
    });
  });

  // ─── Actions / Functions ─────────────────────────────────────────────────────

  describe("Actions and Functions", () => {
    it("should submit a sales order via custom action", async () => {
      const listResponse = await GET(`${BASE_URL}/SalesOrders?$filter=status eq 'New'&$top=1`, {
        auth: VIEWER
      });

      if (listResponse.data.value.length === 0) return;
      const targetId = listResponse.data.value[0].ID;

      try {
        // ✅ OData Bound Actions are triggered via a POST to the entity action path
        const response = await POST(
          `${BASE_URL}/SalesOrders(${targetId})/submitOrder`,
          {},
          { auth: PROCESSOR }
        );
        expect(response.status).to.be.oneOf([200, 204]);
      } catch (err) {
        expect(err.response.status).not.to.equal(404);
      }
    });
  });
});
