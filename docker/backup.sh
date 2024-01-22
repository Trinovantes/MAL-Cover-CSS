#!/usr/bin/env sh

set -e # Exit on error
set -u # Error when undefined variable

# SENTRY_CRONS="https://o504161.ingest.sentry.io/api/5590526/cron/malcovercss-backup/8b8ac206cace4704956e4ebeed1420a3/"

# curl "${SENTRY_CRONS}?status=in_progress"

echo "\nStarting to backup database"
sqlite3 ./db/live/malcovercss.sqlite3 ".backup './db/backups/$(date --utc +%FT%TZ).sqlite3'"

cd ./db/backups

echo "\nStarting to validate backup"
find -name "*.sqlite3" -type f -print | sed 's/\.\///' | sort | tail -n 1 | xargs -t -I '%' sqlite3 % 'PRAGMA integrity_check'

echo "\nStarting to upload backup"
find -name "*.sqlite3" -type f -print | sed 's/\.\///' | sort | tail -n 1 | xargs -t -I '%' aws --endpoint-url $AWS_ENDPOINT_URL s3 cp % s3://$S3_BUCKET_BACKUP/%

echo "\nStarting to delete old backups"
find -name "*.sqlite3" -type f -print | sort | head -n -30 | xargs -t -r rm

# curl "${SENTRY_CRONS}?status=ok"
