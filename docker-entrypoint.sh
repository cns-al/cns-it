#!/bin/sh
# Fix /data directory permissions if needed
if [ -d /data ]; then
  chown -R cnsit:nodejs /data 2>/dev/null || true
  chmod -R 755 /data 2>/dev/null || true
fi
exec "$@"
