import { Elements } from './elements.js';
import { Config } from './config.js';
import { hexToRgbStr, parseRGB, rgbToHsv, hsvToRgb } from './utils.js';

export function updateHeader() {
  document.documentElement.style.setProperty('--toolbar-icon-color', Elements.headerTextColorInput!.value);
  if (Elements.headerTitle) {
    Elements.headerTitle.textContent = Elements.headerTextInput!.value.trim() || 'Активные принтера';
  }

  if (Elements.hideHeaderCheckbox?.checked) {
    Elements.mainHeader?.classList.add('hidden');
  } else {
    Elements.mainHeader?.classList.remove('hidden');
  }

  if (Elements.headerTitle) {
    Elements.headerTitle.style.color = Elements.headerTextColorInput!.value;
  }

  const bg = Elements.headerBgColorInput!.value;
  const op = parseFloat(Elements.headerBgOpacityInput!.value);
  if (Elements.headerBar) {
    Elements.headerBar.style.backgroundColor = `rgba(${parseInt(bg.substr(1,2),16)},${parseInt(bg.substr(3,2),16)},${parseInt(bg.substr(5,2),16)},${op})`;
  }
}

export function updateToolbarColors() {
  const color1 = Elements.color1Input!.value;
  const color2 = Elements.color2Input!.value;
  const iColor = Elements.headerTextColorInput!.value;

  const rgb1 = hexToRgbStr(color1);
  const rgb2 = hexToRgbStr(color2);
  const rgbi = hexToRgbStr(iColor);

  document.documentElement.style.setProperty('--base-color1', rgb1 || '');
  document.documentElement.style.setProperty('--base-color2', rgb2 || '');
  document.documentElement.style.setProperty('--toolbar-icon-color', rgbi || '');
}

