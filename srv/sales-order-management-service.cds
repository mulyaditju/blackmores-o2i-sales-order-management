// =============================================================================
// srv/sales-order-service.cds
// Clean service definition with explicit projections, actions, and annotations.
// =============================================================================
using { com.blackmores.o2i as ord }   from '../db/schema';
using { com.blackmores.o2i as cmn }  from '../db/common';

// ---------------------------------------------------------------------------
// Service definition – deny by default, explicit role guards
// ---------------------------------------------------------------------------
@path: '/api/v1/sales-order-management'
@requires: 'authenticated-user'
service SalesOrderManagementService {

  // -------------------------------------------------------------------------
  // Entities exposed as OData entity sets
  // -------------------------------------------------------------------------

  @restrict: [
    { grant: ['READ'],                    to: 'SalesOrderViewer'  },
    { grant: ['READ', 'WRITE', 'CREATE'], to: 'SalesOrderEditor'  },
    { grant: '*',                         to: 'SalesOrderManager' }
  ]
  entity SalesOrders as projection on ord.SalesOrders {
    ID,
    orderNumber,
    customerName,
    customerEmail,
    orderDate,
    requestedDelivery,
    salesOrg,
    distributionChannel,
    division,
    netAmount,
    grossAmount,
    taxAmount,
    currency,
    s4DocumentNumber,
    s4CreatedByUser,
    status,
    priority,
    rejectionReason,
    isBlocked,
    isCreditHold,
    hasAttachments,
    items,
    notes,
    createdAt,
    createdBy,
    modifiedAt,
    modifiedBy,
    isDeleted
  }
  actions {
    @(
      Common.SideEffects: { TargetProperties: ['in/status_code', 'in/isBlocked'] },
      cds.odata.bindingparameter.name: 'in'
    )
    action submitOrder()   returns SalesOrders;

    @(
      Common.SideEffects: { TargetProperties: ['in/status_code', 'in/isBlocked'] },
      cds.odata.bindingparameter.name: 'in'
    )
    action cancelOrder(
      @(title: '{i18n>rejectionReasonCode}')
      reason : String(2)
    ) returns SalesOrders;

    @(
      Common.SideEffects: { TargetProperties: ['in/isCreditHold'] },
      cds.odata.bindingparameter.name: 'in'
    )
    action releaseCreditHold() returns SalesOrders;
  };

  @restrict: [
    { grant: ['READ'],   to: 'SalesOrderViewer'  },
    { grant: '*',        to: 'SalesOrderEditor'  },
    { grant: '*',        to: 'SalesOrderManager' }
  ]
  entity SalesOrderItems as projection on ord.SalesOrderItems {
    ID,
    order,
    itemNumber,
    productId,
    productDescription,
    quantity,
    unitOfMeasure,
    unitPrice,
    netAmount,
    taxRate,
    taxAmount,
    grossAmount,
    s4ItemNumber,
    isRejected,
    rejectionReason,
    createdAt,
    createdBy,
    modifiedAt,
    modifiedBy
  };

  @restrict: [
    { grant: ['READ'],   to: 'SalesOrderViewer'  },
    { grant: '*',        to: 'SalesOrderEditor'  },
    { grant: '*',        to: 'SalesOrderManager' }
  ]
  entity SalesOrderNotes as projection on ord.SalesOrderNotes {
    ID,
    order,
    noteType,
    noteText,
    isInternal,
    createdAt,
    createdBy,
    modifiedAt,
    modifiedBy
  };

  // -------------------------------------------------------------------------
  // Code list value helps (read-only)
  // -------------------------------------------------------------------------
  @readonly entity OrderStatuses    as projection on cmn.OrderStatuses;
  @readonly entity RejectionReasons as projection on cmn.RejectionReasons;
  @readonly entity Priorities       as projection on cmn.Priorities;

  // -------------------------------------------------------------------------
  // Unbound function: get order summary statistics
  // -------------------------------------------------------------------------
  @(requires: 'SalesOrderViewer')
  function getOrderSummary(salesOrg : String(4)) returns {
    totalOrders   : Integer;
    totalValue    : Decimal(15, 2);
    blockedOrders : Integer;
    newOrders     : Integer;
  };
}
