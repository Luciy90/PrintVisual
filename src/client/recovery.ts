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
import { Camera } from './cameras.js';

export function normalizeMac(value: any) {
  const raw = String(value || '').trim();
  const separated = raw.match(/([0-9a-f]{2}[:-]){5}[0-9a-f]{2}/i);
  if (!separated) return '';
  return separated[0].replace(/-/g, ':').toUpperCase();
}

export function findMacInValue(value: any): string {
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

export function normalizePrinterAddress(value: any) {
  return String(value || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
}

export function extractIPv4(value: any) {
  const match = String(value || '').match(/\\b(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)){3}\\b/);
  return match ? match[0] : '';
}

export function getSubnetPrefix(ip: string) {
  const ipv4 = extractIPv4(ip);
  if (!ipv4) return '';
  return ipv4.split('.').slice(0, 3).join('.');
}

export function getScanSubnets(camArr: any[]) {
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

export async function fetchWithTimeout(url: string, options = {}, timeout = 1200) {
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

export async function fetchJsonIfReadable(url: string, timeout = 1200) {
  const response = await fetchWithTimeout(url, { cache: 'no-store' }, timeout);
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function hasMeaningfulSettings(settings: any) {
  return settings && typeof settings === 'object' && Object.keys(settings).length > 0;
}

export function readLocalAppSettings() {
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

export function findCameraIndexByIdentity(cam: any, cameras: any[]) {
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

export async function fetchLocalHelperSubnet(subnet: string, timeout = 1800) {
  const urls = [
    `http://127.0.0.1:32117/scan?subnet=${encodeURIComponent(subnet)}`,
    `http://localhost:32117/scan?subnet=${encodeURIComponent(subnet)}`
  ];
  for (const url of urls) {
    try {
      const res = await fetchJsonIfReadable(url, timeout);
      if (res && typeof res === 'object' && Array.isArray(res.devices)) return res.devices;
    } catch {
      // Next
    }
  }
  return [];
}

export async function fetchAppApiNetworkScan(subnets: string[], options: { concurrency?: number, probeTimeout?: number, macTimeout?: number, scanTimeout?: number } = {}) {
  try {
    const devices = await scanNetworkWithAppApi(subnets, options) || [];
    return devices.map((device: any) => ({
      ip: device.ip,
      reachable: Boolean(device.reachable),
      mac: normalizeMac(device.mac || ''),
      source: device.source || 'app-api',
      nameHint: device.nameHint || ''
    })).filter((device: any) => device.ip);
  } catch {
    return null;
  }
}

export async function scanDeviceAtIp(ip: string, options: { probeTimeout?: number, macTimeout?: number } = {}) {
  const reachable = await checkPrinterConnection(ip, ':8080/?action=stream', options.probeTimeout || 700);
  if (!reachable) return { ip, reachable: false, mac: '', source: '', nameHint: '' };
  const macResult = await fetchPrinterMac(ip, { timeout: options.macTimeout || 900, silent: true });
  return { ip, reachable: true, mac: macResult?.mac || '', source: macResult?.source || 'http-probe', nameHint: '' };
}

export async function runConcurrent(items: any[], limit: number, worker: Function, onProgress?: Function) {
  const results: any[] = [];
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

export async function scanSubnetsForPrinters(subnets: string[], options: { concurrency?: number, macTimeout?: number, probeTimeout?: number } = {}) {
  const results: any[] = [];
  showIpRecoveryProgress('Запуск серверного сканирования', 8);
  const serverResults = await fetchAppApiNetworkScan(subnets, options);
  if (serverResults) {
    updateIpRecoveryProgress('Серверное сканирование завершено', 80);
    return serverResults.filter((device: any) => device.reachable);
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
    results.push(...subnetResults.filter((device: any) => device.reachable));
  }
  return results;
}

export function buildMacDiscoveryMap(scanResults: any[]) {
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

export function matchSavedPrintersByMac(camArr: any[], discovery: any) {
  const matches: any[] = [];
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

function normalizeCameraData_Internal(cam: any = {}) {
  if (typeof cam === 'string') {
    return { ip: cam, stream: '', name: '', mac: '', lastSeenIp: '', lastMacCheckAt: '' };
  }
  return {
    ip: typeof cam.ip === 'string' ? cam.ip : '',
    stream: typeof cam.stream === 'string' ? cam.stream : '',
    name: typeof cam.name === 'string' ? cam.name : '',
    mac: normalizeMac(cam.mac || ''),
    lastSeenIp: typeof cam.lastSeenIp === 'string' ? cam.lastSeenIp : '',
    lastMacCheckAt: typeof cam.lastMacCheckAt === 'string' ? cam.lastMacCheckAt : ''
  };
}

export function replaceAddressHost(oldValue: string, newIp: string) {
  const normalized = normalizePrinterAddress(oldValue);
  const oldIp = extractIPv4(normalized);
  return oldIp ? normalized.replace(oldIp, newIp) : newIp;
}

export async function confirmIpReplacements(matches: any[]) {
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
    if (typeof (window as any).lucide !== 'undefined') (window as any).lucide.createIcons();

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

export function applyIpReplacements(matches: any[], cameras: Camera[]) {
  const now = new Date().toISOString();
  let previousSettings: any = {};
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
}

export async function recoverPrinterIpsByMac(cameras: Camera[], enqueueNotification: Function) {
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

function getCameraTableData_Internal(cameras: any[]) {
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
