FROM node:lts-alpine3.10 as base

ARG BUILD_ENV=production
ENV BUILD_ENV=${BUILD_ENV}
ENV NODE_ENV=${BUILD_ENV}

# -----------------------------------------------------------------------------
FROM base AS builder
# -----------------------------------------------------------------------------

WORKDIR /app

# Need to override NODE_ENV for 'yarn install' so that yarn will install devDependencies for building the app
COPY yarn.lock package.json ./
RUN NODE_ENV=development yarn install

COPY tsconfig.json  ./
COPY build/         ./build/
COPY src/           ./src/

RUN yarn build

# =============================================================================
# =============================================================================
FROM base as www
# =============================================================================
# =============================================================================

WORKDIR /app

COPY                static/                             ./static/
COPY --from=builder /app/dist/web-server/               ./dist/web-server/
COPY --from=builder /app/dist/web-client/               ./dist/web-client/
COPY --from=builder /app/node_modules/                  ./node_modules/
COPY --from=builder /app/yarn.lock  /app/package.json   ./

RUN yarn install --production

CMD sh -c "\
    if [[ $BUILD_ENV = 'development' ]]; then\
        yarn dev; \
    else \
        yarn runWeb; \
    fi"

# =============================================================================
# =============================================================================
FROM base as cron-base
# =============================================================================
# =============================================================================

WORKDIR /app

COPY --from=builder /app/dist/cron/                     ./dist/cron/
COPY --from=builder /app/node_modules/                  ./node_modules/
COPY --from=builder /app/yarn.lock  /app/package.json   ./

RUN yarn install --production

# -----------------------------------------------------------------------------
FROM cron-base as cron-scraper
# -----------------------------------------------------------------------------

RUN sh -c "echo '11 * * * * cd /app && yarn runScraper' >> /etc/crontabs/root"

CMD sh -c "\
    if [[ $BUILD_ENV = 'development' ]]; then\
        yarn debugScraper; \
    else \
        crond -f; \
    fi"

# -----------------------------------------------------------------------------
FROM cron-base as cron-generator
# -----------------------------------------------------------------------------

RUN sh -c "echo '19 * * * * cd /app && yarn runGenerator' >> /etc/crontabs/root"

CMD sh -c "\
    if [[ $BUILD_ENV = 'development' ]]; then\
        yarn debugScraper; \
    else \
        crond -f; \
    fi"

# =============================================================================
# =============================================================================
FROM base
# =============================================================================
# =============================================================================

CMD echo "No build target specified"
