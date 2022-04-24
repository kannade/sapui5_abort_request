sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/List",
	"sap/m/Popover",
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/m/VBox',
	'sap/m/HBox',
	"sap/m/FlexItemData",
	'sap/m/Text'
], function(Controller, List, Popover, Filter, FilterOperator, VBox, HBox, FlexItemData, Text) {
	"use strict";

	return Controller.extend("nickcodeabortRequest.controller.Main", {

		onInit: function() {
			this._oList = new List({
				selectionChange: this.onListSelected.bind(this),
				mode: "SingleSelectMaster"
			});

			this._oPopover = new Popover({
				content: this._oList,
				showArrow: false,
				showHeader: false,
				placement: "Bottom"
			});
		},

		onLineSearch: function(oEvent) {
			var oSource = oEvent.getSource();
			var sNewValue = oEvent.getParameter("newValue");

			if (sNewValue.length >= 3) {
				if (this._oPopover && this._oPopover.isOpen()) {
					this.setFilter(sNewValue);
				} else {
					this.openBy(oSource, sNewValue);
				}
			} else if (this._oPopover) {
				this._oPopover.close();
				if (sNewValue === "") {
					this.fireSuggestionCompleted({
						selData: null,
						source: this._oSource
					});
				}
			}
		},

		setFilter: function(sValue) {
			clearTimeout(this._timerSearch);
			this._timerSearch = setTimeout(function() {

				if (typeof this._oRequest === "object") {
					if (this._oRequest.abort) {
						this._oRequest.abort();
					}
				}
				this._oPopover.setBusy(true);
				this._readData(sValue).then(
					function(res) {
						var oContentModel = {
							"aItems": res
						};
						var oItemModel = new sap.ui.model.json.JSONModel({});
						oItemModel.setData(oContentModel);
						this._oList.setModel(oItemModel);
						this._oList.bindAggregation("items", "/aItems", this._oTemplate2);
						this._oPopover.setBusy(false);
					}.bind(this)
				);

			}.bind(this), 700);
		},

		_readData: function(sValue) {
			var oModel = this._oList.getModel("oMainModel");
			var promise = new Promise(function(resolve, reject) {
				if (!oModel) {
					reject(false);
					return;
				}

				this._oRequest = oModel.read("/searchSet", {
					filters: [
						new sap.ui.model.Filter("string", FilterOperator.Contains, sValue)
					],
					urlParameters: {
						"$top": 99,
						"$skip": 0
					},
					success: function(oData, response) {
						this._oRequest = undefined;
						resolve(oData.results);
					}.bind(this),
					error: function() {
						this._oRequest = undefined;
						reject(false);
					}.bind(this)
				});

			}.bind(this));
			return promise;
		},

		openBy: function(oSource, sValue) {
			try {
				var oParts = this.getBindingInfo("oMainModel").parts[0];
				this._sMdl = oParts.model;
				this._sMdlBnd = this._sMdl ? this._sMdl + ">" : "";
			} catch (oErr) {
				this._sMdl = "oMainModel";
				this._sMdlBnd = "";
			}

			this._oTemplate = new sap.m.CustomListItem({
				content: [
					new VBox({
						items: [
							new Text({
								text: "{ path: '" + this._sMdlBnd + "Header', formatter: 'nickcodeabortRequest.model.formatter.FormatHeader' }",
								wrapping: false,
								layoutData: new FlexItemData({
									styleClass: "headerSuggestionStyle"
								})
							}).addStyleClass("objidStyle"),
							new HBox({
								items: [
									new Text({
										text: "{" + this._sMdlBnd + "Objid}",
										wrapping: false
									}).addStyleClass("objidStyle"),
									new Text({
										text: "{ path: '" + this._sMdlBnd +
											"Description' }"
									}).addStyleClass("descriptionStyle")
								]
							}),
							new HBox({
								items: [
									new Text({
										text: "{ path: '" + this._sMdlBnd +
											"SubObjid' }",
										wrapping: false
									}).addStyleClass("subObjidStyle"),
									new Text({
										text: "{" + this._sMdlBnd + "SubDescription}"
									}).addStyleClass("subDescriptionStyle")
								]
							})
						]
					})
				]
			});

			this._oTemplate2 = new sap.m.CustomListItem({
				content: [
					new VBox({
						items: [
							new Text({
								text: "{ path: 'Header', formatter: 'nickcodeabortRequest.model.formatter.FormatHeader' }",
								wrapping: false,
								layoutData: new FlexItemData({
									styleClass: "headerSuggestionStyle"
								})
							}).addStyleClass("objidStyle"),
							new HBox({
								items: [
									new Text({
										text: "{Objid}",
										wrapping: false
									}).addStyleClass("objidStyle"),
									new Text({
										text: "{ path: 'Description' }"
									}).addStyleClass("descriptionStyle")
								]
							}),
							new HBox({
								items: [
									new Text({
										text: "{ path: 'SubObjid' }",
										wrapping: false
									}).addStyleClass("subObjidStyle"),
									new Text({
										text: "{SubDescription}"
									}).addStyleClass("subDescriptionStyle")
								]
							})
						]
					})
				]
			});

			var sNewValue = sValue ? sValue : oSource.getValue();
			this._oList.setModel(this.oView.getController().getOwnerComponent().getModel(this._sMdl), this._sMdl); // устанавливаем нужную модель на список
			this.setFilter(sNewValue);

			this._oSource = oSource;
			this._oPopover.addStyleClass("searchHelpStyle");
			this._oPopover.openBy(oSource);

			this._oPopover.attachAfterOpen(function() {
				oSource.focus();
				var oDomRef = document.getElementById(oSource.getId() + "-inner"); // для sap.m.Input
				if (!oDomRef) {
					oDomRef = document.getElementById(oSource.getId() + "-I"); // для sap.m.SearchField
				}
				var sVal = oSource.getValue();
				oDomRef.setSelectionRange(sVal.length, sVal.length);
			});
		},

		onListSelected: function(oEvent) {

		}

	});
});