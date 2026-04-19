import { open } from "@tauri-apps/plugin-dialog";
import { readDir, readTextFile } from "@tauri-apps/plugin-fs";
import { AUDIO_EXTENSIONS, LRC_EXTENSION } from "../constants";
import type { Track } from "../types";

export async function selectMusicFolder(): Promise<string | null> {
  const selected = await open({
    directory: true,
    multiple: false,
    title: "选择音乐文件夹",
  });
  return selected;
}

export async function scanMusicFiles(dirPath: string): Promise<Track[]> {
  const entries = await readDir(dirPath);
  const audioFiles: string[] = [];
  const lrcFiles = new Set<string>();

  for (const entry of entries) {
    if (!entry.name || entry.isDirectory) continue;
    const ext = entry.name.split(".").pop()?.toLowerCase() ?? "";
    if (AUDIO_EXTENSIONS.includes(ext as (typeof AUDIO_EXTENSIONS)[number])) {
      audioFiles.push(entry.name);
    } else if (ext === LRC_EXTENSION) {
      lrcFiles.add(entry.name);
    }
  }

  return audioFiles.map((name) => {
    const dotIndex = name.lastIndexOf(".");
    const fileName = name.slice(0, dotIndex);
    const extension = name.slice(dotIndex + 1).toLowerCase();
    const lrcName = `${fileName}.${LRC_EXTENSION}`;
    const separator = dirPath.includes("\\") ? "\\" : "/";
    return {
      id: `${dirPath}${separator}${name}`,
      filePath: `${dirPath}${separator}${name}`,
      fileName,
      extension,
      lrcPath: lrcFiles.has(lrcName) ? `${dirPath}${separator}${lrcName}` : null,
    };
  });
}

export async function readLrcFile(lrcPath: string): Promise<string> {
  return readTextFile(lrcPath);
}
