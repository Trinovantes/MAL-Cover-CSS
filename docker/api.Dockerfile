# -----------------------------------------------------------------------------
FROM node:20 as builder
# -----------------------------------------------------------------------------

WORKDIR /app

# Install dependencies
COPY tsconfig.json              ./
COPY yarn.lock package.json     ./
COPY node_modules               ./node_modules
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
    yarn buildWeb

# -----------------------------------------------------------------------------
FROM node:20-alpine
LABEL org.opencontainers.image.source https://github.com/Trinovantes/MAL-Cover-CSS
# -----------------------------------------------------------------------------

WORKDIR /app

ENV NODE_ENV 'production'

# Install dependencies
COPY yarn.lock package.json     ./
COPY node_modules               ./node_modules
COPY patches/                   ./patches/
RUN yarn install

# Mount points
RUN mkdir -p                    ./db/live

# Copy app
COPY --from=builder /app/dist/  ./dist/

CMD yarn startWeb
