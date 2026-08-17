# DeckTorrent

Торренты на Steam Deck по-человечески: фоновый демон Transmission вместо
десктопного окна, управление прямо из игрового режима, разумные умолчания.

Собрано и проверено на SteamOS (holo), Steam Deck.

---

## Из чего состоит

| Часть | Что делает |
|---|---|
| `plugin/` | плагин Decky — прогресс, скорости, ETA, пауза/возобновить в меню «⋯» |
| `scripts/torrent-add.sh` | обработчик `.torrent` и `magnet:` — добавляет прямо в демон |
| `scripts/transmission-daemon.sh` | запуск фонового демона + веб на `localhost:9091` |
| `scripts/transmission-gui.sh` | окно Transmission, когда нужно в десктопе |
| `scripts/transmission-sleep-hook.sh` | пауза закачек перед сном, продолжение после |
| `desktop/` | ярлыки для меню приложений |
| `docs/` | инструкции по разработке плагина и настройке демона |

Сам Transmission ставится в `~/.local/opt/transmission` — вне системных
каталогов, чтобы переживать обновления SteamOS. Обёртка в `~/.local/bin`
подставляет `LD_LIBRARY_PATH`.

---

## Что уже настроено

**Не раздаёт после закачки.** В `~/.config/transmission-daemon/settings.json`:

```json
"ratio-limit": 0,
"ratio-limit-enabled": true
```

Как только загрузка завершилась, торрент переходит в «Готово», отдача
прекращается и **файлы освобождаются**. Это важнее, чем кажется: пока демон
держит дескрипторы, удалённые файлы не возвращают место на диске.

**Торренты и магниты идут сразу в демон.** Обработчик прописан для
`application/x-bittorrent` и `x-scheme-handler/magnet`, окон не открывается.

---

## Установка на чистую машину

```bash
# 1. демон как пользовательский сервис
systemctl --user enable --now transmission-daemon

# 2. ассоциации
cp desktop/*.desktop ~/.local/share/applications/
xdg-mime default transmission-daemon-add.desktop application/x-bittorrent
xdg-mime default transmission-daemon-add.desktop x-scheme-handler/magnet
update-desktop-database ~/.local/share/applications

# 3. плагин (каталог принадлежит root)
cd plugin && npm install && npm run build && cd ..
sudo cp -r plugin ~/homebrew/plugins/TransmissionMonitor
sudo systemctl restart plugin_loader
```

---

## Проверить, что всё живо

```bash
~/Documents/DeckTorrent/scripts/selftest.sh
```

Проверяет демон, RPC, лимит раздачи, ассоциации, плагин, порты Decky и режим.
Ничего не меняет, sudo не нужен.

---

## Если плагина не видно

Первым делом: **он существует только в игровом режиме**. Кнопка «⋯» →
панель Decky. В Desktop Mode его нет и быть не может.

Проверить, что бэкенд жив:

```bash
journalctl -u plugin_loader | grep -i transmission | tail
```

Строки `found plugin` и `Loaded TransmissionMonitor` означают, что всё в
порядке и смотреть надо в игровом режиме.

Подробности — в [`docs/decky-plugin-dev.md`](docs/decky-plugin-dev.md).

---

## Что дальше

- [ ] Один установщик вместо ручных шагов
- [ ] Ярлык веб-морды `localhost:9091` в библиотеке Steam
- [ ] Обёртки для остальных бинарников (`transmission-create`, `-show`, `-cli`, `-edit` сейчас не запускаются из терминала — нет `LD_LIBRARY_PATH`)
- [ ] Защита от переполнения диска
- [ ] Деинсталлятор
