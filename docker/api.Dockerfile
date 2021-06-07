# -----------------------------------------------------------------------------
FROM node:14 as builder
# -----------------------------------------------------------------------------

WORKDIR /app

# Install dependencies
COPY tsconfig.json              ./
COPY yarn.lock package.json     ./
RUN yarn install

# Build app
COPY build/                     ./build/
COPY src/                       ./src/
RUN yarn buildApi

# -----------------------------------------------------------------------------
FROM amacneil/dbmate:v1.11.0 as dbmate
FROM node:14-alpine
LABEL org.opencontainers.image.source https://github.com/Trinovantes/MAL-Cover-CSS
# -----------------------------------------------------------------------------

# Install dbmate
COPY --from=dbmate /usr/local/bin/dbmate /usr/local/bin/dbmate

ENV NODE_ENV 'production'
WORKDIR /app

# Install dependencies
COPY yarn.lock package.json     ./
RUN yarn install

# Mount points
RUN mkdir -p                    ./db

# Copy app
COPY ./db/migrate.sh            ./db/
COPY ./db/migrations/           ./db/migrations/
COPY --from=builder /app/dist/  ./dist/

CMD sh ./db/migrate.sh && yarn startApi
