# -----------------------------------------------------------------------------
FROM node:22-alpine as builder
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
FROM caddy:2-alpine
LABEL org.opencontainers.image.source https://github.com/Trinovantes/MAL-Cover-CSS
# -----------------------------------------------------------------------------

WORKDIR /app

# Copy app
COPY ./docker/web.Caddyfile     /etc/caddy/Caddyfile
COPY --from=builder /app/dist   /app/dist/

# Edit in API_PORT
RUN \
    --mount=type=secret,id=API_PORT \
    sed -i "s/API_PORT/$(cat /run/secrets/API_PORT)/" /etc/caddy/Caddyfile
