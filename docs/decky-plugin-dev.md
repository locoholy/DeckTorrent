# Разработка плагинов Decky Loader — рабочая шпаргалка

Составлено 18.08.2026. Помечено, что проверено на этой машине, а что взято из
официальных источников.

---

## 1. Где что лежит

| Путь | Что это | Владелец |
|---|---|---|
| `~/homebrew/plugins/<Имя>/` | установленные плагины | **root** |
| `~/homebrew/logs/<Имя>/` | логи конкретного плагина | deck |
| `~/homebrew/data/<Имя>/` | данные плагина | deck |
| `~/homebrew/settings/<Имя>/` | настройки плагина | deck |
| `~/homebrew/services/PluginLoader` | бинарь загрузчика | root |
| `/etc/systemd/system/plugin_loader.service` | юнит загрузчика | root |

Проверено локально. Каталог `plugins/` принадлежит root — копировать туда только
через `sudo`, иначе загрузчик плагин не подхватит.

---

## 2. Анатомия плагина

Минимальный набор файлов (проверено на рабочих плагинах этой машины):

```
ИмяПлагина/
├── plugin.json      обязательно — манифест для загрузчика
├── package.json     обязательно — имя, версия, сборка
├── main.py          нужен, если есть Python-бэкенд
├── dist/index.js    обязательно — собранный фронтенд
├── LICENSE          обязательно для публикации в стор
└── README.md        желательно
```

Исходники (`src/index.tsx`, `rollup.config.js`, `tsconfig.json`, `node_modules/`)
в установленный плагин **не копируются** — только результат сборки.

### plugin.json

```json
{
  "name": "TransmissionMonitor",
  "author": "opencode",
  "flags": [],
  "api_version": 1,
  "publish": {
    "tags": ["Utility", "Downloads"],
    "description": "Короткое описание",
    "image": ""
  }
}
```

**Важно про версии — тут легко ошибиться.** В `plugin.json` пишется
`"api_version": 1`, а в собранном `dist/index.js` окажется `API_VERSION = 2`.
Это **не ошибка**: две разные шкалы. Первая — версия манифеста для загрузчика,
вторая — версия внутреннего моста фронтенд↔загрузчик из `@decky/api`.
Проверено сравнением с работающими `SDH-PlayTime` и `decky-steamgriddb` — у них
ровно та же пара значений.

---

## 3. Фронтенд: `@decky/api` и `@decky/ui`

Так выглядит рабочий импорт (взято из `plugin/src/index.tsx` этого проекта):

```tsx
import { addEventListener, callable, definePlugin,
         removeEventListener, toaster } from "@decky/api";
import { ButtonItem, Field, PanelSection, PanelSectionRow,
         ProgressBarWithInfo, staticClasses } from "@decky/ui";
import { useEffect, useRef, useState } from "react";
import { FaDownload } from "react-icons/fa";
```

### Вызов Python-бэкенда

`callable` типизирует вызов метода из `main.py`:

```tsx
const getSnapshot = callable<[], Snapshot>("get_snapshot");
const setTorrent  = callable<[torrent_id: number, action: string], { ok: boolean }>("set_torrent");
```

Слева — типы аргументов, справа — тип результата. Имя строкой должно совпадать с
именем метода класса `Plugin` в `main.py`.

### События из бэкенда

Бэкенд шлёт событие, фронтенд подписывается:

```python
# main.py
await decky.emit("transmission_done", torrent_name)
```

```tsx
// index.tsx
useEffect(() => {
  const h = (name: string) => toaster.toast({ title: "Готово", body: name });
  addEventListener("transmission_done", h);
  return () => removeEventListener("transmission_done", h);
}, []);
```

**Подводный камень:** если панель QAM закрыта, фронтенд не подключён, и событие
теряется. В логе это видно как
`[wsrouter][WARNING]: Dropping message as there is no connected socket`.
Не баг плагина — так устроено. Всё, что должно пережить закрытую панель, держи
в состоянии бэкенда и отдавай при следующем опросе.

### Компоненты интерфейса

Бери из `@decky/ui`, а не свою вёрстку: только нативные компоненты корректно
управляются стиками и D-pad. `PanelSection` / `PanelSectionRow` — каркас панели,
`ButtonItem` — кнопка, `Field` — строка с подписью, `ProgressBarWithInfo` —
прогресс. `staticClasses` даёт классы Steam для заголовков.

---

## 4. Бэкенд: `main.py`

