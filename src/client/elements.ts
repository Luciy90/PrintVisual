export interface AppElements {
  // Containers
  cameraContainer: HTMLElement | null;
  settingsPanel: HTMLElement | null;
  mainInterfaceContainer: HTMLElement | null;
  mainInterfaceContainerCameras: HTMLElement | null;

  // Buttons
  openSettingsBtn: HTMLElement | null;
  closeSettingsBtn: HTMLElement | null;
  disableAllStreamsBtn: HTMLElement | null;
  refreshCamerasBtn: HTMLElement | null;
  applyChangesBtn: HTMLElement | null;
  resetSettingsBtn: HTMLElement | null;
  helpBtn: HTMLElement | null;
  savePositionBtn: HTMLElement | null;
  recoverPrinterIpsBtn: HTMLElement | null;
  addCameraBtn: HTMLElement | null;
  addDammyCameraBtn: HTMLElement | null;
  consetModalBtn: HTMLElement | null;
  consetModalCloseBtn: HTMLElement | null;
  allowConsentBtn: HTMLElement | null;
  denyConsentBtn: HTMLElement | null;
  confirmResetBtn: HTMLElement | null;
  cancelResetBtn: HTMLElement | null;
  closeHelpBtn: HTMLElement | null;

  // Inputs
  gridColumnsInput: HTMLInputElement | null;
  color1Input: HTMLInputElement | null;
  color2Input: HTMLInputElement | null;
  colorIntOverInput: HTMLInputElement | null;
  errorNotificationColorInput: HTMLInputElement | null;
  systemNotificationColorInput: HTMLInputElement | null;
  notificationOpacityInput: HTMLInputElement | null;
  headerTextInput: HTMLInputElement | null;
  hideHeaderCheckbox: HTMLInputElement | null;
  headerBgColorInput: HTMLInputElement | null;
  headerBgOpacityInput: HTMLInputElement | null;
  headerTextColorInput: HTMLInputElement | null;
  interfaceWidth: HTMLInputElement | null;
  interfaceWidthInput: HTMLInputElement | null;
  interfaceWidthValue: HTMLElement | null;
  enableWidthInputCheckbox: HTMLInputElement | null;
  interfaceHeight: HTMLInputElement | null;
  interfaceHeightInput: HTMLInputElement | null;
  interfaceHeightValue: HTMLElement | null;
  dividerColorInput: HTMLInputElement | null;
  dividerThicknessInput: HTMLInputElement | null;
  dividerAlignInput: HTMLInputElement | null;
  dividerWidthInput: HTMLInputElement | null;
  dividerWidthValue: HTMLElement | null;
  namedDrivInput: HTMLInputElement | null;
  namedDrivValue: HTMLElement | null;
  enableDividersCheckbox: HTMLInputElement | null;
  hideLoaderCheckbox: HTMLInputElement | null;
  hideNotificationCheckbox: HTMLInputElement | null;
  loaderBgColorInput: HTMLInputElement | null;
  loaderOpacityInput: HTMLInputElement | null;
  offFullCheckbox: HTMLInputElement | null;

  // Экспорт/импорт
  exportBtn: HTMLElement | null;
  importFile: HTMLInputElement | null;
  importExportBlock: HTMLElement | null;
  importExportBtnBlock: HTMLElement | null;
  showImportExportBtn: HTMLElement | null;
  closeImportExportBtn: HTMLElement | null;

  // Меню сетки в настройках
  mainWrap: HTMLElement | null;
  openBtn: HTMLElement | null;
  modal: HTMLElement | null;
  modalHolder: HTMLElement | null;
  tableWrapper: HTMLElement | null;
  tbody: HTMLElement | null;
  indicator: HTMLElement | null;
  ipRecoveryStatus: HTMLElement | null;
  ipRecoveryStatusText: HTMLElement | null;
  ipRecoveryPercent: HTMLElement | null;
  ipRecoveryProgressBar: HTMLElement | null;

  // Others
  overlay: HTMLElement | null;
  mainHeader: HTMLElement | null;
  headerBar: HTMLElement | null;
  headerTitle: HTMLElement | null;
  notificationContainer: HTMLElement | null;
  consentModal: HTMLElement | null;
  resetConfirmModal: HTMLElement | null;
  toolbar: HTMLElement | null;
  toolbarContainer: HTMLElement | null;
  helpModal: HTMLElement | null;
  modalDialog: HTMLElement | null;
  accordionList: HTMLElement | null;
}

