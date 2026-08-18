import { ConfirmModal, Focusable, Menu, MenuItem, MenuSeparator, showContextMenu, showModal } from "@decky/ui";
import { useRef, useState } from "react";
import {
  FaCheckCircle,
  FaCircleNotch,
  FaExclamationTriangle,
  FaMagnet,
  FaPauseCircle,
  FaSeedling,
} from "react-icons/fa";
import {
  COLORS,
  accentFor,
  barPercent,
  fmtPercent,
  humanEta,
  humanSize,
  humanSpeed,
  isMagnet,
  isRunning,
  statusLabel,
} from "./format";
import { L } from "./i18n";
import { removeTorrent, setTorrent, store, type Snapshot, type Torrent } from "./store";

/** Ключевые кадры живут в одном месте: инлайн-стили их не умеют,
 *  а тащить css-плагин в сборку ради трёх анимаций — перебор. */
export const Keyframes = () => (
  <style>{`
@keyframes dtSweep { 0% { transform: translateX(-140%); } 100% { transform: translateX(140%); } }
@keyframes dtPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
@keyframes dtSpin  { 100% { transform: rotate(360deg); } }
@keyframes dtFade  { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: none; } }
`}</style>
);

/* ─── Полоса прогресса ───────────────────────────────────────────────────── */

export function ProgressLine({
  percent,
  color,
  height = 10,
  live = false,
}: {
  percent: number;
  color: string;
  height?: number;
  live?: boolean;
}) {
  const width = Math.max(0, Math.min(100, percent));
  return (
    <div
      style={{
        position: "relative",
        height,
        borderRadius: height / 2,
        background: COLORS.track,
        overflow: "hidden",
        flex: 1,
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: `${width}%`,
          borderRadius: height / 2,
          background: `linear-gradient(90deg, ${color}cc 0%, ${color} 100%)`,
          transition: "width 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
          overflow: "hidden",
        }}
      >
        {/* Блик бежит только у живой загрузки — на стоящем торренте он врал бы о работе */}
        {live && width > 2 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
              animation: "dtSweep 1.8s linear infinite",
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Общее ──────────────────────────────────────────────────────────────── */

export function cardStyle(accent?: string): React.CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    padding: "12px",
    marginBottom: "8px",
    borderRadius: "5px",
    borderLeft: accent ? `3px solid ${accent}` : undefined,
    background: COLORS.card,
    animation: "dtFade 0.2s ease-out",
  };
}

export function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return <div style={cardStyle(accent)}>{children}</div>;
}

function StatusIcon({ torrent, color }: { torrent: Torrent; color: string }) {
  const common = { size: 13, color, style: { flexShrink: 0 } as const };
  if (torrent.error) return <FaExclamationTriangle {...common} />;
  if (torrent.status === 2)
    return <FaCircleNotch {...common} style={{ ...common.style, animation: "dtSpin 1.1s linear infinite" }} />;
  if (torrent.status === 4 && isMagnet(torrent)) return <FaMagnet {...common} />;
  if (torrent.status === 6) return <FaSeedling {...common} />;
  if (torrent.status === 0)
    return torrent.percent >= 100 ? <FaCheckCircle {...common} /> : <FaPauseCircle {...common} />;
  return null;
}

/* ─── Карточка торрента ──────────────────────────────────────────────────── */

function confirmRemove(torrent: Torrent, withData: boolean, after: () => void) {
  showModal(
    <ConfirmModal
      bDestructiveWarning={withData}
      strTitle={withData ? L.removeWithDataTitle : L.removeKeepTitle}
      strDescription={
        withData
          ? L.removeWithDataText(torrent.name, humanSize(torrent.haveSize))
          : L.removeKeepText(torrent.name)
      }
      strOKButtonText={withData ? L.removeWithData : L.removeKeep}
      strCancelButtonText={L.cancel}
      onOK={async () => {
        await removeTorrent(torrent.id, withData);
        after();
      }}
    />,
  );
}

/** Главная строка под полосой отвечает на единственный вопрос «когда будет готово».
 *  Пиры, рейтинг и коды состояний сюда не лезут — они в меню действий. */
function headline(t: Torrent): { text: string; color: string } {
  if (t.error) return { text: L.errorPressA, color: COLORS.error };
  if (t.status === 2) return { text: L.checking, color: COLORS.check };
  if (isMagnet(t)) return { text: L.fetchingInfo, color: COLORS.check };
  if (t.status === 0) return t.percent >= 100
    ? { text: L.downloadedWord, color: COLORS.seed }
    : { text: L.paused, color: COLORS.idle };
  if (t.status === 6 || t.finished) return { text: L.seeding, color: COLORS.seed };
  if (t.status === 4) {
    const eta = humanEta(t.eta);
    return eta ? { text: L.left(eta), color: COLORS.text } : { text: L.estimating, color: COLORS.dim };
  }
  return { text: statusLabel(t), color: COLORS.dim };
}

