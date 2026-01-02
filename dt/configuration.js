/**
 * This module was created by the BASEditor
 */
sap.ui.define(["sap/ui/integration/Designtime"], function (
    Designtime
) {
    "use strict";
    return function () {
        return new Designtime({
            form: {
                items: {
                    GroupId: {
                        manifestpath: "/sap.card/configuration/parameters/GroupId/value",
                        label: "Group ID"
                    }
                }
            },
            preview: {
                modes: "Abstract"
            }
        });
    };
});