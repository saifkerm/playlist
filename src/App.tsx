import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PlaylistPage } from './pages/PlaylistPage';
import { EpisodePage } from './pages/EpisodePage';

const App = (): JSX.Element => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="logo-link">
          <span className="logo-mark">PS</span>
          <div>
            <p className="logo-title">Playlist Stories</p>
            <p className="logo-subtitle">mobile-first podcast + video</p>
          </div>
        </Link>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/playlist/:playlistId" element={<PlaylistPage />} />
          <Route path="/playlist/:playlistId/episode/:videoId" element={<EpisodePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
