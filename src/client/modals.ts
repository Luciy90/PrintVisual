import {
  APP_CONSENT_KEY,
  removeOwnedStorage
} from './storage.js';
import type { StorageAdapter } from './storage.js';

export type Cleanup = () => void;

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    element => element.tabIndex >= 0 && !element.hidden
  );
}

function trapFocus(root: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;
  const focusable = getFocusableElements(root);
  if (focusable.length === 0) {
    event.preventDefault();
    root.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable.at(-1);
  const active = root.ownerDocument.activeElement;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first?.focus();
  }
}

export interface HelpModalElements {
  root: HTMLElement;
  dialog: HTMLElement;
  openButton: HTMLElement;
  closeButton: HTMLElement;
}

export function initializeHelpModal(
  elements: HelpModalElements,
  transitionMs = 330
): Cleanup {
  const document = elements.root.ownerDocument;
  let returnFocus: HTMLElement | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

  const isOpen = (): boolean => elements.root.getAttribute('aria-hidden') === 'false';

  const show = (): void => {
    if (closeTimer !== null) clearTimeout(closeTimer);
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : elements.openButton;
    elements.root.setAttribute('aria-hidden', 'false');
    elements.root.classList.remove('hidden', 'invisible', 'opacity-0');
    elements.root.classList.add('flex');
    elements.dialog.classList.remove('modal-fade-out');
    elements.dialog.classList.add('modal-fade-in');
    requestAnimationFrame(() => elements.root.classList.add('opacity-100'));
    (getFocusableElements(elements.root)[0] ?? elements.closeButton).focus();
  };

  const hide = (): void => {
    if (!isOpen()) return;
    elements.dialog.classList.remove('modal-fade-in');
    elements.dialog.classList.add('modal-fade-out');
    elements.root.classList.remove('opacity-100');
    closeTimer = setTimeout(() => {
      elements.root.classList.remove('flex');
      elements.root.classList.add('invisible', 'opacity-0');
      elements.root.setAttribute('aria-hidden', 'true');
      returnFocus?.focus();
      returnFocus = null;
    }, transitionMs);
  };

  const onBackdrop = (event: MouseEvent): void => {
    if (event.target === elements.root) hide();
  };
  const onKeydown = (event: KeyboardEvent): void => {
    if (!isOpen()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      hide();
      return;
    }
    trapFocus(elements.root, event);
  };

  elements.openButton.addEventListener('click', show);
  elements.closeButton.addEventListener('click', hide);
  elements.root.addEventListener('mousedown', onBackdrop);
  document.addEventListener('keydown', onKeydown);

  return () => {
    if (closeTimer !== null) clearTimeout(closeTimer);
    elements.openButton.removeEventListener('click', show);
    elements.closeButton.removeEventListener('click', hide);
    elements.root.removeEventListener('mousedown', onBackdrop);
    document.removeEventListener('keydown', onKeydown);
  };
}

export function hasStorageConsent(storage: StorageAdapter): boolean {
  return storage.getItem(APP_CONSENT_KEY) === 'yes';
}

export function acceptStorageConsent(storage: StorageAdapter): void {
  storage.setItem(APP_CONSENT_KEY, 'yes');
}

export interface ConsentState {
  allowLocalStorage: boolean;
}

export interface ConsentModalOptions {
  root: HTMLElement;
  allowButton: HTMLElement;
  denyButton: HTMLElement;
  loader: HTMLElement | null;
  storage: StorageAdapter;
  state: ConsentState;
  toggleSections(showStart: boolean): void;
  onAccepted(): void | Promise<void>;
  onDenied(): void;
  onError?(error: unknown): void;
}

