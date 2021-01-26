#!/usr/bin/env sh

find db/backups -name "*.sql" -type f -printf '%T+ %p\n' | sort  | head -n -5 | awk '{print $NF}' | xargs rm