Класс `Plugin`, методы которого становятся вызываемыми через `callable`:

```python
import decky

class Plugin:
    async def _main(self):          # старт
        decky.logger.info("запущен")

    async def _unload(self):        # остановка
        pass

    async def get_snapshot(self):   # виден фронтенду как "get_snapshot"
        return {"ok": True}
```

Логи метода `decky.logger` попадают и в `journalctl -u plugin_loader`, и в
`~/homebrew/logs/<Имя>/`.

---

## 5. Сборка и установка

Шаблон Decky официально рекомендует **pnpm 9** и Node.js 16.14+:

```bash
sudo npm i -g pnpm@9
pnpm i
pnpm run build          # → dist/index.js
```

В этом проекте исторически используется npm — работает так же:

```bash
cd ~/Documents/DeckTorrent/plugin
npm install
npm run build
npx tsc --noEmit        # строгая проверка типов, ошибки сборки не ловятся иначе
```

Установка на устройство (каталог принадлежит root):

```bash
sudo rm -rf ~/homebrew/plugins/TransmissionMonitor
sudo cp -r ~/Documents/DeckTorrent/plugin ~/homebrew/plugins/TransmissionMonitor
sudo systemctl restart plugin_loader
```

Копировать `node_modules/`, `src/`, `__pycache__/` не нужно.

---

## 6. Отладка

### Плагин виден только в игровом режиме

Меню Decky — это кнопка «⋯» игрового режима. **В Desktop Mode плагина нет и быть
не может.** Признак, что ты смотришь не там: `gamescope` не запущен
(`pgrep gamescope` пусто), а в логе загрузчика идёт
`Dropping message as there is no connected socket`.

### Логи

```bash
journalctl -u plugin_loader -f                 # живой поток загрузчика
journalctl -u plugin_loader | grep -i ИмяПлагина
ls ~/homebrew/logs/ИмяПлагина/                 # логи самого плагина
```

### Отладка фронтенда через CEF

Steam поднимает отладчик Chrome DevTools Protocol на **порту 8080**, если есть
файл-флаг (проверено, на этой машине включено):

```bash
ls ~/.steam/steam/.cef-enable-remote-debugging   # если нет — создать и перезапустить Steam
curl -s http://localhost:8080/json/list          # список вкладок
```

Плагины живут во вкладке **`SharedJSContext`**. Открыв
`http://localhost:8080` в браузере на ПК в одной сети (или локально), можно
подключить полноценные DevTools: консоль, ошибки JS, React-дерево.

Это же место — источник диагноза, когда «Decky тормозит»: если в логе
циклится `Failed to connect to tab with id …` и
`Request for Runtime.evaluate took more than 5s`, значит загрузчик долбится в
мёртвую вкладку. Помогает `sudo systemctl restart plugin_loader`.

### Порт самого Decky

Загрузчик слушает **1337** (проверено: `ss -tlnp | grep 1337`).

**Конфликты портов** — известная проблема: Syncthing по умолчанию занимает 8080,
из-за чего ломается отладка и часть функций Decky. Официальная рекомендация —
перевести Syncthing на 8384.

---

## 7. Установка и обновление самого Decky

Официальные способы (из README загрузчика):

```bash
# стабильная версия
curl -L https://github.com/SteamDeckHomebrew/decky-installer/releases/latest/download/install_release.sh | sh

# пререлиз (для разработки плагинов)
curl -L https://github.com/SteamDeckHomebrew/decky-installer/releases/latest/download/install_prerelease.sh | sh
```

Либо графически — скачать `decky_installer.desktop` из релизов и запустить.
Обновление = повторный запуск установщика с выбором версии.

Полезно знать: **Decky иногда исчезает после обновления SteamOS** — это штатное
поведение, лечится повторным запуском установщика.

---

## Источники

- [decky-loader](https://github.com/SteamDeckHomebrew/decky-loader) — README, установка и troubleshooting
- [decky-plugin-template](https://github.com/SteamDeckHomebrew/decky-plugin-template) — структура плагина, pnpm, сборка
- [decky-frontend-lib](https://github.com/SteamDeckHomebrew/decky-frontend-lib) — компоненты `@decky/ui`
- [Deckbrew Wiki](https://wiki.deckbrew.xyz/plugin-dev/getting-started) — официальная вики (отдаётся только через JS, статически не читается)

Всё, что помечено «проверено», снято с этой машины 18.08.2026.
