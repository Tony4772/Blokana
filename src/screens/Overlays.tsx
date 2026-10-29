import { useState } from "react";
import { Modal, PrimaryButton, Toggle } from "../components/Modal";
import { CreadoPorEbyzom } from "../components/Brand";
import { formatNumber } from "../game/helpers";
import type { GameApi } from "../hooks/useGame";
import { audio } from "../services/audio";

export function PauseModal({ game }: { game: GameApi }) {
  return (
    <Modal open={game.screen === "pausa"} title="Pausa">
      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Puntos" value={formatNumber(game.score)} />
        <Stat label="Líneas" value={String(game.lines)} />
        <Stat label="Combo máx." value={`x${game.maxCombo}`} />
      </div>
      <div className="flex flex-col gap-3">
        <PrimaryButton onClick={game.resume}>▶ Continuar</PrimaryButton>
        <PrimaryButton tone="oscuro" onClick={game.newGame}>
          🔄 Nueva partida
        </PrimaryButton>
        <PrimaryButton tone="oscuro" onClick={game.goMenu}>
          🏠 Menú principal
        </PrimaryButton>
      </div>
      <CreadoPorEbyzom className="pt-4" />
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.06] px-2 py-3 ring-1 ring-white/10">
      <p className="text-[10px] uppercase tracking-[0.14em] text-white/50">{label}</p>
      <p className="text-lg font-black text-white">{value}</p>
    </div>
  );
}

export function GameOverModal({ game }: { game: GameApi }) {
  const [copiado, setCopiado] = useState(false);
  const esRecord = game.score > 0 && game.score >= game.stats.mejorPuntuacion;
  const perdióNivel = game.linesThisLevel > 0; // Indicates if some progress was made

  const compartir = async () => {
    const texto = `¡Hice ${formatNumber(game.score)} puntos en BLOKANA! 🧩 ¿Puedes superarme? — Creado por EBYZOM`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "BLOKANA", text: texto, url: location.href });
      } else {
        await navigator.clipboard.writeText(`${texto} ${location.href}`);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }
    } catch {
      /* el usuario canceló */
    }
  };

  // Determinar mensaje basado en el progreso del nivel
  const mensajeFin = perdióNivel
    ? "Perdiste este nivel. ¡Inténtalo de nuevo!"
    : "Ya no quedan movimientos posibles. ¡Inténtalo otra vez!";

  return (
    <Modal open={game.screen === "fin"} title={esRecord ? "¡Nuevo récord! 🏆" : "Fin de la partida">
      <p className="mb-3 text-sm text-white/60">
        {esRecord
          ? "¡Excelente jugada! Superaste tu mejor puntuación."
          : mensajeFin}
      </p>
      <div className="mb-3 rounded-2xl bg-gradient-to-b from-white/10 to-white/[0.03] px-4 py-4 text-center ring-1 ring-white/10">
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Puntuación</p>
        <p className="text-5xl font-black text-white">{formatNumber(game.score)}</p>
        <p className="mt-1 text-sm font-semibold text-amber-300">
          🏆 Mejor: {formatNumber(game.stats.mejorPuntuacion)}
        </p>
      </div>
      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Líneas" value={String(game.lines)} />
        <Stat label="Combo máx." value={`x${game.maxCombo}`} />
        <Stat label="Partidas" value={String(game.stats.partidas)} />
      </div>
      <div className="flex flex-col gap-3">
        {/* Botón para reiniciar el nivel actual */}
        <PrimaryButton onClick={() => {
          // Reiniciar juego - el newGame pondrá al jugador en el nivel 1
          // Se recarga la página para intentar mantener el progreso del nivel
          game.newGame();
          setTimeout(() => {
            // Workaround: recargar para intentar reiniciar en el mismo nivel
            // En una versión futura, se implementaría un resetLevel specific
            window.location.reload();
          }, 100);
        }}>
          {perdióNivel ? "Reintentar Nivel" : "Volver a Jugar"}
        </PrimaryButton>
        <PrimaryButton tone="azul" onClick={compartir}>
          {copiado ? "✅ ¡Copiado!" : "📣 Compartir puntuación"}
        </PrimaryButton>
        <PrimaryButton tone="oscuro" onClick={game.goMenu}>
          🏠 Menú principal
        </PrimaryButton>
      </div>
      <CreadoPorEbyzom className="pt-4" />
    </Modal>
  );
}

export function SettingsModal({
  game,
  open,
  onClose,
}: {
  game: GameApi;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} title="Configuración" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <Toggle
          label="Música"
          icon="🎵"
          value={game.settings.music}
          onChange={(v) => {
            audio.unlock();
            game.updateSettings({ music: v });
          }}
        />
        <Toggle
          label="Efectos de sonido"
          icon="🔊"
          value={game.settings.sfx}
          onChange={(v) => game.updateSettings({ sfx: v })}
        />
        <Toggle
          label="Vibración"
          icon="📳"
          value={game.settings.vibration}
          onChange={(v) => game.updateSettings({ vibration: v })}
        />
      </div>
      <div className="mt-5 rounded-2xl bg-white/[0.05] p-4 text-center ring-1 ring-white/10">
        <p className="text-sm font-bold text-white/80">BLOKANA · Versión 1.0</p>
        <p className="mt-1 text-xs text-white/50">
          Puzzle de bloques hecho en Perú. Funciona sin conexión y guarda tu progreso en tu
          dispositivo.
        </p>
        <CreadoPorEbyzom className="pt-3" />
      </div>
    </Modal>
  );
}

export function StatsModal({ game, open, onClose }: { game: GameApi; open: boolean; onClose: () => void }) {
  const s = game.stats;
  const promedio = s.partidas ? Math.round(s.puntosTotales / s.partidas) : 0;
  return (
    <Modal open={open} title="Estadísticas" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Mejor puntuación" value={formatNumber(s.mejorPuntuacion)} />
        <Stat label="Partidas jugadas" value={String(s.partidas)} />
        <Stat label="Líneas eliminadas" value={formatNumber(s.lineasTotales)} />
        <Stat label="Combo máximo" value={`x${s.mejorCombo}`} />
        <Stat label="Puntos totales" value={formatNumber(s.puntosTotales)} />
        <Stat label="Promedio" value={formatNumber(promedio)} />
      </div>
      <p className="mt-4 text-center text-xs text-white/45">
        Próximamente: rankings, logros y misiones diarias.
      </p>
    </Modal>
  );
}

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} title="Cómo jugar" onClose={onClose}>
      <ol className="flex flex-col gap-3 text-sm text-white/80">
        <li className="rounded-2xl bg-white/[0.05] p-3 ring-1 ring-white/10">
          <b>1.</b> Arrastra una pieza desde abajo hacia el tablero de 8x8.
        </li>
        <li className="rounded-2xl bg-white/[0.05] p-3 ring-1 ring-white/10">
          <b>2.</b> Completa una fila o una columna para eliminarla y sumar puntos.
        </li>
        <li className="rounded-2xl bg-white/[0.05] p-3 ring-1 ring-white/10">
          <b>3.</b> Elimina varias líneas seguidas para lograr <b>combos</b> y multiplicar tu
          puntuación.
        </li>
        <li className="rounded-2xl bg-white/[0.05] p-3 ring-1 ring-white/10">
          <b>4.</b> La partida termina cuando ninguna pieza cabe. ¡Planifica tus espacios!
        </li>
      </ol>
      <div className="mt-4">
        <PrimaryButton onClick={onClose}>¡Entendido!</PrimaryButton>
      </div>
    </Modal>
  );
}