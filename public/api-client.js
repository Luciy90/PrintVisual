"use strict";
var PrintVisualApi = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/client/api.ts
  var api_exports = {};
  __export(api_exports, {
    fetchPrinterMacFromAppApi: () => fetchPrinterMacFromAppApi,
    getAppApiUrl: () => getAppApiUrl,
    getSettingsFromAppApi: () => getSettingsFromAppApi,
    requestAppApiJson: () => requestAppApiJson,
    saveSettingsToAppApi: () => saveSettingsToAppApi,
    scanNetworkWithAppApi: () => scanNetworkWithAppApi,
    syncSettingsToAppApi: () => syncSettingsToAppApi
  });
  var settingsSyncTimer = null;
  function getAppApiUrl(path) {
    if (!/^https?:$/.test(window.location.protocol)) return "";
    return `${window.location.origin}${path}`;
  }
  async function requestAppApiJson(path, options = {}) {
    const url = getAppApiUrl(path);
    if (!url) return null;
    const timeout = options.timeout ?? 1500;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const { timeout: _timeout, headers, ...fetchOptions } = options;
    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          ...headers || {}
        },
        ...fetchOptions,
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } finally {
      clearTimeout(timer);
    }
  }
  function syncSettingsToAppApi(settings) {
    if (!getAppApiUrl("/api/settings")) return;
    if (settingsSyncTimer) clearTimeout(settingsSyncTimer);
    settingsSyncTimer = setTimeout(() => {
      saveSettingsToAppApi(settings, 2500).catch(() => {
      });
    }, 350);
  }
  async function getSettingsFromAppApi(timeout = 2500) {
    return requestAppApiJson("/api/settings", { timeout });
  }
  async function saveSettingsToAppApi(settings, timeout = 2500) {
    return requestAppApiJson("/api/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
      timeout
    });
  }
  async function fetchPrinterMacFromAppApi(host, timeout) {
    return requestAppApiJson(
      `/api/printers/mac?address=${encodeURIComponent(host)}`,
      { timeout: timeout + 400 }
    );
  }
  async function scanNetworkWithAppApi(subnets, options = {}) {
    const data = await requestAppApiJson("/api/network/scan", {
      method: "POST",
      body: JSON.stringify({
        subnets,
        concurrency: options.concurrency || 24,
        probeTimeoutMs: options.probeTimeout || 700,
        macTimeoutMs: options.macTimeout || 900
      }),
      timeout: options.scanTimeout || Math.max(12e3, subnets.length * 9e3)
    });
    return Array.isArray(data?.devices) ? data.devices : [];
  }
  return __toCommonJS(api_exports);
})();
//# sourceMappingURL=api-client.js.map
