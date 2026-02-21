import { describe, expect, it } from 'vitest';
import { buildEpisode } from '../../scripts/lib/syncCore.mjs';

describe('sync core integration', () => {
  it('builds episode with FR availability as dub', () => {
    const episode = buildEpisode({
      entry: {
        id: 'abc123',
        title: 'Example title | Ep. 3',
        duration: 300,
        view_count: 900
      },
      videoJson: {
        title: 'Example title final | Ep. 3',
        duration: 320,
        upload_date: '20260220',
        view_count: 1200,
        thumbnails: [{ url: 'https://img.example/large.jpg', width: 1200, height: 900 }],
        formats: [{ language: 'en', acodec: 'mp4a.40.2' }],
        subtitles: { fr: [{ ext: 'vtt' }] },
        automatic_captions: {}
      },
      position: 2,
      formatOutput: '95-3 mp4 1280x720 [fr]',
      quiz: []
    });

    expect(episode.videoId).toBe('abc123');
    expect(episode.position).toBe(3);
    expect(episode.publishedAt).toBe('2026-02-20T00:00:00.000Z');
    expect(episode.frenchAvailability).toBe('dub');
    expect(episode.hasFrenchDub).toBe(true);
    expect(episode.audioLangs).toContain('fr');
  });

  it('falls back to caption availability when no FR dub detected', () => {
    const episode = buildEpisode({
      entry: {
        id: 'xyz789',
        title: 'No dub',
        duration: 100
      },
      videoJson: {
        title: 'No dub',
        duration: 100,
        upload_date: '20260201',
        thumbnails: [{ url: 'https://img.example/thumb.jpg', width: 300, height: 200 }],
        formats: [{ language: 'en', acodec: 'mp4a.40.2' }],
        subtitles: { fr: [{ ext: 'vtt' }] },
        automatic_captions: {}
      },
      position: 1,
      formatOutput: '140 m4a audio only [en]',
      quiz: []
    });

    expect(episode.frenchAvailability).toBe('captions');
    expect(episode.hasFrenchDub).toBe(false);
  });
});
