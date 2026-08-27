# Changelog

Формат: [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/) ·
Версии: [SemVer](https://semver.org/lang/ru/)

## [Не выпущено] / [Unreleased]

### Изменено / Changed
- Фоновый сторож в плагине растягивает опрос с 15 с до 60 с, когда качать нечего:
  список пуст, всё скачано или стоит на паузе, а демон не отвечает — тем более.
  *The background watcher backs off from 15 s to 60 s while nothing can finish.*

### Удалено / Removed
- Из стора убрана история скоростей (`downHistory`/`upHistory`): её копили каждые
  2 с, но график так и не появился — ни один компонент её не читал.
  *Dropped the unused speed history that was collected for a chart that never shipped.*
- Деинсталлятор забирает с собой каталоги логов Decky, включая оставшийся от
  прежнего имени `TransmissionMonitor`.
  *The uninstaller now removes the plugin log directories too.*

## [2.1.0] — 2026-08-19

### Добавлено / Added
- `install.sh` — установка и удаление одной командой: бинарники, настройки демона,
  сервис с `linger`, ярлыки, обработчик `magnet:`, плагин Decky, хук сна, проверка RPC.
  *One-command installer and uninstaller.*
- Действия над торрентом по кнопке **Y**: проверить файлы, найти источники,
  убрать из списка, удалить с файлами (с подтверждением).
  *Per-torrent actions menu, including verify, reannounce and delete.*
- Локализация интерфейса: русский и английский по языку системы.
  *Russian and English UI, picked from the system language.*
- Иконка приложения и превью панели для README.
  *App icon and README artwork.*

### Изменено / Changed
- Плагин переименован в **DeckTorrent** (был `TransmissionMonitor`); установщик
  удаляет старую копию, чтобы в меню не было двух плагинов.
  *Renamed from `TransmissionMonitor`; the old copy is removed on install.*
- Панель переверстана под чтение с одного взгляда: крупный процент, «Осталось …»
  под полосой, «Скачано X из Y» мелким шрифтом. Пиры, рейтинг и коды состояний убраны в меню.
  *Redesigned for at-a-glance reading: large percentage, time left, sizes; details moved to the menu.*
- Прогресс честно отражает происходящее: скачивание, проверку хеша или сбор
  метаданных магнета — раньше во всех случаях показывалась доля скачанного.
  *The bar now reflects hash checking and magnet metadata, not just download progress.*
- Размеры считаются от `sizeWhenDone`, а не от `totalSize` — раздачи с исключёнными
  файлами больше не врут о своём объёме.
  *Sizes come from `sizeWhenDone`, so partially selected torrents report correctly.*
- Один опрос RPC на всю панель вместо опроса из каждого компонента.
  *A single shared poller instead of per-component polling.*

### Исправлено / Fixed
- Длинное имя репака разъезжалось на шесть строк и топило полосу прогресса.
  *Long torrent names no longer push the progress bar off-screen.*
- Процент не был виден вовсе. *The percentage was invisible.*

## [2.0.0] — 2026-08-18

- Плагин переписан под актуальный API (`@decky/api` + `@decky/ui`), сборка rollup.
- Закачки продолжаются при переходе в игровой режим: качает только фоновый демон.
- Transmission переехал в `~/.local/opt` — переживает обновления SteamOS.
