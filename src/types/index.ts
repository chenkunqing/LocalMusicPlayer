export interface Track {
  id: string;
  filePath: string;
  fileName: string;
  extension: string;
  lrcPath: string | null;
}

export interface LyricLine {
  time: number;
  text: string;
}

export interface LyricPayload {
  text: string;
  nextText: string;
}

export interface FolderEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

export type ViewType = "songs" | "folders" | "lyrics-immersion";
