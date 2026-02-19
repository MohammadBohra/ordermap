sap.ui.define([
  "sap/ui/core/message/MessageManager"
], function (MessageManager) {
  "use strict";

  return {

    onBeforeRebindTableExtension: function (oEvent) {

      var oMessageManager = sap.ui.getCore().getMessageManager();

      // Remove ALL previous messages
      oMessageManager.removeAllMessages();

    }

  };
});
