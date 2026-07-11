import { describe, expect, it } from 'vitest';
import {
  APP_SETTINGS_KEY,
  MAX_SETTINGS_IMPORT_BYTES,
  SettingsImportError,
  applySettingsImport,
  createSettingsExport,
  parseSettingsImport,
  readBrowserAppSettings,
  removeOwnedStorage,
  stringifySettingsExport
} from '../src/client/storage.js';
import type { StorageAdapter } from '../src/client/storage.js';
import {
  createSettingsExportFile,
  importSettingsFile
} from '../src/client/settingsTransfer.js';
import {
  acceptStorageConsent,
  hasStorageConsent
} from '../src/client/modals.js';

class MemoryStorage implements StorageAdapter {
  protected readonly values = new Map<string, string>();

  public constructor(initial: Record<string, string> = {}) {
    Object.entries(initial).forEach(([key, value]) => this.values.set(key, value));
  }

  public getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  public removeItem(key: string): void {
    this.values.delete(key);
  }
}

class FailingStorage extends MemoryStorage {
  private shouldFail = true;

  public override setItem(key: string, value: string): void {
    if (key === 'dividerVisibility' && this.shouldFail) {
      this.shouldFail = false;
      throw new Error('simulated storage failure');
    }
    super.setItem(key, value);
  }
}

const camera = {
  ip: '192.168.1.25',
  stream: ':8080/?action=stream',
  name: 'Printer',
  mac: 'AA:BB:CC:DD:EE:FF',
  lastSeenIp: '192.168.1.25',
  lastMacCheckAt: '2026-07-11T10:00:00.000Z'
};

describe('client settings storage', () => {
  it('imports the legacy envelope without touching unrelated storage keys', () => {
    const storage = new MemoryStorage({
      unrelated: 'keep-me',
      printerCamsV2: JSON.stringify({ color1: '#000000' })
    });
    const imported = parseSettingsImport(
      JSON.stringify({
        settings: {
          printerCamsV2: { color1: '#ffffff' },
          printerCamsV2Consent: 'yes',
          unrelated: 'must-be-ignored'
        },
        cameras: [camera]
      })
    );

    const settings = applySettingsImport(storage, imported);

    expect(storage.getItem('unrelated')).toBe('keep-me');
    expect(storage.getItem('printerCamsV2Consent')).toBe('yes');
    expect(settings?.color1).toBe('#ffffff');
    expect(settings?.cameraOrder).toEqual([camera]);
  });

  it('rejects malformed, oversized, unsafe, and unsupported imports', () => {
    expect(() => parseSettingsImport('{')).toThrowError(
      expect.objectContaining<Partial<SettingsImportError>>({ code: 'invalid-json' })
    );
    expect(() => parseSettingsImport('{}', MAX_SETTINGS_IMPORT_BYTES + 1)).toThrowError(
      expect.objectContaining<Partial<SettingsImportError>>({ code: 'file-too-large' })
    );
    expect(() =>
      parseSettingsImport('{"settings":{"__proto__":{"polluted":true}}}')
    ).toThrowError(expect.objectContaining<Partial<SettingsImportError>>({ code: 'unsafe-json' }));
    expect(() => parseSettingsImport('{"schemaVersion":2}')).toThrowError(
      expect.objectContaining<Partial<SettingsImportError>>({ code: 'unsupported-version' })
    );
  });

  it('rolls back all owned keys when applying an import fails', () => {
    const original = JSON.stringify({ color1: '#123456' });
    const storage = new FailingStorage({
      printerCamsV2: original,
      dividerVisibility: JSON.stringify({ first: true })
    });
    const imported = parseSettingsImport(
      JSON.stringify({
        settings: {
          printerCamsV2: { color1: '#ffffff' },
          dividerVisibility: { second: false }
        }
      })
    );

    expect(() => applySettingsImport(storage, imported)).toThrow('simulated storage failure');
    expect(storage.getItem(APP_SETTINGS_KEY)).toBe(original);
    expect(storage.getItem('dividerVisibility')).toBe(JSON.stringify({ first: true }));
  });

  it('exports only application-owned keys and round-trips the current format', () => {
    const storage = new MemoryStorage({
      printerCamsV2: JSON.stringify({ color1: '#abcdef', cameraOrder: [camera] }),
      printerCamsV2Consent: 'yes',
      unrelated: 'secret'
    });
    const exported = createSettingsExport(storage, [camera], new Date('2026-07-11T10:00:00.000Z'));

    expect(exported.settings).not.toHaveProperty('unrelated');
    expect(exported.exportedAt).toBe('2026-07-11T10:00:00.000Z');

    const target = new MemoryStorage({ unrelated: 'still-here' });
    applySettingsImport(target, parseSettingsImport(stringifySettingsExport(exported)));

    expect(target.getItem('unrelated')).toBe('still-here');
    expect(readBrowserAppSettings(target)?.cameraOrder).toEqual([camera]);
  });

  it('removes only application-owned keys', () => {
    const storage = new MemoryStorage({
      printerCamsV2: '{}',
      printerCamsV2Consent: 'yes',
      namedDrivValue: '0.9',
      dividerVisibility: '{}',
      unrelated: 'keep-me'
    });

    removeOwnedStorage(storage);

    expect(storage.getItem('printerCamsV2')).toBeNull();
    expect(storage.getItem('printerCamsV2Consent')).toBeNull();
    expect(storage.getItem('namedDrivValue')).toBeNull();
    expect(storage.getItem('dividerVisibility')).toBeNull();
    expect(storage.getItem('unrelated')).toBe('keep-me');
  });
  it('validates file size before reading and creates a compatible export file', async () => {
    let wasRead = false;
    const oversizedFile = {
      size: MAX_SETTINGS_IMPORT_BYTES + 1,
      async text(): Promise<string> {
        wasRead = true;
        return '{}';
      }
    };

    await expect(importSettingsFile(oversizedFile, new MemoryStorage())).rejects.toMatchObject({
      code: 'file-too-large'
    });
    expect(wasRead).toBe(false);

    const storage = new MemoryStorage({ printerCamsV2: JSON.stringify({ cameraOrder: [camera] }) });
    const file = createSettingsExportFile(
      storage,
      [camera],
      new Date('2026-07-11T10:00:00.000Z')
    );

    expect(file.filename).toBe('printerCamsV2_full_settings.json');
    expect(file.mimeType).toBe('application/json');
    expect(parseSettingsImport(file.content).cameras).toEqual([camera]);
  });
  it('stores consent only under the application consent key', () => {
    const storage = new MemoryStorage({ unrelated: 'keep-me' });

    expect(hasStorageConsent(storage)).toBe(false);
    acceptStorageConsent(storage);

    expect(hasStorageConsent(storage)).toBe(true);
    expect(storage.getItem('printerCamsV2Consent')).toBe('yes');
    expect(storage.getItem('unrelated')).toBe('keep-me');
  });
});