export function initializeConsentModal(options: ConsentModalOptions): Cleanup {
  const document = options.root.ownerDocument;

  const setLoaderVisible = (visible: boolean): void => {
    if (!options.loader) return;
    options.loader.classList.toggle('hidden', !visible);
    options.loader.style.display = visible ? 'flex' : 'none';
    options.loader.style.opacity = visible ? '1' : '0';
  };

  const hide = (): void => {
    options.root.classList.add('hidden');
    options.root.setAttribute('aria-hidden', 'true');
  };

  const show = (): void => {
    options.root.classList.remove('hidden');
    options.root.setAttribute('aria-hidden', 'false');
    options.toggleSections(true);
    setLoaderVisible(false);
    (getFocusableElements(options.root)[0] ?? options.allowButton).focus();
  };

  const onAllow = (): void => {
    options.state.allowLocalStorage = true;
    acceptStorageConsent(options.storage);
    hide();
    options.toggleSections(false);
    setLoaderVisible(true);
    void Promise.resolve(options.onAccepted()).catch(error => options.onError?.(error));
  };

  const onDeny = (): void => {
    options.state.allowLocalStorage = false;
    options.onDenied();
  };

  const onKeydown = (event: KeyboardEvent): void => {
    if (options.root.getAttribute('aria-hidden') === 'true') return;
    trapFocus(options.root, event);
  };

  if (hasStorageConsent(options.storage)) {
    options.state.allowLocalStorage = true;
    options.toggleSections(false);
    hide();
  } else {
    options.state.allowLocalStorage = false;
    show();
  }

  options.allowButton.addEventListener('click', onAllow);
  options.denyButton.addEventListener('click', onDeny);
  document.addEventListener('keydown', onKeydown);

  return () => {
    options.allowButton.removeEventListener('click', onAllow);
    options.denyButton.removeEventListener('click', onDeny);
    document.removeEventListener('keydown', onKeydown);
  };
}

export interface ResetModalOptions {
  root: HTMLElement;
  openButton: HTMLElement;
  cancelButton: HTMLElement;
  confirmButton: HTMLElement;
  storage: StorageAdapter;
  beforeOpen?(): void;
  afterReset?(): void;
}

export function initializeResetModal(options: ResetModalOptions): Cleanup {
  const document = options.root.ownerDocument;
  let returnFocus: HTMLElement | null = null;

  const show = (): void => {
    options.beforeOpen?.();
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : options.openButton;
    options.root.classList.remove('hidden');
    options.root.setAttribute('aria-hidden', 'false');
    options.cancelButton.focus();
  };

  const hide = (): void => {
    options.root.classList.add('hidden');
    options.root.setAttribute('aria-hidden', 'true');
    returnFocus?.focus();
    returnFocus = null;
  };

  const confirm = (): void => {
    removeOwnedStorage(options.storage);
    hide();
    options.afterReset?.();
  };

  const onBackdrop = (event: MouseEvent): void => {
    if (event.target === options.root) hide();
  };
  const onKeydown = (event: KeyboardEvent): void => {
    if (options.root.getAttribute('aria-hidden') === 'true') return;
    if (event.key === 'Escape') {
      event.preventDefault();
      hide();
      return;
    }
    trapFocus(options.root, event);
  };

  options.openButton.addEventListener('click', show);
  options.cancelButton.addEventListener('click', hide);
  options.confirmButton.addEventListener('click', confirm);
  options.root.addEventListener('mousedown', onBackdrop);
  document.addEventListener('keydown', onKeydown);

  return () => {
    options.openButton.removeEventListener('click', show);
    options.cancelButton.removeEventListener('click', hide);
    options.confirmButton.removeEventListener('click', confirm);
    options.root.removeEventListener('mousedown', onBackdrop);
    document.removeEventListener('keydown', onKeydown);
  };
}

export interface ImportExportPanelElements {
  panel: HTMLElement;
  buttonBlock: HTMLElement;
  applyButton: HTMLElement;
  resetButton: HTMLElement;
}

export function showImportExportPanel(elements: ImportExportPanelElements): void {
  elements.buttonBlock.style.display = 'none';
  elements.panel.style.display = 'block';
  elements.applyButton.classList.add('btn-disabled');
  elements.resetButton.classList.add('btn-disabled');
  requestAnimationFrame(() => {
    elements.panel.classList.remove(
      'opacity-0',
      'pointer-events-none',
      'translate-y-10',
      'scale-95'
    );
    elements.panel.classList.add('opacity-100', 'pointer-events-auto');
  });
}

export function hideImportExportPanel(elements: ImportExportPanelElements): void {
  elements.panel.classList.remove('opacity-100', 'pointer-events-auto');
  elements.panel.classList.add(
    'opacity-0',
    'pointer-events-none',
    'translate-y-10',
    'scale-95'
  );
  elements.applyButton.classList.remove('btn-disabled');
  elements.resetButton.classList.remove('btn-disabled');
  setTimeout(() => {
    elements.panel.style.display = 'none';
    elements.buttonBlock.style.display = '';
  }, 400);
}
