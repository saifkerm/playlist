const LANGUAGE_TAG_REGEX = /\[([a-z]{2}(?:-[A-Z]{2})?)\]/g;
const EPISODE_NUMBER_REGEX = /\b(?:ep|episode)\.?\s*(\d{1,3})\b/i;

export const parseNdjson = (raw) => {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
};

export const normalizeUploadDate = (uploadDate) => {
  if (!uploadDate || uploadDate.length !== 8) {
    return new Date().toISOString();
  }

  const year = uploadDate.slice(0, 4);
  const month = uploadDate.slice(4, 6);
  const day = uploadDate.slice(6, 8);
  return `${year}-${month}-${day}T00:00:00.000Z`;
};

export const parseEpisodeNumberFromTitle = (title) => {
  if (!title || typeof title !== 'string') {
    return null;
  }

  const match = title.match(EPISODE_NUMBER_REGEX);
  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const normalizeLangCode = (value) => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const cleaned = value.trim().toLowerCase();
  if (!cleaned) {
    return null;
  }

  return cleaned;
};

export const extractLanguageTagsFromFormatText = (formatOutput) => {
  const langs = new Set();

  for (const line of formatOutput.split(/\r?\n/)) {
    const matches = [...line.matchAll(LANGUAGE_TAG_REGEX)];
    for (const match of matches) {
      const normalized = normalizeLangCode(match[1]);
      if (normalized) {
        langs.add(normalized);
      }
    }
  }

  return Array.from(langs).sort();
};

export const extractAudioLangsFromVideoJson = (videoJson) => {
  const langs = new Set();
  const formats = Array.isArray(videoJson.formats) ? videoJson.formats : [];

  for (const format of formats) {
    const language = normalizeLangCode(format.language);
    if (!language) {
      continue;
    }

    const hasAudio = format.acodec && format.acodec !== 'none';
    if (hasAudio) {
      langs.add(language);
    }
  }

  return Array.from(langs).sort();
};

export const extractCaptionLangsFromVideoJson = (videoJson) => {
  const langs = new Set();

  for (const key of Object.keys(videoJson.subtitles ?? {})) {
    const normalized = normalizeLangCode(key);
    if (normalized) {
      langs.add(normalized);
    }
  }

  for (const key of Object.keys(videoJson.automatic_captions ?? {})) {
    const normalized = normalizeLangCode(key);
    if (normalized) {
      langs.add(normalized);
    }
  }

  return Array.from(langs).sort();
};

const detectFrenchAvailability = (audioLangs, captionLangs, formatLangs) => {
  if (audioLangs.includes('fr') || formatLangs.includes('fr')) {
    return 'dub';
  }
  if (captionLangs.includes('fr')) {
    return 'captions';
  }
  return 'none';
};

const pickBestThumbnail = (videoJson, fallback = '') => {
  const thumbnails = Array.isArray(videoJson.thumbnails) ? videoJson.thumbnails : [];
  if (!thumbnails.length) {
    return fallback;
  }

  const sorted = thumbnails
    .slice()
    .sort((left, right) => (right.width ?? 0) * (right.height ?? 0) - (left.width ?? 0) * (left.height ?? 0));

  return sorted[0].url ?? fallback;
};

export const buildEpisode = ({ entry, videoJson, position, formatOutput, quiz = [] }) => {
  const resolvedTitle = videoJson.title ?? entry.title;
  const parsedEpisodeNumber =
    parseEpisodeNumberFromTitle(resolvedTitle) ?? parseEpisodeNumberFromTitle(entry.title) ?? null;
  const resolvedPosition = parsedEpisodeNumber ?? position;

  const audioLangsFromJson = extractAudioLangsFromVideoJson(videoJson);
  const formatLangs = extractLanguageTagsFromFormatText(formatOutput);
  const captionLangs = extractCaptionLangsFromVideoJson(videoJson);

  const audioLangs = Array.from(new Set([...audioLangsFromJson, ...(formatLangs.includes('fr') ? ['fr'] : [])])).sort();
  const frenchAvailability = detectFrenchAvailability(audioLangs, captionLangs, formatLangs);

  return {
    videoId: entry.id,
    title: resolvedTitle,
    position: resolvedPosition,
    url: `https://www.youtube.com/watch?v=${entry.id}`,
    thumbnailUrl: pickBestThumbnail(videoJson, entry.thumbnail ?? ''),
    durationSec: Number(videoJson.duration ?? entry.duration ?? 0),
    publishedAt: normalizeUploadDate(videoJson.upload_date),
    viewCount: Number(videoJson.view_count ?? entry.view_count ?? 0),
    audioLangs,
    captionLangs,
    hasFrenchDub: frenchAvailability === 'dub',
    frenchAvailability,
    quiz
  };
};
