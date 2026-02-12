namespace ro.bigcomm.dtc;

using { managed } from '@sap/cds/common';

//@odata.draft.enabled

@cds.persistence.skip
entity Orders : managed {

  /* Store / API info */
  APIName            : String(15)
  @title: 'Store Name';
   
  /* Order identifiers */
  key OrderId        : Integer      @title: 'Order ID' @mandatory;
  
  key WebServiceID   :String(5);
  CustomerId         : String(3)      @title: 'Customer ID';
  /* Order dates */
  DateCreated        : Date    @title: 'Date Created';
  DateModified       : Date    @title: 'Date Modified';
  /* Order status */
  Status             : String(15)   @title: 'Order Status';
  /* Financials */
  TotalIncTax        : Decimal(5,2) @title: 'Total Including Tax';
  /* SAP integration fields (future) */
  SapOrderId         : String(15)   @title: 'SAP Order ID';
  IdocNumber         : String(10)   @title: 'IDoc Number';
  MessageType        : String(1)    @title: 'Message Type';   // S, E, I, W
  Message            : String(100)  @title: 'SAP Message';

}



