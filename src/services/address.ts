import type { Camera } from "../schemas.js";

export function normalizeMac(value: unknown): string {
  const raw = String(value ?? "").trim();
  const match = raw.match(/([0-9a-f]{2}[:-]){5}[0-9a-f]{2}/i);
  return match ? match[0].replace(/-/g, ":").toUpperCase() : "";
}

export function findMacInValue(value: unknown): string {
  const direct = normalizeMac(value);
  if (direct) return direct;

  if (Array.isArray(value)) {
    for (const item of value) {
      const mac = findMacInValue(item);
      if (mac) return mac;
    }
    return "";
  }

  if (value && typeof value === "object") {
    for (const nested of Object.values(value)) {
      const mac = findMacInValue(nested);
      if (mac) return mac;
    }
  }

  return "";
}

export function normalizePrinterAddress(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const url = trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? new URL(trimmed)
      : new URL(`http://${trimmed}`);
    return url.host + url.pathname.replace(/\/$/, "");
  } catch {
    return trimmed.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  }
}

export function extractIPv4(value: string): string {
  return normalizePrinterAddress(value).match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/)?.[0] ?? "";
}

export function getSubnetPrefix(value: string): string {
  const ip = extractIPv4(value);
  const parts = ip.split(".");
  return parts.length === 4 ? parts.slice(0, 3).join(".") : "";
}

export function getScanSubnets(printers: Camera[]): string[] {
  const subnets = new Set<string>();
  for (const printer of printers) {
    const subnet = getSubnetPrefix(printer.ip);
    if (subnet) subnets.add(subnet);
  }
  return [...subnets];
}

export function replaceAddressHost(oldValue: string, newIp: string): string {
  const normalized = normalizePrinterAddress(oldValue);
  const oldIp = extractIPv4(normalized);
  return oldIp ? normalized.replace(oldIp, newIp) : newIp;
}