export function TorrentCard({ torrent }: { torrent: Torrent }) {
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const accent = accentFor(torrent);
  const running = isRunning(torrent);
  const pct = barPercent(torrent);
  const head = headline(torrent);
  const left = Math.max(torrent.wantedSize - torrent.haveSize, 0);
  const refresh = () => store.refresh();

  const act = async (action: string) => {
    await setTorrent(torrent.id, action);
    refresh();
  };

  const openMenu = () => {
    showContextMenu(
      <Menu label={torrent.name} cancelText={L.close}>
        <MenuItem onSelected={() => act(running ? "stop" : "start")}>
          {running ? L.pause : L.resume}
        </MenuItem>
        <MenuItem onSelected={() => act("verify")}>{L.verify}</MenuItem>
        <MenuItem onSelected={() => act("reannounce")}>{L.reannounce}</MenuItem>
        <MenuSeparator />
        <MenuItem onSelected={() => confirmRemove(torrent, false, refresh)}>{L.removeKeep}</MenuItem>
        <MenuItem tone="destructive" onSelected={() => confirmRemove(torrent, true, refresh)}>
          {L.removeWithData}
        </MenuItem>
      </Menu>,
      ref.current ?? undefined,
    );
  };

  return (
    <Focusable
      ref={ref}
      onActivate={() => act(running ? "stop" : "start")}
      onSecondaryButton={openMenu}
      onGamepadFocus={() => setFocused(true)}
      onGamepadBlur={() => setFocused(false)}
      onOKActionDescription={running ? L.pause : L.resume}
      onSecondaryActionDescription={L.more}
      style={{
        ...cardStyle(accent),
        background: focused ? COLORS.cardFocus : COLORS.card,
        boxShadow: focused ? `0 0 0 1px ${accent}88, 0 2px 10px rgba(0,0,0,0.35)` : "none",
        transition: "background 0.15s ease-out, box-shadow 0.15s ease-out",
      }}
    >
      {/* Имя — мелко и в одну строку: это подпись к цифрам, а не главное */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <StatusIcon torrent={torrent} color={accent} />
        <div
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: "12px",
            lineHeight: "15px",
            color: COLORS.dim,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {torrent.name}
        </div>
      </div>

      {/* Процент — самое крупное на экране: его читают в первую очередь */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            fontSize: "30px",
            fontWeight: 800,
            lineHeight: "32px",
            color: accent,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.02em",
          }}
        >
          {fmtPercent(pct)}
        </span>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
          <ProgressLine percent={pct} color={accent} live={torrent.status === 4 || torrent.status === 2} />
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: head.color,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {head.text}
          </span>
        </div>
      </div>

      {/* Сколько уже есть и сколько ещё ждать — вторым уровнем */}
      {!isMagnet(torrent) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "8px",
            fontSize: "12px",
            lineHeight: "15px",
            color: COLORS.dim,
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}
        >
          <span>{L.downloadedOf(humanSize(torrent.haveSize), humanSize(torrent.wantedSize))}</span>
          {torrent.status === 4 && left > 0 && <span>{L.toGo(humanSize(left))}</span>}
          {torrent.downSpeed > 0 && torrent.status !== 4 && <span>{humanSpeed(torrent.downSpeed)}</span>}
        </div>
      )}

      {torrent.error && (
        <div style={{ fontSize: "11px", lineHeight: "14px", color: COLORS.error }}>{torrent.error}</div>
      )}
    </Focusable>
  );
}

/* ─── Шапка: одна строка про скорость и общий итог ───────────────────────── */

export function SummaryHeader({ snap }: { snap: Snapshot }) {
  const want = snap.wantTotal ?? 0;
  const have = snap.haveTotal ?? 0;
  const pct = want > 0 ? (have / want) * 100 : 0;
  const down = snap.downTotal ?? 0;
  const active = snap.activeCount ?? 0;

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
        <span
          style={{
            fontSize: "22px",
            fontWeight: 800,
            color: down > 0 ? COLORS.down : COLORS.dim,
            fontVariantNumeric: "tabular-nums",
            lineHeight: "26px",
          }}
        >
          ↓ {humanSpeed(down)}
        </span>
        <span style={{ fontSize: "12px", color: COLORS.dim, whiteSpace: "nowrap" }}>
          {active > 0 ? L.downloadingN(active) : L.noDownloads}
        </span>
      </div>

      <ProgressLine percent={pct} color={COLORS.down} height={6} live={down > 0} />

      <div style={{ fontSize: "12px", color: COLORS.dim, fontVariantNumeric: "tabular-nums" }}>
        {L.totalDownloadedOf(humanSize(have), humanSize(want), fmtPercent(pct))}
      </div>
    </Card>
  );
}
