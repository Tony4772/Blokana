import { useEffect, useState } from "react";
import { useGame } from "./hooks/useGame";
import MenuScreen from "./screens/MenuScreen";
import GameScreen from "./screens/GameScreen";
import {
  GameOverModal,
  HelpModal,
  PauseModal,
  SettingsModal,
  StatsModal,
} from "./screens/Overlays";
import { flushSave } from "./services/storage";
import { audio } from "./services/audio";

export default function App() {
  const game = useGame();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const onHide = () => {
      if (document.hidden) {
        flushSave();
        audio.stopMusic();
        if (game.screen === "jugando") game.pause();
      } else if (game.settings.music && game.screen === "jugando") {
        audio.startMusic();
      }
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flushSave);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flushSave);
    };
  }, [game]);

  const enMenu = game.screen === "menu";

  return (
    <div className="bg-blokana flex h-[100dvh] w-full justify-center overflow-hidden">
      <main className="relative flex h-full w-full max-w-[560px] flex-col">
        {enMenu ? (
          <MenuScreen
            game={game}
            onSettings={() => setSettingsOpen(true)}
            onStats={() => setStatsOpen(true)}
            onHelp={() => setHelpOpen(true)}
          />
        ) : (
          <GameScreen game={game} onOpenSettings={() => setSettingsOpen(true)} />
        )}

        <PauseModal game={game} />
        <GameOverModal game={game} />
        <SettingsModal game={game} open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <StatsModal game={game} open={statsOpen} onClose={() => setStatsOpen(false)} />
        <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      </main>
    </div>
  );
}
