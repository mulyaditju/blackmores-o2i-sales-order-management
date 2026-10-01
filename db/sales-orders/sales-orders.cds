// =============================================================================
// db/sales-orders/sales-orders.cds
// Domain model for Sales Order processing.
// No service definitions, OData/UI/auth annotations allowed here.
// =============================================================================
namespace com.blackmores.o2i;

using { cuid }                                                  from '@sap/cds/common';
using { com.blackmores.o2i.Auditable }                       from '../common';
using { com.blackmores.o2i.OrderStatuses }                   from '../common';
using { com.blackmores.o2i.Priorities }                     from '../common';
using { com.blackmores.o2i.RejectionReasons }               from '../common';

// ---------------------------------------------------------------------------
// SalesOrders – the aggregate root
// ---------------------------------------------------------------------------
entity SalesOrders : cuid, Auditable {
  @mandatory
  orderNumber       : String(20);

  @mandatory
  customerName      : String(100);

  customerEmail     : String(200);

  @mandatory
  orderDate         : Date;

  requestedDelivery : Date;

  @mandatory
  salesOrg          : String(4);

  @mandatory
  distributionChannel : String(2);

  division          : String(2);

  netAmount         : Decimal(15, 2) default 0;
  grossAmount       : Decimal(15, 2) default 0;
  taxAmount         : Decimal(15, 2) default 0;
  currency          : String(3) default 'AUD';

  // S/4HANA mirror fields – prefixed with s4
  s4DocumentNumber  : String(10);
  s4CreatedByUser   : String(12);

  // Associations to code lists
  status            : Association to OrderStatuses;
  priority          : Association to Priorities;
  rejectionReason   : Association to RejectionReasons;

  // Boolean predicates
  isBlocked         : Boolean default false;
  isCreditHold      : Boolean default false;
  hasAttachments    : Boolean default false;

  // Composition: line items
  items             : Composition of many SalesOrderItems on items.order = $self;

  // Composition: notes
  notes             : Composition of many SalesOrderNotes on notes.order = $self;
}

// ---------------------------------------------------------------------------
// SalesOrderItems – line items belonging to a SalesOrder
// ---------------------------------------------------------------------------
entity SalesOrderItems : cuid, Auditable {
  order             : Association to SalesOrders;

  @mandatory
  itemNumber        : Integer;

  @mandatory
  productId         : String(40);

  productDescription : String(255);

  @mandatory
  quantity          : Decimal(13, 3);

  unitOfMeasure     : String(3) default 'EA';

  unitPrice         : Decimal(15, 2);
  netAmount         : Decimal(15, 2);
  taxRate           : Decimal(5, 2) default 10.00;
  taxAmount         : Decimal(15, 2);
  grossAmount       : Decimal(15, 2);

  // S/4HANA mirror fields
  s4ItemNumber      : String(6);

  isRejected        : Boolean default false;
  rejectionReason   : Association to RejectionReasons;
}

// ---------------------------------------------------------------------------
// SalesOrderNotes – free-text notes on a SalesOrder
// ---------------------------------------------------------------------------
entity SalesOrderNotes : cuid, Auditable {
  order             : Association to SalesOrders;

  @mandatory
  noteType          : String(20);

  @mandatory
  noteText          : String(1000);

  isInternal        : Boolean default false;
}
