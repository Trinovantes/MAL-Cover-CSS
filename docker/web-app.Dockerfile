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
COPY src/web/                   ./src/web/
RUN \
    --mount=type=secret,id=GIT_HASH \
    --mount=type=secret,id=APP_URL \
    --mount=type=secret,id=APP_PORT \
    NODE_ENV=production \
    yarn buildWeb

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

# Copy app
COPY ./db/migrations/           ./db/migrations/
COPY --from=builder /app/dist/  ./dist/

CMD yarn start
