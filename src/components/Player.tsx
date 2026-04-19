import { usePlayerStore } from "../stores/player-store";
import { usePlaylistStore, getNextTrack, getPrevTrack } from "../stores/playlist-store";
import { useAudio } from "../hooks/use-audio";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function Player() {
  const { seek } = useAudio();

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
    seek(Number(e.target.value));
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

  return (
    <div className="player">
      <div className="player-info">
        <span className="player-track-name">
          {currentTrack?.fileName ?? "未选择歌曲"}
        </span>
      </div>
      <div className="player-controls">
        <button className="player-btn" onClick={handlePrev}>
          上一首
        </button>
        <button className="player-btn player-btn-play" onClick={togglePlay}>
          {isPlaying ? "暂停" : "播放"}
        </button>
        <button className="player-btn" onClick={handleNext}>
          下一首
        </button>
      </div>
      <div className="player-progress">
        <span className="player-time">{formatTime(currentTime)}</span>
        <input
          type="range"
          className="player-slider"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          step={1000}
        />
        <span className="player-time">{formatTime(duration)}</span>
      </div>
      <div className="player-extra">
        <button
          className={`player-btn player-btn-lyric ${showDesktopLyric ? "active" : ""}`}
          onClick={handleToggleDesktopLyric}
        >
          词
        </button>
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
  );
}
