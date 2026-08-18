#!/bin/bash
# Управление закачками в десктопе — через веб-интерфейс демона.
#
# ВАЖНО, почему не оконный Transmission:
# раньше этот скрипт останавливал демон и выключал RPC, чтобы запустить окно
# flatpak-версии. Из-за этого закачка, начатая в десктопе, НЕ продолжалась в
# игровом режиме: качало окно приложения, а оно закрывается вместе с десктопом,
# демон при этом был уже остановлен. Плагин в игровом режиме видел «Демон не
# запущен» — и был прав.
#
# Теперь единственный, кто качает, — фоновый демон. Он не останавливается
# никогда, поэтому закачки переживают переход между режимами.

CFG="$HOME/.config/transmission-daemon/settings.json"
URL="http://localhost:9091"

# RPC обязан быть включён — без него не работают ни веб, ни плагин
if grep -q '"rpc-enabled": false' "$CFG" 2>/dev/null; then
    sed -i 's/"rpc-enabled": false/"rpc-enabled": true/' "$CFG"
    systemctl --user restart transmission-daemon
    sleep 2
fi

if ! systemctl --user -q is-active transmission-daemon; then
    systemctl --user start transmission-daemon
    for i in $(seq 1 20); do
        systemctl --user -q is-active transmission-daemon && break
        sleep 0.25
    done
fi

if systemctl --user -q is-active transmission-daemon; then
    xdg-open "$URL" >/dev/null 2>&1 &
else
    zenity --error --text="Демон не запустился.\nПосмотри: systemctl --user status transmission-daemon" 2>/dev/null \
      || echo "Демон не запустился"
    exit 1
fi
