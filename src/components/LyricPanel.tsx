import { useEffect, useRef } from "react";
import { useLyric } from "../hooks/use-lyric";

const SCROLL_OFFSET = 160;

export default function LyricPanel() {
  const { lines, currentLineIndex } = useLyric();
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current;
      const active = activeRef.current;
      const top = active.offsetTop - SCROLL_OFFSET;
      container.scrollTo({ top, behavior: "smooth" });
    }
  }, [currentLineIndex]);

  if (lines.length === 0) {
    return (
      <div className="lyric-panel">
        <div className="lyric-empty">暂无歌词</div>
      </div>
    );
  }

  return (
    <div className="lyric-panel" ref={containerRef}>
      <div className="lyric-list">
        {lines.map((line, idx) => (
          <div
            key={`${line.time}-${idx}`}
            ref={idx === currentLineIndex ? activeRef : null}
            className={`lyric-line ${idx === currentLineIndex ? "lyric-line-active" : ""}`}
          >
            {line.text || "\u00A0"}
          </div>
        ))}
      </div>
    </div>
  );
}
