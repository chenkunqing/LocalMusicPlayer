import { useState, useEffect, useCallback } from "react";
import { useNavStore } from "../stores/nav-store";
import { usePlaylistStore } from "../stores/playlist-store";
import { usePlayerStore } from "../stores/player-store";
import { scanFolderContents, scanMusicFiles } from "../services/file-service";
import type { FolderEntry } from "../types";

export default function FolderView() {
  const currentFolder = useNavStore((s) => s.currentFolder);
  const folderHistory = useNavStore((s) => s.folderHistory);
  const navigateToFolder = useNavStore((s) => s.navigateToFolder);
  const goBackFolder = useNavStore((s) => s.goBackFolder);
  const setTracks = usePlaylistStore((s) => s.setTracks);
  const setTrack = usePlayerStore((s) => s.setTrack);

  const [folders, setFolders] = useState<FolderEntry[]>([]);
  const [audioFiles, setAudioFiles] = useState<FolderEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadContents = useCallback(async (dirPath: string) => {
    setLoading(true);
    try {
      const result = await scanFolderContents(dirPath);
      setFolders(result.folders);
      setAudioFiles(result.audioFiles);
    } catch {
      setFolders([]);
      setAudioFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentFolder) {
      loadContents(currentFolder);
    }
  }, [currentFolder, loadContents]);

  if (!currentFolder) {
    return (
      <div className="folder-view">
        <div className="folder-empty">
          <div className="folder-empty-icon">📂</div>
          <p>暂未打开文件夹</p>
          <p className="folder-empty-hint">在侧边栏点击「打开文件夹」选择音乐目录</p>
        </div>
      </div>
    );
  }

  function buildBreadcrumb(): { label: string; path: string }[] {
    if (!currentFolder) return [];
    const separator = currentFolder.includes("\\") ? "\\" : "/";
    const parts = currentFolder.split(separator);
    const crumbs: { label: string; path: string }[] = [];
    for (let i = 0; i < parts.length; i++) {
      crumbs.push({
        label: parts[i] ?? "",
        path: parts.slice(0, i + 1).join(separator),
      });
    }
    return crumbs;
  }

  async function handleClickAudio(entry: FolderEntry) {
    if (!currentFolder) return;
    const scanned = await scanMusicFiles(currentFolder);
    setTracks(scanned);
    const target = scanned.find((t) => t.filePath === entry.path);
    if (target) setTrack(target);
  }

  const breadcrumb = buildBreadcrumb();

  return (
    <div className="folder-view">
      <div className="folder-breadcrumb">
        {folderHistory.length > 1 && (
          <button className="folder-back-btn" onClick={goBackFolder}>
            ←
          </button>
        )}
        {breadcrumb.map((crumb, idx) => (
          <span key={crumb.path} className="folder-breadcrumb-item">
            {idx > 0 && <span className="folder-breadcrumb-sep">›</span>}
            <span
              className={idx === breadcrumb.length - 1 ? "folder-breadcrumb-current" : "folder-breadcrumb-link"}
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </div>

      {loading ? (
        <div className="folder-loading">加载中...</div>
      ) : (
        <div className="folder-grid">
          {folders.map((folder) => (
            <div
              key={folder.path}
              className="folder-card"
              onClick={() => navigateToFolder(folder.path)}
            >
              <div className="folder-card-icon">
                <span className="folder-card-icon-emoji">📁</span>
              </div>
              <p className="folder-card-name">{folder.name}</p>
            </div>
          ))}
          {audioFiles.map((file) => (
            <div
              key={file.path}
              className="folder-card folder-card-audio"
              onClick={() => handleClickAudio(file)}
            >
              <div className="folder-card-icon folder-card-icon-audio">
                <span className="folder-card-icon-emoji">♪</span>
                <div className="folder-card-play-overlay">▶</div>
              </div>
              <p className="folder-card-name">{file.name}</p>
            </div>
          ))}
          {folders.length === 0 && audioFiles.length === 0 && (
            <div className="folder-empty-dir">此文件夹为空</div>
          )}
        </div>
      )}
    </div>
  );
}
