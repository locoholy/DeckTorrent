import asyncio
import json
import urllib.error
import urllib.request

import decky

RPC_URL = "http://127.0.0.1:9091/transmission/rpc"
TIMEOUT = 5

FIELDS = [
    "id", "name", "status", "percentDone", "rateDownload", "rateUpload",
    "eta", "totalSize", "sizeWhenDone", "downloadedEver", "uploadedEver",
    "peersConnected", "peersSendingToUs", "peersGettingFromUs",
    "recheckProgress", "metadataPercentComplete", "uploadRatio",
    "isFinished", "error", "errorString",
]

_METHODS = {
    "start": "torrent-start",
    "stop": "torrent-stop",
    "verify": "torrent-verify",
    "reannounce": "torrent-reannounce",
}

# Как часто фоновый сторож ходит в демон: пока что-то качается — часто, иначе редко.
WATCH_ACTIVE = 15
WATCH_IDLE = 60

# Состояния, из которых торрент ещё может доехать до конца: очередь на проверку,
# проверка, очередь на скачивание, скачивание. Всё остальное (стоит, раздаёт,
# скачано) завершиться уже не может — ловить нечего.
_LIVE_STATUSES = (1, 2, 3, 4)

# Transmission отдаёт 409 с новым токеном на первый запрос — это норма, а не сбой.
_session_id = ""


