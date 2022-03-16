/*global location*/
sap.ui.define([
	"Zhyravlyova/ControlTaskZhyravlyova/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"Zhyravlyova/ControlTaskZhyravlyova/model/formatter",
	"sap/m/Dialog",
	"sap/m/MessageToast"
], function(
	BaseController,
	JSONModel,
	History,
	formatter,
	Dialog,
	MessageToast
) {
	"use strict";

	return BaseController.extend("Zhyravlyova.ControlTaskZhyravlyova.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy: true,
					delay: 0
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function() {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function() {
			var oViewModel = this.getModel("objectView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("zjblessons_base_Materials", {
					MaterialID: sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function(sObjectPath) {
			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oDataModel.metadataLoaded().then(function() {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function() {
						var sMaterialId = this.getView().getBindingContext().getObject("MaterialID");
						sap.m.MessageToast.show(sMaterialId);
						oViewModel.setProperty("/busy", false);
					}.bind(this)
				}
			});
		},

		openCreateMaterialDialog: function() {
			if (!this.oCreatePlantDialog) {

				this.oCreatePlantDialog = new Dialog({
					id: "CreatePlantDialog",
					title: "Create Plant",
					type: "Message",
					contentwidth: "24em",
					content: [
						new sap.m.Label({
							text: "Plant Text"
						}),
						new sap.m.Input({
							width: "100%",
							maxLength: 20,
							value: "{createDialogModel>/plantText}"
						}),
						new sap.m.Label({
							text: "Region Text"
						}),
						new sap.m.Input({
							width: "100%",
							maxLength: 10,
							value: "{createDialogModel>/regionText}"
						})
					],
					beginButton: new sap.m.Button({
						type: "Emphasized",
						text: "{i18n>Create}",
						enabled: "{createDialogModel>/createButtonEnabled}",
						press: function() {
							var oEntry = {
								PlantID: "",
								PlantText: this.oCreatePlantDialog.getModel("createDialogModel").getProperty("/plantText"),
								RegionText: this.oCreatePlantDialog.getModel("createDialogModel").getProperty("/regionText")

							};
							this.getModel().create("/zjblessons_base_Plants", oEntry, {
								success: function(e) {
									var MessageSuccess = this.getResourceBundle().getText("Success");
									MessageToast.show(MessageSuccess);
								}.bind(this),
								error: function(e) {
									var MessageError = this.getResourceBundle().getText("Error");
									MessageToast.show(MessageError);
								}.bind(this)
							});

							this.oCreatePlantDialog.close();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "{i18n>Cancel}",
						press: function() {
							this.oCreatePlantDialog.close();
						}.bind(this)
					})

				}).addStyleClass("sapUiSizeCompact");

				this.oCreatePlantDialog.setModel(new JSONModel(), "createDialogModel");
				this.getView().addDependent(this.oCreatePlantDialog);
			}

			this.oCreatePlantDialog.getModel("createDialogModel").setData({
				regionText: "",
				plantText: ""
			});

			this.oCreatePlantDialog.open();
		},

		onDeletePlantlRes: function(oEvent) {
			var aContext = this.byId("idResTable").getSelectedContexts();
			aContext.forEach(function(oCont) {
				this.getView().getModel().remove(oCont.getPath());
			}.bind(this));
		},

		onDeactivatePlantRes: function(oEvent) {
			var aContext = this.byId("idResTable").getSelectedContexts();
			aContext.forEach(function(oCont) {
				this.getView().getModel().update(oCont.getPath(), {
					Version: "D"
				});
			}.bind(this));
		},
		onDeactivatePlantGrid: function(oEvent) {
			var aContextIndex = this.byId("table1").getSelectedIndices();
			aContextIndex.forEach(function(iContIn) {

				var oCont = this.byId("table1").getContextByIndex(iContIn);
				this.getView().getModel().update(oCont.getPath(), {
					Version: "D"
				});
			}.bind(this));
		},
		onDeletePlantlGrid: function(oEvent) {
			var aContextIndex = this.byId("table1").getSelectedIndices();
			aContextIndex.forEach(function(iContIn) {

				var oCont = this.byId("table1").getContextByIndex(iContIn);
				this.getView().getModel().remove(oCont.getPath());
			}.bind(this));
		},

		onInputChange: function() {
			this.byId("idResTable").getBinding("items").sort(new sap.ui.model.Sorter({
				path: 'RegionText',
				descending: false
			}));
		},

		_onBindingChange: function() {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.MaterialID,
				sObjectName = oObject.MaterialID;

			oViewModel.setProperty("/busy", false);
			// Add the object page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("objectTitle") + " - " + sObjectName,
				icon: "sap-icon://enter-more",
				intent: "#ControlTaskZhyravlyova-display&/zjblessons_base_Materials/" + sObjectId
			});

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("saveAsTileTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		}

	});

});