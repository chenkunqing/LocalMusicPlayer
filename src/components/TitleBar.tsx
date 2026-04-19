import { getCurrentWindow } from "@tauri-apps/api/window";

export default function TitleBar() {
  const appWindow = getCurrentWindow();

  return (
    <div className="titlebar" onMouseDown={(e) => {
      if ((e.target as HTMLElement).closest(".titlebar-btn")) return;
      appWindow.startDragging();
    }}>
      <div className="titlebar-brand">
        <span className="titlebar-icon">♫</span>
        <span className="titlebar-title">PureTune Player 2026</span>
      </div>
      <div className="titlebar-buttons">
        <button
          className="titlebar-btn titlebar-btn-minimize"
          onClick={() => appWindow.minimize()}
        >
          &#x2014;
        </button>
        <button
          className="titlebar-btn titlebar-btn-close"
          onClick={() => appWindow.close()}
        >
          &#x2715;
        </button>
      </div>
    </div>
  );
}
