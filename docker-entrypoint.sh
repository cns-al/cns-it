#!/bin/sh
set -e

# Validate required environment variables
if [ -z "$JWT_SECRET" ]; then
  echo "ERROR: JWT_SECRET environment variable is not set" >&2
  exit 1
fi

# Ensure /data directory exists (volume mount may override ownership)
mkdir -p /data
chmod 755 /data

# Start the application
exec node server/src/app.js
