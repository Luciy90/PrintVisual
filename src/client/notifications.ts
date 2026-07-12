import { Elements } from './elements.js';
import { State } from './state.js';

let notificationQueue: [string, string][] = [];
let isProcessing = false;
const NOTIFICATION_DELAY = 300;
let notificationCounter = 0;
let activeNotifications = new Set<string>();
const notificationBuffer = new Map<string, string>();
let bufferTimer: ReturnType<typeof setTimeout> | null = null;
let globalCollapseTimeout: ReturnType<typeof setTimeout> | null = null;
let hoveredNotificationsCount = 0;

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
  for (const [message, type] of notificationBuffer) {
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
    .filter((notification): notification is HTMLElement => notification instanceof HTMLElement)
    .filter(notification => !notification.dataset.animating && notification.dataset.collapsed !== 'true')
    .sort((a, b) => parseInt(a.dataset.number ?? '-1', 10) - parseInt(b.dataset.number ?? '-1', 10));

  if (notifications.length === 0) return;

  let cumulativeBottom = 0;
  notifications.forEach((notification, index) => {
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
  notificationBuffer.set(message, type);
  if (bufferTimer) clearTimeout(bufferTimer);
  bufferTimer = setTimeout(flushBuffer, 900);
}

function _createNotification(message: string, type = "info") {
  const container = document.getElementById("notificationContainer");
  if (!container) return;

  const allNotifications = Array.from(container.querySelectorAll<HTMLElement>(".notification"))
    .filter(notification => notification.dataset.animating !== 'true');

  let maxNumber = allNotifications.reduce((max, el) => {
    const num = parseInt(el.dataset.number ?? '-1', 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, -1);

  const hasCollapsed = allNotifications.some(notification => notification.dataset.collapsed === 'true');
  const visibleCount = hasCollapsed 
    ? Math.min(1, allNotifications.length) 
    : allNotifications.filter(notification => notification.dataset.collapsed !== 'true').length;

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
    if (globalCollapseTimeout !== null) clearTimeout(globalCollapseTimeout);
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
  if (globalCollapseTimeout !== null) clearTimeout(globalCollapseTimeout);
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
  return Array.from(container.querySelectorAll<HTMLElement>(".notification"))
    .filter(notification => notification.dataset.collapsed === 'true');
}

function hideNonTopCollapsedNotifications() {
  const collapsed = getCollapsedNotifications();
  if (collapsed.length <= 0) return;
  const maxNumber = Math.max(...collapsed.map(notification => parseInt(notification.dataset.number ?? '-1', 10)));
  collapsed.forEach(notification => {
    const number = parseInt(notification.dataset.number ?? '-1', 10);
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
