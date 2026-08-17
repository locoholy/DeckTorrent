#!/bin/bash
# Запуск фонового демона (user-сервис + веб http://localhost:9091)
CFG="$HOME/.config/transmission-daemon/settings.json"
sed -i 's/"rpc-enabled": false/"rpc-enabled": true/' "$CFG" 2>/dev/null

if pgrep -f "com.transmissionbt.Transmission|transmission-gtk" >/dev/null; then
  zenity --error --text="Сначала закрой окно Transmission!"
  exit 1
fi

if systemctl --user -q is-active transmission-daemon; then
  zenity --info --text="Демон уже запущен\nhttp://localhost:9091" --timeout=3
  exit 0
fi

systemctl --user start transmission-daemon
sleep 1

if systemctl --user -q is-active transmission-daemon; then
  zenity --info --text="Демон запущен\nВеб: http://localhost:9091" --timeout=5
else
  zenity --error --text="Не удалось запустить демон"
  exit 1
fi
