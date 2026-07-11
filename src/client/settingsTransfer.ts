import {
  MAX_SETTINGS_IMPORT_BYTES,
  SETTINGS_EXPORT_FILENAME,
  SettingsImportError,
  applySettingsImport,
  createSettingsExport,
  parseSettingsImport,
  stringifySettingsExport
} from './storage.js';
import type {
  BrowserAppSettings,
  StorageAdapter,
  StoredCamera
} from './storage.js';

export interface SettingsFileSource {
  readonly size: number;
  text(): Promise<string>;
}

export interface SettingsExportFile {
  filename: typeof SETTINGS_EXPORT_FILENAME;
  mimeType: 'application/json';
  content: string;
}

export async function importSettingsFile(
  file: SettingsFileSource,
  storage: StorageAdapter
): Promise<BrowserAppSettings | null> {
  if (file.size > MAX_SETTINGS_IMPORT_BYTES) {
    throw new SettingsImportError('file-too-large', 'The selected settings file is too large.');
  }

  const text = await file.text();
  const imported = parseSettingsImport(text, file.size);
  return applySettingsImport(storage, imported);
}

export function createSettingsExportFile(
  storage: StorageAdapter,
  cameras: readonly StoredCamera[],
  exportedAt = new Date()
): SettingsExportFile {
  return {
    filename: SETTINGS_EXPORT_FILENAME,
    mimeType: 'application/json',
    content: stringifySettingsExport(createSettingsExport(storage, cameras, exportedAt))
  };
}
