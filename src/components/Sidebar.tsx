import { useNavStore } from "../stores/nav-store";
import { usePlaylistStore } from "../stores/playlist-store";
import { selectMusicFolder, scanMusicFiles } from "../services/file-service";

export default function Sidebar() {
  const activeView = useNavStore((s) => s.activeView);
  const setView = useNavStore((s) => s.setView);
  const setRootFolder = useNavStore((s) => s.setRootFolder);
  const setTracks = usePlaylistStore((s) => s.setTracks);
  const trackCount = usePlaylistStore((s) => s.tracks.length);

  async function handleOpenFolder() {
    const dir = await selectMusicFolder();
    if (!dir) return;
    const scanned = await scanMusicFiles(dir);
    setTracks(scanned);
    setRootFolder(dir);
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <button className="sidebar-open-btn" onClick={handleOpenFolder}>
          <span className="sidebar-open-icon">+</span>
          打开文件夹
        </button>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">音乐库</div>
        <button
          className={`sidebar-nav-item ${activeView === "songs" ? "sidebar-nav-item-active" : ""}`}
          onClick={() => setView("songs")}
        >
          <span className="sidebar-nav-icon">♪</span>
          <span>全部歌曲</span>
          {trackCount > 0 && (
            <span className="sidebar-nav-count">{trackCount}</span>
          )}
        </button>
        <button
          className={`sidebar-nav-item ${activeView === "folders" ? "sidebar-nav-item-active" : ""}`}
          onClick={() => setView("folders")}
        >
          <span className="sidebar-nav-icon">📂</span>
          <span>文件夹</span>
        </button>
      </nav>
    </aside>
  );
}
