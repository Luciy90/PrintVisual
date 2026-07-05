export interface AppApiRequestOptions extends RequestInit {
  timeout?: number;
}

export interface AppApiPrinterMacResult {
  found?: boolean;
  address?: string;
  host?: string;
  mac?: string;
  source?: string;
}

export interface AppApiDiscoveredDevice {
  ip: string;
  reachable?: boolean;
  mac?: string;
  source?: string;
  nameHint?: string;
}

let settingsSyncTimer: ReturnType<typeof setTimeout> | null = null;

export function getAppApiUrl(path: string): string {
  if (!/^https?:$/.test(window.location.protocol)) return "";
  return `${window.location.origin}${path}`;
}

export async function requestAppApiJson<T = unknown>(
  path: string,
  options: AppApiRequestOptions = {}
): Promise<T | null> {
  const url = getAppApiUrl(path);
  if (!url) return null;

  const timeout = options.timeout ?? 1500;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const { timeout: _timeout, headers, ...fetchOptions } = options;

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(headers || {})
      },
      ...fetchOptions,
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    return text ? JSON.parse(text) as T : null;
  } finally {
    clearTimeout(timer);
  }
}

export function syncSettingsToAppApi(settings: unknown): void {
  if (!getAppApiUrl("/api/settings")) return;
  if (settingsSyncTimer) clearTimeout(settingsSyncTimer);

  settingsSyncTimer = setTimeout(() => {
    saveSettingsToAppApi(settings, 2500).catch(() => {
      // localStorage remains the compatibility source if the API is unavailable.
    });
  }, 350);
}

export async function getSettingsFromAppApi(timeout = 2500): Promise<Record<string, unknown> | null> {
  return requestAppApiJson<Record<string, unknown>>("/api/settings", { timeout });
}

export async function saveSettingsToAppApi(settings: unknown, timeout = 2500): Promise<unknown> {
  return requestAppApiJson("/api/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
    timeout
  });
}

export async function fetchPrinterMacFromAppApi(
  host: string,
  timeout: number
): Promise<AppApiPrinterMacResult | null> {
  return requestAppApiJson<AppApiPrinterMacResult>(
    `/api/printers/mac?address=${encodeURIComponent(host)}`,
    { timeout: timeout + 400 }
  );
}

export async function scanNetworkWithAppApi(
  subnets: string[],
  options: {
    concurrency?: number;
    probeTimeout?: number;
    macTimeout?: number;
    scanTimeout?: number;
  } = {}
): Promise<AppApiDiscoveredDevice[] | null> {
  const data = await requestAppApiJson<{ devices?: AppApiDiscoveredDevice[] }>("/api/network/scan", {
    method: "POST",
    body: JSON.stringify({
      subnets,
      concurrency: options.concurrency || 24,
      probeTimeoutMs: options.probeTimeout || 700,
      macTimeoutMs: options.macTimeout || 900
    }),
    timeout: options.scanTimeout || Math.max(12000, subnets.length * 9000)
  });

  return Array.isArray(data?.devices) ? data.devices : [];
}
