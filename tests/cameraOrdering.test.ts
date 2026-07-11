import { describe, expect, it } from 'vitest';
import { reorderCameraList } from '../src/client/cameraOrdering.js';

describe('camera ordering', () => {
  it('moves one item without mutating the original list', () => {
    const original = ['first', 'second', 'third'];

    expect(reorderCameraList(original, 0, 2)).toEqual(['second', 'third', 'first']);
    expect(original).toEqual(['first', 'second', 'third']);
  });

  it('keeps the list intact for invalid or identical positions', () => {
    const original = ['first', 'second'];

    expect(reorderCameraList(original, -1, 1)).toEqual(original);
    expect(reorderCameraList(original, 0, 0)).toEqual(original);
    expect(reorderCameraList(original, 0, 3)).toEqual(original);
  });
});
