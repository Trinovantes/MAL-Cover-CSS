#!/usr/bin/env sh

export DATABASE_URL="sqlite:./db/live/malcovercss.sqlite3"

dbmate wait

# sh ./db/migrate.sh (defaults migrate upwards)
# sh ./db/migrate.sh down (explicitly specify migrate down)
dbmate --schema-file ./db/schema.sql --migrations-dir ./db/migrations ${1:-'up'}

if [ $? -ne 0 ]; then
    echo 'Migration failed'
    exit
fi
