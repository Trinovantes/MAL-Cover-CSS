#!/usr/bin/env sh

HOST=`cat /run/secrets/MYSQL_HOST`
DATABASE=`cat /run/secrets/MYSQL_DATABASE`
USER=`cat /run/secrets/MYSQL_USER`
PASSWORD=`cat /run/secrets/MYSQL_PASSWORD`

export DATABASE_URL="mysql://${USER}:${PASSWORD}@${HOST}/${DATABASE}"

dbmate wait

sh backup.sh
if [ $? -ne 0 ]; then
    echo 'Backup failed'
    exit
fi

dbmate --schema-file ./schema.sql --migrations-dir ./migrations ${1:-'up'}
if [ $? -ne 0 ]; then
    echo 'Migration failed'
    exit
fi
