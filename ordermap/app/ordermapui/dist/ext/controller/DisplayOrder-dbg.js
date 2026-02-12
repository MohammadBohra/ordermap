sap.ui.define([
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function (MessageToast, MessageBox) {
  'use strict';

  return {
    /**
     * Generated event handler.
     *
     * @param oContext the context of the page on which the event was fired. `undefined` for list report page.
     * @param aSelectedContexts the selected contexts of the table rows.
     */


    /**
        * Generated event handler.
        *
        * @param oContext the context of the page on which the event was fired. `undefined` for list report page.
        * @param aSelectedContexts the selected contexts of the table rows.
        */
    // display_sales_order: function(oContext, aSelectedContexts) {
    //     MessageToast.show("Custom handler invoked.");
    // }
    display_sales_order: async function (oContext, aSelectedContexts) {
      try {
        if (!aSelectedContexts || aSelectedContexts.length === 0) {
          MessageToast.show("Please select a row to display SAP order.");
          return;
        }

        const oRowContext = aSelectedContexts[0]; // single select
        const oRowData = oRowContext.getObject();

        const SapOrderId = oRowData.SapOrderId;

        const isBlank = v =>
          v === null ||
          v === undefined ||
          v === "" ||
          (typeof v === "string" && /^0+$/.test(v));

        // SAP Order does not exist
        if (isBlank(SapOrderId)) {
          sap.m.MessageBox.information(
            "SAP Sales Order does not exist for the selected record."
          );
          return;
        }

        // Call CAP service to get destination URL

        // const oContext = oRowContext.getModel().bindContext("/getSapGuiConfig(...)");  
        // Execute action
        // await oContext.execute();
        // const oResult = oContext.getBoundContext().getObject();

        const host = window.location.host;
        const ENV_URL_MAP = {
          'cg-development-xf3f5z2w.launchpad.cfapps.us21.hana.ondemand.com': 'http://usvhhadldev01.rustoleumcorp.com:8001',
          'cg-quality-zqqdey85.launchpad.cfapps.us21.hana.ondemand.com': 'http://usvhhadltrn01.rustoleumcorp.com:8000',
          'cg-production-5sou7b50.launchpad.cfapps.us21.hana.ondemand.com': 'http://usvhhaplprda2.rustoleumcorp.com:8000'
        };
        let baseUrl = ENV_URL_MAP[host];
        let sapClient = '100';      
        const sapLanguage = "EN";

        const transactionPart = `*VA03 VBAK-VBELN=${SapOrderId};DYNP_OKCODE=/00`;
        const encodedTransaction = encodeURIComponent(transactionPart);

        const url =
          `${baseUrl}/sap/bc/gui/sap/its/webgui/` +
          `?~transaction=${encodedTransaction}` +
          `&sap-client=${sapClient}` +
          `&sap-language=${sapLanguage}`;

        // Open in new tab
        window.open(url, "_blank");

      } catch (e) {
        console.error("Display sales order failed", e);
        MessageToast.show("Unable to display SAP sales order");
      }
    }

  };
});
