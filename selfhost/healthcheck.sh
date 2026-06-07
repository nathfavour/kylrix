#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# Kylrix — Health Check Script
# Returns exit 0 if the Next.js app is responding, exit 1 otherwise
# Usage: ./selfhost/healthcheck.sh [host] [port]
# ─────────────────────────────────────────────────────────────────────────────

set -e

HOST="${1:-127.0.0.1}"
PORT="${2:-3000}"
TIMEOUT=5

# Try wget first (available on Alpine), fall back to curl, then Node
if command -v wget > /dev/null 2>&1; then
    wget -q --spider --timeout="${TIMEOUT}" "http://${HOST}:${PORT}/api/health" 2>/dev/null
    exit $?
elif command -v curl > /dev/null 2>&1; then
    curl -sf --max-time "${TIMEOUT}" "http://${HOST}:${PORT}/api/health" > /dev/null 2>&1
    exit $?
else
    # Fallback: use Node.js (always available in our container)
    node -e "
        const http = require('http');
        const req = http.request(
            { hostname: '${HOST}', port: ${PORT}, path: '/api/health', timeout: ${TIMEOUT}000 },
            res => process.exit(res.statusCode === 200 ? 0 : 1)
        );
        req.on('error', () => process.exit(1));
        req.end();
    "
    exit $?
fi
