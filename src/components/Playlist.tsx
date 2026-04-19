import { usePlaylistStore } from "../stores/playlist-store";
import { usePlayerStore } from "../stores/player-store";
import { selectMusicFolder, scanMusicFiles } from "../services/file-service";
import type { Track } from "../types";

export default function Playlist() {
  const tracks = usePlaylistStore((s) => s.tracks);
  const setTracks = usePlaylistStore((s) => s.setTracks);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const setTrack = usePlayerStore((s) => s.setTrack);

  async function handleOpenFolder() {
    const dir = await selectMusicFolder();
    if (!dir) return;
    const scanned = await scanMusicFiles(dir);
    setTracks(scanned);
  }

  function handleSelect(track: Track) {
    setTrack(track);
  }

  return (
    <div className="playlist">
      <div className="playlist-header">
        <span className="playlist-title">播放列表 ({tracks.length})</span>
        <button className="playlist-open-btn" onClick={handleOpenFolder}>
          打开文件夹
        </button>
      </div>
      <div className="playlist-list">
        {tracks.map((track) => (
          <div
            key={track.id}
            className={`playlist-item ${track.id === currentTrack?.id ? "playlist-item-active" : ""}`}
            onClick={() => handleSelect(track)}
          >
            <span className="playlist-item-name">{track.fileName}</span>
            {track.lrcPath && <span className="playlist-item-lrc">词</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
