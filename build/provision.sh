#!/usr/bin/env sh

set -e

BASEDIR=$(dirname "$0")
export NGINX_HTTP="$(cat ${BASEDIR}/nginx/nginx.http.conf)"
export NGINX_HTTPS="$(cat ${BASEDIR}/nginx/nginx.https.conf)"
export NGINX_SSL="$(cat ${BASEDIR}/nginx/nginx.ssl.conf)"

ssh digital-ocean "\
    export NGINX_HTTP='${NGINX_HTTP}' && \
    export NGINX_HTTPS='${NGINX_HTTPS}' && \
    export NGINX_SSL='${NGINX_SSL}' && \
    sh" < "${BASEDIR}/provision.remote.sh"

scp build/secrets/*.txt digital-ocean:/var/secrets/malcovercss/
