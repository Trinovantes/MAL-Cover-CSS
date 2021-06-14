# -----------------------------------------------------------------------------
FROM ghcr.io/trinovantes/puppeteer-prerender-plugin as builder
# -----------------------------------------------------------------------------

WORKDIR /app

# Install dependencies
COPY tsconfig.json              ./
COPY yarn.lock package.json     ./
RUN yarn install

# Build app
COPY build/                     ./build/
COPY src/@types/                ./src/@types/
COPY src/common/                ./src/common/
COPY src/web/                   ./src/web/
RUN --mount=type=secret,id=GIT_HASH \
    yarn buildWeb

# -----------------------------------------------------------------------------
FROM nginx:alpine
LABEL org.opencontainers.image.source https://github.com/Trinovantes/MAL-Cover-CSS
# -----------------------------------------------------------------------------

WORKDIR /app

# Mount points
RUN mkdir -p                    ./dist/web/generated

# Copy app
COPY ./docker/web.conf          /etc/nginx/conf.d/default.conf
COPY ./docker/snippets          /app/docker/snippets
COPY --from=builder /app/dist   /app/dist
