import type { ReactNode } from "react";

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
      <div className="slide-up w-full max-w-[400px] rounded-3xl bg-[#141d33] p-5 ring-1 ring-white/10 shadow-2xl">
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black tracking-wide">{title}</h2>
            {onClose && (
              <button
                aria-label="Cerrar"
                onClick={onClose}
                className="btn-3d grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-sm ring-1 ring-white/15"
              >
                ✕
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  tone = "verde",
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: "verde" | "azul" | "oscuro";
}) {
  const tones = {
    verde: "from-[#4ade80] to-[#22a24f] text-[#06240f]",
    azul: "from-[#7BA5EE] to-[#3B6FC4] text-[#08172f]",
    oscuro: "from-white/15 to-white/5 text-white ring-1 ring-white/15",
  } as const;
  return (
    <button
      onClick={onClick}
      className={`btn-3d w-full rounded-2xl bg-gradient-to-b ${tones[tone]} px-5 py-3.5 text-base font-black tracking-wide shadow-[0_6px_0_rgba(0,0,0,.28)]`}
    >
      {children}
    </button>
  );
}

export function Toggle({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10"
      aria-pressed={value}
    >
      <span className="flex items-center gap-3 font-semibold">
        <span aria-hidden>{icon}</span>
        {label}
      </span>
      <span
        className={`relative h-7 w-12 rounded-full transition-colors ${
          value ? "bg-emerald-500" : "bg-white/20"
        }`}
      >
        <span
          className="absolute top-1 h-5 w-5 rounded-full bg-white transition-all"
          style={{ left: value ? 26 : 4 }}
        />
        <span className="sr-only">{value ? "Activado" : "Desactivado"}</span>
      </span>
    </button>
  );
}
