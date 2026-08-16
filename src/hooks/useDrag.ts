/** Arrastre táctil/ratón de piezas con previsualización sobre el tablero. */
import { useCallback, useEffect, useRef, useState } from "react";
import { GRID, idxSafe } from "../game/helpers";
import { canPlace, type Board } from "../game/board";
import type { Piece } from "../game/pieces";
import { audio } from "../services/audio";
import type { BoardGeom } from "../components/Board";

export interface DragState {
  index: number;
  piece: Piece;
  x: number;
  y: number;
}

export interface DropTarget {
  row: number;
  col: number;
  valid: boolean;
  cells: number[];
}

interface Params {
  board: Board;
  geom: BoardGeom;
  boardRef: React.RefObject<HTMLDivElement | null>;
  onDrop: (index: number, row: number, col: number) => boolean;
  enabled: boolean;
}

export function useDrag({ board, geom, boardRef, onDrop, enabled }: Params) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const [target, setTarget] = useState<DropTarget | null>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const targetRef = useRef<DropTarget | null>(null);
  const raf = useRef(0);

  const pitch = geom.cell + geom.gap;

  const computeTarget = useCallback(
    (piece: Piece, x: number, y: number): DropTarget | null => {
      const rect = rectRef.current;
      if (!rect) return null;
      const pw = piece.shape.w * pitch - geom.gap;
      const ph = piece.shape.h * pitch - geom.gap;
      const left = x - pw / 2;
      const top = y - ph - geom.cell * 0.75;
      const col = Math.round((left - (rect.left + geom.pad)) / pitch);
      const row = Math.round((top - (rect.top + geom.pad)) / pitch);
      if (row < -1 || col < -1 || row > GRID || col > GRID) return null;
      const valid = canPlace(board, piece, row, col);
      const cells = valid
        ? piece.shape.cells.map(([dr, dc]) => idxSafe(row + dr, col + dc))
        : [];
      return { row, col, valid, cells };
    },
    [board, geom.cell, geom.gap, geom.pad, pitch],
  );

  const start = useCallback(
    (index: number, piece: Piece, x: number, y: number) => {
      if (!enabled) return;
      rectRef.current = boardRef.current?.getBoundingClientRect() ?? null;
      const st = { index, piece, x, y };
      dragRef.current = st;
      setDrag(st);
      const t = computeTarget(piece, x, y);
      targetRef.current = t;
      setTarget(t);
      audio.unlock();
      audio.play("tomar");
    },
    [enabled, boardRef, computeTarget],
  );

  useEffect(() => {
    if (!drag) return;

    const move = (e: PointerEvent) => {
      e.preventDefault();
      const cur = dragRef.current;
      if (!cur) return;
      const x = e.clientX;
      const y = e.clientY;
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        const next = { ...cur, x, y };
        dragRef.current = next;
        setDrag(next);
        const t = computeTarget(next.piece, x, y);
        const prev = targetRef.current;
        if (
          !prev ||
          !t ||
          prev.row !== t.row ||
          prev.col !== t.col ||
          prev.valid !== t.valid
        ) {
          targetRef.current = t;
          setTarget(t);
        }
      });
    };

    const end = () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
        raf.current = 0;
      }
      const cur = dragRef.current;
      const t = targetRef.current;
      if (cur && t && t.valid) onDrop(cur.index, t.row, t.col);
      dragRef.current = null;
      targetRef.current = null;
      setDrag(null);
      setTarget(null);
    };

    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [drag, computeTarget, onDrop]);

  return { drag, target, start };
}
