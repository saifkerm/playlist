import { Badge, PlaylistManifest, UserProgress } from '../../types';

const hasThreeEpisodeStreak = (playlist: PlaylistManifest, progress: UserProgress): boolean => {
  const positions = playlist.episodes
    .filter((episode) => progress[episode.videoId]?.completed)
    .map((episode) => episode.position)
    .sort((a, b) => a - b);

  let currentStreak = 1;
  for (let index = 1; index < positions.length; index += 1) {
    if (positions[index] === positions[index - 1] + 1) {
      currentStreak += 1;
      if (currentStreak >= 3) {
        return true;
      }
    } else {
      currentStreak = 1;
    }
  }
  return false;
};

export const computeBadges = (playlist: PlaylistManifest, progress: UserProgress): Badge[] => {
  const completedCount = playlist.episodes.filter((episode) => progress[episode.videoId]?.completed).length;
  const firstEpisodeUnlocked = completedCount >= 1;
  const seriesCompleteUnlocked = completedCount === playlist.episodes.length && playlist.episodes.length > 0;

  return [
    {
      id: 'first_episode',
      label: 'Premier épisode terminé',
      unlocked: firstEpisodeUnlocked
    },
    {
      id: 'streak_3',
      label: 'Série de 3 épisodes',
      unlocked: hasThreeEpisodeStreak(playlist, progress)
    },
    {
      id: 'series_complete',
      label: 'Série complétée',
      unlocked: seriesCompleteUnlocked
    }
  ];
};
