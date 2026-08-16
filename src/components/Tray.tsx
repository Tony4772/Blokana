import { memo } from "react";
import type { Piece } from "../game/pieces";
import { PieceView } from "./PieceView";

interface Props {
  tray: (Piece | null)[];
  cell: number;
  gap: number;
  slotHeight: number;
  draggingIndex: number | null;
  fits: boolean[];
  onPick: (index: number, piece: Piece, x: number, y: number) => void;
}

function TrayBase({ tray, cell, gap, slotHeight, draggingIndex, fits, onPick }: Props) {
  return (
    <div
      className="grid w-full max-w-[520px] grid-cols-3 gap-2 px-3"
      style={{ touchAction: "none" }}
    >
      {tray.map((piece, i) => (
        <div
          key={piece?.uid ?? `vacio-${i}`}
          className="flex items-center justify-center rounded-2xl bg-white/[0.05] ring-1 ring-white/[0.07]"
          style={{ height: slotHeight, touchAction: "none" }}
          onPointerDown={(e) => {
            if (!piece) return;
            e.preventDefault();
            onPick(i, piece, e.clientX, e.clientY);
          }}
        >
          {piece && draggingIndex !== i && (
            <div
              className="pop-in"
              style={{
                transform: `scale(${Math.min(1, 4 / piece.shape.h, 4 / piece.shape.w)})`,
              }}
            >
              <PieceView piece={piece} cell={cell} gap={gap} faded={!fits[i]} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export const Tray = memo(TrayBase);
