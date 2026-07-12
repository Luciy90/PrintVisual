import { describe, expect, it, vi } from "vitest";
import {
  buildRecoveryPlan,
  networkScannerInternals,
  scanNetwork,
  type DiscoveredDevice,
  type NetworkScannerDeps
} from "../src/services/networkScanner.ts";
import type { Camera } from "../src/schemas.ts";

function createDeps(overrides: Partial<NetworkScannerDeps> = {}): NetworkScannerDeps {
  return {
    probePrinterReachability: vi.fn(async () => false),
    fetchPrinterMac: vi.fn(async () => null),
    expandSubnet: vi.fn((subnet: string) => [`${subnet}.10`, `${subnet}.11`]),
    logger: { warn: vi.fn() },
    ...overrides
  };
}

describe("networkScanner", () => {
  it("provides default dependencies for subnet expansion and logging", () => {
    const defaults = networkScannerInternals.resolveNetworkScannerDeps();
    expect(defaults.expandSubnet("192.168.1")).toHaveLength(254);

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    defaults.logger.warn("message");
    defaults.logger.warn("message", { ip: "192.168.1.10" });

    expect(warnSpy).toHaveBeenNthCalledWith(1, "message");
    expect(warnSpy).toHaveBeenNthCalledWith(2, "message", { ip: "192.168.1.10" });
  });

  it("preserves input order in concurrent worker execution", async () => {
    const result = await networkScannerInternals.runConcurrent([1, 2, 3], 3, async value => {
      await new Promise(resolve => setTimeout(resolve, (4 - value) * 10));
      return value * 2;
    });

    expect(result).toEqual([2, 4, 6]);
  });

  it("returns an empty result for empty concurrent workloads", async () => {
    await expect(networkScannerInternals.runConcurrent([], 4, async value => value)).resolves.toEqual([]);
  });

  it("builds a normalized MAC map and tracks conflicts", () => {
    const discovery = networkScannerInternals.buildMacDiscoveryMap([
      { ip: "192.168.1.9", reachable: true, mac: "", source: "skip" },
      { ip: "192.168.1.10", reachable: true, mac: "aa-bb-cc-dd-ee-ff", source: "a" },
      { ip: "192.168.1.11", reachable: true, mac: "AA:BB:CC:DD:EE:FF", source: "b" },
      { ip: "192.168.1.12", reachable: true, mac: "11:22:33:44:55:66", source: "c" }
    ]);

    expect(discovery.macMap.get("AA:BB:CC:DD:EE:FF")).toMatchObject({
      ip: "192.168.1.10",
      conflict: true
    });
    expect(discovery.conflicts.get("AA:BB:CC:DD:EE:FF")).toHaveLength(2);
    expect(discovery.macMap.get("11:22:33:44:55:66")).toMatchObject({
      ip: "192.168.1.12"
    });
  });

  it("matches saved printers by MAC and rewrites only changed IP addresses", () => {
    const printers: Camera[] = [
      { ip: "http://192.168.1.10:7125", name: "A", mac: "aa-bb-cc-dd-ee-ff", stream: "", lastSeenIp: "", lastMacCheckAt: "" },
      { ip: "dammy", name: "B", mac: "11:22:33:44:55:66", stream: "", lastSeenIp: "", lastMacCheckAt: "" },
      { ip: "192.168.1.12", name: "C", mac: "77:88:99:AA:BB:CC", stream: "", lastSeenIp: "", lastMacCheckAt: "" }
    ];
    const macMap = new Map<string, DiscoveredDevice & { conflict?: boolean }>([
      ["AA:BB:CC:DD:EE:FF", { ip: "192.168.1.50", reachable: true, mac: "AA:BB:CC:DD:EE:FF", source: "scan" }],
      ["11:22:33:44:55:66", { ip: "192.168.1.60", reachable: true, mac: "11:22:33:44:55:66", source: "scan" }],
      ["77:88:99:AA:BB:CC", { ip: "192.168.1.12", reachable: true, mac: "77:88:99:AA:BB:CC", source: "scan", conflict: true }]
    ]);

    expect(networkScannerInternals.matchSavedPrintersByMac(printers, macMap)).toEqual([{
      index: 0,
      name: "A",
      oldIp: "http://192.168.1.10:7125",
      newIp: "192.168.1.50:7125",
      mac: "AA:BB:CC:DD:EE:FF"
    }]);
  });

  it("does not create a recovery match when the device IP is unchanged", () => {
    const printers: Camera[] = [
      { ip: "192.168.1.10", name: "A", mac: "AA:BB:CC:DD:EE:FF", stream: "", lastSeenIp: "", lastMacCheckAt: "" }
    ];
    const macMap = new Map<string, DiscoveredDevice & { conflict?: boolean }>([
      ["AA:BB:CC:DD:EE:FF", { ip: "192.168.1.10", reachable: true, mac: "AA:BB:CC:DD:EE:FF", source: "scan" }]
    ]);

    expect(networkScannerInternals.matchSavedPrintersByMac(printers, macMap)).toEqual([]);
  });

  it("falls back to the raw printer address and IP label when hostname-based entries move", () => {
    const printers: Camera[] = [
      { ip: "printer-a.local:7125", name: "", mac: "AA:BB:CC:DD:EE:FF", stream: "", lastSeenIp: "", lastMacCheckAt: "" },
      { ip: "printer-b.local", name: "No MAC", mac: "", stream: "", lastSeenIp: "", lastMacCheckAt: "" }
    ];
    const macMap = new Map<string, DiscoveredDevice & { conflict?: boolean }>([
      ["AA:BB:CC:DD:EE:FF", { ip: "192.168.1.50", reachable: true, mac: "AA:BB:CC:DD:EE:FF", source: "scan" }]
    ]);

    expect(networkScannerInternals.matchSavedPrintersByMac(printers, macMap)).toEqual([{
      index: 0,
      name: "printer-a.local:7125",
      oldIp: "printer-a.local:7125",
      newIp: "192.168.1.50",
      mac: "AA:BB:CC:DD:EE:FF"
    }]);
  });

  it("scans a device and returns the discovered MAC", async () => {
    const deps = createDeps({
      probePrinterReachability: vi.fn(async () => true),
      fetchPrinterMac: vi.fn(async () => ({
        address: "192.168.1.10",
        host: "192.168.1.10",
        mac: "AA:BB:CC:DD:EE:FF",
        source: "http://192.168.1.10/server/info"
      }))
    });

    await expect(networkScannerInternals.scanDevice("192.168.1.10", 500, 700, deps)).resolves.toEqual({
      ip: "192.168.1.10",
      reachable: true,
      mac: "AA:BB:CC:DD:EE:FF",
      source: "http://192.168.1.10/server/info"
    });
  });

  it("marks a device unreachable when connection probe fails", async () => {
    const deps = createDeps({
      probePrinterReachability: vi.fn(async () => false)
    });

    await expect(networkScannerInternals.scanDevice("192.168.1.10", 500, 700, deps)).resolves.toEqual({
      ip: "192.168.1.10",
      reachable: false,
      mac: "",
      source: ""
    });
  });

  it("uses a fallback source when the device is reachable but MAC is not returned", async () => {
    const deps = createDeps({
      probePrinterReachability: vi.fn(async () => true),
      fetchPrinterMac: vi.fn(async () => null)
    });

    await expect(networkScannerInternals.scanDevice("192.168.1.10", 500, 700, deps)).resolves.toEqual({
      ip: "192.168.1.10",
      reachable: true,
      mac: "",
      source: "http-probe"
    });
  });

  it("logs and handles unexpected scan errors", async () => {
    const deps = createDeps({
      probePrinterReachability: vi.fn(async () => {
        throw new Error("timeout");
      })
    });

    await expect(networkScannerInternals.scanDevice("192.168.1.10", 500, 700, deps)).resolves.toEqual({
      ip: "192.168.1.10",
      reachable: false,
      mac: "",
      source: ""
    });
    expect(deps.logger.warn).toHaveBeenCalledTimes(1);
    expect(deps.logger.warn).toHaveBeenCalledWith("Failed to scan printer device", expect.objectContaining({
      ip: "192.168.1.10"
    }));
  });

  it("scans subnets with injected dependencies and returns only reachable devices", async () => {
    const deps = createDeps({
      probePrinterReachability: vi.fn(async (ip: string) => ip.endsWith(".10")),
      fetchPrinterMac: vi.fn(async (ip: string) => ({
        address: ip,
        host: ip,
        mac: ip.endsWith(".10") ? "AA:BB:CC:DD:EE:FF" : "",
        source: `http://${ip}/server/info`
      }))
    });

    await expect(scanNetwork({
      subnets: ["192.168.1"],
      concurrency: 2,
      probeTimeoutMs: 300,
      macTimeoutMs: 400
    }, deps)).resolves.toEqual([{
      ip: "192.168.1.10",
      reachable: true,
      mac: "AA:BB:CC:DD:EE:FF",
      source: "http://192.168.1.10/server/info"
    }]);

    expect(deps.probePrinterReachability).toHaveBeenCalledWith("192.168.1.10", 300);
    expect(deps.fetchPrinterMac).toHaveBeenCalledWith("192.168.1.10", 400);
  });

  it("builds an end-to-end recovery plan with matches and conflicts", async () => {
    const printers: Camera[] = [
      { ip: "http://192.168.1.10:7125", name: "Printer A", mac: "AA:BB:CC:DD:EE:FF", stream: "", lastSeenIp: "", lastMacCheckAt: "" },
      { ip: "192.168.1.11", name: "Printer B", mac: "11:22:33:44:55:66", stream: "", lastSeenIp: "", lastMacCheckAt: "" }
    ];
    const deps = createDeps({
      expandSubnet: vi.fn(() => ["192.168.1.50", "192.168.1.60", "192.168.1.61"]),
      probePrinterReachability: vi.fn(async () => true),
      fetchPrinterMac: vi.fn(async (ip: string) => {
        if (ip === "192.168.1.50") {
          return {
            address: ip,
            host: ip,
            mac: "AA:BB:CC:DD:EE:FF",
            source: `http://${ip}/server/info`
          };
        }
        return {
          address: ip,
          host: ip,
          mac: "11:22:33:44:55:66",
          source: `http://${ip}/server/info`
        };
      })
    });

    await expect(buildRecoveryPlan({
      printers,
      concurrency: 3,
      probeTimeoutMs: 250,
      macTimeoutMs: 250
    }, deps)).resolves.toEqual({
      subnets: ["192.168.1"],
      devices: [
        {
          ip: "192.168.1.50",
          reachable: true,
          mac: "AA:BB:CC:DD:EE:FF",
          source: "http://192.168.1.50/server/info"
        },
        {
          ip: "192.168.1.60",
          reachable: true,
          mac: "11:22:33:44:55:66",
          source: "http://192.168.1.60/server/info"
        },
        {
          ip: "192.168.1.61",
          reachable: true,
          mac: "11:22:33:44:55:66",
          source: "http://192.168.1.61/server/info"
        }
      ],
      matches: [{
        index: 0,
        name: "Printer A",
        oldIp: "http://192.168.1.10:7125",
        newIp: "192.168.1.50:7125",
        mac: "AA:BB:CC:DD:EE:FF"
      }],
      conflicts: {
        "11:22:33:44:55:66": [
          {
            ip: "192.168.1.60",
            reachable: true,
            mac: "11:22:33:44:55:66",
            source: "http://192.168.1.60/server/info"
          },
          {
            ip: "192.168.1.61",
            reachable: true,
            mac: "11:22:33:44:55:66",
            source: "http://192.168.1.61/server/info"
          }
        ]
      }
    });
  });

  it("continues recovery planning when a device scan crashes", async () => {
    const deps = createDeps({
      expandSubnet: vi.fn(() => ["192.168.1.50", "192.168.1.51"]),
      probePrinterReachability: vi.fn(async (ip: string) => {
        if (ip.endsWith(".50")) {
          throw new Error("probe timeout");
        }
        return true;
      }),
      fetchPrinterMac: vi.fn(async (ip: string) => ({
        address: ip,
        host: ip,
        mac: "AA:BB:CC:DD:EE:FF",
        source: `http://${ip}/server/info`
      }))
    });

    await expect(buildRecoveryPlan({
      printers: [{ ip: "192.168.1.10", name: "Printer A", mac: "AA:BB:CC:DD:EE:FF", stream: "", lastSeenIp: "", lastMacCheckAt: "" }]
    }, deps)).resolves.toMatchObject({
      devices: [{
        ip: "192.168.1.51",
        reachable: true,
        mac: "AA:BB:CC:DD:EE:FF"
      }],
      matches: [{
        newIp: "192.168.1.51"
      }]
    });
    expect(deps.logger.warn).toHaveBeenCalledTimes(1);
  });
});
