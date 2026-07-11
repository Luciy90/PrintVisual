import { z } from 'zod';

export const APP_STORAGE_KEYS = [
  'printerCamsV2',
  'printerCamsV2Consent',
  'namedDrivValue',
  'dividerVisibility'
] as const;

export const APP_SETTINGS_KEY = APP_STORAGE_KEYS[0];
export const APP_CONSENT_KEY = APP_STORAGE_KEYS[1];
export const SETTINGS_EXPORT_VERSION = 1 as const;
export const MAX_SETTINGS_IMPORT_BYTES = 2 * 1024 * 1024;
export const SETTINGS_EXPORT_FILENAME = 'printerCamsV2_full_settings.json';

type AppStorageKey = (typeof APP_STORAGE_KEYS)[number];

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const NumericInputSchema = z.union([
  z.number().finite(),
  z.string().trim().regex(/^-?\d+(?:\.\d+)?$/)
]);

export const StoredCameraSchema = z
  .object({
    ip: z.string().max(255).default(''),
    stream: z.string().max(2048).default(''),
    name: z.string().max(255).default(''),
    mac: z.string().max(32).optional().default(''),
    lastSeenIp: z.string().max(255).optional().default(''),
    lastMacCheckAt: z.string().max(64).optional().default('')
  })
  .strip();

export const StoredCameraListSchema = z.array(StoredCameraSchema).max(512);

export const BrowserAppSettingsSchema = z
  .object({
    cameraOrder: StoredCameraListSchema.optional(),
    color1: z.string().max(64).optional(),
    color2: z.string().max(64).optional(),
    colorIntOver: NumericInputSchema.optional(),
    errorNotificationColor: z.string().max(64).optional(),
    systemNotificationColor: z.string().max(64).optional(),
    notificationOpacity: NumericInputSchema.optional(),
    toolbarIconRgb: z
      .object({
        r: z.number().finite(),
        g: z.number().finite(),
        b: z.number().finite()
      })
      .optional(),
    loader: z
      .object({
        hide: z.boolean().optional(),
        bgColor: z.string().max(64).optional(),
        opacity: NumericInputSchema.optional(),
        offFullCheckbox: z.boolean().optional()
      })
      .passthrough()
      .optional(),
    hideNotifications: z.boolean().optional(),
    grid: z
      .object({ columns: z.number().int().min(1).max(12).optional() })
      .passthrough()
      .optional(),
    header: z
      .object({
        text: z.string().max(255).optional(),
        hidden: z.boolean().optional(),
        bgColor: z.string().max(64).optional(),
        bgOpacity: NumericInputSchema.optional(),
        textColor: z.string().max(64).optional()
      })
      .passthrough()
      .optional(),
    dividerColor: z.string().max(64).optional(),
    dividerThickness: NumericInputSchema.optional(),
    dividerAlign: z.string().max(32).optional(),
    dividerWidth: NumericInputSchema.optional(),
    enableDividers: z.boolean().optional(),
    namedDriv: NumericInputSchema.optional(),
    interfaceWidth: NumericInputSchema.optional(),
    interfaceHeight: NumericInputSchema.optional(),
    enableWidthInput: z.boolean().optional(),
    streamToggles: z.record(z.string(), z.boolean()).optional()
  })
  .passthrough();

const DividerVisibilitySchema = z.record(z.string(), z.boolean());

const ImportEnvelopeSchema = z
  .object({
    schemaVersion: z.number().int().positive().optional(),
    settings: z.record(z.string(), z.unknown()).optional(),
    cameras: StoredCameraListSchema.optional()
  })
  .passthrough();

export type StoredCamera = z.infer<typeof StoredCameraSchema>;
export type BrowserAppSettings = z.infer<typeof BrowserAppSettingsSchema>;

export interface ParsedSettingsImport {
  schemaVersion: typeof SETTINGS_EXPORT_VERSION;
  settings: Partial<Record<AppStorageKey, unknown>>;
  cameras: StoredCamera[] | null;
}

export interface SettingsExport {
  schemaVersion: typeof SETTINGS_EXPORT_VERSION;
  exportedAt: string;
  settings: Partial<Record<AppStorageKey, unknown>>;
  cameras: StoredCamera[];
}

export type SettingsImportErrorCode =
  | 'file-too-large'
  | 'invalid-json'
  | 'unsafe-json'
  | 'invalid-format'
  | 'unsupported-version';

export class SettingsImportError extends Error {
  public constructor(
    public readonly code: SettingsImportErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'SettingsImportError';
  }
}

function assertSafeJson(value: unknown, depth = 0): void {
  if (depth > 64) {
    throw new SettingsImportError('unsafe-json', 'JSON nesting is too deep.');
  }

  if (Array.isArray(value)) {
    value.forEach(item => assertSafeJson(item, depth + 1));
    return;
  }

  if (value === null || typeof value !== 'object') return;

  for (const [key, child] of Object.entries(value)) {
    if (key === '__proto__' || key === 'prototype' || key === 'constructor') {
      throw new SettingsImportError('unsafe-json', `Unsafe JSON key: ${key}`);
    }
    assertSafeJson(child, depth + 1);
  }
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new SettingsImportError('invalid-json', 'The selected file is not valid JSON.');
  }
}

