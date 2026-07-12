import { Elements } from './elements.js';
import { State } from './state.js';
import { 
  getAppApiUrl, 
  requestAppApiJson, 
  syncSettingsToAppApi, 
  getSettingsFromAppApi, 
  saveSettingsToAppApi, 
  fetchPrinterMacFromAppApi,
  scanNetworkWithAppApi
} from './api.js';
import type { AppApiDiscoveredDevice } from './api.js';
import type { Camera } from './cameras.js';

interface DiscoveredDevice {
  ip: string;
  reachable: boolean;
  mac: string;
  source: string;
  nameHint: string;
  conflict?: boolean;
  devices?: DiscoveredDevice[];
}

interface MacDiscovery {
  macMap: Map<string, DiscoveredDevice>;
  conflicts: Map<string, DiscoveredDevice[]>;
}

interface IpReplacement {
  index: number;
  name: string;
  oldIp: string;
  newIp: string;
  mac: string;
}

type NotificationSink = (message: string, type?: string) => void;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === 'string' ? value : '';
}

function normalizeDiscoveredDevice(value: unknown, fallbackSource = ''): DiscoveredDevice | null {
  if (!isRecord(value)) return null;
  const ip = readString(value, 'ip').trim();
  if (!ip) return null;
  return {
    ip,
    reachable: value.reachable === true,
    mac: normalizeMac(value.mac),
    source: readString(value, 'source') || fallbackSource,
    nameHint: readString(value, 'nameHint')
  };
}

export function normalizeMac(value: unknown): string {
  const raw = String(value ?? '').trim();
  const separated = raw.match(/([0-9a-f]{2}[:-]){5}[0-9a-f]{2}/i);
  if (!separated) return '';
  return separated[0].replace(/-/g, ':').toUpperCase();
}

export function findMacInValue(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return normalizeMac(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const mac = findMacInValue(item);
      if (mac) return mac;
    }
    return '';
  }
  if (isRecord(value)) {
    for (const item of Object.values(value)) {
      const mac = findMacInValue(item);
      if (mac) return mac;
    }
  }
  return '';
}

export function normalizePrinterAddress(value: unknown): string {
  return String(value ?? '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
}

export function extractIPv4(value: unknown): string {
  const match = String(value ?? '').match(/\\b(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)){3}\\b/);
  return match ? match[0] : '';
}

export function getSubnetPrefix(ip: string) {
  const ipv4 = extractIPv4(ip);
  if (!ipv4) return '';
  return ipv4.split('.').slice(0, 3).join('.');
}

export function getScanSubnets(camArr: readonly (string | Pick<Camera, 'ip'>)[]): string[] {
  const subnets = new Set<string>();
  camArr.forEach(cam => {
    const ip = typeof cam === 'string' ? cam : cam.ip;
    if (!ip || ip === 'dammy') return;
    const subnet = getSubnetPrefix(ip);
    if (subnet) subnets.add(subnet);
  });
  return [...subnets];
}

export function getStreamUrlForProbe(ip: string, stream = '') {
  const host = normalizePrinterAddress(ip).split('/')[0];
  const streamPart = stream && stream.startsWith(':') ? stream : (stream || ':8080/?action=stream');
  const baseHost = streamPart.startsWith(':') ? host.split(':')[0] : host;
  return `http://${baseHost}${streamPart}`;
}

