import { cameras } from './cameras.js';
import { Elements } from './elements.js';
import type { AppElements } from './elements.js';
import {
  hideImportExportPanel,
  showImportExportPanel
} from './modals.js';
import {
  createSettingsExportFile,
  importSettingsFile
} from './settingsTransfer.js';
import {
  applySettingsUiEffects,
  loadSettingsFromStorage,
  saveSettingsFromInputs
} from './settingsForm.js';
import type { StorageAdapter } from './storage.js';
import {
  updateActionIconColors,
  updateAntsVisibility,
  updateCameraTitleFontSize,
  updateGrid,
  updateHeader,
  updateInterfaceWidth,
  updateLoader,
  updateToolbarColors,
  updateToolbarVisibility
} from './ui.js';

export type Cleanup = () => void;

export interface SettingsEventsOptions {
  elements?: AppElements;
  storage?: StorageAdapter;
  onApply?(): void;
  onImported?(): void;
  onError?(message: string): void;
}

function createDebounced(callback: () => void, delay: number): Cleanup & { trigger(): void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const cancel = (): void => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };
  cancel.trigger = (): void => {
    cancel();
    timer = setTimeout(() => {
      timer = null;
      callback();
    }, delay);
  };
  return cancel;
}

export function showSettingsChangedNotification(document: Document): void {
  const notification = document.getElementById('settingsChangedNotification');
  if (!notification) return;
  notification.classList.remove('hidden');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      notification.style.transform = 'translateY(10px)';
      notification.style.opacity = '1';
    });
  });
}

export function hideSettingsChangedNotification(document: Document): void {
  const notification = document.getElementById('settingsChangedNotification');
  if (!notification) return;
  notification.style.transform = 'translateY(-80px)';
  notification.style.opacity = '0';
  notification.addEventListener(
    'transitionend',
    () => notification.classList.add('hidden'),
    { once: true }
  );
}

