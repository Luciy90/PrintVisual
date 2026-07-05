import { Elements } from './elements.js';
import { State } from './state.js';

let notificationQueue: string[][] = [];
let isProcessing = false;
const NOTIFICATION_DELAY = 300;
let notificationCounter = 0;
let activeNotifications = new Set<string>();
const notificationBuffer = new Set<string>();
let bufferTimer: any = null;
let globalCollapseTimeout: any = null;
let hoveredNotificationsCount = 0;
let positionUpdateQueue: any[] = [];
let isProcessingQueue = false;
const POSITION_UPDATE_DELAY = 16;
const notificationHeight = 50;
let activeNotificationsBuffer = new Set<string>();
let notificationOffset = 0;
const NOTIFICATION_COLLAPSE_DELAY = 5000;

export function getNotificationStyles(isSystem = false) {
  const colorInput = isSystem ? Elements.systemNotificationColorInput : Elements.errorNotificationColorInput;
  const opacityInput = Elements.notificationOpacityInput;
  const color = colorInput?.value || "#ff4d4d";
  const opacity = opacityInput ? +opacityInput.value : 0.2;

  const r = parseInt(color.substr(1, 2), 16);
  const g = parseInt(color.substr(3, 2), 16);
  const b = parseInt(color.substr(5, 2), 16);

  return {
    color: `rgba(${r},${g},${b},${opacity})`,
    border: `rgba(${r},${g},${b},${Math.max(opacity * 0.7, 0.25)})`
  };
}

function checkAndRemoveDuplicateBuffer(message: string) {
  if (activeNotifications.has(message)) return true;
  return false;
}

function flushBuffer() {
  if (notificationBuffer.size === 0) return;
  for (const item of notificationBuffer) {
    const { message, type } = JSON.parse(item);
    if (!checkAndRemoveDuplicate(message)) {
      activeNotifications.add(message);
      notificationQueue.push([message, type]);
    }
  }
  notificationBuffer.clear();
  processNotificationQueue();
}

function checkAndRemoveDuplicate(message: string) {
  const container = document.getElementById("notificationContainer");
  if (!container) return false;
  const cleanMessage = stripHtml(message).trim();
  const existing = Array.from(container.querySelectorAll(".notification")).find(notification => {
    const span = notification.querySelector("span");
    return span?.textContent?.trim() === cleanMessage;
  });
  if (existing) {
    animateAndRemoveNotification(existing as HTMLElement);
    return true;
  }
  return false;
}

function stripHtml(html: string) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function updateNotificationZIndices() {
  const container = document.getElementById("notificationContainer");
  if (!container) return;
  const notifications = Array.from(container.querySelectorAll(".notification"));
  notifications.forEach((notification, index) => {
    (notification as HTMLElement).style.zIndex = (40 + index).toString();
  });
}

export function schedulePositionUpdate() {
  requestAnimationFrame(() => {
    updateAllNotificationPositions();
  });
}

function updateAllNotificationPositions() {
  const container = document.getElementById("notificationContainer");
  if (!container) return;
  const gap = 10;
  const notifications = Array.from(container.querySelectorAll(".notification"))
    .filter((n: any) => !n.dataset.animating && n.dataset.collapsed !== 'true')
    .sort((a: any, b: any) => parseInt(a.dataset.number) - parseInt(b.dataset.number));

  if (notifications.length === 0) return;

  let cumulativeBottom = 0;
  notifications.forEach((notification: any, index: number) => {
    notification.dataset.number = index.toString();
    notification.style.zIndex = (40 + index).toString();
    cumulativeBottom = index * (notification.offsetHeight + gap);
    notification.style.transition = "bottom 0.6s ease";
    notification.style.bottom = `${cumulativeBottom}px`;
  });
  notificationCounter = notifications.length;
  updateNotificationZIndices();
}

function processNotificationQueue() {
  if (isProcessing || notificationQueue.length === 0) return;
  isProcessing = true;
  const [message, type] = notificationQueue.shift()!;
  _createNotification(message, type);
  setTimeout(() => {
    isProcessing = false;
    processNotificationQueue();
  }, NOTIFICATION_DELAY);
}

export function enqueueNotification(message: string, type = "info") {
  if (Elements.hideNotificationCheckbox?.checked) return;
  if (State.allowLocalStorage === false) {
      // When localStorage is disabled, we can still show some notifications, 
      // but the original logic had suppressNotifications. 
      // For simplicity, we'll allow them unless suppressed.
  }
  
  if (notificationBuffer.size > 0 || bufferTimer) {
      addToBuffer(message, type);
  } else {
      addToBuffer(message, type);
  }
}

