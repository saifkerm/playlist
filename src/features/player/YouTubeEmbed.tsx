import { PlaybackMode } from './ModeToggle';

type YouTubeEmbedProps = {
  videoId: string;
  mode: PlaybackMode;
  title: string;
};

const buildEmbedUrl = (videoId: string): string => {
  const params = new URLSearchParams({
    hl: 'fr',
    cc_lang_pref: 'fr',
    cc_load_policy: '1',
    rel: '0',
    playsinline: '1',
    iv_load_policy: '3'
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

export const YouTubeEmbed = ({ videoId, mode, title }: YouTubeEmbedProps): JSX.Element => {
  return (
    <div className={`yt-frame-wrap ${mode === 'audio' ? 'is-audio' : 'is-video'}`}>
      <iframe
        title={title}
        src={buildEmbedUrl(videoId)}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
};
