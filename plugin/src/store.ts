import { callable } from "@decky/api";

export interface Torrent {
  id: number;
  name: string;
  status: number;
  percent: number;
  checkPercent: number;
  metaPercent: number;
  downSpeed: number;
  upSpeed: number;
  eta: number;
  totalSize: number;
  wantedSize: number;
  haveSize: number;
  downloaded: number;
  uploaded: number;
  ratio: number;
  peers: number;
  peersFrom: number;
  peersTo: number;
  finished: boolean;
  error: string;
}

export interface Snapshot {
  ok: boolean;
  error?: string;
  torrents?: Torrent[];
  downTotal?: number;
  upTotal?: number;
  haveTotal?: number;
  wantTotal?: number;
  activeCount?: number;
}

export const getSnapshot = callable<[], Snapshot>("get_snapshot");
export const setTorrent = callable<[torrent_id: number, action: string], { ok: boolean }>("set_torrent");
export const setAll = callable<[action: string], { ok: boolean }>("set_all");
export const removeTorrent =
  callable<[torrent_id: number, delete_data: boolean], { ok: boolean }>("remove_torrent");

const POLL_MS = 2000;

type Listener = () => void;

/** Один опрос на всю панель: и заголовок, и список читают из общего снимка.
 *  Раньше каждый компонент дёргал RPC сам — это лишний трафик и рассинхрон цифр. */
class Store {
  snap: Snapshot | null = null;

  private listeners = new Set<Listener>();
  private timer: number | undefined;
  private inflight = false;

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    if (this.listeners.size === 1) {
      this.refresh();
      this.timer = window.setInterval(() => this.refresh(), POLL_MS);
    }
    return () => {
      this.listeners.delete(fn);
      if (this.listeners.size === 0 && this.timer !== undefined) {
        window.clearInterval(this.timer);
        this.timer = undefined;
      }
    };
  }

  async refresh(): Promise<void> {
    if (this.inflight) return;
    this.inflight = true;
    try {
      this.snap = await getSnapshot();
    } catch {
      this.snap = { ok: false, error: "rpc_failed" };
    } finally {
      this.inflight = false;
      this.listeners.forEach((fn) => fn());
    }
  }
}

export const store = new Store();
