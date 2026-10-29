/** Hook principal: orquesta tablero, piezas, puntuación, audio y persistencia. */
/** Sistema de niveles progresivos: debes vencer el nivel actual para avanzar. */
import { useCallback, useEffect, useRef, useState } from "react";
import { TRAY_SIZE } from "../game/constants";
import { applyClears, canPlace, createBoard, findClears, hasAnyMove, placePiece, type Board } from "../game/board";
import { makePiece, type Piece } from "../game/pieces";
import { comboLabel, computeScore } from "../game/scoring";
import { audio, vibrate } from "../services/audio";
import {
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  flushSave,
  loadSave,
  saveData,
  type Settings,
  type Stats,
} from "../services/storage";

export type Screen = "menu" | "jugando" | "pausa" | "fin";

export interface Burst {
  id: number;
  text: string;
  kind: "combo" | "puntos";
}

const CLEAR_MS = 300;

/** Niveles progresivos: líneas necesarias para avanzar */
const LINES_TO_LEVEL_1 = 5; // para pasar del nivel 1 al 2
export const LINES_PER_LEVEL_STEP = 5; // cada nivel siguiente requiere 5 líneas más

export function useGame() {
  const initial = useRef(loadSave()).current;

  const [settings, setSettings] = useState<Settings>(initial.settings ?? DEFAULT_SETTINGS);
  const [stats, setStats] = useState<Stats>(initial.stats ?? DEFAULT_STATS);
  const [screen, setScreen] = useState<Screen>("menu");
  const [board, setBoard] = useState<Board>(() => initial.current?.board ?? createBoard());
  const [tray, setTray] = useState<(Piece | null)[]>(
    () => initial.current?.tray ?? makeTray(TRAY_SIZE),
  );
  const [score, setScore] = useState(initial.current?.score ?? 0);
  const [lines, setLines] = useState(initial.current?.lines ?? 0);
  const [combo, setCombo] = useState(initial.current?.combo ?? 0);
  const [maxCombo, setMaxCombo] = useState(initial.current?.maxCombo ?? 0);
  const [clearing, setClearing] = useState<number[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [lastGain, setLastGain] = useState(0);
  const [level, setLevel] = useState<number>(initial.current?.level ?? 1);
  const [linesThisLevel, setLinesThisLevel] = useState<number>(
    initial.current?.linesThisLevel ?? LINES_TO_LEVEL_1,
  );
  const hasSaved = !!initial.current && (initial.current.score > 0 || initial.current.board.some(Boolean));
  const [canContinue, setCanContinue] = useState(hasSaved);

  const timers = useRef<number[]>([]);
  const burstId = useRef(0);

  const later = useCallback((fn: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      timers.current = timers.current.filter((x) => x !== t);
      fn();
    }, ms);
    timers.current.push(t);
  }, []);

  useEffect(() => {
    audio.setSfx(settings.sfx);
    audio.setMusic(settings.music && screen === "jugando");
  }, [settings.sfx, settings.music, screen]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      audio.stopMusic();
      flushSave();
    },
    [],
  );

  /* ---------------- persistencia ---------------- */
  const currentRef = useRef(initial.current);
  const persist = useCallback(
    (patch: Partial<{ settings: Settings; stats: Stats; current: any }>) => {
      if (patch.current !== undefined) currentRef.current = patch.current;
      saveData({
        settings: patch.settings ?? settings,
        stats: patch.stats ?? stats,
        current: currentRef.current,
      });
    },
    [settings, stats],
  );

  useEffect(() => {
    if (screen !== "jugando" && screen !== "pausa") return;
    const linesNeeded = LINES_TO_LEVEL_1 + (level - 1) * LINES_PER_LEVEL_STEP;
    persist({ current: { board, tray, score, lines, combo, maxCombo, level, linesThisLevel: linesNeeded - LINES_PER_LEVEL_STEP } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, tray, score, lines, combo, maxCombo, level, linesThisLevel, screen]);

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        persist({ settings: next });
        return next;
      });
    },
    [persist],
  );

  /** Calcula las líneas necesarias para el próximo nivel */
  const linesNeededForNextLevel = () => LINES_TO_LEVEL_1 + (level - 1) * LINES_PER_LEVEL_STEP;

  /** Verifica si hay suficiente líneas para subir de nivel */
  const canLevelUp = () => lines >= linesNeededForNextLevel();

  /** Sube de nivel y reinicia el contador de líneas del nivel actual */
  const levelUp = () => {
    const newLevel = Math.min(level + 1, 100); // límite arbitrario alto
    setLevel(newLevel);
    setLinesThisLevel(LINES_TO_LEVEL_1 + (newLevel - 1) * LINES_PER_LEVEL_STEP);
    // Emitir burst de nivel
    // pushBurst(`¡Nivel ${newLevel}!`, "combo"); // descomentar cuando se integra pushBurst
  };

  /* ---------------- ciclo de partida ---------------- */
  const newGame = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const fresh = createBoard();
    setBoard(fresh);
    setTray(makeTray(TRAY_SIZE));
    setScore(0);
    setLines(0);
    setCombo(0);
    setMaxCombo(0);
    setClearing([]);
    setBursts[];
    setLevel(1);
    setLinesThisLevel(LINES_TO_LEVEL_1);
    setScreen("jugando");
    setCanContinue(true);
    audio.unlock();
  }, []);

  const continueGame = useCallback(() => {
    setScreen("jugando");
    audio.unlock();
  }, []);

  const goMenu = useCallback(() => {
    setScreen("menu");
    audio.stopMusic();
  }, []);

  const pushBurst = useCallback(
    (text: string, kind: Burst["kind"]) => {
      const id = ++burstId.current;
      setBursts((b) => [...b.slice(-3), { id, text, kind }]);
      later(() => setBursts((b) => b.filter((x) => x.id !== id)), 900);
    },
    [later],
  );

  const endGame = useCallback(
    (finalScore: number, finalLines: number, finalMax: number, level: number) => {
      audio.play("gameover");
      vibrate([40, 60, 90], settings.vibration);
      audio.stopMusic();
      setScreen("fin");
      setCanContinue(false);
      setStats((prev) => {
        const next: Stats = {
          partidas: prev.partidas + 1,
          lineasTotales: prev.lineasTotales + finalLines,
          puntosTotales: prev.puntosTotales + finalScore,
          mejorCombo: Math.max(prev.mejorCombo, finalMax),
          mejorPuntuacion: Math.max(prev.mejorPuntuacion, finalScore),
        };
        currentRef.current = null;
        saveData({ settings, stats: next, current: null });
        flushSave();
        return next;
      });
      // Notify that level was lost - this can be used for analytics or UI
      console.log(`Level ${level} finished - game over`);
    },
    [settings],
  );

  /** Coloca la pieza del índice indicado en (row,col). Devuelve true si fue válida. */
  const place = useCallback(
    (trayIndex: number, row: number, col: number): boolean => {
      const piece = tray[trayIndex];
      if (!piece || screen !== "jugando") return false;
      if (!canPlace(board, piece, row, col)) {
        audio.play("invalido");
        return false;
      }

      const { board: placed } = placePiece(board, piece, row, col);
      const { rows, cols, cleared } = findClears(placed);
      const totalLines = rows.length + cols.length;
      const newCombo = totalLines > 0 ? combo + 1 : 0;
      const gain = computeScore({
        cellsPlaced: piece.shape.cells.length,
        lines: totalLines,
        combo: combo,
      }).total;

      // Verificar si sube de nivel
      const nextLinesNeeded = linesNeededForNextLevel();
      let levelUpTriggered = false;
      if (lines + totalLines >= nextLinesNeeded && level < 100) {
        levelUpTriggered = true;
        setLevel((l) => l + 1);
        setLinesThisLevel((ln) => LINES_TO_LEVEL_1 + (l) * LINES_PER_LEVEL_STEP); // l es el nuevo nivel - 1
        pushBurst(`¡Nivel ${level + 1}!`, "combo");
      }

      const nextTray = tray.slice();
      nextTray[trayIndex] = null;
      const refill = nextTray.every((p) => p === null);
      const finalTray = refill
        ? Array.from({ length: TRAY_SIZE }, () => makePiece())
        : nextTray;

      setBoard(placed);
      setTray(finalTray);
      setScore((s) => s + gain);
      setLastGain(gain);
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));
      setLines((l) => l + totalLines);
      setLinesThisLevel((ll) => ll + totalLines);

      // Si subió de nivel, el contador se reinicia automáticamente por el state setter

      audio.play("colocar");
      vibrate(12, settings.vibration);

      const finishTurn = (finalBoard: Board) => {
        if (!hasAnyMove(finalBoard, finalTray)) {
          later(
            () =>
              endGame(
                score + gain,
                lines + totalLines,
                Math.max(maxCombo, newCombo),
                level
              ),
            360,
          );
        }
      };

      if (totalLines > 0) {
        setClearing(cleared);
        audio.play(totalLines >= 2 || newCombo >= 2 ? "combo" : "linea", totalLines);
        vibrate(totalLines >= 2 ? [18, 40, 25] : 22, settings.vibration);
        const label = comboLabel(totalLines, newCombo);
        if (label) pushBurst(label, "combo");
        pushBurst(`+${gain}`, "puntos");
        later(() => {
          const cleanBoard = applyClears(placed, cleared);
          setBoard(cleanBoard);
          setClearing[];
          finishTurn(cleanBoard);
        }, CLEAR_MS);
      } else {
        if (gain > 0) pushBurst(`+${gain}`, "puntos");
        finishTurn(placed);
      }
      return true;
    },
    [board, tray, screen, combo, score, lines, maxCombo, level, linesThisLevel, settings.vibration, later, pushBurst, endGame],
  );

  const pause = useCallback(() => {
    if (screen === "jugando") setScreen("pausa");
  }, [screen]);

  const resume = useCallback(() => {
    if (screen === "pausa") setScreen("jugando");
  }, [screen]);

  return {
    // estado
    board,
    tray,
    score,
    lines,
    combo,
    maxCombo,
    level,
    linesThisLevel,
    clearing,
    bursts,
    lastGain,
    screen,
    settings,
    stats,
    best: Math.max(stats.mejorPuntuacion, score),
    canContinue,
    // acciones
    newGame,
    continueGame,
    goMenu,
    place,
    pause,
    resume,
    updateSettings,
    setScreen,
  };
}

export type GameApi = ReturnType<typeof useGame>;