export type PlaybackMode = 'audio' | 'video';

type ModeToggleProps = {
  mode: PlaybackMode;
  onModeChange: (next: PlaybackMode) => void;
};

export const ModeToggle = ({ mode, onModeChange }: ModeToggleProps): JSX.Element => {
  return (
    <div className="mode-toggle" role="tablist" aria-label="Mode de lecture">
      <button
        className={`mode-btn ${mode === 'audio' ? 'is-active' : ''}`}
        type="button"
        role="tab"
        aria-selected={mode === 'audio'}
        onClick={() => onModeChange('audio')}
      >
        Podcast
      </button>
      <button
        className={`mode-btn ${mode === 'video' ? 'is-active' : ''}`}
        type="button"
        role="tab"
        aria-selected={mode === 'video'}
        onClick={() => onModeChange('video')}
      >
        Vidéo
      </button>
    </div>
  );
};
