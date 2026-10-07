# -----------------------------------------------------------------------------
FROM node:26-alpine AS base
# -----------------------------------------------------------------------------

RUN npm install -g pnpm@12 && \
    apk add python3

WORKDIR /app

COPY tsconfig.json              ./
COPY package.json               ./
COPY pnpm-workspace.yaml        ./
COPY pnpm-lock.yaml             ./
COPY patches/                   ./patches/

# -----------------------------------------------------------------------------
FROM base AS deps
# -----------------------------------------------------------------------------

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install \
        --frozen-lockfile \
        --production

# -----------------------------------------------------------------------------
FROM node:26-alpine
LABEL org.opencontainers.image.source=https://github.com/Trinovantes/MAL-Cover-CSS
# -----------------------------------------------------------------------------

WORKDIR /app

ENV NODE_ENV='production'

# Install cron dependencies
RUN apk update && \
    apk add --no-cache git

# Copy app
COPY --from=deps /app/package.json      ./
COPY --from=deps /app/node_modules/     ./node_modules/
COPY docker/                            ./docker/
COPY build/                             ./build/
COPY src/                               ./src/
COPY .git/                              ./.git/

# Mount points
RUN mkdir -p                            ./db/live
RUN mkdir -p                            ./dist/web/client/generated

RUN echo "15 * * * * cd /app && sh ./docker/cron.sh" >> /etc/crontabs/root
CMD ["crond", "-f"]
