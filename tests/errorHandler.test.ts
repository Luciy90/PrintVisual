import http from "node:http";
import type { AddressInfo } from "node:net";
import express from "express";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  errorHandler,
  HttpError,
  notFoundHandler
} from "../src/middleware/errorHandler.ts";

let server: http.Server;
let baseUrl = "";

beforeAll(async () => {
  const app = express();
  app.get("/validation", (_req, _res, next) => {
    try {
      z.string().parse(42);
    } catch (error: unknown) {
      next(error);
    }
  });
  app.get("/expected", (_req, _res, next) => {
    next(new HttpError(409, "Expected conflict", { resource: "printer" }));
  });
  app.get("/unexpected", (_req, _res, next) => {
    next(new Error("sensitive internal failure"));
  });
  app.use(notFoundHandler);
  app.use(errorHandler);

  server = http.createServer(app);
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

describe("error middleware", () => {
  it("maps Zod errors to a safe validation response", async () => {
    const response = await fetch(`${baseUrl}/validation`);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "validation_error",
      message: "Request validation failed"
    });
  });

  it("preserves expected HttpError status and details", async () => {
    const response = await fetch(`${baseUrl}/expected`);

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "request_error",
      message: "Expected conflict",
      details: { resource: "printer" }
    });
  });

  it("does not expose unexpected exception messages", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      const response = await fetch(`${baseUrl}/unexpected`);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toEqual({
        error: "internal_error",
        message: "Unexpected server error"
      });
      expect(JSON.stringify(body)).not.toContain("sensitive internal failure");
      expect(consoleError).toHaveBeenCalledOnce();
    } finally {
      consoleError.mockRestore();
    }
  });

  it("maps unmatched routes to a 404 response", async () => {
    const response = await fetch(`${baseUrl}/missing`);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      error: "request_error",
      message: "Route not found: GET /missing"
    });
  });
});