def _post(payload: bytes) -> dict:
    req = urllib.request.Request(RPC_URL, data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    if _session_id:
        req.add_header("X-Transmission-Session-Id", _session_id)
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        return json.loads(resp.read().decode())


def _rpc_blocking(method: str, args: dict | None = None) -> dict:
    """Синхронный RPC. Вызывать только через asyncio.to_thread — urllib блокирует."""
    global _session_id
    payload = json.dumps({"method": method, "arguments": args or {}}).encode()
    try:
        return {"ok": True, "data": _post(payload)}
    except urllib.error.HTTPError as e:
        if e.code == 409:
            _session_id = e.headers.get("X-Transmission-Session-Id", "")
            try:
                return {"ok": True, "data": _post(payload)}
            except Exception as retry_err:
                decky.logger.warning(f"RPC повтор после 409 не удался: {retry_err}")
                return {"ok": False, "error": "rpc_failed"}
        decky.logger.warning(f"RPC HTTP {e.code}")
        return {"ok": False, "error": "rpc_failed"}
    except urllib.error.URLError:
        # Демон не запущен, либо rpc-enabled=false (так делает transmission-gui.sh).
        return {"ok": False, "error": "no_daemon"}
    except Exception as e:
        decky.logger.warning(f"RPC ошибка: {e}")
        return {"ok": False, "error": "rpc_failed"}


async def _rpc(method: str, args: dict | None = None) -> dict:
    return await asyncio.to_thread(_rpc_blocking, method, args)


def _shape(raw: dict) -> dict:
    torrents = []
    down_total = 0
    up_total = 0
    have_total = 0
    want_total = 0
    for t in raw.get("torrents", []):
        down = t.get("rateDownload", 0)
        up = t.get("rateUpload", 0)
        down_total += down
        up_total += up
        percent = t.get("percentDone", 0)
        # sizeWhenDone — это то, что реально качается (без снятых галок в файлах),
        # именно от него Transmission считает percentDone. totalSize врал бы на
        # раздачах с исключёнными файлами.
        want = t.get("sizeWhenDone", 0) or t.get("totalSize", 0)
        have = int(want * percent)
        have_total += have
        want_total += want
        torrents.append({
            "id": t.get("id"),
            "name": t.get("name", "?"),
            "status": t.get("status", 0),
            "percent": round(percent * 100, 1),
            "checkPercent": round(t.get("recheckProgress", 0) * 100, 1),
            "metaPercent": round(t.get("metadataPercentComplete", 1) * 100, 1),
            "downSpeed": down,
            "upSpeed": up,
            "eta": t.get("eta", -1),
            "totalSize": t.get("totalSize", 0),
            "wantedSize": want,
            "haveSize": have,
            "downloaded": t.get("downloadedEver", 0),
            "uploaded": t.get("uploadedEver", 0),
            "ratio": round(max(t.get("uploadRatio", 0), 0), 2),
            "peers": t.get("peersConnected", 0),
            "peersFrom": t.get("peersSendingToUs", 0),
            "peersTo": t.get("peersGettingFromUs", 0),
            "finished": t.get("isFinished", False),
            "error": t.get("errorString", "") or "",
        })
    # Активные сверху, дальше по имени — чтобы список не прыгал между опросами.
    torrents.sort(key=lambda x: (x["status"] not in (4, 6), x["name"].lower()))
    return {
        "ok": True,
        "torrents": torrents,
        "downTotal": down_total,
        "upTotal": up_total,
        "haveTotal": have_total,
        "wantTotal": want_total,
        "activeCount": sum(1 for t in torrents if t["status"] in (4, 6)),
    }


class Plugin:
    async def _main(self):
        self.loop = asyncio.get_event_loop()
        self._seen_done: set[int] = set()
        self._primed = False
        decky.logger.info("DeckTorrent запущен")
        self._watcher = self.loop.create_task(self._watch())

    async def _unload(self):
        watcher = getattr(self, "_watcher", None)
        if watcher:
            watcher.cancel()
        decky.logger.info("DeckTorrent выгружен")

    async def _uninstall(self):
        decky.logger.info("DeckTorrent удалён")

    async def get_snapshot(self) -> dict:
        """Дёргается фронтендом раз в 2 с, пока панель открыта."""
        res = await _rpc("torrent-get", {"fields": FIELDS})
        if not res["ok"]:
            return {"ok": False, "error": res["error"]}
        args = res["data"].get("arguments")
        if args is None:
            return {"ok": False, "error": "rpc_failed"}
        return _shape(args)

    async def set_torrent(self, torrent_id: int, action: str) -> dict:
        method = _METHODS.get(action)
        if method is None:
            return {"ok": False, "error": "bad_action"}
        res = await _rpc(method, {"ids": [torrent_id]})
        return {"ok": res["ok"], "error": res.get("error", "")}

    async def remove_torrent(self, torrent_id: int, delete_data: bool) -> dict:
        """delete_data=True стирает скачанное с диска — необратимо, фронт спрашивает подтверждение."""
        res = await _rpc("torrent-remove", {
            "ids": [torrent_id],
            "delete-local-data": bool(delete_data),
        })
        if res["ok"]:
            self._seen_done.discard(torrent_id)
        return {"ok": res["ok"], "error": res.get("error", "")}

    async def set_all(self, action: str) -> dict:
        method = _METHODS.get(action)
        if method is None:
            return {"ok": False, "error": "bad_action"}
        res = await _rpc(method, {})
        return {"ok": res["ok"], "error": res.get("error", "")}

    async def _watch(self):
        """Фоновая проверка — только чтобы поймать завершение загрузки.

        Живые скорости фронт тянет сам; здесь редкий опрос, чтобы не жечь батарею,
        когда панель закрыта. Когда качать нечего (список пуст, всё скачано или
        стоит на паузе), интервал растягивается с 15 с до 60 с: завершиться в этот
        момент всё равно нечему, а первый же тик после старта закачки вернёт частый
        опрос.
        """
        delay = WATCH_ACTIVE
        while True:
            try:
                res = await _rpc(
                    "torrent-get",
                    {"fields": ["id", "name", "status", "isFinished", "percentDone"]},
                )
                if res["ok"]:
                    args = res["data"].get("arguments") or {}
                    torrents = args.get("torrents", [])
                    delay = (
                        WATCH_ACTIVE
                        if any(t.get("status") in _LIVE_STATUSES for t in torrents)
                        else WATCH_IDLE
                    )
                    done_now = {t["id"] for t in torrents if t.get("percentDone", 0) >= 1.0}
                    names = {t["id"]: t.get("name", "?") for t in torrents}
                    if not self._primed:
                        # Первый проход только запоминает состояние, иначе при старте
                        # плагина посыплются тосты про давно скачанное.
                        self._seen_done = done_now
                        self._primed = True
                    else:
                        for tid in done_now - self._seen_done:
                            await decky.emit("transmission_done", names.get(tid, "?"))
                        self._seen_done = done_now
                else:
                    # Демона нет — ловить тем более нечего.
                    self._primed = False
                    delay = WATCH_IDLE
            except asyncio.CancelledError:
                raise
            except Exception as e:
                decky.logger.warning(f"Фоновая проверка сорвалась: {e}")
                delay = WATCH_IDLE
            await asyncio.sleep(delay)