export function updateActionIconColors() {
  const color1 = getComputedStyle(document.documentElement).getPropertyValue('--base-color1').trim();
  const color2 = getComputedStyle(document.documentElement).getPropertyValue('--base-color2').trim();

  const rgb1 = parseRGB(color1);
  const rgb2 = parseRGB(color2);

  if (!rgb1 || !rgb2) {
    console.error("Не удалось распарсить один из цветов.");
    return null;
  }

  const avgRgb = {
    r: Math.round((rgb1.r + rgb2.r) / 2),
    g: Math.round((rgb1.g + rgb2.g) / 2),
    b: Math.round((rgb1.b + rgb2.b) / 2)
  };

  document.documentElement.style.setProperty('--base-color-rgb', `${avgRgb.r} ${avgRgb.g} ${avgRgb.b}`);

  const [h1, s1, v1] = rgbToHsv(avgRgb.r, avgRgb.g, avgRgb.b);

  const textRgb = v1 < 70 ? '255 255 255' : '0 0 0';
  const textRgbW1 = v1 < 90 ? '255 255 255' : '0 0 0';
  const textRgbInvert = v1 < 70 ? '0 0 0' : '255 255 255';
  document.documentElement.style.setProperty('--text-rgb', textRgb);
  document.documentElement.style.setProperty('--textW1-rgb', textRgbW1);
  document.documentElement.style.setProperty('--textInvert-rgb', textRgbInvert);

  const tetradColor1 = { r: Math.min(255, 255 - rgb1.r), g: Math.min(255, 255 - rgb1.g), b: Math.min(255, 255 - rgb1.b) };
  const tetradColor2 = { r: Math.min(255, 255 - rgb2.r), g: Math.min(255, 255 - rgb2.g), b: Math.min(255, 255 - rgb2.b) };

  document.documentElement.style.setProperty('--tetrad-color1-rgb', `${tetradColor1.r} ${tetradColor1.g} ${tetradColor1.b}`);
  document.documentElement.style.setProperty('--tetrad-color2-rgb', `${tetradColor2.r} ${tetradColor2.g} ${tetradColor2.b}`);

  const shiftFactor = parseFloat((document.getElementById('colorIntOver') as HTMLInputElement)?.value || '1.2');

  function adjustTone(rgb: {r: number, g: number, b: number}, factor: number) {
    return {
      r: Math.min(255, Math.max(0, Math.round(rgb.r * factor + 0.5))),
      g: Math.min(255, Math.max(0, Math.round(rgb.g * factor + 0.5))),
      b: Math.min(255, Math.max(0, Math.round(rgb.b * factor + 0.5)))
    };
  }

  const colorGroups = {
    base1: rgb1,
    base2: rgb2,
    avg: avgRgb,
    tetrad1: tetradColor1,
    tetrad2: tetradColor2
  };

  for (const [name, rgb] of Object.entries(colorGroups)) {
    const light = adjustTone(rgb, shiftFactor);
    const dark = adjustTone(rgb, 1 / shiftFactor);
    document.documentElement.style.setProperty(`--${name}-light-rgb`, `${light.r} ${light.g} ${light.b}`);
    document.documentElement.style.setProperty(`--${name}-dark-rgb`, `${dark.r} ${dark.g} ${dark.b}`);
  }

  const [h, s, v] = rgbToHsv(avgRgb.r, avgRgb.g, avgRgb.b);

  function clamp(value: number, min: number, max: number) {
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

  for (const [key, [hVal, sVal, vVal]] of Object.entries(hsvShifts)) {
    const rgb = hsvToRgb(hVal, sVal, vVal);
    document.documentElement.style.setProperty(`--${key}-rgb`, `${rgb[0]} ${rgb[1]} ${rgb[2]}`);
  }

  if (!document.fullscreenElement) {
    document.querySelectorAll('.action-icon i, .action-icon svg').forEach(icon => {
      icon.style.color = `rgb(${avgRgb.r} ${avgRgb.g} ${avgRgb.b})`;
    });
  }
  return avgRgb;
}

export function updateNotificationOpacity() {
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
    // getNotificationStyles is assumed to be in ui.ts or utils.ts
    // I'll define it here as well to make the module self-contained
    const styles = getNotificationStyles(isSystem || isError ? isSystem : false);
    const { color } = styles;

    const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!rgbaMatch) return;

    const [r, g, b] = rgbaMatch.slice(1, 4).map(Number);
    notification.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacityValue})`;
  });
}

function getNotificationStyles(isSystem: boolean) {
  return isSystem 
    ? { color: 'rgba(74, 222, 128, 1)', icon: 'info' } 
    : { color: 'rgba(255, 77, 77, 1)', icon: 'alert-circle' };
}

export function updateGrid() {
  if (Elements.cameraContainer && Elements.gridColumnsInput) {
    Elements.cameraContainer.style.gridTemplateColumns = `repeat(${Elements.gridColumnsInput.value}, minmax(0, 1fr))`;
  }
  updateAntsVisibility();
}

function updateAntsVisibility() {
    // Logic from original app.ts
    const ants = document.querySelectorAll('.ants');
    ants.forEach(ant => {
        ant.style.display = 'none';
    });
}

export function updateInterfaceWidth() {
    if (!Elements.interfaceWidthInput || !Elements.mainInterfaceContainer || !Elements.mainInterfaceContainerCameras) return;
    const width = +Elements.interfaceWidthInput.value;
    const screenWidth = window.innerWidth;
    const padding = 20;

    const finalWidth = Math.min(Math.max(width, 800), screenWidth - padding);

    Elements.interfaceWidthInput.value = finalWidth;
    if (Elements.interfaceWidth) Elements.interfaceWidth.value = finalWidth;

    [Elements.mainInterfaceContainer, Elements.mainInterfaceContainerCameras].forEach(el => {
        if (!el.style.transition) {
            el.style.transition = 'width 0.5s ease-in-out, max-width 0.5s ease-in-out';
        }
        el.style.width = `${finalWidth}px`;
        el.style.maxWidth = `${finalWidth}px`;
        if (finalWidth < screenWidth) {
            el.style.marginLeft = 'auto';
            el.style.marginRight = 'auto';
        } else {
            el.style.marginLeft = `${padding / 2}px`;
            el.style.marginRight = `${padding / 2}px`;
        }
    });

    if (Elements.interfaceWidthValue) Elements.interfaceWidthValue.textContent = 'px';
}

export function updateInterfaceHeight() {
    if (document.fullscreenElement) return;
    if (!Elements.interfaceHeightInput) return;
    const height = +Elements.interfaceHeightInput.value;
    const minHeight = 180;
    const maxHeight = 1080;

    const finalHeight = Math.min(Math.max(height, minHeight), maxHeight);

    Elements.interfaceHeightInput.value = finalHeight.toString();
    if (Elements.interfaceHeight) Elements.interfaceHeight.value = finalHeight.toString();

    const cameraBoxes = document.querySelectorAll('.camera-box');
    cameraBoxes.forEach(camBox => {
        const cameraImg = camBox.querySelector('.camera-img') as HTMLElement;
        if (cameraImg) {
            cameraImg.style.minHeight = `${finalHeight}px`;
            cameraImg.style.height = `${finalHeight}px`;
        }
        const img = camBox.querySelector('img') as HTMLElement;
        if (img) {
            img.style.minHeight = `${finalHeight}px`;
        }
    });

    if (Elements.interfaceHeightValue) Elements.interfaceHeightValue.textContent = 'px';
}

export function setDefaultInterfaceWidth() {
    const defaultWidth = 1400;
    if (Elements.interfaceWidth) Elements.interfaceWidth.value = defaultWidth;
    if (Elements.interfaceWidthInput) Elements.interfaceWidthInput.value = defaultWidth;
    updateInterfaceWidth();
}

export function updateLoader() {
  if (!Elements.hideLoaderCheckbox || !Elements.loaderBgColorInput || !Elements.loaderOpacityInput) return;
  const loaderOverlay = document.getElementById('loaderOverlay');
  if (!loaderOverlay) return;

  loaderOverlay.style.display = Elements.hideLoaderCheckbox.checked ? 'none' : 'block';
  loaderOverlay.style.backgroundColor = Elements.loaderBgColorInput.value;
  loaderOverlay.style.opacity = Elements.loaderOpacityInput.value;
}

export function updateToolbarVisibility() {
  if (!Elements.hideHeaderCheckbox || !Elements.mainHeader) return;
  Elements.mainHeader.classList.toggle('hidden', Elements.hideHeaderCheckbox.checked);
}
