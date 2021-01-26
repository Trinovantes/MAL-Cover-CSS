#!/usr/bin/env sh

HOST=`cat /run/secrets/MYSQL_HOST`
DATABASE=`cat /run/secrets/MYSQL_DATABASE`
USER=`cat /run/secrets/MYSQL_USER`
PASSWORD=`cat /run/secrets/MYSQL_PASSWORD`

export DATABASE_URL="mysql://${USER}:${PASSWORD}@${HOST}/${DATABASE}"

dbmate wait

dbmate --migrations-dir ./migrations ${1:-'up'} || true
if [[ $? -ne 0 ]]; then
    echo "Migration failed"
fi

read -n 1 -s -r -p "Press any key to continue"; echo
