import { extractIPv4, findMacInValue, normalizePrinterAddress } from "./address.js";
import { createConnection, isIP } from "node:net";

export interface PrinterMacResult {
  address: string;
  host: string;
  mac: string;
  source: string;
}

export type PrinterCardStatus = "ready" | "printing" | "error";

export interface PrinterStatusData {
  status: PrinterCardStatus;
  bedTemperature: number | null;
  extruderTemperatures: number[];
  progress: number;
  filename: string;
}

export type PrinterStatusResult =
  | { ok: true; data: PrinterStatusData }
  | { ok: false; reason: "invalid_address" | "timeout" | "unavailable" | "invalid_response" };

const MOONRAKER_PORT = 7125;
const MAX_MOONRAKER_RESPONSE_BYTES = 128 * 1024;
const objectCache = new Map<string, { expiresAt: number; objects: string[] }>();

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

export async function probePrinterReachability(address: string, timeoutMs = 450): Promise<boolean> {
  const normalizedHost = normalizePrinterAddress(address).split("/")[0] ?? "";
  const host = extractIPv4(address) || normalizedHost.split(":")[0] || "";
  if (!host || host.toLowerCase() === "dammy" || isIP(host) === 0) return false;

  const results = await Promise.all([
    probeTcpPort(host, 80, timeoutMs),
    probeTcpPort(host, 8080, timeoutMs)
  ]);
  return results.some(Boolean);
}

export async function fetchPrinterStatus(
  address: string,
  timeoutMs = 1500
): Promise<PrinterStatusResult> {
  const printerIp = getPrinterIPv4(address);
  if (!printerIp) return { ok: false, reason: "invalid_address" };

  try {
    const objects = await getMoonrakerObjects(printerIp, timeoutMs);
    const extruders = objects
      .filter(name => /^extruder\d*$/.test(name))
      .sort(compareExtruderNames)
      .slice(0, 8);
    const requestedObjects = [
      "print_stats",
      "display_status",
      "virtual_sdcard",
      "heater_bed",
      ...extruders
    ].filter(name => objects.includes(name));

    if (!requestedObjects.includes("print_stats")) {
      return { ok: false, reason: "invalid_response" };
    }

    const query = requestedObjects.map(encodeURIComponent).join("&");
    const payload = await fetchMoonrakerJson(
      `http://${printerIp}:${MOONRAKER_PORT}/printer/objects/query?${query}`,
      timeoutMs
    );
    const status = readRecord(readRecord(payload, "result"), "status");
    const printStats = readRecord(status, "print_stats");
    const rawState = readString(printStats, "state").toLowerCase();
    if (!rawState) return { ok: false, reason: "invalid_response" };

    const displayStatus = readRecord(status, "display_status");
    const virtualSdcard = readRecord(status, "virtual_sdcard");
    const progress = readNumber(displayStatus, "progress") ?? readNumber(virtualSdcard, "progress") ?? 0;
    const bedTemperature = readNumber(readRecord(status, "heater_bed"), "temperature");
    const extruderTemperatures = extruders.flatMap(name => {
      const temperature = readNumber(readRecord(status, name), "temperature");
      return temperature === null ? [] : [temperature];
    });

    return {
      ok: true,
      data: {
        status: rawState === "printing" ? "printing" : rawState === "error" ? "error" : "ready",
        bedTemperature,
        extruderTemperatures,
        progress,
        filename: readString(printStats, "filename")
      }
    };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof DOMException && error.name === "AbortError" ? "timeout" : "unavailable"
    };
  }
}

function getPrinterIPv4(address: string): string | null {
  try {
    const url = new URL(/^https?:\/\//i.test(address) ? address : `http://${address}`);
    if (url.username || url.password || isIP(url.hostname) !== 4) return null;
    return url.hostname;
  } catch {
    return null;
  }
}

async function getMoonrakerObjects(printerIp: string, timeoutMs: number): Promise<string[]> {
  const cached = objectCache.get(printerIp);
  if (cached && cached.expiresAt > Date.now()) return cached.objects;

  const payload = await fetchMoonrakerJson(
    `http://${printerIp}:${MOONRAKER_PORT}/printer/objects/list`,
    timeoutMs
  );
  const rawObjects = readRecord(payload, "result").objects;
  if (!Array.isArray(rawObjects) || !rawObjects.every(item => typeof item === "string")) {
    throw new Error("Invalid Moonraker object list");
  }
  const objects = rawObjects.slice(0, 2048);
  objectCache.set(printerIp, { expiresAt: Date.now() + 60_000, objects });
  return objects;
}

async function fetchMoonrakerJson(url: string, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      redirect: "error",
      headers: { accept: "application/json" }
    });
    if (!response.ok) throw new Error(`Moonraker HTTP ${response.status}`);
    const text = await readResponseBody(response, MAX_MOONRAKER_RESPONSE_BYTES);
    return JSON.parse(text) as unknown;
  } finally {
    clearTimeout(timer);
  }
}

async function readResponseBody(response: Response, limit: number): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel();
      throw new Error("Moonraker response is too large");
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

function readRecord(value: unknown, key?: string): Record<string, unknown> {
  const candidate = key && value && typeof value === "object"
    ? (value as Record<string, unknown>)[key]
    : value;
  return candidate && typeof candidate === "object" && !Array.isArray(candidate)
    ? candidate as Record<string, unknown>
    : {};
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

function readNumber(record: Record<string, unknown>, key: string): number | null {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function compareExtruderNames(left: string, right: string): number {
  const index = (name: string): number => name === "extruder" ? 0 : Number(name.slice("extruder".length));
  return index(left) - index(right);
}

function probeTcpPort(host: string, port: number, timeoutMs: number): Promise<boolean> {
  return new Promise(resolve => {
    const socket = createConnection({ host, port });
    let settled = false;
    const finish = (reachable: boolean): void => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(reachable);
    };

    socket.setTimeout(timeoutMs, () => finish(false));
    socket.once("connect", () => finish(true));
    socket.once("error", error => {
      const code = (error as NodeJS.ErrnoException).code;
      finish(code === "ECONNREFUSED" || code === "ECONNRESET");
    });
  });
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
  fetchWithTimeout,
  probeTcpPort,
  fetchMoonrakerJson,
  getPrinterIPv4,
  readResponseBody,
  objectCache
};
