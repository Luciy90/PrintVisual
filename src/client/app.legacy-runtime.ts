// === CONFIGURATION ===
const Config = {
  defaultCameras: [
    { ip: '192.168.0.193', stream: '', name: 'ТкачМатерии' },
    { ip: '192.168.0.194', stream: '', name: 'КузницаСлоев' },
    { ip: '192.168.0.195', stream: '', name: 'Пластикоформовщик' }
  ],

  defaultSettings: {
    // Цветовая схема
    color1: '#667eea',
    color2: '#471b74',
    colorIntOver: 1.5,
    errorNotificationColor: '#ff4d4d',
    systemNotificationColor: '#4ade80',
    notificationOpacity: '0.3',

    // Загрузка
    loader: {
      hide: false,
      bgColor: '#111111',
      opacity: '1',
      offFullCheckbox: false
    },
    // Уведомления
    hideNotifications: false,

    // Сетка
    grid: {
      columns: 3
    },

    // Шапка
    header: {
      text: 'Активные принтера',
      hidden: false,
      bgColor: '#000000',
      bgOpacity: 0.4,
      textColor: '#ffffff'
    },

    // Разделители
    dividerColor: '#ba88e2',
    dividerThickness: 2,
    dividerAlign: 'center',
    dividerWidth: 96,
    enableDividers: false,

    // Размер текста
    namedDriv: 0.9,

    // Интерфейс
    interfaceWidth: 1400,
    interfaceHeight: 180,
    enableWidthInput: false
  },

  colors: {
    dammyColor: '#667eea',
    dammyColor2: '#471b74'
  },

  performance: {
    debounceDelay: 100,
    throttleDelay: 16,
    maxRetries: 3,
    retryDelay: 1000
  }
};


// Инициализация объекта Elements для доступа к DOM-элементам
const Elements = {
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
  gridColumnsInput: document.getElementById('gridColumns'),
  color1Input: document.getElementById('color1'),
  color2Input: document.getElementById('color2'),
  colorIntOverInput: document.getElementById('colorIntOver'),
  errorNotificationColorInput: document.getElementById('errorNotificationColor'),
  systemNotificationColorInput: document.getElementById('systemNotificationColor'),
  notificationOpacityInput: document.getElementById('notificationOpacity'),
  headerTextInput: document.getElementById('headerText'),
  hideHeaderCheckbox: document.getElementById('hideHeaderCheckbox'),
  headerBgColorInput: document.getElementById('headerBgColor'),
  headerBgOpacityInput: document.getElementById('headerBgOpacity'),
  headerTextColorInput: document.getElementById('headerTextColor'),
  interfaceWidth: document.getElementById('interfaceWidth'),
  interfaceWidthInput: document.getElementById('interfaceWidthInput'),
  interfaceWidthValue: document.getElementById('interfaceWidthValue'),
  enableWidthInputCheckbox: document.getElementById('enableWidthInputCheckbox'),
  interfaceHeight: document.getElementById('interfaceHight'),
  interfaceHeightInput: document.getElementById('interfaceHightInput'),
  interfaceHeightValue: document.getElementById('interfaceHightValue'),
  dividerColorInput: document.getElementById('dividerColor'),
  dividerThicknessInput: document.getElementById('dividerThickness'),
  dividerAlignInput: document.getElementById('dividerAlign'),
  dividerWidthInput: document.getElementById('dividerWidth'),
  dividerWidthValue: document.getElementById('dividerWidthValue'),
  namedDrivInput: document.getElementById('namedDriv'),
  namedDrivValue: document.getElementById('namedDrivValue'),
  enableDividersCheckbox: document.getElementById('enableDividersCheckbox'),
  hideLoaderCheckbox: document.getElementById('hideLoaderCheckbox'),
  hideNotificationCheckbox: document.getElementById('hideNotificationCheckbox'),
  loaderBgColorInput: document.getElementById('loaderBgColor'),
  loaderOpacityInput: document.getElementById('loaderOpacity'),
  offFullCheckbox: document.getElementById('offFullCheckbox'),

  // Экспорт/импорт
  exportBtn: document.getElementById('exportBtn'),
  importFile: document.getElementById('importFile'),
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
  indicator:document.getElementById('dropIndicator'),
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

// === STATE ===
let State = {
  floatingToolbar: null,
  allowLocalStorage: false,
  ipRecoveryBusy: false,
  disableAllStreamsBusy: false,
};
let suppressNotifications = false;
let pendingRestores = 0;


// === Дебаунс ===
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}
const debouncedUpdateDividers      = debounce(updateHorizontalDividers, 25);
const debouncedSave                = debounce(saveToLocalStorage,      100);
const debouncedUpdateInterfaceWidth = debounce(updateInterfaceWidth,    15);
const debouncedUpdateInterfaceHeight = debounce(updateInterfaceHeight,  15);
const debouncedSaveOnDragEnd       = debounce(saveToLocalStorage,      150);
const debouncedUpdateNotificationOpacity = debounce(updateNotificationOpacity, 100);

[Elements.color1Input, Elements.color2Input, Elements.errorNotificationColorInput,
 Elements.headerBgColorInput, Elements.dividerColorInput].forEach(input => {
    input.addEventListener('input', debouncedSave);
});
Elements.interfaceWidthInput.addEventListener('input', debouncedUpdateInterfaceWidth);
Elements.notificationOpacityInput.addEventListener('input', debouncedUpdateNotificationOpacity);

// === Троттлинг ===
function throttle(func, delay) {
  let lastCall = 0;
  let timeoutId;
  let lastArgs;

  return function throttled(...args) {
    const now = Date.now();
    const remaining = delay - (now - lastCall);

    lastArgs = args;
    if (remaining <= 0) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastCall = now;
      func.apply(this, args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        func.apply(this, lastArgs);
      }, remaining);
    }
  };
}
// === TASK SEQUENCE ===
let positionUpdateQueue = [];
let isProcessingQueue = false;
let notificationHeight = 48;
const POSITION_UPDATE_DELAY = 100; // мс

// === INITIALIZATION ===
function init() {
  setupEventListeners();
  updateHeader();
  updateToolbarColors()
  updateGrid();
  updateInterfaceWidth();
  updateInterfaceHeight();
  updateLoader();
  updateToolbarVisibility();
  updateActionIconColors();

  if (!localStorage.getItem('printerCamsV2Consent')) {
    showConsent();
  } else {
    State.allowLocalStorage = true;
    if (!loadFromLocalStorage()) {
      loadCameras(Config.defaultCameras);
      renderCameraTable(Config.defaultCameras);
    }
    renderCameras();
    // === NOTIFICATION BUTTON HANDLERS ===
    if (expandNotificationsBtn) {
      expandNotificationsBtn.addEventListener('click', () => {
        const collapsed = getCollapsedNotifications();
        if (collapsed.length > 0) {
          collapsed.forEach(notification => {
              expandNotification(notification);
          });
          notificationActions.classList.remove('show');
        }
    });
  }

    if (closeAllNotificationsBtn) {
      closeAllNotificationsBtn.addEventListener('click', () => {
        const allNotifications = document.querySelectorAll('.notification');
        allNotifications.forEach(notification => {
          if (!notification.classList.contains('fade-out-up')) {
            notification.classList.add('fade-out-up');
            notification.addEventListener('animationend', () => {
              _removeNotificationElement(notification);
            }, { once: true });
          }
        });
        notificationActions.classList.add('hidden');
      });
    }
    debouncedUpdateDividers();
  }

  Elements.headerTextColorInput.addEventListener('input', () => {
    updateHeader();
    updateToolbarColors();
  });
  const consentModal = document.getElementById('consentModal');
  if (consentModal && !consentModal.classList.contains('hidden')) {
    document.getElementById('loaderOverlay')?.classList.add('hidden');
  }
}

function updateToolbarColors() {
  const color1 = Elements.color1Input.value;
  const color2 = Elements.color2Input.value;
  const iColor = Elements.headerTextColorInput.value;

    // Конвертируем HEX → RGB
  const rgb1 = hexToRgbStr(color1);
  const rgb2 = hexToRgbStr(color2);
  const rgbi = hexToRgbStr(iColor);

  document.documentElement.style.setProperty('--base-color1', rgb1);
  document.documentElement.style.setProperty('--base-color2', rgb2);
  document.documentElement.style.setProperty('--toolbar-icon-color', rgbi);
}

// Для динамического изменения цвета кнопока
function updateActionIconColors() {
  const color1 = getComputedStyle(document.documentElement).getPropertyValue('--base-color1').trim();
  const color2 = getComputedStyle(document.documentElement).getPropertyValue('--base-color2').trim();

  const rgb1 = parseRGB(color1);
  const rgb2 = parseRGB(color2);

  if (!rgb1 || !rgb2) {
    console.error("Не удалось распарсить один из цветов.");
    return;
  }

  // Средний цвет
  const avgRgb = {
    r: Math.round((rgb1.r + rgb2.r) / 2),
    g: Math.round((rgb1.g + rgb2.g) / 2),
    b: Math.round((rgb1.b + rgb2.b) / 2)
  };

  document.documentElement.style.setProperty('--base-color-rgb', `${avgRgb.r} ${avgRgb.g} ${avgRgb.b}`);

  // Вычисляем HSV для среднего цвета
  const [h1, s1, v1] = rgbToHsv(avgRgb.r, avgRgb.g, avgRgb.b);

  // Определяем text-rgb на основе Value
  const textRgb = v1 < 70 ? '255 255 255' : '0 0 0';
  const textRgbW1 = v1 < 90 ? '255 255 255' : '0 0 0';
  const textRgbInvert = v1 < 70 ? '0 0 0' : '255 255 255';
  document.documentElement.style.setProperty('--text-rgb', textRgb);
  document.documentElement.style.setProperty('--textW1-rgb', textRgbW1);
  document.documentElement.style.setProperty('--textInvert-rgb', textRgbInvert);

  // Tetrad противоположные цвета
  const tetradColor1 = { r: Math.min(255, 255 - rgb1.r), g: Math.min(255, 255 - rgb1.g), b: Math.min(255, 255 - rgb1.b) };
  const tetradColor2 = { r: Math.min(255, 255 - rgb2.r), g: Math.min(255, 255 - rgb2.g), b: Math.min(255, 255 - rgb2.b) };

  document.documentElement.style.setProperty('--tetrad-color1-rgb', `${tetradColor1.r} ${tetradColor1.g} ${tetradColor1.b}`);
  document.documentElement.style.setProperty('--tetrad-color2-rgb', `${tetradColor2.r} ${tetradColor2.g} ${tetradColor2.b}`);

  // Получаем коэффициент для тонового сдвига
  const shiftFactor = parseFloat(document.getElementById('colorIntOver')?.value || '1.2');

  // Функция для изменения тона (светлее/темнее)
  function adjustTone(rgb, factor) {
    return {
      r: Math.min(255, Math.max(0, Math.round(rgb.r * factor + 0.5))),
      g: Math.min(255, Math.max(0, Math.round(rgb.g * factor + 0.5))),
      b: Math.min(255, Math.max(0, Math.round(rgb.b * factor + 0.5)))
    };
  }

  // Цветовые группы для генерации оттенков
  const colorGroups = {
    base1: rgb1,
    base2: rgb2,
    avg: avgRgb,
    tetrad1: tetradColor1,
    tetrad2: tetradColor2
  };

  // Генерация светлых и темных оттенков
  for (const [name, rgb] of Object.entries(colorGroups)) {
    const light = adjustTone(rgb, shiftFactor);
    const dark = adjustTone(rgb, 1 / shiftFactor);

    document.documentElement.style.setProperty(`--${name}-light-rgb`, `${light.r} ${light.g} ${light.b}`);
    document.documentElement.style.setProperty(`--${name}-dark-rgb`, `${dark.r} ${dark.g} ${dark.b}`);
  }

  // Преобразование в HSV для дополнительных модификаций
  const [h, s, v] = rgbToHsv(avgRgb.r, avgRgb.g, avgRgb.b);

  // Генерация новых цветов на основе HSV
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  const hsvShifts = {
    shiftedRightDark:   [clamp(h - 1, 0, 359), clamp(s + 5, 0, 100), clamp(v - 30, 0, 100)],
    shiftedLightWight:  [clamp(h - 5, 0, 359), clamp(s - 30, 0, 100), clamp(v + 5, 0, 100)],
    stickyHeader:       [clamp(h - 25, 0, 359), clamp(s - 10, 0, 100), clamp(v - 63, 0, 100)],
    scrollableTableH:   [clamp(h + 10, 0, 359), clamp(s + 5, 0, 100), clamp(v + 5, 0, 100)],
    scrollableTableB:   [clamp(h - 10, 0, 359), clamp(s + 5, 0, 100), clamp(v + 5, 0, 100)],
    shedow:             [clamp(h + 25, 0, 359), clamp(s - 25, 0, 100), clamp(v + 65, 0, 100)],
  };

  // Конвертируем HSV обратно в RGB и устанавливаем CSS-переменные
  for (const [key, [hVal, sVal, vVal]] of Object.entries(hsvShifts)) {
    const rgb = hsvToRgb(hVal, sVal, vVal);
    document.documentElement.style.setProperty(`--${key}-rgb`, `${rgb[0]} ${rgb[1]} ${rgb[2]}`);
  }

  // Обновляем цвет иконок действий
  // Только применяем цвет, если не в полноэкранном режиме, чтобы не затрагивать toolbar
  if (!document.fullscreenElement) {
    document.querySelectorAll('.action-icon i, .action-icon svg').forEach(icon => {
      icon.style.color = `rgb(${avgRgb.r} ${avgRgb.g} ${avgRgb.b})`;
    });
  }
  return avgRgb;
}

// Вспомогательная функция для конвертации HEX в RGB
function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Вспомогательная функция для конвертации RGB → HSV
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;

  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // ахроматический
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return [h * 360, s * 100, v * 100];
}

function hexToRgbStr(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null; // Если не удалось распарсить цвет
  return `${rgb.r} ${rgb.g} ${rgb.b}`;
}

// Переводит HSV → RGB
function hsvToRgb(h, s, v) {
  h = h % 360;
  h = h < 0 ? 360 + h : h;
  h /= 60;
  s /= 100;
  v /= 100;

  const i = Math.floor(h);
  const f = h - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r, g, b;
  switch(i) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
    default: r = g = b = 0; break;
  }

  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255)
  ];
}

// Вспомогательная функция для парсинга строки "R G B"
function parseRGB(rgbStr) {
  const parts = rgbStr.split(/\s+/).map(Number);
  if (parts.length === 3 && parts.every(n => !isNaN(n) && n >= 0 && n <= 255)) {
    return { r: parts[0], g: parts[1], b: parts[2] };
  }
  return null;
}

