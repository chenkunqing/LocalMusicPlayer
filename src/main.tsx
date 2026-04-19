import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import DesktopLyric from "./DesktopLyric";
import "./styles/global.css";

const isDesktopLyric = window.location.pathname === "/desktop-lyric";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {isDesktopLyric ? <DesktopLyric /> : <App />}
  </React.StrictMode>,
);
