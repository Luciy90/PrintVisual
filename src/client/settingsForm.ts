import { cameras, loadCameras } from './cameras.js';
import { Config } from './config.js';
import { Elements } from './elements.js';
import type { AppElements } from './elements.js';
import { State } from './state.js';
import {
  APP_SETTINGS_KEY,
  readBrowserAppSettings
} from './storage.js';
import type {
  BrowserAppSettings,
  StorageAdapter
} from './storage.js';
import { syncSettingsToAppApi } from './settings.js';
import {
  updateActionIconColors,
  updateGrid,
  updateHeader,
  updateInterfaceHeight,
  updateInterfaceWidth,
  updateLoader,
  updateNotificationOpacity,
  updateToolbarColors,
  updateToolbarVisibility
} from './ui.js';

function inputValue(value: string | number | undefined, fallback: string | number): string {
  return String(value ?? fallback);
}

export function collectSettingsFromInputs(
  elements: AppElements = Elements,
  storage: StorageAdapter = localStorage
): BrowserAppSettings | null {
  const {
    namedDrivInput,
    color1Input,
    color2Input,
    colorIntOverInput,
    errorNotificationColorInput,
    systemNotificationColorInput,
    notificationOpacityInput,
    hideLoaderCheckbox,
    loaderBgColorInput,
    loaderOpacityInput,
    offFullCheckbox,
    enableDividersCheckbox,
    dividerColorInput,
    dividerThicknessInput,
    dividerAlignInput,
    dividerWidthInput,
    gridColumnsInput,
    headerTextInput,
    hideHeaderCheckbox,
    headerBgColorInput,
    headerBgOpacityInput,
    headerTextColorInput,
    interfaceWidthInput,
    interfaceHeightInput,
    enableWidthInputCheckbox
  } = elements;

  if (
    !namedDrivInput ||
    !color1Input ||
    !color2Input ||
    !colorIntOverInput ||
    !errorNotificationColorInput ||
    !systemNotificationColorInput ||
    !notificationOpacityInput ||
    !hideLoaderCheckbox ||
    !loaderBgColorInput ||
    !loaderOpacityInput ||
    !offFullCheckbox ||
    !enableDividersCheckbox ||
    !dividerColorInput ||
    !dividerThicknessInput ||
    !dividerAlignInput ||
    !dividerWidthInput ||
    !gridColumnsInput ||
    !headerTextInput ||
    !hideHeaderCheckbox ||
    !headerBgColorInput ||
    !headerBgOpacityInput ||
    !headerTextColorInput ||
    !interfaceWidthInput ||
    !interfaceHeightInput ||
    !enableWidthInputCheckbox
  ) {
    return null;
  }

  const previous = readBrowserAppSettings(storage);
  const toolbarIconRgb = updateActionIconColors();

  return {
    cameraOrder: cameras.map(camera => ({ ...camera })),
    color1: color1Input.value,
    color2: color2Input.value,
    colorIntOver: colorIntOverInput.value,
    errorNotificationColor: errorNotificationColorInput.value,
    systemNotificationColor: systemNotificationColorInput.value,
    notificationOpacity: notificationOpacityInput.value,
    ...(toolbarIconRgb ? { toolbarIconRgb } : {}),
    loader: {
      hide: hideLoaderCheckbox.checked,
      bgColor: loaderBgColorInput.value,
      opacity: loaderOpacityInput.value,
      offFullCheckbox: offFullCheckbox.checked
    },
    hideNotifications: elements.hideNotificationCheckbox?.checked ?? false,
    grid: {
      columns: Number.parseInt(gridColumnsInput.value, 10)
    },
    header: {
      text: headerTextInput.value,
      hidden: hideHeaderCheckbox.checked,
      bgColor: headerBgColorInput.value,
      bgOpacity: headerBgOpacityInput.value,
      textColor: headerTextColorInput.value
    },
    dividerColor: dividerColorInput.value,
    dividerThickness: dividerThicknessInput.value,
    dividerAlign: dividerAlignInput.value,
    dividerWidth: dividerWidthInput.value,
    enableDividers: enableDividersCheckbox.checked,
    namedDriv: namedDrivInput.value,
    interfaceWidth: interfaceWidthInput.value,
    interfaceHeight: interfaceHeightInput.value,
    enableWidthInput: enableWidthInputCheckbox.checked,
    streamToggles: previous?.streamToggles ?? {}
  };
}

export function saveSettingsFromInputs(
  elements: AppElements = Elements,
  storage: StorageAdapter = localStorage
): BrowserAppSettings | null {
  if (!State.allowLocalStorage) return null;
  const settings = collectSettingsFromInputs(elements, storage);
  if (!settings) return null;

  storage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
  syncSettingsToAppApi(settings);
  return settings;
}

