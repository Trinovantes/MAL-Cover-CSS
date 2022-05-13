# -----------------------------------------------------------------------------
FROM node:16 as builder
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
COPY src/web/                   ./src/web/
RUN \
    --mount=type=secret,id=GIT_HASH \
    --mount=type=secret,id=APP_URL \
    --mount=type=secret,id=APP_PORT \
    NODE_ENV=production \
    yarn buildWebClient

# -----------------------------------------------------------------------------
FROM nginx:alpine
LABEL org.opencontainers.image.source https://github.com/Trinovantes/MAL-Cover-CSS
# -----------------------------------------------------------------------------

WORKDIR /app

# Mount points
RUN mkdir -p                    /app/dist/web/generated

# Copy app
COPY ./docker/web.conf          /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist   /app/dist/
