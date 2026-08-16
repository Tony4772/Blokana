import { memo } from "react";
import type { Piece } from "../game/pieces";
import { Block } from "./Block";

interface Props {
  piece: Piece;
  cell: number;
  gap: number;
  faded?: boolean;
}

/** Dibuja una pieza con posicionamiento absoluto (barato de renderizar). */
function PieceViewBase({ piece, cell, gap, faded }: Props) {
  const pitch = cell + gap;
  const w = piece.shape.w * pitch - gap;
  const h = piece.shape.h * pitch - gap;
  return (
    <div
      className="relative"
      style={{ width: w, height: h, opacity: faded ? 0.28 : 1, filter: faded ? "grayscale(.7)" : undefined }}
    >
      {piece.shape.cells.map(([r, c], i) => (
        <div key={i} className="absolute" style={{ left: c * pitch, top: r * pitch }}>
          <Block color={piece.color} size={cell} />
        </div>
      ))}
    </div>
  );
}

export const PieceView = memo(PieceViewBase);
