import {
  addCamera,
  addDammy,
  cameras,
  deleteRow,
  renderCameras
} from './cameras.js';
import { Elements } from './elements.js';
import { enqueueNotification, schedulePositionUpdate } from './notifications.js';
import { recoverPrinterIpsByMac } from './recovery.js';
import { saveSettingsFromInputs } from './settingsForm.js';
import type { StorageAdapter } from './storage.js';

export type Cleanup = () => void;

export function initializeCameraActions(storage: StorageAdapter = localStorage): Cleanup {
  const cleanups: Cleanup[] = [];
  const listen = (target: HTMLElement | null, listener: () => void): void => {
    if (!target) return;
    target.addEventListener('click', listener);
    cleanups.push(() => target.removeEventListener('click', listener));
  };

  listen(Elements.addCameraBtn, () => {
    addCamera();
    saveSettingsFromInputs(Elements, storage);
  });
  listen(Elements.addDammyCameraBtn, () => {
    addDammy();
    saveSettingsFromInputs(Elements, storage);
  });
  listen(Elements.savePositionBtn, () => {
    saveSettingsFromInputs(Elements, storage);
    enqueueNotification('Положение камер сохранено', 'system');
  });
  listen(Elements.refreshCamerasBtn, () => {
    document.querySelectorAll<HTMLElement>('.notification.collapsed').forEach(notification => {
      notification.classList.remove('collapsed');
      delete notification.dataset.collapsed;
    });
    document.getElementById('notificationActions')?.classList.add('hidden');
    schedulePositionUpdate();
    renderCameras();
  });
  listen(Elements.recoverPrinterIpsBtn, () => {
    void recoverPrinterIpsByMac(cameras, enqueueNotification).then(() => {
      renderCameras();
      saveSettingsFromInputs(Elements, storage);
    });
  });

  const cameraTableClickHandler = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const removeButton = target.closest<HTMLButtonElement>('.remove-camera-btn');
    if (!removeButton) return;

    const row = removeButton.closest<HTMLTableRowElement>('tr');
    if (!row || !Elements.tbody) return;

    const rowIndex = Array.from(Elements.tbody.children).indexOf(row);
    if (rowIndex < 0) return;

    deleteRow(rowIndex);
  };
  Elements.tbody?.addEventListener('click', cameraTableClickHandler);
  cleanups.push(() => Elements.tbody?.removeEventListener('click', cameraTableClickHandler));

  return () => cleanups.forEach(cleanup => cleanup());
}