function addToBuffer(message: string, type = "info") {
  if (checkAndRemoveDuplicateBuffer(message)) return;
  notificationBuffer.add(JSON.stringify({ message, type }));
  if (bufferTimer) clearTimeout(bufferTimer);
  bufferTimer = setTimeout(flushBuffer, 900);
}

function _createNotification(message: string, type = "info") {
  const container = document.getElementById("notificationContainer");
  if (!container) return;

  const allNotifications = Array.from(container.querySelectorAll(".notification"))
    .filter((n: any) => n.dataset.animating !== 'true');

  let maxNumber = allNotifications.reduce((max, el) => {
    const num = parseInt((el as any).dataset.number);
    return isNaN(num) ? max : Math.max(max, num);
  }, -1);

  const hasCollapsed = allNotifications.some((n: any) => n.dataset.collapsed === 'true');
  const visibleCount = hasCollapsed 
    ? Math.min(1, allNotifications.length) 
    : allNotifications.filter((n: any) => n.dataset.collapsed !== 'true').length;

  const div = document.createElement("div");
  let iconClass = '';
  const isSystem = type === "system";
  const isError = type === "error";
  const isInfo = type === "info";

  const number = maxNumber + 1;
  div.dataset.number = number.toString();
  div.className = `notification notif-enter flex items-center gap-3 rounded-lg shadow-md px-4 py-2 mb-1 border bg-white/90`;
  div.style.opacity = "0";
  div.style.transform = "translateY(100px)";
  div.style.transition = "opacity 0.3s ease, transform 0.3s ease, bottom 0.6s ease, filter 0.3s ease";
  div.style.position = "absolute";
  div.style.right = "0";
  div.style.zIndex = (40 + number).toString();
  div.style.bottom = `-50px`;

  if (isError) {
    const { color, border } = getNotificationStyles(false);
    div.style.background = color;
    div.style.borderColor = border;
    iconClass = 'fas fa-exclamation-circle';
  } else if (isSystem) {
    const { color, border } = getNotificationStyles(true);
    div.style.background = color;
    div.style.borderColor = border;
    iconClass = 'fas fa-check-circle';
  } else {
    const opacity = Elements.notificationOpacityInput ? +Elements.notificationOpacityInput.value : 0.75;
    div.style.background = `rgb(var(--white)/${opacity})`;
    div.style.borderColor = `rgba(255,255,255,${opacity * 0.8})`;
    iconClass = 'fas fa-info-circle';
  }

  if (isInfo) {
    div.innerHTML = `
        <i class="text-[rgba(0,0,0,0.8)] ${iconClass}" ></i>
        <span class="text-[rgba(0,0,0,0.8)] flex-1 text-sm font-medium">${message}</span>
      `;
  } else {
    div.innerHTML = `
        <i class="text-white-castom-80 ${iconClass}" ></i>
        <span class="text-white-castom flex-1 text-sm font-medium">${message}</span>
      `;
  }

  container.appendChild(div);
  updateNotificationZIndices();
  hideNonTopCollapsedNotifications();

  const height = div.offsetHeight;
  const gap = 10;
  let newBottom = (hasCollapsed ? 1 + notificationCounter : visibleCount) * (height + gap);
  
  requestAnimationFrame(() => {
    div.style.opacity = "1";
    div.style.transform = "translateY(0)";
    div.style.bottom = `${newBottom}px`;
  });

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
  div.addEventListener('click', () => animateAndRemoveNotification(div));
}

export function animateAndRemoveNotification(div: HTMLElement) {
  if (!div || div.dataset.animating === 'true') return;
  div.dataset.animating = 'true';

  if (div.classList.contains('collapsed')) {
    _removeNotificationElement(div);
    return;
  }

  div.classList.add("wave-out");
  div.addEventListener('animationend', () => {
    _removeNotificationElement(div);
  }, { once: true });
}

function _removeNotificationElement(div: HTMLElement) {
  const container = document.getElementById("notificationContainer");
  if (!container) return;
  const allNotifications = Array.from(container.querySelectorAll(".notification"));
  notificationCounter = allNotifications.length;
  const innerHTML = div.querySelector("span")?.innerHTML.trim();
  if (innerHTML) activeNotifications.delete(innerHTML);
  div.remove();
  if (!div.classList.contains('collapsed')) {
    schedulePositionUpdate();
  }
  setTimeout(hideNonTopCollapsedNotifications, 300);
}

