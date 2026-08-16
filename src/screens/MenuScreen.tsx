import { CreadoPorEbyzom, EbyzomMark } from "../components/Brand";
import { PrimaryButton } from "../components/Modal";
import { formatNumber } from "../game/helpers";
import type { GameApi } from "../hooks/useGame";

const DEMO = [
  ["esmeralda", "esmeralda", null, "solar"],
  ["esmeralda", "cobalto", "cobalto", "solar"],
  [null, "cobalto", "coral", "coral"],
] as const;

export default function MenuScreen({
  game,
  onSettings,
  onStats,
  onHelp,
}: {
  game: GameApi;
  onSettings: () => void;
  onStats: () => void;
  onHelp: () => void;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-between px-6 py-8">
      <div className="flex w-full max-w-[420px] flex-1 flex-col items-center justify-center gap-6">
        <div className="pop-in flex flex-col items-center gap-3">
          <div className="grid grid-cols-4 gap-1.5">
            {DEMO.flat().map((c, i) => (
              <div
                key={i}
                className="h-7 w-7 rounded-[8px]"
                style={{
                  background: c
                    ? {
                        esmeralda: "linear-gradient(160deg,#6FD98A,#34A853)",
                        cobalto: "linear-gradient(160deg,#7BA5EE,#3B6FC4)",
                        solar: "linear-gradient(160deg,#FFD771,#F5B429)",
                        coral: "linear-gradient(160deg,#FF8894,#EF4F5F)",
                      }[c]
                    : "rgba(255,255,255,.06)",
                  boxShadow: c ? "inset 0 2px 0 rgba(255,255,255,.35)" : undefined,
                }}
              />
            ))}
          </div>
          <h1 className="text-5xl font-black tracking-[0.14em] text-white drop-shadow-[0_4px_10px_rgba(0,0,0,.5)]">
            BLOKANA
          </h1>
          <p className="text-sm font-medium tracking-wide text-white/60">
            Puzzle de bloques con sabor peruano 🇵🇪
          </p>
        </div>

        <div className="flex w-full items-center justify-center gap-3">
          <div className="flex-1 rounded-2xl bg-white/[0.06] px-4 py-3 text-center ring-1 ring-white/10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Récord</p>
            <p className="text-xl font-black text-amber-300">
              {formatNumber(game.stats.mejorPuntuacion)}
            </p>
          </div>
          <div className="flex-1 rounded-2xl bg-white/[0.06] px-4 py-3 text-center ring-1 ring-white/10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Partidas</p>
            <p className="text-xl font-black text-white">{game.stats.partidas}</p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          {game.canContinue && (
            <PrimaryButton tone="azul" onClick={game.continueGame}>
              ▶ Continuar partida
            </PrimaryButton>
          )}
          <PrimaryButton onClick={game.newGame}>🎮 Jugar</PrimaryButton>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={onHelp}
              className="btn-3d rounded-2xl bg-white/[0.07] py-3 text-sm font-bold ring-1 ring-white/10"
            >
              ❓ Cómo jugar
            </button>
            <button
              onClick={onStats}
              className="btn-3d rounded-2xl bg-white/[0.07] py-3 text-sm font-bold ring-1 ring-white/10"
            >
              📊 Estadísticas
            </button>
            <button
              onClick={onSettings}
              className="btn-3d rounded-2xl bg-white/[0.07] py-3 text-sm font-bold ring-1 ring-white/10"
            >
              ⚙️ Ajustes
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <EbyzomMark size={30} />
        <CreadoPorEbyzom />
        <p className="text-[10px] text-white/30">Versión 1.0 · Juega sin conexión</p>
      </div>
    </div>
  );
}
