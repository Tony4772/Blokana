/** Tablero de BLOKANA: representación y operaciones puras. */
import { GRID, CELLS, type ColorKey } from "./constants";
import type { Piece } from "./pieces";

export type BoardCell = ColorKey | null;
export type Board = BoardCell[];

export const createBoard = (): Board => new Array<BoardCell>(CELLS).fill(null);

export const idx = (r: number, c: number) => r * GRID + c;

export function canPlace(board: Board, piece: Piece, row: number, col: number): boolean {
  const { cells } = piece.shape;
  for (let i = 0; i < cells.length; i++) {
    const r = row + cells[i][0];
    const c = col + cells[i][1];
    if (r < 0 || c < 0 || r >= GRID || c >= GRID) return false;
    if (board[idx(r, c)] !== null) return false;
  }
  return true;
}

export function placePiece(
  board: Board,
  piece: Piece,
  row: number,
  col: number,
): { board: Board; filled: number[] } {
  const next = board.slice();
  const filled: number[] = [];
  for (const [dr, dc] of piece.shape.cells) {
    const i = idx(row + dr, col + dc);
    next[i] = piece.color;
    filled.push(i);
  }
  return { board: next, filled };
}

export interface ClearResult {
  rows: number[];
  cols: number[];
  cleared: number[];
}

export function findClears(board: Board): ClearResult {
  const rows: number[] = [];
  const cols: number[] = [];
  for (let r = 0; r < GRID; r++) {
    let full = true;
    for (let c = 0; c < GRID; c++) if (board[idx(r, c)] === null) { full = false; break; }
    if (full) rows.push(r);
  }
  for (let c = 0; c < GRID; c++) {
    let full = true;
    for (let r = 0; r < GRID; r++) if (board[idx(r, c)] === null) { full = false; break; }
    if (full) cols.push(c);
  }
  const set = new Set<number>();
  rows.forEach((r) => { for (let c = 0; c < GRID; c++) set.add(idx(r, c)); });
  cols.forEach((c) => { for (let r = 0; r < GRID; r++) set.add(idx(r, c)); });
  return { rows, cols, cleared: [...set] };
}

export function applyClears(board: Board, cleared: number[]): Board {
  if (!cleared.length) return board;
  const next = board.slice();
  for (const i of cleared) next[i] = null;
  return next;
}

export function pieceFits(board: Board, piece: Piece): boolean {
  const maxR = GRID - piece.shape.h;
  const maxC = GRID - piece.shape.w;
  for (let r = 0; r <= maxR; r++)
    for (let c = 0; c <= maxC; c++) if (canPlace(board, piece, r, c)) return true;
  return false;
}

export function hasAnyMove(board: Board, pieces: (Piece | null)[]): boolean {
  return pieces.some((p) => p && pieceFits(board, p));
}

/** Cuenta cuántas celdas ocupadas hay (para dificultad/estadística). */
export const occupancy = (board: Board) => board.reduce((n, c) => (c ? n + 1 : n), 0);
