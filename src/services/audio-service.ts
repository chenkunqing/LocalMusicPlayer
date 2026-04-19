import { readFile } from "@tauri-apps/plugin-fs";
import { MIME_MAP } from "../constants";

let currentBlobUrl: string | null = null;

export async function createAudioBlobUrl(
  filePath: string,
  extension: string,
): Promise<string> {
  revokePreviousBlobUrl();
  const bytes = await readFile(filePath);
  const mime = MIME_MAP[extension] ?? "audio/mpeg";
  const blob = new Blob([bytes], { type: mime });
  currentBlobUrl = URL.createObjectURL(blob);
  return currentBlobUrl;
}

export function revokePreviousBlobUrl(): void {
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = null;
  }
}
