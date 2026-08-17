# Transmission Monitor

Плагин Decky: торренты Transmission в игровом режиме Steam Deck — прогресс,
скорости, ETA, пиры и кнопки пауза/возобновить, без выхода в десктоп.

## Как работает

Плагин не запускает Transmission и не знает, где лежит его бинарник. Он общается
с уже работающим демоном по RPC на `http://127.0.0.1:9091/transmission/rpc`.
Значит, демон должен быть запущен: `systemctl --user start transmission-daemon`.

Два независимых цикла опроса:

| Цикл | Период | Зачем |
|---|---|---|
| Фронтенд → `get_snapshot` | 2 с | живые скорости, пока панель QAM открыта |
| Бэкенд `_watch` | 15 с | ловит завершение загрузки и шлёт тост |

Редкий фоновый цикл — сознательно: пока панель закрыта, незачем жечь батарею
ради цифр, которых никто не видит.

## Сборка

```bash
npm install
npm run build      # → dist/index.js
npx tsc --noEmit   # строгая проверка типов
```

Стек: `@decky/api` (definePlugin, callable, toaster) + `@decky/ui` (нативные
компоненты Steam, чтобы панель управлялась стиками) + rollup через `@decky/rollup`.
`dist/index.js` **собирается**, руками его не правят.

## Установка

Папка `~/homebrew/plugins/` принадлежит root, поэтому:

```bash
sudo cp -r ~/Documents/DeckTorrent/plugin ~/homebrew/plugins/TransmissionMonitor
sudo systemctl restart plugin_loader
```

Имя папки должно совпадать с `name` из `plugin.json` — `TransmissionMonitor`.

Логи плагина: `~/homebrew/logs/TransmissionMonitor/`.

## Состояния, которые показывает панель

- **Демон не запущен** — RPC недоступен. Либо сервис остановлен, либо открыта
  оконная версия Transmission: `transmission-gui.sh` специально выставляет
  `rpc-enabled: false`, и это ожидаемо, а не поломка.
- **Торрентов нет** — демон жив, список пуст. Кладите `.torrent` в `~/Torrents`.
- **Ошибка** — у торрента непустой `errorString`, текст показывается как есть.

## Структура

```
plugin.json      манифест Decky (имя, автор, api_version)
package.json     зависимости и скрипт сборки
main.py          бэкенд: RPC к Transmission, фоновый watcher
src/index.tsx    фронтенд на @decky/ui
dist/index.js    результат сборки — в git не редактируется руками
LICENSE          обязателен по спецификации Decky
```
