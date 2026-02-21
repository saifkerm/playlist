import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCatalog } from '../features/catalog/CatalogContext';
import { formatDateFr, formatDuration } from '../features/catalog/catalogUtils';
import { QuizCard } from '../features/gamification/QuizCard';
import { ModeToggle, PlaybackMode } from '../features/player/ModeToggle';
import { YouTubeEmbed } from '../features/player/YouTubeEmbed';
import {
  loadFavorites,
  loadPrefs,
  loadProgress,
  loadQuizScores,
  markEpisodeCompleted,
  savePrefs,
  saveQuizScore,
  toggleFavorite,
  touchEpisode
} from '../features/preferences/storage';

const frenchStatusLabel: Record<'dub' | 'captions' | 'none', string> = {
  dub: 'Piste FR disponible',
  captions: 'Sous-titres FR disponibles',
  none: 'FR indisponible'
};

export const EpisodePage = (): JSX.Element => {
  const { playlistId, videoId } = useParams();
  const { loading, error, data } = useCatalog();

  const [prefs, setPrefs] = useState(loadPrefs());
  const [progress, setProgress] = useState(loadProgress());
  const [favorites, setFavorites] = useState<string[]>(loadFavorites());
  const [quizScores, setQuizScores] = useState(loadQuizScores());
  const [mode, setMode] = useState<PlaybackMode>(prefs.playbackDefault);

  const playlist = useMemo(
    () => data?.playlists.find((item) => item.id === playlistId) ?? null,
    [data, playlistId]
  );
  const episode = useMemo(
    () => playlist?.episodes.find((item) => item.videoId === videoId) ?? null,
    [playlist, videoId]
  );

  if (loading) {
    return <p className="state-card">Chargement...</p>;
  }

  if (error || !data) {
    return <p className="state-card">Erreur: {error ?? 'catalogue indisponible'}</p>;
  }

  if (!playlist || !episode) {
    return (
      <div className="state-card">
        <p>Épisode introuvable.</p>
        <Link className="cta-link" to="/">
          Retour accueil
        </Link>
      </div>
    );
  }

  const updateMode = (nextMode: PlaybackMode): void => {
    setMode(nextMode);
    const nextPrefs = { ...prefs, playbackDefault: nextMode };
    setPrefs(nextPrefs);
    savePrefs(nextPrefs);
    const nextProgress = touchEpisode(episode.videoId);
    setProgress(nextProgress);
  };

  const completeEpisode = (): void => {
    setProgress(markEpisodeCompleted(episode.videoId));
  };

  const toggleFavoriteLocal = (): void => {
    setFavorites(toggleFavorite(episode.videoId));
  };

  const currentQuizScore = quizScores[episode.videoId]
    ? { score: quizScores[episode.videoId].score, total: quizScores[episode.videoId].total }
    : undefined;
  const youtubeVfUrl = `https://www.youtube.com/watch?v=${episode.videoId}&hl=fr`;

  return (
    <section className="page-stack">
      <div className="section-head">
        <Link className="back-link" to={`/playlist/${playlist.id}`}>
          ← Retour playlist
        </Link>
        <h1>{episode.title}</h1>
        <p>
          Ep. {episode.position} · {formatDuration(episode.durationSec)} · {formatDateFr(episode.publishedAt)}
        </p>
      </div>

      <div className="player-panel">
        <ModeToggle mode={mode} onModeChange={updateMode} />
        <p className={`language-pill status-${episode.frenchAvailability}`}>{frenchStatusLabel[episode.frenchAvailability]}</p>
        <YouTubeEmbed mode={mode} videoId={episode.videoId} title={episode.title} />
        <p className="vf-note">
          La VF dans l'embed est en best-effort. Pour une sélection FR plus fiable, ouvre la vidéo directement sur YouTube.
        </p>

        <div className="action-row">
          <button className="inline-btn" type="button" onClick={completeEpisode}>
            {progress[episode.videoId]?.completed ? 'Épisode terminé ✓' : 'Marquer terminé'}
          </button>
          <button className="inline-btn" type="button" onClick={toggleFavoriteLocal}>
            {favorites.includes(episode.videoId) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          </button>
          <a className="inline-btn youtube-vf-link" href={youtubeVfUrl} target="_blank" rel="noreferrer">
            Ouvrir dans YouTube (VF)
          </a>
        </div>
      </div>

      {episode.quiz && episode.quiz.length > 0 ? (
        <QuizCard
          videoId={episode.videoId}
          questions={episode.quiz}
          initialScore={currentQuizScore}
          onSubmit={(score, total) => {
            setQuizScores(saveQuizScore(episode.videoId, score, total));
          }}
        />
      ) : (
        <p className="state-card">Quiz indisponible pour cet épisode.</p>
      )}
    </section>
  );
};
