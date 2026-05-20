#!/bin/sh
set -e

# Validate required environment variables
if [ -z "$JWT_SECRET" ]; then
  echo "ERROR: JWT_SECRET environment variable is not set" >&2
  exit 1
fi

# Fix /data directory permissions if needed
if [ -d /data ]; then
  chown -R cnsit:nodejs /data 2>/dev/null || true
  chmod -R 755 /data 2>/dev/null || true
fi

exec "$@"
