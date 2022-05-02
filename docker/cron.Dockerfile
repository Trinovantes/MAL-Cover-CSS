# -----------------------------------------------------------------------------
FROM node:14 as builder
# -----------------------------------------------------------------------------

WORKDIR /app

# Install dependencies
COPY tsconfig.json              ./
COPY yarn.lock package.json     ./
COPY patches/                   ./patches/
RUN yarn install

# Build app
COPY build/                     ./build/
COPY src/@types/                ./src/@types/
COPY src/common/                ./src/common/
COPY src/cron/                  ./src/cron/
RUN --mount=type=secret,id=GIT_HASH \
    --mount=type=secret,id=APP_URL \
    --mount=type=secret,id=APP_PORT \
    yarn buildCron

# -----------------------------------------------------------------------------
FROM node:14-alpine
LABEL org.opencontainers.image.source https://github.com/Trinovantes/MAL-Cover-CSS
# -----------------------------------------------------------------------------

WORKDIR /app

ENV NODE_ENV 'production'

# Install dependencies
COPY patches/                   ./patches/
COPY yarn.lock package.json     ./
RUN yarn install

# Mount points
RUN mkdir -p                    ./db
RUN mkdir -p                    ./dist/generated

# Copy app
COPY ./db/migrations/           ./db/migrations/
COPY --from=builder /app/dist/  ./dist/

RUN echo "0 * * * * cd /app && yarn startScraper && yarn startGenerator" >> /etc/crontabs/root
CMD crond -f
