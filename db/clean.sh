#!/usr/bin/env sh

echo 'Starting to clean up old backups'
find backups -name "*.sql" -type f -print | sort  | head -n -5 | xargs -t rm
echo 'Finished deleting old backups'
