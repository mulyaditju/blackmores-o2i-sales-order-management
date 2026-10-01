// =============================================================================
// srv/sales-order-service.js
// Service manifest – handler registration ONLY.
// No inline business logic. All logic lives in srv/handlers/ and srv/lib/.
// =============================================================================
import cds from '@sap/cds';

import { registerOrderLifecycleHandlers }  from './handlers/order-lifecycle.js';
import { registerItemCalculationHandlers } from './handlers/item-calculations.js';
import { registerFunctionHandlers }        from './handlers/order-functions.js';

export class SalesOrderManagementService extends cds.ApplicationService {
  async init() {
    // Register handlers BEFORE super.init() to ensure they run ahead of
    // generic CAP persistence handlers.
    registerOrderLifecycleHandlers(this);
    registerItemCalculationHandlers(this);
    registerFunctionHandlers(this);

    // MUST be the final statement in init()
    await super.init();
  }
}
