sap.ui.define([
	'sap/ui/core/UIComponent',
	"sap/ui/model/odata/v2/ODataModel"
],
	function(UIComponent,ODataModel) {
	"use strict";

	var Component = UIComponent.extend("com.winslow.yve.Holiday_Card.Component", {

		metadata : {
			manifest: "json"
		},
		onCardReady: function (oCard) {
            oCard.resolveDestination("JAM").then(function (sResolvedUrl) {
                if (sResolvedUrl.endsWith("/")) { sResolvedUrl = sResolvedUrl.slice(0, -1); }
                var sServiceUrl = sResolvedUrl + "/api/v1/OData/";
                var oModel = new ODataModel(sServiceUrl, {
                    useBatch: true,
                    defaultBindingMode: "TwoWay",
                    headers: { "X-Requested-With": "XMLHttpRequest" },
                    tokenHandling: true,
                    withCredentials: true
                });
                oModel.attachMetadataFailed(function (oEvent) {
                    console.error("OData Metadata Failed", oEvent.getParameters());
                });
                this.setModel(oModel, "JAM");
            }.bind(this)).catch(function (sError) {
                console.error("Destination Resolution Failed", sError);
            });

            oCard.resolveDestination("BMSPortal_API").then(function (sResolvedUrl) {
                if (sResolvedUrl.endsWith("/")) { sResolvedUrl = sResolvedUrl.slice(0, -1); }
                var sServiceUrl = sResolvedUrl + "/v2/odata/v4/main/";
                var oModel = new ODataModel(sServiceUrl, {
                    useBatch: true,
                    defaultBindingMode: "TwoWay",
                    headers: { "X-Requested-With": "XMLHttpRequest" },
                    tokenHandling: true,
                    withCredentials: true
                });
                oModel.attachMetadataFailed(function (oEvent) {
                    console.error("OData Metadata Failed", oEvent.getParameters());
                });
                this.setModel(oModel);
            }.bind(this)).catch(function (sError) {
                console.error("Destination Resolution Failed", sError);
            });
        }
	});

	return Component;

});
