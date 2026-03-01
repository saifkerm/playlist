import { CatalogLanguage, PlaylistManifest, UserProgress } from '../../types';

export const countCompletedEpisodes = (playlist: PlaylistManifest, progress: UserProgress): number => {
  return playlist.episodes.filter((episode) => progress[episode.videoId]?.completed).length;
};

export const progressRatio = (playlist: PlaylistManifest, progress: UserProgress): number => {
  if (!playlist.episodes.length) {
    return 0;
  }
  return countCompletedEpisodes(playlist, progress) / playlist.episodes.length;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }
  return `${minutes}m ${remaining.toString().padStart(2, '0')}s`;
};

export const formatDateFr = (isoDate: string): string => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium'
  }).format(date);
};

const ARABIC_SCRIPT_REGEX = /[\u0600-\u06FF]/;

export const detectPlaylistLanguage = (playlist: PlaylistManifest): CatalogLanguage => {
  if (playlist.id.startsWith('ar-')) {
    return 'ar';
  }

  const probe = `${playlist.playlistTitle} ${playlist.channelName} ${playlist.channelHandle}`;
  return ARABIC_SCRIPT_REGEX.test(probe) ? 'ar' : 'fr';
};
