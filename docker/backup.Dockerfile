# -----------------------------------------------------------------------------
FROM alpine
LABEL org.opencontainers.image.source https://github.com/Trinovantes/MAL-Cover-CSS
# -----------------------------------------------------------------------------

# Install sqlite3 and aws-cli
RUN apk update && apk add --no-cache sqlite aws-cli

WORKDIR /app

# Mount points
RUN mkdir -p            ./db/backups
RUN mkdir -p            ./db/live

# Copy app
COPY ./db/backup.sh     ./db/

RUN aws --version

RUN echo '22 2 * * 2 cd /app && sh ./db/backup.sh' >> /etc/crontabs/root
CMD crond -f
