"use client";

import * as React from "react";
import {
  MediaPlayer,
  MediaProvider,
  Track,
  type MediaPlayerInstance,
  Poster,
} from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";

type VideoPlayerProps = {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  tracks?: Array<{
    src: string;
    kind?: "subtitles" | "captions";
    label?: string;
    lang?: string;
    default?: boolean;
  }>;
  onTimeChange?: (currentTime: number, duration: number) => void;
  onDurationChange?: (duration: number) => void;
};

export function VideoPlayer({
  src,
  poster,
  title,
  className,
  tracks,
  onTimeChange,
  onDurationChange,
}: VideoPlayerProps) {
  const playerRef = React.useRef<MediaPlayerInstance | null>(null);

  React.useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const unsubscribe = player.subscribe(({ currentTime, duration }) => {
      if (onTimeChange) {
        onTimeChange(currentTime, duration);
      }
      if (onDurationChange) {
        onDurationChange(duration);
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [onTimeChange, onDurationChange]);
  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-md">
        <p>Chưa có nguồn phát cho phim này.</p>
      </div>
    );
  }

  return (
    <div className={className ? `relative ${className}` : "relative"}>
      <MediaPlayer
        ref={playerRef}
        className="vds-player w-full h-full overflow-hidden rounded-sm bg-black"
        src={src}
        poster={poster}
        title={title}
        streamType="on-demand"
        playsinline
      >
        <MediaProvider />
        {/* Hiển thị poster khi chưa phát */}
        {poster && <Poster className="vds-poster" />}
        {tracks?.map((track, index) => (
          <Track
            key={String(index)}
            src={track.src}
            kind={track.kind ?? "subtitles"}
            label={track.label}
            lang={track.lang}
            default={track.default}
          />
        ))}
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
    </div>
  );
}