export function applySettingsToInputs(
  settings: BrowserAppSettings,
  elements: AppElements = Elements
): void {
  const defaults = Config.defaultSettings;
  const loader = settings.loader ?? defaults.loader;
  const grid = settings.grid ?? defaults.grid;
  const header = settings.header ?? defaults.header;

  if (elements.color1Input) elements.color1Input.value = settings.color1 ?? defaults.color1;
  if (elements.color2Input) elements.color2Input.value = settings.color2 ?? defaults.color2;
  if (elements.colorIntOverInput) {
    elements.colorIntOverInput.value = inputValue(settings.colorIntOver, defaults.colorIntOver);
  }
  if (elements.errorNotificationColorInput) {
    elements.errorNotificationColorInput.value =
      settings.errorNotificationColor ?? defaults.errorNotificationColor;
  }
  if (elements.systemNotificationColorInput) {
    elements.systemNotificationColorInput.value =
      settings.systemNotificationColor ?? defaults.systemNotificationColor;
  }
  if (elements.notificationOpacityInput) {
    elements.notificationOpacityInput.value =
      inputValue(settings.notificationOpacity, defaults.notificationOpacity);
  }
  if (elements.hideLoaderCheckbox) {
    elements.hideLoaderCheckbox.checked = loader.hide ?? defaults.loader.hide;
  }
  if (elements.loaderBgColorInput) {
    elements.loaderBgColorInput.value = loader.bgColor ?? defaults.loader.bgColor;
  }
  if (elements.loaderOpacityInput) {
    elements.loaderOpacityInput.value = inputValue(loader.opacity, defaults.loader.opacity);
  }
  if (elements.offFullCheckbox) {
    elements.offFullCheckbox.checked = loader.offFullCheckbox ?? defaults.loader.offFullCheckbox;
  }
  if (elements.hideNotificationCheckbox) {
    elements.hideNotificationCheckbox.checked =
      settings.hideNotifications ?? defaults.hideNotifications;
  }
  if (elements.gridColumnsInput) {
    elements.gridColumnsInput.value = String(grid.columns ?? defaults.grid.columns);
  }
  if (elements.headerTextInput) {
    elements.headerTextInput.value = header.text ?? defaults.header.text;
  }
  if (elements.hideHeaderCheckbox) {
    elements.hideHeaderCheckbox.checked = header.hidden ?? defaults.header.hidden;
  }
  if (elements.headerBgColorInput) {
    elements.headerBgColorInput.value = header.bgColor ?? defaults.header.bgColor;
  }
  if (elements.headerBgOpacityInput) {
    elements.headerBgOpacityInput.value = inputValue(header.bgOpacity, defaults.header.bgOpacity);
  }
  if (elements.headerTextColorInput) {
    elements.headerTextColorInput.value = header.textColor ?? defaults.header.textColor;
  }

  const interfaceWidth = inputValue(settings.interfaceWidth, defaults.interfaceWidth);
  if (elements.interfaceWidth) elements.interfaceWidth.value = interfaceWidth;
  if (elements.interfaceWidthInput) elements.interfaceWidthInput.value = interfaceWidth;

  const interfaceHeight = inputValue(settings.interfaceHeight, defaults.interfaceHeight);
  if (elements.interfaceHeight) elements.interfaceHeight.value = interfaceHeight;
  if (elements.interfaceHeightInput) elements.interfaceHeightInput.value = interfaceHeight;

  if (elements.enableWidthInputCheckbox) {
    elements.enableWidthInputCheckbox.checked = settings.enableWidthInput ?? defaults.enableWidthInput;
  }
  if (elements.dividerColorInput) {
    elements.dividerColorInput.value = settings.dividerColor ?? defaults.dividerColor;
  }
  if (elements.dividerThicknessInput) {
    elements.dividerThicknessInput.value = inputValue(
      settings.dividerThickness,
      defaults.dividerThickness
    );
  }
  if (elements.dividerAlignInput) {
    elements.dividerAlignInput.value = settings.dividerAlign ?? defaults.dividerAlign;
  }
  const dividerWidth = inputValue(settings.dividerWidth, defaults.dividerWidth);
  if (elements.dividerWidthInput) elements.dividerWidthInput.value = dividerWidth;
  if (elements.dividerWidthValue) elements.dividerWidthValue.textContent = `${dividerWidth}%`;
  if (elements.enableDividersCheckbox) {
    elements.enableDividersCheckbox.checked =
      settings.enableDividers ?? defaults.enableDividers;
  }

  const namedDriv = inputValue(settings.namedDriv, defaults.namedDriv);
  if (elements.namedDrivInput) elements.namedDrivInput.value = namedDriv;
  if (elements.namedDrivValue) elements.namedDrivValue.textContent = `${namedDriv}rem`;
}

export function applySettingsUiEffects(): void {
  updateNotificationOpacity();
  updateHeader();
  updateGrid();
  updateInterfaceWidth();
  updateInterfaceHeight();
  updateToolbarVisibility();
  updateToolbarColors();
  updateLoader();
}

export function loadSettingsFromStorage(
  elements: AppElements = Elements,
  storage: StorageAdapter = localStorage
): BrowserAppSettings | null {
  const settings = readBrowserAppSettings(storage);
  if (!settings) return null;

  if (settings.cameraOrder) loadCameras(settings.cameraOrder);
  applySettingsToInputs(settings, elements);
  applySettingsUiEffects();
  return settings;
}

export function applyDefaultSettings(elements: AppElements = Elements): void {
  loadCameras(Config.defaultCameras);
  applySettingsToInputs(Config.defaultSettings, elements);
  applySettingsUiEffects();
}