export const Elements: AppElements = {
  // Containers
  cameraContainer: document.getElementById('cameraContainer'),
  settingsPanel: document.getElementById('settingsPanel'),
  mainInterfaceContainer: document.getElementById('mainInterfaceContainer'),
  mainInterfaceContainerCameras: document.getElementById('mainInterfaceContainerCameras'),

  // Buttons
  openSettingsBtn: document.getElementById('openSettingsBtn'),
  closeSettingsBtn: document.getElementById('closeSettingsBtn'),
  disableAllStreamsBtn: document.getElementById('disableAllStreamsBtn'),
  refreshCamerasBtn: document.getElementById('refreshCamerasBtn'),
  applyChangesBtn: document.getElementById('applyChangesBtn'),
  resetSettingsBtn: document.getElementById('resetSettingsBtn'),
  helpBtn: document.getElementById('helpBtn'),
  savePositionBtn: document.getElementById('savePositionBtn'),
  recoverPrinterIpsBtn: document.getElementById('recoverPrinterIpsBtn'),
  addCameraBtn: document.getElementById('addCameraBtn'),
  addDammyCameraBtn: document.getElementById('addDammyCameraBtn'),
  consetModalBtn: document.getElementById('consetModalBtn'),
  consetModalCloseBtn: document.getElementById('consetModalCloseBtn'),
  allowConsentBtn: document.getElementById('allowConsentBtn'),
  denyConsentBtn: document.getElementById('denyConsentBtn'),
  confirmResetBtn: document.getElementById('confirmResetBtn'),
  cancelResetBtn: document.getElementById('cancelResetBtn'),
  closeHelpBtn: document.getElementById('closeHelpModal'),

  // Inputs
  gridColumnsInput: document.getElementById('gridColumns') as HTMLInputElement,
  color1Input: document.getElementById('color1') as HTMLInputElement,
  color2Input: document.getElementById('color2') as HTMLInputElement,
  colorIntOverInput: document.getElementById('colorIntOver') as HTMLInputElement,
  errorNotificationColorInput: document.getElementById('errorNotificationColor') as HTMLInputElement,
  systemNotificationColorInput: document.getElementById('systemNotificationColor') as HTMLInputElement,
  notificationOpacityInput: document.getElementById('notificationOpacity') as HTMLInputElement,
  headerTextInput: document.getElementById('headerText') as HTMLInputElement,
  hideHeaderCheckbox: document.getElementById('hideHeaderCheckbox') as HTMLInputElement,
  headerBgColorInput: document.getElementById('headerBgColor') as HTMLInputElement,
  headerBgOpacityInput: document.getElementById('headerBgOpacity') as HTMLInputElement,
  headerTextColorInput: document.getElementById('headerTextColor') as HTMLInputElement,
  interfaceWidth: document.getElementById('interfaceWidth') as HTMLInputElement,
  interfaceWidthInput: document.getElementById('interfaceWidthInput') as HTMLInputElement,
  interfaceWidthValue: document.getElementById('interfaceWidthValue'),
  enableWidthInputCheckbox: document.getElementById('enableWidthInputCheckbox') as HTMLInputElement,
  interfaceHeight: document.getElementById('interfaceHight') as HTMLInputElement,
  interfaceHeightInput: document.getElementById('interfaceHightInput') as HTMLInputElement,
  interfaceHeightValue: document.getElementById('interfaceHeightValue'),
  dividerColorInput: document.getElementById('dividerColor') as HTMLInputElement,
  dividerThicknessInput: document.getElementById('dividerThickness') as HTMLInputElement,
  dividerAlignInput: document.getElementById('dividerAlign') as HTMLInputElement,
  dividerWidthInput: document.getElementById('dividerWidth') as HTMLInputElement,
  dividerWidthValue: document.getElementById('dividerWidthValue'),
  namedDrivInput: document.getElementById('namedDriv') as HTMLInputElement,
  namedDrivValue: document.getElementById('namedDrivValue'),
  enableDividersCheckbox: document.getElementById('enableDividersCheckbox') as HTMLInputElement,
  hideLoaderCheckbox: document.getElementById('hideLoaderCheckbox') as HTMLInputElement,
  hideNotificationCheckbox: document.getElementById('hideNotificationCheckbox') as HTMLInputElement,
  loaderBgColorInput: document.getElementById('loaderBgColor') as HTMLInputElement,
  loaderOpacityInput: document.getElementById('loaderOpacity') as HTMLInputElement,
  offFullCheckbox: document.getElementById('offFullCheckbox') as HTMLInputElement,

  // Экспорт/импорт
  exportBtn: document.getElementById('exportBtn'),
  importFile: document.getElementById('importFile') as HTMLInputElement,
  importExportBlock: document.getElementById('importExportBlock'),
  importExportBtnBlock: document.getElementById('importExportBtnBlock'),
  showImportExportBtn: document.getElementById('showImportExportBtn'),
  closeImportExportBtn: document.getElementById('closeImportExportBtn'),

  // Меню сетки в настройках
  mainWrap:document.getElementById('mainSectionWrap'),
  openBtn:document.getElementById('openSettingsBtnModal'),
  modal:document.getElementById('settingsModal'),
  modalHolder:document.getElementById('modalHolder'),
  tableWrapper:document.getElementById('tableWrapper'),
  tbody:document.getElementById('camerasTableBody'),
  indicator: document.getElementById('dropIndicator'),
  ipRecoveryStatus: document.getElementById('ipRecoveryStatus'),
  ipRecoveryStatusText: document.getElementById('ipRecoveryStatusText'),
  ipRecoveryPercent: document.getElementById('ipRecoveryPercent'),
  ipRecoveryProgressBar: document.getElementById('ipRecoveryProgressBar'),

  // Others
  overlay: document.getElementById('overlay'),
  mainHeader: document.getElementById('mainHeader'),
  headerBar: document.getElementById('headerBar'),
  headerTitle: document.getElementById('headerTitle'),
  notificationContainer: document.getElementById('notificationContainer'),
  consentModal: document.getElementById('consentModal'),
  resetConfirmModal: document.getElementById('resetConfirmModal'),
  toolbar: document.getElementById('toolbar'),
  toolbarContainer: document.getElementById('toolbarContainer'),
  helpModal: document.getElementById('helpModal'),
  modalDialog: document.getElementById('modalDialog'),
  accordionList: document.getElementById('accordionList'),
};
