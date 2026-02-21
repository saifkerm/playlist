import { Link } from 'react-router-dom';
import { useCatalog } from '../features/catalog/CatalogContext';
import { countCompletedEpisodes, progressRatio } from '../features/catalog/catalogUtils';
import { loadProgress } from '../features/preferences/storage';

export const HomePage = (): JSX.Element => {
  const { loading, error, data } = useCatalog();
  const progress = loadProgress();

  if (loading) {
    return <p className="state-card">Chargement du catalogue...</p>;
  }

  if (error || !data) {
    return <p className="state-card">Erreur de chargement: {error ?? 'catalogue indisponible'}</p>;
  }

  return (
    <section className="page-stack">
      <div className="hero-card">
        <p className="hero-kicker">Parcours interactif</p>
        <h1>Playlists YouTube en mode podcast + vidéo</h1>
        <p>
          Lecture audio-first, préférence FR, progression locale, quiz et badges. Cette version v1 reste 100% statique et
          compatible GitHub Pages.
        </p>
      </div>

      <div className="playlist-grid">
        {data.playlists.map((playlist) => {
          const completed = countCompletedEpisodes(playlist, progress);
          const ratio = progressRatio(playlist, progress);

          return (
            <article key={playlist.id} className="playlist-card">
              <div className="playlist-meta">
                <p className="pill">{playlist.channelName}</p>
                <p className="playlist-updated">Mis à jour: {new Date(playlist.updatedAt).toLocaleDateString('fr-FR')}</p>
              </div>

              <h2>{playlist.playlistTitle}</h2>
              <p className="playlist-subtitle">{playlist.episodes.length} épisodes</p>

              <div className="progress-block" aria-label="Progression playlist">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${Math.round(ratio * 100)}%` }} />
                </div>
                <p>
                  {completed}/{playlist.episodes.length} terminés
                </p>
              </div>

              <Link className="cta-link" to={`/playlist/${playlist.id}`}>
                Ouvrir la playlist
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
};
