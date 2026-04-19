import { useState, useEffect, useRef, useMemo } from "react";
import Lyric from "lrc-file-parser";
import type { Lines } from "lrc-file-parser";
import { emitTo } from "@tauri-apps/api/event";
import { usePlayerStore } from "../stores/player-store";
import { readLrcFile } from "../services/file-service";
import { EVENT_LYRIC_UPDATE } from "../constants";
import type { LyricLine, LyricPayload } from "../types";

export function useLyric() {
  const [lines, setLines] = useState<LyricLine[]>([]);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const showDesktopLyric = usePlayerStore((s) => s.showDesktopLyric);

  const showDesktopLyricRef = useRef(showDesktopLyric);
  showDesktopLyricRef.current = showDesktopLyric;

  useEffect(() => {
    setLines([]);
    if (!currentTrack?.lrcPath) return;

    let cancelled = false;

    async function loadLyric() {
      if (!currentTrack?.lrcPath) return;
      const lrcText = await readLrcFile(currentTrack.lrcPath);
      if (cancelled) return;

      new Lyric({
        lyric: lrcText,
        onPlay: () => {},
        onSetLyric: (parsedLines: Lines) => {
          if (cancelled) return;
          setLines(parsedLines.map((l) => ({ time: l.time, text: l.text })));
        },
      });
    }

    loadLyric();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id, currentTrack?.lrcPath]);

  const currentLineIndex = useMemo(() => {
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].time <= currentTime) return i;
    }
    return -1;
  }, [currentTime, lines]);

  useEffect(() => {
    if (currentLineIndex < 0 || !showDesktopLyricRef.current) return;
    const line = lines[currentLineIndex];
    const nextLine = lines[currentLineIndex + 1];
    const payload: LyricPayload = { text: line.text, nextText: nextLine?.text ?? "" };
    emitTo("desktop-lyric", EVENT_LYRIC_UPDATE, payload).catch(() => {});
  }, [currentLineIndex, lines]);

  return { lines, currentLineIndex };
}
