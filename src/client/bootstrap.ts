import { initializeCameraGrid } from './cameraGrid.js';
import { initializeCameraActions } from './cameraActions.js';
import { setCameraRenderer } from './cameras.js';
import { Elements } from './elements.js';
import {
  initializeConsentModal,
  initializeHelpModal,
  initializeResetModal
} from './modals.js';
import { initializeSettingsEvents } from './settingsEvents.js';
import { initializeSettingsPanel } from './settingsPanel.js';
import {
  applyDefaultSettings,
  loadSettingsFromStorage
} from './settingsForm.js';
import { hydrateSettingsFromAppApi } from './settings.js';
import { State } from './state.js';

export type Cleanup = () => void;

export async function initializePrintVisualClient(): Promise<Cleanup> {
  const cleanups: Cleanup[] = [];
  await hydrateSettingsFromAppApi();

  const grid = initializeCameraGrid();
  setCameraRenderer(grid?.render ?? null);
  const renderGrid = (): void => grid?.render();
  const loadOrDefaults = (): void => {
    if (!loadSettingsFromStorage()) applyDefaultSettings();
    renderGrid();
  };

  const panel = initializeSettingsPanel();
  if (panel) cleanups.push(panel.cleanup);
  cleanups.push(initializeCameraActions());

  cleanups.push(
    initializeSettingsEvents({
      onApply: renderGrid,
      onImported: renderGrid,
      onError: message => window.alert(message)
    })
  );

  if (Elements.helpModal && Elements.modalDialog && Elements.helpBtn && Elements.closeHelpBtn) {
    cleanups.push(
      initializeHelpModal({
        root: Elements.helpModal,
        dialog: Elements.modalDialog,
        openButton: Elements.helpBtn,
        closeButton: Elements.closeHelpBtn
      })
    );
  }

  if (
    Elements.resetConfirmModal &&
    Elements.resetSettingsBtn &&
    Elements.cancelResetBtn &&
    Elements.confirmResetBtn
  ) {
    cleanups.push(
      initializeResetModal({
        root: Elements.resetConfirmModal,
        openButton: Elements.resetSettingsBtn,
        cancelButton: Elements.cancelResetBtn,
        confirmButton: Elements.confirmResetBtn,
        storage: localStorage,
        beforeOpen: () => panel?.close(),
        afterReset: () => window.location.reload()
      })
    );
  }

  if (Elements.consentModal && Elements.allowConsentBtn && Elements.denyConsentBtn) {
    cleanups.push(
      initializeConsentModal({
        root: Elements.consentModal,
        allowButton: Elements.allowConsentBtn,
        denyButton: Elements.denyConsentBtn,
        loader: document.getElementById('loaderOverlay'),
        storage: localStorage,
        state: State,
        toggleSections: showStart => {
          document
            .querySelectorAll<HTMLElement>('section[id="Start"]')
            .forEach(section => section.classList.toggle('hidden', !showStart));
          document
            .querySelectorAll<HTMLElement>('section[id="End"]')
            .forEach(section => section.classList.toggle('hidden', showStart));
        },
        onAccepted: loadOrDefaults,
        onDenied: () => window.location.assign('print%20.html'),
        onError: () => window.alert('Не удалось загрузить настройки.')
      })
    );
  } else {
    State.allowLocalStorage = true;
    loadOrDefaults();
  }

  return () => {
    cleanups.forEach(cleanup => cleanup());
    setCameraRenderer(null);
    grid?.cleanup();
  };
}
