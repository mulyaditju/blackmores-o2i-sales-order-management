sap.ui.define(
  [
    "sap/fe/test/JourneyRunner",
    "com/blackmores/salesorders/test/integration/pages/SalesOrdersList.gen",
    "com/blackmores/salesorders/test/integration/pages/SalesOrdersObjectPage.gen",
    "com/blackmores/salesorders/test/integration/pages/SalesOrderItemsObjectPage.gen"
  ],
  function (
    JourneyRunner,
    SalesOrdersListGenerated,
    SalesOrdersObjectPageGenerated,
    SalesOrderItemsObjectPageGenerated
  ) {
    "use strict";

    const runner = new JourneyRunner({
      launchUrl: sap.ui.require.toUrl("com/blackmores/salesorders") + "/test/flp.html#app-preview",
      pages: {
        onTheSalesOrdersListGenerated: SalesOrdersListGenerated,
        onTheSalesOrdersObjectPageGenerated: SalesOrdersObjectPageGenerated,
        onTheSalesOrderItemsObjectPageGenerated: SalesOrderItemsObjectPageGenerated
      },
      async: true
    });

    return runner;
  }
);
