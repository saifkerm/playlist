import { Link, useParams } from 'react-router-dom';
import { useCatalog } from '../features/catalog/CatalogContext';
import { formatDateFr, formatDuration } from '../features/catalog/catalogUtils';
import { computeBadges } from '../features/gamification/badges';
import { loadProgress } from '../features/preferences/storage';

const renderFrenchStatus = (status: 'dub' | 'captions' | 'none'): string => {
  if (status === 'dub') {
    return 'Piste FR';
  }
  if (status === 'captions') {
    return 'Sous-titres FR';
  }
  return 'FR indisponible';
};

export const PlaylistPage = (): JSX.Element => {
  const { playlistId } = useParams();
  const { loading, error, data } = useCatalog();
  const progress = loadProgress();

  if (loading) {
    return <p className="state-card">Chargement...</p>;
  }

  if (error || !data) {
    return <p className="state-card">Erreur: {error ?? 'catalogue indisponible'}</p>;
  }

  const playlist = data.playlists.find((item) => item.id === playlistId);
  if (!playlist) {
    return (
      <div className="state-card">
        <p>Playlist introuvable.</p>
        <Link className="cta-link" to="/">
          Retour accueil
        </Link>
      </div>
    );
  }

  const badges = computeBadges(playlist, progress);

  return (
    <section className="page-stack">
      <div className="section-head">
        <Link className="back-link" to="/">
          ← Retour
        </Link>
        <h1>{playlist.playlistTitle}</h1>
        <p>
          {playlist.channelName} ({playlist.channelHandle})
        </p>
      </div>

      <div className="badge-row" aria-label="Badges de progression">
        {badges.map((badge) => (
          <span key={badge.id} className={`badge-chip ${badge.unlocked ? 'is-unlocked' : ''}`}>
            {badge.unlocked ? '✓' : '○'} {badge.label}
          </span>
        ))}
      </div>

      <ol className="timeline-list">
        {playlist.episodes
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((episode) => {
            const completed = progress[episode.videoId]?.completed;
            return (
              <li key={episode.videoId} className={`timeline-item ${completed ? 'is-complete' : ''}`}>
                <Link to={`/playlist/${playlist.id}/episode/${episode.videoId}`} className="timeline-link">
                  <img src={episode.thumbnailUrl} alt="Miniature épisode" loading="lazy" />
                  <div className="timeline-content">
                    <div className="timeline-headline">
                      <p className="episode-index">Ep. {episode.position}</p>
                      <span className={`language-pill status-${episode.frenchAvailability}`}>
                        {renderFrenchStatus(episode.frenchAvailability)}
                      </span>
                    </div>
                    <h2>{episode.title}</h2>
                    <p>
                      {formatDuration(episode.durationSec)} · {formatDateFr(episode.publishedAt)}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
      </ol>
    </section>
  );
};
