#!/bin/bash
# DeckTorrent — установка одной командой.
#
#   ~/Documents/DeckTorrent/install.sh              полная установка
#   ~/Documents/DeckTorrent/install.sh --uninstall  удалить (файлы и закачки не трогает)
#
# Скрипт идемпотентный: гоняйте сколько угодно раз, повторный запуск чинит то,
# что разъехалось, и ничего не ломает. sudo спрашивается один раз и только ради
# двух вещей: плагин Decky живёт в root-каталоге, а хук сна — в /etc.

set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PFX="$HOME/.local/opt/transmission"
CFGDIR="$HOME/.config/transmission-daemon"
UNIT="$HOME/.config/systemd/user/transmission-daemon.service"
APPS="$HOME/.local/share/applications"
ICONDIR="$HOME/.local/share/icons/hicolor/scalable/apps"
PLUGDIR="/home/deck/homebrew/plugins/DeckTorrent"
OLDPLUGDIR="/home/deck/homebrew/plugins/TransmissionMonitor"
DOWNLOADS="${DECKTORRENT_DOWNLOADS:-$HOME/Downloads}"
WATCH="${DECKTORRENT_WATCH:-$HOME/Torrents}"
MIRROR=https://steamdeck-packages.steamos.cloud/archlinux-mirror/extra-3.8/os/x86_64
PKGS=(transmission-cli-4.0.6-10 libnatpmp-20230423-3 miniupnpc-2.3.3-1 libb64-1.2.1-5)

G='\033[32m'; R='\033[31m'; Y='\033[33m'; B='\033[36m'; D='\033[2m'; N='\033[0m'
step()  { echo -e "\n${B}▸ $*${N}"; }
ok()    { echo -e "  ${G}✓${N} $*"; }
skip()  { echo -e "  ${D}·${N} ${D}$*${N}"; }
warn()  { echo -e "  ${Y}!${N} $*"; WARNED=$((WARNED+1)); }
die()   { echo -e "  ${R}✗${N} $*"; exit 1; }
WARNED=0
SUDO_OK=0
DO_PLUGIN=1
DO_HOOK=1
FORCE_BIN=0
MODE=install

while [ $# -gt 0 ]; do
    case "$1" in
        --uninstall)      MODE=uninstall ;;
        --no-plugin)      DO_PLUGIN=0 ;;
        --no-sleep-hook)  DO_HOOK=0 ;;
        --force-binaries) FORCE_BIN=1 ;;
        -h|--help)
            sed -n '2,10p' "$0" | sed 's/^# \?//'
            echo "Ключи: --uninstall --no-plugin --no-sleep-hook --force-binaries"
            exit 0 ;;
        *) die "неизвестный ключ: $1 (см. --help)" ;;
    esac
    shift
done

[ "$(id -u)" -ne 0 ] || die "запускать надо от обычного пользователя, без sudo — пароль спрошу сам"

need_sudo() {
    # Один запрос пароля на весь запуск. Нет пароля — не беда, просто пропустим
    # шаги, которым нужен root, и скажем, что доделать руками.
    [ "$SUDO_OK" = 1 ] && return 0
    [ "$SUDO_OK" = 2 ] && return 1
    if sudo -n true 2>/dev/null || sudo -v 2>/dev/null; then
        SUDO_OK=1
        # Держим пароль «тёплым», пока идёт установка.
        while sudo -n true 2>/dev/null; do sleep 30; kill -0 "$$" 2>/dev/null || exit; done &
        SUDO_KEEPALIVE=$!
        return 0
    fi
    SUDO_OK=2
    return 1
}

cleanup() { [ -n "${SUDO_KEEPALIVE:-}" ] && kill "$SUDO_KEEPALIVE" 2>/dev/null; }
trap cleanup EXIT

# ─── Удаление ────────────────────────────────────────────────────────────────

if [ "$MODE" = uninstall ]; then
    step "Останавливаю демон"
    systemctl --user disable --now transmission-daemon 2>/dev/null && ok "сервис выключен" || skip "сервис и так не работал"

    step "Убираю ярлыки и обработчик ссылок"
    rm -f "$APPS"/decktorrent-*.desktop "$APPS"/transmission-daemon-add.desktop \
          "$APPS"/transmission-daemon.desktop "$APPS"/transmission-gui.desktop
    update-desktop-database "$APPS" 2>/dev/null
    ok "ярлыки удалены"

    step "Убираю плагин Decky"
    if need_sudo; then
        sudo rm -rf "$PLUGDIR" "$OLDPLUGDIR"
        sudo rm -f /etc/systemd/system-sleep/transmission.sh
        sudo systemctl restart plugin_loader 2>/dev/null
        ok "плагин и хук сна удалены"
    else
        warn "без sudo не убрать: sudo rm -rf $PLUGDIR /etc/systemd/system-sleep/transmission.sh"
    fi

    echo -e "\n${G}Готово.${N} Бинарники ($PFX), настройки ($CFGDIR) и сами закачки остались на месте."
    echo -e "${D}Снести и их: rm -rf $PFX $CFGDIR $UNIT${N}\n"
    exit 0