function startGlobalCollapseTimer() {
  clearTimeout(globalCollapseTimeout);
  globalCollapseTimeout = setTimeout(() => {
    const allNotifications = document.querySelectorAll(".notification");
    allNotifications.forEach(notification => {
      if (!notification.classList.contains('collapsed') && !(notification as HTMLElement).dataset.animating) {
        collapseNotification(notification as HTMLElement);
      }
    });
  }, 5000);
}

function collapseNotification(notificationElement: HTMLElement) {
  if (!notificationElement || 
    notificationElement.dataset.collapsed === 'true' || 
    notificationElement.closest('.camera-disconnected')) return;

  const container = document.getElementById("notificationContainer");
  if (!container) return;
  const allNotifications = Array.from(container.querySelectorAll(".notification"));
  if (allNotifications.length <= 1) return;

  notificationElement.dataset.collapsed = 'true';
  hideNonTopCollapsedNotifications();
  notificationElement.classList.add('collapsed');

  setTimeout(() => {
    const collapsedList = getCollapsedNotifications();
    const notificationActions = document.getElementById('notificationActions');
    if (collapsedList.length > 0 && notificationActions) {
      notificationActions.classList.remove('hidden');
      notificationActions.classList.add('show');
    }
    hideNonTopCollapsedNotifications();
  }, 300);
}

export function expandNotification(notificationElement: HTMLElement) {
  if (!notificationElement || 
    notificationElement.dataset.collapsed !== 'true' || 
    notificationElement.closest('.camera-disconnected')) return;

  delete notificationElement.dataset.collapsed;
  notificationElement.classList.remove('collapsed');
  if (notificationElement.dataset.originalOpacity) {
    notificationElement.style.opacity = notificationElement.dataset.originalOpacity;
    notificationElement.style.pointerEvents = "auto";
  }
  updateNotificationZIndices();
  schedulePositionUpdate();
  startGlobalCollapseTimer();
}

function getCollapsedNotifications() {
  const container = document.getElementById("notificationContainer");
  if (!container) return [];
  return Array.from(container.querySelectorAll(".notification")).filter((n: any) => n.dataset.collapsed === 'true');
}

function hideNonTopCollapsedNotifications() {
  const collapsed = getCollapsedNotifications();
  if (collapsed.length <= 0) return;
  const maxNumber = Math.max(...collapsed.map((n: any) => parseInt(n.dataset.number)));
  collapsed.forEach(notification => {
    const number = parseInt((notification as any).dataset.number);
    if (number < maxNumber) {
      (notification as HTMLElement).style.filter = "blur(4px)";
      (notification as HTMLElement).style.opacity = "0.2";
    } else {
      (notification as HTMLElement).style.filter = "none";
      (notification as HTMLElement).style.opacity = "1";
    }
  });
}

export function closeAllNotifications() {
  const allNotifications = document.querySelectorAll('.notification');
  allNotifications.forEach(notification => {
    if (!notification.classList.contains('fade-out-up')) {
      notification.classList.add('fade-out-up');
      notification.addEventListener('animationend', () => {
        _removeNotificationElement(notification as HTMLElement);
      }, { once: true });
    }
  });
  const notificationActions = document.getElementById('notificationActions');
  if (notificationActions) notificationActions.classList.add('hidden');
}

// === DIVIDER FUNCTIONS ===
export function getDividerGradient(startAlpha = "77", endAlpha = "E6"): string {
  const color = Elements.dividerColorInput?.value || '#ffffff';
  const color1 = Elements.color1Input?.value || '#3b82f6';
  const color2 = Elements.color2Input?.value || '#8b5cf6';
  return `linear-gradient(90deg,
    ${color1}00 0%,
    ${color1}${startAlpha} 5%,
    ${color}${endAlpha} 45%,
    ${color}${endAlpha} 55%,
    ${color2}${startAlpha} 95%,
    ${color2}00 100%
  )`;
}

export function applyDividerGradient(divider: HTMLElement) {
  const color = Elements.dividerColorInput?.value || '#ffffff';
  const color1 = Elements.color1Input?.value || '#3b82f6';
  const color2 = Elements.color2Input?.value || '#8b5cf6';
  divider.style.backgroundImage = getDividerGradient(startAlphaFromColor(color1), endAlphaFromColor(color));
  divider.style.backgroundRepeat = 'no-repeat';
  divider.style.backgroundSize = '100% 100%';
}

function startAlphaFromColor(color: string): string {
  return "77";
}

function endAlphaFromColor(color: string): string {
  return "E6";
}

