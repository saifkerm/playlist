export type FrenchAvailability = 'dub' | 'captions' | 'none';
export type CatalogLanguage = 'fr' | 'ar';
export type CatalogLanguageFilter = 'all' | CatalogLanguage;

export type SourcePlaylist = {
  id: string;
  playlistId: string;
  sourceUrl: string;
  channelName: string;
  channelHandle: string;
  enabled: boolean;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export type Episode = {
  videoId: string;
  title: string;
  position: number;
  url: string;
  thumbnailUrl: string;
  durationSec: number;
  publishedAt: string;
  viewCount?: number;
  audioLangs: string[];
  captionLangs: string[];
  hasFrenchDub: boolean;
  frenchAvailability: FrenchAvailability;
  quiz?: QuizQuestion[];
};

export type PlaylistManifest = {
  id: string;
  playlistId: string;
  playlistTitle: string;
  channelName: string;
  channelHandle: string;
  sourceUrl: string;
  updatedAt: string;
  episodes: Episode[];
};

export type CatalogData = {
  updatedAt: string;
  playlists: PlaylistManifest[];
};

export type UserPrefs = {
  playbackDefault: 'audio' | 'video';
  preferredTextLang: 'fr';
  reduceMotion: boolean;
};

export type UserProgress = {
  [videoId: string]: {
    lastSecond: number;
    completed: boolean;
    lastSeenAt: string;
  };
};

export type UserQuizScores = {
  [videoId: string]: {
    score: number;
    total: number;
    submittedAt: string;
  };
};

export type Badge = {
  id: 'first_episode' | 'series_complete' | 'streak_3';
  label: string;
  unlocked: boolean;
};