fi

# ─── Установка ───────────────────────────────────────────────────────────────

echo -e "\n${B}DeckTorrent${N} — торренты в игровом режиме Steam Deck"
echo -e "${D}репозиторий: $REPO${N}"

step "1/9  Проверяю окружение"
for tool in curl bsdtar python3 systemctl; do
    command -v "$tool" >/dev/null || die "нет команды $tool — без неё установка невозможна"
done
ok "нужные утилиты на месте"
[ -d /home/deck/homebrew ] || { warn "Decky Loader не найден — плагин ставить некуда"; DO_PLUGIN=0; }

step "2/9  Transmission 4.0.6 в домашнем каталоге"
if [ "$FORCE_BIN" = 0 ] && [ -x "$PFX/bin/transmission-daemon" ]; then
    skip "уже распакован ($PFX)"
else
    # В /usr ставить нельзя: SteamOS перезаписывает корень при каждом обновлении,
    # и сервис остаётся с несуществующим бинарником. $HOME обновление не трогает.
    TMP=$(mktemp -d)
    for f in "${PKGS[@]}"; do
        echo -ne "  ${D}качаю $f…${N}\r"
        curl -sfLO --output-dir "$TMP" "$MIRROR/$f-x86_64.pkg.tar.zst" \
            || die "не скачался $f — проверьте интернет"
        bsdtar -xf "$TMP/$f-x86_64.pkg.tar.zst" -C "$TMP" || die "не распаковался $f"
    done
    mkdir -p "$PFX/bin" "$PFX/lib" "$PFX/share"
    cp "$TMP"/usr/bin/transmission-* "$PFX/bin/"
    cp -P "$TMP"/usr/lib/libb64.so.0* "$TMP"/usr/lib/libminiupnpc.so.21* "$TMP"/usr/lib/libnatpmp.so.1* "$PFX/lib/" 2>/dev/null
    cp -r "$TMP"/usr/share/transmission "$PFX/share/"
    rm -rf "$TMP"
    ok "распакован в $PFX ($(du -sh "$PFX" | cut -f1))"
fi

mkdir -p "$HOME/.local/bin"
cat > "$HOME/.local/bin/transmission-remote" <<WRAP
#!/bin/bash
# Обёртка: без LD_LIBRARY_PATH бинарник не найдёт свои три библиотеки.
export LD_LIBRARY_PATH="$PFX/lib\${LD_LIBRARY_PATH:+:\$LD_LIBRARY_PATH}"
exec "$PFX/bin/transmission-remote" "\$@"
WRAP
chmod +x "$HOME/.local/bin/transmission-remote"
ok "transmission-remote доступен из PATH"

step "3/9  Каталоги загрузок"
mkdir -p "$DOWNLOADS" "$WATCH" "$CFGDIR"
ok "загрузки: $DOWNLOADS"
ok "папка слежения: $WATCH  ${D}(кинул .torrent — начало качаться)${N}"

step "4/9  Настройки демона"
systemctl --user stop transmission-daemon 2>/dev/null   # правим конфиг только при остановленном демоне: живой перезапишет его своим
python3 - "$CFGDIR/settings.json" "$DOWNLOADS" "$WATCH" <<'PY'
import json, os, sys

path, downloads, watch = sys.argv[1], sys.argv[2], sys.argv[3]
try:
    with open(path) as f:
        cfg = json.load(f)
except Exception:
    cfg = {}

