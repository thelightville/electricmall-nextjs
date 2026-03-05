#!/bin/bash
# Electricmall Next.js — Full Deploy Script
# IMPORTANT: This script MUST do `docker compose build` (not just --force-recreate).
# The Dockerfile.prebuilt COPYs static files INTO the image at build time.
# If you skip the build step, the container serves OLD JS bundles to browsers,
# causing stale-cache issues where users run old code even after a code deploy.

set -e
cd "$(dirname "$0")"

echo "[deploy] Building Next.js..."
npm run build

echo "[deploy] Syncing build artifacts to CT117..."
rm -rf /tmp/em-deploy
mkdir -p /tmp/em-deploy/standalone /tmp/em-deploy/.next

cp -r .next/standalone/. /tmp/em-deploy/standalone/
cp -r .next/static       /tmp/em-deploy/.next/static
cp -r public             /tmp/em-deploy/public

rsync -az --no-perms --delete /tmp/em-deploy/standalone/ root@172.16.16.117:/opt/docker-sites/electricmall-nextjs/standalone/
rsync -az --no-perms --delete /tmp/em-deploy/.next/static/ root@172.16.16.117:/opt/docker-sites/electricmall-nextjs/.next/static/
rsync -az --no-perms --delete /tmp/em-deploy/public/ root@172.16.16.117:/opt/docker-sites/electricmall-nextjs/public/

echo "[deploy] Rebuilding Docker image and restarting container..."
# docker compose build is REQUIRED — static files are COPY'd into the image.
# --force-recreate alone does NOT update the JS bundles in the container.
ssh root@172.16.16.117 "cd /opt/docker-sites/electricmall-nextjs && docker compose build --no-cache && docker compose up -d"

echo "[deploy] Verifying..."
sleep 3
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://172.16.16.117:8040/)
echo "[deploy] HTTP status: $STATUS"
[ "$STATUS" = "200" ] && echo "[deploy] ✓ Deploy successful" || echo "[deploy] ✗ Deploy may have issues"