export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 1200): Promise<Response> {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = setTimeout(() => controller?.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller?.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function probeImageUrl(url: string, timeout = 1200): Promise<boolean> {
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

export async function checkPrinterConnection(ip: string, stream = '', timeout = 1500): Promise<boolean> {
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

export async function fetchJsonIfReadable(url: string, timeout = 1200): Promise<unknown> {
  const response = await fetchWithTimeout(url, { cache: 'no-store' }, timeout);
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function hasMeaningfulSettings(settings: unknown): boolean {
  return isRecord(settings) && Object.keys(settings).length > 0;
}

export function readLocalAppSettings(): unknown | null {
  const raw = localStorage.getItem('printerCamsV2');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function hydrateSettingsFromAppApi() {
  try {
    const serverSettings = await getSettingsFromAppApi(2500);
    if (hasMeaningfulSettings(serverSettings)) {
      localStorage.setItem('printerCamsV2', JSON.stringify(serverSettings));
      return 'server';
    }

    const localSettings = readLocalAppSettings();
    if (hasMeaningfulSettings(localSettings)) {
      await saveSettingsToAppApi(localSettings, 2500);
      return 'imported-local';
    }

    return 'empty';
  } catch {
    return 'fallback-local';
  }
}

export async function fetchPrinterMac(ip: string, options: { timeout?: number, silent?: boolean } = {}) {
  const host = normalizePrinterAddress(ip).split('/')[0];
  if (!host || host.toLowerCase() === 'dammy') return null;

  const timeout = options.timeout || 1200;
  try {
    const apiResult = await fetchPrinterMacFromAppApi(host, timeout);
    if (apiResult?.mac) return { mac: normalizeMac(apiResult.mac), source: apiResult.source || 'app-api' };
  } catch {
    // Fallback to browser-side
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
      // Next strategy
    }
  }
  return null;
}

export function findCameraIndexByIdentity(
  cam: Pick<Camera, 'ip' | 'name'>,
  cameras: readonly Pick<Camera, 'ip' | 'name'>[]
): number {
  const ip = normalizePrinterAddress(cam.ip);
  const name = cam.name || '';
  let idx = cameras.findIndex(item => normalizePrinterAddress(item.ip) === ip && (item.name || '') === name);
  if (idx !== -1) return idx;
  idx = cameras.findIndex(item => normalizePrinterAddress(item.ip) === ip);
  if (idx !== -1) return idx;
  return cameras.findIndex(item => (item.name || '') === name);
}

export function savePrinterMac(rowIdx: number, mac: string, cameras: Camera[], ip = '') {
  const normalizedMac = normalizeMac(mac);
  if (!normalizedMac || !cameras[rowIdx]) return false;
  cameras[rowIdx].mac = normalizedMac;
  cameras[rowIdx].lastSeenIp = extractIPv4(ip || cameras[rowIdx].ip) || normalizePrinterAddress(ip || cameras[rowIdx].ip);
  cameras[rowIdx].lastMacCheckAt = new Date().toISOString();
  return true;
}

export async function capturePrinterMacForCamera(cam: Camera, cameras: Camera[], options: { skipConnectionCheck?: boolean, timeout?: number, silent?: boolean } = {}) {
  const idx = findCameraIndexByIdentity(cam, cameras);
  if (idx === -1) return null;
  const current = cameras[idx];
  if (!current.ip || current.ip.toLowerCase() === 'dammy') return null;
  const connected = options.skipConnectionCheck || await checkPrinterConnection(current.ip, current.stream, options.timeout || 1500);
  if (!connected) return null;
  current.lastSeenIp = extractIPv4(current.ip) || normalizePrinterAddress(current.ip);
  current.lastMacCheckAt = new Date().toISOString();
  const result = await fetchPrinterMac(current.ip, { timeout: options.timeout || 1500, silent: options.silent });
  if (result?.mac) {
    savePrinterMac(idx, result.mac, cameras, current.ip);
    return result.mac;
  }
  return null;
}

export async function capturePrinterMacForInput(input: HTMLInputElement, cameras: Camera[]) {
  const row = input.closest('tr');
  const idx = row ? Array.from(row.parentElement?.children || []).indexOf(row) : -1;
  if (!row || idx === -1 || !cameras[idx]) return;
  await capturePrinterMacForCamera(cameras[idx], cameras, { timeout: 1800 });
}

export function showIpRecoveryProgress(label: string, percent = 0) {
  if (!Elements.ipRecoveryStatus) return;
  Elements.ipRecoveryStatus.classList.remove('hidden');
  updateIpRecoveryProgress(label, percent);
}

export function updateIpRecoveryProgress(label: string, percent = 0) {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
  if (Elements.ipRecoveryStatusText) Elements.ipRecoveryStatusText.textContent = label;
  if (Elements.ipRecoveryPercent) Elements.ipRecoveryPercent.textContent = `${safePercent}%`;
  if (Elements.ipRecoveryProgressBar) Elements.ipRecoveryProgressBar.style.width = `${safePercent}%`;
}

export function hideIpRecoveryProgress() {
  if (!Elements.ipRecoveryStatus) return;
  Elements.ipRecoveryStatus.classList.add('hidden');
  updateIpRecoveryProgress('Подготовка...', 0);
}

export function setIpRecoveryBusy(isBusy: boolean) {
  State.ipRecoveryBusy = isBusy;
  if (!Elements.recoverPrinterIpsBtn) return;
  (Elements.recoverPrinterIpsBtn as HTMLButtonElement).disabled = isBusy;
  Elements.recoverPrinterIpsBtn.style.opacity = isBusy ? '0.6' : '';
  Elements.recoverPrinterIpsBtn.style.pointerEvents = isBusy ? 'none' : '';
}

export async function fetchLocalHelperSubnet(subnet: string, timeout = 1800): Promise<DiscoveredDevice[]> {
  const urls = [
    `http://127.0.0.1:32117/scan?subnet=${encodeURIComponent(subnet)}`,
    `http://localhost:32117/scan?subnet=${encodeURIComponent(subnet)}`
  ];
  for (const url of urls) {
    try {
      const res = await fetchJsonIfReadable(url, timeout);
      if (isRecord(res) && Array.isArray(res.devices)) {
        return res.devices
          .map(device => normalizeDiscoveredDevice(device, 'local-helper'))
          .filter((device): device is DiscoveredDevice => device !== null);
      }
    } catch {
      // Next
    }
  }
  return [];
}

export async function fetchAppApiNetworkScan(
  subnets: string[],
  options: { concurrency?: number; probeTimeout?: number; macTimeout?: number; scanTimeout?: number } = {}
): Promise<DiscoveredDevice[] | null> {
  try {
    const devices = await scanNetworkWithAppApi(subnets, options) || [];
    return devices
      .map((device: AppApiDiscoveredDevice) => normalizeDiscoveredDevice(device, 'app-api'))
      .filter((device): device is DiscoveredDevice => device !== null);
  } catch {
    return null;
  }
}

export async function scanDeviceAtIp(
  ip: string,
  options: { probeTimeout?: number; macTimeout?: number } = {}
): Promise<DiscoveredDevice> {
  const reachable = await checkPrinterConnection(ip, ':8080/?action=stream', options.probeTimeout || 700);
  if (!reachable) return { ip, reachable: false, mac: '', source: '', nameHint: '' };
  const macResult = await fetchPrinterMac(ip, { timeout: options.macTimeout || 900, silent: true });
  return { ip, reachable: true, mac: macResult?.mac || '', source: macResult?.source || 'http-probe', nameHint: '' };
}

export async function runConcurrent<TItem, TResult>(
  items: readonly TItem[],
  limit: number,
  worker: (item: TItem, index: number) => TResult | null | undefined | Promise<TResult | null | undefined>,
  onProgress?: (completed: number, total: number) => void
): Promise<TResult[]> {
  const results: TResult[] = [];
  let cursor = 0;
  let completed = 0;
  async function next(): Promise<void> {
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

export async function scanSubnetsForPrinters(
  subnets: string[],
  options: { concurrency?: number; macTimeout?: number; probeTimeout?: number } = {}
): Promise<DiscoveredDevice[]> {
  const results: DiscoveredDevice[] = [];
  showIpRecoveryProgress('Запуск серверного сканирования', 8);
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
      (ip: string) => scanDeviceAtIp(ip, options),
      (done: number, total: number) => {
        const subnetProgress = done / total;
        const totalProgress = ((s + subnetProgress) / subnets.length) * 80;
        updateIpRecoveryProgress(`Сканирование ${subnet}.0/24: ${done}/${total}`, totalProgress);
      }
    );
    results.push(...subnetResults.filter(device => device.reachable));
  }
  return results;
}

export function buildMacDiscoveryMap(scanResults: readonly DiscoveredDevice[]): MacDiscovery {
  const macMap = new Map<string, DiscoveredDevice>();
  const conflicts = new Map<string, DiscoveredDevice[]>();
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

export function matchSavedPrintersByMac(camArr: readonly unknown[], discovery: MacDiscovery): IpReplacement[] {
  const matches: IpReplacement[] = [];
  camArr.forEach((cam, index) => {
    const normalized = normalizeCameraData_Internal(cam);
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

function normalizeCameraData_Internal(cam: unknown = {}): Camera {
  if (typeof cam === 'string') {
    return { ip: cam, stream: '', name: '', mac: '', lastSeenIp: '', lastMacCheckAt: '' };
  }
  const record = isRecord(cam) ? cam : {};
  return {
    ip: readString(record, 'ip'),
    stream: readString(record, 'stream'),
    name: readString(record, 'name'),
    mac: normalizeMac(record.mac),
    lastSeenIp: readString(record, 'lastSeenIp'),
    lastMacCheckAt: readString(record, 'lastMacCheckAt')
  };
}

export function replaceAddressHost(oldValue: string, newIp: string) {
  const normalized = normalizePrinterAddress(oldValue);
  const oldIp = extractIPv4(normalized);
  return oldIp ? normalized.replace(oldIp, newIp) : newIp;
}

export async function confirmIpReplacements(matches: readonly IpReplacement[]): Promise<boolean> {
  return new Promise<boolean>(resolve => {
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
    window.lucide?.createIcons();

    function close(value: boolean) {
      overlay.remove();
      document.removeEventListener('keydown', onKeydown);
      resolve(value);
    }
    function onKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') close(false);
    }
    overlay.addEventListener('click', e => {
      const target = e.target as HTMLElement;
      if (target === overlay || target.closest('[data-action="cancel"]')) close(false);
      if (target.closest('[data-action="confirm"]')) close(true);
    });
    document.addEventListener('keydown', onKeydown);
  });
}

export function applyIpReplacements(matches: readonly IpReplacement[], cameras: Camera[]): void {
  const now = new Date().toISOString();
  let previousSettings: Record<string, unknown> = {};
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem('printerCamsV2') || '{}');
    previousSettings = isRecord(parsed) ? parsed : {};
  } catch {
    previousSettings = {};
  }
  const streamToggles = isRecord(previousSettings.streamToggles)
    ? previousSettings.streamToggles
    : {};
  previousSettings.streamToggles = streamToggles;
  matches.forEach(item => {
    const camera = cameras[item.index];
    if (!camera) return;
    if (Object.prototype.hasOwnProperty.call(streamToggles, item.oldIp)) {
      streamToggles[item.newIp] = streamToggles[item.oldIp];
      delete streamToggles[item.oldIp];
    }
    camera.ip = item.newIp;
    camera.lastSeenIp = extractIPv4(item.newIp) || normalizePrinterAddress(item.newIp);
    camera.lastMacCheckAt = now;
  });
  localStorage.setItem('printerCamsV2', JSON.stringify(previousSettings));
}

export async function recoverPrinterIpsByMac(
  cameras: Camera[],
  enqueueNotification: NotificationSink
): Promise<void> {
  if (State.ipRecoveryBusy) return;
  setIpRecoveryBusy(true);
  try {
    showIpRecoveryProgress('Подготовка списка принтеров', 3);
    const savedPrinters = getCameraTableData_Internal(cameras).filter(cam => cam.ip && cam.ip !== 'dammy' && normalizeMac(cam.mac || ''));
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
    applyIpReplacements(matches, cameras);
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

function getCameraTableData_Internal(cameras: readonly Camera[]) {
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
