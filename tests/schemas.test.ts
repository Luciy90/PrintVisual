import { describe, expect, it } from "vitest";
import {
  AppSettingsSchema,
  CameraListSchema,
  CameraSchema,
  MacLookupBodySchema,
  MacLookupQuerySchema,
  MacSchema,
  NetworkScanSchema,
  PrinterAddressSchema,
  RecoverPlanSchema,
  SubnetSchema
} from "../src/schemas.ts";

describe("Zod schemas", () => {
  it("validates and normalizes MAC addresses", () => {
    expect(MacSchema.parse("aa-bb-cc-dd-ee-ff")).toBe("AA:BB:CC:DD:EE:FF");

    const result = MacSchema.safeParse("bad-mac");
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0]?.message).toBe("Invalid");
  });

  it("validates printer addresses with trim and length limits", () => {
    expect(PrinterAddressSchema.parse(" 192.168.1.20 ")).toBe("192.168.1.20");

    const empty = PrinterAddressSchema.safeParse("   ");
    expect(empty.success).toBe(false);
    if (!empty.success) {
      expect(empty.error.issues[0]?.message).toBe("String must contain at least 1 character(s)");
    }

    const tooLong = PrinterAddressSchema.safeParse("a".repeat(256));
    expect(tooLong.success).toBe(false);
    if (!tooLong.success) {
      expect(tooLong.error.issues[0]?.message).toBe("String must contain at most 255 character(s)");
    }
  });

  it("applies defaults for camera objects and camera arrays", () => {
    expect(CameraSchema.parse({})).toEqual({
      ip: "",
      stream: "",
      name: "",
      mac: "",
      lastSeenIp: "",
      lastMacCheckAt: ""
    });

    expect(CameraListSchema.parse([{ ip: "192.168.1.20" }])).toEqual([{
      ip: "192.168.1.20",
      stream: "",
      name: "",
      mac: "",
      lastSeenIp: "",
      lastMacCheckAt: ""
    }]);
  });

  it("accepts partial settings, passthrough fields and rejects invalid toggle values", () => {
    expect(AppSettingsSchema.parse({
      cameraOrder: [{ ip: "192.168.1.20", name: "Printer A" }],
      streamToggles: { cam1: true },
      customTheme: "dark"
    })).toMatchObject({
      streamToggles: { cam1: true },
      customTheme: "dark"
    });

    const invalid = AppSettingsSchema.safeParse({
      streamToggles: { cam1: "yes" }
    });
    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(invalid.error.issues[0]?.message).toBe("Expected boolean, received string");
      expect(invalid.error.issues[0]?.path).toEqual(["streamToggles", "cam1"]);
    }
  });

  it("validates MAC lookup input for query and body payloads", () => {
    expect(MacLookupQuerySchema.parse({ address: " printer.local " })).toEqual({ address: "printer.local" });
    expect(MacLookupBodySchema.parse({ address: "192.168.1.20", timeoutMs: 250 })).toEqual({
      address: "192.168.1.20",
      timeoutMs: 250
    });

    const missingAddress = MacLookupQuerySchema.safeParse({});
    expect(missingAddress.success).toBe(false);
    if (!missingAddress.success) {
      expect(missingAddress.error.issues[0]?.message).toBe("Required");
    }

    const timeoutTooSmall = MacLookupBodySchema.safeParse({ address: "192.168.1.20", timeoutMs: 249 });
    expect(timeoutTooSmall.success).toBe(false);
    if (!timeoutTooSmall.success) {
      expect(timeoutTooSmall.error.issues[0]?.message).toBe("Number must be greater than or equal to 250");
    }
  });

  it("validates subnet format and network scan boundaries", () => {
    expect(SubnetSchema.parse("192.168.10")).toBe("192.168.10");

    const invalidSubnet = SubnetSchema.safeParse("192.168.256");
    expect(invalidSubnet.success).toBe(false);
    if (!invalidSubnet.success) {
      expect(invalidSubnet.error.issues[0]?.message).toBe("Invalid");
    }

    expect(NetworkScanSchema.parse({
      subnets: ["192.168.10"],
      printers: [{ ip: "192.168.10.20", mac: "AA:BB:CC:DD:EE:FF" }],
      concurrency: 64,
      probeTimeoutMs: 250,
      macTimeoutMs: 10000
    })).toMatchObject({
      subnets: ["192.168.10"],
      concurrency: 64,
      probeTimeoutMs: 250,
      macTimeoutMs: 10000
    });

    const noSubnets = NetworkScanSchema.safeParse({ subnets: [] });
    expect(noSubnets.success).toBe(false);
    if (!noSubnets.success) {
      expect(noSubnets.error.issues[0]?.message).toBe("Array must contain at least 1 element(s)");
    }

    const tooMany = NetworkScanSchema.safeParse({ subnets: Array.from({ length: 17 }, (_, index) => `192.168.${index}`) });
    expect(tooMany.success).toBe(false);
    if (!tooMany.success) {
      expect(tooMany.error.issues[0]?.message).toBe("Array must contain at most 16 element(s)");
    }
  });

  it("validates recovery plan payloads and numeric bounds", () => {
    expect(RecoverPlanSchema.parse({
      printers: [{ ip: "http://192.168.1.20:7125", mac: "AA:BB:CC:DD:EE:FF", name: "A" }],
      concurrency: 1,
      probeTimeoutMs: 500,
      macTimeoutMs: 600
    })).toMatchObject({
      concurrency: 1,
      probeTimeoutMs: 500,
      macTimeoutMs: 600
    });

    const missingPrinters = RecoverPlanSchema.safeParse({ printers: [] });
    expect(missingPrinters.success).toBe(false);
    if (!missingPrinters.success) {
      expect(missingPrinters.error.issues[0]?.message).toBe("Array must contain at least 1 element(s)");
    }

    const invalidConcurrency = RecoverPlanSchema.safeParse({
      printers: [{ ip: "192.168.1.20" }],
      concurrency: 65
    });
    expect(invalidConcurrency.success).toBe(false);
    if (!invalidConcurrency.success) {
      expect(invalidConcurrency.error.issues[0]?.message).toBe("Number must be less than or equal to 64");
    }
  });
});
