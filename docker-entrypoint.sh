#!/bin/sh
set -e

# Validate required environment variables
if [ -z "$JWT_SECRET" ]; then
  echo "ERROR: JWT_SECRET environment variable is not set" >&2
  exit 1
fi

# Fix /data directory permissions (volume mount overrides image's /data, may be owned by root)
mkdir -p /data
chown -R cnsit:nodejs /data

# Drop to non-root user and exec the app
exec su -s /bin/sh cnsit -c "cd /app && exec node server/src/app.js"
