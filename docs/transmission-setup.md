# Transmission на Steam Deck

Всё лежит **только здесь**. В `/home/deck` скриптов больше нет.

## Как качать

| Что | Действие |
|-----|----------|
| **Фон** (Gaming Mode ок) | Ярлык «DeckTorrent (фон)» или `./transmission-daemon.sh` |
| **Веб в десктопе** | Ярлык «DeckTorrent» |
| **Веб** | http://localhost:9091 (когда демон запущен) |
| **Кинуть .torrent** | в `~/Torrents/` — подхватит сам |
| **Загрузки** | `~/Downloads/` |

Автозапуск демона включает установщик (`systemctl --user enable --now transmission-daemon`
плюс `loginctl enable-linger` — без него сервис умирает вместе с сессией при
переходе десктоп ⇄ игровой режим).

## Установка

Всё ставится одной командой — `~/Documents/DeckTorrent/install.sh`. Ниже описано,
что именно она делает и как чинить руками, если что-то разъехалось.

## После обновления SteamOS

**Больше ничего делать не надо.** Раньше бинарник ставился через pacman в `/usr/bin`,
который SteamOS перезаписывает образом при каждом обновлении — сервис оставался
с несуществующим `ExecStart` и уходил в бесконечный цикл рестартов.

Теперь transmission 4.0.6 распакован в `~/.local/opt/transmission/` (5,4 МБ):

```
~/.local/opt/transmission/bin/     transmission-daemon, -remote, -create, -show, -edit, -cli
~/.local/opt/transmission/lib/     libb64.so.0, libminiupnpc.so.21, libnatpmp.so.1
~/.local/opt/transmission/share/   веб-интерфейс (public_html)
```

`$HOME` обновлением не трогается, так что это переживает апдейты. Три библиотеки
лежат рядом, потому что в базовой SteamOS их нет; юнит подставляет `LD_LIBRARY_PATH`
и `TRANSMISSION_WEB_HOME`. Остальные зависимости (curl, openssl, libevent, libdeflate,
libpsl) в системе есть.

`transmission-remote` доступен из PATH через обёртку `~/.local/bin/transmission-remote`.

### Если всё же понадобится переставить

Пакеты берутся с зеркала SteamOS (ветка совпадает с системой, `extra-3.8`):

```bash
BASE=https://steamdeck-packages.steamos.cloud/archlinux-mirror/extra-3.8/os/x86_64
PFX=~/.local/opt/transmission
mkdir -p /tmp/tr && cd /tmp/tr
for f in transmission-cli-4.0.6-10 libnatpmp-20230423-3 miniupnpc-2.3.3-1 libb64-1.2.1-5; do
  curl -sLO "$BASE/$f-x86_64.pkg.tar.zst" && bsdtar -xf "$f-x86_64.pkg.tar.zst"
done
mkdir -p $PFX/bin $PFX/lib $PFX/share
cp usr/bin/transmission-* $PFX/bin/
cp -P usr/lib/libb64.so.0 usr/lib/libminiupnpc.so.21 usr/lib/libnatpmp.so.1 $PFX/lib/
cp -r usr/share/transmission $PFX/share/
systemctl --user restart transmission-daemon
```

## Сон Deck

Пока демон крутится — сон может тупить. Опционально поставь hook:

```bash
sudo install -m 755 ~/Documents/DeckTorrent/scripts/transmission-sleep-hook.sh \
    /etc/systemd/system-sleep/transmission.sh
```

## Сервисы

- **Нужный:** `systemctl --user status transmission-daemon`
- **Не нужен:** старый system `transmission.service` (должен быть удалён)

Юнит: `~/.config/systemd/user/transmission-daemon.service`. В нём стоит
`StartLimitBurst=3` / `StartLimitIntervalSec=300` — если демон всё же не стартует,
systemd сдаётся после 3 попыток вместо вечного цикла. Проверить, что не залип:

```bash
systemctl --user status transmission-daemon
journalctl -b | grep -c 'transmission-daemon.service: Scheduled restart'
```

## Плагин Decky

Папка `plugin/` — торренты в QAM игрового режима: прогресс, скорости, ETA, пиры,
пауза/возобновить. Переписан под актуальный API (`@decky/api` + `@decky/ui`),
собирается через rollup. Подробности — в `plugin/README.md`.

Ставится установщиком; переустановить только плагин после правок:

```bash
cd ~/Documents/DeckTorrent/plugin && npm run build
sudo ~/Documents/DeckTorrent/scripts/deploy.sh
```

Плагину нужен запущенный демон — он читает его по RPC на порту 9091.
