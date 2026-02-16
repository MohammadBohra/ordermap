const cds = require('@sap/cds');
const { getDestination } = require('@sap-cloud-sdk/connectivity');

module.exports = cds.service.impl(async function () {
    const BigCommerceAPI = await cds.connect.to("BigCommerceAPI");   
    const SAPAPI = await cds.connect.to("SAPAPI"); 
    const CPI = await cds.connect.to("CPI");  
    const { Stores } = cds.entities('OrdersService');

    const { Orders } = cds.entities('OrdersService');
    // -------------------------
    // Feature Control for Fiori
    // -------------------------   

    this.on('READ', 'FeatureControl', async (req) => {              
        return [{
        operationHidden: true        
    }]
    });
   
    // In-memory cache (keyed by user + tenant)
    //const storeCache = new Map(); 

function getOrderIdRangeFromWhere(where, fieldName) {
    let minId = null;
    let maxId = null;

    if (!Array.isArray(where)) {
        return { minId, maxId };
    }

    for (let i = 0; i < where.length; i++) {
        const token = where[i];

        // Match: OrderId <op> <value>
        if (token?.ref?.[0] === fieldName) {
            const operator = where[i + 1];
            const value = where[i + 2]?.val;

            if (!value || !/^\d+$/.test(String(value))) continue;

            const numericValue = Number(value);

            switch (operator) {
                case '=':
                    minId = numericValue;
                    maxId = numericValue;
                    break;

                case '>':
                    minId = numericValue + 1;
                    break;

                case '>=':
                    minId = numericValue;
                    break;

                case '<':
                    maxId = numericValue - 1;
                    break;

                case '<=':
                    maxId = numericValue;
                    break;
            }
        }
    }

    // ---- Handle open-ended ranges (limit to 100 IDs) ----
    const MAX_RANGE = 100;

    if (minId && !maxId) {
        maxId = minId + MAX_RANGE;
    }

    if (!minId && maxId) {
        minId = Math.max(1, maxId - MAX_RANGE);
    }

    return { minId, maxId };
}


function getDateRangeFromWhere(where, fieldName) {
    let fromDate = null;
    let toDate = null;

    if (!Array.isArray(where)) {
        return { fromDate, toDate };
    }

    for (let i = 0; i < where.length; i++) {
        const token = where[i];

        // Match: DateCreated <op> <value>
        if (token?.ref?.[0] === fieldName) {
            const operator = where[i + 1];
            const value = where[i + 2]?.val;

            if (!value) continue;

            switch (operator) {
                case '=':
                    fromDate = value;
                    toDate = value;
                    break;

                case '>=':
                case '>':
                    fromDate = value;
                    break;

                case '<=':
                case '<':
                    toDate = value;
                    break;
            }
        }
    }

    // ---- Handle open-ended ranges (limit to 30 days) ----
    const MAX_RANGE_DAYS = 30;

    if (fromDate && !toDate) {
        const d = new Date(fromDate);
        d.setDate(d.getDate() + MAX_RANGE_DAYS);
        toDate = d.toISOString().slice(0, 10);
    }

    if (!fromDate && toDate) {
        const d = new Date(toDate);
        d.setDate(d.getDate() - MAX_RANGE_DAYS);
        fromDate = d.toISOString().slice(0, 10);
    }
    if (!fromDate && !toDate) {
        const d1 = new Date();
        d1.setDate(d1.getDate() - MAX_RANGE_DAYS);
        fromDate = d1.toISOString().slice(0, 10);

        const d2 = new Date();
        d2.setDate(d2.getDate());
        toDate = d2.toISOString().slice(0, 10);
    }

    return { fromDate, toDate };
}

function mapDestinationUrlToRealUrl(destinationUrl) {
  const hostPort = new URL(destinationUrl).host;

  const realUrl = ENV_URL_MAP[hostPort];

  if (!realUrl) {
    throw new Error(`No real URL mapping found for ${hostPort}`);
  }

  return realUrl;
}
this.on('getSapGuiConfig', async () => {
    
    // Fetch destination by name
      const destination = await getDestination({
        destinationName: 'SAPAPI'
      });
      return {
        baseUrl: mapDestinationUrlToRealUrl(destination.url)
      };
   
  });


function normalizeDates(fromDate, toDate) {
    let minDate = fromDate ? `${fromDate}T00:00:00Z` : null;
    let maxDate = toDate ? `${toDate}T23:59:59Z` : null;
    return { minDate, maxDate };
}

function toDateOnly(value) {
    if (!value) return null;

    const date = new Date(value);
    if (isNaN(date)) return null;

    return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

    
    this.on('READ', 'Orders', async (req) => {
        try {
            const where = req.query?.SELECT?.where;
            const orderId = where?.orderId; // example: "119" OR "119,120,121"
            let APIName;

            if (where) {
                const apiNameIndex = where.findIndex(c => c.ref && c.ref[0] === 'APIName');
                if (apiNameIndex !== -1 && where[apiNameIndex + 2]?.val) {
                    APIName = where[apiNameIndex + 2].val;
                }
            }

            if (!APIName) {
                
                return req.error(500, 'Please Select a Store Name');  
                                            
            }

          const { fromDate, toDate } = getDateRangeFromWhere(where, "DateCreated") || {};
          let { minDate, maxDate } = normalizeDates(fromDate, toDate);

          const queryParams = [];
          if (minDate) queryParams.push(`min_date_created=${minDate}`);
          if (maxDate) queryParams.push(`max_date_created=${maxDate}`);

          if (minDate && maxDate && new Date(minDate) > new Date(maxDate)) {
            return req.error(
              400,
              "Invalid Date filter: From Date cannot be greater than To Date"
            );
          }

          const { minId, maxId } = getOrderIdRangeFromWhere(where, "OrderId");

          if (minId) queryParams.push(`min_id=${minId}`);
          if (maxId) queryParams.push(`max_id=${maxId}`);


          const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
                     
          const store = await getStoreByAPIName(APIName)            
            
            if (!store) {
                return req.error(404, `No store found for APIName '${APIName}'`);
            }
            const storeHash = store.StoreHash;
            const authToken = store.AuthToken;
            const WebServiceID = store.WebServiceID;


            const response = await BigCommerceAPI.send({
            method: "GET",
            path: `/stores/${storeHash}/v2/orders${queryString}`,
            headers: {
                "X-Auth-Token": authToken,
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
            });
            if (!response) {                
                console.error("Orders API Error:", response);
                return req.error(500, `Big Commerce API error`);
            }

         
          const sapMinDate = minDate.replace('Z', '');
          const sapMaxDate = maxDate.replace('Z', '');         
            
            const sapResponse = await SAPAPI.send({
                method: "GET",
                path:
                    `/sap/opu/odata/sap/ZSD_BIGCOMM_SALESORDER_DTC_SRV/` +
                    `DtcStoreOrderListSet?$filter=` +
                    `Bigcommstorewebid eq '${WebServiceID}' and (` +
                    `Bigcommorderdatecreated ge datetime'${sapMinDate}' and ` +
                    `Bigcommorderdatecreated le datetime'${sapMaxDate}')`
            });

            const sapOrders = sapResponse?.d?.results || [];            
            const sapIndex = {};
            for (const s of sapOrders) {
                sapIndex[s.Bigcommorderid] = s;
            }

            // Merge responses
            return response.map(order => {
               const sap = sapIndex[order.id];     
              const idocNumber = sap?.Sapidocnumber && !/^0+$/.test(sap.Sapidocnumber)
                ? sap.Sapidocnumber
                : null;

              const sapOrderNumber = sap?.Sapordernumber && !/^0+$/.test(sap.Sapordernumber)
                ? sap.Sapordernumber
                : null;

                return {
                    APIName,
                    OrderId: order.id,
                    WebServiceID:WebServiceID,
                    CustomerId: order.customer_id,
                    DateCreated: toDateOnly(order.date_created),
                    DateModified: toDateOnly(order.date_modified),
                    Status: order.status,
                    TotalIncTax: Number(order.total_inc_tax),

                    // SAP-enriched fields
                    SapOrderId: sapOrderNumber || null,  
                    // SapOrderId: '99999' || null,                  
                    IdocNumber: idocNumber,                    
                    // IdocNumber: '888888',                    
                    MessageType: sap?.Messagetype || null,
                    // MessageType: 'E' || null,
                    Message: sap?.Message || null
                };
            });

         

        } catch (e) {
            console.error('Orders error:', e);
            req.error(500, 'Failed to fetch Orders from BigCommerce');
        }
    });

 


  this.on('create_sales_order', async (req) => {
    try {
    const { OrderId,WebServiceID } = req.data;
    
    const response = await CPI.send({
      method: "POST",
      path: "/http/RO/BIGCOMMERCE/SAP/DtcCreateOrders",   
      //data: payload,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'orderid': OrderId,
        'bigcomidentifier': WebServiceID
      }
    });

    console.log(response);
      return {
        payload: JSON.stringify(response)
      };
    

    } catch (error) {
      // Send error to UI
      return req.error(500, `Order creation failed: ${error.message}`);
    }

    });

  this.before('create_sales_order', async (req) => {
    const { OrderId, WebServiceID,APIName } = req.data;
    if (!WebServiceID) {
      return req.error(400, 'WebServiceID is required');
    }
    requireStoreAdmin(req, WebServiceID,APIName);
  });

  function hasStoreAccess(user, webServiceID) {
  return (
    user.is(`RC_RO_BigCommDtcOrderDashboardAdmin_${webServiceID}`) ||
    user.is(`RC_RO_BigCommDtcOrderDashboardDisplay_${webServiceID}`)
  );
}

  function requireStoreAdmin(req, webServiceID,APIName) {
  const role = `RC_RO_BigCommDtcOrderDashboardAdmin_${webServiceID}`;
  if (!req.user.is(role)) {    
    return req.error(
      403,
      `Unable to proceed as you do not have SAP order creation authorization for store ${APIName}`
    );
  }
}





async function getStoreByAPIName(APIName) {
  const STORESDEST = await cds.connect.to('STORES');

  const response = await STORESDEST.send({
    method: 'GET',
    path: `/catalog/Stores?$filter=APIName eq '${APIName}'`,
    headers: { Accept: 'application/json' }
  });

  return response?.value?.[0] ?? null;
}

  this.on('READ', 'Stores', async (req) => {
  try {
   

    const STORESDEST = await cds.connect.to('STORES');

    const response = await STORESDEST.send({
      method: 'GET',
      path: '/catalog/Stores',
      headers: { Accept: 'application/json' }
    });

    if (!Array.isArray(response.value)) {
      req.error(502, 'Invalid response from Store service');
    }

    // Map response
    const stores = response.value.map(s => ({
      StoreHash: s.StoreHash,
      APIName: s.APIName,
      WebServiceID: s.WebServiceID,
      SoldToParty: s.SoldToParty,
      ShipToParty: s.ShipToParty,
      BillToParty: s.BillToParty,
      AuthToken: s.AuthToken,
      URL: s.URL,
      SalesOrg: s.SalesOrg,
      DistChannel: s.DistChannel,
      Division: s.Division,
      DocType: s.DocType,
      CustAccGrp: s.CustAccGrp
    }));

    
    const authorizedStores = stores.filter(store =>
      hasStoreAccess(req.user, store.WebServiceID)
    );

    return authorizedStores;

  } catch (err) {
    console.error('Stores READ error:', err);
    req.error(500, 'Failed to fetch Stores');
  }
});

});