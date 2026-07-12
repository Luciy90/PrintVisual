import { cameras, reorderRows } from './cameras.js';
import type { Camera } from './cameras.js';
import { initializeCameraFullscreen } from './cameraFullscreen.js';
import { initializeCameraDragAndDrop } from './cameraOrdering.js';
import { getCameraStreamUrl, getStreamToggleState, setImageStreamEnabled, setStreamToggleState } from './cameraStreams.js';
import { Elements } from './elements.js';
import { enqueueNotification } from './notifications.js';
import { saveSettingsFromInputs } from './settingsForm.js';
import type { StorageAdapter } from './storage.js';
import { updateGrid, updateInterfaceHeight } from './ui.js';

export type Cleanup = () => void;

export interface CameraGridController {
  render(): void;
  cleanup: Cleanup;
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

function createCameraCard(
  camera: Camera,
  storage: StorageAdapter,
  fullscreen: ReturnType<typeof initializeCameraFullscreen>
): HTMLElement {
  const card = document.createElement('article');
  card.className = 'camera-box group relative bg-cams rounded-xl shadow-lg flex items-stretch overflow-hidden transition hover:scale-105 cursor-grab camera-disconnected';
  card.draggable = true;
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
  title.textContent = camera.name || 'Без имени';
  const status = createStatusDot(camera.ip);
  imageArea.append(glass, status, title);

  image.addEventListener('load', () => {
    card.classList.remove('camera-disconnected');
    image.classList.remove('hidden');
    image.style.display = 'block';
    status.className = 'status-dot connect';
    status.title = 'Подключено';
  });
  image.addEventListener('error', () => {
    status.className = 'status-dot disconnected';
    status.title = 'Видеосигнал недоступен';
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

  const render = (): void => {
    container.replaceChildren();
    cameras.forEach(camera => container.append(createCameraCard(camera, storage, fullscreen)));
    updateGrid();
    updateInterfaceHeight();
  };

  return {
    render,
    cleanup: () => {
      dragCleanup();
      fullscreen.cleanup();
      container.replaceChildren();
    }
  };
}
