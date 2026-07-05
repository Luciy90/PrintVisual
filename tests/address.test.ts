import { describe, expect, it } from "vitest";
import {
  extractIPv4,
  findMacInValue,
  getScanSubnets,
  getSubnetPrefix,
  normalizeMac,
  normalizePrinterAddress,
  replaceAddressHost
} from "../src/services/address.ts";

describe("address helpers", () => {
  it("normalizes MAC addresses from mixed input", () => {
    expect(normalizeMac(" aa-bb-cc-dd-ee-ff ")).toBe("AA:BB:CC:DD:EE:FF");
    expect(normalizeMac("prefix 11:22:33:44:55:66 suffix")).toBe("11:22:33:44:55:66");
    expect(normalizeMac("not-a-mac")).toBe("");
  });

  it("finds MAC addresses in nested arrays and objects", () => {
    const value = {
      first: [{ nope: "value" }],
      second: {
        data: ["skip", { iface: { mac: "de-ad-be-ef-00-01" } }]
      }
    };

    expect(findMacInValue(value)).toBe("DE:AD:BE:EF:00:01");
  });

  it("normalizes printer addresses and extracts IPv4/subnet data", () => {
    expect(normalizePrinterAddress(" http://192.168.10.25:8080/path/ ")).toBe("192.168.10.25:8080/path");
    expect(normalizePrinterAddress("192.168.10.25:8080/path/")).toBe("192.168.10.25:8080/path");
    expect(normalizePrinterAddress("http://bad host/path/")).toBe("bad host/path");
    expect(extractIPv4("http://192.168.10.25:8080/path")).toBe("192.168.10.25");
    expect(getSubnetPrefix("http://192.168.10.25:8080/path")).toBe("192.168.10");
    expect(getSubnetPrefix("printer.local")).toBe("");
  });

  it("collects distinct scan subnets and replaces host addresses", () => {
    expect(getScanSubnets([
      { ip: "192.168.1.15", stream: "", name: "", mac: "", lastSeenIp: "", lastMacCheckAt: "" },
      { ip: "http://192.168.1.20:7125", stream: "", name: "", mac: "", lastSeenIp: "", lastMacCheckAt: "" },
      { ip: "10.0.0.15", stream: "", name: "", mac: "", lastSeenIp: "", lastMacCheckAt: "" }
    ])).toEqual(["192.168.1", "10.0.0"]);

    expect(replaceAddressHost("http://192.168.1.15:7125/printer", "192.168.1.99")).toBe("192.168.1.99:7125/printer");
    expect(replaceAddressHost("printer.local", "192.168.1.99")).toBe("192.168.1.99");
  });
});
