export type PrinterCardStatus = 'ready' | 'printing' | 'error';

export interface PrinterCardData {
  status: PrinterCardStatus;
  bedTemperature: number | null;
  extruderTemperatures: readonly number[];
  progress: number;
  filename: string;
}

export type PrinterCardAnimation = 'printer-flash-ready' | 'printer-flash-error' | null;

const previousStateByCardId = new Map<string, PrinterCardStatus>();
const animationClasses = ['printer-flash-ready', 'printer-flash-error'] as const;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function readTemperature(value: unknown): number | null | undefined {
  if (value === null) return null;
  return isFiniteNumber(value) ? value : undefined;
}

export function parsePrinterCardData(value: unknown): PrinterCardData | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  const status = record.status;
  if (status !== 'ready' && status !== 'printing' && status !== 'error') return null;

  const bedTemperature = readTemperature(record.bedTemperature);
  if (bedTemperature === undefined || !Array.isArray(record.extruderTemperatures)) return null;
  if (!isFiniteNumber(record.progress) || typeof record.filename !== 'string') return null;

  const extruderTemperatures: number[] = [];
  for (const temperature of record.extruderTemperatures) {
    if (!isFiniteNumber(temperature)) return null;
    extruderTemperatures.push(temperature);
  }

  return {
    status,
    bedTemperature,
    extruderTemperatures,
    progress: record.progress,
    filename: record.filename
  };
}

export function normalizeProgress(progress: number): number {
  const percentage = progress >= 0 && progress <= 1 ? progress * 100 : progress;
  return Math.min(100, Math.max(0, percentage));
}

export function formatTemperature(temperature: number | null): string {
  if (temperature === null) return '—';
  const rounded = Math.round(temperature * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}°C`;
}

export function getPrinterCardAnimation(
  previousStatus: PrinterCardStatus | undefined,
  nextStatus: PrinterCardStatus
): PrinterCardAnimation {
  if (previousStatus === 'printing' && nextStatus === 'ready') return 'printer-flash-ready';
  if (previousStatus !== undefined && previousStatus !== 'error' && nextStatus === 'error') {
    return 'printer-flash-error';
  }
  return null;
}

function queryRequiredElement<T extends Element>(card: HTMLElement, selector: string): T | null {
  return card.querySelector<T>(selector);
}

function restartCardAnimation(card: HTMLElement, animation: PrinterCardAnimation): void {
  card.classList.remove(...animationClasses);
  if (!animation) return;
  void card.offsetWidth;
  card.classList.add(animation);
  card.addEventListener('animationend', () => card.classList.remove(animation), { once: true });
}

export function updatePrinterCard(cardId: string, input: unknown): boolean {
  const data = parsePrinterCardData(input);
  const card = document.getElementById(cardId);
  if (!data || !(card instanceof HTMLElement)) return false;

  const statusDot = queryRequiredElement<HTMLElement>(card, '.status-dot');
  const bedValue = queryRequiredElement<HTMLElement>(card, '[data-printer-bed-temperature]');
  const extruderValue = queryRequiredElement<HTMLElement>(card, '[data-printer-extruder-temperatures]');
  const percentage = queryRequiredElement<HTMLElement>(card, '[data-printer-progress-label]');
  const progressBar = queryRequiredElement<HTMLElement>(card, '[data-printer-progress-bar]');
  const progressFill = queryRequiredElement<HTMLElement>(card, '[data-printer-progress-fill]');
  const filename = queryRequiredElement<HTMLElement>(card, '[data-printer-filename]');
  if (!statusDot || !bedValue || !extruderValue || !percentage || !progressBar || !progressFill || !filename) {
    return false;
  }

  const progress = normalizeProgress(data.progress);
  const progressText = `${Math.round(progress)}%`;
  const isPrinting = data.status === 'printing';
  const previousStatus = previousStateByCardId.get(cardId);

  card.dataset.printerState = data.status;
  card.classList.toggle('is-printing', isPrinting);
  statusDot.classList.remove('initial', 'connect', 'warning', 'disconnected');
  statusDot.classList.add(data.status === 'ready' ? 'connect' : data.status === 'printing' ? 'warning' : 'disconnected');
  statusDot.title = data.status === 'ready' ? 'Готов' : data.status === 'printing' ? 'Печать' : 'Ошибка';

  bedValue.textContent = formatTemperature(data.bedTemperature);
  extruderValue.textContent = data.extruderTemperatures.length > 0
    ? data.extruderTemperatures.map(temperature => formatTemperature(temperature)).join(' / ')
    : '—';
  percentage.textContent = progressText;
  progressFill.style.width = `${progress}%`;
  progressBar.setAttribute('aria-valuenow', String(Math.round(progress)));
  progressBar.hidden = !isPrinting;
  filename.textContent = isPrinting && data.filename.trim() ? data.filename.trim() : '';
  filename.setAttribute('aria-hidden', String(!isPrinting));

  restartCardAnimation(card, getPrinterCardAnimation(previousStatus, data.status));
  previousStateByCardId.set(cardId, data.status);
  return true;
}

export function resetPrinterCardState(cardId?: string): void {
  if (cardId === undefined) previousStateByCardId.clear();
  else previousStateByCardId.delete(cardId);
}
