FROM alpine:3.10 as base

RUN apk add mysql-client

ADD https://github.com/amacneil/dbmate/releases/download/v1.11.0/dbmate-linux-amd64 /usr/local/bin/dbmate
RUN chmod +x /usr/local/bin/dbmate

WORKDIR /db

COPY migration.sh ./
COPY backup.sh    ./
COPY migrations   ./migrations/

# -----------------------------------------------------------------------------
FROM base as backup
# -----------------------------------------------------------------------------

RUN sh -c "echo '11 1 * * * cd /db && sh backup.sh' >> /etc/crontabs/root"
RUN sh -c "echo '13 1 * * * cd /db && sh clean.sh' >> /etc/crontabs/root"

CMD sh -c "\
    if [[ $BUILD_ENV = 'development' ]]; then\
        sh; \
    else \
        crond -f; \
    fi"

# -----------------------------------------------------------------------------
FROM base as migration
# -----------------------------------------------------------------------------

CMD sh migration.sh && while true; do sleep 86400; done

# =============================================================================
# =============================================================================
FROM base
# =============================================================================
# =============================================================================

CMD echo "No build target specified"
