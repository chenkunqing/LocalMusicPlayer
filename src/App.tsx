import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import TitleBar from "./components/TitleBar";
import Playlist from "./components/Playlist";
import LyricPanel from "./components/LyricPanel";
import Player from "./components/Player";
import { usePlayerStore } from "./stores/player-store";
import { EVENT_TRAY_PLAY_PAUSE } from "./constants";
import "./styles/app.css";

function App() {
  const togglePlay = usePlayerStore((s) => s.togglePlay);

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
      <div className="app-body">
        <Playlist />
        <LyricPanel />
      </div>
      <Player />
    </div>
  );
}

export default App;
