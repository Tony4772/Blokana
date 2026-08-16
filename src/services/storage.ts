/** Persistencia local (offline-first). Preparado para sincronización futura. */
import { STORAGE_KEY } from "../game/constants";
import type { Board } from "../game/board";
import type { Piece } from "../game/pieces";

export interface Settings {
  music: boolean;
  sfx: boolean;
  vibration: boolean;
  theme: "andina" | "noche";
}

export interface Stats {
  partidas: number;
  lineasTotales: number;
  puntosTotales: number;
  mejorCombo: number;
  mejorPuntuacion: number;
}

export interface SavedGame {
  board: Board;
  tray: (Piece | null)[];
  score: number;
  lines: number;
  combo: number;
  maxCombo: number;
}

export interface SaveData {
  settings: Settings;
  stats: Stats;
  current: SavedGame | null;
}

export const DEFAULT_SETTINGS: Settings = {
  music: false,
  sfx: true,
  vibration: true,
  theme: "andina",
};

export const DEFAULT_STATS: Stats = {
  partidas: 0,
  lineasTotales: 0,
  puntosTotales: 0,
  mejorCombo: 0,
  mejorPuntuacion: 0,
};

const DEFAULTS: SaveData = { settings: DEFAULT_SETTINGS, stats: DEFAULT_STATS, current: null };

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      stats: { ...DEFAULT_STATS, ...(parsed.stats ?? {}) },
      current: parsed.current ?? null,
    };
  } catch {
    return DEFAULTS;
  }
}

let pending: number | null = null;
let cache: SaveData | null = null;

/** Guardado diferido para no bloquear el hilo principal durante la partida. */
export function saveData(data: SaveData) {
  cache = data;
  if (pending !== null) return;
  pending = window.setTimeout(() => {
    pending = null;
    try {
      if (cache) localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch {
      /* cuota llena: ignorar */
    }
  }, 350);
}

export function flushSave() {
  if (pending !== null) {
    clearTimeout(pending);
    pending = null;
  }
  try {
    if (cache) localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* noop */
  }
}
