const manifest = {"name":"TransmissionMonitor"};
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
function FaDownload (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"},"child":[]}]})(props);
}

const POLL_MS = 2000;
const getSnapshot = callable("get_snapshot");
const setTorrent = callable("set_torrent");
const setAll = callable("set_all");
function humanSize(bytes) {
    if (bytes <= 0)
        return "0 Б";
    const units = ["Б", "КБ", "МБ", "ГБ", "ТБ"];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
function humanSpeed(bytesPerSec) {
    return bytesPerSec > 0 ? `${humanSize(bytesPerSec)}/с` : "—";
}
function humanEta(seconds) {
    if (seconds < 0)
        return "—";
    if (seconds < 60)
        return `${seconds} с`;
    const m = Math.floor(seconds / 60);
    if (m < 60)
        return `${m} мин`;
    const h = Math.floor(m / 60);
    if (h < 24)
        return `${h} ч ${m % 60} мин`;
    return `${Math.floor(h / 24)} д ${h % 24} ч`;
}
// Коды состояний Transmission (см. RPC-спеку, поле status).
function statusLabel(t) {
    if (t.error)
        return "Ошибка";
    switch (t.status) {
        case 0: return "Остановлен";
        case 1: return "В очереди на проверку";
        case 2: return "Проверка";
        case 3: return "В очереди";
        case 4: return "Качается";
        case 5: return "В очереди на раздачу";
        case 6: return "Раздаётся";
        default: return "—";
    }
}
const isRunning = (t) => t.status !== 0;
function TorrentRow({ torrent, onToggle }) {
    const running = isRunning(torrent);
    const parts = [statusLabel(torrent)];
    if (torrent.downSpeed > 0)
        parts.push(`↓ ${humanSpeed(torrent.downSpeed)}`);
    if (torrent.upSpeed > 0)
        parts.push(`↑ ${humanSpeed(torrent.upSpeed)}`);
    if (torrent.status === 4 && torrent.eta >= 0)
        parts.push(humanEta(torrent.eta));
    if (torrent.peers > 0)
        parts.push(`${torrent.peersFrom}/${torrent.peers} пиров`);
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ProgressBarWithInfo, { label: torrent.name, description: torrent.error || parts.join(" · "), nProgress: torrent.percent, sOperationText: `${torrent.percent}%`, sTimeRemaining: humanSize(torrent.totalSize), bottomSeparator: "none" }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => onToggle(torrent), children: running ? "Пауза" : "Возобновить" }) })] }));
}
function Content() {
    const [snap, setSnap] = SP_REACT.useState(null);
    const busy = SP_REACT.useRef(false);
    const refresh = async () => {
        if (busy.current)
            return;
        busy.current = true;
        try {
            setSnap(await getSnapshot());
        }
        catch (e) {
            setSnap({ ok: false, error: "rpc_failed" });
        }
        finally {
            busy.current = false;
        }
    };
    SP_REACT.useEffect(() => {
        refresh();
        const id = window.setInterval(refresh, POLL_MS);
        return () => window.clearInterval(id);
    }, []);
    const toggle = async (t) => {
        await setTorrent(t.id, isRunning(t) ? "stop" : "start");
        refresh();
    };
    if (!snap) {
        return (SP_JSX.jsx(DFL.PanelSection, { title: "Transmission", spinner: true, children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.Field, { label: "\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0430\u044E\u0441\u044C\u2026", bottomSeparator: "none" }) }) }));
    }
    if (!snap.ok) {
        const noDaemon = snap.error === "no_daemon";
        return (SP_JSX.jsx(DFL.PanelSection, { title: "Transmission", children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.Field, { label: noDaemon ? "Демон не запущен" : "Нет ответа от Transmission", description: noDaemon
                        ? "Запустите ярлык «Transmission (фон)» в десктопе. Если открыта оконная версия — закройте её, она отключает RPC."
                        : "Демон отвечает с ошибкой. Проверьте: systemctl --user status transmission-daemon", bottomSeparator: "none" }) }) }));
    }
    const torrents = snap.torrents ?? [];
    if (torrents.length === 0) {
        return (SP_JSX.jsx(DFL.PanelSection, { title: "Transmission", children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.Field, { label: "\u0422\u043E\u0440\u0440\u0435\u043D\u0442\u043E\u0432 \u043D\u0435\u0442", description: "\u041F\u043E\u043B\u043E\u0436\u0438\u0442\u0435 .torrent \u0432 ~/Torrents \u2014 \u0434\u0435\u043C\u043E\u043D \u043F\u043E\u0434\u0445\u0432\u0430\u0442\u0438\u0442 \u0441\u0430\u043C.", bottomSeparator: "none" }) }) }));
    }
    const anyRunning = torrents.some(isRunning);
    return (SP_JSX.jsxs(DFL.PanelSection, { title: "Transmission", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.Field, { label: "\u0412\u0441\u0435\u0433\u043E", description: `↓ ${humanSpeed(snap.downTotal ?? 0)}   ↑ ${humanSpeed(snap.upTotal ?? 0)}`, bottomSeparator: "thick" }) }), torrents.map((t) => (SP_JSX.jsx(TorrentRow, { torrent: t, onToggle: toggle }, t.id))), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: async () => {
                        await setAll(anyRunning ? "stop" : "start");
                        refresh();
                    }, children: anyRunning ? "Остановить все" : "Запустить все" }) })] }));
}
var index = definePlugin(() => {
    const onDone = (name) => {
        toaster.toast({ title: "Загрузка завершена", body: name });
    };
    addEventListener("transmission_done", onDone);
    return {
        name: "Transmission Monitor",
        titleView: SP_JSX.jsx("div", { className: DFL.staticClasses.Title, children: "Transmission" }),
        content: SP_JSX.jsx(Content, {}),
        icon: SP_JSX.jsx(FaDownload, {}),
        onDismount() {
            removeEventListener("transmission_done", onDone);
        },
    };
});

export { index as default };
//# sourceMappingURL=index.js.map
