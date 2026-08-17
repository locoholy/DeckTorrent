import { addEventListener, callable, definePlugin, removeEventListener, toaster } from "@decky/api";
import {
  ButtonItem,
  Field,
  PanelSection,
  PanelSectionRow,
  ProgressBarWithInfo,
  staticClasses,
} from "@decky/ui";
import { useEffect, useRef, useState } from "react";
import { FaDownload } from "react-icons/fa";

const POLL_MS = 2000;

interface Torrent {
  id: number;
  name: string;
  status: number;
  percent: number;
  downSpeed: number;
  upSpeed: number;
  eta: number;
  totalSize: number;
  downloaded: number;
  uploaded: number;
  peers: number;
  peersFrom: number;
  finished: boolean;
  error: string;
}

interface Snapshot {
  ok: boolean;
  error?: string;
  torrents?: Torrent[];
  downTotal?: number;
  upTotal?: number;
}

const getSnapshot = callable<[], Snapshot>("get_snapshot");
const setTorrent = callable<[torrent_id: number, action: string], { ok: boolean }>("set_torrent");
const setAll = callable<[action: string], { ok: boolean }>("set_all");

function humanSize(bytes: number): string {
  if (bytes <= 0) return "0 Б";
  const units = ["Б", "КБ", "МБ", "ГБ", "ТБ"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function humanSpeed(bytesPerSec: number): string {
  return bytesPerSec > 0 ? `${humanSize(bytesPerSec)}/с` : "—";
}

function humanEta(seconds: number): string {
  if (seconds < 0) return "—";
  if (seconds < 60) return `${seconds} с`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч ${m % 60} мин`;
  return `${Math.floor(h / 24)} д ${h % 24} ч`;
}

// Коды состояний Transmission (см. RPC-спеку, поле status).
function statusLabel(t: Torrent): string {
  if (t.error) return "Ошибка";
  switch (t.status) {
    case 0: return "Остановлен";
    case 1: return "В очереди на проверку";
    case 2: return "Проверка";
    case 3: return "В очереди";
    case 4: return "Качается";
    case 5: return "В очереди на раздачу";
    case 6: return "Раздаётся";
    default: return "—";
  }
}

const isRunning = (t: Torrent) => t.status !== 0;

function TorrentRow({ torrent, onToggle }: { torrent: Torrent; onToggle: (t: Torrent) => void }) {
  const running = isRunning(torrent);
  const parts = [statusLabel(torrent)];
  if (torrent.downSpeed > 0) parts.push(`↓ ${humanSpeed(torrent.downSpeed)}`);
  if (torrent.upSpeed > 0) parts.push(`↑ ${humanSpeed(torrent.upSpeed)}`);
  if (torrent.status === 4 && torrent.eta >= 0) parts.push(humanEta(torrent.eta));
  if (torrent.peers > 0) parts.push(`${torrent.peersFrom}/${torrent.peers} пиров`);

  return (
    <>
      <PanelSectionRow>
        <ProgressBarWithInfo
          label={torrent.name}
          description={torrent.error || parts.join(" · ")}
          nProgress={torrent.percent}
          sOperationText={`${torrent.percent}%`}
          sTimeRemaining={humanSize(torrent.totalSize)}
          bottomSeparator="none"
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={() => onToggle(torrent)}>
          {running ? "Пауза" : "Возобновить"}
        </ButtonItem>
      </PanelSectionRow>
    </>
  );
}

function Content() {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const busy = useRef(false);

  const refresh = async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      setSnap(await getSnapshot());
    } catch (e) {
      setSnap({ ok: false, error: "rpc_failed" });
    } finally {
      busy.current = false;
    }
  };

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, POLL_MS);
    return () => window.clearInterval(id);
  }, []);

  const toggle = async (t: Torrent) => {
    await setTorrent(t.id, isRunning(t) ? "stop" : "start");
    refresh();
  };

  if (!snap) {
    return (
      <PanelSection title="Transmission" spinner>
        <PanelSectionRow>
          <Field label="Подключаюсь…" bottomSeparator="none" />
        </PanelSectionRow>
      </PanelSection>
    );
  }

  if (!snap.ok) {
    const noDaemon = snap.error === "no_daemon";
    return (
      <PanelSection title="Transmission">
        <PanelSectionRow>
          <Field
            label={noDaemon ? "Демон не запущен" : "Нет ответа от Transmission"}
            description={
              noDaemon
                ? "Запустите ярлык «Transmission (фон)» в десктопе. Если открыта оконная версия — закройте её, она отключает RPC."
                : "Демон отвечает с ошибкой. Проверьте: systemctl --user status transmission-daemon"
            }
            bottomSeparator="none"
          />
        </PanelSectionRow>
      </PanelSection>
    );
  }

  const torrents = snap.torrents ?? [];

  if (torrents.length === 0) {
    return (
      <PanelSection title="Transmission">
        <PanelSectionRow>
          <Field
            label="Торрентов нет"
            description="Положите .torrent в ~/Torrents — демон подхватит сам."
            bottomSeparator="none"
          />
        </PanelSectionRow>
      </PanelSection>
    );
  }

  const anyRunning = torrents.some(isRunning);

  return (
    <PanelSection title="Transmission">
      <PanelSectionRow>
        <Field
          label="Всего"
          description={`↓ ${humanSpeed(snap.downTotal ?? 0)}   ↑ ${humanSpeed(snap.upTotal ?? 0)}`}
          bottomSeparator="thick"
        />
      </PanelSectionRow>

      {torrents.map((t) => (
        <TorrentRow key={t.id} torrent={t} onToggle={toggle} />
      ))}

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={async () => {
            await setAll(anyRunning ? "stop" : "start");
            refresh();
          }}
        >
          {anyRunning ? "Остановить все" : "Запустить все"}
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
}

export default definePlugin(() => {
  const onDone = (name: string) => {
    toaster.toast({ title: "Загрузка завершена", body: name });
  };
  addEventListener<[name: string]>("transmission_done", onDone);

  return {
    name: "Transmission Monitor",
    titleView: <div className={staticClasses.Title}>Transmission</div>,
    content: <Content />,
    icon: <FaDownload />,
    onDismount() {
      removeEventListener("transmission_done", onDone);
    },
  };
});
