import { beforeEach, describe, expect, it } from 'vitest';
import {
  loadFavorites,
  loadPrefs,
  loadProgress,
  markEpisodeCompleted,
  toggleFavorite,
  touchEpisode
} from '../../src/features/preferences/storage';

class MemoryStorage implements Storage {
  private readonly map = new Map<string, string>();

  get length(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

describe('preferences storage', () => {
  beforeEach(() => {
    const localStorage = new MemoryStorage();
    Object.defineProperty(globalThis, 'window', {
      value: { localStorage },
      configurable: true,
      writable: true
    });
  });

  it('loads default prefs and updates progress', () => {
    expect(loadPrefs().playbackDefault).toBe('audio');
    expect(loadProgress()).toEqual({});

    const touched = touchEpisode('abc123', 42);
    expect(touched.abc123.lastSecond).toBe(42);
    expect(touched.abc123.completed).toBe(false);

    const completed = markEpisodeCompleted('abc123');
    expect(completed.abc123.completed).toBe(true);
  });

  it('toggles favorites', () => {
    expect(loadFavorites()).toEqual([]);
    expect(toggleFavorite('vid-1')).toEqual(['vid-1']);
    expect(toggleFavorite('vid-1')).toEqual([]);
  });
});
