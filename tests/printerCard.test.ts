import { describe, expect, it } from 'vitest';
import {
  formatTemperature,
  getPrinterCardAnimation,
  normalizeProgress,
  parsePrinterCardData
} from '../src/client/printerCard.js';

describe('printer card telemetry', () => {
  it('validates the backend view model without unsafe casts', () => {
    expect(
      parsePrinterCardData({
        status: 'printing',
        bedTemperature: 59.6,
        extruderTemperatures: [220, 214.8],
        progress: 0.425,
        filename: 'parts/bracket.gcode'
      })
    ).toEqual({
      status: 'printing',
      bedTemperature: 59.6,
      extruderTemperatures: [220, 214.8],
      progress: 0.425,
      filename: 'parts/bracket.gcode'
    });

    expect(parsePrinterCardData({ status: 'paused' })).toBeNull();
    expect(
      parsePrinterCardData({
        status: 'ready',
        bedTemperature: 25,
        extruderTemperatures: ['hot'],
        progress: 0,
        filename: ''
      })
    ).toBeNull();
  });

  it('supports Moonraker fractions and pre-normalized percentages', () => {
    expect(normalizeProgress(0.425)).toBe(42.5);
    expect(normalizeProgress(42.5)).toBe(42.5);
    expect(normalizeProgress(-5)).toBe(0);
    expect(normalizeProgress(140)).toBe(100);
  });

  it('formats one or several temperatures compactly', () => {
    expect(formatTemperature(220)).toBe('220°C');
    expect(formatTemperature(214.84)).toBe('214.8°C');
    expect(formatTemperature(null)).toBe('—');
  });

  it('detects only the required state transitions', () => {
    expect(getPrinterCardAnimation('printing', 'ready')).toBe('printer-flash-ready');
    expect(getPrinterCardAnimation('ready', 'error')).toBe('printer-flash-error');
    expect(getPrinterCardAnimation('printing', 'error')).toBe('printer-flash-error');
    expect(getPrinterCardAnimation(undefined, 'error')).toBeNull();
    expect(getPrinterCardAnimation('error', 'error')).toBeNull();
    expect(getPrinterCardAnimation('ready', 'ready')).toBeNull();
  });
});
