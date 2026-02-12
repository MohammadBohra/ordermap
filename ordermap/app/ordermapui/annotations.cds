using OrdersService as service from '../../srv/orders';
// 1. Add the Filter Restrictions to the Service Entity
annotate service.Orders with @(
    Capabilities.FilterRestrictions : {
        RequiresFilter : true,
        RequiredProperties : [APIName] // This makes it mandatory for the backend/UI
    }
);
annotate service.Orders with @(
    
    UI.HeaderInfo: {
    TypeName      : 'Bigcommerce Order',
    TypeNamePlural: 'Bigcommerce Orders'
        },
    
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : OrderId,
            },
            {
                $Type : 'UI.DataField',
                Value : SapOrderId
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],
    UI.LineItem : [
        {
        $Type  : 'UI.DataField',
        Value  : APIName,
        Label  : 'Store Name'
    },
    {
        $Type  : 'UI.DataField',
        Value  : OrderId,
        Label  : 'Order ID'
    },
    // {
    //   $Type: #WITH_URL,
    //   Label: 'Order ID',
    //   Value  : OrderId,
    //   URL: '/sap/bc/gui/sap/its/webgui?~transaction=VA03&~okcode=ENTR&VBAK-VBELN={OrderId}'
    // },
    // {
    //     $Type  : 'UI.DataField',
    //     Value  : CustomerId,
    //     Label  : 'Customer ID'
    // }
    {
        $Type  : 'UI.DataField',
        Value  : DateCreated,
        Label  : 'Created On'
    },
    // {
    //     $Type  : 'UI.DataField',
    //     Value  : DateModified,
    //     Label  : 'Last Modified'
    // },
    {
        $Type  : 'UI.DataField',
        Value  : Status,
        Label  : 'Status'
    },
    {
        $Type  : 'UI.DataField',
        Value  : TotalIncTax,
        Label  : 'Total (Inc. Tax)'
    },
    {
        $Type  : 'UI.DataField',
        Value  : IdocNumber,
        Label  : 'SAP IDoc Number'
    },
    
    {
        $Type  : 'UI.DataField',
        Value  : SapOrderId,
        Label  : 'SAP Order ID'
    },
    
    {
        $Type  : 'UI.DataField',
        Value  : MessageType,
        Label  : 'Msg Type'
    },
    {
        $Type  : 'UI.DataField',
        Value  : Message,
        Label  : 'Message'
    }
    ],
    UI.SelectionFields: [APIName,DateCreated]
);


annotate service.Orders with {
  APIName @(
    Common.ValueListWithFixedValues: true,
    
    
    Common.ValueList: {     
      CollectionPath: 'Stores',
      Parameters: [
        {
          $Type: 'Common.ValueListParameterInOut',
          LocalDataProperty: APIName,
          ValueListProperty: 'APIName'
        }
      ]
    },
    
  );
};


annotate service.Orders with @(
    Capabilities: {
        FilterRestrictions: {
            FilterExpressionRestrictions: [
                {
                    Property: 'APIName',
                    AllowedExpressions: 'SingleValue'
                }
            ]
        }
    }
);








