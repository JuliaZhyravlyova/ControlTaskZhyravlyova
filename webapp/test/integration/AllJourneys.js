/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"Zhyravlyova/ControlTaskZhyravlyova/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"Zhyravlyova/ControlTaskZhyravlyova/test/integration/pages/Worklist",
	"Zhyravlyova/ControlTaskZhyravlyova/test/integration/pages/Object",
	"Zhyravlyova/ControlTaskZhyravlyova/test/integration/pages/NotFound",
	"Zhyravlyova/ControlTaskZhyravlyova/test/integration/pages/Browser",
	"Zhyravlyova/ControlTaskZhyravlyova/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "Zhyravlyova.ControlTaskZhyravlyova.view."
	});

	sap.ui.require([
		"Zhyravlyova/ControlTaskZhyravlyova/test/integration/WorklistJourney",
		"Zhyravlyova/ControlTaskZhyravlyova/test/integration/ObjectJourney",
		"Zhyravlyova/ControlTaskZhyravlyova/test/integration/NavigationJourney",
		"Zhyravlyova/ControlTaskZhyravlyova/test/integration/NotFoundJourney",
		"Zhyravlyova/ControlTaskZhyravlyova/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});