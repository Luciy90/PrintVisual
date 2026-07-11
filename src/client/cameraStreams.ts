import { APP_SETTINGS_KEY, readBrowserAppSettings } from './storage.js';
import type { StorageAdapter } from './storage.js';

const BLANK_IMAGE_SOURCE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export interface StreamImageState {
  image: HTMLImageElement;
  source: string;
}

function normalizeStreamPath(stream: string): string {
  if (!stream) return '';
  if (stream.startsWith(':') || stream.startsWith('/')) return stream;
  const portIndex = stream.indexOf(':');
  return portIndex >= 0 ? stream.slice(portIndex) : stream;
}

export function getCameraStreamUrl(address: string, stream: string): string {
  const host = address.trim().split(':')[0] ?? '';
  const path = normalizeStreamPath(stream.trim());
  return host ? `http://${host}${path}` : '';
}

export function getStreamToggleState(storage: StorageAdapter, cameraId: string): boolean {
  const settings = readBrowserAppSettings(storage);
  return settings?.streamToggles?.[cameraId] ?? true;
}

export function setStreamToggleState(
  storage: StorageAdapter,
  cameraId: string,
  enabled: boolean
): void {
  const settings = readBrowserAppSettings(storage) ?? {};
  storage.setItem(
    APP_SETTINGS_KEY,
    JSON.stringify({
      ...settings,
      streamToggles: {
        ...settings.streamToggles,
        [cameraId]: enabled
      }
    })
  );
}

export function setImageStreamEnabled(
  image: HTMLImageElement,
  enabled: boolean
): void {
  if (enabled) {
    const originalSource = image.dataset.originalSrc;
    if (originalSource) {
      image.src = originalSource;
      delete image.dataset.originalSrc;
    }
    image.closest<HTMLElement>('.camera-box')?.classList.remove('stream-disabled');
    return;
  }

  if (image.src && !image.src.startsWith('data:')) {
    image.dataset.originalSrc = image.src;
    image.src = BLANK_IMAGE_SOURCE;
  }
  image.closest<HTMLElement>('.camera-box')?.classList.add('stream-disabled');
}

export function stopCameraStreams(images: Iterable<HTMLImageElement>): StreamImageState[] {
  const states: StreamImageState[] = [];
  for (const image of images) {
    if (!image.src || image.src.startsWith('data:')) continue;
    states.push({ image, source: image.src });
    image.src = BLANK_IMAGE_SOURCE;
  }
  return states;
}

export function restoreCameraStreams(states: readonly StreamImageState[]): Promise<void> {
  return Promise.all(
    states.map(
      state =>
        new Promise<void>(resolve => {
          const onComplete = (): void => {
            state.image.removeEventListener('load', onComplete);
            state.image.removeEventListener('error', onComplete);
            resolve();
          };
          const separator = state.source.includes('?') ? '&' : '?';
          state.image.addEventListener('load', onComplete, { once: true });
          state.image.addEventListener('error', onComplete, { once: true });
          state.image.src = `${state.source}${separator}_t=${Date.now()}`;
        })
    )
  ).then(() => undefined);
}
