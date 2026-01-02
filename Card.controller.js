sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (MessageToast, Controller, JSONModel) {
	"use strict";

	return Controller.extend("com.winslow.yve.Holiday_Card.Card", {
		onInit: function () {
			debugger;
			// Read URL parameters
			var oParams = new URLSearchParams(window.location.search);
			var sTitle = oParams.get("title"); // Holiday
			// Set visibility based on Title
			var oModel = new sap.ui.model.json.JSONModel({ BTN: sTitle === "Holiday" });
			this.getView().setModel(oModel, "oVisibleModel");

			this.getView().setBusy(true);
			this.getView().attachModelContextChange(this._onModelArrival, this);
			this._onModelArrival();
		},

		_onModelArrival: function () {
			debugger;
			// Get the model from the Component
			var oODataModel = this.getOwnerComponent().getModel();

			// Check if the model is defined yet
			if (oODataModel) {
				// 3. Success! Stop listening so this doesn't run again
				this.getView().detachModelContextChange(this._onModelArrival, this);

				// 4. Wait for metadata to be ready before calling .read()
				oODataModel.metadataLoaded().then(function () {
					this._loadData();
				}.bind(this));
			}
		},

		_loadData: function () {
			debugger;

			var bBtnVisible = this.getView().getModel("oVisibleModel").getProperty("/BTN");

			if (bBtnVisible === false) {
				// Today date
				this._oToday = new Date();
				this._sToday = this._oToday.toISOString().split("T")[0];

				// Filters
				this._aDefaultFilters = [
					new sap.ui.model.Filter("HolidayDate", sap.ui.model.FilterOperator.GE, this._sToday),
					new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.EQ, "Public Holiday")
				];

				// Next 5 holidays only
				this._mDefaultUrlParams = { "$orderby": "HolidayDate asc", "$top": 3 };

				// Call with filters
				this.onCommonReadCall(this._aDefaultFilters, this._mDefaultUrlParams);

			} else {
				this.onCommonReadCall([], {});
				this.getView().getModel("oVisibleModel").setProperty("/BTN", true);
			}
		},

		/* View All button */
		onViewAllHolidays: function () {
			debugger;
			const oView = this.getView();
			oView.setBusy(true);
			var displayText = "Public & Rostered Holiday"
			// this.getOwnerComponent().getModel().read("/GetHolidayGrpID", {
			// 	success: function (oData) {
			const grpID = this.getView().getModel("GroupIdModel").getProperty("/GroupId");
			if (!grpID) {
				oView.setBusy(false);
				return MessageToast.show("Group ID of Forms & Procedures not found");
			}
			this.getOwnerComponent().getModel("JAM").read(`/Search`, {
				urlParameters: {
					"Query": "'" + displayText + "'",
					"Group": "'" + grpID + "'",
					"Category": "'workpages'",
					"$expand": "ObjectReference",
					"$select": "ObjectReference/Title,ObjectReference/WebURL,ObjectReference/Type",
				},
				success: function (oData) {
					debugger
					var oFoundItem = oData.results.find(function (item) {
						var sTitle = item.ObjectReference.Title || "";
						var sType = item.ObjectReference.Type || "";
						return sTitle.toLowerCase().trim() === displayText.toLowerCase().trim() && sType === "NavTab";
					});
					if (oFoundItem) {
						window.location.href = oFoundItem.ObjectReference.WebURL + "?headless=true&title=" + encodeURIComponent("Holiday");
					} else {
						MessageToast.show("No item found with Title '" + displayText + "' and Type 'NavTab'.");
					}
					oView.setBusy(false);
				}.bind(this),
				error: function (oError) {
					MessageToast.show("Error fetching NavTabs, check console logs for more details");
					console.log(oError);
					oView.setBusy(false);
				}
			});
			// 	}.bind(this),
			// 	error: function (oError) {
			// 		MessageToast.show("Error fetching Group ID, check console logs for more details");
			// 		console.log(oError);
			// 		oView.setBusy(false);
			// 	}
			// });
		},

		/* Common OData read */
		onCommonReadCall: function (aFilters, mUrlParams) {
			debugger;
			var oView = this.getView();
			oView.setBusy(true);

			this.getOwnerComponent().getModel().read("/PublicHoliday", {
				filters: aFilters || [],
				urlParameters: mUrlParams || {},
				success: function (oData) {
					var aFormData = oData.results || [];
					var oModel = new JSONModel(aFormData);
					oView.setModel(oModel, "PublicHoliday");
					oView.setBusy(false);
				}.bind(this),
				error: function () {
					oView.setBusy(false);
				}.bind(this)
			});
		},
		formatTopDate: function (sDate) {
			if (!sDate) return "";

			var oDate = new Date(sDate);
			return oDate.toLocaleDateString("en-GB", {
				day: "numeric",
				month: "long",
				year: "numeric"
			}).toUpperCase();
		},

		formatSubText: function (sDate) {
			if (!sDate) return "";

			var oDate = new Date(sDate);
			var sDay = oDate.toLocaleDateString("en-GB", { weekday: "long" });
			var sFormatted = oDate.toLocaleDateString("en-GB");

			return "Public holiday on " + sDay + " " + sFormatted;
		}


	});
});