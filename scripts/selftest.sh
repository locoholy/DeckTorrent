#!/bin/bash
# Самопроверка DeckTorrent. Запуск:  ~/Documents/DeckTorrent/scripts/selftest.sh
# Ничего не меняет, только смотрит. sudo не нужен.

G='\033[32m'; R='\033[31m'; Y='\033[33m'; N='\033[0m'
ok(){ echo -e "  ${G}OK${N}   $1"; }
bad(){ echo -e "  ${R}FAIL${N} $1"; FAILED=$((FAILED+1)); }
warn(){ echo -e "  ${Y}--${N}   $1"; }
FAILED=0
RC=/home/deck/.local/bin/transmission-remote

echo
echo "=== 1. Демон Transmission ==="
if systemctl --user -q is-active transmission-daemon; then
    ok "сервис transmission-daemon запущен"
else
    bad "сервис не запущен → systemctl --user start transmission-daemon"
fi

if "$RC" -l >/dev/null 2>&1; then
    ok "RPC отвечает на localhost:9091"
    LINES=$("$RC" -l 2>/dev/null | wc -l)
    echo "       раздач сейчас: $(( LINES > 2 ? LINES - 2 : 0 ))"
else
    bad "RPC не отвечает"
fi

echo
echo "=== 2. Не раздаёт после закачки ==="
CFG=/home/deck/.config/transmission-daemon/settings.json
RL=$(grep -o '"ratio-limit": *[0-9.]*' "$CFG" 2>/dev/null | grep -o '[0-9.]*$')
RE=$(grep -o '"ratio-limit-enabled": *[a-z]*' "$CFG" 2>/dev/null | grep -o '[a-z]*$')
if [ "$RE" = "true" ] && [ "${RL%.*}" = "0" ]; then
    ok "лимит раздачи 0 и включён — файлы освобождаются сразу"
else
    bad "ratio-limit=$RL enabled=$RE (ожидалось 0 / true)"
fi

echo
echo "=== 3. Торренты и магниты идут в демон ==="
for MIME in application/x-bittorrent x-scheme-handler/magnet; do
    D=$(xdg-mime query default "$MIME" 2>/dev/null)
    if [ "$D" = "transmission-daemon-add.desktop" ]; then
        ok "$MIME → демон"
    else
        bad "$MIME → $D (ожидался transmission-daemon-add.desktop)"
    fi
done

H=/home/deck/Documents/DeckTorrent/scripts/torrent-add.sh
[ -x "$H" ] && ok "обработчик на месте и исполняем" || bad "нет обработчика: $H"
EXEC=$(grep -m1 '^Exec=' /home/deck/.local/share/applications/transmission-daemon-add.desktop 2>/dev/null | cut -d= -f2-)
case "$EXEC" in
    "$H"*) ok "ярлык указывает на актуальный путь" ;;
    *)     bad "ярлык ведёт не туда: $EXEC" ;;
esac

echo
echo "=== 4. Плагин Decky ==="
P=/home/deck/homebrew/plugins/TransmissionMonitor
if [ -d "$P" ]; then
    ok "установлен, версия $(grep -o '"version"[^,]*' $P/package.json 2>/dev/null | grep -o '[0-9.]*')"
    [ -f "$P/dist/index.js" ] && ok "фронтенд собран" || bad "нет dist/index.js — нужен npm run build"
    [ -f "$P/main.py" ] && ok "бэкенд на месте" || bad "нет main.py"
else
    bad "плагин не установлен в ~/homebrew/plugins/"
fi

if journalctl -u plugin_loader --no-pager 2>/dev/null | grep -q "Loaded TransmissionMonitor"; then
    ok "загрузчик подхватил плагин (есть 'Loaded TransmissionMonitor')"
else
    warn "в логе нет 'Loaded TransmissionMonitor' — перезапусти plugin_loader"
fi

echo
echo "=== 5. Окружение Decky ==="
echo "       версия загрузчика: $(cat /home/deck/homebrew/services/.loader.version 2>/dev/null)"
systemctl -q is-active plugin_loader && ok "plugin_loader работает" || bad "plugin_loader не запущен"
ss -tln 2>/dev/null | grep -q ":1337" && ok "Decky слушает 1337" || bad "порт 1337 не слушается"
ss -tln 2>/dev/null | grep -q ":8080" && ok "отладка CEF доступна на 8080" || warn "порт 8080 молчит (Steam не запущен?)"
[ -f /home/deck/.steam/steam/.cef-enable-remote-debugging ] && ok "флаг отладки CEF на месте" || warn "нет флага .cef-enable-remote-debugging"

CSS=$(journalctl -u plugin_loader --no-pager --since "-10 min" 2>/dev/null | grep -c "Failed to connect to tab")
if [ "$CSS" -gt 5 ]; then
    bad "CSS_Loader циклится на мёртвой вкладке ($CSS раз за 10 мин) → sudo systemctl restart plugin_loader"
else
    ok "цикла переподключения к вкладкам нет"
fi

echo
echo "=== 6. Режим ==="
if pgrep -x gamescope >/dev/null 2>&1; then
    ok "игровой режим — плагин должен быть виден в меню «⋯»"
else
    warn "Desktop Mode: панель Decky здесь не существует, плагин проверяй в игровом режиме"
fi

echo
if [ "$FAILED" -eq 0 ]; then
    echo -e "${G}Всё в порядке.${N}"
else
    echo -e "${R}Проблем: $FAILED${N} — смотри строки FAIL выше."
fi
echo
