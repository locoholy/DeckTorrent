/** Локализация: русский и английский. Язык берём из Steam (он же язык CEF),
 *  всё, что не русское, получает английский — так плагин годится и для Decky Store. */

type Dict = {
  units: string[];
  sec: string;
  min: string;
  hour: string;
  day: string;

  // Заголовок строки состояния
  errorPressA: string;
  checking: string;
  fetchingInfo: string;
  downloadedWord: string;
  paused: string;
  seeding: string;
  left: (eta: string) => string;
  estimating: string;

  // Цифры
  downloadedOf: (have: string, total: string) => string;
  toGo: (size: string) => string;
  totalDownloadedOf: (have: string, total: string, pct: string) => string;
  downloadingN: (n: number) => string;
  noDownloads: string;

  // Состояния Transmission
  statusQueuedCheck: string;
  statusQueued: string;
  statusQueuedSeed: string;
  statusDownloading: string;
  statusUnknown: string;

  // Действия
  pause: string;
  resume: string;
  verify: string;
  reannounce: string;
  removeKeep: string;
  removeWithData: string;
  more: string;
  close: string;
  pauseAll: string;
  startAll: string;
  refresh: string;
  retry: string;

  // Диалоги удаления
  removeWithDataTitle: string;
  removeKeepTitle: string;
  removeWithDataText: (name: string, size: string) => string;
  removeKeepText: (name: string) => string;
  cancel: string;

  // Экраны без списка
  noDaemonTitle: string;
  noDaemonText: string;
  rpcFailTitle: string;
  rpcFailText: string;
  emptyTitle: string;
  emptyText: string;
  doneToast: string;
};

const ru: Dict = {
  units: ["Б", "КБ", "МБ", "ГБ", "ТБ"],
  sec: "с",
  min: "мин",
  hour: "ч",
  day: "д",

  errorPressA: "Ошибка — нажмите A",
  checking: "Проверяю файлы…",
  fetchingInfo: "Получаю сведения о раздаче…",
  downloadedWord: "Скачано",
  paused: "На паузе",
  seeding: "Скачано, раздаю",
  left: (eta) => `Осталось ${eta}`,
  estimating: "Считаю время…",

  downloadedOf: (have, total) => `Скачано ${have} из ${total}`,
  toGo: (size) => `ещё ${size}`,
  totalDownloadedOf: (have, total, pct) => `Всего скачано ${have} из ${total} · ${pct}`,
  downloadingN: (n) => `качается: ${n}`,
  noDownloads: "загрузок нет",

  statusQueuedCheck: "Ожидает проверки",
  statusQueued: "В очереди",
  statusQueuedSeed: "В очереди на раздачу",
  statusDownloading: "Качается",
  statusUnknown: "—",

  pause: "Пауза",
  resume: "Продолжить",
  verify: "Проверить файлы",
  reannounce: "Найти ещё источники",
  removeKeep: "Убрать из списка",
  removeWithData: "Удалить с файлами",
  more: "Ещё",
  close: "Закрыть",
  pauseAll: "Пауза всех",
  startAll: "Запустить все",
  refresh: "Обновить",
  retry: "Повторить",

  removeWithDataTitle: "Удалить вместе с файлами?",
  removeKeepTitle: "Убрать из списка?",
  removeWithDataText: (name, size) =>
    `«${name}» и всё скачанное (${size}) будут стёрты с диска. Отменить нельзя.`,
  removeKeepText: (name) => `«${name}» исчезнет из списка, но скачанные файлы останутся на диске.`,
  cancel: "Отмена",

  noDaemonTitle: "Демон не запущен",
  noDaemonText:
    "Запустите «DeckTorrent (фон)» в десктопе. Если открыта оконная версия — закройте её, она отключает RPC.",
  rpcFailTitle: "Нет ответа от Transmission",
  rpcFailText: "Демон отвечает с ошибкой. Проверьте: systemctl --user status transmission-daemon",
  emptyTitle: "Загрузок нет",
  emptyText:
    "Откройте .torrent или magnet-ссылку в десктопе — закачка появится здесь и продолжится в игровом режиме.",
  doneToast: "Загрузка завершена",
};

const en: Dict = {
  units: ["B", "KB", "MB", "GB", "TB"],
  sec: "s",
  min: "min",
  hour: "h",
  day: "d",

  errorPressA: "Error — press A",
  checking: "Checking files…",
  fetchingInfo: "Fetching torrent info…",
  downloadedWord: "Downloaded",
  paused: "Paused",
  seeding: "Done, seeding",
  left: (eta) => `${eta} left`,
  estimating: "Estimating…",

  downloadedOf: (have, total) => `Downloaded ${have} of ${total}`,
  toGo: (size) => `${size} to go`,
  totalDownloadedOf: (have, total, pct) => `Downloaded ${have} of ${total} · ${pct}`,
  downloadingN: (n) => `downloading: ${n}`,
  noDownloads: "nothing downloading",

  statusQueuedCheck: "Queued for check",
  statusQueued: "Queued",
  statusQueuedSeed: "Queued to seed",
  statusDownloading: "Downloading",
  statusUnknown: "—",

  pause: "Pause",
  resume: "Resume",
  verify: "Verify files",
  reannounce: "Find more sources",
  removeKeep: "Remove from list",
  removeWithData: "Delete with files",
  more: "More",
  close: "Close",
  pauseAll: "Pause all",
  startAll: "Start all",
  refresh: "Refresh",
  retry: "Retry",

  removeWithDataTitle: "Delete with files?",
  removeKeepTitle: "Remove from list?",
  removeWithDataText: (name, size) =>
    `“${name}” and everything downloaded (${size}) will be erased from disk. This cannot be undone.`,
  removeKeepText: (name) => `“${name}” disappears from the list, but downloaded files stay on disk.`,
  cancel: "Cancel",

  noDaemonTitle: "Daemon is not running",
  noDaemonText:
    "Launch “DeckTorrent (background)” in desktop mode. Close the windowed Transmission if it is open — it turns RPC off.",
  rpcFailTitle: "Transmission is not responding",
  rpcFailText: "The daemon returns an error. Check: systemctl --user status transmission-daemon",
  emptyTitle: "No downloads",
  emptyText:
    "Open a .torrent file or a magnet link in desktop mode — it shows up here and keeps going in game mode.",
  doneToast: "Download finished",
};

function pickLanguage(): Dict {
  const lang = (navigator?.language || "en").toLowerCase();
  return lang.startsWith("ru") ? ru : en;
}

export const L: Dict = pickLanguage();
