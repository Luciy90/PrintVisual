export interface Settings {
  color1: string;
  color2: string;
  colorIntOver: number;
  errorNotificationColor: string;
  systemNotificationColor: string;
  notificationOpacity: string;
  loader: {
    hide: boolean;
    bgColor: string;
    opacity: string;
    offFullCheckbox: boolean;
  };
  hideNotifications: boolean;
  grid: {
    columns: number;
  };
  header: {
    text: string;
    hidden: boolean;
    bgColor: string;
    bgOpacity: number;
    textColor: string;
  };
  dividerColor: string;
  dividerThickness: number;
  dividerAlign: string;
  dividerWidth: number;
  enableDividers: boolean;
  namedDriv: number;
  interfaceWidth: number;
  interfaceHeight: number;
  enableWidthInput: boolean;
}

export function hasMeaningfulSettings(settings: any): settings is Settings {
  return settings && typeof settings === 'object' && Object.keys(settings).length > 0;
}

export function readLocalAppSettings(): Settings | null {
  const raw = localStorage.getItem('printerCamsV2');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getAppApiUrl(path: string): string {
  return (window as any).PrintVisualApi?.getAppApiUrl?.(path) || '';
}

export async function fetchAppApiJson<T>(path: string, options: any = {}, timeout = 1500): Promise<T | null> {
  return (window as any).PrintVisualApi?.requestAppApiJson?.(path, { ...options, timeout }) || null;
}

export function syncSettingsToAppApi(settings: Settings): void {
  (window as any).PrintVisualApi?.syncSettingsToAppApi?.(settings);
}

export async function hydrateSettingsFromAppApi(): Promise<'server' | 'imported-local' | 'empty' | 'fallback-local'> {
  const api = (window as any).PrintVisualApi;
  if (!api?.getSettingsFromAppApi || !api?.saveSettingsToAppApi) return 'unavailable' as any;

  try {
    const serverSettings = await api.getSettingsFromAppApi(2500);
    if (hasMeaningfulSettings(serverSettings)) {
      localStorage.setItem('printerCamsV2', JSON.stringify(serverSettings));
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
