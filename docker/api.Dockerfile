# -----------------------------------------------------------------------------
FROM node:24-alpine AS base
# -----------------------------------------------------------------------------

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

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
FROM base AS builder
# -----------------------------------------------------------------------------

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install \
        --frozen-lockfile

COPY build/                     ./build/
COPY src/                       ./src/
RUN \
    --mount=type=secret,id=GIT_HASH \
    --mount=type=secret,id=WEB_URL \
    --mount=type=secret,id=WEB_PORT \
    --mount=type=secret,id=API_URL \
    --mount=type=secret,id=API_PORT \
    NODE_ENV=production \
    pnpm build

# -----------------------------------------------------------------------------
FROM node:24-alpine
LABEL org.opencontainers.image.source=https://github.com/Trinovantes/MAL-Cover-CSS
# -----------------------------------------------------------------------------

WORKDIR /app

ENV NODE_ENV='production'

# Copy app
COPY --from=builder /app/dist/          ./dist/
COPY --from=deps /app/package.json      ./
COPY --from=deps /app/node_modules/     ./node_modules/

# Mount points
RUN mkdir -p                            ./db/live
RUN mkdir -p                            ./dist/web/client/generated

CMD ["npm", "run", "startWeb"]
