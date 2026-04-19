import { useEffect, useRef } from "react";
import { useLyric } from "../hooks/use-lyric";
import { usePlayerStore } from "../stores/player-store";
import { usePlaylistStore, getNextTrack, getPrevTrack } from "../stores/playlist-store";
import { useNavStore } from "../stores/nav-store";

const SCROLL_OFFSET = 200;

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function LyricsImmersion() {
  const { lines, currentLineIndex } = useLyric();
  const seekFn = usePlayerStore((s) => s.seekFn);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const setTrack = usePlayerStore((s) => s.setTrack);
  const tracks = usePlaylistStore((s) => s.tracks);
  const previousView = useNavStore((s) => s.previousView);
  const setView = useNavStore((s) => s.setView);

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current;
      const active = activeRef.current;
      const top = active.offsetTop - SCROLL_OFFSET;
      container.scrollTo({ top, behavior: "smooth" });
    }
  }, [currentLineIndex]);

  function handleExit() {
    setView(previousView);
  }

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

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="lyrics-immersion">
      <div className="li-bg">
        <div className="li-bg-gradient" />
        <div className="li-bg-glow" />
      </div>

      <div className="li-topbar">
        <button className="li-exit-btn" onClick={handleExit}>
          <span>↓</span>
          <span>退出沉浸模式</span>
        </button>
      </div>

      <main className="li-body">
        <div className="li-cover-section">
          <div className="li-cover">
            <div className="li-cover-placeholder">
              <span className="li-cover-icon">♪</span>
            </div>
          </div>
          {currentTrack && (
            <div className="li-track-info">
              <h2 className="li-track-name">{currentTrack.fileName}</h2>
            </div>
          )}
        </div>

        <div className="li-lyric-section" ref={containerRef}>
          {lines.length === 0 ? (
            <div className="li-lyric-empty">暂无歌词</div>
          ) : (
            <div className="li-lyric-list">
              {lines.map((line, idx) => (
                <div
                  key={`${line.time}-${idx}`}
                  ref={idx === currentLineIndex ? activeRef : null}
                  className={`li-lyric-line ${idx === currentLineIndex ? "li-lyric-line-active" : ""}`}
                >
                  {line.text || "\u00A0"}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="li-controls">
        <div className="li-controls-buttons">
          <button className="li-btn-skip" onClick={handlePrev}>⏮</button>
          <button className="li-btn-play" onClick={togglePlay}>
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button className="li-btn-skip" onClick={handleNext}>⏭</button>
        </div>
        <div className="li-progress">
          <span className="li-time">{formatTime(currentTime)}</span>
          <div className="li-progress-bar">
            <div className="li-progress-fill" style={{ width: `${progressPercent}%` }} />
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              step={1000}
            />
          </div>
          <span className="li-time">{formatTime(duration)}</span>
        </div>
      </footer>
    </div>
  );
}
