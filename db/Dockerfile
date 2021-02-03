FROM amacneil/dbmate:v1.11.0 as dbmate
FROM alpine:3.10 as base

LABEL org.opencontainers.image.source https://github.com/Trinovantes/MAL-Cover-CSS

ARG BUILD_ENV=production
ENV BUILD_ENV=${BUILD_ENV}
ENV NODE_ENV=${BUILD_ENV}

RUN apk add mysql-client
COPY --from=dbmate /usr/local/bin/dbmate /usr/local/bin/dbmate

WORKDIR /db

COPY backup.sh clean.sh migration.sh    ./
COPY migrations/                        ./migrations/

# -----------------------------------------------------------------------------
FROM base as backup
# -----------------------------------------------------------------------------

RUN sh -c "echo '11 1 * * * cd /db && sh backup.sh' >> /etc/crontabs/root"
RUN sh -c "echo '13 1 * * * cd /db && sh clean.sh' >> /etc/crontabs/root"

CMD sh -c "\
    if [ ${BUILD_ENV} = 'development' ]; then\
        sh; \
    else \
        crond -f; \
    fi"

# -----------------------------------------------------------------------------
FROM base as migration
# -----------------------------------------------------------------------------

CMD sh migration.sh && while true; do sleep 86400; done

# -----------------------------------------------------------------------------
FROM base
# -----------------------------------------------------------------------------

CMD echo "No build target specified"
