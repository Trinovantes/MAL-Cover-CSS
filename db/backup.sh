#!/usr/bin/env sh

echo 'Starting to backup database'
sqlite3 ./db/live/malcovercss.sqlite3 ".backup './db/backups/$(date --utc +%FT%TZ).sqlite3'"
echo 'Finished database backup'

echo 'Starting to delete old backups'
find ./db/backups -name "*.sqlite3" -type f -print | sort | head -n -30 | xargs --verbose --no-run-if-empty rm
echo 'Finished deleting old backups'
