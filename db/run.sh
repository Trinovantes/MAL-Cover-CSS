#!/usr/bin/env sh

HOST=`cat /run/secrets/MYSQL_HOST`
DATABASE=`cat /run/secrets/MYSQL_DATABASE`
USER=`cat /run/secrets/MYSQL_USER`
PASSWORD=`cat /run/secrets/MYSQL_PASSWORD`

export DATABASE_URL="mysql://${USER}:${PASSWORD}@${HOST}/${DATABASE}"

dbmate --migrations-dir ./migrations up

read -n 1 -s -r -p "Press any key to continue"; echo
