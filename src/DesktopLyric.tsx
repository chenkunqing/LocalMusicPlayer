import { useState, useEffect, useRef } from "react";
import { listen, emitTo } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { EVENT_LYRIC_UPDATE, EVENT_DESKTOP_LYRIC_HIDDEN } from "./constants";
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
  const lastMouseDown = useRef(0);

  return (
    <div
      className="desktop-lyric"
      onMouseDown={(e) => {
        if (e.button !== 0) return;
        const now = Date.now();
        if (now - lastMouseDown.current < 300) {
          lastMouseDown.current = 0;
          appWindow.hide();
          emitTo("main", EVENT_DESKTOP_LYRIC_HIDDEN);
        } else {
          lastMouseDown.current = now;
          appWindow.startDragging();
        }
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