export function syncDividerStyles() {
  const thickness = Elements.dividerThicknessInput?.value || '2';
  document.querySelectorAll('.horizontal-divider').forEach(divider => {
    divider.style.backgroundImage = getDividerGradient();
    divider.style.backgroundRepeat = 'no-repeat';
    divider.style.backgroundSize = '100% 100%';
    divider.style.height = `${thickness}px`;
  });
}

// === CONSENT AND SECTIONS ===
export function showConsent() {
  const consentModal = document.getElementById('consentModal');
  const loader = document.getElementById('loaderOverlay');

  toggleSections(!State.allowLocalStorage);

  if (consentModal) {
    consentModal.classList.remove('hidden');
    if (loader) {
      loader.classList.add('hidden');
      loader.style.opacity = '0';
      loader.style.display = 'none';
    }
  }

  if (Elements.allowConsentBtn) {
    Elements.allowConsentBtn.onclick = () => {
      State.allowLocalStorage = true;
      localStorage.setItem('printerCamsV2Consent', 'yes');
      consentModal?.classList.add('hidden');
      toggleSections(false);

      if (loader) {
        loader.classList.remove('hidden');
        loader.style.display = 'flex';
        setTimeout(() => {
          loader.style.opacity = '1';
        }, 10);
      }

      // Reload or init
      location.reload();
    };
  }

  if (Elements.denyConsentBtn) {
    Elements.denyConsentBtn.onclick = () => {
      State.allowLocalStorage = false;
      window.location.href = 'print%20.html';
    };
  }
}

export function toggleSections(showStart: boolean) {
  const startSections = document.querySelectorAll('section[id="Start"]');
  const endSections = document.querySelectorAll('section[id="End"]');

  startSections.forEach(el => {
    el.classList.toggle('hidden', !showStart);
  });

  endSections.forEach(el => {
    el.classList.toggle('hidden', showStart);
  });
}

export function hideLoader() {
  const loader = document.getElementById('loaderOverlay');
  if (loader) {
    loader.classList.add('hidden');
    loader.style.opacity = '0';
    loader.style.display = 'none';
  }
}

// === BUFFER FUNCTIONS ===
export function addToBuffer(message: string, type = "info") {
  if (checkAndRemoveDuplicateBuffer(message)) return;
  notificationBuffer.add(JSON.stringify({ message, type }));
  if (bufferTimer) clearTimeout(bufferTimer);
  bufferTimer = setTimeout(flushBuffer, 900);
}

export function flushBuffer() {
  if (notificationBuffer.size === 0) return;
  for (const item of notificationBuffer) {
    const { message, type } = JSON.parse(item);
    if (!checkAndRemoveDuplicate(message)) {
      activeNotifications.add(message);
      notificationQueue.push([message, type]);
    }
  }
  notificationBuffer.clear();
  processNotificationQueue();
}

export function checkAndRemoveDuplicateBuffer(message: string): boolean {
  if (activeNotificationsBuffer.has(message)) {
    return true;
  }
  return false;
}

