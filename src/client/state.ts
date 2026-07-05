import { normalizeMac } from './recovery.js';

export interface Camera {
  ip: string;
  stream: string;
  name: string;
  mac: string;
  lastSeenIp: string;
  lastMacCheckAt: string;
}

export interface AppState {
  floatingToolbar: HTMLElement | null;
  allowLocalStorage: boolean;
  ipRecoveryBusy: boolean;
  disableAllStreamsBusy: boolean;
}

export const State: AppState = {
  floatingToolbar: null,
  allowLocalStorage: false,
  ipRecoveryBusy: false,
  disableAllStreamsBusy: false,
};

export let cameras: Camera[] = [];

export let suppressNotifications = false;
export let pendingRestores = 0;

// Sequence/Task state
export const TaskState = {
  positionUpdateQueue: [] as any[],
  isProcessingQueue: false,
  notificationHeight: 48,
  POSITION_UPDATE_DELAY: 100 // мс
};

export function normalizeCameraData(cam: any = {}): Camera {
  if (typeof cam === 'string') {
    return { ip: cam, stream: '', name: '', mac: '', lastSeenIp: '', lastMacCheckAt: '' };
  }
  return {
    ip: typeof (cam as any).ip === 'string' ? (cam as any).ip : '',
    stream: typeof (cam as any).stream === 'string' ? (cam as any).stream : '',
    name: typeof (cam as any).name === 'string' ? (cam as any).name : '',
    mac: normalizeMac((cam as any).mac || ''),
    lastSeenIp: typeof (cam as any).lastSeenIp === 'string' ? (cam as any).lastSeenIp : '',
    lastMacCheckAt: typeof (cam as any).lastMacCheckAt === 'string' ? (cam as any).lastMacCheckAt : ''
  };
}

export function loadCameras(initialCameras: any[]) {
  cameras.length = 0;
  cameras.push(...initialCameras.map(normalizeCameraData));
}

export function addCamera() {
  cameras.push(normalizeCameraData({ip: '', name: ''}));
}

export function addDammy() {
  cameras.push(normalizeCameraData({ip: 'dammy', name: ''}));
}

export function onInputChange(rowIdx: number, field: keyof Camera, value: any) {
  if (cameras[rowIdx]) {
    (cameras[rowIdx] as any)[field] = value;
  }
}

export function deleteRow(idx: number) {
  cameras.splice(idx, 1);
}

export function reorderRows(newOrderArray: Camera[]) {
  cameras.length = 0;
  cameras.push(...newOrderArray);
}

export function findCameraIndexByIdentity(cam: any, camerasList: Camera[]) {
  const ip = (cam as any).ip || '';
  const name = (cam as any).name || '';
  let idx = camerasList.findIndex(item => item.ip === ip && item.name === name);
  if (idx !== -1) return idx;
  idx = camerasList.findIndex(item => item.ip === ip);
  if (idx !== -1) return idx;
  return camerasList.findIndex(item => item.name === name);
}
