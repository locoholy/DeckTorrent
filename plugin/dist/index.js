const manifest = {"name":"DeckTorrent"};
const API_VERSION = 2;
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
const callable = api.callable;
const addEventListener = api.addEventListener;
const removeEventListener = api.removeEventListener;
const toaster = api.toaster;
const definePlugin = (fn) => {
    return (...args) => {
        return fn(...args);
    };
};

var DefaultContext = {
  color: undefined,
  size: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var IconContext = SP_REACT.createContext && /*#__PURE__*/SP_REACT.createContext(DefaultContext);

var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /*#__PURE__*/SP_REACT.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return props => /*#__PURE__*/SP_REACT.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = conf => {
    var attr = props.attr,
      size = props.size,
      title = props.title,
      svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /*#__PURE__*/SP_REACT.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className: className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /*#__PURE__*/SP_REACT.createElement("title", null, title), props.children);
  };
  return IconContext !== undefined ? /*#__PURE__*/SP_REACT.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
}

// THIS FILE IS AUTO GENERATED
function FaSyncAlt (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M370.72 133.28C339.458 104.008 298.888 87.962 255.848 88c-77.458.068-144.328 53.178-162.791 126.85-1.344 5.363-6.122 9.15-11.651 9.15H24.103c-7.498 0-13.194-6.807-11.807-14.176C33.933 94.924 134.813 8 256 8c66.448 0 126.791 26.136 171.315 68.685L463.03 40.97C478.149 25.851 504 36.559 504 57.941V192c0 13.255-10.745 24-24 24H345.941c-21.382 0-32.09-25.851-16.971-40.971l41.75-41.749zM32 296h134.059c21.382 0 32.09 25.851 16.971 40.971l-41.75 41.75c31.262 29.273 71.835 45.319 114.876 45.28 77.418-.07 144.315-53.144 162.787-126.849 1.344-5.363 6.122-9.15 11.651-9.15h57.304c7.498 0 13.194 6.807 11.807 14.176C478.067 417.076 377.187 504 256 504c-66.448 0-126.791-26.136-171.315-68.685L48.97 471.03C33.851 486.149 8 475.441 8 454.059V320c0-13.255 10.745-24 24-24z"},"child":[]}]})(props);
}function FaSeedling (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M64 96H0c0 123.7 100.3 224 224 224v144c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V320C288 196.3 187.7 96 64 96zm384-64c-84.2 0-157.4 46.5-195.7 115.2 27.7 30.2 48.2 66.9 59 107.6C424 243.1 512 147.9 512 32h-64z"},"child":[]}]})(props);
}function FaPlay (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"},"child":[]}]})(props);
}function FaPause (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"},"child":[]}]})(props);
}function FaPauseCircle (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm-16 328c0 8.8-7.2 16-16 16h-48c-8.8 0-16-7.2-16-16V176c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16v160zm112 0c0 8.8-7.2 16-16 16h-48c-8.8 0-16-7.2-16-16V176c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16v160z"},"child":[]}]})(props);
}function FaMagnet (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M164.07 148.1H12a12 12 0 0 1-12-12v-80a36 36 0 0 1 36-36h104a36 36 0 0 1 36 36v80a11.89 11.89 0 0 1-11.93 12zm347.93-12V56a36 36 0 0 0-36-36H372a36 36 0 0 0-36 36v80a12 12 0 0 0 12 12h152a11.89 11.89 0 0 0 12-11.9zm-164 44a12 12 0 0 0-12 12v52c0 128.1-160 127.9-160 0v-52a12 12 0 0 0-12-12H12.1a12 12 0 0 0-12 12.1c.1 21.4.6 40.3 0 53.3 0 150.6 136.17 246.6 256.75 246.6s255-96 255-246.7c-.6-12.8-.2-33 0-53.2a12 12 0 0 0-12-12.1z"},"child":[]}]})(props);
}function FaExclamationTriangle (props) {
  return GenIcon({"attr":{"viewBox":"0 0 576 512"},"child":[{"tag":"path","attr":{"d":"M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"},"child":[]}]})(props);
}function FaDownload (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"},"child":[]}]})(props);
}function FaCircleNotch (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M288 39.056v16.659c0 10.804 7.281 20.159 17.686 23.066C383.204 100.434 440 171.518 440 256c0 101.689-82.295 184-184 184-101.689 0-184-82.295-184-184 0-84.47 56.786-155.564 134.312-177.219C216.719 75.874 224 66.517 224 55.712V39.064c0-15.709-14.834-27.153-30.046-23.234C86.603 43.482 7.394 141.206 8.003 257.332c.72 137.052 111.477 246.956 248.531 246.667C393.255 503.711 504 392.788 504 256c0-115.633-79.14-212.779-186.211-240.236C302.678 11.889 288 23.456 288 39.056z"},"child":[]}]})(props);
}function FaCheckCircle (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"},"child":[]}]})(props);
}

