#!/usr/bin/env bash
set -euo pipefail

cleanup() {
  if [[ -n "${worker_pid:-}" ]]; then
    kill "$worker_pid" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

moldo-worker &
worker_pid=$!

uvicorn moldo_api.main:app --host 0.0.0.0 --port "${PORT:-8000}" &
api_pid=$!

wait -n "$worker_pid" "$api_pid"
exit_code=$?

cleanup
exit "$exit_code"