// Отсдеживаем изменение прозрачности
function updateNotificationOpacity() {
  const opacityInput = Elements.notificationOpacityInput;
  let opacityValue = parseFloat(opacityInput.value);

  if (isNaN(opacityValue) || opacityValue < 0 || opacityValue > 1) {
    opacityValue = 0.2; // Значение по умолчанию
  }

  const notifications = document.querySelectorAll('.notification');

  notifications.forEach(notification => {
    const isSystem = notification.classList.contains('system');
    const isError = notification.classList.contains('error');
    const { color } = getNotificationStyles(isSystem || isError ? isSystem : false);

    const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!rgbaMatch) return;

    const [r, g, b] = rgbaMatch.slice(1, 4).map(Number);
    notification.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacityValue})`;
  });

  saveToLocalStorage();
}
// === EVENT LISTENERS ===

function setupEventListeners() {
  window.addEventListener('resize', debounce(() => {
    updateInterfaceWidth();
  }, 100));
  const notification = document.getElementById('settingsChangedNotification');

  // Все поля настроек
  const settingInputs = document.querySelectorAll(`#settingsPanel input, #settingsPanel select, .accordion-checkbox`);

  // Показываем уведомление
  function showSettingsChangedNotification() {
    const notification = document.getElementById('settingsChangedNotification');
    if (!notification) {
        return;
    }

    // Сначала удаляем класс hidden
    notification.classList.remove('hidden');
    
    // Используем requestAnimationFrame для гарантированной анимации
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        notification.style.transform = 'translateY(10px)';
        notification.style.opacity = '1';
      });
    });
  }

  function hideSettingsChangedNotification() {
    const notification = document.getElementById('settingsChangedNotification');
    if (!notification) return;

    notification.style.transform = 'translateY(-80px)';
    notification.style.opacity = '0';
    
    notification.addEventListener('transitionend', () => {
      notification.classList.add('hidden');
    }, { once: true });
  }

  // Подписываемся на изменения полей
  settingInputs.forEach(input => {
    // Используем несколько типов событий для надежности
    ['input', 'change', 'blur'].forEach(eventType => {
      input.addEventListener(eventType, () => {
        showSettingsChangedNotification();
      });
    });
  });

  // При нажатии на "Применить изменения"
  const applyChangesBtn = document.getElementById('applyChangesBtn');
  if (applyChangesBtn) {
    applyChangesBtn.addEventListener('click', () => {
      hideSettingsChangedNotification();
    });
  }

  // При нажатии на крестик уведомления в настройках
  const closeNotificationBtn = document.getElementById('closeNotificationBtn');
  if (closeNotificationBtn) {
    closeNotificationBtn.addEventListener('click', () => {
      hideSettingsChangedNotification();
    });
  }

  // Settings Panel
  // Слушатель нажания на кнопку settings
  Elements.openSettingsBtn.addEventListener('click', openPanel);
  Elements.closeSettingsBtn.addEventListener('click', closePanel);
  Elements.overlay.addEventListener('click', closePanel);
      document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePanel();
  });
  Elements.settingsPanel.addEventListener('click', e => e.stopPropagation());
  // Открытие/закрытие панели с анимацией
  function openPanel() {
    const accordions = document.querySelectorAll('.accordion');
    accordions.forEach(acc => {
      closeAccordion(acc);
    });
    setTimeout(() => {
      _openPanel();
    }, 400);
  }
  
  function _openPanel() {
    // Сбрасываем полностью панель, чтобы анимация сработала заново
    Elements.settingsPanel.style.display = 'block';
    
    // Принудительно "обнуляем" трансформацию и прозрачность
    Elements.settingsPanel.classList.remove('panel-appear-active');
    Elements.settingsPanel.classList.add('panel-appear');

    // Обнуляем стили всех элементов
    const items = Elements.settingsPanel.querySelectorAll('.accordion, #importExportBtnBlock');
    items.forEach(item => {
      item.classList.remove('active');
      item.style.opacity = '0';
      item.style.transform = 'translateZ(30px)';
    });

    // Принудительный перерасчёт стилей — КЛЮЧЕВОЙ ШАГ!
    void Elements.settingsPanel.offsetWidth;

    // Включаем overlay
    Elements.overlay.style.backdropFilter = 'blur(8px)';
    Elements.overlay.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 0.4s cubic-bezier(0.4, 0, 0.2, 1)';

    // Панель должна быть интерактивна уже в текущем кадре. Это также делает
    // открытие надёжным в средах, где requestAnimationFrame откладывается.
    Elements.settingsPanel.classList.add('panel-appear-active');

    requestAnimationFrame(() => {
      // Анимация overlay
      Elements.overlay.style.opacity = '1';

      // Анимация панели
      Elements.settingsPanel.classList.add('panel-appear-active');

      // Последовательная анимация элементов
      items.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('active');
          item.style.opacity = '1';
          item.style.transform = 'translateZ(0)';
        }, 200 + (index * 100));
      });
    });
  }

  function closePanel() {
    const items = Elements.settingsPanel.querySelectorAll('.fade-slide-in');

    // 1. Убираем активность у всех элементов с анимацией
    items.forEach((item, index) => {
      item.classList.remove('active');
      item.style.opacity = '0';
      item.style.transform = 'translateZ(30px)';
    });

    // 2. Ждём окончания анимации элементов (например, 300ms)
    setTimeout(() => {
      // 3. Анимируем панель "закрытие"
      Elements.settingsPanel.classList.remove('panel-appear-active');

      // 4. Ждём окончания анимации панели
      const handleTransitionEnd = () => {
        // 5. Скрываем панель
        Elements.settingsPanel.style.display = 'none';

        // 6. Восстанавливаем начальное состояние элементов
        items.forEach(item => {
          item.style.opacity = '';
          item.style.transform = '';
        });

        // 7. Убираем классы у панели
        Elements.settingsPanel.classList.remove('panel-appear');

        // 8. Убираем overlay
        Elements.overlay.style.opacity = '0';
        Elements.overlay.style.backdropFilter = 'blur(0px)';
        Elements.overlay.addEventListener('transitionend', function onOverlayTransitionEnd() {
          Elements.overlay.removeEventListener('transitionend', onOverlayTransitionEnd);
          Elements.overlay.style.pointerEvents = 'none';
        }, { once: true });;

        Elements.settingsPanel.removeEventListener('transitionend', handleTransitionEnd);
      };

      Elements.settingsPanel.addEventListener('transitionend', handleTransitionEnd);

    }, 300); // Задержка для завершения анимации элементов

    hideImportExport();
  }
  
  // Добавляем начальное состояние для элементов панели
  document.addEventListener('DOMContentLoaded', () => {
    initAccordionCheckboxes();

    const notification = document.getElementById('settingsChangedNotification');
    if (notification) {
        notification.style.display = 'none';
        notification.classList.add('hidden');
    }

    const items = Elements.settingsPanel.querySelectorAll('.panel-item');
    items.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateZ(-50px)';
      item.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    });
  });
  
  // Добавляем эффект при наведении на элементы
  document.querySelectorAll('.panel-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.transform = 'translateZ(50px)';
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translateZ(0)';
    });
  });
  
  // Accordion animation/collapse
  let accordionStates = [];
  function setAccordionDisabled(disabled) {
    document.querySelectorAll('.accordion').forEach((acc, i) => {
      if (disabled) {
        // Save state and close
        if (acc.classList.contains('accordion-open')) accordionStates[i] = true;
        else accordionStates[i] = false;
        acc.classList.add('accordion-disabled');
        acc.querySelector('.accordion-content').style.maxHeight = '0px';
      } else {
        acc.classList.remove('accordion-disabled');
        if (accordionStates[i]) { // Restore
          acc.classList.add('accordion-open');
          const content = acc.querySelector('.accordion-content');
          content.style.display = 'block';
          let h = content.scrollHeight;
          content.style.maxHeight = h + 'px';
          setTimeout(() => {
            content.style.opacity = '1';
          },  10);

        }
      }
    });
  }
  
  document.querySelectorAll('.accordion').forEach((acc) => {
    const btn = acc.querySelector('.accordion-toggle');
    const content = acc.querySelector('.accordion-content');

    content.style.maxHeight = '0';

    btn.addEventListener('click', (event) => {
      // Игнорируем клик по кастомному чекбоксу
      if (event.target.closest('.custom-checkbox-container')) return;

      if (acc.classList.contains('accordion-disabled')) return;

      const isOpen = acc.classList.contains('accordion-open');

      if (isOpen) {
        closeAccordion(acc);
        updateAccordionCheckboxState(acc, false); // Чекбокс выключен
      } else {
        // Закрываем другие аккордеоны
        document.querySelectorAll('.accordion.accordion-open').forEach(openAcc => {
          closeAccordion(openAcc);
          updateAccordionCheckboxState(openAcc, false);
        });

        // Открываем текущий
        acc.classList.add('accordion-open');
        content.style.display = 'block';
        let h = content.scrollHeight + 30;
        content.style.maxHeight = '0';
        setTimeout(() => {
          content.style.maxHeight = h + 'px';
          content.style.opacity = '1';
        }, 10);

        updateAccordionCheckboxState(acc, true); // Чекбокс включен
      }
    });
  });

  function closeAccordion(acc) {
    const content = acc.querySelector('.accordion-content');
    acc.classList.remove('accordion-open');
    content.style.maxHeight = '0';
    content.style.opacity = '0';
    setTimeout(() => {
      content.style.display = 'none';
    }, 400);
  }

  function initAccordionCheckboxes() {
    document.querySelectorAll('.accordion').forEach(acc => {
      const checkbox = acc.querySelector('.accordion-checkbox');
      const accordionButton = acc.querySelector('.accordion-toggle');

      if (!checkbox || !accordionButton) return;

      checkbox.addEventListener('click', function (e) {
        // Имитируем клик на кнопке аккордеона
        accordionButton.click();
      });
    });
  }

  // Обновляем состояние чекбокса при открытии/закрытии аккордеона
  function updateAccordionCheckboxState(acc, isChecked) {
    const checkbox = acc.querySelector('.accordion-checkbox');
    if (checkbox) {
      checkbox.checked = isChecked;
    }
  }
  
  // Состояние ширины разделителя
  Elements.dividerWidthInput.addEventListener('input', e => 
    Elements.dividerWidthValue.textContent = e.target.value + '%'
  );

  // Состояние размера имени в карточках
  Elements.namedDrivInput.addEventListener('input', e => { 
    Elements.namedDrivValue.textContent = e.target.value + 'rem'
    localStorage.setItem('namedDrivValue', namedDrivInput.value);
    updateCameraTitleFontSize();
  });
  
  // Состояние ширины
  Elements.interfaceWidthInput.addEventListener('input', e => {
    const value = Math.min(Math.max(parseInt(e.target.value), 800), 1920);
    if (!isNaN(value)) {
        Elements.interfaceWidthInput.value = value;
        debouncedUpdateInterfaceWidth();
    }
  });
  
  Elements.color1Input.addEventListener('input', updateToolbarColors);
  Elements.color2Input.addEventListener('input', updateToolbarColors);
  updateToolbarColors();
  
  // Custom checkbox styling
  document.querySelectorAll('.custom-checkbox input[type="checkbox"]').forEach(cb => {
    function updateClass() {
      if (this.checked) {
        this.parentElement.classList.add('checked');
      } else {
        this.parentElement.classList.remove('checked');
      }
    }

    cb.addEventListener('change', updateClass);
    cb.addEventListener('DOMContentLoaded', updateClass); // Для начального состояния
  });
  
  // Импорт/Экспорт show/hide logic
  function showImportExport() {
    // Закрываем все открытые аккордеоны принудительно
    document.querySelectorAll('.accordion.accordion-open').forEach(acc => {
      closeAccordion(acc);
    });

    // Отключение аккордеонов
    setAccordionDisabled(true);
    Elements.importExportBtnBlock.style.display = "none";
    Elements.importExportBlock.style.display = "block";
    
    // Добавляем отключение кнопок
    Elements.applyChangesBtn.classList.add('btn-disabled');
    Elements.resetSettingsBtn.classList.add('btn-disabled');
    
    setTimeout(() => {
      Elements.importExportBlock.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-10', 'scale-95');
      Elements.importExportBlock.classList.add('opacity-100');
    }, 10);
    
    Elements.importExportBlock.classList.add('pointer-events-auto');
  }
  
  // Модифицируем функцию hideImportExport
  function hideImportExport() {
    // Существующий код
    setAccordionDisabled(false);
    
    // Включаем кнопки обратно
    Elements.applyChangesBtn.classList.remove('btn-disabled');
    Elements.resetSettingsBtn.classList.remove('btn-disabled');
    
    Elements.importExportBlock.classList.remove('opacity-100');
    Elements.importExportBlock.classList.add('opacity-0', 'pointer-events-none', 'translate-y-10', 'scale-95');
    
    setTimeout(() => {
      Elements.importExportBlock.style.display = "none";
      Elements.importExportBtnBlock.style.display = "";
    }, 400);
  }
  
  Elements.showImportExportBtn.addEventListener('click', showImportExport);
  Elements.closeImportExportBtn.addEventListener('click', hideImportExport);
  
  // Drag and drop для модуля импорта
  const dropzone = Elements.importExportBlock.querySelector('.dropzone');
  const importFileInput = Elements.importFile;
  
  dropzone.addEventListener('dragover', e => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  
  dropzone.addEventListener('dragleave', e => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
  });
  
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImportFile(file);
    }
  });
  
  importFileInput.addEventListener('change', e => {
    if (e.target.files[0]) {
      handleImportFile(e.target.files[0]);
    }
  });
  // Добавьте этот код в функцию setupEventListeners()
  Elements.offFullCheckbox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      
      // Синхронизируем состояние индивидуальных переключателей
      const allStreamToggles = document.querySelectorAll('.stream-toggle-input');
      allStreamToggles.forEach(toggle => {
          const cameraBox = toggle.closest('.camera-box');
          const img = cameraBox?.querySelector('.camera-img img');
          
          if (isChecked) {
              // Глобальное отключение: отключаем все потоки
              if (img && img.src && !img.src.startsWith('data:')) {
                  img.dataset.originalSrc = img.src;
                  img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
              }
              cameraBox?.classList.add('stream-disabled');
          } else {
              // Глобальное включение: включаем только те потоки, которые были включены индивидуально
              if (toggle.checked && img && img.dataset.originalSrc) {
                  img.src = img.dataset.originalSrc;
                  delete img.dataset.originalSrc;
              }
              if (toggle.checked) {
                  cameraBox?.classList.remove('stream-disabled');
              }
          }
      });
      
      // Сохраняем в localStorage
      if (State.allowLocalStorage) {
          const settings = JSON.parse(localStorage.getItem('printerCamsV2') || '{}');
          settings.loader = settings.loader || {};
          settings.loader.offFullCheckbox = isChecked;
          localStorage.setItem('printerCamsV2', JSON.stringify(settings));
      }
  });
  
  // Event listener for enableWidthInputCheckbox
  Elements.enableWidthInputCheckbox.addEventListener('change', () => {
      saveToLocalStorage();
  });
  function handleImportFile(file) {
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target.result);

        // --- 1. Очищаем старые данные ---
        Object.keys(localStorage).forEach(k => localStorage.removeItem(k));

        // --- 2. Загружаем настройки ---
        if (data.settings && typeof data.settings === 'object') {
          Object.entries(data.settings).forEach(([key, value]) => {
            localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
          });
        }

        // --- 3. Загружаем камеры ---
        if (Array.isArray(data.cameras)) {
          loadCameras(data.cameras);          // обновляем внутренний массив
          renderCameraTable(data.cameras);    // перерисовываем таблицу
        }

        // --- 4. Применяем всё ---
        loadFromLocalStorage(); // перезагружает UI
        renderCameras();
        updateInterfaceWidth();
        updateToolbarColors();
        updateHeader();
        debouncedUpdateDividers();

        enqueueNotification('Все настройки и камеры успешно импортированы!', 'system');
        hideImportExport();
        location.reload(); // надежный способ применить всё
      } catch (err) {
        console.error(err);
        alert('Ошибка импорта: файл повреждён или имеет неверный формат.');
      }
    };
    reader.readAsText(file);
  }
  
  // Экспорт настроек
  Elements.exportBtn.addEventListener('click', () => {
    // 1. Собираем все ключи из localStorage
    const allSettings = {};
    Object.keys(localStorage).forEach(key => {
      try {
        allSettings[key] = JSON.parse(localStorage.getItem(key));
      } catch {
        allSettings[key] = localStorage.getItem(key); // fallback для строк
      }
    });

    // 2. Собираем камеры в актуальном порядке
    const cameras = getCameraTableData(); // уже возвращает {ip, stream, name, order}

    const exportData = {
      settings: allSettings,
      cameras
    };

    // 3. Скачиваем JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'printerCamsV2_full_settings.json';
    a.click();
    URL.revokeObjectURL(url);
  });
    
  // Кнопки "Применить" и "Сбросить"
  Elements.resetSettingsBtn.addEventListener('click', () => {
    closePanel();
    Elements.resetConfirmModal.classList.remove('hidden');
  });

  Elements.cancelResetBtn.addEventListener('click', closeModal);
  Elements.resetConfirmModal.addEventListener('click', e => {
    if (!e.target.closest('.bg-white')) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Функция восстановления  параметров на заводские
  Elements.confirmResetBtn.addEventListener('click', async () => {
    if (State.allowLocalStorage) {
      localStorage.removeItem('printerCamsV2');
    }
    closeModal();
  const s = Config.defaultSettings;

    Elements.color1Input.value = s.color1;
    Elements.color2Input.value = s.color2;
    Elements.colorIntOverInput.value = s.colorIntOver;
    Elements.errorNotificationColorInput.value = s.errorNotificationColor;
    Elements.systemNotificationColorInput.value = s.systemNotificationColor;
    Elements.notificationOpacityInput.value = s.notificationOpacity;
    Elements.hideLoaderCheckbox.checked = s.loader.hide;
    Elements.loaderBgColorInput.value = s.loader.bgColor;
    Elements.loaderOpacityInput.value = s.loader.opacity;
    Elements.offFullCheckbox.checked = s.loader.offFullCheckbox;
    if (Elements.hideNotificationCheckbox) {
      Elements.hideNotificationCheckbox.checked = s.hideNotifications;
    }
    Elements.gridColumnsInput.value = s.grid.columns;
    Elements.headerTextInput.value = s.header.text;
    Elements.hideHeaderCheckbox.checked = s.header.hidden;
    Elements.headerBgColorInput.value = s.header.bgColor;
    Elements.headerBgOpacityInput.value = s.header.bgOpacity;
    Elements.headerTextColorInput.value = s.header.textColor;
    Elements.interfaceWidth.value = s.interfaceWidth;
    Elements.interfaceWidthInput.value = s.interfaceWidth;
    Elements.interfaceHeight.value = s.interfaceHeight;
    Elements.interfaceHeightInput.value = s.interfaceHeight;
    Elements.dividerColorInput.value = s.dividerColor;
    Elements.dividerThicknessInput.value = s.dividerThickness;
    Elements.dividerWidthInput.value = s.dividerWidth;
    Elements.dividerWidthValue.textContent = s.dividerWidth + '%';
    Elements.enableDividersCheckbox.checked = s.enableDividers;
    Elements.enableWidthInputCheckbox.checked = s.enableWidthInput;
    Elements.namedDrivInput.value = s.namedDriv;
    Elements.namedDrivValue.textContent = s.namedDriv + 'rem';

    // Перезаписываем камеры из Config
    loadCameras(Config.defaultCameras);
    renderCameraTable(Config.defaultCameras);
    renderCameras();
    // Применяем изменения в UI
    updateHeader();
    updateToolbarColors();
    updateGrid();
    updateInterfaceWidth();
    updateInterfaceHeight();
    updateToolbarVisibility();
    updateLoader();
    debouncedUpdateDividers();
    updateCameraTitleFontSize();
    // Сохраняем в localStorage
    const defaultSettings = saveToLocalStorage();
    if (defaultSettings) {
      try {
        await window.PrintVisualApi?.saveSettingsToAppApi?.(defaultSettings, 2500);
      } catch {
        enqueueNotification('Настройки сброшены локально, но сохранить их на сервере не удалось', 'info');
      }
    }

  });

  // Help Modal
  Elements.helpBtn.addEventListener('click', () => Elements.helpModal.classList.remove('hidden'));
  Elements.closeHelpBtn.addEventListener('click', () => Elements.helpModal.classList.add('hidden'));
  Elements.helpModal.addEventListener('click', e => {
    if (!e.target.closest('.bg-white')) Elements.helpModal.classList.add('hidden');
  });

  // Grid Columns
  Elements.gridColumnsInput.addEventListener('input', () => {
    updateGrid();
    debouncedUpdateDividers();
    updateAntsVisibility();
  });

  Elements.interfaceWidthInput.addEventListener('input', e => {
    document.getElementById('interfaceWidthInput').value = e.target.value;
    debouncedUpdateInterfaceWidth();
  });

  document.getElementById('interfaceWidthInput').addEventListener('input', (e) => {
    const value = Math.min(Math.max(parseInt(e.target.value), 800), 1920);
    if (!isNaN(value)) {
      updateInterfaceWidth();
      saveToLocalStorage();
    }
  });


  Elements.namedDrivInput.addEventListener('input', (e) => {
    Elements.namedDrivValue.textContent = e.target.value + 'rem';
    debouncedUpdateDividers();
    updateCameraTitleFontSize();
    clearToolbarInlineStyles(); // Очищаем встроенные стили панели инструментов
    saveToLocalStorage();
  });
  // Divider Settings width sync
  [Elements.enableDividersCheckbox, Elements.dividerColorInput, Elements.dividerThicknessInput].forEach(input => {
    input.addEventListener('input', debouncedUpdateDividers);
  });
  Elements.dividerWidthInput.addEventListener('input', (e) => {
    Elements.dividerWidthValue.textContent = e.target.value + '%';
    debouncedUpdateDividers();
    clearToolbarInlineStyles(); // Очищаем встроенные стили панели инструментов
    saveToLocalStorage();
  });

  // Header Settings
  [Elements.headerTextInput, Elements.hideHeaderCheckbox, Elements.headerBgColorInput,
   Elements.headerBgOpacityInput, Elements.headerTextColorInput].forEach(inp =>
    inp.addEventListener('input', () => {
      updateHeader();
      updateToolbarColors();
      clearToolbarInlineStyles(); // Очищаем встроенные стили панели инструментов
    })
  );

  // Обработчики цвета темы
  [Elements.color1Input, Elements.color2Input].forEach(input => {
    input.addEventListener('input', () => {
      updateToolbarColors();
      // Только обновляем цвета иконок, если не в полноэкранном режиме
      if (!document.fullscreenElement) {
        updateActionIconColors(); // Добавляем обновление цветов иконок
      }
      clearToolbarInlineStyles(); // Очищаем встроенные стили панели инструментов
      saveToLocalStorage();
    });
  });
  Elements.colorIntOverInput.addEventListener('input', () => {
    saveToLocalStorage();
  });

function clearToolbarInlineStyles() {
  window.setTimeout(() => {
    document.querySelectorAll<HTMLElement>('[data-fa-i2svg]').forEach(toolbar => {
      toolbar.style.color = '';
    });
  }, 100);
}

  // Loader
  [Elements.hideLoaderCheckbox, Elements.loaderBgColorInput, Elements.loaderOpacityInput].forEach(input => {
    input.addEventListener('input', () => {
      updateLoader();
      clearToolbarInlineStyles(); // Очищаем встроенные стили панели инструментов
      saveToLocalStorage();
    });
  });

  // Hide Notifications
  if (Elements.hideNotificationCheckbox) {
    Elements.hideNotificationCheckbox.addEventListener('change', () => {
      saveToLocalStorage();
    });
  }

  // Toolbar Visibility
  Elements.hideHeaderCheckbox.addEventListener('change', () => {
    updateToolbarVisibility();
    Elements.mainHeader.classList.toggle('hidden', Elements.hideHeaderCheckbox.checked);
  });

  // Слушатель события нажатия на кнопку применить измененния
  Elements.applyChangesBtn.onclick = () => {
    saveToLocalStorage(); // Сохраняем настройки
    renderCameras(); // Обновляем карточки камер без отмены серверной синхронизации
    updateNotificationOpacity();
    updateHeader();
    updateGrid();
    updateInterfaceWidth();
    updateInterfaceHeight();
    updateToolbarVisibility();
    updateToolbarColors();
    updateLoader();
  };

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  async function disableAllStreamsSequentially() {
    if (State.disableAllStreamsBusy) return;

    const toggles = Array.from(document.querySelectorAll('.stream-toggle-input'));
    const enabledToggles = toggles.filter(toggle => {
      const cameraBox = toggle.closest('.camera-box');
      return toggle.checked
        && cameraBox
        && !cameraBox.classList.contains('camera-disconnected')
        && !cameraBox.classList.contains('dammy');
    });

    if (!enabledToggles.length) {
      enqueueNotification('Нет доступных включённых видеопотоков', 'info');
      return;
    }

    State.disableAllStreamsBusy = true;
    Elements.disableAllStreamsBtn?.classList.add('btn-disabled');
    Elements.disableAllStreamsBtn?.setAttribute('aria-disabled', 'true');

    enqueueNotification(`Выключаю видеопотоки: ${enabledToggles.length}`, 'system');

    try {
      for (const toggle of enabledToggles) {
        const cameraBox = toggle.closest('.camera-box');
        if (!document.body.contains(toggle)
          || !toggle.checked
          || !cameraBox
          || cameraBox.classList.contains('camera-disconnected')
          || cameraBox.classList.contains('dammy')) continue;
        toggle.checked = false;
        toggle.dispatchEvent(new Event('change', { bubbles: true }));
        await wait(500);
      }
      enqueueNotification('Доступные видеопотоки выключены', 'system');
    } finally {
      State.disableAllStreamsBusy = false;
      Elements.disableAllStreamsBtn?.classList.remove('btn-disabled');
      Elements.disableAllStreamsBtn?.removeAttribute('aria-disabled');
    }
  }

  Elements.disableAllStreamsBtn.onclick = () => {
    disableAllStreamsSequentially();
  };

  // Refresh Cameras
  Elements.refreshCamerasBtn.onclick = () => {
    // 1. Развернуть все свернутые уведомления
    const allNotifications = document.querySelectorAll(".notification");
    allNotifications.forEach(notification => {
      if (notification.dataset.collapsed === 'true') {
        // Удаляем состояние свёрнутости
        delete notification.dataset.collapsed;
        notification.classList.remove('collapsed');
      }
    });

    // 2. Скрыть панель действий уведомлений
    const notificationActions = document.getElementById('notificationActions');
    if (notificationActions) {
        notificationActions.classList.add('hidden');
    }

    // Дополнительно обновить позиции уведомлений (по желанию)
    schedulePositionUpdate();

    // Перерисовка камер (если это часть refreshCamerasBtn)
    renderCameras();
    debouncedUpdateDividers();
    syncDividerStyles();
  };

  function updateCameraTableOrder() {
    const cameraElements = document.querySelectorAll('.camera-box');
    const newOrder = [];
    
    cameraElements.forEach(el => {
      const ip = el.dataset.ip;
      const existingCamera = cameras.find(cam => cam.ip === ip);
      if (existingCamera) {
        newOrder.push(existingCamera);
      }
    });
    
    cameras = newOrder;
  }

  // Save Position
  Elements.savePositionBtn.onclick = () => {
    updateCameraTableOrder();
    saveToLocalStorage();
    enqueueNotification("Положение камер сохранено", "system");
  };

  // Notifications
  [Elements.errorNotificationColorInput, Elements.notificationOpacityInput].forEach(inp => {
    inp.addEventListener('input', saveToLocalStorage);
  });

  // Fullscreen
  document.addEventListener('fullscreenchange', () => {
    document.querySelectorAll('.camera-box.fullscreen').forEach(el => {
      el.classList.remove('fullscreen');
    });
  });
}

// === HEADER ===
function updateHeader() {
  document.documentElement.style.setProperty('--toolbar-icon-color', Elements.headerTextColorInput.value);
  Elements.headerTitle.textContent = Elements.headerTextInput.value.trim() || 'Активные принтера';

  if (Elements.hideHeaderCheckbox.checked) {
    Elements.mainHeader.classList.add('hidden');
  } else {
    Elements.mainHeader.classList.remove('hidden');
  }

  Elements.headerTitle.style.color = Elements.headerTextColorInput.value;

  const bg = Elements.headerBgColorInput.value;
  const op = parseFloat(Elements.headerBgOpacityInput.value);
  Elements.headerBar.style.backgroundColor = `rgba(${parseInt(bg.substr(1,2),16)},${parseInt(bg.substr(3,2),16)},${parseInt(bg.substr(5,2),16)},${op})`;
}

// === GRID SETTINGS ===
function updateGrid() {
  Elements.cameraContainer.style.gridTemplateColumns = `repeat(${Elements.gridColumnsInput.value}, minmax(0, 1fr))`;
  updateAntsVisibility();
}

// === INTERFACE WIDTH ===
function updateInterfaceWidth() {
    const width = +Elements.interfaceWidthInput.value;
    const screenWidth = window.innerWidth;
    const padding = 20; // отступы слева и справа

    // Ограничиваем ширину максимум до ширины экрана минус отступы
    const finalWidth = Math.min(Math.max(width, 800), screenWidth - padding);

    // Синхронизируем ползунок и инпут
    Elements.interfaceWidthInput.value = finalWidth;
    Elements.interfaceWidth.value = finalWidth;

    // Применяем ширину
    [Elements.mainInterfaceContainer, Elements.mainInterfaceContainerCameras].forEach(el => {
        // Ensure smooth transition
        if (!el.style.transition) {
            el.style.transition = 'width 0.5s ease-in-out, max-width 0.5s ease-in-out';
        }
        el.style.width = `${finalWidth}px`;
        el.style.maxWidth = `${finalWidth}px`;
        // Центрируем только если она меньше экрана
        if (finalWidth < screenWidth) {
            el.style.marginLeft = 'auto';
            el.style.marginRight = 'auto';
        } else {
            el.style.marginLeft = `${padding / 2}px`;
            el.style.marginRight = `${padding / 2}px`;
        }
    });

    Elements.interfaceWidthValue.textContent = 'px';
    saveToLocalStorage();
    debouncedUpdateDividers();
    
    // Remove transition after animation completes to avoid affecting other interactions
    setTimeout(() => {
        [Elements.mainInterfaceContainer, Elements.mainInterfaceContainerCameras].forEach(el => {
            if (el && el.style.transition) {
                el.style.transition = '';
            }
        });
    }, 500);
}

// Delayed width adjustment function for when enableWidthInputCheckbox is checked
let resizeTimeout;
function delayedMaxWidthAdjustment() {
    // Clear any existing timeout
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }
    
    // Add smooth transition class for animation
    const containers = [Elements.mainInterfaceContainer, Elements.mainInterfaceContainerCameras];
    containers.forEach(el => {
        if (el) {
            el.style.transition = 'width 0.5s ease-in-out, max-width 0.5s ease-in-out';
        }
    });
    
    // Set a new timeout for 2 seconds
    resizeTimeout = setTimeout(() => {
        // Set the interface width to maximum available width
        const maxWidth = window.innerWidth - 50; // 50px for padding
        Elements.interfaceWidthInput.value = maxWidth;
        Elements.interfaceWidth.value = maxWidth;
        updateInterfaceWidth();
        
        // Remove transition after animation completes
        setTimeout(() => {
            containers.forEach(el => {
                if (el) {
                    el.style.transition = '';
                }
            });
        }, 500);
    }, 2000);
}