/** Локализация: русский и английский. Язык берём из Steam (он же язык CEF),
 *  всё, что не русское, получает английский — так плагин годится и для Decky Store. */
const ru = {
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
    removeWithDataText: (name, size) => `«${name}» и всё скачанное (${size}) будут стёрты с диска. Отменить нельзя.`,
    removeKeepText: (name) => `«${name}» исчезнет из списка, но скачанные файлы останутся на диске.`,
    cancel: "Отмена",
    noDaemonTitle: "Демон не запущен",
    noDaemonText: "Запустите «DeckTorrent (фон)» в десктопе. Если открыта оконная версия — закройте её, она отключает RPC.",
    rpcFailTitle: "Нет ответа от Transmission",
    rpcFailText: "Демон отвечает с ошибкой. Проверьте: systemctl --user status transmission-daemon",
    emptyTitle: "Загрузок нет",
    emptyText: "Откройте .torrent или magnet-ссылку в десктопе — закачка появится здесь и продолжится в игровом режиме.",
    doneToast: "Загрузка завершена",
};
const en = {
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
    removeWithDataText: (name, size) => `“${name}” and everything downloaded (${size}) will be erased from disk. This cannot be undone.`,
    removeKeepText: (name) => `“${name}” disappears from the list, but downloaded files stay on disk.`,
    cancel: "Cancel",
    noDaemonTitle: "Daemon is not running",
    noDaemonText: "Launch “DeckTorrent (background)” in desktop mode. Close the windowed Transmission if it is open — it turns RPC off.",
    rpcFailTitle: "Transmission is not responding",
    rpcFailText: "The daemon returns an error. Check: systemctl --user status transmission-daemon",
    emptyTitle: "No downloads",
    emptyText: "Open a .torrent file or a magnet link in desktop mode — it shows up here and keeps going in game mode.",
    doneToast: "Download finished",
};
function pickLanguage() {
    const lang = (navigator?.language || "en").toLowerCase();
    return lang.startsWith("ru") ? ru : en;
}
const L = pickLanguage();

