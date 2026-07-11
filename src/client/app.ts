// Strict modular client migration surface.
//
// The production browser bundle is still built from app.legacy-extracted.ts.
// Keep this module side-effect free until all legacy initialization and event
// handling has been migrated and verified against the legacy runtime.

export { Config } from './config.js';
export { Elements } from './elements.js';
export { State, TaskState, pendingRestores, suppressNotifications } from './state.js';

export type { Camera } from './cameras.js';
export {
  cameras,
  normalizeCameraData,
  loadCameras,
  addCamera,
  addDammy,
  onInputChange,
  deleteRow,
  reorderRows,
  renderCameraTable,
  renderCameras
} from './cameras.js';

export {
  animateHeight,
  updateHeader,
  updateToolbarColors,
  updateActionIconColors,
  updateNotificationOpacity,
  updateGrid,
  updateInterfaceWidth,
  updateInterfaceHeight,
  setDefaultInterfaceWidth,
  updateLoader,
  updateToolbarVisibility,
  updateCameraTitleFontSize,
  updateAntsVisibility
} from './ui.js';

export {
  enqueueNotification,
  animateAndRemoveNotification,
  closeAllNotifications,
  schedulePositionUpdate,
  expandNotification
} from './notifications.js';

export {
  readLocalAppSettings,
  hasMeaningfulSettings,
  syncSettingsToAppApi,
  hydrateSettingsFromAppApi
} from './settings.js';

export {
  importSettingsFile,
  createSettingsExportFile
} from './settingsTransfer.js';

export {
  initializeHelpModal,
  initializeConsentModal,
  initializeResetModal,
  showImportExportPanel,
  hideImportExportPanel
} from './modals.js';

export {
  initializeSettingsEvents,
  showSettingsChangedNotification,
  hideSettingsChangedNotification
} from './settingsEvents.js';

export { initializeSettingsPanel } from './settingsPanel.js';

export { initializeCameraFullscreen } from './cameraFullscreen.js';

export { initializeCameraGrid } from './cameraGrid.js';

export { initializeCameraActions } from './cameraActions.js';

export { initializePrintVisualClient } from './bootstrap.js';

export {
  normalizeMac,
  normalizePrinterAddress,
  extractIPv4,
  getSubnetPrefix,
  getScanSubnets,
  getStreamUrlForProbe,
  checkPrinterConnection,
  fetchPrinterMac,
  capturePrinterMacForCamera,
  capturePrinterMacForInput,
  scanSubnetsForPrinters,
  buildMacDiscoveryMap,
  matchSavedPrintersByMac,
  replaceAddressHost,
  applyIpReplacements,
  recoverPrinterIpsByMac
} from './recovery.js';