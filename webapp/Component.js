sap.ui.define(
  [
    "sap/ui/core/Component",
    "sap/base/util/ObjectPath",
    "sap/base/Log",
    "sap/m/MessageToast"
  ],
  /**
   * @param {sap.ui.core.Component} Component
   * @param {sap.base.util.ObjectPath} ObjectPath
   * @param {sap.base.Log} Log
   * @param {sap.m.MessageToast} MessageToast
   */
  (Component, ObjectPath, Log, MessageToast) => {
    "use strict";

    // alternatively add configuration parameter in backend
    // and obtain via `this.getComponentData().config`
    const FIFTEEN_MINUTES = 900000;

    return Component.extend("com.mrb.timeout.Component", {

      metadata: {
        manifest: "json",
      },

      /**
       * @override
       */
      init() {
        /** @type {sap.base.i18n.ResourceBundle} */
        this._i18n = this.getModel("i18n").getResourceBundle();
        /** @type {sap.base.Log} */
        this._logger = Log.getLogger("com.mrb.timeout");
        this._interval = setInterval(() => {
          fetch(""/** URL to the Component.js of the Plugin or FLP UserService*/, {
            method: "HEAD",
            cache: "no-cache"
          }).then((res) => {
            if (!res.ok) throw new Error(this._i18n.getText("responseNotOk"));
            this._logger.info(this._i18n.getText("successMessage"));
            // remove message toast in productive use
            MessageToast.show(this._i18n.getText("successMessage"));
          }).catch((err) => {
            this._logger.error(this._i18n.getText("errorMessage"), err);
            // remove message toast in productive use
            MessageToast.show(this._i18n.getText("errorMessage"));
          });
        }, FIFTEEN_MINUTES);

        // Use below code for anything UI related.
        //
        // Obtain plugin parameters from backend
        // const pluginParameters = this.getComponentData().config;
        //
        // this._oShellContainer = null;
        // const rendererPromise = this._getRenderer();
        // rendererPromise.then((renderer) => {
        //   renderer.addHeaderItem(
        //     {
        //       icon: "sap-icon://add",
        //       tooltip: "Add bookmark",
        //       press: function () {
        //         MessageToast.show(
        //           "This SAP Fiori Launchpad has been extended to improve your experience"
        //         );
        //       },
        //     },
        //     true,
        //     true
        //   );
        // });
      },

      /**
       * @override
       */
      exit() {
        if (this._oShellContainer && this._onRendererCreated) {
          this._oShellContainer.detachRendererCreatedEvent(this._onRendererCreated);
        }
        if (this._interval) {
          clearInterval(this._interval);
        }
      },

      /**
       * Returns the shell renderer instance in a reliable way,
       * i.e. independent from the initialization time of the plug-in.
       * This means that the current renderer is returned immediately, if it
       * is already created (plug-in is loaded after renderer creation) or it
       * listens to the 'rendererCreated' event (plug-in is loaded
       * before the renderer is created).
       *
       *  @returns {Promise} a promise, that resolves with the renderer instance, or
       *  rejects with an error message.
       */
      _getRenderer() {
        return new Promise((fnResolve, fnReject) => {
          this._oShellContainer = ObjectPath.get("sap.ushell.Container");
          if (!this._oShellContainer) {
            fnReject(
              "Illegal state: shell container not available; this component must be executed in a unified shell runtime context."
            );
          } else {
            var oRenderer = this._oShellContainer.getRenderer();
            if (oRenderer) {
              fnResolve(oRenderer);
            } else {
              // renderer not initialized yet, listen to rendererCreated event
              this._onRendererCreated = (oEvent) => {
                oRenderer = oEvent.getParameter("renderer");
                if (oRenderer) {
                  fnResolve(oRenderer);
                } else {
                  fnReject(
                    "Illegal state: shell renderer not available after receiving 'rendererLoaded' event."
                  );
                }
              };
              this._oShellContainer.attachRendererCreatedEvent(
                this._onRendererCreated
              );
            }
          }
        });
      },
    });
  }
);
