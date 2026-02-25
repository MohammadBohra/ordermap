using ro.bigcomm.dtc as db from '../db/schema';
@cds.persistence.skip
service OrdersService @(requires: 'authenticated-user') {  
  entity Orders as projection on db.Orders;
  action create_sales_order(OrderId : String, WebServiceID : String, APIName : String) returns RawResponse ;
  action getSapGuiConfig() returns 
  {
    baseUrl : String;
    sapClient   : String;
  };
  type RawResponse {payload : String;}

@cds.persistence.skip
@odata.singleton
entity FeatureControl {
    operationHidden : Boolean;
}


  @cds.persistence.skip
  entity Stores {
  key StoreHash      : String(40) @title : 'Store Hash' @mandatory;
      APIName      : String(25) @title : 'Store Name' @mandatory;
  key WebServiceID   : String(20) @title : 'WebService ID';
      SoldToParty    : String(20) @title : 'Sold To Party' ;
      ShipToParty    : String(20) @title : 'Ship To Party' ;
      BillToParty    : String(20) @title : 'Bill To Party' ;
      AuthToken      : String(40) @title : 'Auth Token' ;
      URL            : String(50) @title : 'URL' ;
      SalesOrg       : String(4) @title : 'Sales Organization' ;
      DistChannel    : String(2) @title : 'Distribution Channel' ;
      Division       : String(2) @title : 'Division Channel' ;
      DocType        : String(4) @title : 'Document Type' ;
      CustAccGrp     : String(4) @title : 'Customer Account Group' ;
}
}
annotate OrdersService.Orders with @(
  UI.CreateHidden: { $edmJson: { $Path: '/OrdersService.EntityContainer/FeatureControl/operationHidden' } },
  UI.UpdateHidden: { $edmJson: { $Path: '/OrdersService.EntityContainer/FeatureControl/operationHidden' } },
  UI.DeleteHidden: { $edmJson: { $Path: '/OrdersService.EntityContainer/FeatureControl/operationHidden' } }
);
annotate OrdersService.Orders with @(
  Common.SideEffects #create_sales_order : {
    TargetProperties : [
      IdocNumber,
      Message,
      MessageType,
      SapOrderId
    ]
  }
);
