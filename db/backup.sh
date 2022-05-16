#!/usr/bin/env sh

echo 'Starting to backup database'
sqlite3 ./db/live/malcovercss.sqlite3 ".backup './db/backups/$(date --utc +%FT%TZ).sqlite3'"
echo 'Finished database backup'

echo 'Starting to validate backup'
find ./db/backups -name "*.sqlite3" -type f -print | sort | tail -n 1 | xargs -t -I '%' sqlite3 % 'PRAGMA integrity_check'
echo 'Finished database validation'

echo 'Starting to delete old backups'
# xargs -t: verbose
# xargs -r: no-run-if-empty
find -name "*.sqlite3" -type f -print | sort | head -n -30 | xargs -t -r rm
echo 'Finished deleting old backups'
