import { usePlaylistStore } from "../stores/playlist-store";
import { usePlayerStore } from "../stores/player-store";
import { useNavStore } from "../stores/nav-store";
import type { Track } from "../types";

function formatDuration(): string {
  return "--:--";
}

export default function Playlist() {
  const tracks = usePlaylistStore((s) => s.tracks);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const setTrack = usePlayerStore((s) => s.setTrack);
  const setView = useNavStore((s) => s.setView);

  function handleSelect(track: Track) {
    setTrack(track);
  }

  function handleDoubleClick(track: Track) {
    setTrack(track);
    setView("lyrics-immersion");
  }

  if (tracks.length === 0) {
    return (
      <div className="song-list-view">
        <div className="song-list-empty">
          <div className="song-list-empty-icon">♪</div>
          <p>暂无歌曲</p>
          <p className="song-list-empty-hint">在侧边栏点击「打开文件夹」导入音乐</p>
        </div>
      </div>
    );
  }

  return (
    <div className="song-list-view">
      <header className="song-list-header">
        <div>
          <h1 className="song-list-title">本地音乐库</h1>
          <p className="song-list-subtitle">共 {tracks.length} 首音乐</p>
        </div>
        <div className="song-list-actions">
          <button
            className="song-list-btn-play"
            onClick={() => {
              const first = tracks[0];
              if (first) setTrack(first);
            }}
          >
            播放全部
          </button>
        </div>
      </header>
      <div className="song-list-table">
        <div className="song-list-table-header">
          <span className="song-col-num">#</span>
          <span className="song-col-title">标题</span>
          <span className="song-col-ext">格式</span>
          <span className="song-col-duration">时长</span>
        </div>
        {tracks.map((track, idx) => (
          <div
            key={track.id}
            className={`song-list-row ${track.id === currentTrack?.id ? "song-list-row-active" : ""}`}
            onClick={() => handleSelect(track)}
            onDoubleClick={() => handleDoubleClick(track)}
          >
            <span className="song-col-num">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <div className="song-col-title">
              <div className="song-col-title-inner">
                <span className="song-name">{track.fileName}</span>
                {track.lrcPath && <span className="song-lrc-badge">词</span>}
              </div>
            </div>
            <span className="song-col-ext">{track.extension.toUpperCase()}</span>
            <span className="song-col-duration">{formatDuration()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
