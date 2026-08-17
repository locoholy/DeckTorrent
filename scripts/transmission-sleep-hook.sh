#!/bin/bash
# Опционально: пауза торрентов перед сном, resume после.
# Установка (один раз):
#   sudo cp ~/Documents/DeckTorrent/scripts/transmission-sleep-hook.sh /etc/systemd/system-sleep/transmission.sh
#   sudo chmod +x /etc/systemd/system-sleep/transmission.sh

RPC="http://localhost:9091/transmission/rpc"
SESSION_FILE="/tmp/transmission-session-id"

rpc() {
    local sid=""
    [ -f "$SESSION_FILE" ] && sid=$(cat "$SESSION_FILE")
    local resp
    resp=$(curl -s -w "\n%{http_code}" -X POST "$RPC" \
        -H "Content-Type: application/json" \
        -H "X-Transmission-Session-Id: $sid" \
        -d "$1" 2>/dev/null)
    local code=$(echo "$resp" | tail -1)
    if [ "$code" = "409" ]; then
        sid=$(curl -s -D - -X POST "$RPC" -d "" 2>/dev/null | grep -i "X-Transmission-Session-Id" | tr -d '\r' | awk '{print $2}')
        echo "$sid" > "$SESSION_FILE"
        curl -s -X POST "$RPC" \
            -H "Content-Type: application/json" \
            -H "X-Transmission-Session-Id: $sid" \
            -d "$1" > /dev/null 2>&1
    fi
}

case "$1" in
    pre)
        rpc '{"method":"torrent-stop","arguments":{"ids":"all"}}'
        logger "transmission-sleep: paused before suspend"
        ;;
    post)
        sleep 3
        rpc '{"method":"torrent-start","arguments":{"ids":"all"}}'
        logger "transmission-sleep: resumed after wake"
        ;;
esac
