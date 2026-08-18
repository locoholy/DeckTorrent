#!/bin/bash
# Установка плагина в Decky. Требует sudo — каталог ~/homebrew/plugins принадлежит root.
# Запуск:  sudo ~/Documents/DeckTorrent/scripts/deploy.sh
#
# Кладёт ТОЛЬКО то, что нужно загрузчику. Ни node_modules, ни src, ни __pycache__:
# без этого плагин весит десятки килобайт вместо сотни мегабайт.

set -e
SRC=/home/deck/Documents/DeckTorrent/plugin
DST=/home/deck/homebrew/plugins/DeckTorrent

[ "$(id -u)" -eq 0 ] || { echo "Нужен sudo: sudo $0"; exit 1; }
[ -f "$SRC/dist/index.js" ] || { echo "Нет $SRC/dist/index.js — сначала npm run build"; exit 1; }

echo "Устанавливаю из $SRC"
# Плагин раньше звался TransmissionMonitor — иначе в меню останутся две копии.
rm -rf /home/deck/homebrew/plugins/TransmissionMonitor
rm -rf "$DST"
mkdir -p "$DST"

for f in plugin.json package.json main.py LICENSE README.md; do
    [ -f "$SRC/$f" ] && cp "$SRC/$f" "$DST/$f"
done
mkdir -p "$DST/dist"
cp "$SRC/dist/index.js" "$DST/dist/index.js"

echo "Размер: $(du -sh "$DST" | cut -f1)"
echo "Перезапускаю загрузчик..."
systemctl restart plugin_loader
sleep 2

if journalctl -u plugin_loader --no-pager --since "-1 min" | grep -q "Loaded DeckTorrent"; then
    echo "Готово: плагин загружен. Проверяй в игровом режиме, кнопка «⋯»."
else
    echo "Плагин не подхватился — смотри: journalctl -u plugin_loader -n 50"
    exit 1
fi
