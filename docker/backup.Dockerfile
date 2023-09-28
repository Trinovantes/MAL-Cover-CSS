# -----------------------------------------------------------------------------
FROM alpine
LABEL org.opencontainers.image.source https://github.com/Trinovantes/MAL-Cover-CSS
# -----------------------------------------------------------------------------

# Install sqlite3 and aws-cli
RUN apk update && apk add --no-cache curl sqlite aws-cli && aws --version

WORKDIR /app

# Copy app
COPY docker/    ./docker

# Mount points
RUN mkdir -p    ./db/backups
RUN mkdir -p    ./db/live

RUN echo '22 2 * * 2 cd /app && sh ./docker/backup.sh' >> /etc/crontabs/root
CMD crond -f
