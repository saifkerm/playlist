import { CatalogLanguageFilter, UserPrefs, UserProgress, UserQuizScores } from '../../types';

const PREFS_KEY = 'playlistStories:prefs:v1';
const PROGRESS_KEY = 'playlistStories:progress:v1';
const FAVORITES_KEY = 'playlistStories:favorites:v1';
const QUIZ_KEY = 'playlistStories:quiz:v1';
const CATALOG_LANGUAGE_FILTER_KEY = 'playlistStories:catalog-lang-filter:v1';

const defaultPrefs: UserPrefs = {
  playbackDefault: 'audio',
  preferredTextLang: 'fr',
  reduceMotion: false
};

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const loadPrefs = (): UserPrefs => {
  if (typeof window === 'undefined') {
    return defaultPrefs;
  }

  return {
    ...defaultPrefs,
    ...safeParse<UserPrefs>(window.localStorage.getItem(PREFS_KEY), defaultPrefs)
  };
};

export const savePrefs = (next: UserPrefs): void => {
  window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
};

export const loadProgress = (): UserProgress => {
  if (typeof window === 'undefined') {
    return {};
  }
  return safeParse<UserProgress>(window.localStorage.getItem(PROGRESS_KEY), {});
};

export const touchEpisode = (videoId: string, lastSecond = 0): UserProgress => {
  const progress = loadProgress();
  const previous = progress[videoId];
  const updated: UserProgress = {
    ...progress,
    [videoId]: {
      completed: previous?.completed ?? false,
      lastSecond,
      lastSeenAt: new Date().toISOString()
    }
  };

  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
  return updated;
};

export const markEpisodeCompleted = (videoId: string): UserProgress => {
  const progress = loadProgress();
  const previous = progress[videoId];

  const updated: UserProgress = {
    ...progress,
    [videoId]: {
      lastSecond: previous?.lastSecond ?? 0,
      completed: true,
      lastSeenAt: new Date().toISOString()
    }
  };

  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
  return updated;
};

export const loadFavorites = (): string[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  return safeParse<string[]>(window.localStorage.getItem(FAVORITES_KEY), []);
};

export const toggleFavorite = (videoId: string): string[] => {
  const favorites = new Set(loadFavorites());
  if (favorites.has(videoId)) {
    favorites.delete(videoId);
  } else {
    favorites.add(videoId);
  }

  const next = Array.from(favorites);
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
};

export const loadQuizScores = (): UserQuizScores => {
  if (typeof window === 'undefined') {
    return {};
  }

  return safeParse<UserQuizScores>(window.localStorage.getItem(QUIZ_KEY), {});
};

export const saveQuizScore = (videoId: string, score: number, total: number): UserQuizScores => {
  const scores = loadQuizScores();
  const next: UserQuizScores = {
    ...scores,
    [videoId]: {
      score,
      total,
      submittedAt: new Date().toISOString()
    }
  };

  window.localStorage.setItem(QUIZ_KEY, JSON.stringify(next));
  return next;
};

const isCatalogLanguageFilter = (value: unknown): value is CatalogLanguageFilter => {
  return value === 'all' || value === 'fr' || value === 'ar';
};

export const loadCatalogLanguageFilter = (): CatalogLanguageFilter => {
  if (typeof window === 'undefined') {
    return 'all';
  }

  const parsed = safeParse<unknown>(window.localStorage.getItem(CATALOG_LANGUAGE_FILTER_KEY), 'all');
  return isCatalogLanguageFilter(parsed) ? parsed : 'all';
};

export const saveCatalogLanguageFilter = (filter: CatalogLanguageFilter): void => {
  window.localStorage.setItem(CATALOG_LANGUAGE_FILTER_KEY, JSON.stringify(filter));
};