function createDownload(content: string, filename: string, document: Document): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function initializeSettingsEvents(options: SettingsEventsOptions = {}): Cleanup {
  const elements = options.elements ?? Elements;
  const storage = options.storage ?? localStorage;
  const document = elements.settingsPanel?.ownerDocument ?? globalThis.document;
  const cleanups: Cleanup[] = [];
  const saveDebounced = createDebounced(() => {
    saveSettingsFromInputs(elements, storage);
  }, 100);

  const listen = <T extends Event>(
    target: EventTarget | null,
    type: string,
    listener: (event: T) => void
  ): void => {
    if (!target) return;
    const typedListener: EventListener = event => listener(event as T);
    target.addEventListener(type, typedListener);
    cleanups.push(() => target.removeEventListener(type, typedListener));
  };

  const markChanged = (): void => showSettingsChangedNotification(document);
  const saveAndMark = (): void => {
    markChanged();
    saveDebounced.trigger();
  };

  if (elements.settingsPanel) {
    const settingsInputs = elements.settingsPanel.querySelectorAll<HTMLElement>(
      'input, select, .accordion-checkbox'
    );
    settingsInputs.forEach(input => {
      listen(input, 'input', markChanged);
      listen(input, 'change', markChanged);
      listen(input, 'blur', markChanged);
    });
  }

  const closeNotification = document.getElementById('closeNotificationBtn');
  listen(elements.applyChangesBtn, 'click', () => {
    saveSettingsFromInputs(elements, storage);
    hideSettingsChangedNotification(document);
    options.onApply?.();
  });
  listen(closeNotification, 'click', () => hideSettingsChangedNotification(document));

  listen(elements.color1Input, 'input', () => {
    updateToolbarColors();
    if (!document.fullscreenElement) updateActionIconColors();
    saveAndMark();
  });
  listen(elements.color2Input, 'input', () => {
    updateToolbarColors();
    if (!document.fullscreenElement) updateActionIconColors();
    saveAndMark();
  });
  listen(elements.colorIntOverInput, 'input', saveAndMark);

  listen(elements.gridColumnsInput, 'input', () => {
    updateGrid();
    updateAntsVisibility();
    saveAndMark();
  });
  listen(elements.interfaceWidthInput, 'input', event => {
    const input = event.currentTarget as HTMLInputElement;
    const value = Number.parseInt(input.value, 10);
    if (Number.isNaN(value)) return;
    input.value = String(Math.min(Math.max(value, 800), 1920));
    updateInterfaceWidth();
    saveAndMark();
  });
  listen(elements.namedDrivInput, 'input', event => {
    const input = event.currentTarget as HTMLInputElement;
    if (elements.namedDrivValue) elements.namedDrivValue.textContent = `${input.value}rem`;
    updateCameraTitleFontSize();
    saveAndMark();
  });
  listen(elements.dividerWidthInput, 'input', event => {
    const input = event.currentTarget as HTMLInputElement;
    if (elements.dividerWidthValue) elements.dividerWidthValue.textContent = `${input.value}%`;
    saveAndMark();
  });
  [
    elements.enableDividersCheckbox,
    elements.dividerColorInput,
    elements.dividerThicknessInput,
    elements.dividerAlignInput,
    elements.enableWidthInputCheckbox,
    elements.errorNotificationColorInput,
    elements.notificationOpacityInput
  ].forEach(input => listen(input, 'input', saveAndMark));

  [
    elements.headerTextInput,
    elements.headerBgColorInput,
    elements.headerBgOpacityInput,
    elements.headerTextColorInput
  ].forEach(input =>
    listen(input, 'input', () => {
      updateHeader();
      updateToolbarColors();
      saveAndMark();
    })
  );
  listen(elements.hideHeaderCheckbox, 'change', () => {
    updateHeader();
    updateToolbarVisibility();
    saveAndMark();
  });
  [
    elements.hideLoaderCheckbox,
    elements.loaderBgColorInput,
    elements.loaderOpacityInput,
    elements.offFullCheckbox
  ].forEach(input =>
    listen(input, 'input', () => {
      updateLoader();
      saveAndMark();
    })
  );
  listen(elements.hideNotificationCheckbox, 'change', saveAndMark);

  const importPanel =
    elements.importExportBlock &&
    elements.importExportBtnBlock &&
    elements.applyChangesBtn &&
    elements.resetSettingsBtn
      ? {
          panel: elements.importExportBlock,
          buttonBlock: elements.importExportBtnBlock,
          applyButton: elements.applyChangesBtn,
          resetButton: elements.resetSettingsBtn
        }
      : null;

  if (importPanel) {
    listen(elements.showImportExportBtn, 'click', () => showImportExportPanel(importPanel));
    listen(elements.closeImportExportBtn, 'click', () => hideImportExportPanel(importPanel));
  }

  const reportImportError = (): void => {
    options.onError?.('Не удалось импортировать настройки: проверьте формат файла.');
  };
  const handleImport = async (file: File): Promise<void> => {
    try {
      await importSettingsFile(file, storage);
      loadSettingsFromStorage(elements, storage);
      applySettingsUiEffects();
      if (importPanel) hideImportExportPanel(importPanel);
      options.onImported?.();
    } catch {
      reportImportError();
    }
  };

  listen(elements.importFile, 'change', event => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    void handleImport(file);
    input.value = '';
  });
  const dropzone = elements.importExportBlock?.querySelector<HTMLElement>('.dropzone') ?? null;
  listen(dropzone, 'dragover', event => {
    event.preventDefault();
    dropzone?.classList.add('dragover');
  });
  listen(dropzone, 'dragleave', event => {
    event.preventDefault();
    dropzone?.classList.remove('dragover');
  });
  listen(dropzone, 'drop', event => {
    event.preventDefault();
    dropzone?.classList.remove('dragover');
    const file = (event as DragEvent).dataTransfer?.files[0];
    if (file) void handleImport(file);
  });

  listen(elements.exportBtn, 'click', () => {
    try {
      const file = createSettingsExportFile(storage, cameras);
      createDownload(file.content, file.filename, document);
    } catch {
      options.onError?.('Не удалось подготовить файл экспорта.');
    }
  });

  return () => {
    saveDebounced();
    cleanups.forEach(cleanup => cleanup());
  };
}