function updateInterfaceHeight() {
    // Don't apply fixed heights when in fullscreen mode
    if (document.fullscreenElement) return;
    
    const height = +Elements.interfaceHeightInput.value;
    const minHeight = 180;
    const maxHeight = 1080;

    // Ограничиваем высоту в допустимых пределах
    const finalHeight = Math.min(Math.max(height, minHeight), maxHeight);

    // Синхронизируем ползунок и инпут
    Elements.interfaceHeightInput.value = finalHeight;
    Elements.interfaceHeight.value = finalHeight;

    // Применяем высоту ко всем карточкам камер
    const cameraBoxes = document.querySelectorAll('.camera-box');
    cameraBoxes.forEach(camBox => {
        const cameraImg = camBox.querySelector('.camera-img');
        if (cameraImg) {
            cameraImg.style.minHeight = `${finalHeight}px`;
            cameraImg.style.height = `${finalHeight}px`;
        }
        // Также применяем к изображению внутри, если оно есть
        const img = camBox.querySelector('img');
        if (img) {
            img.style.minHeight = `${finalHeight}px`;
        }
    });

    Elements.interfaceHeightValue.textContent = 'px';
    saveToLocalStorage();
}

// Добавим обработчик изменения размера окна
window.addEventListener('resize', debounce(() => {
    // Check if enableWidthInputCheckbox is checked
    if (Elements.enableWidthInputCheckbox && Elements.enableWidthInputCheckbox.checked) {
        // Use delayed max width adjustment
        delayedMaxWidthAdjustment();
    } else {
        // Use normal behavior
        updateInterfaceWidth();
    }
}, 100));

// Обработчики событий для обоих инпутов
Elements.interfaceWidth.addEventListener('input', e => {
    const value = Math.min(Math.max(parseInt(e.target.value), 800), window.innerWidth - 20);
    if (!isNaN(value)) {
        Elements.interfaceWidthInput.value = value;
        debouncedUpdateInterfaceWidth();
        clearToolbarInlineStyles(); // Очищаем встроенные стили панели инструментов
    }
})
Elements.interfaceWidthInput.addEventListener('input', e => {
    const value = Math.min(Math.max(parseInt(e.target.value), 800), window.innerWidth - 20);
    if (!isNaN(value)) {
        Elements.interfaceWidth.value = value;
        debouncedUpdateInterfaceWidth();
        updateInterfaceWidth();
        clearToolbarInlineStyles(); // Очищаем встроенные стили панели инструментов
        saveToLocalStorage();
    }
});

// Обработчики событий для высоты карточек
Elements.interfaceHeight.addEventListener('input', e => {
    const value = Math.min(Math.max(parseInt(e.target.value), 180), 1080);
    if (!isNaN(value)) {
        Elements.interfaceHeightInput.value = value;
        debouncedUpdateInterfaceHeight();
        clearToolbarInlineStyles(); // Очищаем встроенные стили панели инструментов
    }
});

Elements.interfaceHeightInput.addEventListener('input', e => {
    const value = Math.min(Math.max(parseInt(e.target.value), 180), 1080);
    if (!isNaN(value)) {
        Elements.interfaceHeight.value = value;
        debouncedUpdateInterfaceHeight();
        clearToolbarInlineStyles(); // Очищаем встроенные стили панели инструментов
    }
});

function setDefaultInterfaceWidth() {
    const defaultWidth = 1400;
    Elements.interfaceWidth.value = defaultWidth;
    Elements.interfaceWidthInput.value = defaultWidth;
    updateInterfaceWidth();
}





// === CAMERA TABLE ===

// ==== Локальный State ====
let cameras = []; // глобальный массив

function normalizeCameraIp(ip) {
  const value = typeof ip === 'string' ? ip.trim() : '';
  if (!/^\d{1,3}$/.test(value)) return value;
  const lastOctet = Number.parseInt(value, 10);
  return lastOctet >= 1 && lastOctet <= 254 ? `192.168.0.${lastOctet}` : value;
}

function normalizeCameraData(cam = {}) {
  if (typeof cam === 'string') {
    return { ip: normalizeCameraIp(cam), stream: '', name: '', mac: '', lastSeenIp: '', lastMacCheckAt: '' };
  }
  return {
    ip: normalizeCameraIp(cam.ip),
    stream: typeof cam.stream === 'string' ? cam.stream : '',
    name: typeof cam.name === 'string' ? cam.name : '',
    mac: normalizeMac(cam.mac || ''),
    lastSeenIp: typeof cam.lastSeenIp === 'string' ? cam.lastSeenIp : '',
    lastMacCheckAt: typeof cam.lastMacCheckAt === 'string' ? cam.lastMacCheckAt : ''
  };
}

function loadCameras(initialCameras) {
  cameras = initialCameras.map(normalizeCameraData);
  renderCameraTable();
}
// Добавление камеры
function addCamera() {
  cameras.push(normalizeCameraData({ip: '', name: ''}));
  renderCameraTable();
  saveToLocalStorage();
  renderCameras();
}
// Добавление dammy
function addDammy() {
  cameras.push(normalizeCameraData({ip: 'dammy', name: ''}));
  renderCameraTable();
  saveToLocalStorage();
  renderCameras();
}

// Редактирование поля
function onInputChange(rowIdx, field, value) {
  cameras[rowIdx][field] = value;
  saveToLocalStorage();
}

// Удаление строки
function deleteRow(idx) {
  cameras.splice(idx, 1);
  renderCameraTable();
  saveToLocalStorage();
  renderCameras();
}



// Drag-and-drop: после перемещения строк
function reorderRows(newOrderArray) {
  cameras = newOrderArray;
  renderCameraTable();
  saveToLocalStorage();
  renderCameras();
}
// ==== Модальное окно ====
const lockBody = l => document.documentElement.classList.toggle('overflow-hidden', l);
const toggleIcon = o => {
  Elements.openBtn.querySelector('.icon-gear').classList.toggle('hidden', o);
  Elements.openBtn.querySelector('.icon-close').classList.toggle('hidden', !o);
  Elements.openBtn.setAttribute('aria-label', o ? 'Закрыть' : 'Настройки');
};
function animateHeight(fn,el) {
  const s = el.offsetHeight;
  fn();
  requestAnimationFrame(() => {
    const e = el.offsetHeight;
    el.style.height = s + 'px';
    el.offsetHeight;
    el.style.transition = 'height .3s ease';
    el.style.height = e + 'px';
    el.addEventListener('transitionend',() => {
      el.style.height = '';
      el.style.transition = '';
    },{once:true});
  });
}
// --- Исправленное поведение openSettingsBtnModal и settingsModal ---

// Получаем элементы
const openBtn = Elements.openBtn; // Кнопка "шестеренка" (openSettingsBtnModal)
const modal = Elements.modal; // <div id="settingsModal">
const modalHolder = Elements.modalHolder; // Куда телепортируем mainSectionWrap
const mainWrap = Elements.mainWrap; // <div id="mainSectionWrap">
const accordionList = Elements.accordionList;

// Селекторы для элементов, участвующих в изменении
const customCheckboxContainer = () => mainWrap.querySelector('.custom-checkbox-container');
const buttonAccordionCameras = () => mainWrap.querySelector('.accordion-toggle');
const iconClose = () => openBtn.querySelector('.icon-close');

// Сохранение изначальных стилей для восстановления
let _originalCheckboxOpacity = null;
let _originalButtonAccordionPointerEvents = null;
let _originalOpenBtnRight = null;
let _originalIconCloseTransform = null;
let _originalTableWrapperDisplay = null;
let _originalTableWrapperFlexDirection = null;
let _originalScrollableTableFlex = null;
let _originalScrollableTableHeight = null;
let _originalScrollableTableMaxHeight = null;
let _originalScrollableTableMinHeight = null;
let _originalScrollableTableOverflow = null;
let _originalAccordionContentFlex = null;
let _originalAccordionContentHeight = null;
let _originalAccordionContentMaxHeight = null;
let _originalAccordionContentMinHeight = null;
let _originalAccordionContentOverflow = null;
// Внутреннее состояние
let isSettingsModalOpen = false;

// Получаем элементы для ограничения достука кнопки открытия модального окна
const mainSectionWrap = document.getElementById('mainSectionWrap');
const openSettingsBtnModal = document.getElementById('openSettingsBtnModal');

// Функция обновления состояния кнопки
function updateOpenSettingsButtonState() {
    if (!mainSectionWrap || !openSettingsBtnModal) return;

    if (mainSectionWrap.classList.contains('accordion-open')) {
        // Разрешить нажатие
        openSettingsBtnModal.removeAttribute('disabled');
        openSettingsBtnModal.style.opacity = '1';
        openSettingsBtnModal.style.pointerEvents = 'auto';
    } else {
        // Запретить нажатие
        openSettingsBtnModal.setAttribute('disabled', 'disabled');
        openSettingsBtnModal.style.opacity = '0';
        openSettingsBtnModal.style.pointerEvents = 'none';
    }
}

// Наблюдатель за изменениями классов mainSectionWrap
const observer = new MutationObserver(() => {
    updateOpenSettingsButtonState();
});

if (mainSectionWrap) {
    observer.observe(mainSectionWrap, { attributes: true, attributeFilter: ['class'] });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateOpenSettingsButtonState();
});
/**
 * Открыть модальное окно с телепортацией mainSectionWrap внутрь modalHolder
 * и поднятием settingsModal над settingsPanel
 */
function openModalSet() {
  // Скрываем mainWrap из settingsPanel, телепортируем в modalHolder
  modalHolder.appendChild(mainWrap);
  mainWrap.classList.add('modal-expanded');
  // Показываем модальное окно
  modal.classList.remove('hidden');
  modal.style.zIndex = '1000';
  // settingsPanel на задний план
  settingsPanel.style.zIndex = '900';
  // Обновляем иконки
  openBtn.querySelector('.icon-gear').classList.add('hidden');
  openBtn.querySelector('.icon-close').classList.remove('hidden');
  openBtn.setAttribute('aria-label', 'Закрыть');
  isSettingsModalOpen = true;
  document.documentElement.classList.add('overflow-hidden');
  lucide.createIcons && lucide.createIcons();
  unlockTableHeight();

  // 1. Прозрачность custom-checkbox-container
  const checkboxCont = customCheckboxContainer();
  if (checkboxCont) {
    if (_originalCheckboxOpacity === null) _originalCheckboxOpacity = checkboxCont.style.opacity || '';
    checkboxCont.style.opacity = '0.25';
    checkboxCont.style.pointerEvents = 'none';
    checkboxCont.style.transition = 'opacity 0.4s';
  }

  // 2. Деактивация кнопки-аккордеона (accordion-toggle)
  const btnAccordion = buttonAccordionCameras();
  if (btnAccordion) {
    if (_originalButtonAccordionPointerEvents === null) _originalButtonAccordionPointerEvents = btnAccordion.style.pointerEvents || '';
    btnAccordion.style.pointerEvents = 'none';
    btnAccordion.style.opacity = '0.95';
    btnAccordion.style.cursor = 'not-allowed';
    btnAccordion.style.transition = 'opacity 0.4s';
  }

  // 3. Кнопка openSettingsBtnModal (icon-close) увеличивается и перемещается направо
  const icon = iconClose();
  if (icon) {
    if (_originalIconCloseTransform === null) _originalIconCloseTransform = icon.style.transform || '';
    icon.style.transform = 'scale(2)';
    icon.style.transition = 'transform 0.4s';
  }
  if (_originalOpenBtnRight === null) _originalOpenBtnRight = openBtn.style.right || '';
  openBtn.style.right = '24px'; // Было 56px

}

/**
 * Закрыть модальное окно, вернуть mainSectionWrap обратно в settingsPanel
 * и скрыть settingsModal
 */
function closeModalSet() {
  // Возвращаем mainWrap обратно внутрь settingsPanel (в конец)
  accordionList.appendChild(mainWrap);
  mainWrap.classList.remove('modal-expanded');
  // Прячем модальное окно
  modal.classList.add('hidden');
  modal.style.zIndex = '';
  // settingsPanel снова на передний план
  settingsPanel.style.zIndex = '';
  // Обновляем иконки
  openBtn.querySelector('.icon-gear').classList.remove('hidden');
  openBtn.querySelector('.icon-close').classList.add('hidden');
  openBtn.setAttribute('aria-label', 'Настройки');
  isSettingsModalOpen = false;
  document.documentElement.classList.remove('overflow-hidden');
  restoreTableHeight();

  // 1. Восстанавливаем custom-checkbox-container
  const checkboxCont = customCheckboxContainer();
  if (checkboxCont && _originalCheckboxOpacity !== null) {
    checkboxCont.style.opacity = _originalCheckboxOpacity;
    checkboxCont.style.pointerEvents = '';
  }

  // 2. Восстанавливаем pointer-events и opacity accordion-toggle
  const btnAccordion = buttonAccordionCameras();
  if (btnAccordion && _originalButtonAccordionPointerEvents !== null) {
    btnAccordion.style.pointerEvents = _originalButtonAccordionPointerEvents;
    btnAccordion.style.opacity = '';
    btnAccordion.style.cursor = '';
  }

  // 3. Восстанавливаем scale icon-close и right openBtn
  const icon = iconClose();
  if (icon && _originalIconCloseTransform !== null) {
    icon.style.transform = _originalIconCloseTransform;
  }
  if (_originalOpenBtnRight !== null) openBtn.style.right = _originalOpenBtnRight;
}

function unlockTableHeight() {
  // tableWrapper — делаем flex column
  const tw = mainWrap.querySelector('#tableWrapper');
  if (tw) {
    if (_originalTableWrapperDisplay === null) _originalTableWrapperDisplay = tw.style.display || '';
    if (_originalTableWrapperFlexDirection === null) _originalTableWrapperFlexDirection = tw.style.flexDirection || '';
    tw.style.display = 'flex';
    tw.style.flexDirection = 'column';
  }

  // scrollable-table — растягиваем на всю высоту
  const st = mainWrap.querySelector('.scrollable-table');
  if (st) {
    if (_originalScrollableTableFlex === null) _originalScrollableTableFlex = st.style.flex || '';
    if (_originalScrollableTableHeight === null) _originalScrollableTableHeight = st.style.height || '';
    if (_originalScrollableTableMaxHeight === null) _originalScrollableTableMaxHeight = st.style.maxHeight || '';
    if (_originalScrollableTableMinHeight === null) _originalScrollableTableMinHeight = st.style.minHeight || '';
    if (_originalScrollableTableOverflow === null) _originalScrollableTableOverflow = st.style.overflow || '';
    st.style.flex = '1 1 0%';
    st.style.height = 'auto';
    st.style.maxHeight = 'none';
    st.style.minHeight = '0';
    st.style.overflow = 'auto';
  }

  // accordion-content[data-accordion-content="cameras"] — тоже растягиваем (если надо)
  const ac = mainWrap.querySelector('.accordion-content[data-accordion-content="cameras"]');
  if (ac) {
    if (_originalAccordionContentFlex === null) _originalAccordionContentFlex = ac.style.flex || '';
    if (_originalAccordionContentHeight === null) _originalAccordionContentHeight = ac.style.height || '';
    if (_originalAccordionContentMaxHeight === null) _originalAccordionContentMaxHeight = ac.style.maxHeight || '';
    if (_originalAccordionContentMinHeight === null) _originalAccordionContentMinHeight = ac.style.minHeight || '';
    if (_originalAccordionContentOverflow === null) _originalAccordionContentOverflow = ac.style.overflow || '';
    ac.style.flex = '1 1 0%';
    ac.style.height = 'auto';
    ac.style.maxHeight = 'none';
    ac.style.minHeight = '0';
    ac.style.overflow = 'auto';
  }

  // mainButtons — ничего не меняем, он останется внизу благодаря flex
}

function restoreTableHeight() {
  // tableWrapper
  const tw = mainWrap.querySelector('#tableWrapper');
  if (tw) {
    if (_originalTableWrapperDisplay !== null) tw.style.display = _originalTableWrapperDisplay;
    if (_originalTableWrapperFlexDirection !== null) tw.style.flexDirection = _originalTableWrapperFlexDirection;
  }

  // scrollable-table
  const st = mainWrap.querySelector('.scrollable-table');
  if (st) {
    if (_originalScrollableTableFlex !== null) st.style.flex = _originalScrollableTableFlex;
    if (_originalScrollableTableHeight !== null) st.style.height = _originalScrollableTableHeight;
    if (_originalScrollableTableMaxHeight !== null) st.style.maxHeight = _originalScrollableTableMaxHeight;
    if (_originalScrollableTableMinHeight !== null) st.style.minHeight = _originalScrollableTableMinHeight;
    if (_originalScrollableTableOverflow !== null) st.style.overflow = _originalScrollableTableOverflow;
  }

  // accordion-content
  const ac = mainWrap.querySelector('.accordion-content[data-accordion-content="cameras"]');
  if (ac) {
    if (_originalAccordionContentFlex !== null) ac.style.flex = _originalAccordionContentFlex;
    if (_originalAccordionContentHeight !== null) ac.style.height = _originalAccordionContentHeight;
    if (_originalAccordionContentMaxHeight !== null) ac.style.maxHeight = _originalAccordionContentMaxHeight;
    if (_originalAccordionContentMinHeight !== null) ac.style.minHeight = _originalAccordionContentMinHeight;
    if (_originalAccordionContentOverflow !== null) ac.style.overflow = _originalAccordionContentOverflow;
  }
}

openBtn.addEventListener('click', () => {
  if (!isSettingsModalOpen) {
    openModalSet();
  } else {
    closeModalSet();
  }
});

// Клик вне mainWrap закрывает модалку
modal.addEventListener('click', e => {
  if (e.target === modal) closeModalSet();
});

// Escape закрывает модалку
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && isSettingsModalOpen) closeModalSet();
});

// Гарантируем что при инициализации mainWrap внутри settingsPanel
if (!settingsPanel.contains(mainWrap)) {
  settingsPanel.appendChild(mainWrap);
  mainWrap.classList.remove('modal-expanded');
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !Elements.modal.classList.contains('hidden')) closeModalSet()
});



// ==== Генерация HTML строки ====
function rowHTML(isDammy, ip = '', stream = '', name = ''){
  if(isDammy) return `
    <td class="p-2 text-center handle cursor-grab"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="grip-vertical" class="lucide lucide-grip-vertical w-4 h-4"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg></td>
    <td colspan="2" class="p-2"><input disabled class="dynamic-input w-full rounded-xl px-3 py-2 text-center" value="— Пустой слот —"></td>
    <td class="p-2 border-l border-[rgb(var(--white)/0.1)]"><input disabled class="dynamic-input w-full rounded-xl px-3 py-2 text-center"></td>
    <td class="p-2 text-center animate-pulse-slow"><button class="remove-camera-btn rounded-xl p-2 htext-[rgb(var(--stickyHeader-rgb))] hover:text-[rgb(var(--tetrad1-light-rgb))] transition active:scale-90" aria-label="Удалить">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="trash-2" class="lucide lucide-trash-2 w-4 h-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg></button></td>`;
  return `
    <td class="p-2 text-center handle cursor-grab"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="grip-vertical" class="lucide lucide-grip-vertical w-4 h-4"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg></td>
    <td class="ip-cell p-2 text-right"><input maxlength="22" class="dynamic-input w-[15ch] rounded-xl bg-transparent px-3 py-2 text-right" type="text" value="${ip||''}" placeholder="IP / URL"></td>
    <td class="p-2"><div class="relative group"><input class="peer dynamic-input stream-input w-full rounded-xl bg-transparent px-3 py-2 pr-10" type="text" value="${stream||''}" placeholder=":8080/?action=stream"><button type="button" class="stream-toggle absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-[rgb(var(--tetrad1-light-rgb)/0.1)] text-[rgb(var(--stickyHeader-rgb))] hover:bg-[rgb(var(--tetrad2-dark-rgb)/0.8)] hover:text-[rgb(var(--white))] transition opacity-0 pointer-events-none peer-focus:opacity-100 peer-focus:pointer-events-auto group-hover:opacity-100 group-hover:pointer-events-auto" aria-label="Переключить stream"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="shuffle" class="lucide lucide-shuffle w-4 h-4"><path d="m18 14 4 4-4 4"></path><path d="m18 2 4 4-4 4"></path><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"></path><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"></path><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"></path></svg></button></div></td>
    <td class="p-2 border-l border-[rgb(var(--white)/0.1)]"><input class="dynamic-input w-full rounded-xl bg-transparent px-3 py-2" type="text" value="${name||''}" placeholder="Название"></td>
    <td class="p-2 text-center"><button class="remove-camera-btn rounded-xl p-2 text-[rgb(var(--stickyHeader-rgb))] hover:text-[rgb(var(--tetrad1-light-rgb))] transition active:scale-90" aria-label="Удалить"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="trash-2" class="lucide lucide-trash-2 w-4 h-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg></button></td>`;
}

// ==== Добавление строки ====
// Слушатель событий. При нажатии на кнопку запускам addRow
Elements.addCameraBtn.onclick = () => {
  animateHeight(() => {
    addRow(false);
  }, Elements.tableWrapper);
};

Elements.addDammyCameraBtn.onclick = () => animateHeight(() => addRow(true), Elements.tableWrapper);
Elements.recoverPrinterIpsBtn.onclick = () => recoverPrinterIpsByMac();
// При нажатии на кнопку проверяем ключь и записываем переменные
function addRow(isDammy){
  cameras.push(normalizeCameraData(isDammy ? {ip:'dammy', stream: '' ,name:''} : {ip:'', stream:'' ,name:''}));
  renderCameraTable();
}
// получаем массив
function renderCameraTable(camArr = cameras) {
  Elements.tbody.innerHTML = '';
  camArr.forEach((cam, idx) => {
    const { ip, name, stream } = normalizeCameraData(cam);
    const tr = document.createElement('tr');
    tr.className = 'group animate-row-in3d' + (ip === 'dammy' ? ' dammy-slot' : '');
    tr.innerHTML = rowHTML(ip === 'dammy', ip, stream, name);

    lucide.createIcons();
    enableDrag(tr);
    initInputs(tr.querySelectorAll('.dynamic-input'));
    initStreamToggle(tr.querySelector('.stream-toggle'));

    Elements.tbody.appendChild(tr);
  });
}

