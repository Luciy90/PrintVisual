import type { Camera, NetworkScanInput, RecoverPlanInput } from "../schemas.js";
import { extractIPv4, getScanSubnets, normalizeMac, normalizePrinterAddress, replaceAddressHost } from "./address.js";
import { checkPrinterConnection, fetchPrinterMac } from "./printerService.js";

export interface DiscoveredDevice {
  ip: string;
  reachable: boolean;
  mac: string;
  source: string;
}

export interface IpRecoveryMatch {
  index: number;
  name: string;
  oldIp: string;
  newIp: string;
  mac: string;
}

export interface NetworkScannerLogger {
  warn(message: string, details?: unknown): void;
}

export interface NetworkScannerDeps {
  checkPrinterConnection: typeof checkPrinterConnection;
  fetchPrinterMac: typeof fetchPrinterMac;
  expandSubnet(subnet: string): string[];
  logger: NetworkScannerLogger;
}

const defaultNetworkScannerDeps: NetworkScannerDeps = {
  checkPrinterConnection,
  fetchPrinterMac,
  expandSubnet(subnet: string): string[] {
    return Array.from({ length: 254 }, (_, index) => `${subnet}.${index + 1}`);
  },
  logger: {
    warn(message: string, details?: unknown): void {
      if (details === undefined) {
        console.warn(message);
        return;
      }
      console.warn(message, details);
    }
  }
};

function resolveNetworkScannerDeps(overrides: Partial<NetworkScannerDeps> = {}): NetworkScannerDeps {
  return {
    ...defaultNetworkScannerDeps,
    ...overrides
  };
}

export async function scanNetwork(
  input: NetworkScanInput,
  overrides: Partial<NetworkScannerDeps> = {}
): Promise<DiscoveredDevice[]> {
  const deps = resolveNetworkScannerDeps(overrides);
  const subnets = input.subnets?.length ? input.subnets : getScanSubnets(input.printers ?? []);
  const results: DiscoveredDevice[] = [];

  for (const subnet of subnets) {
    const ips = deps.expandSubnet(subnet);
    const subnetResults = await runConcurrent(
      ips,
      input.concurrency ?? 24,
      ip => scanDevice(ip, input.probeTimeoutMs ?? 700, input.macTimeoutMs ?? 1000, deps)
    );
    results.push(...subnetResults.filter(device => device.reachable));
  }

  return results;
}

export async function buildRecoveryPlan(
  input: RecoverPlanInput,
  overrides: Partial<NetworkScannerDeps> = {}
): Promise<{
  subnets: string[];
  devices: DiscoveredDevice[];
  matches: IpRecoveryMatch[];
  conflicts: Record<string, DiscoveredDevice[]>;
}> {
  const deps = resolveNetworkScannerDeps(overrides);
  const subnets = getScanSubnets(input.printers);
  const devices = await scanNetwork({
    subnets,
    concurrency: input.concurrency,
    probeTimeoutMs: input.probeTimeoutMs,
    macTimeoutMs: input.macTimeoutMs
  }, deps);
  const discovery = buildMacDiscoveryMap(devices);

  return {
    subnets,
    devices,
    matches: matchSavedPrintersByMac(input.printers, discovery.macMap),
    conflicts: Object.fromEntries(discovery.conflicts)
  };
}

async function scanDevice(
  ip: string,
  probeTimeoutMs: number,
  macTimeoutMs: number,
  deps: NetworkScannerDeps
): Promise<DiscoveredDevice> {
  try {
    const reachable = await deps.checkPrinterConnection(ip, probeTimeoutMs);
    if (!reachable) return { ip, reachable: false, mac: "", source: "" };

    const macResult = await deps.fetchPrinterMac(ip, macTimeoutMs);
    return {
      ip,
      reachable: true,
      mac: macResult?.mac ?? "",
      source: macResult?.source ?? "http-probe"
    };
  } catch (error) {
    deps.logger.warn("Failed to scan printer device", { ip, error });
    return { ip, reachable: false, mac: "", source: "" };
  }
}

async function runConcurrent<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  async function next(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor++;
      const item = items[index] as T;
      results[index] = await worker(item);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => next()));
  return results;
}

function buildMacDiscoveryMap(devices: DiscoveredDevice[]): {
  macMap: Map<string, DiscoveredDevice & { conflict?: boolean }>;
  conflicts: Map<string, DiscoveredDevice[]>;
} {
  const macMap = new Map<string, DiscoveredDevice & { conflict?: boolean }>();
  const conflicts = new Map<string, DiscoveredDevice[]>();

  for (const device of devices) {
    const mac = normalizeMac(device.mac);
    if (!mac) continue;

    const current = { ...device, mac };
    const previous = macMap.get(mac);
    if (!previous) {
      macMap.set(mac, current);
      continue;
    }

    const list = conflicts.get(mac) ?? [previous];
    list.push(current);
    conflicts.set(mac, list);
    macMap.set(mac, { ...previous, conflict: true });
  }

  return { macMap, conflicts };
}

function matchSavedPrintersByMac(
  printers: Camera[],
  macMap: Map<string, DiscoveredDevice & { conflict?: boolean }>
): IpRecoveryMatch[] {
  const matches: IpRecoveryMatch[] = [];

  printers.forEach((printer, index) => {
    const mac = normalizeMac(printer.mac);
    if (!mac || printer.ip.toLowerCase() === "dammy") return;

    const device = macMap.get(mac);
    if (!device || device.conflict) return;

    const currentIp = extractIPv4(printer.ip) || normalizePrinterAddress(printer.ip);
    if (device.ip && device.ip !== currentIp) {
      matches.push({
        index,
        name: printer.name || printer.ip,
        oldIp: printer.ip,
        newIp: replaceAddressHost(printer.ip, device.ip),
        mac
      });
    }
  });

  return matches;
}

export const networkScannerInternals = {
  resolveNetworkScannerDeps,
  scanDevice,
  runConcurrent,
  buildMacDiscoveryMap,
  matchSavedPrintersByMac
};
