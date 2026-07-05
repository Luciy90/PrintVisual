import { Elements } from './elements.js';
import { Config } from './config.js';
import { State } from './state.js';
import { hexToRgbStr, parseRGB, rgbToHsv, hsvToRgb } from './utils.js';

declare const lucide: any;
let resizeTimeout: any;

// === MODAL SET FUNCTIONS ===
export function updateOpenSettingsButtonState() {
  const btn = document.getElementById('openSettingsBtn');
  if (!btn) return;
  
  const hasChanges = State.settingsChanged || false;
  if (hasChanges) {
    btn.classList.add('settings-changed');
  } else {
    btn.classList.remove('settings-changed');
  }
}

export function openModalSet() {
  const modal = document.getElementById('modalSet');
  const overlay = document.getElementById('modalOverlay');
  if (!modal || !overlay) return;
  
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
  
  setTimeout(() => {
    modal.classList.add('show');
    overlay.classList.add('show');
  }, 10);
  
  document.body.style.overflow = 'hidden';
}

export function closeModalSet() {
  const modal = document.getElementById('modalSet');
  const overlay = document.getElementById('modalOverlay');
  if (!modal || !overlay) return;
  
  modal.classList.remove('show');
  overlay.classList.remove('show');
  
  setTimeout(() => {
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
  }, 300);
  
  document.body.style.overflow = '';
}

export function unlockTableHeight() {
  const tableContainer = document.getElementById('cameraTableContainer');
  if (!tableContainer) return;
  
  tableContainer.style.maxHeight = 'none';
  tableContainer.style.overflowY = 'visible';
  tableContainer.classList.add('unlocked');
}

export function restoreTableHeight() {
  const tableContainer = document.getElementById('cameraTableContainer');
  if (!tableContainer) return;
  
  tableContainer.style.maxHeight = '60vh';
  tableContainer.style.overflowY = 'auto';
  tableContainer.classList.remove('unlocked');
}