// ==== Удаление строки ====
Elements.tbody.addEventListener('click', e => {
  const btn = e.target.closest('.remove-camera-btn');
  if (!btn) return;
  const row = btn.closest('tr');
  const idx = [...Elements.tbody.children].indexOf(row);
  row.classList.add('animate-row-out');
  row.addEventListener('animationend', () => {
    animateHeight(() => {
      cameras.splice(idx,1);
      renderCameraTable();
    }, Elements.tableWrapper);
  }, {once:true});
});

// ==== Drag & Drop ====
function enableDrag(row){
  const h = row.querySelector('.handle');
  if (!h) return;
  h.draggable = true;
  h.addEventListener('dragstart', e => {
    row.classList.add('draggingSet');
    Elements.indicator.style.opacity = '1';
    Elements.indicator.style.transform = 'scaleX(1)';
    const img = new Image();
    img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAE0lEQVR42mP8/5+hHgAHggJ/lBcMtQAAAABJRU5ErkJggg==';
    e.dataTransfer.setDragImage(img, 0, 0);
  });
  h.addEventListener('dragend', () => {
    row.classList.remove('draggingSet');
    Elements.indicator.style.opacity = '0';
    Elements.indicator.style.transform = 'scaleX(.6)';
  });
}
function recordPos() {
  const m=new Map();Elements.tbody.querySelectorAll('tr').forEach(r => m.set(r, r.getBoundingClientRect().top));
  return m;
}
function playFLIP(prev){
  Elements.tbody.querySelectorAll('tr').forEach(r => {
    const dy = prev.get(r) - r.getBoundingClientRect().top;
    if (dy) {
      r.style.transform = `translateY(${dy}px)`;
      r.style.transition = 'transform .3s cubic-bezier(.4,0,.2,1)';
      requestAnimationFrame(() => r.style.transform = '');
      r.addEventListener('transitionend',() => r.style.transition = '', {once:true});
      }
  });
}
Elements.tbody.addEventListener('dragover', e => {
  e.preventDefault();
  const draggingSet = Elements.tbody.querySelector('.draggingSet');
  if (!draggingSet) return;
  const rows = [...Elements.tbody.querySelectorAll('tr:not(.draggingSet)')];
  const target = rows.find(r => e.clientY <= r.getBoundingClientRect().top + r.offsetHeight / 2);
  const base = Elements.tableWrapper.getBoundingClientRect().top;
  Elements.indicator.style.top = (target ? target.getBoundingClientRect().top : (rows.pop() || draggingSet).getBoundingClientRect().bottom) - base + 'px';
});
Elements.tbody.addEventListener('drop', e => {
  e.preventDefault();
  const draggingSet = Elements.tbody.querySelector('.draggingSet');
  if (!draggingSet) return;
  const prev = recordPos();
  const rows = [...Elements.tbody.querySelectorAll('tr:not(.draggingSet)')];
  const target = rows.find(r => e.clientY <= r.getBoundingClientRect().top + r.offsetHeight / 2);
  const draggingIdx = [...Elements.tbody.children].indexOf(draggingSet);
  const targetIdx = target ? [...Elements.tbody.children].indexOf(target) : cameras.length-1;
  // Перемещаем в массиве cameras
  const cam = cameras.splice(draggingIdx,1)[0];
  cameras.splice(targetIdx,0,cam);
  renderCameraTable();
  playFLIP(prev);
  Elements.indicator.style.opacity = '0';
  Elements.indicator.style.transform = 'scaleX(.6)';
});

// ==== Inputs ====
function updateEmpty(i) {
  const td = i.closest('.ip-cell');
  if(td)td.classList.toggle('is-empty', !i.value.trim());
}
function convertToDammy(row) {
  const idx = [...Elements.tbody.children].indexOf(row);
  cameras[idx] = normalizeCameraData({ ip: 'dammy', stream:'' , name: '' });
  renderCameraTable();
}
function initInputs(list) {
  list.forEach(i => {
    updateEmpty(i);
    i.addEventListener('focus', e => {
      const r = e.target.getBoundingClientRect();
      i.style.setProperty('--ix', ((e.clientX - r.left) / r.width * 100).toFixed(0) + '%'); 
      i.style.setProperty('--iy', ((e.clientY - r.top) / r.height * 100).toFixed(0) + '%');
      i.classList.add('is-focused');
    });
    i.addEventListener('blur', () => {
      i.classList.remove('is-focused');
      if (i.closest('.ip-cell')) {
        i.value = normalizeCameraIp(i.value);
        const row = i.closest('tr');
        const idx = [...Elements.tbody.children].indexOf(row);
        if (idx !== -1 && cameras[idx]) cameras[idx].ip = i.value;
        capturePrinterMacForInput(i);
      }
    });
    i.addEventListener('input', () => {
      updateEmpty(i);
      if (i.closest('.ip-cell') && i.value.trim().toLowerCase() === 'dammy'){
        animateHeight(() => convertToDammy(i.closest('tr')),Elements.tableWrapper);
      } else {
        // обновить cameras при изменении
        const row = i.closest('tr');
        const idx = [...Elements.tbody.children].indexOf(row);
        if (row && cameras[idx]) {
          if (i.classList.contains('stream-input')) cameras[idx].stream = i.value.trim();
          else if (i.closest('.ip-cell')) cameras[idx].ip = i.value.trim();
          else cameras[idx].name = i.value.trim();
        }
      }
    });
  });
}
initInputs(document.querySelectorAll('.dynamic-input'));

// ==== Stream toggle ====
function initStreamToggle(btn) {
  if (!btn) return;
  const input = btn.previousElementSibling;
  const ORIGINAL = ':8080/?action=stream';
  const ALT = ':8080/stream';
  btn.addEventListener('click',() => {
    const c = input.value.trim();
    input.value = !c || c.endsWith(ALT) ? ORIGINAL : ALT;
    input.focus();
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
  });
}
document.querySelectorAll('.stream-toggle').forEach(initStreamToggle);

// ==== IP recovery / MAC matching ====
function normalizeMac(value) {
  const raw = String(value || '').trim();
  const separated = raw.match(/([0-9a-f]{2}[:-]){5}[0-9a-f]{2}/i);
  if (!separated) return '';
  return separated[0].replace(/-/g, ':').toUpperCase();
}

function findMacInValue(value) {
  if (!value) return '';
  if (typeof value === 'string') return normalizeMac(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const mac = findMacInValue(item);
      if (mac) return mac;
    }
    return '';
  }
  if (typeof value === 'object') {
    for (const item of Object.values(value)) {
      const mac = findMacInValue(item);
      if (mac) return mac;
    }
  }
  return '';
}

function normalizePrinterAddress(value) {
  return String(value || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
}

function extractIPv4(value) {
  const match = String(value || '').match(/\b(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}\b/);
  return match ? match[0] : '';
}

function getSubnetPrefix(ip) {
  const ipv4 = extractIPv4(ip);
  if (!ipv4) return '';
  return ipv4.split('.').slice(0, 3).join('.');
}

function getScanSubnets(camArr = cameras) {
  const subnets = new Set();
  camArr.forEach(cam => {
    const normalized = normalizeCameraData(cam);
    if (!normalized.ip || normalized.ip === 'dammy') return;
    const subnet = getSubnetPrefix(normalized.ip);
    if (subnet) subnets.add(subnet);
  });
  return [...subnets];
}

function getStreamUrlForProbe(ip, stream = '') {
  const host = normalizePrinterAddress(ip).split('/')[0];
  const streamPart = stream && stream.startsWith(':') ? stream : (stream || ':8080/?action=stream');
  const baseHost = streamPart.startsWith(':') ? host.split(':')[0] : host;
  return `http://${baseHost}${streamPart}`;
}

function fetchWithTimeout(url, options = {}, timeout = 1200) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = setTimeout(() => controller?.abort(), timeout);
  return fetch(url, { ...options, signal: controller?.signal })
    .finally(() => clearTimeout(timer));
}

function probeImageUrl(url, timeout = 1200) {
  return new Promise(resolve => {
    const img = new Image();
    const timer = setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      img.src = '';
      resolve(false);
    }, timeout);
    img.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    img.src = url + (url.includes('?') ? '&' : '?') + '_probe=' + Date.now();
  });
}

async function checkPrinterConnection(ip, stream = '', timeout = 1500) {
  const host = normalizePrinterAddress(ip);
  if (!host || host.toLowerCase() === 'dammy') return false;
  const streamOk = await probeImageUrl(getStreamUrlForProbe(host, stream), timeout);
  if (streamOk) return true;
  try {
    await fetchWithTimeout(`http://${host}`, { mode: 'no-cors', cache: 'no-store' }, timeout);
    return true;
  } catch {
    return false;
  }
}

