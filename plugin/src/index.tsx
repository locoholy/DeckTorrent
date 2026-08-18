import { addEventListener, definePlugin, removeEventListener, toaster } from "@decky/api";
import { DialogButton, Field, Focusable, PanelSection, PanelSectionRow, staticClasses } from "@decky/ui";
import { useEffect, useState } from "react";
import { FaDownload, FaPause, FaPlay, FaSyncAlt } from "react-icons/fa";

import { Card, Keyframes, SummaryHeader, TorrentCard } from "./components";
import { COLORS, humanSpeed, isRunning } from "./format";
import { L } from "./i18n";
import { setAll, store, type Snapshot } from "./store";

/** Все компоненты панели читают один и тот же снимок из общего стора. */
function useSnapshot(): Snapshot | null {
  const [, force] = useState(0);
  useEffect(() => store.subscribe(() => force((n) => n + 1)), []);
  return store.snap;
}

function Skeleton() {
  return (
    <Card>
      {[70, 100, 45].map((w, i) => (
        <div
          key={i}
          style={{
            height: i === 0 ? "14px" : "8px",
            width: `${w}%`,
            borderRadius: "4px",
            background: COLORS.track,
            animation: "dtPulse 1.4s ease-in-out infinite",
          }}
        />
      ))}
    </Card>
  );
}

function Notice({ title, text }: { title: string; text: string }) {
  return (
    <PanelSectionRow>
      <Field label={title} description={text} bottomSeparator="none" />
    </PanelSectionRow>
  );
}

function Content() {
  const snap = useSnapshot();

  if (!snap) {
    return (
      <PanelSection>
        <Keyframes />
        <PanelSectionRow>
          <Skeleton />
        </PanelSectionRow>
      </PanelSection>
    );
  }

  if (!snap.ok) {
    const noDaemon = snap.error === "no_daemon";
    return (
      <PanelSection>
        <Keyframes />
        <Notice
          title={noDaemon ? L.noDaemonTitle : L.rpcFailTitle}
          text={noDaemon ? L.noDaemonText : L.rpcFailText}
        />
        <PanelSectionRow>
          <DialogButton onClick={() => store.refresh()}>{L.retry}</DialogButton>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  const torrents = snap.torrents ?? [];

  if (torrents.length === 0) {
    return (
      <PanelSection>
        <Keyframes />
        <Notice
          title={L.emptyTitle}
          text={L.emptyText}
        />
      </PanelSection>
    );
  }

  const anyRunning = torrents.some(isRunning);

  return (
    <PanelSection>
      <Keyframes />

      {/* При одной закачке шапка дублировала бы карточку — показываем её только для списка */}
      {torrents.length > 1 && (
        <PanelSectionRow>
          <SummaryHeader snap={snap} />
        </PanelSectionRow>
      )}

      {torrents.map((t) => (
        <PanelSectionRow key={t.id}>
          <TorrentCard torrent={t} />
        </PanelSectionRow>
      ))}

      <PanelSectionRow>
        <Focusable style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
          <DialogButton
            style={{ flex: 1, minWidth: 0, padding: "9px", fontSize: "13px" }}
            onClick={async () => {
              await setAll(anyRunning ? "stop" : "start");
              store.refresh();
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
              {anyRunning ? <FaPause size={12} /> : <FaPlay size={12} />}
              {anyRunning ? L.pauseAll : L.startAll}
            </span>
          </DialogButton>
          <DialogButton
            style={{ flex: 1, minWidth: 0, padding: "9px", fontSize: "13px" }}
            onClick={() => store.refresh()}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
              <FaSyncAlt size={12} />
              {L.refresh}
            </span>
          </DialogButton>
        </Focusable>
      </PanelSectionRow>
    </PanelSection>
  );
}

/** Скорость прямо в шапке панели — видно, не разворачивая список. */
function TitleView() {
  const snap = useSnapshot();
  const down = snap?.ok ? snap.downTotal ?? 0 : 0;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <div className={staticClasses.Title}>DeckTorrent</div>
      {down > 0 && (
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: COLORS.down,
            fontVariantNumeric: "tabular-nums",
            paddingRight: "4px",
          }}
        >
          ↓ {humanSpeed(down)}
        </div>
      )}
    </div>
  );
}

export default definePlugin(() => {
  const onDone = (name: string) => {
    toaster.toast({ title: L.doneToast, body: name });
  };
  addEventListener<[name: string]>("transmission_done", onDone);

  return {
    name: "DeckTorrent",
    titleView: <TitleView />,
    content: <Content />,
    icon: <FaDownload />,
    onDismount() {
      removeEventListener("transmission_done", onDone);
    },
  };
});
