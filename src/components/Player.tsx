import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { usePlayerStore } from "../stores/player-store";
import { usePlaylistStore, getNextTrack, getPrevTrack } from "../stores/playlist-store";
import { useNavStore } from "../stores/nav-store";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { EVENT_DESKTOP_LYRIC_HIDDEN } from "../constants";

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function Player() {
  const seekFn = usePlayerStore((s) => s.seekFn);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const showDesktopLyric = usePlayerStore((s) => s.showDesktopLyric);

  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const setTrack = usePlayerStore((s) => s.setTrack);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const setShowDesktopLyric = usePlayerStore((s) => s.setShowDesktopLyric);

  const tracks = usePlaylistStore((s) => s.tracks);
  const setView = useNavStore((s) => s.setView);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    listen(EVENT_DESKTOP_LYRIC_HIDDEN, () => {
      setShowDesktopLyric(false);
    }).then((fn) => {
      unlisten = fn;
    });
    return () => {
      unlisten?.();
    };
  }, [setShowDesktopLyric]);

  function handlePrev() {
    if (!currentTrack) return;
    const prev = getPrevTrack(tracks, currentTrack.id);
    if (prev) setTrack(prev);
  }

  function handleNext() {
    if (!currentTrack) return;
    const next = getNextTrack(tracks, currentTrack.id);
    if (next) setTrack(next);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    seekFn?.(Number(e.target.value));
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    setVolume(Number(e.target.value));
  }

  async function handleToggleDesktopLyric() {
    const next = !showDesktopLyric;
    setShowDesktopLyric(next);
    try {
      const lyricWin = await WebviewWindow.getByLabel("desktop-lyric");
      if (lyricWin) {
        if (next) {
          await lyricWin.show();
        } else {
          await lyricWin.hide();
        }
      }
    } catch {
      // 窗口未创建时忽略
    }
  }

  function handleCoverClick() {
    if (currentTrack) {
      setView("lyrics-immersion");
    }
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="player">
      <div className="player-progress-bar">
        <div className="player-progress-fill" style={{ width: `${progressPercent}%` }} />
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          step={1000}
        />
      </div>

      <div className="player-info">
        <div
          className="player-cover"
          onClick={handleCoverClick}
          title="进入沉浸模式"
        >
          <span className="player-cover-icon">♪</span>
        </div>
        <div className="player-track-meta">
          <span className="player-track-name">
            {currentTrack?.fileName ?? "未选择歌曲"}
          </span>
        </div>
      </div>

      <div className="player-center">
        <div className="player-controls">
          <button className="player-btn-skip" onClick={handlePrev}>⏮</button>
          <button className="player-btn-play" onClick={togglePlay}>
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button className="player-btn-skip" onClick={handleNext}>⏭</button>
        </div>
        <div className="player-time-row">
          <span className="player-time">{formatTime(currentTime)}</span>
          <div style={{ flex: 1 }} />
          <span className="player-time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-extra">
        <button
          className={`player-btn-lyric ${showDesktopLyric ? "active" : ""}`}
          onClick={handleToggleDesktopLyric}
        >
          词
        </button>
        <div className="player-volume-wrap">
          <span className="player-volume-icon">🔊</span>
          <input
            type="range"
            className="player-volume"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolume}
          />
        </div>
      </div>
    </div>
  );
}
