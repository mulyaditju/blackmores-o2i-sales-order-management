using SalesOrderManagementService as service from '../../srv/sales-order-management-service';
using from '../annotations';

annotate service.SalesOrders with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : orderNumber,
            Label : 'Order Number',
        },
        {
            $Type : 'UI.DataField',
            Value : customerName,
            Label : 'Customer',
        },
        {
            $Type : 'UI.DataField',
            Value : orderDate,
            Label : 'Order Date',
        },
        {
            $Type : 'UI.DataField',
            Value : requestedDelivery,
            Label : 'Requested Delivery',
        },
        {
            $Type : 'UI.DataField',
            Value : status_code,
            Label : 'Status',
        },
        {
            $Type : 'UI.DataField',
            Value : priority_code,
            Label : 'Priority',
        },
        {
            $Type : 'UI.DataField',
            Value : grossAmount,
            Label : 'Gross Amount',
        },
        {
            $Type : 'UI.DataField',
            Value : currency,
            Label : 'Currency',
        },
        {
            $Type : 'UI.DataField',
            Value : salesOrg,
            Label : 'Sales Org',
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'SalesOrderManagementService.submitOrder',
            Label : 'Submit',
            Inline : true,
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'SalesOrderManagementService.cancelOrder',
            Label : 'Cancel',
            Inline : true,
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'SalesOrderManagementService.EntityContainer/getOrderSummary',
            Label : 'getOrderSummary',
        },
    ]
);