async function fetchJsonIfReadable(url, timeout = 1200) {
  const response = await fetchWithTimeout(url, { cache: 'no-store' }, timeout);
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getAppApiUrl(path) {
  return window.PrintVisualApi?.getAppApiUrl?.(path) || '';
}

async function fetchAppApiJson(path, options = {}, timeout = 1500) {
  return window.PrintVisualApi?.requestAppApiJson?.(path, { ...options, timeout }) || null;
}

const printerStatusPollCleanups = [];

function stopPrinterStatusPolling() {
  while (printerStatusPollCleanups.length > 0) {
    printerStatusPollCleanups.pop()?.();
  }
}

function startPrinterStatusPolling(card, address) {
  let stopped = false;
  let timer = null;
  const poll = async () => {
    try {
      const data = await window.PrintVisualApi?.fetchPrinterStatusFromAppApi?.(address, 1500);
      if (!stopped && data) window.updatePrinterCard?.(card.id, data);
    } catch {
      // Сохраняем последнее известное состояние при временном сетевом сбое.
    } finally {
      if (!stopped) timer = setTimeout(poll, 5000);
    }
  };

  void poll();
  const cleanup = () => {
    stopped = true;
    if (timer !== null) clearTimeout(timer);
  };
  printerStatusPollCleanups.push(cleanup);
}

async function probePrinterFromAppApi(address, timeout = 450) {
  try {
    return await window.PrintVisualApi?.probePrinterFromAppApi?.(address, timeout) === true;
  } catch {
    return false;
  }
}

function syncSettingsToAppApi(settings) {
  window.PrintVisualApi?.syncSettingsToAppApi?.(settings);
}

function hasMeaningfulSettings(settings) {
  return settings && typeof settings === 'object' && Object.keys(settings).length > 0;
}

function readLocalAppSettings() {
  const raw = localStorage.getItem('printerCamsV2');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function hydrateSettingsFromAppApi() {
  const api = window.PrintVisualApi;
  if (!api?.getSettingsFromAppApi || !api?.saveSettingsToAppApi) return 'unavailable';

  try {
    const serverSettings = await api.getSettingsFromAppApi(2500);
    if (hasMeaningfulSettings(serverSettings)) {
      localStorage.setItem('printerCamsV2', JSON.stringify(serverSettings));
      return 'server';
    }

    const localSettings = readLocalAppSettings();
    if (hasMeaningfulSettings(localSettings)) {
      await api.saveSettingsToAppApi(localSettings, 2500);
      return 'imported-local';
    }

    return 'empty';
  } catch {
    return 'fallback-local';
  }
}

async function fetchPrinterMac(ip, options = {}) {
  const host = normalizePrinterAddress(ip).split('/')[0];
  if (!host || host.toLowerCase() === 'dammy') return null;

  const timeout = options.timeout || 1200;
  try {
    const apiResult = await window.PrintVisualApi?.fetchPrinterMacFromAppApi?.(host, timeout);
    if (apiResult?.mac) return { mac: normalizeMac(apiResult.mac), source: apiResult.source || 'app-api' };
  } catch {
    // App API is unavailable; continue with browser-side fallbacks.
  }

  const endpoints = [
    `http://127.0.0.1:32117/mac?ip=${encodeURIComponent(host)}`,
    `http://localhost:32117/mac?ip=${encodeURIComponent(host)}`,
    `http://${host}/machine/system_info`,
    `http://${host}/server/info`,
    `http://${host}/printer/info`,
    `http://${host}/api/system/info`,
    `http://${host}/api/printer`
  ];

  for (const url of endpoints) {
    try {
      const data = await fetchJsonIfReadable(url, timeout);
      const mac = findMacInValue(data);
      if (mac) return { mac, source: url };
    } catch {
      // Endpoint unavailable or blocked by CORS; try the next strategy.
    }
  }
  return null;
}

function findCameraIndexByIdentity(cam) {
  const ip = normalizePrinterAddress(cam.ip);
  const name = cam.name || '';
  let idx = cameras.findIndex(item => normalizePrinterAddress(item.ip) === ip && (item.name || '') === name);
  if (idx !== -1) return idx;
  idx = cameras.findIndex(item => normalizePrinterAddress(item.ip) === ip);
  if (idx !== -1) return idx;
  return cameras.findIndex(item => (item.name || '') === name);
}

function savePrinterMac(rowIdx, mac, ip = '') {
  const normalizedMac = normalizeMac(mac);
  if (!normalizedMac || !cameras[rowIdx]) return false;
  cameras[rowIdx].mac = normalizedMac;
  cameras[rowIdx].lastSeenIp = extractIPv4(ip || cameras[rowIdx].ip) || normalizePrinterAddress(ip || cameras[rowIdx].ip);
  cameras[rowIdx].lastMacCheckAt = new Date().toISOString();
  saveToLocalStorage();
  return true;
}

async function capturePrinterMacForCamera(cam, options = {}) {
  const idx = findCameraIndexByIdentity(cam);
  if (idx === -1) return null;
  const current = cameras[idx];
  if (!current.ip || current.ip.toLowerCase() === 'dammy') return null;
  const connected = options.skipConnectionCheck || await checkPrinterConnection(current.ip, current.stream, options.timeout || 1500);
  if (!connected) {
    if (!options.silent || options.notifyFailure) {
      enqueueNotification(`Не удалось подключиться к <b>${current.name || current.ip}</b>: MAC не получен`, 'info');
    }
    return null;
  }
  current.lastSeenIp = extractIPv4(current.ip) || normalizePrinterAddress(current.ip);
  current.lastMacCheckAt = new Date().toISOString();
  const result = await fetchPrinterMac(current.ip, { timeout: options.timeout || 1500, silent: options.silent });
  if (result?.mac) {
    savePrinterMac(idx, result.mac, current.ip);
    if (!options.silent) enqueueNotification(`MAC принтера <b>${current.name || current.ip}</b> сохранён`, 'system');
    return result.mac;
  }
  saveToLocalStorage();
  if (!options.silent || options.notifyFailure) {
    enqueueNotification(`Подключение к <b>${current.name || current.ip}</b> есть, но MAC получить не удалось`, 'info');
  }
  return null;
}

async function capturePrinterMacForInput(input) {
  const row = input.closest('tr');
  const idx = [...Elements.tbody.children].indexOf(row);
  if (!row || !cameras[idx]) return;
  await capturePrinterMacForCamera(cameras[idx], { timeout: 1800 });
}

function updateCameraSettingsContainerHeight() {
  const mainWrap = Elements.mainWrap;
  const content = Elements.tableWrapper;
  if (!mainWrap || !content || !mainWrap.classList.contains('accordion-open')) return;
  if (content.style.maxHeight === 'none') return;

  requestAnimationFrame(() => {
    content.style.maxHeight = `${content.scrollHeight + 30}px`;
  });
}

if (Elements.ipRecoveryStatus) {
  const recoveryStatusObserver = new MutationObserver(updateCameraSettingsContainerHeight);
  recoveryStatusObserver.observe(Elements.ipRecoveryStatus, {
    attributes: true,
    attributeFilter: ['class']
  });

  const recoveryStatusResizeObserver = new ResizeObserver(updateCameraSettingsContainerHeight);
  recoveryStatusResizeObserver.observe(Elements.ipRecoveryStatus);
}

function showIpRecoveryProgress(label, percent = 0) {
  if (!Elements.ipRecoveryStatus) return;
  Elements.ipRecoveryStatus.classList.remove('hidden');
  updateIpRecoveryProgress(label, percent);
  updateCameraSettingsContainerHeight();
}

function updateIpRecoveryProgress(label, percent = 0) {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
  if (Elements.ipRecoveryStatusText) Elements.ipRecoveryStatusText.textContent = label;
  if (Elements.ipRecoveryPercent) Elements.ipRecoveryPercent.textContent = `${safePercent}%`;
  if (Elements.ipRecoveryProgressBar) Elements.ipRecoveryProgressBar.style.width = `${safePercent}%`;
}

function hideIpRecoveryProgress() {
  if (!Elements.ipRecoveryStatus) return;
  Elements.ipRecoveryStatus.classList.add('hidden');
  updateIpRecoveryProgress('Подготовка...', 0);
  updateCameraSettingsContainerHeight();
}

function setIpRecoveryBusy(isBusy) {
  State.ipRecoveryBusy = isBusy;
  if (!Elements.recoverPrinterIpsBtn) return;
  Elements.recoverPrinterIpsBtn.disabled = isBusy;
  Elements.recoverPrinterIpsBtn.style.opacity = isBusy ? '0.6' : '';
  Elements.recoverPrinterIpsBtn.style.pointerEvents = isBusy ? 'none' : '';
}

async function fetchLocalHelperSubnet(subnet, timeout = 1800) {
  const urls = [
    `http://127.0.0.1:32117/scan?subnet=${encodeURIComponent(subnet)}`,
    `http://localhost:32117/scan?subnet=${encodeURIComponent(subnet)}`
  ];
  for (const url of urls) {
    try {
      const data = await fetchJsonIfReadable(url, timeout);
      const devices = Array.isArray(data) ? data : (Array.isArray(data.devices) ? data.devices : []);
      return devices.map(device => ({
        ip: device.ip,
        reachable: true,
        mac: normalizeMac(device.mac || device.mac_address || ''),
        source: 'local-helper',
        nameHint: device.name || ''
      })).filter(device => device.ip);
    } catch {
      // Optional helper is not running.
    }
  }
  return [];
}

async function fetchAppApiNetworkScan(subnets, options = {}) {
  try {
    const devices = await window.PrintVisualApi?.scanNetworkWithAppApi?.(subnets, options) || [];
    return devices.map(device => ({
      ip: device.ip,
      reachable: Boolean(device.reachable),
      mac: normalizeMac(device.mac || ''),
      source: device.source || 'app-api',
      nameHint: device.nameHint || ''
    })).filter(device => device.ip);
  } catch {
    return null;
  }
}

async function scanDeviceAtIp(ip, options = {}) {
  const reachable = await checkPrinterConnection(ip, ':8080/?action=stream', options.probeTimeout || 700);
  if (!reachable) return { ip, reachable: false, mac: '', source: '', nameHint: '' };
  const macResult = await fetchPrinterMac(ip, { timeout: options.macTimeout || 900, silent: true });
  return { ip, reachable: true, mac: macResult?.mac || '', source: macResult?.source || 'http-probe', nameHint: '' };
}

async function runConcurrent(items, limit, worker, onProgress) {
  const results = [];
  let cursor = 0;
  let completed = 0;
  async function next() {
    while (cursor < items.length) {
      const currentIndex = cursor++;
      const result = await worker(items[currentIndex], currentIndex);
      if (result) results.push(result);
      completed++;
      onProgress?.(completed, items.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
  return results;
}

async function scanSubnetsForPrinters(subnets, options = {}) {
  const results = [];
  updateIpRecoveryProgress('Запуск серверного сканирования', 8);
  const serverResults = await fetchAppApiNetworkScan(subnets, options);
  if (serverResults) {
    updateIpRecoveryProgress('Серверное сканирование завершено', 80);
    return serverResults.filter(device => device.reachable);
  }

  for (let s = 0; s < subnets.length; s++) {
    const subnet = subnets[s];
    updateIpRecoveryProgress(`Проверка сети ${subnet}.0/24`, Math.round((s / subnets.length) * 100));
    const helperResults = await fetchLocalHelperSubnet(subnet);
    results.push(...helperResults);

    const ips = Array.from({ length: 254 }, (_, i) => `${subnet}.${i + 1}`);
    const subnetResults = await runConcurrent(
      ips,
      options.concurrency || 24,
      ip => scanDeviceAtIp(ip, options),
      (done, total) => {
        const subnetProgress = done / total;
        const totalProgress = ((s + subnetProgress) / subnets.length) * 80;
        updateIpRecoveryProgress(`Сканирование ${subnet}.0/24: ${done}/${total}`, totalProgress);
      }
    );
    results.push(...subnetResults.filter(device => device.reachable));
  }
  return results;
}

function buildMacDiscoveryMap(scanResults) {
  const macMap = new Map();
  const conflicts = new Map();
  scanResults.forEach(device => {
    const mac = normalizeMac(device.mac || '');
    if (!mac) return;
    const previous = macMap.get(mac);
    if (!previous) {
      macMap.set(mac, { ...device, mac });
      return;
    }
    const list = conflicts.get(mac) || [previous];
    list.push({ ...device, mac });
    conflicts.set(mac, list);
    macMap.set(mac, { ...previous, conflict: true, devices: list });
  });
  return { macMap, conflicts };
}

function matchSavedPrintersByMac(camArr, discovery) {
  const matches = [];
  camArr.forEach((cam, index) => {
    const normalized = normalizeCameraData(cam);
    const mac = normalizeMac(normalized.mac || '');
    if (!mac || normalized.ip === 'dammy') return;
    const device = discovery.macMap.get(mac);
    if (!device || device.conflict) return;
    const currentIp = extractIPv4(normalized.ip) || normalizePrinterAddress(normalized.ip);
    if (device.ip && device.ip !== currentIp) {
      matches.push({
        index,
        name: normalized.name || normalized.ip,
        oldIp: normalized.ip,
        newIp: replaceAddressHost(normalized.ip, device.ip),
        mac
      });
    }
  });
  return matches;
}

function replaceAddressHost(oldValue, newIp) {
  const normalized = normalizePrinterAddress(oldValue);
  const oldIp = extractIPv4(normalized);
  return oldIp ? normalized.replace(oldIp, newIp) : newIp;
}

function confirmIpReplacements(matches) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4';
    overlay.innerHTML = `
      <div class="modal-glass rounded-2xl w-full max-w-xl border border-[rgb(var(--avg-light-rgb)/0.9)] shadow-2xl p-6 modal-fade-in">
        <div class="flex items-center gap-3 mb-4">
          <i data-lucide="refresh-cw" class="w-7 h-7 text-[rgb(var(--tetrad2-light-rgb))]"></i>
          <h2 class="text-xl font-semibold text-[rgb(var(--textW1-rgb))]">Найдены новые IP</h2>
        </div>
        <p class="text-[rgb(var(--textW1-rgb)/0.85)] mb-4">Будут заменены адреса для этих принтеров:</p>
        <div class="space-y-2 max-h-64 overflow-auto pr-1">
          ${matches.map(item => `
            <div class="rounded-xl border border-[rgb(var(--white)/0.1)] bg-[rgb(var(--white)/0.08)] p-3 text-sm text-[rgb(var(--textW1-rgb))]">
              <div class="font-semibold">${item.name}</div>
              <div class="font-mono text-xs mt-1">${item.oldIp} -> ${item.newIp}</div>
            </div>
          `).join('')}
        </div>
        <div class="mt-6 flex gap-3 justify-end">
          <button type="button" data-action="cancel" class="glass-btn btn-3d text-white-castom font-semibold px-5 py-3 rounded-xl hover:text-white-castom transition-all duration-200">Отмена</button>
          <button type="button" data-action="confirm" class="glass-btn btn-3d text-white-castom font-semibold px-5 py-3 rounded-xl hover:bg-gradient-to-br hover:from-green-400 hover:to-emerald-500/60 hover:text-white-castom transition-all duration-200">Заменить IP</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    lucide.createIcons && lucide.createIcons();

    function close(value) {
      overlay.remove();
      document.removeEventListener('keydown', onKeydown);
      resolve(value);
    }
    function onKeydown(e) {
      if (e.key === 'Escape') close(false);
    }
    overlay.addEventListener('click', e => {
      if (e.target === overlay || e.target.closest('[data-action="cancel"]')) close(false);
      if (e.target.closest('[data-action="confirm"]')) close(true);
    });
    document.addEventListener('keydown', onKeydown);
  });
}

function applyIpReplacements(matches) {
  const now = new Date().toISOString();
  let previousSettings = {};
  try {
    previousSettings = JSON.parse(localStorage.getItem('printerCamsV2') || '{}');
  } catch {
    previousSettings = {};
  }
  previousSettings.streamToggles = previousSettings.streamToggles || {};
  matches.forEach(item => {
    if (!cameras[item.index]) return;
    if (Object.prototype.hasOwnProperty.call(previousSettings.streamToggles, item.oldIp)) {
      previousSettings.streamToggles[item.newIp] = previousSettings.streamToggles[item.oldIp];
      delete previousSettings.streamToggles[item.oldIp];
    }
    cameras[item.index].ip = item.newIp;
    cameras[item.index].lastSeenIp = extractIPv4(item.newIp) || normalizePrinterAddress(item.newIp);
    cameras[item.index].lastMacCheckAt = now;
  });
  localStorage.setItem('printerCamsV2', JSON.stringify(previousSettings));
  saveToLocalStorage();
}

async function recoverPrinterIpsByMac() {
  if (State.ipRecoveryBusy) return;
  setIpRecoveryBusy(true);
  try {
    showIpRecoveryProgress('Подготовка списка принтеров', 3);
    const savedPrinters = getCameraTableData().filter(cam => cam.ip && cam.ip !== 'dammy' && normalizeMac(cam.mac || ''));
    if (savedPrinters.length === 0) {
      enqueueNotification('Сначала нужно сохранить MAC хотя бы для одного принтера', 'info');
      hideIpRecoveryProgress();
      return;
    }

    const subnets = getScanSubnets(savedPrinters);
    if (subnets.length === 0) {
      enqueueNotification('Не удалось определить подсеть из текущих IP-адресов', 'error');
      hideIpRecoveryProgress();
      return;
    }

    updateIpRecoveryProgress(`Найдено сетей для проверки: ${subnets.length}`, 8);
    const scanResults = await scanSubnetsForPrinters(subnets, { concurrency: 24, macTimeout: 900, probeTimeout: 700 });
    updateIpRecoveryProgress('Сопоставление MAC-адресов', 86);
    const discovery = buildMacDiscoveryMap(scanResults);
    const matches = matchSavedPrintersByMac(cameras, discovery);

    if (matches.length === 0) {
      enqueueNotification('Новых IP для сохранённых MAC не найдено', 'info');
      hideIpRecoveryProgress();
      return;
    }

    updateIpRecoveryProgress('Ожидание подтверждения', 92);
    const confirmed = await confirmIpReplacements(matches);
    if (!confirmed) {
      enqueueNotification('Замена IP отменена', 'info');
      hideIpRecoveryProgress();
      return;
    }

    updateIpRecoveryProgress('Обновление сохранённых адресов', 100);
    applyIpReplacements(matches);
    enqueueNotification(`Обновлено IP-адресов: <b>${matches.length}</b>`, 'system');
    setTimeout(() => location.reload(), 800);
  } catch (error) {
    console.error(error);
    enqueueNotification('Не удалось завершить восстановление IP', 'error');
    hideIpRecoveryProgress();
  } finally {
    setIpRecoveryBusy(false);
  }
}

// ==== Сбор данных из таблицы ====
function getCameraTableData() {
  // Возвращает актуальный cameras (ip и name)
  return cameras.map((c, index) => ({
    ip: c.ip,
    stream: c.stream,
    name: c.name,
    mac: normalizeMac(c.mac || ''),
    lastSeenIp: c.lastSeenIp || '',
    lastMacCheckAt: c.lastMacCheckAt || '',
    order: index
  }));
}

// ==== Инициализация ====
function loadCameras(initialCameras) {
  cameras = initialCameras.map(normalizeCameraData);
  renderCameraTable();
}
  let isModalOpen = false;
  function closeModal() {
    Elements.resetConfirmModal.classList.add('hidden');
    const modal = document.getElementById('cameraSettingsModal');
    if (!modal) return;
    document.body.focus();
    const focusableElements = modal.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusableElements.forEach(el => el.blur());
    modal.classList.add('invisible', 'opacity-0');
    modal.setAttribute('aria-hidden', 'true');
    const contentDiv = modal.querySelector('.flex-1');
    if (contentDiv) contentDiv.innerHTML = '';
    isModalOpen = false;
  }
// === RENDER CAMERAS ===
const namedDrivInput = document.getElementById('namedDriv');
const namedDrivValueDisplay = document.getElementById('namedDrivValue');

// Функция обновления размера шрифта
function updateCameraTitleFontSize() {
  const fontSize = namedDrivInput.value;
  document.querySelectorAll('.camera-box .camera-title').forEach(title => {
    title.style.fontSize = `${fontSize}rem`;
  });
  namedDrivValueDisplay.textContent = `${fontSize}rem`;
  document.documentElement.style.setProperty('--named-driv-font-size', `${fontSize}rem`);
}

// Обработчик изменения ползунка
namedDrivInput.addEventListener('input', () => {
  updateCameraTitleFontSize();
});

// === Функция обновления статуса индикатора ===
function updateStatusIndicator(dotElement, status) {
  dotElement.classList.remove('initial', 'warning', 'disconnected', 'connect');
  switch(status) {
    case 'connect':
      dotElement.classList.add('connect');
      dotElement.title = 'Онлайн';
      break;
    case 'warning':
      dotElement.classList.add('warning');
      dotElement.title = 'Ошибка видеопотока';
      break;
    case 'error':
    case 'disconnected':
      dotElement.classList.add('disconnected');
      dotElement.title = 'Оффлайн';
      break;
    case 'initial':
    default:
      dotElement.classList.add('initial');
      dotElement.title = 'Ожидание подключения';
  }
}

/**
 * Функция для отрисовки карточек камер с поддержкой drag-and-drop, полноэкранного режима, модального окна и параллакса.
 * Повторяющийся функционал вынесен в отдельные функции, структура кода логически разбита на блоки.
 */
function renderCameras() {
  // === Инициализация и сортировка ===
  stopPrinterStatusPolling();
  Elements.cameraContainer.innerHTML = '';
  const cameras = getCameraTableData();
  const savedSettings = JSON.parse(localStorage.getItem('printerCamsV2'));
  let orderedCameras = [...cameras];

  if (savedSettings && savedSettings.cameraOrder) {
    const orderMap = {};
    savedSettings.cameraOrder.forEach((cam, index) => { orderMap[cam.ip] = index; });
    orderedCameras.sort((a, b) => (orderMap[a.ip] ?? Infinity) - (orderMap[b.ip] ?? Infinity));
  }

  let loadedCount = 0;
  const totalCameras = cameras.length;

  if (totalCameras === 0) {
    hideLoader();
    return;
  }

  // === Вспомогательные функции для генерации данных карточки ===
  function stripPort(ip) {
    return (ip || '').split(':')[0];
  }
  function stripIpFromStream(stream) {
    if (!stream) return '';
    if (stream.startsWith(':')) return stream;
    const idx = stream.indexOf(':');
    if (idx !== -1) return stream.slice(idx);
    return stream;
  }
  function getStreamUrl(ip, stream) {
    const ipWithoutPort = stripPort(ip || '');
    const streamPart = stripIpFromStream(stream || '');
    return `http://${ipWithoutPort}${streamPart}`;
  }

  // === Функции для парраллакса и анимаций карточек ===
  function handleMouseEnter(camDiv, cam, e) {
    if (cam.ip === 'dammy' || document.fullscreenElement) return;
    const rect = camDiv.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = (x / rect.width) - 0.5;
    const yc = (y / rect.height) - 0.5;
    camDiv.style.transition = 'transform 50ms ease-out';
    camDiv.style.transform = `
      perspective(600px) 
      rotateY(${xc * 20}deg) 
      rotateX(${yc * -16}deg) 
      scale(1.08)
    `;
    const img = camDiv.querySelector('.camera-img img');
    if (img) {
      img.style.transition = 'transform 50ms ease-out';
      img.style.transform = `
        scale(1.15) 
        translate(${xc * 22}px, ${yc * 18}px) 
        rotateZ(${xc * yc * 9}deg)
      `;
    }
  }
  function handleMouseLeave(camDiv, cam) {
    if (cam.ip === 'dammy') return;
    camDiv.style.transition = 'transform .38s cubic-bezier(.4,0,.2,1)';
    camDiv.style.transform = 'perspective(500px) scale(1) rotateY(0deg) rotateX(0deg)';
    const img = camDiv.querySelector('.camera-img img');
    if (img) {
      img.style.transition = 'transform .44s cubic-bezier(.42,1.8,.2,1)';
      img.style.transform = 'scale(1)';
    }
  }

  // === Работа с полноэкранным режимом ===
  let currentFullscreenCamera = null;
  let isFullscreen = false;
  document.removeEventListener('fullscreenchange', syncFullscreenFlag); // remove old listeners if re-rendered
  function syncFullscreenFlag() {
    isFullscreen = !!document.fullscreenElement;
    if (!isFullscreen && currentFullscreenCamera) {
      currentFullscreenCamera.classList.remove('fullscreen');
      // Restore heights when exiting fullscreen
      updateInterfaceHeight();
      currentFullscreenCamera = null;
      // Prevent unwanted toolbar style modifications after exiting fullscreen
      clearToolbarInlineStyles();
    }
  }
  document.addEventListener('fullscreenchange', syncFullscreenFlag);

  // Function to clear inline styles from toolbar elements
  function clearToolbarInlineStyles() {
    setTimeout(() => {
      const toolbars = document.querySelectorAll('[data-fa-i2svg]');
      toolbars.forEach(toolbar => {
        toolbar.style.color = '';
      });
    }, 100);
  }

  // Call clearToolbarInlineStyles when settings are changed
  const originalSaveToLocalStorage = saveToLocalStorage;
  saveToLocalStorage = function() {
    clearToolbarInlineStyles();
    return originalSaveToLocalStorage.apply(this, arguments);
  };

  function enterFullscreen(cameraElement) {
    if (!cameraElement) {
      console.warn("Нет элемента для полноэкранного режима");
      return;
    }
    
    // Reset fixed heights when entering fullscreen
    const cameraImg = cameraElement.querySelector('.camera-img');
    if (cameraImg) {
      cameraImg.style.minHeight = '';
      cameraImg.style.height = '';
    }
    const img = cameraElement.querySelector('img');
    if (img) {
      img.style.minHeight = '';
    }
    
    cameraElement.classList.add('fullscreen');
    cameraElement.requestFullscreen()
      .then(() => {
        isFullscreen = true;
        currentFullscreenCamera = cameraElement;
      })
      .catch(err => {
        console.error('Ошибка полноэкранного режима:', err);
        enqueueNotification("Не удалось войти в полноэкранный режим", "error");
      });
  }

  // === Работа с модальным окном ===

  // === Глобальные переменные для управления видеопотоками ===
  let videoStreams = new Map(); // Хранит оригинальные src для восстановления

  // === Модифицированная функция открытия модального окна ===
  function openModal(camera) {
    // 1. Останавливаем все видеопотоки
    stopAllVideoStreams();
    
    const modal = document.getElementById('cameraSettingsModal');
    if (!modal) return;
    
    modal.classList.remove('invisible', 'opacity-0');
    modal.setAttribute('aria-hidden', 'false');
    
    // Вставка контента (iframe)
    const contentDiv = modal.querySelector('.flex-1');
    let ip = '';
    
    if (camera) {
      const camName = camera.dataset.name || '';
      const rows = Elements.tbody.querySelectorAll('tr:not(.dammy-slot)');
      for (let tr of rows) {
        const ipInput = tr.querySelector('.ip-cell input');
        const nameInput = tr.querySelector('td input:not(.ip-cell input):not(.stream-input)');
        if (ipInput && nameInput && nameInput.value === camName) {
          ip = ipInput.value.trim();
          break;
        }
      }
      if (!ip) ip = camera.dataset.ip || '';
    }
    
    contentDiv.innerHTML = '';
    if (ip && ip !== 'dammy') {
      const iframe = document.createElement('iframe');
      iframe.src = `http://${ip}`;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.background = '#222';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = "no-referrer";
      contentDiv.appendChild(iframe);
    } else {
      contentDiv.textContent = 'Неверный или отсутствует IP-адрес камеры.';
    }
    
    // Фокус на первый элемент
    const firstFocusable = modal.querySelector('button, input, [tabindex]');
    if (firstFocusable) firstFocusable.focus();
    isModalOpen = true;
    
    // Обработчики expand/manage/close внутри модала
    const expandBtn = modal.querySelector('.expand-icon');
    const manageBtn = modal.querySelector('.manage-icon');
    
    function handleExpand() { 
      closeModal(); 
      enterFullscreen(camera); 
    }
    function handleManage() { 
      closeModal(); 
      openModal(camera); 
    }
    
    if (expandBtn) {
      const newExpand = expandBtn.cloneNode(true); 
      expandBtn.replaceWith(newExpand);
      newExpand.addEventListener('click', handleExpand);
    }
    if (manageBtn) {
      const newManage = manageBtn.cloneNode(true); 
      manageBtn.replaceWith(newManage);
      newManage.addEventListener('click', handleManage);
    }
    
    // Закрытие
    const closeBtn = modal.querySelector('.manage-icon');
    const closeModalHandler = () => { closeModal(); };
    if (closeBtn) closeBtn.addEventListener('click', closeModalHandler);
    
    function escapeHandler(e) {
      if (e.key === 'Escape') {
        closeModalHandler();
        document.body.focus();
      }
    }
    document.addEventListener('keydown', escapeHandler, { once: true });
  }

  // === Функция остановки всех видеопотоков ===
  function stopAllVideoStreams() {
    if (!Elements.offFullCheckbox.checked) return;

    const allImages = document.querySelectorAll('.camera-box .camera-img img');
    
    // Очищаем предыдущие данные
    videoStreams.clear();
    pendingRestores = 0; // На старте — нет активных восстановлений

    allImages.forEach(img => {
        const cameraBox = img.closest('.camera-box');
        const streamToggle = cameraBox?.querySelector('.stream-toggle-input');
        
        // Останавливаем только потоки, которые не отключены индивидуальными переключателями
        if (img.src && !img.src.startsWith('data:') && 
            (!streamToggle || streamToggle.checked)) {
            videoStreams.set(img, img.src);
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            pendingRestores++;
            pendingRestores++; // Увеличиваем счётчик для КАЖДОГО остановленного потока
        }
    });

    // Включаем подавление уведомлений
    suppressNotifications = true;
  }

  // === Функция восстановления всех видеопотоков ===
  function restoreAllVideoStreams() {
    if (!Elements.offFullCheckbox.checked || pendingRestores === 0) return;

    videoStreams.forEach((originalSrc, img) => {
        const cameraBox = img.closest('.camera-box');
        const streamToggle = cameraBox?.querySelector('.stream-toggle-input');
        
        // Восстанавливаем только потоки, которые не отключены индивидуальными переключателями
        if (!streamToggle || streamToggle.checked) {
            const separator = originalSrc.includes('?') ? '&' : '?';
            const newSrc = originalSrc + separator + '_t=' + Date.now();

            // Создаём обработчик один раз
            const onLoad = () => {
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onLoad);
                pendingRestores--; // Один из потоков успешно восстановлен

                // Если все потоки восстановились — снимаем блокировку
                if (pendingRestores <= 0) {
                    suppressNotifications = false;
                    pendingRestores = 0;
                }
            };

            img.addEventListener('load', onLoad);
            img.addEventListener('error', onLoad);

            img.src = newSrc;
        } else {
            // Если поток отключен индивидуальным переключателем, не восстанавливаем его
            pendingRestores--;
            if (pendingRestores <= 0) {
                suppressNotifications = false;
                pendingRestores = 0;
            }
        }
    });

    videoStreams.clear();
  }

  // === Модифицированная функция закрытия модального окна ===
  function closeModal() {
    const modal = document.getElementById('cameraSettingsModal');
    if (!modal) return;

    // Восстанавливаем видеопотоки
    restoreAllVideoStreams();

    // Ждем выполнения всех действий и закрываем модалку
    setTimeout(() => {
      document.body.focus();
      const focusableElements = modal.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      focusableElements.forEach(el => el.blur());
      
      modal.classList.add('invisible', 'opacity-0');
      modal.setAttribute('aria-hidden', 'true');
      
      const contentDiv = modal.querySelector('.flex-1');
      if (contentDiv) contentDiv.innerHTML = '';
      
      isModalOpen = false;
    }, 400); // Увеличена задержка для обработки всех действий
  }

  // === Дополнительно: обновим обработчики закрытия ===
  // Escape handler также должен использовать новую closeModal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isModalOpen) {
      e.preventDefault();
      closeModal();
    }
  });

  // Обработчик клика на backdrop
  document.getElementById('cameraSettingsModal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  });

  // === Основной цикл по камерам ===
  orderedCameras.forEach((cam, idx) => {
    const camDiv = document.createElement('article');
    camDiv.className = "camera-box group relative bg-cams rounded-xl shadow-lg flex items-stretch overflow-hidden transition hover:scale-105 cursor-grab camera-disconnected";
    //camDiv.style = "pointerEvents:none; ";
    camDiv.setAttribute('draggable', 'true');
    camDiv.dataset.ip = cam.ip;
    camDiv.dataset.name = cam.name;
    camDiv.dataset.stream = cam.stream;
    camDiv.dataset.mac = cam.mac || '';
    camDiv.id = `printer-card-${encodeURIComponent(cam.ip || `camera-${idx}`)}`;
    camDiv._parallaxEnabled = true;

    const isDammy = cam.ip === 'dammy';
    const streamUrl = isDammy ? '' : getStreamUrl(cam.ip, cam.stream);
    if (isDammy) {
      camDiv.classList.add('dammy');
      camDiv.style.opacity = '0';
      camDiv.style.transition = 'opacity .2s ease, transform .2s ease';
      camDiv.innerHTML = `
        <div class="camera-img relative w-full h-full flex items-center justify-center min-h-[180px]">
          <div class="bottom-glass"></div>
        </div>
      `;
    } else {
      camDiv.innerHTML = `
        <div class="camera-img relative w-full h-full flex items-center justify-center min-h-[180px]">
          <img src="${streamUrl}" 
            alt="${cam.name||'Принтер'}"
            class="w-full h-full object-cover transition group-hover:brightness-95 duration-300 absolute top-0 left-0 hidden"
            style="min-height:180px; max-height:100%; display:none; pointer-events:none;"/>
          <div class="zone-right">
            <div class="action-icon expand-icon" title="Развернуть" tabindex="0" role="button"><i class="fas fa-expand"></i></div>
            <div class="action-icon manage-icon" title="Управление" tabindex="0" role="button"><i class="fas fa-cog"></i></div>
            <div class="stream-toggle-container" title="Включить/выключить видеопоток">
              <label class="switch">
                <input type="checkbox" class="stream-toggle-input" ${loadStreamToggleState(cam.ip) ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="bottom-glass"></div>
          <div class="status-dot initial" title="Ожидание подключения" data-ip="${cam.ip}"></div>
          <div class="printer-temperatures" aria-label="Температуры принтера">
            <div class="printer-temperature">
              <svg class="printer-temperature-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 16h16v3H4v-3Zm2-3h12l-1.5-7h-9L6 13Zm3-5h6l.65 3h-7.3L9 8Z"></path></svg>
              <span data-printer-bed-temperature>—</span>
            </div>
            <div class="printer-temperature">
              <svg class="printer-temperature-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 3h6v7.2a5 5 0 1 1-6 0V3Zm2 2v6.35l-.65.48a3 3 0 1 0 3.3 0L13 11.35V5h-2Z"></path></svg>
              <span data-printer-extruder-temperatures>—</span>
            </div>
          </div>
          <div class="printer-filename" data-printer-filename aria-hidden="true"></div>
          <div class="printer-progress" data-printer-progress-bar role="progressbar" aria-label="Прогресс печати" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" hidden>
            <span class="printer-progress-fill" data-printer-progress-fill></span>
          </div>
          <div class="camera-title"><span class="camera-title-text"></span><span class="printer-progress-label" data-printer-progress-label>0%</span></div>
      `;
      const titleText = camDiv.querySelector('.camera-title-text');
      if (titleText) titleText.textContent = cam.name || 'Без имени';
    }

    const img = camDiv.querySelector('img');
    const statusDot = camDiv.querySelector('.status-dot');
    const expandIcon = camDiv.querySelector('.expand-icon');
    const manageIcon = camDiv.querySelector('.manage-icon');
    const streamToggle = camDiv.querySelector('.stream-toggle-input');


    // === Параллакс и эффекты ===
    let parallaxFrame = null;
    let latestPointerEvent = null;
    const scheduleParallax = (event) => {
      latestPointerEvent = event;
      if (parallaxFrame !== null) return;
      parallaxFrame = requestAnimationFrame(() => {
        parallaxFrame = null;
        if (latestPointerEvent) handleMouseEnter(camDiv, cam, latestPointerEvent);
      });
    };
    camDiv.addEventListener('mousemove', scheduleParallax);
    camDiv.addEventListener('mouseleave', () => {
      if (parallaxFrame !== null) cancelAnimationFrame(parallaxFrame);
      parallaxFrame = null;
      latestPointerEvent = null;
      handleMouseLeave(camDiv, cam);
    });
    camDiv.addEventListener('fullscreenchange', () => {
      camDiv._parallaxEnabled = !document.fullscreenElement;
    });

    // === Кнопки и эффекты на не-dammy карточках ===
    if (!isDammy) {
      // === Загрузка изображения и обработка ошибок ===
      let streamRetryAttempted = false;
      let printerReachable = false;
      img.onerror = async () => {
        if (!streamRetryAttempted) {
          streamRetryAttempted = true;
          printerReachable = await probePrinterFromAppApi(cam.ip, 450);
          if (printerReachable) {
            const separator = streamUrl.includes('?') ? '&' : '?';
            img.src = `${streamUrl}${separator}_retry=${Date.now()}`;
            return;
          }
        }

        loadedCount++;
        Promise.resolve(printerReachable)
        .then(reachable => {
          if (!reachable) throw new Error('Printer is unreachable');
          camDiv.classList.remove('camera-disconnected');
          camDiv.style.pointerEvents = 'auto';

          // Оставляем параллакс и стили (НЕ ставим camera-disconnected)
          if (statusDot && !camDiv.dataset.printerState) {
            updateStatusIndicator(statusDot, 'warning');
          }
          if (expandIcon) {
            expandIcon.classList.add('btn-disabled');
            expandIcon.setAttribute('aria-disabled', 'true');
            expandIcon.style.pointerEvents = 'none';
            expandIcon.style.opacity = '0.6';
          }
          if (manageIcon) {
            manageIcon.classList.remove('btn-disabled');
            manageIcon.removeAttribute('aria-disabled');
            manageIcon.style.pointerEvents = '';
            manageIcon.style.opacity = '';
          }
          capturePrinterMacForCamera(cam, { skipConnectionCheck: true, silent: true, notifyFailure: true, timeout: 1200 });
          // Показать заглушку/ссылку вместо видео:
          let stub = camDiv.querySelector('.camera-stub');
          if (!stub) {
            stub = document.createElement('div');
            stub.className = 'camera-stub flex items-center justify-center w-full h-full font-semibold rounded-lg';
            stub.style.position = 'absolute';
            stub.style.top = 0;
            stub.style.left = 0;
            stub.style.right = 0;
            stub.style.bottom = 0;
            stub.innerHTML = `<section class="anim-border w-full">
                        <div class="flex flex-col items-center">

                          <!-- SVG Icon (сохранили) -->
                          <svg class="w-16 h-16 icon-pulse" viewBox="0 0 512 512" aria-hidden="true" focusable="false" fill="url(#bezelGrad2)">
                            <defs>
                              <linearGradient id="bezelGrad2" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%"  stop-color="rgb(var(--base1-light-rgb))"/>
                                <stop offset="100%" stop-color="rgb(var(--base2-light-rgb))"/>
                              </linearGradient>
                            </defs>
                            <g transform="translate(0,512) scale(0.1,-0.1)" stroke="none">
                              <path d="M2810 4951 c-69 -21 -122 -66 -156 -131 -13 -25 -19 -68 -23 -153 -6 109 -8 -120 -30 -138 -13 -11 -39 -19 -58 -19 -30 0 -46 10 -107 69 -82 81 -140 111 -211 111 -80 0 -137 -34 -247 -146 -84 -87 -98 -106 -113 -158 -30 -103 -4 -178 101 -287 51 -52 64 -72 64 -96 0 -74 -32 -93 -162 -93 -77 0 -102 -4 -144 -24 -104 -48 -144 -133 -144 -302 0 -131 13 -188 55 -245 51 -70 104 -92 243 -99 104 -5 115 -7 133 -29 11 -13 19 -39 19 -58 0 -31 -11 -47 -75 -114 -61 -64 -77 -88 -91 -135 -32 -112 -2 -184 135 -317 82 -80 107 -98 151 -111 67 -20 83 -20 149 0 41 12 69 31 130 90 68 65 83 74 115 74 26 0 44 -7 61 -25 23 -22 25 -32 25 -118 0 -118 19 -176 76 -233 57 -57 115 -74 259 -74 130 0 193 16 249 62 61 50 86 115 86 226 0 129 19 162 92 162 24 0 46 -14 101 -66 84 -80 137 -106 217 -105 85 0 122 20 227 124 106 103 132 145 140 223 9 80 -16 134 -104 226 -62 65 -73 82 -73 111 0 19 9 45 19 58 18 22 29 24 138 29 106 5 124 9 166 33 100 59 126 122 126 307 1 121 -2 140 -23 186 -27 59 -90 116 -145 132 -21 7 -80 12 -130 12 -89 0 -94 1 -122 29 -48 49 -41 79 40 165 80 84 100 119 108 186 11 97 -7 132 -136 261 -129 129 -164 147 -261 136 -67 -8 -102 -28 -186 -108 -86 -81 -116 -88 -165 -40 -28 28 -29 33 -29 122 0 50 -5 109 -12 130 -16 55 -73 118 -132 145 -46 21 -64 24 -186 23 -74 0 -146 -4 -160 -8z m289 -166 c37 -19 41 -31 41 -129 0 -45 7 -105 15 -132 32 -110 135 -181 250 -172 78 7 107 22 199 108 105 97 113 96 228 -18 114 -115 115 -123 18 -228 -86 -93 -101 -121 -108 -201 -4 -54 -1 -70 22 -117 51 -104 133 -146 282 -146 45 0 90 -3 99 -6 33 -13 45 -59 45 -174 0 -110 0 -112 -29 -141 -28 -28 -33 -29 -122 -29 -123 0 -163 -13 -224 -75 -53 -53 -75 -102 -75 -170 0 -73 21 -115 102 -202 82 -89 91 -110 64 -161 -19 -37 -138 -149 -171 -162 -41 -16 -62 -5 -145 74 -82 78 -121 96 -209 96 -63 0 -115 -21 -159 -63 -60 -57 -75 -99 -81 -224 -8 -157 -10 -158 -177 -158 -125 0 -126 0 -150 28 -22 25 -24 37 -24 125 -1 53 -7 113 -14 133 -34 97 -128 161 -235 160 -78 0 -126 -25 -214 -109 -97 -94 -111 -93 -222 19 -117 116 -118 124 -25 225 88 94 109 138 110 220 0 98 -48 175 -140 224 -14 8 -75 16 -143 20 -160 8 -161 9 -165 169 -3 114 -3 118 22 148 26 30 27 31 138 35 129 4 172 20 228 84 43 50 60 93 60 155 0 88 -18 127 -97 209 -39 42 -74 87 -78 102 -10 38 13 74 99 156 104 99 116 98 229 -6 89 -83 129 -102 208 -102 53 0 133 36 171 76 50 54 68 109 68 217 0 95 1 99 29 128 29 29 31 29 141 29 78 0 119 -4 139 -15z"/>
                              <path d="M2845 4265 c-279 -52 -494 -256 -560 -532 -27 -111 -18 -271 22 -384 71 -205 231 -364 438 -435 62 -21 105 -28 193 -32 138 -6 219 11 342 71 69 34 102 58 176 132 126 126 182 238 205 410 12 97 3 131 -44 153 -53 25 -107 -13 -107 -75 -1 -59 -31 -171 -66 -242 -68 -138 -213 -251 -361 -281 -81 -17 -225 -8 -298 18 -149 54 -273 179 -327 329 -26 71 -35 216 -18 296 31 154 147 298 293 367 97 47 187 63 295 54 88 -7 117 7 128 62 16 86 -119 125 -311 89z"/>
                              <path d="M3275 4135 c-45 -44 -35 -77 48 -155 41 -39 90 -97 111 -134 21 -36 45 -71 53 -77 40 -34 123 7 123 61 0 60 -98 202 -193 282 -68 56 -104 62 -142 23z"/>
                              <path d="M4283 1804 c-61 -22 -118 -77 -285 -275 -216 -259 -259 -288 -427 -297 -87 -4 -94 -3 -87 13 64 167 2 335 -154 416 l-45 24 -601 0 -600 0 -75 -37 c-48 -25 -111 -70 -181 -133 -59 -52 -109 -95 -112 -95 -3 0 -6 29 -6 64  0 54 -4 70 -24 93 l-24 28 -579 3 c-318 2 -593 0 -611 -3 -17 -3 -41 -16 -52 -27 -20 -21 -20 -36 -20 -695 l0 -674 25 -24 24 -25 606 0 606 0 24 25 c22 21 25 33 25 96 l0 72 162 -6 c318 -13 1345 -29 1443 -22 281 18 541 111 768 272 107 76 275 244 363 363 83 111 183 274 233 380 32 68 36 83 36 160 0 73 -4 93 -28 142 -31 62 -84 116 -149 149 -56 29 -192 36 -255 13z m198 -167 c50 -33 79 -82 79 -133 0 -53 -70 -196 -164 -337 -287 -429 -646 -653 -1091 -682 -98 -7 -1114 9 -1432 22 l-163 6 0 343 0 343 163 142 c91 80 184 152 212 165 l50 24 556 0 556 0 33 -23 c96 -64 96 -204 2 -259 -27 -16 -61 -18 -295 -18 -272 0 -319 -6 -337 -40 -16 -31 -11 -79 10 -100 19 -19 33 -20 504 -20 l485 0 79 25 c132 42 194 94 390 327 94 112 184 211 199 220 42 26 122 23 164 -5z m-3343 -754 l2 -563 -290 0 -290 0 0 565 0 565 288 -2 287 -3 3 -562z m412 2 l0 -565 -125 0 -125 0 0 565 0 565 125 0 125 0 0 -565z"/>
                            </g>
                          </svg>

                          <!-- Title -->
                          <h1 class="text-xl tracking-tight font-semibold">
                            Видео-сигнал недоступен
                          </h1>

                          <!-- Description -->
                          <p class="text-center text-xs/relaxed max-w-xs">
                            Вы можете продолжить работу в интерфейсе, однако действия будут выполняться «вслепую».
                          </p>
                        </div>
                      </section>`;
            camDiv.querySelector('.camera-img').appendChild(stub);
          }
          enqueueNotification(`С принтера <b>${cam.name || cam.ip}</b> нет видеосигнала`, "error");
          if (loadedCount === totalCameras) setTimeout(hideLoader, 500);
        })
        .catch(() => {
          if (statusDot && !camDiv.dataset.printerState) {
            updateStatusIndicator(statusDot, 'disconnected');
          }
          camDiv.style.pointerEvents = 'auto';
          camDiv.style.removeProperty('transform');
          camDiv.style.removeProperty('transition');
          if (expandIcon) {
            expandIcon.classList.add('btn-disabled');
            expandIcon.setAttribute('aria-disabled', 'true');
            expandIcon.style.pointerEvents = 'none';
            expandIcon.style.opacity = '0.6';
          }
          if (manageIcon) {
            manageIcon.classList.add('btn-disabled');
            manageIcon.setAttribute('aria-disabled', 'true');
            manageIcon.style.pointerEvents = 'none';
            manageIcon.style.opacity = '0.6';
          }
          const imageArea = camDiv.querySelector('.camera-img');
          if (imageArea && !imageArea.querySelector('.camera-stub')) {
            const stub = document.createElement('div');
            stub.className = 'camera-stub flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg text-center font-semibold';
            stub.setAttribute('role', 'status');
            const icon = document.createElement('i');
            icon.className = 'fas fa-link-slash text-3xl';
            icon.setAttribute('aria-hidden', 'true');
            const title = document.createElement('p');
            title.textContent = 'Принтер недоступен';
            const details = document.createElement('p');
            details.className = 'text-xs font-normal';
            details.textContent = 'Принтер выключен или потеряно сетевое соединение.';
            stub.append(icon, title, details);
            imageArea.append(stub);
          }
          enqueueNotification(`Принтер <b>${cam.name || cam.ip}</b> недоступен`, "error");
          if (loadedCount === totalCameras) setTimeout(hideLoader, 500);
        })
      };
      img.onload = () => {
        loadedCount++;
        camDiv.classList.remove('camera-disconnected');
        img.classList.remove('hidden');
        img.style.display = 'block';
        img.style.pointerEvents = 'auto';
        if (statusDot && !camDiv.dataset.printerState) {
            updateStatusIndicator(statusDot, 'connect');
          }
        if (expandIcon) {
          expandIcon.classList.remove('btn-disabled');
          expandIcon.removeAttribute('aria-disabled');
          expandIcon.style.pointerEvents = '';
          expandIcon.style.opacity = '';
        }
        if (manageIcon) {
          manageIcon.classList.remove('btn-disabled');
          manageIcon.removeAttribute('aria-disabled');
          manageIcon.style.pointerEvents = '';
          manageIcon.style.opacity = '';
        }
        capturePrinterMacForCamera(cam, { skipConnectionCheck: true, silent: true, notifyFailure: true, timeout: 1200 });
        enqueueNotification(`Принтер <b>${cam.name || cam.ip}</b> инициализирован`, "system");
        if (loadedCount === totalCameras) setTimeout(hideLoader, 500);
      };
    } else {
      // dammy: просто увеличиваем счетчик
      loadedCount++;
      if (loadedCount === totalCameras) setTimeout(hideLoader, 500);
    }



    // Появление иконок
    const icons = camDiv.querySelectorAll('.action-icon');
    icons.forEach((icon, i) => { icon.style.transitionDelay = `${i * 50}ms`; });
    // Плавное появление зоны справа
    const rightZone = camDiv.querySelector('.zone-right');
    if (rightZone) {
      camDiv.addEventListener('mouseenter', () => {
        rightZone.style.transform = 'translateX(0)';
        rightZone.style.opacity = '1';
      });
      camDiv.addEventListener('mouseleave', () => {
        rightZone.style.transform = 'translateX(10px)';
        rightZone.style.opacity = '0';
      });
    }
    // Активные состояния иконок
    icons.forEach(icon => {
    icon.addEventListener('mousedown', () => { icon.style.transform = 'scale(0.95)'; });
    icon.addEventListener('mouseup',   () => { icon.style.transform = ''; });
    icon.addEventListener('mouseleave',() => { icon.style.transform = ''; });
    });
    // Выход из fullscreen по клику на карточку
    function fullscreenClickHandler() {
      if (document.fullscreenElement === camDiv) {
        document.exitFullscreen();
        camDiv.classList.remove('fullscreen');
      }
    }
    camDiv.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement === camDiv) {
        camDiv.addEventListener('click', fullscreenClickHandler);
      } else {
        camDiv.removeEventListener('click', fullscreenClickHandler);
      }
    });

    // Полноэкран и модал
    if (expandIcon) {
      expandIcon.addEventListener('click', (e) => {
        // Если expand-icon неактивен (btn-disabled), не делаем ничего
        if (expandIcon.classList.contains('btn-disabled')) return;
        e.stopPropagation();
        const camera = e.target.closest('.camera-box');
        if (!camera) return;
        if (isModalOpen) {
          closeModal();
          enterFullscreen(camera);
        } else {
          if (isFullscreen) document.exitFullscreen();
          else enterFullscreen(camera);
        }
      });
    }
    if (manageIcon) {
      manageIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        const camera = e.target.closest('.camera-box');
        if (isFullscreen) {
          document.exitFullscreen();
          openModal(camera);
        } else {
          if (isModalOpen) closeModal();
          else openModal(camera);
        }
      });
    }
    
    // === Stream Toggle Handler ===
    if (streamToggle) {
      // Обработчик изменения состояния
      streamToggle.addEventListener('change', (e) => {
        e.stopPropagation();
        const isEnabled = e.target.checked;
        const camera = e.target.closest('.camera-box');
        
        console.log('Stream toggle changed:', cam.ip, 'enabled:', isEnabled);
        
        if (isEnabled) {
          // Включаем видеопоток
          camera.classList.remove('stream-disabled');
          if (img && img.dataset.originalSrc) {
            img.src = img.dataset.originalSrc;
            delete img.dataset.originalSrc;
          }
        } else {
          // Отключаем видеопоток
          camera.classList.add('stream-disabled');
          if (img && img.src && !img.src.startsWith('data:')) {
            img.dataset.originalSrc = img.src;
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
          }
        }
        
        // Сохраняем состояние в localStorage
        saveStreamToggleState(cam.ip, isEnabled);
      });
      
      // Дополнительный обработчик клика для отладки
      streamToggle.addEventListener('click', (e) => {
        console.log('Stream toggle clicked:', cam.ip, 'current state:', e.target.checked);
      });
    }
    
    // === Применяем сохраненное состояние переключателя ===
    if (streamToggle && !isDammy) {
      const isEnabled = loadStreamToggleState(cam.ip);
      console.log('Loading stream toggle state for', cam.ip, 'enabled:', isEnabled);
      if (!isEnabled) {
        // Если переключатель отключен, применяем состояние
        camDiv.classList.add('stream-disabled');
        if (img && img.src && !img.src.startsWith('data:')) {
          img.dataset.originalSrc = img.src;
          img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        }
      }
    }
    
    // === Drag & drop ===
    camDiv.addEventListener('dragstart', e => {
      const isDammy = camDiv.dataset.ip === 'dammy';
      camDiv.style.opacity = isDammy ? '0.6' : '0.5';
      camDiv.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    camDiv.addEventListener('dragend', function() {
      const isDammy = this.dataset.ip === 'dammy';
      const isDisconnected = this.classList.contains('camera-disconnected');
      if (isDammy) this.style.opacity = '0';
      else this.style.opacity = '1';
      this.classList.remove('dragging');
      debouncedSaveOnDragEnd();
    });
    camDiv.addEventListener('dragover', e => {
      e.preventDefault();
      camDiv.classList.add('drag-over');
      if (camDiv.dataset.ip === 'dammy') camDiv.style.opacity = '0.6';
    });
    camDiv.addEventListener('dragleave', e => {
      e.preventDefault();
      camDiv.classList.remove('drag-over');
      if (camDiv.dataset.ip === 'dammy') camDiv.style.opacity = '0';
    });
    camDiv.addEventListener('drop', e => {
      e.preventDefault();
      camDiv.classList.remove('drag-over');
      const dragging = document.querySelector('.camera-box.dragging');
      if (dragging && dragging !== camDiv) {
        Elements.cameraContainer.insertBefore(dragging, camDiv.nextSibling);
        Elements.cameraContainer.insertBefore(camDiv, dragging.nextSibling);
        saveToLocalStorage();
      }
      if (camDiv.dataset.ip === 'dammy') camDiv.style.opacity = '0';
    });

    // === Мелкие UI действия ===
    // Эффект появления кнопки
    const button = camDiv.querySelector('.button');
    let hideTimeout;
    camDiv.addEventListener('mouseenter', () => {
      if (button) {
        button.classList.remove('opacity-0');
        button.style.opacity = '';
      }
      if (hideTimeout) clearTimeout(hideTimeout);
    });
    camDiv.addEventListener('mouseleave', () => {
      if (button) {
        hideTimeout = setTimeout(() => {
          button.classList.add('opacity-0');
        }, 1000);
      }
    });

    camDiv.addEventListener('click', ev => {
      if (!ev.target.closest('button')) {
        if (camDiv.dataset.ip === 'dammy') {
          enqueueNotification("Пустой слот не поддерживает полноэкранный режим", "info");
          return;
        }
      }
    });

    Elements.cameraContainer.appendChild(camDiv);
    if (!isDammy) startPrinterStatusPolling(camDiv, cam.ip);
  });

  // === Финальные обновления сетки и разделителей ===
  updateGrid();
  debouncedUpdateDividers();
  updateInterfaceHeight();
}


