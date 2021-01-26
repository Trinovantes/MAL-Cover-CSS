#!/usr/bin/env sh

mysqldump -h ${HOST} -u ${USER} --all-databases --single-transaction > "./backups/$(date --utc +%FT%TZ).sql"
