import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import TitleBar from "./components/TitleBar";
import Sidebar from "./components/Sidebar";
import Playlist from "./components/Playlist";
import FolderView from "./components/FolderView";
import LyricsImmersion from "./components/LyricsImmersion";
import Player from "./components/Player";
import { usePlayerStore } from "./stores/player-store";
import { useNavStore } from "./stores/nav-store";
import { useAudio } from "./hooks/use-audio";
import { EVENT_TRAY_PLAY_PAUSE } from "./constants";
import "./styles/app.css";

function App() {
  useAudio();
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const activeView = useNavStore((s) => s.activeView);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    listen(EVENT_TRAY_PLAY_PAUSE, () => {
      togglePlay();
    }).then((fn) => {
      unlisten = fn;
    });
    return () => {
      unlisten?.();
    };
  }, [togglePlay]);

  return (
    <div className="app">
      <TitleBar />
      {activeView === "lyrics-immersion" ? (
        <LyricsImmersion />
      ) : (
        <div className="app-body">
          <Sidebar />
          <main className="main-content">
            {activeView === "songs" && <Playlist />}
            {activeView === "folders" && <FolderView />}
          </main>
        </div>
      )}
      {activeView !== "lyrics-immersion" && <Player />}
    </div>
  );
}

export default App;
