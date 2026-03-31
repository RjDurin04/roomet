import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { MS_PER_MINUTE, MINUTES_PER_HOUR, HOURS_PER_DAY } from '../constants';
import { formatRelativeTime } from '../utils';

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-31T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "Just now" for times less than 1 minute', () => {
    const now = Date.now();
    expect(formatRelativeTime(now - 30 * 1000)).toBe('Just now');
  });

  it('should return minutes for times less than 1 hour', () => {
    const now = Date.now();
    expect(formatRelativeTime(now - 5 * MS_PER_MINUTE)).toBe('5m ago');
    expect(formatRelativeTime(now - 59 * MS_PER_MINUTE)).toBe('59m ago');
  });

  it('should return hours for times less than 1 day', () => {
    const now = Date.now();
    expect(formatRelativeTime(now - 2 * MINUTES_PER_HOUR * MS_PER_MINUTE)).toBe('2h ago');
    expect(formatRelativeTime(now - 23 * MINUTES_PER_HOUR * MS_PER_MINUTE)).toBe('23h ago');
  });

  it('should return days for times more than 1 day', () => {
    const now = Date.now();
    expect(formatRelativeTime(now - 2 * HOURS_PER_DAY * MINUTES_PER_HOUR * MS_PER_MINUTE)).toBe('2d ago');
  });

  it('should handle future times as "Just now"', () => {
    const now = Date.now();
    expect(formatRelativeTime(now + 1000)).toBe('Just now');
  });
});