export function animateHeight(fn: Function, el: HTMLElement) {
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
      (icon as HTMLElement).style.color = `rgb(${avgRgb.r} ${avgRgb.g} ${avgRgb.b})`;
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
    const styles = getNotificationStyles(isSystem || isError ? isSystem : false);
    const { color } = styles;

    const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!rgbaMatch) return;

    const [r, g, b] = rgbaMatch.slice(1, 4).map(Number);
    (notification as HTMLElement).style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacityValue})`;
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

export function updateInterfaceWidth() {
    if (!Elements.interfaceWidthInput || !Elements.mainInterfaceContainer || !Elements.mainInterfaceContainerCameras) return;
    const width = +Elements.interfaceWidthInput.value;
    const screenWidth = window.innerWidth;
    const padding = 20;

    const finalWidth = Math.min(Math.max(width, 800), screenWidth - padding);

    Elements.interfaceWidthInput!.value = finalWidth.toString();
    if (Elements.interfaceWidth) Elements.interfaceWidth.value = finalWidth.toString();

    [Elements.mainInterfaceContainer, Elements.mainInterfaceContainerCameras].forEach(el => {
        if (!el) return;
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
    if (Elements.interfaceWidth) Elements.interfaceWidth.value = defaultWidth.toString();
    if (Elements.interfaceWidthInput) Elements.interfaceWidthInput.value = defaultWidth.toString();
    updateInterfaceWidth();
}

export function updateToolbarVisibility() {
  const toolbar = document.getElementById('toolbar');
  if (!toolbar) return;

  if (Elements.hideHeaderCheckbox?.checked) {
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
        if (State.floatingToolbar) State.floatingToolbar.style.opacity = '1';
      });

      State.floatingToolbar.addEventListener('mouseleave', () => {
        if (State.floatingToolbar) State.floatingToolbar.style.opacity = '0';
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

export function updateLoader() {
  const loader = document.getElementById('loaderOverlay');
  const consentModal = document.getElementById('consentModal');

  if (!loader) return;

  if (Elements.hideLoaderCheckbox?.checked) {
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

  const bgColor = Elements.loaderBgColorInput?.value || '#111111';
  const opacity = Elements.loaderOpacityInput?.value || '1';

  const rgb = hexToRgbStr(bgColor);
  if (rgb) {
    loader.style.backgroundColor = `rgba(${rgb}, ${opacity})`;
  } else {
    loader.style.backgroundColor = `rgba(17, 17, 17, ${opacity})`;
  }
}

export function updateCameraTitleFontSize() {
  const fontSize = Elements.namedDrivInput?.value || '0.9';
  document.querySelectorAll('.camera-box .camera-title').forEach(title => {
    (title as HTMLElement).style.fontSize = `${fontSize}rem`;
  });
  if (Elements.namedDrivValue) {
    Elements.namedDrivValue.textContent = `${fontSize}rem`;
  }
  document.documentElement.style.setProperty('--named-driv-font-size', `${fontSize}rem`);
}

export function clearToolbarInlineStyles() {
  setTimeout(() => {
    const toolbars = document.querySelectorAll('[data-fa-i2svg]');
    toolbars.forEach(toolbar => {
      (toolbar as HTMLElement).style.color = '';
    });
  }, 100);
}

export function updateAntsVisibility() {
  const antsBlock = document.getElementById('ants');
  if (!antsBlock) return;

  const gridColumns = parseInt(Elements.gridColumnsInput?.value || '3');

  if (gridColumns <= 5) {
    antsBlock.innerHTML = '';
  } else {
    if (antsBlock.children.length === 0) {
      const antContainer = document.createElement('div');
      antContainer.id = 'ant-container';
      antContainer.className = 'pointer-events-none fixed inset-0 z-900';
      
      const borderDiv = document.createElement('div');
      borderDiv.className = 'absolute bottom-0 w-full border-t border-neutral-800/60';
      
      antsBlock.appendChild(antContainer);
      antsBlock.appendChild(borderDiv);
      
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
    const NEIGHBOR_DIST    = 120;
    const CLOSE_DIST       = 40;
    const ALIGN_FACTOR     = 0.05;
    const COHESION_FACTOR  = 0.0009;
    const SEPARATION_FACTOR= 0.03;
    const BORDER_MARGIN    = 20;

    const ants: any[] = [];
    const container = document.getElementById('ant-container');
    if (!container) return;
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
    function tick(now: number) {
        const dt = now - last;
        last = now;

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

          if (count) {
            a.vx += ((avgVX / count) - a.vx) * ALIGN_FACTOR;
            a.vy += ((avgVY / count) - a.vy) * ALIGN_FACTOR;
            a.vx += ((avgX / count) - a.x) * COHESION_FACTOR;
            a.vy += ((avgY / count) - a.y) * COHESION_FACTOR;
          }

          if (sepCount) {
            a.vx += (sepX / sepCount) * SEPARATION_FACTOR;
            a.vy += (sepY / sepCount) * SEPARATION_FACTOR;
          }
        }

        ants.forEach(a => {
          a.x += a.vx * dt;
          a.y += a.vy * dt;
          a.vx *= FRICTION;
          a.vy *= FRICTION;

          let speed = Math.hypot(a.vx, a.vy);
          if (speed < MIN_SPEED) {
            a.vx *= MIN_SPEED / (speed || 1);
            a.vy *= MIN_SPEED / (speed || 1);
          }
          if (speed > MAX_SPEED) {
            a.vx *= MAX_SPEED / speed;
            a.vy *= MAX_SPEED / speed;
          }

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
}

export function delayedMaxWidthAdjustment() {
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }
    
    const containers = [Elements.mainInterfaceContainer, Elements.mainInterfaceContainerCameras];
    containers.forEach(el => {
        if (el) {
            el.style.transition = 'width 0.5s ease-in-out, max-width 0.5s ease-in-out';
        }
    });
    
    resizeTimeout = setTimeout(() => {
        const maxWidth = window.innerWidth - 50;
        if (Elements.interfaceWidthInput) Elements.interfaceWidthInput.value = maxWidth.toString();
        if (Elements.interfaceWidth) Elements.interfaceWidth.value = maxWidth.toString();
        updateInterfaceWidth();
        
        setTimeout(() => {
            containers.forEach(el => {
                if (el) {
                    el.style.transition = '';
                }
            });
        }, 500);
    }, 2000);
}

