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
RUN yarn buildCron

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
RUN mkdir -p                    ./dist/generated

# Copy app
COPY ./db/migrate.sh            ./db/
COPY ./db/migrations/           ./db/migrations/
COPY --from=builder /app/dist/  ./dist/

RUN echo "0 * * * * cd /app && sh ./db/migrate.sh && yarn startScraper && yarn startGenerator" >> /etc/crontabs/root
CMD crond -f
