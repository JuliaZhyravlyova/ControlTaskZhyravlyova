sap.ui.define([
		"Zhyravlyova/ControlTaskZhyravlyova/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("Zhyravlyova.ControlTaskZhyravlyova.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);