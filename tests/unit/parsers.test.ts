import { describe, expect, it } from 'vitest';
import {
  extractAudioLangsFromVideoJson,
  extractCaptionLangsFromVideoJson,
  extractLanguageTagsFromFormatText,
  normalizeUploadDate,
  parseEpisodeNumberFromTitle
} from '../../scripts/lib/syncCore.mjs';

describe('yt-dlp parsers', () => {
  it('extracts language tags from a format table output', () => {
    const formatOutput = `
      140 m4a audio only [en]
      95-3 mp4 1280x720 [fr]
      95-8 mp4 1280x720 [ar]
    `;

    expect(extractLanguageTagsFromFormatText(formatOutput)).toEqual(['ar', 'en', 'fr']);
  });

  it('extracts audio and caption languages from JSON payload', () => {
    const videoJson = {
      formats: [
        { language: 'en', acodec: 'mp4a.40.2' },
        { language: 'fr', acodec: 'mp4a.40.2' },
        { language: 'fr', acodec: 'none' }
      ],
      subtitles: {
        fr: [{ ext: 'vtt' }],
        en: [{ ext: 'vtt' }]
      },
      automatic_captions: {
        ar: [{ ext: 'vtt' }]
      }
    };

    expect(extractAudioLangsFromVideoJson(videoJson)).toEqual(['en', 'fr']);
    expect(extractCaptionLangsFromVideoJson(videoJson)).toEqual(['ar', 'en', 'fr']);
  });

  it('normalizes upload date to ISO', () => {
    expect(normalizeUploadDate('20260221')).toBe('2026-02-21T00:00:00.000Z');
  });

  it('extracts episode number from title when available', () => {
    expect(parseEpisodeNumberFromTitle('Hamza and Umar (ra) Become Muslim! - O Messenger | Ep. 3')).toBe(3);
    expect(parseEpisodeNumberFromTitle('The trailer only')).toBeNull();
  });
});
