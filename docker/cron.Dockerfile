# -----------------------------------------------------------------------------
FROM node:20-alpine as builder
# -----------------------------------------------------------------------------

WORKDIR /app

# Install dependencies
COPY tsconfig.json              ./
COPY yarn.lock package.json     ./
COPY patches/                   ./patches/
RUN yarn install

# Build app
COPY build/                     ./build/
COPY src/                       ./src/
RUN \
    --mount=type=secret,id=GIT_HASH \
    --mount=type=secret,id=WEB_URL \
    --mount=type=secret,id=WEB_PORT \
    --mount=type=secret,id=API_URL \
    --mount=type=secret,id=API_PORT \
    NODE_ENV=production \
    yarn build

# Remove dev dependencies
RUN yarn install --production

# -----------------------------------------------------------------------------
FROM node:20-alpine
LABEL org.opencontainers.image.source https://github.com/Trinovantes/MAL-Cover-CSS
# -----------------------------------------------------------------------------

RUN apk update && apk add --no-cache curl

WORKDIR /app

ENV NODE_ENV 'production'

# Copy app
COPY --from=builder /app/package.json   ./
COPY --from=builder /app/node_modules   ./node_modules
COPY --from=builder /app/dist/          ./dist/
COPY docker/                            ./docker

# Mount points
RUN mkdir -p                            ./db/live
RUN mkdir -p                            ./dist/client/generated

RUN echo "15 * * * * cd /app && sh ./docker/cron.sh" >> /etc/crontabs/root
CMD crond -f