# Ставим только то, без чего DeckTorrent не работает или работает плохо.
# Остальное — скорости, лимиты, шифрование — остаётся как настроил пользователь.
cfg.update({
    "rpc-enabled": True,                     # без RPC не будет ни плагина, ни веба
    "rpc-port": 9091,
    "rpc-bind-address": "127.0.0.1",         # наружу не светим
    "rpc-whitelist": "127.0.0.1,::1",
    "rpc-whitelist-enabled": True,
    "rpc-authentication-required": False,    # слушаем только localhost, пароль тут лишний
    "download-dir": downloads,
    "watch-dir": watch,
    "watch-dir-enabled": True,
    "start-added-torrents": True,
    "rename-partial-files": True,
    "ratio-limit": 0,                        # не раздаём после закачки: Deck и так на батарее
    "ratio-limit-enabled": True,
    "idle-seeding-limit": 5,
    "idle-seeding-limit-enabled": True,
    "peer-port-random-on-start": False,
    "port-forwarding-enabled": True,
    "utp-enabled": True,
})
cfg.setdefault("peer-port", 51413)
cfg.setdefault("cache-size-mb", 16)          # меньше записей на SSD/карту
cfg.setdefault("encryption", 1)

os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, "w") as f:
    json.dump(cfg, f, indent=4, sort_keys=True, ensure_ascii=False)
print(f"  ключей в конфиге: {len(cfg)}")
PY
[ $? -eq 0 ] && ok "RPC включён, автораздача после скачивания выключена" || die "не удалось записать settings.json"

step "5/9  Фоновый сервис"
mkdir -p "$(dirname "$UNIT")"
cat > "$UNIT" <<UNITFILE
[Unit]
Description=Transmission BitTorrent Daemon (DeckTorrent)
After=network-online.target
Wants=network-online.target
# Без лимита сервис с отсутствующим бинарником уходит в вечный цикл рестартов
# (однажды намотал 3393 перезапуска за загрузку).
StartLimitIntervalSec=300
StartLimitBurst=3

[Service]
Type=simple
Environment=LD_LIBRARY_PATH=%h/.local/opt/transmission/lib
Environment=TRANSMISSION_WEB_HOME=%h/.local/opt/transmission/share/transmission/public_html
ExecStart=%h/.local/opt/transmission/bin/transmission-daemon --foreground --config-dir %h/.config/transmission-daemon
Restart=on-failure
RestartSec=10

[Install]
WantedBy=default.target
UNITFILE
systemctl --user daemon-reload
systemctl --user enable --now transmission-daemon >/dev/null 2>&1
for _ in $(seq 1 20); do systemctl --user -q is-active transmission-daemon && break; sleep 0.25; done
if systemctl --user -q is-active transmission-daemon; then
    ok "демон запущен и включён в автозапуск"
else
    warn "демон не поднялся — смотрите: journalctl --user -u transmission-daemon -n 30"
fi

# Без linger демон умрёт вместе с сессией — а переход десктоп ⇄ игровой режим её меняет.
if [ "$(loginctl show-user "$USER" --property=Linger --value 2>/dev/null)" != "yes" ]; then
    if need_sudo && sudo loginctl enable-linger "$USER" 2>/dev/null; then
        ok "закачки переживают выход из сессии (linger включён)"
    else
        warn "включите вручную, иначе закачки встанут при смене режима: sudo loginctl enable-linger $USER"
    fi
else
    skip "linger уже включён"
fi

step "6/9  Ярлыки и обработчик magnet-ссылок"
mkdir -p "$APPS" "$ICONDIR"
cp "$REPO/assets/decktorrent.svg" "$ICONDIR/decktorrent.svg" 2>/dev/null && ok "иконка установлена"
rm -f "$APPS/transmission-daemon.desktop" "$APPS/transmission-gui.desktop" "$APPS/transmission-daemon-add.desktop"

make_desktop() {  # имя_файла  название  описание  команда  скрыт
    cat > "$APPS/$1" <<DESKTOP
[Desktop Entry]
Type=Application
Name=$2
Comment=$3
Exec=$4
Icon=decktorrent
Terminal=false
Categories=Network;FileTransfer;
DESKTOP
    [ -n "${5:-}" ] && printf '%s\n' "$5" >> "$APPS/$1"
}

make_desktop decktorrent-gui.desktop "DeckTorrent" \
    "Управление закачками — веб-интерфейс фонового демона" \
    "$REPO/scripts/transmission-gui.sh"
make_desktop decktorrent-daemon.desktop "DeckTorrent (фон)" \
    "Запустить фоновую загрузку — работает и в игровом режиме" \
    "$REPO/scripts/transmission-daemon.sh"
make_desktop decktorrent-add.desktop "DeckTorrent (добавить торрент)" \
    "Добавить .torrent или magnet-ссылку в фоновый демон" \
    "$REPO/scripts/torrent-add.sh %U" \
    "NoDisplay=true
MimeType=application/x-bittorrent;x-scheme-handler/magnet;"

