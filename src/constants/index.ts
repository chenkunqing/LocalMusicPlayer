export const AUDIO_EXTENSIONS = ["mp3", "flac", "wav", "ogg"] as const;

export const LRC_EXTENSION = "lrc";

export const MIME_MAP: Record<string, string> = {
  mp3: "audio/mpeg",
  flac: "audio/flac",
  wav: "audio/wav",
  ogg: "audio/ogg",
};

export const EVENT_LYRIC_UPDATE = "lyric-update";
export const EVENT_TRAY_PLAY_PAUSE = "tray-play-pause";
