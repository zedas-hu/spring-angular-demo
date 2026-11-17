import { describe, expect, it } from 'vitest';
import { formatDuration } from './tools';

describe('formatDuration', () => {
  it('formats milliseconds as minutes and zero-padded seconds', () => {
    expect(formatDuration(125000)).toBe('2:05');
  });

  it('returns an empty string for a missing or zero duration', () => {
    expect(formatDuration(null)).toBe('');
    expect(formatDuration(0)).toBe('');
  });
});