const UNITS = L.units;
const unitOf = (bytes) => bytes <= 0 ? 0 : Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
function humanSize(bytes) {
    if (bytes <= 0)
        return `0 ${UNITS[0]}`;
    const i = unitOf(bytes);
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(i === 0 ? 0 : value >= 100 ? 0 : 1)} ${UNITS[i]}`;
}
function humanSpeed(bytesPerSec) {
    return bytesPerSec > 0 ? `${humanSize(bytesPerSec)}/${L.sec}` : `0 ${UNITS[1]}/${L.sec}`;
}
function humanEta(seconds) {
    if (seconds < 0)
        return "";
    if (seconds < 60)
        return `${seconds} ${L.sec}`;
    const m = Math.floor(seconds / 60);
    if (m < 60)
        return `${m} ${L.min}`;
    const h = Math.floor(m / 60);
    if (h < 24)
        return `${h} ${L.hour} ${m % 60} ${L.min}`;
    return `${Math.floor(h / 24)} ${L.day} ${h % 24} ${L.hour}`;
}
function fmtPercent(p) {
    if (p >= 100)
        return "100%";
    if (p <= 0)
        return "0%";
    return `${p.toFixed(1)}%`;
}
/* ─── Состояния Transmission (поле status из RPC-спеки) ─────────────────── */
const COLORS = {
    down: "#1a9fff",
    seed: "#5ba32b",
    check: "#e5a50a",
    idle: "#7a8894",
    error: "#e0503f",
    text: "#ffffff",
    dim: "rgba(255,255,255,0.58)",
    track: "rgba(255,255,255,0.13)",
    card: "rgba(0,0,0,0.28)",
    cardFocus: "rgba(255,255,255,0.14)",
};
const isRunning = (t) => t.status !== 0;
const isMagnet = (t) => t.metaPercent < 100;
function accentFor(t) {
    if (t.error)
        return COLORS.error;
    switch (t.status) {
        case 2: return COLORS.check;
        case 4: return isMagnet(t) ? COLORS.check : COLORS.down;
        case 6: return COLORS.seed;
        default: return COLORS.idle;
    }
}
function statusLabel(t) {
    switch (t.status) {
        case 1: return L.statusQueuedCheck;
        case 3: return L.statusQueued;
        case 4: return L.statusDownloading;
        case 5: return L.statusQueuedSeed;
        default: return L.statusUnknown;
    }
}
/** Полоса показывает то, что реально идёт прямо сейчас: хеш-проверку,
 *  сбор метаданных магнета или долю скачанного. */
function barPercent(t) {
    if (t.status === 2)
        return t.checkPercent;
    if (isMagnet(t))
        return t.metaPercent;
    return t.percent;
}

const getSnapshot = callable("get_snapshot");
const setTorrent = callable("set_torrent");
const setAll = callable("set_all");
const removeTorrent = callable("remove_torrent");
const POLL_MS = 2000;
const HISTORY_LEN = 40; // 40 точек × 2 с ≈ полторы минуты графика
/** Один опрос на всю панель: и заголовок, и список читают из общего снимка.
 *  Раньше каждый компонент дёргал RPC сам — это лишний трафик и рассинхрон цифр. */
class Store {
    constructor() {
        this.snap = null;
        this.downHistory = [];
        this.upHistory = [];
        this.listeners = new Set();
        this.inflight = false;
    }
    subscribe(fn) {
        this.listeners.add(fn);
        if (this.listeners.size === 1) {
            this.refresh();
            this.timer = window.setInterval(() => this.refresh(), POLL_MS);
        }
        return () => {
            this.listeners.delete(fn);
            if (this.listeners.size === 0 && this.timer !== undefined) {
                window.clearInterval(this.timer);
                this.timer = undefined;
            }
        };
    }
    async refresh() {
        if (this.inflight)
            return;
        this.inflight = true;
        try {
            const snap = await getSnapshot();
            this.snap = snap;
            if (snap.ok) {
                this.push(this.downHistory, snap.downTotal ?? 0);
                this.push(this.upHistory, snap.upTotal ?? 0);
            }
        }
        catch {
            this.snap = { ok: false, error: "rpc_failed" };
        }
        finally {
            this.inflight = false;
            this.listeners.forEach((fn) => fn());
        }
    }
    push(arr, value) {
        arr.push(value);
        if (arr.length > HISTORY_LEN)
            arr.splice(0, arr.length - HISTORY_LEN);
    }
}
const store = new Store();

/** Ключевые кадры живут в одном месте: инлайн-стили их не умеют,
 *  а тащить css-плагин в сборку ради трёх анимаций — перебор. */
const Keyframes = () => (SP_JSX.jsx("style", { children: `
@keyframes dtSweep { 0% { transform: translateX(-140%); } 100% { transform: translateX(140%); } }
@keyframes dtPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
@keyframes dtSpin  { 100% { transform: rotate(360deg); } }
@keyframes dtFade  { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: none; } }
` }));
/* ─── Полоса прогресса ───────────────────────────────────────────────────── */
function ProgressLine({ percent, color, height = 10, live = false, }) {
    const width = Math.max(0, Math.min(100, percent));
    return (SP_JSX.jsx("div", { style: {
            position: "relative",
            height,
            borderRadius: height / 2,
            background: COLORS.track,
            overflow: "hidden",
            flex: 1,
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
        }, children: SP_JSX.jsx("div", { style: {
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: `${width}%`,
                borderRadius: height / 2,
                background: `linear-gradient(90deg, ${color}cc 0%, ${color} 100%)`,
                transition: "width 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                overflow: "hidden",
            }, children: live && width > 2 && (SP_JSX.jsx("div", { style: {
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
                    animation: "dtSweep 1.8s linear infinite",
                } })) }) }));
}
/* ─── Общее ──────────────────────────────────────────────────────────────── */
function cardStyle(accent) {
    return {
        display: "flex",
        flexDirection: "column",
        gap: "9px",
        padding: "12px",
        marginBottom: "8px",
        borderRadius: "5px",
        borderLeft: accent ? `3px solid ${accent}` : undefined,
        background: COLORS.card,
        animation: "dtFade 0.2s ease-out",
    };
}
function Card({ children, accent }) {
    return SP_JSX.jsx("div", { style: cardStyle(accent), children: children });
}
function StatusIcon({ torrent, color }) {
    const common = { size: 13, color, style: { flexShrink: 0 } };
    if (torrent.error)
        return SP_JSX.jsx(FaExclamationTriangle, { ...common });
    if (torrent.status === 2)
        return SP_JSX.jsx(FaCircleNotch, { ...common, style: { ...common.style, animation: "dtSpin 1.1s linear infinite" } });
    if (torrent.status === 4 && isMagnet(torrent))
        return SP_JSX.jsx(FaMagnet, { ...common });
    if (torrent.status === 6)
        return SP_JSX.jsx(FaSeedling, { ...common });
    if (torrent.status === 0)
        return torrent.percent >= 100 ? SP_JSX.jsx(FaCheckCircle, { ...common }) : SP_JSX.jsx(FaPauseCircle, { ...common });
    return null;
}
/* ─── Карточка торрента ──────────────────────────────────────────────────── */
function confirmRemove(torrent, withData, after) {
    DFL.showModal(SP_JSX.jsx(DFL.ConfirmModal, { bDestructiveWarning: withData, strTitle: withData ? L.removeWithDataTitle : L.removeKeepTitle, strDescription: withData
            ? L.removeWithDataText(torrent.name, humanSize(torrent.haveSize))
            : L.removeKeepText(torrent.name), strOKButtonText: withData ? L.removeWithData : L.removeKeep, strCancelButtonText: L.cancel, onOK: async () => {
            await removeTorrent(torrent.id, withData);
            after();
        } }));
}
/** Главная строка под полосой отвечает на единственный вопрос «когда будет готово».
 *  Пиры, рейтинг и коды состояний сюда не лезут — они в меню действий. */
function headline(t) {
    if (t.error)
        return { text: L.errorPressA, color: COLORS.error };
    if (t.status === 2)
        return { text: L.checking, color: COLORS.check };
    if (isMagnet(t))
        return { text: L.fetchingInfo, color: COLORS.check };
    if (t.status === 0)
        return t.percent >= 100
            ? { text: L.downloadedWord, color: COLORS.seed }
            : { text: L.paused, color: COLORS.idle };
    if (t.status === 6 || t.finished)
        return { text: L.seeding, color: COLORS.seed };
    if (t.status === 4) {
        const eta = humanEta(t.eta);
        return eta ? { text: L.left(eta), color: COLORS.text } : { text: L.estimating, color: COLORS.dim };
    }
    return { text: statusLabel(t), color: COLORS.dim };
}
function TorrentCard({ torrent }) {
    const [focused, setFocused] = SP_REACT.useState(false);
    const ref = SP_REACT.useRef(null);
    const accent = accentFor(torrent);
    const running = isRunning(torrent);
    const pct = barPercent(torrent);
    const head = headline(torrent);
    const left = Math.max(torrent.wantedSize - torrent.haveSize, 0);
    const refresh = () => store.refresh();
    const act = async (action) => {
        await setTorrent(torrent.id, action);
        refresh();
    };
    const openMenu = () => {
        DFL.showContextMenu(SP_JSX.jsxs(DFL.Menu, { label: torrent.name, cancelText: L.close, children: [SP_JSX.jsx(DFL.MenuItem, { onSelected: () => act(running ? "stop" : "start"), children: running ? L.pause : L.resume }), SP_JSX.jsx(DFL.MenuItem, { onSelected: () => act("verify"), children: L.verify }), SP_JSX.jsx(DFL.MenuItem, { onSelected: () => act("reannounce"), children: L.reannounce }), SP_JSX.jsx(DFL.MenuSeparator, {}), SP_JSX.jsx(DFL.MenuItem, { onSelected: () => confirmRemove(torrent, false, refresh), children: L.removeKeep }), SP_JSX.jsx(DFL.MenuItem, { tone: "destructive", onSelected: () => confirmRemove(torrent, true, refresh), children: L.removeWithData })] }), ref.current ?? undefined);
    };
    return (SP_JSX.jsxs(DFL.Focusable, { ref: ref, onActivate: () => act(running ? "stop" : "start"), onSecondaryButton: openMenu, onGamepadFocus: () => setFocused(true), onGamepadBlur: () => setFocused(false), onOKActionDescription: running ? L.pause : L.resume, onSecondaryActionDescription: L.more, style: {
            ...cardStyle(accent),
            background: focused ? COLORS.cardFocus : COLORS.card,
            boxShadow: focused ? `0 0 0 1px ${accent}88, 0 2px 10px rgba(0,0,0,0.35)` : "none",
            transition: "background 0.15s ease-out, box-shadow 0.15s ease-out",
        }, children: [SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [SP_JSX.jsx(StatusIcon, { torrent: torrent, color: accent }), SP_JSX.jsx("div", { style: {
                            flex: 1,
                            minWidth: 0,
                            fontSize: "12px",
                            lineHeight: "15px",
                            color: COLORS.dim,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }, children: torrent.name })] }), SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "12px" }, children: [SP_JSX.jsx("span", { style: {
                            fontSize: "30px",
                            fontWeight: 800,
                            lineHeight: "32px",
                            color: accent,
                            fontVariantNumeric: "tabular-nums",
                            letterSpacing: "-0.02em",
                        }, children: fmtPercent(pct) }), SP_JSX.jsxs("div", { style: { flex: 1, display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }, children: [SP_JSX.jsx(ProgressLine, { percent: pct, color: accent, live: torrent.status === 4 || torrent.status === 2 }), SP_JSX.jsx("span", { style: {
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: head.color,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }, children: head.text })] })] }), !isMagnet(torrent) && (SP_JSX.jsxs("div", { style: {
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "8px",
                    fontSize: "12px",
                    lineHeight: "15px",
                    color: COLORS.dim,
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                }, children: [SP_JSX.jsx("span", { children: L.downloadedOf(humanSize(torrent.haveSize), humanSize(torrent.wantedSize)) }), torrent.status === 4 && left > 0 && SP_JSX.jsx("span", { children: L.toGo(humanSize(left)) }), torrent.downSpeed > 0 && torrent.status !== 4 && SP_JSX.jsx("span", { children: humanSpeed(torrent.downSpeed) })] })), torrent.error && (SP_JSX.jsx("div", { style: { fontSize: "11px", lineHeight: "14px", color: COLORS.error }, children: torrent.error }))] }));
}
/* ─── Шапка: одна строка про скорость и общий итог ───────────────────────── */
function SummaryHeader({ snap }) {
    const want = snap.wantTotal ?? 0;
    const have = snap.haveTotal ?? 0;
    const pct = want > 0 ? (have / want) * 100 : 0;
    const down = snap.downTotal ?? 0;
    const active = snap.activeCount ?? 0;
    return (SP_JSX.jsxs(Card, { children: [SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }, children: [SP_JSX.jsxs("span", { style: {
                            fontSize: "22px",
                            fontWeight: 800,
                            color: down > 0 ? COLORS.down : COLORS.dim,
                            fontVariantNumeric: "tabular-nums",
                            lineHeight: "26px",
                        }, children: ["\u2193 ", humanSpeed(down)] }), SP_JSX.jsx("span", { style: { fontSize: "12px", color: COLORS.dim, whiteSpace: "nowrap" }, children: active > 0 ? L.downloadingN(active) : L.noDownloads })] }), SP_JSX.jsx(ProgressLine, { percent: pct, color: COLORS.down, height: 6, live: down > 0 }), SP_JSX.jsx("div", { style: { fontSize: "12px", color: COLORS.dim, fontVariantNumeric: "tabular-nums" }, children: L.totalDownloadedOf(humanSize(have), humanSize(want), fmtPercent(pct)) })] }));
}

/** Все компоненты панели читают один и тот же снимок из общего стора. */
function useSnapshot() {
    const [, force] = SP_REACT.useState(0);
    SP_REACT.useEffect(() => store.subscribe(() => force((n) => n + 1)), []);
    return store.snap;
}
function Skeleton() {
    return (SP_JSX.jsx(Card, { children: [70, 100, 45].map((w, i) => (SP_JSX.jsx("div", { style: {
                height: i === 0 ? "14px" : "8px",
                width: `${w}%`,
                borderRadius: "4px",
                background: COLORS.track,
                animation: "dtPulse 1.4s ease-in-out infinite",
            } }, i))) }));
}
function Notice({ title, text }) {
    return (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.Field, { label: title, description: text, bottomSeparator: "none" }) }));
}
function Content() {
    const snap = useSnapshot();
    if (!snap) {
        return (SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsx(Keyframes, {}), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(Skeleton, {}) })] }));
    }
    if (!snap.ok) {
        const noDaemon = snap.error === "no_daemon";
        return (SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsx(Keyframes, {}), SP_JSX.jsx(Notice, { title: noDaemon ? L.noDaemonTitle : L.rpcFailTitle, text: noDaemon ? L.noDaemonText : L.rpcFailText }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DialogButton, { onClick: () => store.refresh(), children: L.retry }) })] }));
    }
    const torrents = snap.torrents ?? [];
    if (torrents.length === 0) {
        return (SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsx(Keyframes, {}), SP_JSX.jsx(Notice, { title: L.emptyTitle, text: L.emptyText })] }));
    }
    const anyRunning = torrents.some(isRunning);
    return (SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsx(Keyframes, {}), torrents.length > 1 && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(SummaryHeader, { snap: snap }) })), torrents.map((t) => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(TorrentCard, { torrent: t }) }, t.id))), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.Focusable, { style: { display: "flex", gap: "8px", marginTop: "2px" }, children: [SP_JSX.jsx(DFL.DialogButton, { style: { flex: 1, minWidth: 0, padding: "9px", fontSize: "13px" }, onClick: async () => {
                                await setAll(anyRunning ? "stop" : "start");
                                store.refresh();
                            }, children: SP_JSX.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: "7px" }, children: [anyRunning ? SP_JSX.jsx(FaPause, { size: 12 }) : SP_JSX.jsx(FaPlay, { size: 12 }), anyRunning ? L.pauseAll : L.startAll] }) }), SP_JSX.jsx(DFL.DialogButton, { style: { flex: 1, minWidth: 0, padding: "9px", fontSize: "13px" }, onClick: () => store.refresh(), children: SP_JSX.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: "7px" }, children: [SP_JSX.jsx(FaSyncAlt, { size: 12 }), L.refresh] }) })] }) })] }));
}
/** Скорость прямо в шапке панели — видно, не разворачивая список. */
function TitleView() {
    const snap = useSnapshot();
    const down = snap?.ok ? snap.downTotal ?? 0 : 0;
    return (SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }, children: [SP_JSX.jsx("div", { className: DFL.staticClasses.Title, children: "DeckTorrent" }), down > 0 && (SP_JSX.jsxs("div", { style: {
                    fontSize: "12px",
                    fontWeight: 600,
                    color: COLORS.down,
                    fontVariantNumeric: "tabular-nums",
                    paddingRight: "4px",
                }, children: ["\u2193 ", humanSpeed(down)] }))] }));
}
var index = definePlugin(() => {
    const onDone = (name) => {
        toaster.toast({ title: L.doneToast, body: name });
    };
    addEventListener("transmission_done", onDone);
    return {
        name: "DeckTorrent",
        titleView: SP_JSX.jsx(TitleView, {}),
        content: SP_JSX.jsx(Content, {}),
        icon: SP_JSX.jsx(FaDownload, {}),
        onDismount() {
            removeEventListener("transmission_done", onDone);
        },
    };
});

export { index as default };
//# sourceMappingURL=index.js.map
