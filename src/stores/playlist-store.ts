import { create } from "zustand";
import type { Track } from "../types";

interface PlaylistState {
  tracks: Track[];
  setTracks: (tracks: Track[]) => void;
  addTracks: (tracks: Track[]) => void;
  clearTracks: () => void;
}

export const usePlaylistStore = create<PlaylistState>((set) => ({
  tracks: [],
  setTracks: (tracks) => set({ tracks }),
  addTracks: (newTracks) =>
    set((s) => ({ tracks: [...s.tracks, ...newTracks] })),
  clearTracks: () => set({ tracks: [] }),
}));

export function getNextTrack(
  tracks: Track[],
  currentId: string,
): Track | null {
  const idx = tracks.findIndex((t) => t.id === currentId);
  if (idx === -1 || idx >= tracks.length - 1) return null;
  return tracks[idx + 1] ?? null;
}

export function getPrevTrack(
  tracks: Track[],
  currentId: string,
): Track | null {
  const idx = tracks.findIndex((t) => t.id === currentId);
  if (idx <= 0) return null;
  return tracks[idx - 1] ?? null;
}
