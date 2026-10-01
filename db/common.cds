// =============================================================================
// db/common.cds
// Shared aspects, types, and code lists used across the domain.
// No service definitions, OData annotations, UI annotations, or auth annotations.
// =============================================================================
namespace com.blackmores.o2i;

using { managed, sap.common.CodeList } from '@sap/cds/common';

// ---------------------------------------------------------------------------
// Reusable aspect: audit fields (created/modified by/at) + soft-delete
// ---------------------------------------------------------------------------
aspect Auditable : managed {
  isDeleted  : Boolean default false;
}

// ---------------------------------------------------------------------------
// Code list: Order Status
// ---------------------------------------------------------------------------
entity OrderStatuses : CodeList {
  key code : String(2) enum {
    New       = 'NW';
    InProcess = 'IP';
    Delivered = 'DL';
    Cancelled = 'CA';
    Completed = 'CO';
  };
}

// ---------------------------------------------------------------------------
// Code list: Rejection Reasons
// ---------------------------------------------------------------------------
entity RejectionReasons : CodeList {
  key code : String(2) enum {
    OutOfStock    = 'OS';
    PriceMismatch = 'PM';
    CustomerRequest = 'CR';
    Other         = 'OT';
  };
}

// ---------------------------------------------------------------------------
// Code list: Priority
// ---------------------------------------------------------------------------
entity Priorities : CodeList {
  key code : String(1) enum {
    Low    = 'L';
    Medium = 'M';
    High   = 'H';
  };
}
