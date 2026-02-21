import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildEpisode, parseNdjson } from './lib/syncCore.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const contentDir = path.resolve(rootDir, 'content');
const playlistsDir = path.resolve(contentDir, 'playlists');
const publicContentDir = path.resolve(rootDir, 'public', 'content');

const configPath = path.resolve(contentDir, 'playlists.config.json');
const quizzesPath = path.resolve(contentDir, 'quizzes.json');

const runYtDlp = (args, { allowFailure = false } = {}) => {
  try {
    return execFileSync('yt-dlp', args, {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
  } catch (error) {
    const stderr = error?.stderr ? String(error.stderr) : 'unknown error';
    if (allowFailure) {
      console.warn(`yt-dlp warning for args [${args.join(' ')}]\n${stderr}`);
      return null;
    }
    throw new Error(`yt-dlp failed for args [${args.join(' ')}]\n${stderr}`);
  }
};

const loadJsonFile = async (filePath, fallback) => {
  if (!existsSync(filePath)) {
    return fallback;
  }
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
};

const main = async () => {
  await mkdir(playlistsDir, { recursive: true });
  await mkdir(publicContentDir, { recursive: true });

  const config = await loadJsonFile(configPath, []);
  const quizzes = await loadJsonFile(quizzesPath, {});

  const enabledPlaylists = config.filter((playlist) => playlist.enabled);
  const nowIso = new Date().toISOString();
  const manifests = [];

  for (const source of enabledPlaylists) {
    console.log(`Sync playlist ${source.id} (${source.playlistId}) ...`);

    const flatRaw = runYtDlp(['--flat-playlist', '--dump-json', source.sourceUrl]);
    const entries = parseNdjson(flatRaw);

    if (!entries.length) {
      console.warn(`No entries found for playlist ${source.id}`);
      continue;
    }

    const playlistTitle = entries[0].playlist_title ?? source.id;
    const channelName = entries[0].playlist_channel ?? source.channelName;
    const channelHandle = entries[0].playlist_uploader_id ?? source.channelHandle;

    const episodes = [];

    for (const [index, entry] of entries.entries()) {
      const url = `https://www.youtube.com/watch?v=${entry.id}`;
      const detailsRaw = runYtDlp(['-J', '--skip-download', url], { allowFailure: true });
      if (!detailsRaw) {
        console.warn(`Skipping unavailable video ${entry.id} in playlist ${source.id}`);
        continue;
      }

      let details;
      try {
        details = JSON.parse(detailsRaw);
      } catch {
        console.warn(`Skipping malformed metadata for video ${entry.id} in playlist ${source.id}`);
        continue;
      }

      const formatRaw = runYtDlp(['-F', url], { allowFailure: true }) ?? '';

      const episode = buildEpisode({
        entry,
        videoJson: details,
        position: index + 1,
        formatOutput: formatRaw,
        quiz: quizzes[entry.id] ?? []
      });

      episodes.push(episode);
    }

    const manifest = {
      id: source.id,
      playlistId: source.playlistId,
      playlistTitle,
      channelName,
      channelHandle,
      sourceUrl: source.sourceUrl,
      updatedAt: nowIso,
      episodes
    };

    manifests.push(manifest);

    await writeFile(path.resolve(playlistsDir, `${source.id}.json`), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  }

  const catalog = {
    updatedAt: nowIso,
    playlists: manifests
  };

  await writeFile(path.resolve(contentDir, 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');

  await cp(contentDir, publicContentDir, {
    recursive: true,
    force: true
  });

  console.log(`Synced ${manifests.length} playlists.`);
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
