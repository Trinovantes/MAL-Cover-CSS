#!/usr/bin/env sh

set -e # Exit on error
set -u # Error when undefined variable

SENTRY_CRONS="https://o504161.ingest.sentry.io/api/5590526/cron/malcovercss-cron/8b8ac206cace4704956e4ebeed1420a3/"

curl "${SENTRY_CRONS}?status=in_progress"

yarn startScraper
yarn startGenerator

curl "${SENTRY_CRONS}?status=ok"
