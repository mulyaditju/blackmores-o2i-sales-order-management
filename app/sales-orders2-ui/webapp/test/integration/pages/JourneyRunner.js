sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"com/blackmores/salesorders2/test/integration/pages/SalesOrdersList.gen",
	"com/blackmores/salesorders2/test/integration/pages/SalesOrdersObjectPage.gen",
	"com/blackmores/salesorders2/test/integration/pages/SalesOrderItemsObjectPage.gen"
], function (JourneyRunner, SalesOrdersListGenerated, SalesOrdersObjectPageGenerated, SalesOrderItemsObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('com/blackmores/salesorders2') + '/test/flp.html#app-preview',
        pages: {
			onTheSalesOrdersListGenerated: SalesOrdersListGenerated,
			onTheSalesOrdersObjectPageGenerated: SalesOrdersObjectPageGenerated,
			onTheSalesOrderItemsObjectPageGenerated: SalesOrderItemsObjectPageGenerated
        },
        async: true
    });

    return runner;
});