function hideLoader() {
  const loader = document.getElementById('loaderOverlay');
  if (!loader) return;
  loader.style.opacity = '0';
  setTimeout(() => loader.remove(), 500);
}

// === DIVIDERS ===
function getDividerGradient(startAlpha = "77", endAlpha = "E6") {
  const color = Elements.dividerColorInput.value;    // Цвет разделителя (основной)
  const color1 = Elements.color1Input.value;         // Градиент 1
  const color2 = Elements.color2Input.value;         // Градиент 2
  return `linear-gradient(90deg,
    ${color1}00 0%,
    ${color1}${startAlpha} 5%,
    ${color}${endAlpha} 45%,
    ${color}${endAlpha} 55%,
    ${color2}${startAlpha} 95%,
    ${color2}00 100%
  )`;
}

function updateHorizontalDividers() {
  document.querySelectorAll('.horizontal-divider, .divider-hitbox').forEach(el => el.remove());
  if (!Elements.enableDividersCheckbox.checked) return;

  const container = Elements.cameraContainer;
  if (!container) return;

  const items = Array.from(container.getElementsByClassName('camera-box'));
  if (items.length === 0) return;

  const cols = parseInt(Elements.gridColumnsInput.value || 3);
  const rows = Math.ceil(items.length / cols);
  const rowsMap = [];

  for (let i = 0; i < rows; i++) {
    rowsMap.push(items.slice(i * cols, (i + 1) * cols));
  }

  const dividerStates = JSON.parse(localStorage.getItem('dividerVisibility') || '{}');

  // Получаем настройки выравнивания и ширины
  const align = Config.defaultSettings.dividerAlign;
  const widthPercent = parseFloat(Elements.dividerWidthInput.value); // Ширина в процентах

  for (let i = 1; i < rows; i++) {
    const previousRowLastItem = rowsMap[i - 1][cols - 1];
    if (!previousRowLastItem) continue;

    const rect = previousRowLastItem.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const divider = document.createElement('div');
    divider.className = 'horizontal-divider';
    divider.dataset.rowIndex = i;

    let leftOffset = 0;
    const containerWidth = container.clientWidth;

    // Расчет ширины и позиции
    const dividerWidthPx = (containerWidth * widthPercent) / 100;
    switch (align) {
      case 'left':
        leftOffset = 0;
        break;
      case 'center':
        leftOffset = (containerWidth - dividerWidthPx) / 2;
        break;
      case 'right':
        leftOffset = containerWidth - dividerWidthPx;
        break;
    }

    Object.assign(divider.style, {
      position: 'absolute',
      left: `${leftOffset}px`,
      width: `${dividerWidthPx}px`,
      right: 'auto', // Отключаем right, чтобы работало left
      top: `${rect.bottom - containerRect.top + 10}px`,
      height: `${Elements.dividerThicknessInput.value}px`,
      backgroundImage: `linear-gradient(90deg, transparent 0%, ${Elements.dividerColorInput.value}77 35%, ${Elements.dividerColorInput.value}cc 65%, transparent 100%)`,
      zIndex: '0',
      cursor: 'pointer',
      transition: 'opacity 0.3s, background-color 0.3s'
    });

    const key = `row_${i}`;
    const isVisible = dividerStates[key] !== false;
    if (isVisible) {
      divider.style.opacity = '1';
      applyDividerGradient(divider); // <-- Восстанавливаем градиент
    } else {
      divider.style.opacity = '0';
    }

    // Обработчики событий для hover и клика
    divider.addEventListener('mouseenter', () => {
      const currentOpacity = parseFloat(divider.style.opacity || 1);
      divider.dataset.originalOpacity = currentOpacity;
      if (currentOpacity > 0.5) {
        divider.style.opacity = '0.8';
        applyDividerGradient(divider);
      } else {
        divider.style.opacity = '0.2';
        applyDividerGradient(divider);
      }
    });
    divider.addEventListener('mouseleave', () => {
      const currentOpacity = parseFloat(divider.style.opacity || 1);
      let newOpacity = currentOpacity < 0.5 ? 0 : 1;
      divider.style.opacity = newOpacity;
      divider.style.backgroundImage = getDividerGradient();
      divider.style.backgroundRepeat = 'no-repeat';
      divider.style.backgroundSize = '100% 100%';
      const key = `row_${divider.dataset.rowIndex}`;
      const dividerStates = JSON.parse(localStorage.getItem('dividerVisibility') || '{}');
      const newStates = { ...dividerStates, [key]: newOpacity !== 0 };
      localStorage.setItem('dividerVisibility', JSON.stringify(newStates));
    });
    divider.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentOpacity = parseFloat(divider.style.opacity || 1);
      const newOpacity = currentOpacity < 0.5 ? 1 : 0;
      divider.style.opacity = newOpacity;
      divider.style.backgroundImage = getDividerGradient();
      divider.style.backgroundRepeat = 'no-repeat';
      divider.style.backgroundSize = '100% 100%';
      const key = `row_${i}`;
      const dividerStates = JSON.parse(localStorage.getItem('dividerVisibility') || '{}');
      const newStates = { ...dividerStates, [key]: newOpacity !== 0 };
      localStorage.setItem('dividerVisibility', JSON.stringify(newStates));
    });

    // Добавляем hitbox
    const hitbox = document.createElement('div');
    hitbox.className = 'divider-hitbox';
    hitbox.dataset.rowIndex = i;
    Object.assign(hitbox.style, {
      position: 'absolute',
      left: `${leftOffset}px`,
      width: `${dividerWidthPx}px`,
      right: 'auto',
      top: `${rect.bottom - containerRect.top - 10}px`,
      height: '40px',
      zIndex: '0',
      cursor: 'pointer',
      opacity: '0'
    });

    hitbox.addEventListener('mouseenter', () => {
      divider.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    });
    hitbox.addEventListener('mouseleave', () => {
      divider.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    });
    hitbox.addEventListener('click', (e) => {
      e.stopPropagation();
      divider.click();
    });

    container.appendChild(hitbox);
    container.appendChild(divider);
  }
}

