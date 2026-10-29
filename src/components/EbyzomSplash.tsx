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
  const [brand, setBrand] = useState(true);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Ocultar splash después de 2 segundos si aún está visible
    const timer = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Cuando termina la animación de marca, ocultar splash después de un retraso
  useEffect(() => {
    if (!brand && show) {
      const timer = setTimeout(() => setShow(false), 500);
      return () => clearTimeout(timer);
    }
  }, [brand, show]);

  if (show) {
    return (
      <div
        onClick={() => setShow(false)}
        className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black px-10 select-none transition-opacity"
        style={{ opacity: brand ? 1 : 0 }}
      >
        {brand && (
          <img
            src="/ebyzom_logo.png"
            alt="EBYZOM"
            className="max-h-[60%] max-w-full object-contain"
          />
        )}
      </div>
    );
  }

  // Después de ocultar splash, esperar un momento y ejecutar onFinished
  useEffect(() => {
    if (!show) {
      const delay = brand ? 500 : 0;
      const timer = setTimeout(() => onFinished(), delay);
      return () => clearTimeout(timer);
    }
  }, [show, brand, onFinished]);

  return null;
}