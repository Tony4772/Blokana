import { memo } from "react";
import { formatNumber } from "../game/helpers";
import { LINES_PER_LEVEL_STEP, LINES_TO_LEVEL_1 } from "../game/constants";
import { useGame } from "../hooks/useGame";
import { EbyzomMark } from "./Brand";

interface Props {
  score: number;
  best: number;
  combo: number;
  onPause: () => void;
  onSettings: () => void;
}

function HudBase({ score, best, combo, onPause, onSettings }: Props) {
  const { level, linesThisLevel } = useGame();
  const linesNeededForNextLevel = LINES_TO_LEVEL_1 + (level - 1) * LINES_PER_LEVEL_STEP;

  return (
    <header className="w-full max-w-[520px] px-3 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <EbyzomMark size={22} />
          <span className="text-[15px] font-black tracking-[0.22em] text-white/90">BLOKANA</span>
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Configuración"
            onClick={onSettings}
            className="btn-3d grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-lg ring-1 ring-white/15"
          >
            ⚙️
          </button>
          <button
            aria-label="Pausa"
            onClick={onPause}
            className="btn-3d grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-lg ring-1 ring-white/15"
          >
            ⏸️
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-end justify-between rounded-2xl bg-white/[0.06] px-4 py-2 ring-1 ring-white/10">
        <div className="text-left">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Récord</p>
          <p className="text-base font-bold text-amber-300">🏆 {formatNumber(best)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Puntuación</p>
          <p key={score} className="score-pop text-3xl font-black leading-none text-white">
            {formatNumber(score)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Combo</p>
          <p className={`text-base font-bold ${combo > 1 ? "text-emerald-300 pulse-soft" : "text-white/70"}`}>
            x{combo}
          </p>
        </div>
      </div>

      {/* Información de nivel y progreso */}
      <div className="mt-2 flex items-center justify-between">
        <div className="text-sm text-white/60">
          Nivel {level}
        </div>
        <div className="text-sm text-white/60">
          Progreso: {linesThisLevel}/{linesNeededForNextLevel} líneas
        </div>
      </div>
    </header>
  );
}

export const Hud = memo(HudBase);