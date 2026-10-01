// =============================================================================
// app/annotations.cds
// SAP Fiori Elements UI annotations for the SalesOrderManagementService.
// All UI/OData annotations belong here – not in db/ or srv/.
// =============================================================================
using SalesOrderManagementService from '../srv/sales-order-management-service';

// ---------------------------------------------------------------------------
// SalesOrders – List Report & Object Page annotations
// ---------------------------------------------------------------------------
annotate SalesOrderManagementService.SalesOrders with @(
  Capabilities.InsertRestrictions: { Insertable: true },

  // ---- UI Identification & Line Item (List Report table columns) ----------
  UI.LineItem: [
    { Value: orderNumber,       Label: 'Order Number'    },
    { Value: customerName,      Label: 'Customer'        },
    { Value: orderDate,         Label: 'Order Date'      },
    { Value: requestedDelivery, Label: 'Requested Delivery' },
    { Value: status_code,       Label: 'Status' },
    { Value: priority_code,     Label: 'Priority'        },
    { Value: grossAmount,       Label: 'Gross Amount'    },
    { Value: currency,          Label: 'Currency'        },
    { Value: salesOrg,          Label: 'Sales Org'       },
    {
      $Type: 'UI.DataFieldForAction',
      Action: 'SalesOrderManagementService.submitOrder',
      Label: 'Submit',
      Inline: true
    },
    {
      $Type: 'UI.DataFieldForAction',
      Action: 'SalesOrderManagementService.cancelOrder',
      Label: 'Cancel',
      Inline: true
    }
  ],

  // ---- Header info for Object Page  ----------------------------------------
  UI.HeaderInfo: {
    TypeName:       'Sales Order',
    TypeNamePlural: 'Sales Orders',
    Title:          { Value: orderNumber },
    Description:    { Value: customerName }
  },

  // ---- Header facets (KPI strip on Object Page) ----------------------------
  UI.HeaderFacets: [
    {
      $Type:  'UI.ReferenceFacet',
      Label:  'Amounts',
      Target: '@UI.FieldGroup#Amounts'
    },
    {
      $Type:  'UI.ReferenceFacet',
      Label:  'Status',
      Target: '@UI.FieldGroup#Status'
    }
  ],

  // ---- Field groups for Object Page facets ---------------------------------
  UI.FieldGroup#GeneralInfo: {
    Label: 'General Information',
    Data: [
      { Value: orderNumber,          Label: 'Order Number'        },
      { Value: customerName,         Label: 'Customer Name'       },
      { Value: customerEmail,        Label: 'Customer Email'      },
      { Value: orderDate,            Label: 'Order Date'          },
      { Value: requestedDelivery,    Label: 'Requested Delivery'  },
      { Value: salesOrg,             Label: 'Sales Organisation'  },
      { Value: distributionChannel,  Label: 'Distribution Channel'},
      { Value: division,             Label: 'Division'            }
    ]
  },

  UI.FieldGroup#Amounts: {
    Label: 'Financial Summary',
    Data: [
      { Value: netAmount,   Label: 'Net Amount'   },
      { Value: taxAmount,   Label: 'Tax Amount'   },
      { Value: grossAmount, Label: 'Gross Amount' },
      { Value: currency,    Label: 'Currency'     }
    ]
  },

  UI.FieldGroup#Status: {
    Label: 'Order Status',
    Data: [
      { Value: status_code,       Label: 'Status'           },
      { Value: priority_code,     Label: 'Priority'         },
      { Value: isBlocked,         Label: 'Blocked'          },
      { Value: isCreditHold,      Label: 'Credit Hold'      },
      { Value: hasAttachments,    Label: 'Has Attachments'  }
    ]
  },

  UI.FieldGroup#S4Info: {
    Label: 'S/4HANA Reference',
    Data: [
      { Value: s4DocumentNumber, Label: 'S/4 Document Number' },
      { Value: s4CreatedByUser,  Label: 'S/4 Created By'      }
    ]
  },

  // ---- Object Page facets layout -------------------------------------------
  UI.Facets: [
    {
      $Type:  'UI.CollectionFacet',
      Label:  'Overview',
      ID:     'Overview',
      Facets: [
        { $Type: 'UI.ReferenceFacet', Label: 'General Information', Target: '@UI.FieldGroup#GeneralInfo' },
        { $Type: 'UI.ReferenceFacet', Label: 'Financial Summary',   Target: '@UI.FieldGroup#Amounts'     },
        { $Type: 'UI.ReferenceFacet', Label: 'Order Status',        Target: '@UI.FieldGroup#Status'      },
        { $Type: 'UI.ReferenceFacet', Label: 'S/4HANA Reference',   Target: '@UI.FieldGroup#S4Info'      }
      ]
    },
    {
      $Type:  'UI.ReferenceFacet',
      Label:  'Order Items',
      ID:     'Items',
      Target: 'items/@UI.LineItem'
    },
    {
      $Type:  'UI.ReferenceFacet',
      Label:  'Notes',
      ID:     'Notes',
      Target: 'notes/@UI.LineItem'
    }
  ],

  // ---- Selection fields for List Report filter bar -------------------------
  UI.SelectionFields: [
    orderNumber,
    customerName,
    status_code,
    priority_code,
    salesOrg,
    orderDate,
    isBlocked
  ]
);

