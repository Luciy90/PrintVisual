export function debounce(func: Function, delay: number) {
  let timeout: any;
  return function(this: any, ...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

export function throttle(func: Function, delay: number) {
  let lastCall = 0;
  let timeoutId: any;
  let lastArgs: any[];

  return function(this: any, ...args: any[]) {
    const now = Date.now();
    const remaining = delay - (now - lastCall);

    lastArgs = args;
    if (remaining <= 0) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastCall = now;
      func.apply(this, args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        func.apply(this, lastArgs);
      }, remaining);
    }
  };
}

export function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const normalizedHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalizedHex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb), min = Math.min(nr, ng, nb);
  let h, s, v = max;

  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case nr: h = (ng - nb) / d + (ng < nb ? 6 : 0); break;
      case ng: h = (nb - nr) / d + 2; break;
      case nb: h = (nr - ng) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return [h * 360, s * 100, v * 100];
}

export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  let normalizedH = h % 360;
  normalizedH = normalizedH < 0 ? 360 + normalizedH : normalizedH;
  normalizedH /= 60;
  const normalizedS = s / 100;
  const normalizedV = v / 100;

  const i = Math.floor(normalizedH);
  const f = normalizedH - i;
  const p = normalizedV * (1 - normalizedS);
  const q = normalizedV * (1 - f * normalizedS);
  const t = normalizedV * (1 - (1 - f) * normalizedS);

  let r, g, b;
  switch(i) {
    case 0: r = normalizedV; g = t; b = p; break;
    case 1: r = q; g = normalizedV; b = p; break;
    case 2: r = p; g = normalizedV; b = t; break;
    case 3: r = p; g = q; b = normalizedV; break;
    case 4: r = t; g = p; b = normalizedV; break;
    case 5: r = normalizedV; g = p; b = q; break;
    default: r = g = b = 0; break;
  }

  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255)
  ];
}

export function hexToRgbStr(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return `${rgb.r} ${rgb.g} ${rgb.b}`;
}

export function parseRGB(rgbStr: string) {
  const parts = rgbStr.split(/\s+/).map(Number);
  if (parts.length === 3 && parts.every(n => !isNaN(n) && n >= 0 && n <= 255)) {
    return { r: parts[0], g: parts[1], b: parts[2] };
  }
  return null;
}
