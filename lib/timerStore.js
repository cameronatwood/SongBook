import { create } from "zustand";

export const useTimerStore = create((set, get) => ({
  isRunning: false,
  songId: null,
  songTitle: null,
  songArtist: null,
  startedAt: null,
  elapsed: 0,
  intervalRef: null,

  startTimer: (song) => {
    const existing = get().intervalRef;
    if (existing) clearInterval(existing);

    const startedAt = Date.now();
    const ref = setInterval(() => {
      set({ elapsed: Math.floor((Date.now() - startedAt) / 1000) });
    }, 1000);

    set({
      isRunning: true,
      songId: song.id,
      songTitle: song.title,
      songArtist: song.artist,
      startedAt,
      elapsed: 0,
      intervalRef: ref,
    });
  },

  stopTimer: () => {
    const ref = get().intervalRef;
    if (ref) clearInterval(ref);
    const elapsed = get().elapsed;
    set({ isRunning: false, songId: null, songTitle: null, songArtist: null, startedAt: null, elapsed: 0, intervalRef: null });
    return elapsed;
  },
}));