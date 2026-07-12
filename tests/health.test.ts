import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.ts";

let server: http.Server;
let baseUrl = "";

beforeAll(async () => {
  server = http.createServer(createApp());
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });
});

describe("health endpoint", () => {
  it("returns service identity, time, and process uptime", async () => {
    const response = await fetch(`${baseUrl}/api/health`);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      status: "ok",
      service: "printvisual"
    });
    expect(new Date(body.timestamp).toString()).not.toBe("Invalid Date");
    expect(body.uptimeSeconds).toEqual(expect.any(Number));
    expect(body.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });
});
