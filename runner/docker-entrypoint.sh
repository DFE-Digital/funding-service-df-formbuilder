#!/bin/sh
set -e

# Ensure destination dirs exist if we can create them. Running as a non-root
# user may not permit creating directories under /usr/local — tolerate that
# and continue. Do not let mkdir failure abort startup.
mkdir -p /usr/local/azure/certs /usr/local/share/ca-certificates 2>/dev/null || true

# Copy certs if present (no-op if none). Swallow errors to avoid failing startup.
cp /usr/local/azure/certs/*.crt /usr/local/share/ca-certificates/ 2>/dev/null || true

# Update system CAs only if we copied any
if ls /usr/local/share/ca-certificates/*.crt >/dev/null 2>&1; then
  update-ca-certificates || true
fi

# Exec pm2 runtime with the runner ecosystem config
exec npx pm2-runtime /usr/src/app/runner/ecosystem.config.js --env production
