import { cameras, reorderRows } from './cameras.js';
import type { Camera } from './cameras.js';
import { fetchPrinterStatusFromAppApi } from './api.js';
import { initializeCameraFullscreen } from './cameraFullscreen.js';
import { initializeCameraDragAndDrop } from './cameraOrdering.js';
import { getCameraStreamUrl, getStreamToggleState, setImageStreamEnabled, setStreamToggleState } from './cameraStreams.js';
import { Elements } from './elements.js';
import { enqueueNotification } from './notifications.js';
import { updatePrinterCard } from './printerCard.js';
import { saveSettingsFromInputs } from './settingsForm.js';
import type { StorageAdapter } from './storage.js';
import { updateGrid, updateInterfaceHeight } from './ui.js';

export type Cleanup = () => void;

export interface CameraGridController {
  render(): void;
  cleanup: Cleanup;
}

const PRINTER_STATUS_POLL_INTERVAL_MS = 5000;

function startPrinterStatusPolling(card: HTMLElement, address: string): Cleanup {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const poll = async (): Promise<void> => {
    try {
      const data = await fetchPrinterStatusFromAppApi(address);
      if (!stopped && data) updatePrinterCard(card.id, data);
    } catch {
      // Preserve the last known state during transient network failures.
    } finally {
      if (!stopped) timer = setTimeout(() => void poll(), PRINTER_STATUS_POLL_INTERVAL_MS);
    }
  };

  void poll();
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}

function createIconButton(label: string, iconClass: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `action-icon ${iconClass}`;
  button.setAttribute('aria-label', label);
  button.title = label;
  return button;
}

