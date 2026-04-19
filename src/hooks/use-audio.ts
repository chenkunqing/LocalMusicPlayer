import { useEffect, useRef, useCallback } from "react";
import { Howl } from "howler";
import { usePlayerStore } from "../stores/player-store";
import { usePlaylistStore, getNextTrack } from "../stores/playlist-store";
import { createAudioBlobUrl, revokePreviousBlobUrl } from "../services/audio-service";

const PROGRESS_INTERVAL = 200;

export function useAudio() {
  const howlRef = useRef<Howl | null>(null);
  const timerRef = useRef<number>(0);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);

  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime);
  const setDuration = usePlayerStore((s) => s.setDuration);
  const setTrack = usePlayerStore((s) => s.setTrack);

  const tracks = usePlaylistStore((s) => s.tracks);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = 0;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = window.setInterval(() => {
      const howl = howlRef.current;
      if (howl && howl.playing()) {
        setCurrentTime(howl.seek() * 1000);
        if (usePlayerStore.getState().duration === 0) {
          const dur = howl.duration();
          if (dur > 0) setDuration(dur * 1000);
        }
      }
    }, PROGRESS_INTERVAL);
  }, [clearTimer, setCurrentTime, setDuration]);

  useEffect(() => {
    if (!currentTrack) {
      howlRef.current?.unload();
      howlRef.current = null;
      clearTimer();
      revokePreviousBlobUrl();
      return;
    }

    let cancelled = false;

    async function loadAndPlay() {
      if (!currentTrack) return;

      howlRef.current?.unload();
      howlRef.current = null;
      clearTimer();

      const blobUrl = await createAudioBlobUrl(
        currentTrack.filePath,
        currentTrack.extension,
      );
      if (cancelled) return;

      const howl = new Howl({
        src: [blobUrl],
        format: [currentTrack.extension],
        html5: true,
        volume: usePlayerStore.getState().volume,
        onload: () => {
          if (cancelled) return;
          setDuration(howl.duration() * 1000);
        },
        onplay: () => {
          if (cancelled) return;
          setPlaying(true);
          startTimer();
        },
        onpause: () => {
          if (cancelled) return;
          setPlaying(false);
          clearTimer();
        },
        onend: () => {
          if (cancelled) return;
          clearTimer();
          setPlaying(false);
          setCurrentTime(0);
          const storeState = usePlaylistStore.getState();
          const next = getNextTrack(storeState.tracks, currentTrack.id);
          if (next) {
            setTrack(next);
          }
        },
        onloaderror: (_id, err) => {
          console.error("音频加载失败:", err);
          setPlaying(false);
        },
      });

      howlRef.current = howl;
      howl.play();
    }

    loadAndPlay();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id]);

  useEffect(() => {
    const howl = howlRef.current;
    if (!howl) return;

    if (isPlaying && !howl.playing()) {
      howl.play();
    } else if (!isPlaying && howl.playing()) {
      howl.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    howlRef.current?.volume(volume);
  }, [volume]);

  const incrementSeekVersion = usePlayerStore((s) => s.incrementSeekVersion);

  const seek = useCallback((ms: number) => {
    const howl = howlRef.current;
    if (howl) {
      howl.seek(ms / 1000);
      setCurrentTime(ms);
      incrementSeekVersion();
    }
  }, [setCurrentTime, incrementSeekVersion]);

  useEffect(() => {
    return () => {
      howlRef.current?.unload();
      clearTimer();
      revokePreviousBlobUrl();
    };
  }, [clearTimer]);

  return { seek, tracks };
}
