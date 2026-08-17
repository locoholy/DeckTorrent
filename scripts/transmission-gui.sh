#!/bin/bash
# Окно Transmission (flatpak). Останавливает фоновый демон.
CFG="$HOME/.config/transmission-daemon/settings.json"

if systemctl --user -q is-active transmission-daemon; then
  zenity --info --text="Останавливаю фоновый демон..." --timeout=2
  systemctl --user stop transmission-daemon
fi

sed -i 's/"rpc-enabled": true/"rpc-enabled": false/' "$CFG" 2>/dev/null
flatpak run com.transmissionbt.Transmission -g "$HOME/.config/transmission-daemon"
