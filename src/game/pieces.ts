/** Sistema de piezas de BLOKANA. */
import { COLOR_KEYS, type ColorKey } from "./constants";

export type Cell = [number, number]; // [fila, columna]

export interface ShapeDef {
  id: string;
  cells: Cell[];
  w: number;
  h: number;
  /** peso relativo de aparición */
  weight: number;
}

export interface Piece {
  uid: string;
  shape: ShapeDef;
  color: ColorKey;
}

function def(id: string, rows: string[], weight = 1): ShapeDef {
  const cells: Cell[] = [];
  rows.forEach((row, r) =>
    row.split("").forEach((ch, c) => {
      if (ch !== "." && ch !== " ") cells.push([r, c]);
    }),
  );
  return { id, cells, w: Math.max(...rows.map((r) => r.length)), h: rows.length, weight };
}

/** Catálogo de formas (sin rotación dinámica: cada variante es una forma). */
export const SHAPES: ShapeDef[] = [
  def("uno", ["X"], 2.2),
  def("dos-h", ["XX"], 2.4),
  def("dos-v", ["X", "X"], 2.4),
  def("tres-h", ["XXX"], 2.2),
  def("tres-v", ["X", "X", "X"], 2.2),
  def("cuatro-h", ["XXXX"], 1.5),
  def("cuatro-v", ["X", "X", "X", "X"], 1.5),
  def("cinco-h", ["XXXXX"], 0.6),
  def("cinco-v", ["X", "X", "X", "X", "X"], 0.6),
  def("cuadro2", ["XX", "XX"], 2.0),
  def("cuadro3", ["XXX", "XXX", "XXX"], 0.35),
  def("l1", ["X.", "XX"], 1.6),
  def("l2", ["XX", "X."], 1.6),
  def("l3", ["XX", ".X"], 1.6),
  def("l4", [".X", "XX"], 1.6),
  def("l5", ["X..", "X..", "XXX"], 0.9),
  def("l6", ["XXX", "X..", "X.."], 0.9),
  def("l7", ["XXX", "..X", "..X"], 0.9),
  def("l8", ["..X", "..X", "XXX"], 0.9),
  def("t1", ["XXX", ".X."], 0.8),
  def("t2", [".X.", "XXX"], 0.8),
  def("t3", ["X.", "XX", "X."], 0.8),
  def("t4", [".X", "XX", ".X"], 0.8),
  def("s1", [".XX", "XX."], 0.6),
  def("s2", ["XX.", ".XX"], 0.6),
  def("s3", ["X.", "XX", ".X"], 0.6),
  def("s4", [".X", "XX", "X."], 0.6),
  def("rect23", ["XXX", "XXX"], 0.7),
  def("rect32", ["XX", "XX", "XX"], 0.7),
];

const TOTAL_WEIGHT = SHAPES.reduce((s, x) => s + x.weight, 0);

let uidSeq = 0;
export function nextUid(): string {
  uidSeq += 1;
  return `p${uidSeq}`;
}

export function randomShape(): ShapeDef {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const s of SHAPES) {
    r -= s.weight;
    if (r <= 0) return s;
  }
  return SHAPES[0];
}

export function randomColor(): ColorKey {
  return COLOR_KEYS[(Math.random() * COLOR_KEYS.length) | 0];
}

export function makePiece(shape = randomShape()): Piece {
  return { uid: nextUid(), shape, color: randomColor() };
}

export function makeTray(count: number): Piece[] {
  return Array.from({ length: count }, () => makePiece());
}
