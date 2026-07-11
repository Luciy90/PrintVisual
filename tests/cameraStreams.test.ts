import { describe, expect, it } from 'vitest';
import {
  getCameraStreamUrl,
  getStreamToggleState,
  setStreamToggleState
} from '../src/client/cameraStreams.js';
import type { StorageAdapter } from '../src/client/storage.js';

class MemoryStorage implements StorageAdapter {
  private readonly values = new Map<string, string>();

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

describe('camera streams', () => {
  it('preserves the legacy stream URL convention', () => {
    expect(getCameraStreamUrl('192.168.1.10:81', ':8080/?action=stream')).toBe(
      'http://192.168.1.10:8080/?action=stream'
    );
    expect(getCameraStreamUrl('192.168.1.10', '192.168.1.10:8080/stream')).toBe(
      'http://192.168.1.10:8080/stream'
    );
    expect(getCameraStreamUrl('', ':8080/stream')).toBe('');
  });

  it('persists individual stream toggle states without removing settings', () => {
    const storage = new MemoryStorage();
    storage.setItem('printerCamsV2', JSON.stringify({ color1: '#abcdef' }));

    expect(getStreamToggleState(storage, 'printer-1')).toBe(true);
    setStreamToggleState(storage, 'printer-1', false);

    expect(getStreamToggleState(storage, 'printer-1')).toBe(false);
    expect(JSON.parse(storage.getItem('printerCamsV2') ?? '{}')).toMatchObject({
      color1: '#abcdef',
      streamToggles: { 'printer-1': false }
    });
  });
});
