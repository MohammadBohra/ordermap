namespace ro.dtc.bigcomm;

@cds.persistence.schema: 'RO_DTC_BIGCOMM'
@cds.persistence.table: 'RO_DTC_BIGCOMM_STORES'
entity Stores {
  key StoreHash      : String(30) @title : 'Store Hash' @mandatory;
      StoreName      : String(30) @title : 'Store Name' @mandatory;
      WebServiceID   : String(20) @title : 'WebService ID';
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

