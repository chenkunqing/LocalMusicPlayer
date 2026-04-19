import { create } from "zustand";
import type { ViewType } from "../types";

interface NavState {
  activeView: ViewType;
  previousView: ViewType;
  currentFolder: string | null;
  folderHistory: string[];
  setView: (view: ViewType) => void;
  navigateToFolder: (path: string) => void;
  goBackFolder: () => void;
  setRootFolder: (path: string) => void;
}

export const useNavStore = create<NavState>((set, get) => ({
  activeView: "songs",
  previousView: "songs",
  currentFolder: null,
  folderHistory: [],
  setView: (view) =>
    set((s) => ({
      activeView: view,
      previousView: s.activeView === "lyrics-immersion" ? s.previousView : s.activeView,
    })),
  navigateToFolder: (path) =>
    set((s) => ({
      currentFolder: path,
      folderHistory: [...s.folderHistory, path],
    })),
  goBackFolder: () => {
    const { folderHistory } = get();
    if (folderHistory.length <= 1) return;
    const newHistory = folderHistory.slice(0, -1);
    set({
      folderHistory: newHistory,
      currentFolder: newHistory[newHistory.length - 1] ?? null,
    });
  },
  setRootFolder: (path) =>
    set({
      currentFolder: path,
      folderHistory: [path],
      activeView: "folders",
    }),
}));
