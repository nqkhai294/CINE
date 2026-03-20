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
  /** Thời điểm bắt đầu (giây) - dùng cho "tiếp tục xem" */
  initialCurrentTime?: number;
  /** Tốc độ phát mặc định (1 = bình thường) */
  initialPlaybackRate?: number;
  onTimeChange?: (currentTime: number, duration: number) => void;
  onDurationChange?: (duration: number) => void;
  /** Gọi khi user bấm pause (chuyển từ đang phát sang dừng) */
  onPause?: (currentTime: number, duration: number) => void;
  /** Gọi khi user đổi tốc độ phát */
  onPlaybackRateChange?: (playbackRate: number) => void;
};

export function VideoPlayer({
  src,
  poster,
  title,
  className,
  tracks,
  initialCurrentTime,
  initialPlaybackRate = 1,
  onTimeChange,
  onDurationChange,
  onPause,
  onPlaybackRateChange,
}: VideoPlayerProps) {
  const playerRef = React.useRef<MediaPlayerInstance | null>(null);
  const appliedInitialRef = React.useRef(false);
  const wasPlayingRef = React.useRef(false);
  const lastPlaybackRateRef = React.useRef<number | null>(null);

  // Giữ callback trong ref để dependency array của effect không đổi độ dài
  const onTimeChangeRef = React.useRef(onTimeChange);
  const onDurationChangeRef = React.useRef(onDurationChange);
  const onPauseRef = React.useRef(onPause);
  const onPlaybackRateChangeRef = React.useRef(onPlaybackRateChange);
  onTimeChangeRef.current = onTimeChange;
  onDurationChangeRef.current = onDurationChange;
  onPauseRef.current = onPause;
  onPlaybackRateChangeRef.current = onPlaybackRateChange;

  // Reset khi đổi phim (đổi src) để áp dụng lại initial cho phim mới
  React.useEffect(() => {
    appliedInitialRef.current = false;
  }, [src]);

  // Khi initial tới muộn (sau khi API getWatchProgress trả về), cho phép subscribe áp dụng lại
  React.useEffect(() => {
    if (
      initialCurrentTime != null ||
      (initialPlaybackRate != null && initialPlaybackRate !== 1)
    ) {
      appliedInitialRef.current = false;
    }
  }, [initialCurrentTime, initialPlaybackRate]);

  // Áp dụng initialPlaybackRate ngay khi API trả về (player có thể đã load trước đó)
  React.useEffect(() => {
    if (initialPlaybackRate == null || initialPlaybackRate === 1) return;
    let cancelled = false;
    const apply = () => {
      if (cancelled) return;
      const player = playerRef.current;
      if (player) {
        try {
          player.playbackRate = initialPlaybackRate;
          lastPlaybackRateRef.current = initialPlaybackRate; // đồng bộ ref để subscribe không gửi PUT thừa khi state cập nhật 1.5
        } catch (_) {
          // ignore
        }
        return;
      }
      setTimeout(apply, 100);
    };
    apply();
    return () => {
      cancelled = true;
    };
  }, [initialPlaybackRate]);

  // Subscribe vào player state (retry cho đến khi ref có giá trị — Vidstack gán ref sau mount)
  // Dependency array cố định để tránh lỗi "array must be constant"
  React.useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    const trySubscribe = () => {
      if (cancelled) return;
      const player = playerRef.current;
      if (!player) {
        setTimeout(trySubscribe, 100);
        return;
      }

      unsubscribe = player.subscribe((state) => {
        const { currentTime, duration } = state;
        const paused =
          "paused" in state ? (state as { paused?: boolean }).paused : false;
        const playbackRate =
          "playbackRate" in state
            ? (state as { playbackRate?: number }).playbackRate
            : undefined;

        // Chỉ gửi API khi tốc độ *thay đổi* sau lần đầu; không gửi 1 khi đang restore initialPlaybackRate (tránh race: player chưa kịp áp 1.5 đã gửi 1)
        if (
          playbackRate != null &&
          lastPlaybackRateRef.current !== playbackRate
        ) {
          const prev = lastPlaybackRateRef.current;
          lastPlaybackRateRef.current = playbackRate;
          const isRestoringCustomRate =
            playbackRate === 1 &&
            initialPlaybackRate != null &&
            initialPlaybackRate !== 1;
          if (prev !== null && !isRestoringCustomRate) {
            onPlaybackRateChangeRef.current?.(playbackRate);
          }
        }

        if (wasPlayingRef.current && paused) {
          wasPlayingRef.current = false;
          onPauseRef.current?.(currentTime, duration);
        } else if (!paused) {
          wasPlayingRef.current = true;
        }

        if (!appliedInitialRef.current && duration > 0) {
          appliedInitialRef.current = true;
          try {
            if (initialCurrentTime != null && initialCurrentTime > 0) {
              player.currentTime = initialCurrentTime;
            }
            if (initialPlaybackRate != null && initialPlaybackRate !== 1) {
              player.playbackRate = initialPlaybackRate;
              lastPlaybackRateRef.current = initialPlaybackRate;
            }
          } catch (_) {
            // ignore
          }
        }

        // Áp lại initialPlaybackRate mỗi khi state khác (API trả muộn hoặc player reset sau load)
        if (
          duration > 0 &&
          initialPlaybackRate != null &&
          initialPlaybackRate !== 1 &&
          playbackRate !== initialPlaybackRate
        ) {
          try {
            player.playbackRate = initialPlaybackRate;
            lastPlaybackRateRef.current = initialPlaybackRate;
          } catch (_) {
            // ignore
          }
        }

        onTimeChangeRef.current?.(currentTime, duration);
        onDurationChangeRef.current?.(duration);
      });
    };

    trySubscribe();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [initialCurrentTime, initialPlaybackRate]);
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