function syncDividerStyles() {
  const thickness = Elements.dividerThicknessInput.value;
  document.querySelectorAll('.horizontal-divider').forEach(divider => {
    divider.style.backgroundImage = getDividerGradient();
    divider.style.backgroundRepeat = 'no-repeat';
    divider.style.backgroundSize = '100% 100%';
    divider.style.height = `${thickness}px`;
  });
}

function applyDividerGradient(divider) {
  const color = Elements.dividerColorInput.value;     // Цвет разделителя (основной)
  const color1 = Elements.color1Input.value;          // Градиент 1
  const color2 = Elements.color2Input.value;          // Градиент 2
  divider.style.backgroundImage = getDividerGradient(color, color1, color2);
  divider.style.backgroundRepeat = 'no-repeat';
  divider.style.backgroundSize = '100% 100%';
}

// === NOTIFICATIONS ===
let notificationQueue = [];
let isProcessing = false;
const NOTIFICATION_DELAY = 300; // Задержка между уведомлениями
let notificationCounter = 0;
let activeNotifications = new Set();
const notificationBuffer = new Set(); // Буфер временных уведомлений
let bufferTimer = null; // Таймер для отложенной отправки
let globalCollapseTimeout = null;
let hoveredNotificationsCount = 0; // Счетчик наведённых уведомлений

function getNotificationStyles(isSystem = false) {
  const colorInput = isSystem ? Elements.systemNotificationColorInput : Elements.errorNotificationColorInput;
  const opacityInput = isSystem ? Elements.notificationOpacityInput : Elements.notificationOpacityInput;
  const color = colorInput.value || "#ff4d4d";
  const opacity = +opacityInput.value || 0.2;

  const r = parseInt(color.substr(1, 2), 16);
  const g = parseInt(color.substr(3, 2), 16);
  const b = parseInt(color.substr(5, 2), 16);

  return {
    color: `rgba(${r},${g},${b},${opacity})`,
    border: `rgba(${r},${g},${b},${Math.max(opacity * 0.7, 0.25)})`
  };
}

//Собираем полученные уведомления в стэк
const activeNotificationsBuffer = new Set(); // Уже есть в твоём коде
function addToBuffer(message, type = "info") {
  // Проверяем на дубликат
  if (checkAndRemoveDuplicateBuffer(message)) return;
  // Добавляем в буфер
  notificationBuffer.add(JSON.stringify({ message, type }));
  // Сбрасываем таймер
  if (bufferTimer) clearTimeout(bufferTimer);
  // Запускаем таймер на 3 секунды
  bufferTimer = setTimeout(() => {
    flushBuffer();
  }, 900);
}
function checkAndRemoveDuplicateBuffer(message) {
  if (activeNotificationsBuffer.has(message)) {
    return true; // Это дубликат
  }
  return false;
}

//Очещаем буфер и отправляем в очаредь
function flushBuffer() {
  if (notificationBuffer.size === 0) return;
  for (const item of notificationBuffer) {
    const { message, type } = JSON.parse(item);
    const wasDuplicate = checkAndRemoveDuplicate(message);
    activeNotifications.add(message); // Добавляем в активные
    notificationQueue.push([message, type]); // В очередь на показ
  }
  notificationBuffer.clear(); // Очищаем буфер
  processNotificationQueue(); // Обрабатываем очередь
}

// Ищем дубли и закрываем их
function checkAndRemoveDuplicate(message) {
  const container = document.getElementById("notificationContainer");
  if (!container) return false;

  const cleanMessage = stripHtml(message).trim();

  const existing = Array.from(container.querySelectorAll(".notification")).find(notification => {
    const span = notification.querySelector("span");
    const text = span ? span.textContent.trim() : '';
    return text === cleanMessage;
  });

  if (existing) {
    animateAndRemoveNotification(existing); // корректное удаление с анимацией
    return true;
  }
  return false;
}

// Удаляем html тэги
function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

// Задаем Z-index
function updateNotificationZIndices() {
  const container = document.getElementById("notificationContainer");
  if (!container) return;

  // Получаем все уведомления, включая свернутые и не свернутые
  const notifications = Array.from(container.querySelectorAll(".notification"));

  notifications.forEach((notification, index) => {
    notification.style.zIndex = 40 + index;
  });
}

// Обновление номера и позиции
let isUpdatingPositions = false;

function schedulePositionUpdate() {
  if (isUpdatingPositions) return;
  isUpdatingPositions = true;

  requestAnimationFrame(() => {
    updateAllNotificationPositions();
    isUpdatingPositions = false;
  });
}

function updateAllNotificationPositions() {
  const container = document.getElementById("notificationContainer");
  if (!container) return;
  const gap = 10;
  // Получаем уведомления, фильтруем и сортируем по data-number
  const notifications = Array.from(container.querySelectorAll(".notification"))
    .filter(n => !n.dataset.animating && n.dataset.collapsed !== 'true')
    .sort((a, b) => parseInt(a.dataset.number) - parseInt(b.dataset.number)); // Сортировка

  if (notifications.length === 0) return;

  let cumulativeBottom = 0;
  notifications.forEach((notification, index) => {
    const newNumber = index;
    notification.dataset.number = newNumber;
    notification.style.zIndex = 40 + newNumber; // Обновляем zIndex
    cumulativeBottom = newNumber * (notification.offsetHeight + gap);
    notification.style.transition = "bottom 0.6s ease";
    notification.style.bottom = `${cumulativeBottom}px`;
  });
  notificationCounter = notifications.length;
  updateNotificationZIndices();
}

function processPositionUpdateQueue() {
  if (positionUpdateQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }

  isProcessingQueue = true;

  const { removedNumber } = positionUpdateQueue.shift(); // больше не нужен removedHeight
  const container = document.getElementById("notificationContainer");
  if (!container) return;

  const gap = 10;
  const allNotifications = Array.from(container.querySelectorAll(".notification"));

  allNotifications.forEach((notification, index) => {
    const currentNumber = parseInt(notification.dataset.number);
    const newNumber = index;

    if (currentNumber !== newNumber) {
      notification.dataset.number = newNumber;
      const newBottom = newNumber * (notificationHeight + gap);
      notification.style.transition = "bottom 0.6s ease";
      notification.style.bottom = `${newBottom}px`;
    }
  });

  notificationCounter = allNotifications.length;

  setTimeout(() => processPositionUpdateQueue(), POSITION_UPDATE_DELAY);
}

// Показ уведомлений
function processNotificationQueue() {
  if (isProcessing || notificationQueue.length === 0) return;

  isProcessing = true;
  const [message, type] = notificationQueue.shift();

  _createNotification(message, type);

  setTimeout(() => {
    isProcessing = false;
    processNotificationQueue();
  }, NOTIFICATION_DELAY);
}

// Ретранслятор передачи уведомлений
function enqueueNotification(message, type = "info") {
  // Проверяем, включено ли скрытие уведомлений
  if (Elements.hideNotificationCheckbox && Elements.hideNotificationCheckbox.checked) {
    return; // Полностью отключаем все уведомления
  }
  if (suppressNotifications && pendingRestores > 0) {
      return; // Блокируем и system, и error уведомления
  }
  addToBuffer(message, type);
}

// Создание уведомлений
let notificationOffset = 0;
let isAnimating = false;
function _createNotification(message, type = "info") {
  if (isAnimating) {
    setTimeout(() => _createNotification(message, type), 100);
    return;
  }

  // Небольшая задержка для стабилизации DOM после удаления дубликатов
  setTimeout(() => {
    const container = document.getElementById("notificationContainer");
    if (!container) return;

    // Получаем все уведомления, исключая те, что в процессе анимации удаления
    const allNotifications = Array.from(container.querySelectorAll(".notification"))
      .filter(n => n.dataset.animating !== 'true');

    let maxNumber = allNotifications.reduce((max, el) => {
      const num = parseInt(el.dataset.number);
      return isNaN(num) ? max : Math.max(max, num);
    }, -1);

    // Проверяем, есть ли хотя бы одно свернутое уведомление
    const hasCollapsed = allNotifications.some(n => n.dataset.collapsed === 'true');

    // Количество "видимых" уведомлений
    const visibleCount = hasCollapsed 
      ? Math.min(1, allNotifications.length) 
      : allNotifications.filter(n => n.dataset.collapsed !== 'true').length;

    // Типы уведомлений
    const div = document.createElement("div");
    let iconClass = '';
    let isSystem = type === "system";
    let isError = type === "error";
    let isInfo = type === "info";

    // Уникальный номер для самого уведомления (для внутренней идентификации)
    const number = maxNumber + 1; // Присваиваем следующий по порядку номер
    notificationCounter = number + 1; // Обновляем счетчик
    div.dataset.number = number;
    notificationOffset++;

    // Стили
    div.className = `notification notif-enter flex items-center gap-3 rounded-lg shadow-md px-4 py-2 mb-1 border bg-white/90`;
    div.style.opacity = "0";
    div.style.transform = "translateY(100px)";
    div.style.transition = "opacity 0.3s ease, transform 0.3s ease, bottom 0.6s ease, filter 0.3s ease";
    div.style.position = "absolute";
    div.style.right = "0";
    div.style.zIndex = 40 + number;

    // Высота будет определена после добавления элемента в DOM
    div.style.bottom = `-50px`; // Временное значение

    if (isError) {
      const { color, border } = getNotificationStyles();
      div.style.background = color;
      div.style.borderColor = border;
      iconClass = 'fas fa-exclamation-circle';
    } else if (isSystem) {
      const { color, border } = getNotificationStyles(true);
      div.style.background = color;
      div.style.borderColor = border;
      iconClass = 'fas fa-check-circle';
    } else {
      const opacity = +Elements.notificationOpacityInput.value || 0.75;
      const bgColor = `rgb(var(--white)/${opacity})`;
      div.style.background = bgColor;
      div.style.borderColor = `rgba(255,255,255,${opacity * 0.8})`;
      iconClass = 'fas fa-info-circle';
    }

    // HTML содержимое
    if (isInfo) { div.innerHTML = `
        <i class="text-[rgba(0,0,0,0.8)] ${iconClass}" ></i>
        <span class="text-[rgba(0,0,0,0.8)] flex-1 text-sm font-medium">${message}</span>
      `;
    } else { div.innerHTML = `
        <i class="text-white-castom-80 ${iconClass}" ></i>
        <span class="text-white-castom flex-1 text-sm font-medium">${message}</span>
      `;
    }

    // Добавляем уведомление в DOM
    container.appendChild(div);
    updateNotificationZIndices();

    // СРАЗУ обновляем стили у всех свёрнутых уведомлений
    hideNonTopCollapsedNotifications();

    // Теперь можно получить точную высоту
    const height = div.offsetHeight;
    const gap = 10;

    // Позиция — только по числу НЕ свёрнутых уведомлений
    let newBottom = (hasCollapsed ? visibleCount + notificationOffset : visibleCount) * (height + gap);

    // Анимация появления
    requestAnimationFrame(() => {
      div.style.opacity = "1";
      div.style.transform = "translateY(0)";
      div.style.bottom = `${newBottom}px`;
    });

    // После окончания анимации показа — сразу обновляем стили свернутых уведомлений
    let transitionCount = 0;
    const expectedTransitions = ['opacity', 'transform', 'bottom'];
    function handleTransitionEnd(e) {
      if (expectedTransitions.includes(e.propertyName)) {
        transitionCount++;
        if (transitionCount >= expectedTransitions.length) {
          div.removeEventListener('transitionend', handleTransitionEnd);
          hideNonTopCollapsedNotifications();
        }
      }
    }
    div.addEventListener('transitionend', handleTransitionEnd);

    // Очищаем старый таймер, если он был
    if (div.dataset.collapseTimeout) {
      clearTimeout(div.dataset.collapseTimeout);
      delete div.dataset.collapseTimeout;
    }

    // HOVER эффект
    div.addEventListener('mouseenter', () => {
      div.style.transform = 'translateX(5%) scale(0.9)';
      div.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
      hoveredNotificationsCount++;
      clearTimeout(globalCollapseTimeout);
    });
    div.addEventListener('mouseleave', () => {
      div.style.transform = 'translateX(0) scale(1)';
      div.style.boxShadow = 'none';
      hoveredNotificationsCount--;
      if (hoveredNotificationsCount <= 0) {
        startGlobalCollapseTimer();
      }
    });
    // Закрытие по клику
    div.addEventListener('click', function () {
      animateAndRemoveNotification(this);
    });

    if (hoveredNotificationsCount === 0) {
      startGlobalCollapseTimer(); // Запускаем таймер, если никто не наведён
    }

  }, 800); // ⏱️ Задержка в 100 мс для обновления DOM
}

// Удалением элемента из DOM и обновлением данных
function _removeNotificationElement(div) {
  const container = document.getElementById("notificationContainer");
  const allNotifications = Array.from(container.querySelectorAll(".notification"));

  // Обновляем notificationCounter на основе актуального количества
  notificationCounter = allNotifications.length;

  // Убираем из activeNotifications, если нужно
  const innerHTML = div.querySelector("span")?.innerHTML.trim();
  if (innerHTML) {
    activeNotifications.delete(innerHTML);
  }

  // Удаляем сам элемент
  div.remove();

  // Обновляем позиции только если уведомление было развернутым
  if (!div.classList.contains('collapsed')) {
    schedulePositionUpdate();
  }
  // Обновляем отображение свёрнутых уведомлений
  setTimeout(hideNonTopCollapsedNotifications, 300); // Ждём завершения анимации
}

// Функция програмного закрытия уведомления
function closeNotificationByDataNumber(targetNumber) {
  const container = document.getElementById("notificationContainer");
  const allNotifications = container.querySelectorAll(".notification");

  const foundDiv = Array.from(allNotifications).find(div =>
      parseInt(div.dataset.number) === targetNumber
  );

  if (!foundDiv) {
    console.warn(`Элемент с data-number="${targetNumber}" не найден`);
    return;
  }

  animateAndRemoveNotification(foundDiv);
}

// Универсальная функция для запуска анимации удаления уведомления
function animateAndRemoveNotification(div) {
  if (!div || div.dataset.animating === 'true') return;
  div.dataset.animating = 'true';

  // Если уведомление свернуто — удаляем без анимации
  if (div.classList.contains('collapsed')) {
    _removeNotificationElement(div);
    return;
  }

  // Иначе применяем анимацию
  const removedHeight = div.offsetHeight;
  div.classList.add("wave-out");

  div.addEventListener('animationend', () => {
    _removeNotificationElement(div);
  }, { once: true });
}

// === Логика сварачивания стека уведомлений ===
// Определение свернутых уведомлений
const notificationActions = document.getElementById('notificationActions');
function getCollapsedNotifications() {
  const container = document.getElementById("notificationContainer");
  if (!container) return [];
  return Array.from(container.querySelectorAll(".notification")).filter(n => n.dataset.collapsed === 'true');
}

// Функция запуска таймера сворачивания
function startGlobalCollapseTimer() {
  clearTimeout(globalCollapseTimeout);
  globalCollapseTimeout = setTimeout(() => {
    const allNotifications = document.querySelectorAll(".notification");
    allNotifications.forEach(notification => {
      if (!notification.classList.contains('collapsed') && !notification.dataset.animating) {
        collapseNotification(notification);
      }
    });
    notificationOffset = 0; // Сбрасываем счётчик смещения
  }, NOTIFICATION_COLLAPSE_DELAY); // Например, 5000 мс
}

// Функция сварачивания
const NOTIFICATION_COLLAPSE_DELAY = 5000; // 5 секунд
function collapseNotification(notificationElement) {
  if (!notificationElement || 
    notificationElement.dataset.collapsed === 'true' || 
    notificationElement.closest('.camera-disconnected')) return;

  const container = document.getElementById("notificationContainer");

  // Получаем список ВСЕХ уведомлений (включая свёрнутые и анимируемые)
  const allNotifications = Array.from(container.querySelectorAll(".notification"));

  // Проверяем, было ли изначально более одного уведомления
  if (allNotifications.length <= 1) return;

  notificationElement.dataset.collapsed = 'true';
  hideNonTopCollapsedNotifications();
  notificationElement.classList.add('collapsed');

  // После завершения анимации показываем кнопки действий
  setTimeout(() => {
    const collapsedList = getCollapsedNotifications();
    if (collapsedList.length > 0 && notificationActions) {
      notificationActions.classList.remove('hidden');
      notificationActions.classList.add('show');
    }
    hideNonTopCollapsedNotifications();
  }, 300); // <-- Запускаем скрытие
}

//Функция разворачивани
function expandNotification(notificationElement) {
  if (!notificationElement || 
    notificationElement.dataset.collapsed !== 'true' || 
    notificationElement.closest('.camera-disconnected')) return;

  delete notificationElement.dataset.collapsed;
  notificationElement.classList.remove('collapsed');

  // Восстанавливаем оригинальный opacity
  if (notificationElement.dataset.originalOpacity) {
    notificationElement.style.opacity = notificationElement.dataset.originalOpacity;
    notificationElement.style.pointerEvents = "auto"; // Возвращаем взаимодействие
  }

  updateNotificationZIndices();
  schedulePositionUpdate();
  startGlobalCollapseTimer();
}
const expandNotificationsBtn = document.getElementById('expandNotificationsBtn');
const closeAllNotificationsBtn = document.getElementById('closeAllNotificationsBtn');

// Функция для скрытия уведомления
function hideNonTopCollapsedNotifications() {
  const collapsed = getCollapsedNotifications();
  const container = document.getElementById("notificationContainer");
  if (!container) return;

  const collapsedNotifications = getCollapsedNotifications();
  if (collapsedNotifications.length <= 0) return;

  const maxNumber = Math.max(...collapsedNotifications.map(n => parseInt(n.dataset.number)));

  collapsedNotifications.forEach(notification => {
    const number = parseInt(notification.dataset.number);

    if (number < maxNumber) {
      notification.style.filter = "blur(4px)";
      notification.style.opacity = "0.2"; // Можно дополнительно
    } else {
      notification.style.filter = "none";
      notification.style.opacity = "1";
    }
  });
}

// === Сохранение в память браузера ===
function saveToLocalStorage() {
  if (!State.allowLocalStorage) return;

  const cameras = getCameraTableData();
  let previousSettings = {};
  try {
    previousSettings = JSON.parse(localStorage.getItem('printerCamsV2') || '{}');
  } catch {
    previousSettings = {};
  }
  const cameraElements = document.querySelectorAll('.camera-box');
  const orderMap = {};

  cameraElements.forEach((el, index) => {
    const ip = el.dataset.ip;
    orderMap[ip] = index;
  });

  const orderedCameras = [...cameras].sort((a, b) => (orderMap[a.ip] || 0) - (orderMap[b.ip] || 0));

  const settings = {
    namedDriv: +Elements.namedDrivInput.value,
    cameraOrder: getCameraTableData().map(cam => ({
      ip: cam.ip,
      stream: cam.stream,
      name: cam.name,
      mac: normalizeMac(cam.mac || ''),
      lastSeenIp: cam.lastSeenIp || '',
      lastMacCheckAt: cam.lastMacCheckAt || ''
    })),
    color1: Elements.color1Input.value,
    color2: Elements.color2Input.value,
    colorIntOver: Elements.colorIntOverInput.value,
    errorNotificationColor: Elements.errorNotificationColorInput.value,
    notificationOpacity: Elements.notificationOpacityInput.value,
    systemNotificationColor: Elements.systemNotificationColorInput.value,
    toolbarIconRgb: updateActionIconColors(),
    loader: {
      hide: Elements.hideLoaderCheckbox.checked,
      bgColor: Elements.loaderBgColorInput.value,
      opacity: Elements.loaderOpacityInput.value,
      offFullCheckbox: Elements.offFullCheckbox.checked,
    },
    enableDividers: Elements.enableDividersCheckbox.checked,
    hideNotifications: Elements.hideNotificationCheckbox ? Elements.hideNotificationCheckbox.checked : false,
    dividerColor: Elements.dividerColorInput.value,
    dividerThickness: Elements.dividerThicknessInput.value,
    dividerAlign: previousSettings.dividerAlign ?? Config.defaultSettings.dividerAlign,
    dividerWidth: Elements.dividerWidthInput.value,
    namedDriv: Elements.namedDrivInput.value,
    grid: {
      columns: +Elements.gridColumnsInput.value
    },
    header: {
      text: Elements.headerTextInput.value,
      hidden: Elements.hideHeaderCheckbox.checked,
      bgColor: Elements.headerBgColorInput.value,
      bgOpacity: +Elements.headerBgOpacityInput.value,
      textColor: Elements.headerTextColorInput.value
    },
    interfaceWidth: +Elements.interfaceWidthInput.value,
    interfaceHeight: +Elements.interfaceHeightInput.value,
    enableWidthInput: Elements.enableWidthInputCheckbox.checked,
    streamToggles: previousSettings.streamToggles || {},
  };

  localStorage.setItem('printerCamsV2', JSON.stringify(settings));
  syncSettingsToAppApi(settings);
  return settings;
}

