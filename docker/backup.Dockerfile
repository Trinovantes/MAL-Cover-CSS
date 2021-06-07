# -----------------------------------------------------------------------------
FROM alpine
LABEL org.opencontainers.image.source https://github.com/Trinovantes/MAL-Cover-CSS
# -----------------------------------------------------------------------------

# Install sqlite3
RUN apk update && apk add sqlite

WORKDIR /app

# Mount points
RUN mkdir -p            ./db/backups

# Copy app
COPY ./db/backup.sh     ./db/

RUN echo '11 1 * * * cd /app && sh ./db/backup.sh' >> /etc/crontabs/root
CMD crond -f
