import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import BoardView, { type BoardGeom } from "../components/Board";
import { Hud } from "../components/Hud";
import { Tray } from "../components/Tray";
import { PieceView } from "../components/PieceView";
import { CreadoPorEbyzom } from "../components/Brand";
import { GRID } from "../game/constants";
import { pieceFits } from "../game/board";
import type { GameApi } from "../hooks/useGame";
import { useDrag } from "../hooks/useDrag";

export default function GameScreen({
  game,
  onOpenSettings,
}: {
  game: GameApi;
  onOpenSettings: () => void;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [geom, setGeom] = useState<BoardGeom>({ cell: 34, gap: 4, pad: 6 });

  useLayoutEffect(() => {
    const measure = () => {
      const el = areaRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      const box = Math.max(200, Math.min(w, h, 520));
      const pad = 6;
      const gap = Math.max(3, Math.round(box * 0.009));
      const cell = Math.floor((box - pad * 2 - gap * (GRID - 1)) / GRID);
      setGeom((prev) =>
        prev.cell === cell && prev.gap === gap ? prev : { cell, gap, pad },
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (areaRef.current) ro.observe(areaRef.current);
    window.addEventListener("orientationchange", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  const onDrop = useCallback(
    (index: number, row: number, col: number) => game.place(index, row, col),
    [game],
  );

  const { drag, target, start } = useDrag({
    board: game.board,
    geom,
    boardRef,
    onDrop,
    enabled: game.screen === "jugando",
  });

  const fits = useMemo(
    () => game.tray.map((p) => (p ? pieceFits(game.board, p) : false)),
    [game.tray, game.board],
  );

  // Botón atrás de Android → pausa / volver
  useEffect(() => {
    const onPop = () => {
      if (game.screen === "jugando") game.pause();
      history.pushState(null, "");
    };
    history.pushState(null, "");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [game]);

  const trayCell = Math.max(14, Math.round(geom.cell * 0.56));
  const trayGap = Math.max(2, Math.round(geom.gap * 0.7));
  const slotHeight = trayCell * 4 + trayGap * 3 + 8;

  const ghost = drag
    ? (() => {
        const pitch = geom.cell + geom.gap;
        const pw = drag.piece.shape.w * pitch - geom.gap;
        const ph = drag.piece.shape.h * pitch - geom.gap;
        return {
          left: drag.x - pw / 2,
          top: drag.y - ph - geom.cell * 0.75,
        };
      })()
    : null;

  return (
    <div className="flex h-full w-full flex-col items-center">
      <Hud
        score={game.score}
        best={game.best}
        combo={game.combo}
        onPause={game.pause}
        onSettings={onOpenSettings}
      />

      <div ref={areaRef} className="relative flex w-full max-w-[520px] flex-1 items-center justify-center px-3 py-2">
        <BoardView
          ref={boardRef}
          board={game.board}
          geom={geom}
          clearing={game.clearing}
          previewCells={target?.cells ?? []}
          previewColor={drag?.piece.color ?? null}
          previewValid={!!target?.valid}
        />

        {/* Mensajes flotantes de combo y puntos */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {game.bursts.map((b, i) => (
            <span
              key={b.id}
              className={`burst absolute left-1/2 font-black drop-shadow-[0_2px_6px_rgba(0,0,0,.6)] ${
                b.kind === "combo"
                  ? "text-3xl text-amber-300"
                  : "text-xl text-emerald-300"
              }`}
              style={{ top: `${42 + i * 10}%` }}
            >
              {b.text}
            </span>
          ))}
        </div>
      </div>

      <Tray
        tray={game.tray}
        cell={trayCell}
        gap={trayGap}
        slotHeight={slotHeight}
        draggingIndex={drag?.index ?? null}
        fits={fits}
        onPick={start}
      />

      <CreadoPorEbyzom className="py-2" />

      {/* Capa de arrastre */}
      {drag && ghost && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: 0,
            top: 0,
            transform: `translate3d(${ghost.left}px, ${ghost.top}px, 0)`,
            willChange: "transform",
          }}
        >
          <div style={{ filter: "drop-shadow(0 8px 14px rgba(0,0,0,.5))" }}>
            <PieceView piece={drag.piece} cell={geom.cell} gap={geom.gap} />
          </div>
        </div>
      )}
    </div>
  );
}
