/** Motor de puntuación de BLOKANA. */
import { COMBO_BONUS, MULTI_LINE_BONUS, PTS_PER_CELL, PTS_PER_LINE } from "./constants";

export interface ScoreInput {
  cellsPlaced: number;
  lines: number;
  combo: number; // combo consecutivo previo (0 = primero)
}

export interface ScoreOutput {
  total: number;
  placement: number;
  linePoints: number;
  multiBonus: number;
  comboBonus: number;
}

export function computeScore({ cellsPlaced, lines, combo }: ScoreInput): ScoreOutput {
  const placement = cellsPlaced * PTS_PER_CELL;
  const linePoints = lines * PTS_PER_LINE;
  const multiBonus = MULTI_LINE_BONUS[Math.min(lines, MULTI_LINE_BONUS.length - 1)] ?? 0;
  const comboBonus = lines > 0 && combo > 0 ? combo * COMBO_BONUS : 0;
  return {
    placement,
    linePoints,
    multiBonus,
    comboBonus,
    total: placement + linePoints + multiBonus + comboBonus,
  };
}

export function comboLabel(lines: number, combo: number): string | null {
  if (lines >= 4) return "¡Increíble!";
  if (lines === 3) return "¡Espectacular!";
  if (lines === 2) return "¡Doble!";
  if (combo >= 4) return `¡Combo x${combo}!`;
  if (combo >= 2) return `Combo x${combo}`;
  if (lines === 1) return "¡Bien!";
  return null;
}