export function stripHtml(html: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function checkAndRemoveDuplicate(message: string): boolean {
  const container = document.getElementById("notificationContainer");
  if (!container) return false;

  const cleanMessage = stripHtml(message).trim();

  const existing = Array.from(container.querySelectorAll(".notification")).find(notification => {
    const span = notification.querySelector("span");
    const text = span ? span.textContent.trim() : '';
    return text === cleanMessage;
  });

  if (existing) {
    animateAndRemoveNotification(existing as HTMLElement);
    return true;
  }
  return false;
}

// === POSITION UPDATE FUNCTIONS ===
let isUpdatingPositions = false;

export function schedulePositionUpdate() {
  if (isUpdatingPositions) return;
  isUpdatingPositions = true;

  requestAnimationFrame(() => {
    updateAllNotificationPositions();
    isUpdatingPositions = false;
  });
}

export function updateAllNotificationPositions() {
  const container = document.getElementById("notificationContainer");
  if (!container) return;
  const gap = 10;
  
  const notifications = Array.from(container.querySelectorAll(".notification"))
    .filter((n: any) => !n.dataset.animating && n.dataset.collapsed !== 'true')
    .sort((a: any, b: any) => parseInt(a.dataset.number) - parseInt(b.dataset.number));

  if (notifications.length === 0) return;

  let cumulativeBottom = 0;
  notifications.forEach((notification: any, index: number) => {
    const newNumber = index;
    notification.dataset.number = newNumber.toString();
    notification.style.zIndex = (40 + newNumber).toString();
    cumulativeBottom = newNumber * (notification.offsetHeight + gap);
    notification.style.transition = "bottom 0.6s ease";
    notification.style.bottom = `${cumulativeBottom}px`;
  });
  notificationCounter = notifications.length;
  updateNotificationZIndices();
}

export function processPositionUpdateQueue() {
  if (positionUpdateQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }

  isProcessingQueue = true;

  const { removedNumber } = positionUpdateQueue.shift()!;
  const container = document.getElementById("notificationContainer");
  if (!container) return;

  const gap = 10;
  const allNotifications = Array.from(container.querySelectorAll(".notification"));

  allNotifications.forEach((notification: any, index: number) => {
    const currentNumber = parseInt(notification.dataset.number);
    const newNumber = index;

    if (currentNumber !== newNumber) {
      notification.dataset.number = newNumber.toString();
      const newBottom = newNumber * (notificationHeight + gap);
      notification.style.transition = "bottom 0.6s ease";
      notification.style.bottom = `${newBottom}px`;
    }
  });

  notificationCounter = allNotifications.length;

  setTimeout(() => processPositionUpdateQueue(), POSITION_UPDATE_DELAY);
}

export function processNotificationQueue() {
  if (isProcessing || notificationQueue.length === 0) return;

  isProcessing = true;
  const [message, type] = notificationQueue.shift()!;

  _createNotification(message, type);

  setTimeout(() => {
    isProcessing = false;
    processNotificationQueue();
  }, NOTIFICATION_DELAY);
}

// === ADDITIONAL NOTIFICATION FUNCTIONS ===
export function closeNotificationByDataNumber(targetNumber: number) {
  const container = document.getElementById("notificationContainer");
  if (!container) return;
  
  const allNotifications = container.querySelectorAll(".notification");
  const foundDiv = Array.from(allNotifications).find(div =>
    parseInt((div as any).dataset.number) === targetNumber
  );

  if (!foundDiv) {
    console.warn(`Элемент с data-number="${targetNumber}" не найден`);
    return;
  }

  animateAndRemoveNotification(foundDiv as HTMLElement);
}

// === UI HELPER FUNCTIONS ===
export function updateBorderRightValue() {
  document.documentElement.style.setProperty('--border-right', `${Elements.dividerThicknessInput?.value || '2'}px`);
}

export function updateStatusIndicator(dotElement: HTMLElement | null, status: 'online' | 'offline' | 'checking') {
  if (!dotElement) return;
  
  dotElement.classList.remove('online', 'offline', 'checking');
  dotElement.classList.add(status);
  
  if (status === 'online') {
    dotElement.style.backgroundColor = 'rgb(34, 197, 94)';
  } else if (status === 'offline') {
    dotElement.style.backgroundColor = 'rgb(239, 68, 68)';
  } else {
    dotElement.style.backgroundColor = 'rgb(251, 191, 36)';
  }
}

export function getCameraTableData(camArr: any[] = []) {
  return camArr.map((c: any, index: number) => ({
    ip: c.ip || '',
    stream: c.stream || '',
    name: c.name || '',
    mac: normalizeMac(c.mac || ''),
    lastSeenIp: c.lastSeenIp || '',
    lastMacCheckAt: c.lastMacCheckAt || '',
    order: index
  }));
}

function normalizeMac(value: any): string {
  const raw = String(value || '').trim();
  const separated = raw.match(/([0-9a-f]{2}[:-]){5}[0-9a-f]{2}/i);
  if (!separated) return '';
  return separated[0].replace(/-/g, ':').toUpperCase();
}

// === ANTS INITIALIZATION ===
export function initAnts() {
  const ANT_COUNT = 20;
  const MIN_SPEED = 0.04;
  const MAX_SPEED = 0.25;
  const FRICTION = 0.995;
  const SCARE_BOOST = 0.6;
  const NEIGHBOR_DIST = 120;
  const CLOSE_DIST = 40;
  const ALIGN_FACTOR = 0.05;
  const COHESION_FACTOR = 0.0009;
  const SEPARATION_FACTOR = 0.03;
  const BORDER_MARGIN = 20;

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
        const dist2 = dx * dx + dy * dy;

        if (dist2 < NEIGHBOR_DIST * NEIGHBOR_DIST) {
          avgVX += b.vx;
          avgVY += b.vy;
          avgX += b.x;
          avgY += b.y;
          count++;

          if (dist2 < CLOSE_DIST * CLOSE_DIST) {
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
  
  if (typeof (window as any).lucide !== 'undefined') {
    (window as any).lucide.createIcons();
  }
}
