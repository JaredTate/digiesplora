#!/bin/bash
# Deploy the explorer front end on Box 2 (digiexplorer.info). Run as `digi`:
#   /home/digi/digiesplora/scripts/deploy-box2.sh
# pull -> npm ci (only if a lockfile changed) -> smoke test -> static build into
# /var/www/digiexplorer/releases/<sha> -> flip the `current` symlink nginx serves.
# Rollback: ln -sfn releases/<old-sha> /var/www/digiexplorer/current
set -euo pipefail
cd /home/digi/digiesplora
WWW=/var/www/digiexplorer

PREV=$(git rev-parse HEAD)
git pull --ff-only origin master
SHA=$(git rev-parse --short HEAD)

if ! git diff --quiet "$PREV" HEAD -- npm-shrinkwrap.json client/npm-shrinkwrap.json; then
  npm ci
fi

npm run test:smoke
DEST=$WWW/releases/$SHA npm run dist
ln -sfn "releases/$SHA" "$WWW/current.tmp" && mv -T "$WWW/current.tmp" "$WWW/current"

# Keep the 3 newest releases.
ls -1dt "$WWW"/releases/*/ | tail -n +4 | xargs -r rm -rf

curl -fsS -o /dev/null --max-time 15 https://digiexplorer.info/app.js
echo "DEPLOYED $SHA"
