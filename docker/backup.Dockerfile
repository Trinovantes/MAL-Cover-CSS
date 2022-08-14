# -----------------------------------------------------------------------------
FROM alpine
LABEL org.opencontainers.image.source https://github.com/Trinovantes/MAL-Cover-CSS
# -----------------------------------------------------------------------------

ENV GLIBC_VER=2.31-r0

# Install aws-cli
RUN apk --no-cache add \
        binutils \
        curl \
    && curl -sL https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub -o /etc/apk/keys/sgerrand.rsa.pub \
    && curl -sLO "https://github.com/sgerrand/alpine-pkg-glibc/releases/download/${GLIBC_VER}/glibc-${GLIBC_VER}.apk" \
    && curl -sLO "https://github.com/sgerrand/alpine-pkg-glibc/releases/download/${GLIBC_VER}/glibc-bin-${GLIBC_VER}.apk" \
    && apk add --no-cache \
        "glibc-${GLIBC_VER}.apk" \
        "glibc-bin-${GLIBC_VER}.apk" \
    && curl -sL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip \
    && unzip awscliv2.zip \
    && aws/install \
    && rm -rf \
        awscliv2.zip \
        aws \
        /usr/local/aws-cli/v2/*/dist/aws_completer \
        /usr/local/aws-cli/v2/*/dist/awscli/data/ac.index \
        /usr/local/aws-cli/v2/*/dist/awscli/examples \
    && apk --no-cache del \
        binutils \
        curl \
    && rm glibc-${GLIBC_VER}.apk \
    && rm glibc-bin-${GLIBC_VER}.apk \
    && rm -rf /var/cache/apk/*

# Install sqlite3
RUN apk update && apk add sqlite

WORKDIR /app

# Mount points
RUN mkdir -p            ./db/backups

# Copy app
COPY ./db/backup.sh     ./db/

RUN echo '11 1 * * 1 cd /app && sh ./db/backup.sh' >> /etc/crontabs/root
CMD crond -f
