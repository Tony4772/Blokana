import { useEffect, useState } from "react";
import { useGame } from "./hooks/useGame";
import MenuScreen from "./screens/MenuScreen";
import GameScreen from "./screens/GameScreen";
import EbyzomSplash from "./components/EbyzomSplash";
import { AdMobBanner } from "./components/AdMobBanner";
import {
  GameOverModal,
  HelpModal,
  PauseModal,
  SettingsModal,
  StatsModal,
} from "./screens/Overlays";
import { flushSave } from "./services/storage";
import { audio } from "./services/audio";

// Check if splash was already shown in localStorage
const SPLASH_STORAGE_KEY = "blokana_splash_shown";

export default function App() {
  // Siempre mostrar splash en carga fresca si no hay registro previo
  const [showSplash, setShowSplash] = useState(() => {
    const previouslyShown = localStorage.getItem(SPLASH_STORAGE_KEY);
    // Si nunca se mostró el splash, mostrarlo; si ya se mostró, no mostrarlo
    return !previouslyShown;
  });

  useEffect(() => {
    // Marcar que el splash se mostró después de 2 segundos
    const timer = setTimeout(() => {
      localStorage.setItem(SPLASH_STORAGE_KEY, "true");
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [showSplash]);
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

  if (showSplash) {
    return (
      <EbyzomSplash
        appName="BLOKANA"
        tagline="Puzzle de bloques con sabor peruano 🇵🇪"
        onFinished={() => setShowSplash(false)}
      />
    );
  }

  return (
    <div className="bg-blokana flex h-[100dvh] w-full justify-center overflow-hidden">
      <main
        className="relative flex h-full w-full max-w-[560px] flex-col overflow-hidden"
        style={{ paddingBottom: 70 }}
      >
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
      </main>
      <AdMobBanner />
    </div>
  );
}
