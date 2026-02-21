export type RawEntry = {
  id: string;
  title?: string;
  duration?: number;
  view_count?: number;
  thumbnail?: string;
};

export type RawVideoJson = {
  title?: string;
  duration?: number;
  upload_date?: string;
  view_count?: number;
  thumbnails?: Array<{ url?: string; width?: number; height?: number }>;
  formats?: Array<{ language?: string; acodec?: string }>;
  subtitles?: Record<string, unknown[]>;
  automatic_captions?: Record<string, unknown[]>;
};

export type BuiltEpisode = {
  videoId: string;
  title: string;
  position: number;
  url: string;
  thumbnailUrl: string;
  durationSec: number;
  publishedAt: string;
  viewCount: number;
  audioLangs: string[];
  captionLangs: string[];
  hasFrenchDub: boolean;
  frenchAvailability: 'dub' | 'captions' | 'none';
  quiz: unknown[];
};

export function parseNdjson(raw: string): Array<Record<string, unknown>>;
export function normalizeUploadDate(uploadDate?: string): string;
export function parseEpisodeNumberFromTitle(title?: string): number | null;
export function extractLanguageTagsFromFormatText(formatOutput: string): string[];
export function extractAudioLangsFromVideoJson(videoJson: RawVideoJson): string[];
export function extractCaptionLangsFromVideoJson(videoJson: RawVideoJson): string[];
export function buildEpisode(input: {
  entry: RawEntry;
  videoJson: RawVideoJson;
  position: number;
  formatOutput: string;
  quiz?: unknown[];
}): BuiltEpisode;
