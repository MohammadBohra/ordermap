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

    create_sales_order: async function (oContext, aSelectedContexts) {
      try {
        

        if (!aSelectedContexts || aSelectedContexts.length === 0) {
          MessageToast.show("Please select a row to create SAP order.");
          return;
        }

        const oRowContext = aSelectedContexts[0]; // single select
        const oRowData = oRowContext.getObject();
        
        const SapOrderId = oRowData.SapOrderId;
        const IdocNumber = oRowData.IdocNumber;
        const MessageType = oRowData.MessageType;
        const isBlank = v =>
          v === null ||
          v === undefined ||
          v === "" ||
          (typeof v === "string" && /^0+$/.test(v));
        const oThat = this;
        const shouldCallOrderCreationAPI =
          isBlank(SapOrderId) &&
          (
            isBlank(IdocNumber) ||
            (!isBlank(IdocNumber) && MessageType === "E")
          );

        // Do we need confirmation?
        const needsConfirmation =
          !isBlank(IdocNumber) && MessageType === "E";

        if (needsConfirmation) {
          
          MessageBox.confirm(
            "Previous order submission failed.\n\nValidate the order details before submitting a new request. \n\n Do you want to submit a new reqtuest?",
            {
              title: "Confirm Order Creation",
              actions: [MessageBox.Action.NO, MessageBox.Action.YES],
              emphasizedAction: MessageBox.Action.NO,
              onClose: async function (oAction) {
                if (oAction === MessageBox.Action.YES) {
                  //await oThat.proceedWithOrderCreation(shouldCallOrderCreationAPI,oRowContext);


// **********************START ***************

if (shouldCallOrderCreationAPI) {

        const input = oRowContext.sPath;
        var OrderId = "";
        var WebServiceID = "";

        const match = input.match(/OrderId=(\d+),WebServiceID='([^']+)'/);

        if (match) {
          OrderId = match[1];
          WebServiceID = match[2];
        }
        
        const oContext = oRowContext.getModel().bindContext("/create_sales_order(...)");
        oContext.setParameter("OrderId", OrderId);
        oContext.setParameter("WebServiceID", WebServiceID);
        oContext.setParameter("APIName",oRowContext.getObject().APIName);
        

        // Execute action
        
  await oContext.execute().catch(function (e) {
    let sMessage = "Order creation failed.";

    if (e?.error?.message) {
      sMessage = e.error.message;
    } else if (e?.message) {
      sMessage = e.message;
    }

    MessageBox.error(sMessage);

    // VERY IMPORTANT: prevent FE from rethrowing
    return Promise.reject(e);
  });


  

        const oResult = oContext.getBoundContext().getObject();

        let response = oResult.payload;
        if (response.length === 0) {
          sap.m.MessageBox.error("Unknown error occurred. No response received.");
          return;
        }

        // Step 1: parse JSON if it's a string
        let arr;
        if (typeof response === "string") {
          try {
            arr = JSON.parse(response);
          } catch (e) {
            sap.m.MessageBox.error("Failed to parse response from server.");
            return;
          }
        } else if (Array.isArray(response)) {
          arr = response;
        } else {
          sap.m.MessageBox.error("Invalid response format from server.");
          return;
        }

        // Step 2: ensure we have at least one result
        if (!arr || arr.length === 0) {
          sap.m.MessageBox.error("No response data received.");
          return;
        }

        const result = arr[0]; // always first object

        const orderNumber = result.OrderNumber || '';
        const idocNumber = result.IDOCNumber || '';
        const msgType = result.MsgType; // may be undefined
        const message = result.message || '';

        if (!msgType) {
          // MsgType missing → generic error
          sap.m.MessageBox.error(`Order ${orderNumber} creation failed.\nUnknown error occurred.`);
        } else if (msgType === 'S') {
          // Success
          sap.m.MessageBox.success(
            `SAP IDoc created successfully for Order ${orderNumber}.\nIDoc Number: ${idocNumber || 'N/A'}`
          );
        } else if (msgType === 'E') {
          // Error
          sap.m.MessageBox.error(
            `Order ${orderNumber} creation failed.\n${message || 'Unknown error occurred.'}`
          );
        } else {
          // Any other MsgType → treat as error
          sap.m.MessageBox.error(`Order ${orderNumber} creation failed.\nUnexpected message type: ${msgType}`);
        }
      }
      else {
        // Informational messages
        if (!isBlank(SapOrderId)) {
          sap.m.MessageBox.information(
            `SAP Order already exists.\nSAP Order Number: ${SapOrderId}`
          );
        } else if (!isBlank(IdocNumber)) {
          sap.m.MessageBox.information(
            `SAP Order creation is already in progress.\nIDoc Number: ${IdocNumber}`
          );
        } else if (MessageType && MessageType !== "E") {
          sap.m.MessageBox.information(
            `SAP Order creation cannot be triggered.\nCurrent Message Type: ${MessageType}`
          );
        } else {
          sap.m.MessageBox.information(
            "SAP Order creation cannot be triggered for the selected record."
          );
        }
        return;
      }
// ***********************END **************






                }
              }
            }
          );
        } else {
          // No confirmation required → proceed directly


          
      if (shouldCallOrderCreationAPI) {

        const input = oRowContext.sPath;
        var OrderId = "";
        var WebServiceID = "";

        const match = input.match(/OrderId=(\d+),WebServiceID='([^']+)'/);

        if (match) {
          OrderId = match[1];
          WebServiceID = match[2];
        }

        const oContext = oRowContext.getModel().bindContext("/create_sales_order(...)");
        oContext.setParameter("OrderId", OrderId);
        oContext.setParameter("WebServiceID", WebServiceID);

        // Execute action
        await oContext.execute();
        const oResult = oContext.getBoundContext().getObject();

        let response = oResult.payload;
        if (response.length === 0) {
          sap.m.MessageBox.error("Unknown error occurred. No response received.");
          return;
        }

        // Step 1: parse JSON if it's a string
        let arr;
        if (typeof response === "string") {
          try {
            arr = JSON.parse(response);
          } catch (e) {
            sap.m.MessageBox.error("Failed to parse response from server.");
            return;
          }
        } else if (Array.isArray(response)) {
          arr = response;
        } else {
          sap.m.MessageBox.error("Invalid response format from server.");
          return;
        }

        // Step 2: ensure we have at least one result
        if (!arr || arr.length === 0) {
          sap.m.MessageBox.error("No response data received.");
          return;
        }

        const result = arr[0]; // always first object

        const orderNumber = result.OrderNumber || '';
        const idocNumber = result.IDOCNumber || '';
        const msgType = result.MsgType; // may be undefined
        const message = result.message || '';

        if (!msgType) {
          // MsgType missing → generic error
          sap.m.MessageBox.error(`Order ${orderNumber} creation failed.\nUnknown error occurred.`);
        } else if (msgType === 'S') {
          // Success
          sap.m.MessageBox.success(
            `SAP IDoc created successfully for Order ${orderNumber}.\nIDoc Number: ${idocNumber || 'N/A'}`
          );
        } else if (msgType === 'E') {
          // Error
          sap.m.MessageBox.error(
            `Order ${orderNumber} creation failed.\n${message || 'Unknown error occurred.'}`
          );
        } else {
          // Any other MsgType → treat as error
          sap.m.MessageBox.error(`Order ${orderNumber} creation failed.\nUnexpected message type: ${msgType}`);
        }
      }
      else {
        // Informational messages
        if (!isBlank(SapOrderId)) {
          sap.m.MessageBox.information(
            `SAP Order already exists.\nSAP Order Number: ${SapOrderId}`
          );
        } else if (!isBlank(IdocNumber)) {
          sap.m.MessageBox.information(
            `SAP Order creation is already in progress.\nIDoc Number: ${IdocNumber}`
          );
        } else if (MessageType && MessageType !== "E") {
          sap.m.MessageBox.information(
            `SAP Order creation cannot be triggered.\nCurrent Message Type: ${MessageType}`
          );
        } else {
          sap.m.MessageBox.information(
            "SAP Order creation cannot be triggered for the selected record."
          );
        }
        return;
      }
          
        }


      } catch (e) {
        MessageToast.show("Order creation failed : " + e.error.message );
      }
    },


  };
});
