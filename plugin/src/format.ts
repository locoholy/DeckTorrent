import { L } from "./i18n";
import type { Torrent } from "./store";

const UNITS = L.units;

const unitOf = (bytes: number) =>
  bytes <= 0 ? 0 : Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);

export function humanSize(bytes: number): string {
  if (bytes <= 0) return `0 ${UNITS[0]}`;
  const i = unitOf(bytes);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : value >= 100 ? 0 : 1)} ${UNITS[i]}`;
}

/** «19.2 / 45.0 ГБ» — единицу пишем один раз: короче и не рябит в узкой панели. */
export function humanPair(have: number, total: number): string {
  if (total <= 0) return humanSize(have);
  const ut = unitOf(total);
  const haveStr = (have / Math.pow(1024, ut)).toFixed(ut === 0 ? 0 : 1);
  return `${haveStr} / ${humanSize(total)}`;
}

export function humanSpeed(bytesPerSec: number): string {
  return bytesPerSec > 0 ? `${humanSize(bytesPerSec)}/${L.sec}` : `0 ${UNITS[1]}/${L.sec}`;
}

export function humanEta(seconds: number): string {
  if (seconds < 0) return "";
  if (seconds < 60) return `${seconds} ${L.sec}`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} ${L.min}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ${L.hour} ${m % 60} ${L.min}`;
  return `${Math.floor(h / 24)} ${L.day} ${h % 24} ${L.hour}`;
}

export function fmtPercent(p: number): string {
  if (p >= 100) return "100%";
  if (p <= 0) return "0%";
  return `${p.toFixed(1)}%`;
}

/* ─── Состояния Transmission (поле status из RPC-спеки) ─────────────────── */

export const COLORS = {
  down: "#1a9fff",
  seed: "#5ba32b",
  check: "#e5a50a",
  idle: "#7a8894",
  error: "#e0503f",
  text: "#ffffff",
  dim: "rgba(255,255,255,0.58)",
  faint: "rgba(255,255,255,0.38)",
  track: "rgba(255,255,255,0.13)",
  card: "rgba(0,0,0,0.28)",
  cardFocus: "rgba(255,255,255,0.14)",
};

export const isRunning = (t: Torrent) => t.status !== 0;
export const isMagnet = (t: Torrent) => t.metaPercent < 100;
export const isActive = (t: Torrent) => t.status === 4 || t.status === 6 || t.status === 2;

export function accentFor(t: Torrent): string {
  if (t.error) return COLORS.error;
  switch (t.status) {
    case 2: return COLORS.check;
    case 4: return isMagnet(t) ? COLORS.check : COLORS.down;
    case 6: return COLORS.seed;
    default: return COLORS.idle;
  }
}

export function statusLabel(t: Torrent): string {
  switch (t.status) {
    case 1: return L.statusQueuedCheck;
    case 3: return L.statusQueued;
    case 4: return L.statusDownloading;
    case 5: return L.statusQueuedSeed;
    default: return L.statusUnknown;
  }
}

/** Полоса показывает то, что реально идёт прямо сейчас: хеш-проверку,
 *  сбор метаданных магнета или долю скачанного. */
export function barPercent(t: Torrent): number {
  if (t.status === 2) return t.checkPercent;
  if (isMagnet(t)) return t.metaPercent;
  return t.percent;
}
