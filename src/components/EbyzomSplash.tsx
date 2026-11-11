import { useEffect, useState } from "react";

interface EbyzomSplashProps {
  appName?: string;
  tagline?: string;
  onFinished: () => void;
}

export default function EbyzomSplash({
  appName = "BLOKANA",
  tagline = "Puzzle de bloques con sabor peruano 🇵🇪",
  onFinished,
}: EbyzomSplashProps) {
  const [fadeOut, setFadeOut] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    // Inicia fade out a los 1200ms
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1200);

    // Concluye y desmotan a los 1500ms
    const finishTimer = setTimeout(() => {
      setMounted(false);
      onFinished();
    }, 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  const handleDismiss = () => {
    setFadeOut(true);
    setTimeout(() => {
      setMounted(false);
      onFinished();
    }, 150);
  };

  if (!mounted) return null;

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-[#0a1020] px-6 select-none transition-opacity duration-300 ease-out ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <img
          src="/ebyzom_logo.png"
          alt="EBYZOM"
          className="max-h-[120px] max-w-[240px] object-contain drop-shadow-lg"
          onError={(e) => {
            // Si la imagen falla, no bloquear la pantalla
            (e.currentTarget as HTMLElement).style.display = "none";
          }}
        />
        <div className="mt-6 flex flex-col items-center">
          <h1 className="text-2xl font-bold tracking-wider text-amber-300">{appName}</h1>
          <p className="mt-1 text-xs text-slate-400">{tagline}</p>
        </div>
      </div>
    </div>
  );
}