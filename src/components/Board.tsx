import { forwardRef, memo } from "react";
import { GRID } from "../game/constants";
import type { Board as BoardType } from "../game/board";
import type { ColorKey } from "../game/constants";
import { Block } from "./Block";

export interface BoardGeom {
  cell: number;
  gap: number;
  pad: number;
}

interface Props {
  board: BoardType;
  geom: BoardGeom;
  clearing: number[];
  previewCells: number[];
  previewColor: ColorKey | null;
  previewValid: boolean;
}

const BoardView = forwardRef<HTMLDivElement, Props>(function BoardView(
  { board, geom, clearing, previewCells, previewColor, previewValid },
  ref,
) {
  const { cell, gap, pad } = geom;
  const clearSet = clearing.length ? new Set(clearing) : null;
  const prevSet = previewCells.length ? new Set(previewCells) : null;
  const size = GRID * cell + (GRID - 1) * gap + pad * 2;

  return (
    <div
      ref={ref}
      className="relative rounded-[18px] bg-[#141d33]/85 ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,.45)]"
      style={{ width: size, height: size, padding: pad, touchAction: "none" }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${GRID}, ${cell}px)`,
          gridAutoRows: `${cell}px`,
          gap,
        }}
      >
        {board.map((c, i) => {
          const isPrev = prevSet?.has(i);
          const isClearing = clearSet?.has(i);
          return (
            <div
              key={i}
              className="relative rounded-[22%] bg-white/[0.045] ring-1 ring-white/[0.05]"
              style={{ width: cell, height: cell }}
            >
              {c && (
                <div className="absolute inset-0">
                  <Block
                    color={c}
                    size={cell}
                    clearing={!!isClearing}
                    delay={isClearing ? ((i % GRID) + Math.floor(i / GRID)) * 12 : 0}
                  />
                </div>
              )}
              {!c && isPrev && previewColor && (
                <div className="absolute inset-0">
                  <Block color={previewColor} size={cell} ghost invalid={!previewValid} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default memo(BoardView);
