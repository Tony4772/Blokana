import { memo } from "react";
import { COLORS, type ColorKey } from "../game/constants";

interface Props {
  color: ColorKey;
  size: number;
  ghost?: boolean;
  clearing?: boolean;
  invalid?: boolean;
  delay?: number;
}

/** Bloque BLOKANA: gradiente, brillo superior y sombra sutil (todo CSS, sin imágenes). */
function BlockBase({ color, size, ghost, clearing, invalid, delay = 0 }: Props) {
  const c = COLORS[color];
  const r = Math.max(4, size * 0.22);
  return (
    <div
      className={clearing ? "blk-clear" : undefined}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: invalid
          ? "linear-gradient(160deg,#9aa3b2,#5b6472)"
          : `linear-gradient(160deg, ${c.light} 0%, ${c.base} 52%, ${c.dark} 100%)`,
        boxShadow: ghost
          ? "none"
          : `inset 0 ${Math.max(1, size * 0.07)}px 0 rgba(255,255,255,.38), inset 0 -${Math.max(
              1,
              size * 0.08,
            )}px 0 rgba(0,0,0,.22), 0 ${Math.max(1, size * 0.05)}px ${Math.max(
              2,
              size * 0.12,
            )}px rgba(0,0,0,.28)`,
        opacity: ghost ? 0.42 : 1,
        animationDelay: `${delay}ms`,
        willChange: clearing ? "transform, opacity" : undefined,
      }}
    />
  );
}

export const Block = memo(BlockBase);
