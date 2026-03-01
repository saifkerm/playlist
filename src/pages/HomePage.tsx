import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../features/catalog/CatalogContext';
import { countCompletedEpisodes, detectPlaylistLanguage, progressRatio } from '../features/catalog/catalogUtils';
import { loadCatalogLanguageFilter, loadProgress, saveCatalogLanguageFilter } from '../features/preferences/storage';
import { CatalogLanguage, CatalogLanguageFilter } from '../types';

const languageLabel: Record<CatalogLanguage, string> = {
  fr: 'FR',
  ar: 'AR'
};

const catalogFilters: { id: CatalogLanguageFilter; label: string }[] = [
  { id: 'all', label: 'Tout' },
  { id: 'fr', label: 'FR' },
  { id: 'ar', label: 'AR' }
];

export const HomePage = (): JSX.Element => {
  const { loading, error, data } = useCatalog();
  const progress = loadProgress();
  const [languageFilter, setLanguageFilter] = useState<CatalogLanguageFilter>(loadCatalogLanguageFilter());

  const playlistEntries = useMemo(
    () =>
      (data?.playlists ?? []).map((playlist) => ({
        playlist,
        language: detectPlaylistLanguage(playlist)
      })),
    [data]
  );

  const counts = useMemo(
    () =>
      playlistEntries.reduce(
        (acc, entry) => {
          acc[entry.language] += 1;
          return acc;
        },
        { fr: 0, ar: 0 }
      ),
    [playlistEntries]
  );

  const filteredEntries = playlistEntries.filter((entry) => {
    return languageFilter === 'all' ? true : entry.language === languageFilter;
  });

  const updateLanguageFilter = (next: CatalogLanguageFilter): void => {
    setLanguageFilter(next);
    saveCatalogLanguageFilter(next);
  };

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

      <div className="catalog-filter" aria-label="Filtrer les playlists par langue">
        {catalogFilters.map((filter) => {
          const count = filter.id === 'all' ? playlistEntries.length : counts[filter.id];
          const isActive = languageFilter === filter.id;

          return (
            <button
              key={filter.id}
              type="button"
              className={`catalog-filter-btn ${isActive ? 'is-active' : ''}`}
              onClick={() => updateLanguageFilter(filter.id)}
              aria-pressed={isActive}
            >
              {filter.label}
              <span>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="playlist-grid">
        {filteredEntries.length === 0 ? (
          <p className="state-card">Aucune playlist pour ce filtre.</p>
        ) : (
          filteredEntries.map(({ playlist, language }) => {
            const completed = countCompletedEpisodes(playlist, progress);
            const ratio = progressRatio(playlist, progress);

            return (
              <article key={playlist.id} className="playlist-card">
                <div className="playlist-meta">
                  <div className="playlist-tags">
                    <p className="pill">{playlist.channelName}</p>
                    <span className={`catalog-language-badge lang-${language}`}>{languageLabel[language]}</span>
                  </div>
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
          })
        )}
      </div>
    </section>
  );
};