chmod +x "$REPO"/scripts/*.sh
update-desktop-database "$APPS" 2>/dev/null
xdg-mime default decktorrent-add.desktop application/x-bittorrent 2>/dev/null
xdg-mime default decktorrent-add.desktop x-scheme-handler/magnet 2>/dev/null
ok "ярлыки в меню, magnet-ссылки уходят прямо в демон"

step "7/9  Плагин Decky"
if [ "$DO_PLUGIN" = 0 ]; then
    skip "пропущено"
elif [ ! -f "$REPO/plugin/dist/index.js" ] && ! command -v npm >/dev/null; then
    warn "нет ни собранного plugin/dist/index.js, ни npm — соберите на машине с Node и повторите"
else
    # Пересобираем, только если исходники свежее бандла — иначе ставим готовый dist из репозитория.
    STALE=$(find "$REPO/plugin/src" -newer "$REPO/plugin/dist/index.js" -print -quit 2>/dev/null)
    if command -v npm >/dev/null && { [ ! -f "$REPO/plugin/dist/index.js" ] || [ -n "$STALE" ]; }; then
        echo -e "  ${D}собираю фронтенд…${N}"
        (
            cd "$REPO/plugin" || exit 1
            [ -d node_modules ] || npm ci >/dev/null 2>&1
            npm run build >/dev/null 2>&1
        ) && ok "фронтенд собран" || warn "сборка не удалась, ставлю прежний dist"
    fi
    if need_sudo; then
        sudo rm -rf "$PLUGDIR" "$OLDPLUGDIR"   # старое имя плагина — иначе в меню будут две копии
        sudo mkdir -p "$PLUGDIR/dist"
        for f in plugin.json package.json main.py LICENSE README.md; do
            [ -f "$REPO/plugin/$f" ] && sudo cp "$REPO/plugin/$f" "$PLUGDIR/$f"
        done
        sudo cp "$REPO/plugin/dist/index.js" "$PLUGDIR/dist/index.js"
        sudo chown -R root:root "$PLUGDIR"
        sudo systemctl restart plugin_loader
        for _ in $(seq 1 20); do
            grep -qs "DeckTorrent запущен" "$HOME"/homebrew/logs/DeckTorrent/*.log && break
            sleep 0.5
        done
        if grep -qs "DeckTorrent запущен" "$HOME"/homebrew/logs/DeckTorrent/*.log; then
            ok "плагин загружен ($(du -sh "$PLUGDIR" | cut -f1))"
        else
            warn "загрузчик не отчитался — sudo journalctl -u plugin_loader -n 50"
        fi
    else
        warn "без sudo плагин не поставить: sudo $REPO/scripts/deploy.sh"
    fi
fi

step "8/9  Хук сна"
if [ "$DO_HOOK" = 0 ]; then
    skip "пропущено"
elif need_sudo; then
    sudo mkdir -p /etc/systemd/system-sleep
    sudo install -m 755 "$REPO/scripts/transmission-sleep-hook.sh" /etc/systemd/system-sleep/transmission.sh \
        && ok "торренты встают на паузу перед сном и продолжают после" \
        || warn "не удалось поставить хук"
else
    warn "без sudo: sudo install -m 755 $REPO/scripts/transmission-sleep-hook.sh /etc/systemd/system-sleep/transmission.sh"
fi

step "9/9  Проверка"
sleep 1
if "$HOME/.local/bin/transmission-remote" -l >/dev/null 2>&1; then
    ok "RPC отвечает на localhost:9091"
else
    warn "RPC молчит — запустите: systemctl --user restart transmission-daemon"
fi

echo
if [ "$WARNED" -eq 0 ]; then
    echo -e "${G}Готово. Всё работает.${N}"
else
    echo -e "${Y}Готово, но $WARNED пункт(ов) требуют внимания — см. строки «!» выше.${N}"
fi
printf '%b' "$(cat <<SUMMARY

  ${B}Как пользоваться${N}
   • Игровой режим: кнопка «⋯» → Decky → ${B}DeckTorrent${N} — прогресс, скорости, пауза, Y = действия
   • Десктоп: ярлык ${B}DeckTorrent${N} (веб-интерфейс) или просто откройте magnet-ссылку
   • Автоподхват: положите .torrent в ${B}$WATCH${N}
   • Загрузки: ${B}$DOWNLOADS${N}

  ${D}Диагностика: $REPO/scripts/selftest.sh${N}
  ${D}Удалить:     $REPO/install.sh --uninstall${N}

SUMMARY
)"
