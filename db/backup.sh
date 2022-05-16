#!/usr/bin/env sh

echo 'Starting to backup database'
sqlite3 ./db/live/malcovercss.sqlite3 ".backup './db/backups/$(date --utc +%FT%TZ).sqlite3'"
echo 'Finished database backup'

cd ./db/backups

echo
echo 'Starting to validate backup'
find -name "*.sqlite3" -type f -print | sed 's/\.\///' | sort | tail -n 1 | xargs -t -I '%' sqlite3 % 'PRAGMA integrity_check'
echo 'Finished backup validation'

echo
echo 'Starting to upload backup'
find -name "*.sqlite3" -type f -print | sed 's/\.\///' | sort | tail -n 1 | xargs -t -I '%' aws --endpoint-url $AWS_ENDPOINT_URL s3 cp % s3://malcovercss-backup/%
echo 'Finished backup upload'

echo
echo 'Starting to delete old backups'
# xargs -t: verbose
# xargs -r: no-run-if-empty
find -name "*.sqlite3" -type f -print | sort | head -n -30 | xargs -t -r rm
echo 'Finished deleting old backups'
