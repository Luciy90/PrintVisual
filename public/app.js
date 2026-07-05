(() => {
  var import_config = require("./config.js");
  var import_elements = require("./elements.js");
  var import_state = require("./state.js");
  var import_ui = require("./ui.js");
  var import_cameras = require("./cameras.js");
  var import_notifications = require("./notifications.js");
  var import_utils = require("./utils.js");
  var import_recovery = require("./recovery.js");
  const debouncedUpdateDividers = (0, import_utils.debounce)(import_recovery.updateHorizontalDividers, 25);
  const debouncedSave = (0, import_utils.debounce)(import_recovery.saveToLocalStorage, 100);
  const debouncedUpdateInterfaceWidth = (0, import_utils.debounce)(import_ui.updateInterfaceWidth, 15);
  const debouncedUpdateInterfaceHeight = (0, import_utils.debounce)(import_ui.updateInterfaceHeight, 15);
  const debouncedSaveOnDragEnd = (0, import_utils.debounce)(import_recovery.saveToLocalStorage, 150);
  const debouncedUpdateNotificationOpacity = (0, import_utils.debounce)(() => {
    const opacityInput = import_elements.Elements.notificationOpacityInput;
    if (!opacityInput) return;
    let opacityValue = parseFloat(opacityInput.value);
    if (isNaN(opacityValue) || opacityValue < 0 || opacityValue > 1) {
      opacityValue = 0.2;
    }
    const notifications = document.querySelectorAll(".notification");
    notifications.forEach((notification) => {
      const isSystem = notification.classList.contains("system");
      const isError = notification.classList.contains("error");
    });
  }, 100);
  function init() {
    (0, import_recovery.setupEventListeners)();
    (0, import_ui.updateHeader)();
    (0, import_ui.updateToolbarColors)();
    (0, import_ui.updateGrid)();
    (0, import_ui.updateInterfaceWidth)();
    (0, import_ui.updateInterfaceHeight)();
    (0, import_ui.updateLoader)();
    (0, import_ui.updateToolbarVisibility)();
    (0, import_ui.updateActionIconColors)();
    if (!localStorage.getItem("printerCamsV2Consent")) {
      (0, import_recovery.showConsentModal)();
    } else {
      import_state.State.allowLocalStorage = true;
      const source = (0, import_recovery.loadFromLocalStorage)() ? "local" : "default";
      if (source === "default") {
        (0, import_state.loadCameras)(import_config.Config.defaultCameras);
        (0, import_cameras.renderCameraTable)(import_config.Config.defaultCameras);
      }
      (0, import_cameras.renderCameras)();
      setupNotificationActions();
      debouncedUpdateDividers();
    }
    import_elements.Elements.headerTextColorInput?.addEventListener("input", () => {
      (0, import_ui.updateHeader)();
      (0, import_ui.updateToolbarColors)();
    });
    const consentModal = document.getElementById("consentModal");
    if (consentModal && !consentModal.classList.contains("hidden")) {
      document.getElementById("loaderOverlay")?.classList.add("hidden");
    }
    if (typeof window.lucide !== "undefined") {
      window.lucide.createIcons();
    }
  }
  function setupNotificationActions() {
    const expandNotificationsBtn = document.getElementById("expandNotificationsBtn");
    const closeAllNotificationsBtn = document.getElementById("closeAllNotificationsBtn");
    const notificationActions = document.getElementById("notificationActions");
    if (expandNotificationsBtn) {
      expandNotificationsBtn.addEventListener("click", () => {
        const collapsed = (0, import_recovery.getCollapsedNotifications)();
        if (collapsed.length > 0) {
          collapsed.forEach((notification) => {
            (0, import_recovery.expandNotification)(notification);
          });
          notificationActions?.classList.remove("show");
        }
      });
    }
    if (closeAllNotificationsBtn) {
      closeAllNotificationsBtn.addEventListener("click", () => {
        (0, import_notifications.closeAllNotifications)();
        notificationActions?.classList.add("hidden");
      });
    }
  }
  setTimeout(() => {
    const loader = document.getElementById("loaderOverlay");
    if (loader && !loader.classList.contains("hidden")) {
      loader.classList.add("hidden");
    }
  }, 1e4);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

//# sourceMappingURL=app.js.map
