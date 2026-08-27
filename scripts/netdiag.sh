#!/bin/bash
# Снимок состояния текущей Wi-Fi сети. Сеть НЕ переключает — что подключено, то и меряет.
#
# Как пользоваться:
#   1. когда сеть работает   → ./netdiag.sh   (эталон)
#   2. когда сеть сломалась  → ./netdiag.sh   (сравнить с эталоном)
#
# Каждый запуск дописывает отчёт в /home/deck/netdiag.txt

OUT=/home/deck/netdiag.txt
exec >> "$OUT" 2>&1

echo
echo "════════════════════════════════════════════════════════"
echo "СНИМОК $(date '+%d.%m.%Y %H:%M:%S')"
echo "════════════════════════════════════════════════════════"

CON=$(nmcli -t -f NAME,TYPE con show --active 2>/dev/null | awk -F: '$2=="802-11-wireless"{print $1; exit}')
echo "сеть: ${CON:-НЕТ ПОДКЛЮЧЕНИЯ}"

echo
echo "--- 1. К какой именно точке подключены"
# Если точек с одним SSID несколько, важно знать, на какой сидим
iw dev wlan0 link 2>/dev/null | grep -E "Connected to|SSID|freq|signal|tx bitrate"
echo "видимые точки с этим SSID:"
nmcli -f SSID,BSSID,CHAN,SIGNAL dev wifi list --rescan no 2>/dev/null | grep -F "${CON:-@@@}" | head -5

echo
echo "--- 2. Что выдал DHCP"
ip -4 addr show wlan0 2>/dev/null | grep inet
GW=$(ip route 2>/dev/null | awk '/default/ {print $3; exit}')
echo "шлюз: ${GW:-НЕ ПОЛУЧЕН}"
echo "DNS: $(grep -h nameserver /etc/resolv.conf 2>/dev/null | awk '{print $2}' | tr '\n' ' ')"
echo "маршруты:"; ip route 2>/dev/null | head -4
echo "ЗАМЕТКА: шлюз 192.168.0.1 = роутер отвалился от вышестоящей сети и работает сам на себя"

echo
echo "--- 3. Роутер отвечает?"
if [ -n "$GW" ]; then
    ping -c 4 -W 2 "$GW" 2>&1 | tail -2
    echo "ARP:"; ip neigh show "$GW" 2>/dev/null
else
    echo "шлюза нет"
fi

echo
echo "--- 4. Что это за железка (страница управления)"
if [ -n "$GW" ]; then
    for proto in http https; do
        R=$(timeout 8 curl -sk -o /tmp/rt.html -w "%{http_code}" --max-time 6 "$proto://$GW/" 2>/dev/null)
        if [ "$R" != "000" ] && [ -n "$R" ]; then
            echo "$proto://$GW → код $R"
            grep -oiE "<title>[^<]*</title>" /tmp/rt.html 2>/dev/null | head -1
            grep -oiE "(TL-[A-Z0-9-]+|Archer [A-Z0-9-]+|TP-LINK|firmware[^<\"]{0,30})" /tmp/rt.html 2>/dev/null | sort -u | head -5
            break
        fi
    done
    rm -f /tmp/rt.html
fi

echo
echo "--- 5. Выход наружу по голому IP (без DNS)"
for ip in 1.1.1.1 8.8.8.8 77.88.8.8; do
    printf "  %-12s " "$ip"
    R=$(ping -c 3 -W 2 "$ip" 2>/dev/null | tail -2 | head -1)
    [ -n "$R" ] && echo "$R" || echo "молчит"
done

echo
echo "--- 6. Где обрывается путь"
echo "(если дальше шлюза не идёт — у роутера нет связи с провайдером)"
timeout 35 tracepath -4 -m 8 1.1.1.1 2>&1 | head -10

echo
echo "--- 7. Имена резолвятся?"
for n in cloudflare.com google.com; do
    printf "  %-16s " "$n"
    S=$(date +%s%N)
    if getent hosts "$n" >/dev/null 2>&1; then
        echo "OK за $(( ($(date +%s%N)-S)/1000000 )) мс"
    else
        echo "НЕ РЕЗОЛВИТСЯ ($(( ($(date +%s%N)-S)/1000000 )) мс)"
    fi
done

echo
echo "--- 8. HTTP и проверка на портал-заглушку"
printf "  http://1.1.1.1     → "
timeout 12 curl -s -o /dev/null -w "код %{http_code} за %{time_total} c\n" --max-time 10 http://1.1.1.1/ 2>/dev/null || echo "нет ответа"
printf "  generate_204       → "
timeout 12 curl -s -o /dev/null -w "код %{http_code}, редирект: '%{redirect_url}'\n" --max-time 10 http://connectivitycheck.gstatic.com/generate_204 2>/dev/null || echo "нет ответа"
echo "  (код 204 = чисто; 200/302 с редиректом = сеть держит заглушку)"

echo
echo "--- 9. Вердикт NetworkManager"
nmcli networking connectivity check 2>/dev/null

echo
echo "--- 10. Что писали логи за последние 10 минут"
journalctl -u NetworkManager --no-pager --since "-10 min" 2>/dev/null | grep -iE "reason '|dhcp4.*(lease|fail|no lease)|failed" | grep -vi inotify | tail -8 | cut -c1-130
journalctl -k --no-pager --since "-10 min" 2>/dev/null | grep -iE "wlan0|ath11k" | tail -6 | cut -c1-130

echo
echo "=== конец снимка ==="
