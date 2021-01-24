FROM alpine:3.10

WORKDIR /db

ADD https://github.com/amacneil/dbmate/releases/download/v1.11.0/dbmate-linux-amd64 /usr/local/bin/dbmate
RUN chmod +x /usr/local/bin/dbmate

COPY run.sh     ./
COPY migrations ./migrations/

CMD sh run.sh
