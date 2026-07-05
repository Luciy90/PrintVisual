src/client/app.ts (修改后)
// === CLIENT APP ENTRY POINT ===
// Main application initialization for 3D Printer Cameras interface

import { Config } from './config.js';
import { Elements } from './elements.js';
import { State, cameras, loadCameras, suppressNotifications, pendingRestores } from './state.js';
import { 
  updateHeader, 
  updateToolbarColors, 
  updateActionIconColors, 
  updateGrid,
  updateInterfaceWidth,
  updateInterfaceHeight,
  updateLoader,
  updateToolbarVisibility,
  updateCameraTitleFontSize,
  updateAntsVisibility,
  setDefaultInterfaceWidth
} from './ui.js';
import {
  renderCameraTable,
  renderCameras,
  addCamera,
  addDammy,
  onInputChange,
  deleteRow,
  reorderRows
} from './cameras.js';
import {
  enqueueNotification,
  animateAndRemoveNotification,
  closeAllNotifications,
  schedulePositionUpdate
} from './notifications.js';
import {
  readLocalAppSettings,
  hasMeaningfulSettings,
  syncSettingsToAppApi,
  hydrateSettingsFromAppApi
} from './settings.js';
import { debounce, throttle } from './utils.js';
import {
  showConsentModal,
  hideConsentModal,
  showHelpModal,
  hideHelpModal,
  showResetConfirmModal,
  hideResetConfirmModal,
  handleExportSettings,
  handleImportSettings,
  saveToLocalStorage,
  loadFromLocalStorage,
  resetSettingsToDefaults,
  applySettingsFromInputs,
  setupEventListeners,
  getCollapsedNotifications,
  expandNotification,
  updateHorizontalDividers,
  initDragAndDrop,
  initAccordion,
  handleFullscreenToggle,
  disableAllStreams,
  refreshCameras
} from './recovery.js';

// === ДЕБАУНС ФУНКЦИИ ===
const debouncedUpdateDividers = debounce(updateHorizontalDividers, 25);
const debouncedSave = debounce(saveToLocalStorage, 100);
const debouncedUpdateInterfaceWidth = debounce(updateInterfaceWidth, 15);
const debouncedUpdateInterfaceHeight = debounce(updateInterfaceHeight, 15);
const debouncedSaveOnDragEnd = debounce(saveToLocalStorage, 150);
const debouncedUpdateNotificationOpacity = debounce(() => {
  const opacityInput = Elements.notificationOpacityInput;
  if (!opacityInput) return;
  let opacityValue = parseFloat(opacityInput.value);
  if (isNaN(opacityValue) || opacityValue < 0 || opacityValue > 1) {
    opacityValue = 0.2;
  }
  const notifications = document.querySelectorAll('.notification');
  notifications.forEach(notification => {
    const isSystem = notification.classList.contains('system');
    const isError = notification.classList.contains('error');
    // Update opacity logic here
  });
}, 100);

// === ИНИЦИАЛИЗАЦИЯ ===
function init() {
  // Setup event listeners
  setupEventListeners();

  // Initial UI updates
  updateHeader();
  updateToolbarColors();
  updateGrid();
  updateInterfaceWidth();
  updateInterfaceHeight();
  updateLoader();
  updateToolbarVisibility();
  updateActionIconColors();

  // Check consent
  if (!localStorage.getItem('printerCamsV2Consent')) {
    showConsentModal();
  } else {
    State.allowLocalStorage = true;

    // Load settings
    const source = loadFromLocalStorage() ? 'local' : 'default';
    if (source === 'default') {
      loadCameras(Config.defaultCameras);
      renderCameraTable(Config.defaultCameras);
    }

    renderCameras();

    // Setup notification actions
    setupNotificationActions();

    debouncedUpdateDividers();
  }

  // Header text color change listener
  Elements.headerTextColorInput?.addEventListener('input', () => {
    updateHeader();
    updateToolbarColors();
  });

  // Hide loader if consent modal is shown
  const consentModal = document.getElementById('consentModal');
  if (consentModal && !consentModal.classList.contains('hidden')) {
    document.getElementById('loaderOverlay')?.classList.add('hidden');
  }

  // Initialize Lucide icons
  if (typeof (window as any).lucide !== 'undefined') {
    (window as any).lucide.createIcons();
  }
}

function setupNotificationActions() {
  const expandNotificationsBtn = document.getElementById('expandNotificationsBtn');
  const closeAllNotificationsBtn = document.getElementById('closeAllNotificationsBtn');
  const notificationActions = document.getElementById('notificationActions');

  if (expandNotificationsBtn) {
    expandNotificationsBtn.addEventListener('click', () => {
      const collapsed = getCollapsedNotifications();
      if (collapsed.length > 0) {
        collapsed.forEach((notification: Element) => {
          expandNotification(notification as HTMLElement);
        });
        notificationActions?.classList.remove('show');
      }
    });
  }

  if (closeAllNotificationsBtn) {
    closeAllNotificationsBtn.addEventListener('click', () => {
      closeAllNotifications();
      notificationActions?.classList.add('hidden');
    });
  }
}

// Auto-hide loader after timeout
setTimeout(() => {
  const loader = document.getElementById('loaderOverlay');
  if (loader && !loader.classList.contains('hidden')) {
    loader.classList.add('hidden');
  }
}, 10000);

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for potential external access
export {
  init,
  Config,
  Elements,
  State,
  cameras,
  loadCameras,
  renderCameras,
  renderCameraTable,
  addCamera,
  addDammy,
  saveToLocalStorage,
  updateActionIconColors,
  updateToolbarColors,
  updateHeader,
  updateGrid,
  updateInterfaceWidth,
  updateInterfaceHeight,
  enqueueNotification
};
