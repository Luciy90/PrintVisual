import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";
import { checkPrinterConnection, fetchPrinterMac, printerServiceInternals } from "../src/services/printerService.ts";

const originalFetch = globalThis.fetch;

async function startServer(
  handler: http.RequestListener
): Promise<{ server: http.Server; baseUrl: string }> {
  const server = http.createServer(handler);

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address() as AddressInfo;
  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`
  };
}

async function stopServer(server: http.Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("printerService", () => {
  it("returns null for placeholder printer addresses", async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as typeof fetch;

    await expect(fetchPrinterMac("dammy")).resolves.toBeNull();
    await expect(checkPrinterConnection("dammy")).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("tries known JSON endpoints until MAC is found", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error("connection refused"))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        result: {
          system: {
            network: {
              mac_address: "aa-bb-cc-dd-ee-ff"
            }
          }
        }
      }), { status: 200 }));

    globalThis.fetch = fetchMock;

    await expect(fetchPrinterMac("192.168.1.20:7125/path")).resolves.toEqual({
      address: "192.168.1.20:7125/path",
      host: "192.168.1.20:7125",
      mac: "AA:BB:CC:DD:EE:FF",
      source: "http://192.168.1.20:7125/server/info"
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://192.168.1.20:7125/machine/system_info");
    expect(fetchMock.mock.calls[1]?.[0]).toBe("http://192.168.1.20:7125/server/info");
  });

  it("returns null when endpoints do not contain MAC data", async () => {
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ result: { status: "ok" } }), { status: 200 })
    );

    await expect(fetchPrinterMac("192.168.1.20")).resolves.toBeNull();
  });

  it("checks connectivity through fallback probe URLs", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error("down"))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    globalThis.fetch = fetchMock;

    await expect(checkPrinterConnection("192.168.1.20")).resolves.toBe(true);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://192.168.1.20/machine/system_info");
    expect(fetchMock.mock.calls[1]?.[0]).toBe("http://192.168.1.20/server/info");
  });

  it("returns false when all connectivity probes fail", async () => {
    globalThis.fetch = vi.fn<typeof fetch>().mockRejectedValue(new Error("offline"));

    await expect(checkPrinterConnection("192.168.1.20")).resolves.toBe(false);
  });

  it("parses JSON responses and falls back to raw text for non-JSON payloads", async () => {
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(JSON.stringify({ value: 1 }), { status: 200 })
    );
    await expect(printerServiceInternals.fetchJsonWithTimeout("http://printer/json", 100)).resolves.toEqual({ value: 1 });

    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response("plain text", { status: 200 })
    );
    await expect(printerServiceInternals.fetchJsonWithTimeout("http://printer/text", 100)).resolves.toBe("plain text");
  });

  it("throws for non-success HTTP responses", async () => {
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response("nope", { status: 503 })
    );

    await expect(printerServiceInternals.fetchWithTimeout("http://printer/error", 100)).rejects.toThrow("HTTP 503");
  });

  it("aborts requests on timeout", async () => {
    vi.useFakeTimers();
    globalThis.fetch = vi.fn<typeof fetch>((_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new Error("AbortError")));
    }));

    const request = expect(printerServiceInternals.fetchWithTimeout("http://printer/slow", 50)).rejects.toThrow("AbortError");
    await vi.advanceTimersByTimeAsync(60);
    await request;
  });

  it("integrates with a live HTTP service and extracts nested MAC data", async () => {
    const { server, baseUrl } = await startServer((req, res) => {
      if (req.url === "/machine/system_info") {
        res.writeHead(404);
        res.end("missing");
        return;
      }
      if (req.url === "/server/info") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ network: [{ iface: "eth0", mac: "11:22:33:44:55:66" }] }));
        return;
      }

      res.writeHead(404);
      res.end("unknown");
    });

    try {
      await expect(fetchPrinterMac(`${baseUrl}/printer`)).resolves.toEqual({
        address: `${baseUrl}/printer`,
        host: baseUrl.replace("http://", ""),
        mac: "11:22:33:44:55:66".toUpperCase(),
        source: `${baseUrl}/server/info`
      });
    } finally {
      await stopServer(server);
    }
  });

  it("returns null when the external HTTP service is unavailable", async () => {
    const server = http.createServer((_req, res) => {
      res.writeHead(200, { "content-type": "application/json" });
      setTimeout(() => res.end(JSON.stringify({ mac: "AA:BB:CC:DD:EE:FF" })), 200);
    });

    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", () => resolve());
    });

    const { port } = server.address() as AddressInfo;

    try {
      await expect(fetchPrinterMac(`127.0.0.1:${port}`, 30)).resolves.toBeNull();
    } finally {
      await stopServer(server);
    }
  });
});
