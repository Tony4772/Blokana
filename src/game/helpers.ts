import { GRID } from "./constants";

export { GRID };

export const idxSafe = (r: number, c: number) => r * GRID + c;

export const formatNumber = (n: number) => n.toLocaleString("es-PE");
