import {
  APP_SETTINGS_KEY,
  BrowserAppSettingsSchema,
  readBrowserAppSettings
} from './storage.js';
import type { BrowserAppSettings } from './storage.js';

interface AppApiRequestOptions extends RequestInit {
  timeout?: number;
}

interface PrintVisualApiClient {
  getAppApiUrl(path: string): string;
  requestAppApiJson<T>(path: string, options?: AppApiRequestOptions): Promise<T>;
  syncSettingsToAppApi(settings: unknown): void;
  getSettingsFromAppApi(timeout?: number): Promise<Record<string, unknown> | null>;
  saveSettingsToAppApi(settings: unknown, timeout?: number): Promise<unknown>;
}

declare global {
  interface Window {
    PrintVisualApi?: PrintVisualApiClient;
  }
}

export type Settings = BrowserAppSettings;
export type SettingsHydrationResult =
  | 'server'
  | 'imported-local'
  | 'empty'
  | 'fallback-local'
  | 'unavailable';

export function hasMeaningfulSettings(settings: unknown): settings is Settings {
  const parsed = BrowserAppSettingsSchema.safeParse(settings);
  return parsed.success && Object.keys(parsed.data).length > 0;
}

export function readLocalAppSettings(): Settings | null {
  return readBrowserAppSettings(localStorage);
}

export function getAppApiUrl(path: string): string {
  return window.PrintVisualApi?.getAppApiUrl(path) ?? '';
}

export async function fetchAppApiJson<T>(
  path: string,
  options: AppApiRequestOptions = {},
  timeout = 1500
): Promise<T | null> {
  const request = window.PrintVisualApi?.requestAppApiJson;
  if (!request) return null;
  return request<T>(path, { ...options, timeout });
}

export function syncSettingsToAppApi(settings: Settings): void {
  window.PrintVisualApi?.syncSettingsToAppApi(settings);
}

export async function hydrateSettingsFromAppApi(): Promise<SettingsHydrationResult> {
  const api = window.PrintVisualApi;
  if (!api?.getSettingsFromAppApi || !api.saveSettingsToAppApi) return 'unavailable';

  try {
    const serverSettings = await api.getSettingsFromAppApi(2500);
    if (hasMeaningfulSettings(serverSettings)) {
      localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(serverSettings));
      return 'server';
    }

    const localSettings = readLocalAppSettings();
    if (hasMeaningfulSettings(localSettings)) {
      await api.saveSettingsToAppApi(localSettings, 2500);
      return 'imported-local';
    }

    return 'empty';
  } catch {
    return 'fallback-local';
  }
}