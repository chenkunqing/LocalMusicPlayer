import { create } from "zustand";
import type { Track } from "../types";

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  showDesktopLyric: boolean;
  seekVersion: number;
  setTrack: (track: Track | null) => void;
  setPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setCurrentTime: (ms: number) => void;
  setDuration: (ms: number) => void;
  setVolume: (v: number) => void;
  setShowDesktopLyric: (show: boolean) => void;
  incrementSeekVersion: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  showDesktopLyric: false,
  seekVersion: 0,
  setTrack: (track) => set({ currentTrack: track, currentTime: 0, duration: 0 }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setCurrentTime: (ms) => set({ currentTime: ms }),
  setDuration: (ms) => set({ duration: ms }),
  setVolume: (v) => set({ volume: v }),
  setShowDesktopLyric: (show) => set({ showDesktopLyric: show }),
  incrementSeekVersion: () => set((s) => ({ seekVersion: s.seekVersion + 1 })),
}));
