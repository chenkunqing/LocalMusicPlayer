import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { EVENT_LYRIC_UPDATE } from "./constants";
import type { LyricPayload } from "./types";
import "./styles/desktop-lyric.css";

function DesktopLyric() {
  const [text, setText] = useState("桌面歌词");
  const [nextText, setNextText] = useState("");

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    listen<LyricPayload>(EVENT_LYRIC_UPDATE, (event) => {
      setText(event.payload.text || "\u00A0");
      setNextText(event.payload.nextText || "");
    }).then((fn) => {
      unlisten = fn;
    });
    return () => {
      unlisten?.();
    };
  }, []);

  const appWindow = getCurrentWindow();

  return (
    <div
      className="desktop-lyric"
      onMouseDown={(e) => {
        if (e.button === 0) {
          appWindow.startDragging();
        }
      }}
      onDoubleClick={() => {
        appWindow.hide();
      }}
    >
      <div className="lyric-content">
        <div className="lyric-text lyric-text-current">{text}</div>
        {nextText && <div className="lyric-text lyric-text-next">{nextText}</div>}
      </div>
    </div>
  );
}

export default DesktopLyric;
