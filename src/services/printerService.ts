import { findMacInValue, normalizePrinterAddress } from "./address.js";

export interface PrinterMacResult {
  address: string;
  host: string;
  mac: string;
  source: string;
}

const jsonEndpoints = [
  "/machine/system_info",
  "/server/info",
  "/printer/info",
  "/api/system/info",
  "/api/printer"
];

export async function fetchPrinterMac(address: string, timeoutMs = 1500): Promise<PrinterMacResult | null> {
  const host = normalizePrinterAddress(address).split("/")[0];
  if (!host || host.toLowerCase() === "dammy") return null;

  for (const endpoint of jsonEndpoints) {
    const url = `http://${host}${endpoint}`;
    try {
      const data = await fetchJsonWithTimeout(url, timeoutMs);
      const mac = findMacInValue(data);
      if (mac) return { address, host, mac, source: url };
    } catch {
      // Try the next known endpoint.
    }
  }

  return null;
}

export async function checkPrinterConnection(address: string, timeoutMs = 900): Promise<boolean> {
  const host = normalizePrinterAddress(address).split("/")[0];
  if (!host || host.toLowerCase() === "dammy") return false;

  const urls = [
    `http://${host}/machine/system_info`,
    `http://${host}/server/info`,
    `http://${host}/`,
    `http://${host}:8080/?action=stream`
  ];

  for (const url of urls) {
    try {
      await fetchWithTimeout(url, timeoutMs);
      return true;
    } catch {
      // Try the next probe.
    }
  }

  return false;
}

async function fetchJsonWithTimeout(url: string, timeoutMs: number): Promise<unknown> {
  const response = await fetchWithTimeout(url, timeoutMs);
  const text = await response.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store"
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response;
  } finally {
    clearTimeout(timer);
  }
}

export const printerServiceInternals = {
  jsonEndpoints,
  fetchJsonWithTimeout,
  fetchWithTimeout
};