function getManagementUrl(address: string): string | null {
  const trimmed = address.trim();
  if (!trimmed || trimmed === 'dammy') return null;
  try {
    const url = new URL(`http://${trimmed}`);
    if (url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

function createStatusDot(address: string): HTMLElement {
  const dot = document.createElement('div');
  dot.className = 'status-dot initial';
  dot.dataset.ip = address;
  dot.title = 'Ожидание подключения';
  return dot;
}

function createTemperatureIcon(kind: 'bed' | 'extruder'): SVGSVGElement {
  const namespace = 'http://www.w3.org/2000/svg';
  const icon = document.createElementNS(namespace, 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('focusable', 'false');
  icon.classList.add('printer-temperature-icon');
  const path = document.createElementNS(namespace, 'path');
  path.setAttribute(
    'd',
    kind === 'bed'
      ? 'M4 16h16v3H4v-3Zm2-3h12l-1.5-7h-9L6 13Zm3-5h6l.65 3h-7.3L9 8Z'
      : 'M9 3h6v7.2a5 5 0 1 1-6 0V3Zm2 2v6.35l-.65.48a3 3 0 1 0 3.3 0L13 11.35V5h-2Z'
  );
  icon.append(path);
  return icon;
}

function createPrinterTelemetry(): HTMLElement[] {
  const temperatures = document.createElement('div');
  temperatures.className = 'printer-temperatures';
  temperatures.setAttribute('aria-label', 'Температуры принтера');

  const createTemperatureRow = (kind: 'bed' | 'extruder', dataAttribute: string): HTMLElement => {
    const row = document.createElement('div');
    row.className = 'printer-temperature';
    const value = document.createElement('span');
    value.setAttribute(dataAttribute, '');
    value.textContent = '—';
    row.append(createTemperatureIcon(kind), value);
    return row;
  };
  temperatures.append(
    createTemperatureRow('bed', 'data-printer-bed-temperature'),
    createTemperatureRow('extruder', 'data-printer-extruder-temperatures')
  );

  const filename = document.createElement('div');
  filename.className = 'printer-filename';
  filename.setAttribute('data-printer-filename', '');
  filename.setAttribute('aria-hidden', 'true');

  const progress = document.createElement('div');
  progress.className = 'printer-progress';
  progress.hidden = true;
  progress.setAttribute('data-printer-progress-bar', '');
  progress.setAttribute('role', 'progressbar');
  progress.setAttribute('aria-label', 'Прогресс печати');
  progress.setAttribute('aria-valuemin', '0');
  progress.setAttribute('aria-valuemax', '100');
  progress.setAttribute('aria-valuenow', '0');
  const progressFill = document.createElement('span');
  progressFill.className = 'printer-progress-fill';
  progressFill.setAttribute('data-printer-progress-fill', '');
  progress.append(progressFill);
  return [temperatures, filename, progress];
}

function createCameraCard(
  camera: Camera,
  cardIndex: number,
  storage: StorageAdapter,
  fullscreen: ReturnType<typeof initializeCameraFullscreen>
): HTMLElement {
  const card = document.createElement('article');
  card.className = 'camera-box group relative bg-cams rounded-xl shadow-lg flex items-stretch overflow-hidden transition hover:scale-105 cursor-grab camera-disconnected';
  card.draggable = true;
  card.id = `printer-card-${encodeURIComponent(camera.ip || `camera-${cardIndex}`)}`;
  card.dataset.ip = camera.ip;
  card.dataset.name = camera.name;
  card.dataset.stream = camera.stream;
  card.dataset.mac = camera.mac;

  const imageArea = document.createElement('div');
  imageArea.className = 'camera-img relative w-full h-full flex items-center justify-center min-h-[180px]';
  card.append(imageArea);

  if (camera.ip === 'dammy') {
    card.classList.add('dammy');
    card.style.opacity = '0';
    card.style.transition = 'opacity .2s ease, transform .2s ease';
    const glass = document.createElement('div');
    glass.className = 'bottom-glass';
    imageArea.append(glass);
    return card;
  }

  const image = document.createElement('img');
  image.src = getCameraStreamUrl(camera.ip, camera.stream);
  image.alt = camera.name || 'Поток камеры принтера';
  image.className = 'w-full h-full object-cover transition group-hover:brightness-95 duration-300 absolute top-0 left-0 hidden';
  image.style.minHeight = '180px';
  image.style.maxHeight = '100%';
  image.style.display = 'none';
  imageArea.append(image);

  const controls = document.createElement('div');
  controls.className = 'zone-right';
  const expand = createIconButton('Развернуть', 'expand-icon');
  const manage = createIconButton('Открыть интерфейс принтера', 'manage-icon');
  const toggleLabel = document.createElement('label');
  toggleLabel.className = 'switch';
  const toggle = document.createElement('input');
  toggle.type = 'checkbox';
  toggle.className = 'stream-toggle-input';
  toggle.checked = getStreamToggleState(storage, camera.ip);
  toggle.setAttribute('aria-label', 'Включить или выключить видеопоток');
  const slider = document.createElement('span');
  slider.className = 'slider';
  toggleLabel.append(toggle, slider);
  const toggleContainer = document.createElement('div');
  toggleContainer.className = 'stream-toggle-container';
  toggleContainer.title = 'Включить/выключить видеопоток';
  toggleContainer.append(toggleLabel);
  controls.append(expand, manage, toggleContainer);
  imageArea.append(controls);

  const glass = document.createElement('div');
  glass.className = 'bottom-glass';
  const title = document.createElement('div');
  title.className = 'camera-title';
  const titleText = document.createElement('span');
  titleText.className = 'camera-title-text';
  titleText.textContent = camera.name || 'Без имени';
  const progressLabel = document.createElement('span');
  progressLabel.className = 'printer-progress-label';
  progressLabel.setAttribute('data-printer-progress-label', '');
  progressLabel.textContent = '0%';
  title.append(titleText, progressLabel);
  const status = createStatusDot(camera.ip);
  imageArea.append(glass, status, ...createPrinterTelemetry(), title);

  image.addEventListener('load', () => {
    card.classList.remove('camera-disconnected');
    image.classList.remove('hidden');
    image.style.display = 'block';
    if (!card.dataset.printerState) {
      status.className = 'status-dot connect';
      status.title = 'Подключено';
    }
  });
  image.addEventListener('error', () => {
    if (!card.dataset.printerState) {
      status.className = 'status-dot disconnected';
      status.title = 'Видеосигнал недоступен';
    }
  });
  expand.addEventListener('click', () => void fullscreen.enter(card));
  manage.addEventListener('click', () => {
    const url = getManagementUrl(camera.ip);
    if (!url) {
      enqueueNotification('Неверный или отсутствующий адрес принтера.', 'error');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  });
  toggle.addEventListener('change', () => {
    setStreamToggleState(storage, camera.ip, toggle.checked);
    setImageStreamEnabled(image, toggle.checked);
    saveSettingsFromInputs(Elements, storage);
  });

  if (!toggle.checked) setImageStreamEnabled(image, false);
  return card;
}

export function initializeCameraGrid(storage: StorageAdapter = localStorage): CameraGridController | null {
  const container = Elements.cameraContainer;
  if (!container) return null;

  const fullscreen = initializeCameraFullscreen({
    document: container.ownerDocument,
    onExited: updateInterfaceHeight,
    onError: message => enqueueNotification(message, 'error')
  });
  const dragCleanup = initializeCameraDragAndDrop({
    container,
    getCameras: () => cameras,
    setCameras: reordered => reorderRows(reordered),
    onReordered: () => saveSettingsFromInputs(Elements, storage)
  });
  let statusPollCleanups: Cleanup[] = [];

  const stopStatusPolling = (): void => {
    statusPollCleanups.forEach(cleanup => cleanup());
    statusPollCleanups = [];
  };

  const render = (): void => {
    stopStatusPolling();
    container.replaceChildren();
    const cards = cameras.map((camera, index) => createCameraCard(camera, index, storage, fullscreen));
    container.append(...cards);
    statusPollCleanups = cards.flatMap((card, index) => {
      const camera = cameras[index];
      return camera && camera.ip !== 'dammy' ? [startPrinterStatusPolling(card, camera.ip)] : [];
    });
    updateGrid();
    updateInterfaceHeight();
  };

  return {
    render,
    cleanup: () => {
      stopStatusPolling();
      dragCleanup();
      fullscreen.cleanup();
      container.replaceChildren();
    }
  };
}
