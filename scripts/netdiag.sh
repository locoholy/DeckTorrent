#!/bin/bash
# Диагностика проблемной Wi-Fi сети без участия оператора.
# Переключается на TP-LINK, всё измеряет в файл, возвращается на раздачу айфона.
# Запуск:  ~/Documents/DeckTorrent/scripts/netdiag.sh
# Результат: /home/deck/netdiag.txt

TARGET="TP-LINK_D2C6"
BACK="iPhone (Adam)"
OUT=/home/deck/netdiag.txt

exec > "$OUT" 2>&1
echo "=== Диагностика сети $TARGET — $(date '+%H:%M:%S %d.%m.%Y') ==="
echo

echo "--- переключаюсь на $TARGET"
nmcli con up "$TARGET" 2>&1 | tail -2
sleep 6

echo
echo "--- 1. Параметры, которые выдал роутер"
ip -4 addr show wlan0 | grep inet
GW=$(ip route | awk '/default/ {print $3; exit}')
echo "шлюз: ${GW:-НЕ ПОЛУЧЕН}"
echo "DNS в системе:"; grep nameserver /etc/resolv.conf
echo "качество линка:"; iw dev wlan0 link 2>/dev/null | grep -E "SSID|freq|signal|tx bitrate"

echo
echo "--- 2. Доходит ли до роутера (L3)"
if [ -n "$GW" ]; then
    ping -c 5 -W 2 "$GW" 2>&1 | tail -3
else
    echo "шлюза нет — DHCP не отработал"
fi

echo
echo "--- 3. Виден ли роутер на канальном уровне (ARP)"
[ -n "$GW" ] && timeout 8 arping -c 3 -I wlan0 "$GW" 2>&1 | tail -3

echo
echo "--- 4. Есть ли выход в интернет по голому IP"
for ip in 1.1.1.1 8.8.8.8 77.88.8.8; do
    printf "%-12s " "$ip"
    ping -c 3 -W 2 "$ip" >/dev/null 2>&1 && echo "ОТВЕЧАЕТ" || echo "молчит"
done

echo
echo "--- 5. Куда доходит трассировка до 1.1.1.1"
timeout 30 tracepath -4 -m 8 1.1.1.1 2>&1 | head -12

echo
echo "--- 6. Резолвятся ли имена"
for name in cloudflare.com google.com; do
    printf "%-16s " "$name"
    R=$( { time -p getent hosts "$name"; } 2>&1 )
    if echo "$R" | grep -qE "^[0-9]+\."; then
        echo "OK  $(echo "$R" | head -1 | awk '{print $1}')  ($(echo "$R" | awk '/^real/{print $2}') c)"
    else
        echo "НЕ РЕЗОЛВИТСЯ  ($(echo "$R" | awk '/^real/{print $2}') c)"
    fi
done

echo
echo "--- 7. Отвечают ли DNS-серверы напрямую (порт 53)"
for d in "$GW" 1.1.1.1 8.8.8.8; do
    [ -z "$d" ] && continue
    printf "%-12s " "$d"
    timeout 5 curl -s --max-time 4 "https://$d/" -o /dev/null 2>/dev/null
    ping -c 2 -W 2 "$d" >/dev/null 2>&1 && echo "пингуется" || echo "не пингуется"
done

echo
echo "--- 8. Проходит ли HTTP (и нет ли перехвата провайдером)"
echo -n "http://1.1.1.1  → "
timeout 12 curl -s -o /dev/null -w "код %{http_code}, %{time_total} c\n" --max-time 10 http://1.1.1.1/ 2>&1 || echo "нет ответа"
echo -n "captive-portal  → "
timeout 12 curl -s --max-time 10 -o /dev/null -w "код %{http_code}, редирект: %{redirect_url}\n" http://connectivitycheck.gstatic.com/generate_204 2>&1 || echo "нет ответа"

echo
echo "--- 9. Что думает NetworkManager"
nmcli networking connectivity check 2>/dev/null
nmcli -f GENERAL.STATE,IP4.ADDRESS,IP4.GATEWAY,IP4.DNS dev show wlan0 2>/dev/null | grep -E "STATE|ADDRESS|GATEWAY|DNS"

echo
echo "--- возвращаюсь на $BACK"
nmcli con up "$BACK" 2>&1 | tail -1
sleep 5
echo "сейчас активно: $(nmcli -t -f NAME con show --active | head -1)"
echo
echo "=== готово ==="
