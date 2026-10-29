/** BLOKANA — Constantes globales del juego. EBYZOM */

export const GRID = 8;
export const CELLS = GRID * GRID;
export const TRAY_SIZE = 3;

/** Paleta propia BLOKANA: colores vivos con inspiración andina moderna. */
export type ColorKey =
  | "esmeralda"
  | "cobalto"
  | "solar"
  | "coral"
  | "violeta"
  | "turquesa"
  | "mandarina";

export const COLORS: Record<ColorKey, { base: string; light: string; dark: string }> = {
  esmeralda: { base: "#34A853", light: "#6FD98A", dark: "#1E7A38" },
  cobalto: { base: "#3B6FC4", light: "#7BA5EE", dark: "#26498A" },
  solar: { base: "#F5B429", light: "#FFD771", dark: "#B8811A" },
  coral: { base: "#EF4F5F", light: "#FF8894", dark: "#B22F3C" },
  violeta: { base: "#8B5CF6", light: "#BCA0FF", dark: "#5E36BC" },
  turquesa: { base: "#22B8C6", light: "#6FE4EE", dark: "#127B86" },
  mandarina: { base: "#F97316", light: "#FFAA63", dark: "#B94E07" },
};

export const COLOR_KEYS = Object.keys(COLORS) as ColorKey;

/** Puntuación */
export const PTS_PER_CELL = 1;
export const PTS_PER_LINE = 10;
export const MULTI_LINE_BONUS = [0, 0, 20, 60, 120, 220, 350, 500, 700, 900];
export const COMBO_BONUS = 15;

/** Progresión de niveles: líneas necesarias para pasar al siguiente nivel */
export const LINES_PER_LEVEL_STEP = 5; // cada nivel requiere 5 líneas más que el anterior
export const LINES_TO_LEVEL_1 = 5; // para pasar del nivel 1 al 2 se necesitan 5 líneas

export const STORAGE_KEY = "blokana.save.v1";
export const BRAND = "EBYZOM";
export const GAME_NAME = "BLOKANA";