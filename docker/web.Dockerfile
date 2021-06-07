# -----------------------------------------------------------------------------
FROM node:14 as builder
# -----------------------------------------------------------------------------

WORKDIR /app

# Install puppeteer
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt install -y --no-install-recommends \
        google-chrome-stable \
        libxss1 \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Install dependencies
COPY tsconfig.json              ./
COPY yarn.lock package.json     ./
RUN yarn install

# Build app
COPY build/                     ./build/
COPY src/                       ./src/
RUN yarn buildWeb

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