function parseOwnedSettings(raw: Record<string, unknown>): Partial<Record<AppStorageKey, unknown>> {
  const settings: Partial<Record<AppStorageKey, unknown>> = {};

  if (APP_SETTINGS_KEY in raw) {
    const parsed = BrowserAppSettingsSchema.safeParse(raw[APP_SETTINGS_KEY]);
    if (!parsed.success) {
      throw new SettingsImportError('invalid-format', 'printerCamsV2 has an invalid structure.');
    }
    settings[APP_SETTINGS_KEY] = parsed.data;
  }

  if (APP_CONSENT_KEY in raw) {
    const parsed = z.string().max(32).safeParse(raw[APP_CONSENT_KEY]);
    if (!parsed.success) {
      throw new SettingsImportError('invalid-format', 'Consent state has an invalid structure.');
    }
    settings[APP_CONSENT_KEY] = parsed.data;
  }

  if ('namedDrivValue' in raw) {
    const parsed = NumericInputSchema.safeParse(raw.namedDrivValue);
    if (!parsed.success) {
      throw new SettingsImportError('invalid-format', 'namedDrivValue has an invalid structure.');
    }
    settings.namedDrivValue = parsed.data;
  }

  if ('dividerVisibility' in raw) {
    const parsed = DividerVisibilitySchema.safeParse(raw.dividerVisibility);
    if (!parsed.success) {
      throw new SettingsImportError('invalid-format', 'dividerVisibility has an invalid structure.');
    }
    settings.dividerVisibility = parsed.data;
  }

  return settings;
}

export function parseSettingsImport(
  text: string,
  byteLength = new TextEncoder().encode(text).byteLength
): ParsedSettingsImport {
  if (byteLength > MAX_SETTINGS_IMPORT_BYTES) {
    throw new SettingsImportError('file-too-large', 'The selected settings file is too large.');
  }

  const json = parseJson(text);
  assertSafeJson(json);

  const envelope = ImportEnvelopeSchema.safeParse(json);
  if (!envelope.success) {
    throw new SettingsImportError('invalid-format', 'The selected file has an invalid settings format.');
  }

  if (
    envelope.data.schemaVersion !== undefined &&
    envelope.data.schemaVersion !== SETTINGS_EXPORT_VERSION
  ) {
    throw new SettingsImportError(
      'unsupported-version',
      `Unsupported settings version: ${envelope.data.schemaVersion}`
    );
  }

  return {
    schemaVersion: SETTINGS_EXPORT_VERSION,
    settings: parseOwnedSettings(envelope.data.settings ?? {}),
    cameras: envelope.data.cameras ?? null
  };
}

function parseJsonSafely(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export function readBrowserAppSettings(storage: StorageAdapter): BrowserAppSettings | null {
  const raw = storage.getItem(APP_SETTINGS_KEY);
  if (!raw) return null;

  const parsed = BrowserAppSettingsSchema.safeParse(parseJsonSafely(raw));
  return parsed.success ? parsed.data : null;
}

function serializeStorageValue(key: AppStorageKey, value: unknown): string {
  if (key === APP_CONSENT_KEY || key === 'namedDrivValue') return String(value);
  return JSON.stringify(value);
}

function restoreSnapshot(storage: StorageAdapter, snapshot: Map<AppStorageKey, string | null>): void {
  for (const key of APP_STORAGE_KEYS) {
    const value = snapshot.get(key) ?? null;
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
  }
}

export function applySettingsImport(
  storage: StorageAdapter,
  imported: ParsedSettingsImport
): BrowserAppSettings | null {
  const snapshot = new Map<AppStorageKey, string | null>(
    APP_STORAGE_KEYS.map(key => [key, storage.getItem(key)])
  );

  try {
    const settings = { ...imported.settings };
    if (imported.cameras) {
      const baseSettings =
        (settings[APP_SETTINGS_KEY] as BrowserAppSettings | undefined) ??
        readBrowserAppSettings(storage) ??
        {};
      settings[APP_SETTINGS_KEY] = {
        ...baseSettings,
        cameraOrder: imported.cameras
      } satisfies BrowserAppSettings;
    }

    for (const key of APP_STORAGE_KEYS) {
      if (!(key in settings)) continue;
      storage.setItem(key, serializeStorageValue(key, settings[key]));
    }

    return readBrowserAppSettings(storage);
  } catch (error) {
    restoreSnapshot(storage, snapshot);
    throw error;
  }
}

function readExportValue(storage: StorageAdapter, key: AppStorageKey): unknown {
  const raw = storage.getItem(key);
  if (raw === null) return undefined;
  if (key === APP_CONSENT_KEY || key === 'namedDrivValue') return raw;
  return parseJsonSafely(raw);
}

export function createSettingsExport(
  storage: StorageAdapter,
  cameras: readonly StoredCamera[],
  exportedAt = new Date()
): SettingsExport {
  const parsedCameras = StoredCameraListSchema.parse(cameras);
  const settings: Partial<Record<AppStorageKey, unknown>> = {};

  for (const key of APP_STORAGE_KEYS) {
    const value = readExportValue(storage, key);
    if (value !== undefined) settings[key] = value;
  }

  return {
    schemaVersion: SETTINGS_EXPORT_VERSION,
    exportedAt: exportedAt.toISOString(),
    settings,
    cameras: parsedCameras
  };
}

export function stringifySettingsExport(data: SettingsExport): string {
  return JSON.stringify(data, null, 2);
}

export function removeOwnedStorage(storage: StorageAdapter): void {
  APP_STORAGE_KEYS.forEach(key => storage.removeItem(key));
}