// ---------------------------------------------------------------------------
// SalesOrders – value help and field-level annotations
// ---------------------------------------------------------------------------
annotate SalesOrderManagementService.SalesOrders with {
  status         @(
    Common.Text: status.name,
    Common.TextArrangement: #TextOnly,
    Common.ValueListWithFixedValues: true,
    Common.ValueList: {
      CollectionPath: 'OrderStatuses',
      Parameters: [
        { $Type: 'Common.ValueListParameterOut', LocalDataProperty: status_code, ValueListProperty: 'code' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' }
      ]
    }
  );
  priority       @(
    Common.Text: priority.name,
    Common.TextArrangement: #TextOnly,
    Common.ValueListWithFixedValues: true,
    Common.ValueList: {
      CollectionPath: 'Priorities',
      Parameters: [
        { $Type: 'Common.ValueListParameterOut', LocalDataProperty: priority_code, ValueListProperty: 'code' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' }
      ]
    }
  );
  rejectionReason @(
    Common.Text: rejectionReason.name,
    Common.TextArrangement: #TextOnly,
    Common.ValueList: {
      CollectionPath: 'RejectionReasons',
      Parameters: [
        { $Type: 'Common.ValueListParameterOut', LocalDataProperty: rejectionReason_code, ValueListProperty: 'code' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' }
      ]
    }
  );
  orderNumber     @title: 'Order Number';
  customerName    @title: 'Customer Name';
  orderDate       @title: 'Order Date';
  salesOrg        @title: 'Sales Organisation';
  grossAmount     @Measures.ISOCurrency: currency;
  netAmount       @Measures.ISOCurrency: currency;
  taxAmount       @Measures.ISOCurrency: currency;
}

// ---------------------------------------------------------------------------
// SalesOrderItems – Line item annotations
// ---------------------------------------------------------------------------
annotate SalesOrderManagementService.SalesOrderItems with @(

  UI.LineItem: [
    { Value: itemNumber,         Label: 'Item'             },
    { Value: productId,          Label: 'Product ID'       },
    { Value: productDescription, Label: 'Description'      },
    { Value: quantity,           Label: 'Quantity'         },
    { Value: unitOfMeasure,      Label: 'UoM'              },
    { Value: unitPrice,          Label: 'Unit Price'       },
    { Value: netAmount,          Label: 'Net Amount'       },
    { Value: grossAmount,        Label: 'Gross Amount'     },
    { Value: isRejected,         Label: 'Rejected'         }
  ],

  UI.HeaderInfo: {
    TypeName:       'Order Item',
    TypeNamePlural: 'Order Items',
    Title:          { Value: productId },
    Description:    { Value: productDescription }
  },

  UI.FieldGroup#ItemDetails: {
    Label: 'Item Details',
    Data: [
      { Value: itemNumber,         Label: 'Item Number'    },
      { Value: productId,          Label: 'Product ID'     },
      { Value: productDescription, Label: 'Description'    },
      { Value: quantity,           Label: 'Quantity'       },
      { Value: unitOfMeasure,      Label: 'Unit of Measure'},
      { Value: unitPrice,          Label: 'Unit Price'     },
      { Value: taxRate,            Label: 'Tax Rate (%)'   }
    ]
  },

  UI.FieldGroup#ItemAmounts: {
    Label: 'Amounts',
    Data: [
      { Value: netAmount,   Label: 'Net Amount'   },
      { Value: taxAmount,   Label: 'Tax Amount'   },
      { Value: grossAmount, Label: 'Gross Amount' }
    ]
  },

  UI.FieldGroup#ItemStatus: {
    Label: 'Status',
    Data: [
      { Value: isRejected,           Label: 'Rejected'          },
      { Value: rejectionReason_code, Label: 'Rejection Reason'  },
      { Value: s4ItemNumber,         Label: 'S/4 Item Number'   }
    ]
  },

  UI.Facets: [
    { $Type: 'UI.ReferenceFacet', Label: 'Item Details', Target: '@UI.FieldGroup#ItemDetails' },
    { $Type: 'UI.ReferenceFacet', Label: 'Amounts',      Target: '@UI.FieldGroup#ItemAmounts' },
    { $Type: 'UI.ReferenceFacet', Label: 'Status',       Target: '@UI.FieldGroup#ItemStatus'  }
  ]
);

// ---------------------------------------------------------------------------
// SalesOrderNotes – annotations
// ---------------------------------------------------------------------------
annotate SalesOrderManagementService.SalesOrderNotes with @(

  UI.LineItem: [
    { Value: noteType,   Label: 'Type'     },
    { Value: noteText,   Label: 'Note'     },
    { Value: isInternal, Label: 'Internal' },
    { Value: createdBy,  Label: 'Author'   },
    { Value: createdAt,  Label: 'Date'     }
  ],

  UI.FieldGroup#NoteDetails: {
    Label: 'Note Details',
    Data: [
      { Value: noteType,   Label: 'Note Type'    },
      { Value: noteText,   Label: 'Note Text'    },
      { Value: isInternal, Label: 'Internal Note'},
      { Value: createdBy,  Label: 'Created By'   },
      { Value: createdAt,  Label: 'Created At'   }
    ]
  },

  UI.Facets: [
    { $Type: 'UI.ReferenceFacet', Label: 'Note Details', Target: '@UI.FieldGroup#NoteDetails' }
  ]
);