// === Функции для управления состоянием переключателей видеопотока ===
function saveStreamToggleState(ip, isEnabled) {
  if (!State.allowLocalStorage) return;
  
  const settings = JSON.parse(localStorage.getItem('printerCamsV2') || '{}');
  settings.streamToggles = settings.streamToggles || {};
  settings.streamToggles[ip] = isEnabled;
  localStorage.setItem('printerCamsV2', JSON.stringify(settings));
  syncSettingsToAppApi(settings);
}

function loadStreamToggleState(ip) {
  if (!State.allowLocalStorage) return true; // По умолчанию включен
  
  const settings = JSON.parse(localStorage.getItem('printerCamsV2') || '{}');
  return settings.streamToggles && settings.streamToggles[ip] !== undefined 
    ? settings.streamToggles[ip] 
    : true; // По умолчанию включен
}

function loadFromLocalStorage() {
  if (!State.allowLocalStorage) return false;
  const data = localStorage.getItem('printerCamsV2');
  if (!data) return false;
  try {
    const settings = JSON.parse(data);
    const defaults = Config.defaultSettings;
    const savedCameras = settings.cameraOrder || Config.defaultCameras;
    const camerasArr = savedCameras.map(normalizeCameraData);
    loadCameras(camerasArr);
    // Устанавливаем средний цвет из сохраненных настроек
    if (settings.toolbarIconRgb) {
      const { r, g, b } = settings.toolbarIconRgb;
      document.documentElement.style.setProperty(
        '--base-color-rgb',
        `${r} ${g} ${b}`
      );
    } else {
      // Если сохраненного среднего цвета нет, вычисляем его
      updateActionIconColors();
    }
    renderCameraTable(camerasArr);
    Elements.color1Input.value = settings.color1 || defaults.color1;
    Elements.color2Input.value = settings.color2 || defaults.color2;
    Elements.colorIntOverInput.value = settings.colorIntOver || defaults.colorIntOver;
    Elements.errorNotificationColorInput.value = settings.errorNotificationColor || defaults.errorNotificationColor;
    Elements.systemNotificationColorInput.value = settings.systemNotificationColor || defaults.systemNotificationColor;
    Elements.notificationOpacityInput.value = settings.notificationOpacity || defaults.notificationOpacity;

    Elements.hideLoaderCheckbox.checked = settings.loader?.hide ?? defaults.loader.hide;
    Elements.loaderBgColorInput.value = settings.loader?.bgColor || defaults.loader.bgColor;
    Elements.loaderOpacityInput.value = settings.loader?.opacity ?? defaults.loader.opacity;
    Elements.offFullCheckbox.checked = settings.loader?.offFullCheckbox ?? defaults.loader.offFullCheckbox;

    Elements.gridColumnsInput.value = settings.grid?.columns ?? defaults.grid.columns;
    Elements.headerTextInput.value = settings.header?.text ?? defaults.header.text;
    Elements.hideHeaderCheckbox.checked = settings.header?.hidden ?? defaults.header.hidden;
    Elements.headerBgColorInput.value = settings.header?.bgColor ?? defaults.header.bgColor;
    Elements.headerBgOpacityInput.value = settings.header?.bgOpacity ?? defaults.header.bgOpacity;
    Elements.headerTextColorInput.value = settings.header?.textColor ?? defaults.header.textColor;

    const savedWidth = settings.interfaceWidth ?? defaults.interfaceWidth;
    Elements.interfaceWidth.value = savedWidth;
    Elements.interfaceWidthInput.value = savedWidth;

    const savedHeight = settings.interfaceHeight ?? defaults.interfaceHeight;
    Elements.interfaceHeight.value = savedHeight;
    Elements.interfaceHeightInput.value = savedHeight;
    
    // Load enableWidthInputCheckbox state
    Elements.enableWidthInputCheckbox.checked = settings.enableWidthInput ?? false;

    Elements.dividerColorInput.value = settings.dividerColor ?? defaults.dividerColor;
    Elements.dividerThicknessInput.value = settings.dividerThickness ?? defaults.dividerThickness;
    Elements.dividerWidthInput.value = settings.dividerWidth ?? defaults.dividerWidth;
    Elements.dividerWidthValue.textContent = (settings.dividerWidth ?? defaults.dividerWidth) + '%';
    Elements.enableDividersCheckbox.checked = settings.enableDividers ?? defaults.enableDividers;
    if (Elements.hideNotificationCheckbox) {
      Elements.hideNotificationCheckbox.checked = settings.hideNotifications ?? defaults.hideNotifications;
    }
    Elements.namedDrivInput.value = settings.namedDriv || Config.defaultSettings.namedDriv;
    Elements.namedDrivValue.textContent = settings.namedDriv + 'rem' || Config.defaultSettings.namedDriv + 'rem';

    updateNotificationOpacity();
    updateHeader();
    updateGrid();
    updateInterfaceWidth();
    updateInterfaceHeight();
    updateToolbarVisibility();
    updateToolbarColors();
    updateLoader();
    debouncedUpdateDividers();

    return true;
  } catch (e) {
    console.error("Ошибка при загрузке данных из localStorage:", e);
    return false;
  }
}

// === CONSENT MODAL ===
// В функцию showConsent() добавьте в самом конце:
function showConsent() {
  const consentModal = document.getElementById('consentModal');
  const loader = document.getElementById('loaderOverlay');
  
  // === ЛОГИКА ДЛЯ ПЕРЕКЛЮЧЕНИЯ СЕКЦИЙ ===
  toggleSections(!State.allowLocalStorage);
  
  if (consentModal) {
    consentModal.classList.remove('hidden');
    if (loader) {
      loader.classList.add('hidden');
      loader.style.opacity = '0';
      loader.style.display = 'none';
    }
  }

  Elements.allowConsentBtn.onclick = () => {
    State.allowLocalStorage = true;
    localStorage.setItem('printerCamsV2Consent', 'yes');
    consentModal.classList.add('hidden');
    
    // === ПЕРЕКЛЮЧАЕМ СЕКЦИИ ПРИ ПРИНЯТИИ ===
    toggleSections(false);

    if (loader) {
      loader.classList.remove('hidden');
      loader.style.display = 'flex';
      setTimeout(() => {
        loader.style.opacity = '1';
      }, 10);
    }

    if (!loadFromLocalStorage()) {
      loadCameras(Config.defaultCameras);
    }
    renderCameras();
    updateInterfaceWidth();
    updateToolbarVisibility();
    location.reload();
  };

  Elements.denyConsentBtn.onclick = () => {
    State.allowLocalStorage = false;
    window.location.href = 'print%20.html';
  };
}

// Вспомогательная функция toggleSections() уже есть в вашем коде:
function toggleSections(showStart) {
  const startSections = document.querySelectorAll('section[id="Start"]');
  const endSections = document.querySelectorAll('section[id="End"]');

  startSections.forEach(el => {
    el.classList.toggle('hidden', !showStart);
  });

  endSections.forEach(el => {
    el.classList.toggle('hidden', showStart);
  });
}

// === TOOLBAR VISIBILITY ===
function updateToolbarVisibility() {
  const toolbar = document.getElementById('toolbar');
  if (!toolbar) return;

  if (Elements.hideHeaderCheckbox.checked) {
    if (!State.floatingToolbar) {
      State.floatingToolbar = document.createElement('div');
      State.floatingToolbar.id = 'floatingToolbar';
      State.floatingToolbar.className = 'fixed top-0 right-0 w-52 h-16 pointer-events-none z-50 opacity-0 transition-opacity duration-200';
      const inner = document.createElement('div');
      inner.className = 'backdrop-blur-sm rounded-xl shadow-lg p-3 mt-4 mr-4 flex justify-end gap-2 pointer-events-auto';
      inner.style.background = 'linear-gradient(135deg, rgb(var(--scrollableTableH-rgb)), rgb(var(--scrollableTableB-rgb)))';
      inner.style.border = '2px solid rgb(var(--shadow-rgb))';
      inner.appendChild(toolbar);
      State.floatingToolbar.appendChild(inner);
      document.body.appendChild(State.floatingToolbar);

      const triggerArea = document.createElement('div');
      triggerArea.id = 'headerTriggerArea';
      triggerArea.className = 'fixed top-0 right-0 w-screen h-16 cursor-default z-40';
      document.body.appendChild(triggerArea);

      triggerArea.addEventListener('mouseenter', () => {
        State.floatingToolbar.style.opacity = '1';
      });

      State.floatingToolbar.addEventListener('mouseleave', () => {
        State.floatingToolbar.style.opacity = '0';
      });
    }
  } else {
    if (State.floatingToolbar) {
      State.floatingToolbar.remove();
      State.floatingToolbar = null;
    }
    const toolbarContainer = document.getElementById('toolbarContainer');
    if (!toolbarContainer) {
      const newContainer = document.createElement('div');
      newContainer.id = 'toolbarContainer';
      newContainer.appendChild(toolbar);
      const flexContainer = document.querySelector('#headerBar .flex');
      if (flexContainer) {
        flexContainer.appendChild(newContainer);
      }
    } else {
      toolbarContainer.innerHTML = '';
      toolbarContainer.appendChild(toolbar);
    }
  }
}

// === LOADER ===
function updateLoader() {
  const loader = document.getElementById('loaderOverlay');
  const consentModal = document.getElementById('consentModal');

  if (!loader) return;

  // Если чекбокс включен - сразу скрываем лоадер
  if (Elements.hideLoaderCheckbox.checked) {
    loader.classList.add('hidden');
    loader.style.opacity = '0';
    loader.style.display = 'none';
    return;
  }

  const isConsentVisible = consentModal && !consentModal.classList.contains('hidden');
  if (isConsentVisible) {
    loader.classList.add('hidden');
    loader.style.opacity = '0';
    return;
  }

  loader.classList.remove('hidden');
  loader.style.display = 'flex';
  setTimeout(() => {
    loader.style.opacity = '1';
  }, 10);

  const bgColor = Elements.loaderBgColorInput.value;
  const opacity = Elements.loaderOpacityInput.value;

  // Используем существующую функцию hexToRgb
  const rgb = hexToRgb(bgColor);
  if (rgb) {
    loader.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  } else {
    // fallback на черный, если что-то пошло не так
    loader.style.backgroundColor = `rgb(17, 17, 17, ${opacity})`;
  }
}

// === FULLSCREEN HANDLER ===
document.addEventListener('fullscreenchange', () => {
  document.querySelectorAll('.camera-box.fullscreen').forEach(el => {
    el.classList.remove('fullscreen');
  });
});

// === HELP MODAL ===
Elements.helpBtn.addEventListener('click', () => Elements.helpModal.classList.remove('hidden'));
Elements.closeHelpBtn.addEventListener('click', () => Elements.helpModal.classList.add('hidden'));
Elements.helpModal.addEventListener('click', e => {
  if (!e.target.closest('.bg-white')) Elements.helpModal.classList.add('hidden');
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') Elements.helpModal.classList.add('hidden');
});

// === STARTUP ===
document.addEventListener('DOMContentLoaded', async () => {
  await hydrateSettingsFromAppApi();
  window.lucide && lucide.createIcons();
  // === HELP MODAL LOGIC ===
  function showModal() {
    Elements.helpModal.setAttribute('aria-hidden', 'false');
    Elements.helpModal.classList.remove('invisible', 'opacity-0');
    Elements.helpModal.classList.add('flex');
    Elements.modalDialog.classList.remove('modal-fade-out');
    Elements.modalDialog.classList.add('modal-fade-in');
    setTimeout(() => Elements.helpModal.classList.add('opacity-100'), 10);
  }

  function hideModal() {
    Elements.modalDialog.classList.remove('modal-fade-in');
    Elements.modalDialog.classList.add('modal-fade-out');
    Elements.helpModal.classList.remove('opacity-100');
    setTimeout(() => {
      Elements.helpModal.classList.remove('flex');
      Elements.helpModal.classList.add('invisible', 'opacity-0');
      Elements.helpModal.setAttribute('aria-hidden', 'true');
      Elements.helpBtn.focus();
    }, 330);
  }

  // Обработчики событий
  Elements.helpBtn.addEventListener('click', showModal);
  Elements.closeHelpBtn.addEventListener('click', hideModal);

  Elements.helpModal.addEventListener('mousedown', e => {
    if (e.target === Elements.helpModal) hideModal();
  });

  document.addEventListener('keydown', e => {
    if (Elements.helpModal.classList.contains('flex') && e.key === 'Escape') hideModal();
  });

  document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') btn.click();
    });
  });
  if (Elements.toolbar) {
    // Поиск всех кнопок с классом glass-btn
    Elements.toolbar.querySelectorAll('.glass-btn').forEach(button => {
      // Обработчик наведения мыши - показывает подсказку
      button.addEventListener('mouseenter', () => {
          const tooltip = button.querySelector('.custom-tooltip');
          if (tooltip) {
              tooltip.style.opacity = '1';
              tooltip.style.pointerEvents = 'auto';
          }
      });
      // Каждой добавление обработчика клика
      button.addEventListener('click', () => {
        // При клике ищется элемент с классом 'custom-tooltip' внутри этой кнопки
        const tooltip = button.querySelector('.custom-tooltip');
        // Если подсказка найдена
        if (tooltip) {
          // Устанавливается прозрачность в 0 (делает подсказку невидимой и неинтерактивной)
          tooltip.style.opacity = '0';
          tooltip.style.pointerEvents = 'none';
        }
      });
      // Добавление обработчика при уходе мыши
      button.addEventListener('mouseleave', () => {
        // При уходе Ищется элемент подсказки
        const tooltip = button.querySelector('.custom-tooltip');
        if (tooltip) {
          tooltip.style.opacity = '0';
          tooltip.style.pointerEvents = 'none';
        }
      });
    });
  }
  init();
  updateBorderRightValue();
  updateCameraTitleFontSize();
  setTimeout(() => {
    debouncedUpdateDividers();
  }, 0);
  if (!localStorage.getItem('printerCamsV2Consent')) {
    showConsent();
  } else {
    State.allowLocalStorage = true;
    if (!loadFromLocalStorage()) {
      loadCameras(Config.defaultCameras);
      renderCameraTable(Config.defaultCameras);
    }
    renderCameraTable();
    renderCameras();
    updateInterfaceWidth();
  }

  Elements.headerTextColorInput.addEventListener('input', () => {
    updateHeader();
    updateToolbarColors();
  });

  Elements.dividerThicknessInput.addEventListener('input', updateBorderRightValue);

  document.addEventListener('fullscreenchange', () => {
    document.querySelectorAll('.camera-box.fullscreen').forEach(el => {
      el.classList.remove('fullscreen');
    });
  });
});

function updateBorderRightValue() {
  document.documentElement.style.setProperty('--border-right', `${Elements.dividerThicknessInput.value}px`);
}
lucide.createIcons({strokeWidth:1.5});

// reveal on scroll
const observeri=new IntersectionObserver(e=>e.forEach(i=>i.isIntersecting&&i.target.classList.add('show')), {threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>observeri.observe(el));

// hints
const aBtn=document.getElementById('allowConsentBtn'), dBtn=document.getElementById('denyConsentBtn'),
      aHint=document.getElementById('acceptHint'), dHint=document.getElementById('declineHint'), 
      cBtn=document.getElementById('consetModalCloseBtn'), cHint=document.getElementById('closeHint');
const hide=()=>{aHint.style.opacity=0;dHint.style.opacity=0;cHint.style.opacity=0;};
aBtn.onmouseenter=()=>{hide();aHint.style.opacity=1};
dBtn.onmouseenter=()=>{hide();dHint.style.opacity=1};
cBtn.onmouseenter=()=>{hide();cHint.style.opacity=1};
[aBtn, dBtn, cBtn, aHint.parentElement, dHint.parentElement, cHint.parentElement].forEach(el => el.onmouseleave = hide);

aBtn.onclick=()=>alert('Условия приняты!');
dBtn.onclick=()=>alert('Спасибо за проявленый интерес. Доступ закрыт.');

function toggleSections(showStart) {
  const startSections = document.querySelectorAll('section[id="Start"]');
  const endSections = document.querySelectorAll('section[id="End"]');

  startSections.forEach(el => {
    el.style.display = showStart ? 'block' : 'none';
  });

  endSections.forEach(el => {
    el.style.display = !showStart ? 'block' : 'none';
  });
}
document.getElementById('consetModalBtn')?.addEventListener('click', () => {
  const modal = document.getElementById('consentModal');
  toggleSections(false)
  if (modal) {
    modal.classList.remove('hidden');
  }
});
document.getElementById('consetModalCloseBtn')?.addEventListener('click', () => {
  const modal = document.getElementById('consentModal');
  if (modal) {
    modal.classList.add('hidden');
  }
});
//Муравьи
// Удаляем блок ants при gridColumns <= 5
function updateAntsVisibility() {
  const antsBlock = document.getElementById('ants');
  if (!antsBlock) return;

  const gridColumns = parseInt(Elements.gridColumnsInput.value || 3);

  if (gridColumns <= 5) {
    // Очищаем содержимое блока
    antsBlock.innerHTML = '';
  } else {
    // Проверяем, есть ли уже контент
    if (antsBlock.children.length === 0) {
      // Создаём необходимую структуру
      const antContainer = document.createElement('div');
      antContainer.id = 'ant-container';
      antContainer.className = 'pointer-events-none fixed inset-0 z-900';
      
      const borderDiv = document.createElement('div');
      borderDiv.className = 'absolute bottom-0 w-full border-t border-neutral-800/60';
      
      antsBlock.appendChild(antContainer);
      antsBlock.appendChild(borderDiv);
      
      // Перезапускаем анимацию муравьёв
      initAnts();
    }
  }
}


function initAnts() {
      const ANT_COUNT        = 20;
      const MIN_SPEED        = 0.04;
      const MAX_SPEED        = 0.25;
      const FRICTION         = 0.995;
      const SCARE_BOOST      = 0.6;

      /* Параметры стаи */
      const NEIGHBOR_DIST    = 120;
      const CLOSE_DIST       = 40;
      const ALIGN_FACTOR     = 0.05;
      const COHESION_FACTOR  = 0.0009;
      const SEPARATION_FACTOR= 0.03;

      /* Отступ от края, за который нельзя уйти */
      const BORDER_MARGIN    = 20;

      const ants = [];
      const container = document.getElementById('ant-container');
      let W = window.innerWidth;
      let H = window.innerHeight;

      const antSVG = `
        <svg width="20" height="8" viewBox="0 0 20 8" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <circle cx="3"  cy="4" r="3"></circle>
          <circle cx="9"  cy="4" r="3"></circle>
          <circle cx="15" cy="4" r="3"></circle>
        </svg>`;

      for (let i = 0; i < ANT_COUNT; i++) {
        const el = document.createElement('div');
        el.innerHTML = antSVG;
        el.className = 'absolute text-neutral-200 transition-transform duration-150 will-change-transform';
        el.style.transformOrigin = 'center';
        container.appendChild(el);

        ants.push({
          el,
          x: Math.random() * (W - 2 * BORDER_MARGIN) + BORDER_MARGIN,
          y: Math.random() * (H - 2 * BORDER_MARGIN) + BORDER_MARGIN,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
        });
      }

      let last = performance.now();
      function tick(now) {
        const dt = now - last;
        last = now;

        // --- стайная логика ---
        for (let i = 0; i < ANT_COUNT; i++) {
          const a = ants[i];

          let avgVX = 0, avgVY = 0, avgX = 0, avgY = 0, count = 0;
          let sepX = 0, sepY = 0, sepCount = 0;

          for (let j = 0; j < ANT_COUNT; j++) {
            if (i === j) continue;
            const b = ants[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist2 = dx*dx + dy*dy;

            if (dist2 < NEIGHBOR_DIST*NEIGHBOR_DIST) {
              avgVX += b.vx;
              avgVY += b.vy;
              avgX  += b.x;
              avgY  += b.y;
              count++;

              if (dist2 < CLOSE_DIST*CLOSE_DIST) {
                sepX -= dx;
                sepY -= dy;
                sepCount++;
              }
            }
          }

          // Alignment
          if (count) {
            a.vx += ((avgVX / count) - a.vx) * ALIGN_FACTOR;
            a.vy += ((avgVY / count) - a.vy) * ALIGN_FACTOR;

            // Cohesion
            a.vx += ((avgX / count) - a.x) * COHESION_FACTOR;
            a.vy += ((avgY / count) - a.y) * COHESION_FACTOR;
          }

          // Separation
          if (sepCount) {
            a.vx += (sepX / sepCount) * SEPARATION_FACTOR;
            a.vy += (sepY / sepCount) * SEPARATION_FACTOR;
          }
        }

        // --- перемещение и отрисовка ---
        ants.forEach(a => {
          a.x += a.vx * dt;
          a.y += a.vy * dt;

          // Фрикционное сглаживание
          a.vx *= FRICTION;
          a.vy *= FRICTION;

          // Ограничение скорости
          let speed = Math.hypot(a.vx, a.vy);
          if (speed < MIN_SPEED) {
            a.vx *= MIN_SPEED / (speed || 1);
            a.vy *= MIN_SPEED / (speed || 1);
          }
          if (speed > MAX_SPEED) {
            a.vx *= MAX_SPEED / speed;
            a.vy *= MAX_SPEED / speed;
          }

          // Жёсткие границы экрана
          if (a.x < BORDER_MARGIN) {
            a.x = BORDER_MARGIN;
            a.vx = Math.abs(a.vx);
          } else if (a.x > W - BORDER_MARGIN) {
            a.x = W - BORDER_MARGIN;
            a.vx = -Math.abs(a.vx);
          }

          if (a.y < BORDER_MARGIN) {
            a.y = BORDER_MARGIN;
            a.vy = Math.abs(a.vy);
          } else if (a.y > H - BORDER_MARGIN) {
            a.y = H - BORDER_MARGIN;
            a.vy = -Math.abs(a.vy);
          }

          const angleDeg = Math.atan2(a.vy, a.vx) * 180 / Math.PI;
          a.el.style.transform = `translate(${a.x}px, ${a.y}px) rotate(${angleDeg}deg)`;
        });

        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);

      // Испуг курсором
      window.addEventListener('mousemove', e => {
        ants.forEach(a => {
          const dx = a.x - e.clientX;
          const dy = a.y - e.clientY;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 16000) {
            const len = Math.sqrt(dist2) || 1;
            a.vx += (dx / len) * SCARE_BOOST;
            a.vy += (dy / len) * SCARE_BOOST;
          }
        });
      });

      window.addEventListener('resize', () => {
        W = window.innerWidth;
        H = window.innerHeight;
      });
      lucide.createIcons();
    };
