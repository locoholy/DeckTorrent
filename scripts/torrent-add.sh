#!/bin/bash
# Добавляет .torrent или magnet-ссылку прямо в transmission-daemon.
# Используется как обработчик по умолчанию для application/x-bittorrent и magnet:
RC=/home/deck/.local/bin/transmission-remote
if [ ! -x "$RC" ]; then
    # запасной путь: бинарник без обёртки не найдёт свои библиотеки
    PFX="$HOME/.local/opt/transmission"
    export LD_LIBRARY_PATH="$PFX/lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
    RC="$PFX/bin/transmission-remote"
fi

# демон может спать — поднимаем
if ! systemctl --user -q is-active transmission-daemon; then
    systemctl --user start transmission-daemon
    for i in $(seq 1 20); do
        systemctl --user -q is-active transmission-daemon && break
        sleep 0.25
    done
fi

ok=0; fail=0
for arg in "$@"; do
    # KDE может передать file:// — приводим к обычному пути
    case "$arg" in
        file://*) arg=$(printf '%b' "$(echo "${arg#file://}" | sed 's/%\([0-9A-Fa-f]\{2\}\)/\\x\1/g')") ;;
    esac
    if "$RC" -a "$arg" >/dev/null 2>&1; then ok=$((ok+1)); else fail=$((fail+1)); fi
done

if [ "$fail" -eq 0 ]; then
    notify-send -i com.transmissionbt.Transmission "Transmission" "Добавлено в закачку: $ok" 2>/dev/null \
      || zenity --info --text="Добавлено в закачку: $ok" --timeout=3 2>/dev/null
else
    notify-send -u critical -i dialog-error "Transmission" "Не добавлено: $fail" 2>/dev/null \
      || zenity --error --text="Не удалось добавить: $fail" 2>/dev/null
fi
