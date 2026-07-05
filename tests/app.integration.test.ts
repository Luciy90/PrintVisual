import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.ts";

let appServer: http.Server;
let appBaseUrl = "";

async function startServer(server: http.Server, host = "127.0.0.1"): Promise<string> {
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, host, () => resolve());
  });

  const address = server.address() as AddressInfo;
  return `http://${host}:${address.port}`;
}

async function stopServer(server: http.Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });
}

beforeAll(async () => {
  appServer = http.createServer(createApp());
  appBaseUrl = await startServer(appServer);
});

afterAll(async () => {
  await stopServer(appServer);
});

describe("HTTP API integration", () => {
  it("returns validation details for invalid printer MAC requests", async () => {
    const response = await fetch(`${appBaseUrl}/api/printers/mac`);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body).toMatchObject({
      error: "validation_error",
      message: "Request validation failed"
    });
    expect(body.issues[0]?.message).toBe("Required");
  });

  it("returns validation details for invalid recovery plan payloads", async () => {
    const response = await fetch(`${appBaseUrl}/api/network/recovery-plan`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ printers: [] })
    });
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe("validation_error");
    expect(body.issues[0]?.message).toBe("Array must contain at least 1 element(s)");
  });

  it("looks up printer MAC through the HTTP route against a live external service", async () => {
    const printerServer = http.createServer((req, res) => {
      if (req.url === "/machine/system_info") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ network: { ethernet: { mac: "de-ad-be-ef-00-02" } } }));
        return;
      }

      res.writeHead(404);
      res.end("not found");
    });

    const printerBaseUrl = await startServer(printerServer);

    try {
      const response = await fetch(`${appBaseUrl}/api/printers/mac?address=${encodeURIComponent(printerBaseUrl)}`);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body).toMatchObject({
        found: true,
        host: printerBaseUrl.replace("http://", ""),
        mac: "DE:AD:BE:EF:00:02"
      });
    } finally {
      await stopServer(printerServer);
    }
  });
});
