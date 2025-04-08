# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder
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
FROM node:22-alpine
LABEL org.opencontainers.image.source=https://github.com/Trinovantes/MAL-Cover-CSS
# -----------------------------------------------------------------------------

WORKDIR /app

ENV NODE_ENV='production'

# Copy app
COPY --from=builder /app/package.json   ./
COPY --from=builder /app/node_modules   ./node_modules
COPY --from=builder /app/dist/          ./dist/

# Mount points
RUN mkdir -p ./db/live

CMD ["yarn", "startWeb"]
