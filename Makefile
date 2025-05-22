print-%: ; @echo $*=$($*)

include .env
export

export GIT_HASH                 := $(shell git rev-parse HEAD)
export DOCKER_BUILDKIT          := 1
export COMPOSE_DOCKER_CLI_BUILD := 1

.PHONY: build stop run all pull push clean

all: build run

# -----------------------------------------------------------------------------
# Vars
# -----------------------------------------------------------------------------

redis-container = malcovercss-redis
redis-image = redis

backup-dockerfile = ./docker/backup.Dockerfile
backup-container = malcovercss-backup
backup-image = ghcr.io/trinovantes/$(backup-container)

cron-dockerfile = ./docker/cron.Dockerfile
cron-container = malcovercss-cron
cron-image = ghcr.io/trinovantes/$(cron-container)

web-dockerfile = ./docker/web.Dockerfile
web-container = malcovercss-web
web-image = ghcr.io/trinovantes/$(web-container)

api-dockerfile = ./docker/api.Dockerfile
api-container = malcovercss-api
api-image = ghcr.io/trinovantes/$(api-container)

# -----------------------------------------------------------------------------
# Commands
# -----------------------------------------------------------------------------

build: \
	build-backup \
	build-cron \
	build-web \
	build-api

stop: \
	stop-api \
	stop-web \
	stop-cron \
	stop-backup \
	stop-redis

run: \
	run-redis \
	run-backup \
	run-cron \
	run-web \
	run-api

pull:
	docker pull $(backup-image) --quiet
	docker pull $(cron-image) --quiet
	docker pull $(web-image) --quiet
	docker pull $(api-image) --quiet

push:
	docker push $(backup-image) --quiet
	docker push $(cron-image) --quiet
	docker push $(web-image) --quiet
	docker push $(api-image) --quiet

clean:
	rm -rf ./dist
	docker container prune -f
	docker image prune -f

sentry:
	rm -rf ./dist
	mkdir -p ./dist

	$(eval TEMP_CONTAINER=$(shell sh -c "docker create ${cron-image}"))
	docker cp $(TEMP_CONTAINER):/app/dist/. ./dist
	docker rm $(TEMP_CONTAINER)

	$(eval TEMP_CONTAINER=$(shell sh -c "docker create ${web-image}"))
	docker cp $(TEMP_CONTAINER):/app/dist/. ./dist
	docker rm $(TEMP_CONTAINER)

	$(eval TEMP_CONTAINER=$(shell sh -c "docker create ${api-image}"))
	docker cp $(TEMP_CONTAINER):/app/dist/. ./dist
	docker rm $(TEMP_CONTAINER)

	yarn sentry-cli sourcemaps upload --release=$(GIT_HASH) ./dist

# -----------------------------------------------------------------------------
# Redis
# -----------------------------------------------------------------------------

redis: run-redis

stop-redis:
	docker stop $(redis-container) || true
	docker rm $(redis-container) || true

run-redis: stop-redis
	docker run \
		--mount type=bind,source=/var/www/malcovercss/redis,target=/data \
		--publish $(REDIS_PORT):6379 \
		--network nginx-network \
		--log-driver local \
		--restart=always \
		--detach \
		--name $(redis-container) \
		$(redis-image)

# -----------------------------------------------------------------------------
# Backup
# -----------------------------------------------------------------------------

backup: build-backup run-backup

build-backup:
	docker build \
		--file $(backup-dockerfile) \
		--tag $(backup-image) \
		--progress=plain \
		.

stop-backup:
	docker stop $(backup-container) || true
	docker rm $(backup-container) || true

run-backup: stop-backup
	docker run \
		--mount type=bind,source=/var/www/malcovercss/backups,target=/app/db/backups \
		--mount type=bind,source=/var/www/malcovercss/live,target=/app/db/live \
		--env-file .env \
		--log-driver local \
		--restart=always \
		--detach \
		--name $(backup-container) \
		$(backup-image)

# -----------------------------------------------------------------------------
# Cron
# -----------------------------------------------------------------------------

cron: build-cron run-cron

build-cron:
	docker build \
		--file $(cron-dockerfile) \
		--tag $(cron-image) \
		--progress=plain \
		--secret id=GIT_HASH \
		--secret id=WEB_URL \
		--secret id=WEB_PORT \
		--secret id=API_URL \
		--secret id=API_PORT \
		.

stop-cron:
	docker stop $(cron-container) || true
	docker rm $(cron-container) || true

run-cron: stop-cron
	docker run \
		--mount type=bind,source=/var/www/malcovercss/generated,target=/app/dist/web/client/generated \
		--mount type=bind,source=/var/www/malcovercss/live,target=/app/db/live \
		--env-file .env \
		--log-driver local \
		--restart=always \
		--detach \
		--name $(cron-container) \
		$(cron-image)

# -----------------------------------------------------------------------------
# Web
# -----------------------------------------------------------------------------

web: build-web run-web

build-web:
	docker build \
		--file $(web-dockerfile) \
		--tag $(web-image) \
		--progress=plain \
		--secret id=GIT_HASH \
		--secret id=WEB_URL \
		--secret id=WEB_PORT \
		--secret id=API_URL \
		--secret id=API_PORT \
		.

stop-web:
	docker stop $(web-container) || true
	docker rm $(web-container) || true

run-web: stop-web
	docker run \
		--mount type=bind,source=/var/www/malcovercss/generated,target=/app/dist/web/client/generated,readonly \
		--publish $(WEB_PORT):80 \
		--network nginx-network \
		--log-driver local \
		--restart=always \
		--detach \
		--name $(web-container) \
		$(web-image)

# -----------------------------------------------------------------------------
# api
# -----------------------------------------------------------------------------

api: build-api run-api

build-api:
	docker build \
		--file $(api-dockerfile) \
		--tag $(api-image) \
		--progress=plain \
		--secret id=GIT_HASH \
		--secret id=WEB_URL \
		--secret id=WEB_PORT \
		--secret id=API_URL \
		--secret id=API_PORT \
		.

stop-api:
	docker stop $(api-container) || true
	docker rm $(api-container) || true

run-api: stop-api
	docker run \
		--publish $(API_PORT):$(API_PORT) \
		--mount type=bind,source=/var/www/malcovercss/live,target=/app/db/live \
		--env-file .env \
		--env REDIS_HOST=$(redis-container) \
		--env REDIS_PORT=6379 \
		--add-host test.malcovercss.link:127.0.0.1 \
		--add-host test.malcovercss.link:::1 \
		--network nginx-network \
		--log-driver local \
		--restart=always \
		--detach \
		--name $(api-container) \
		$(api-image)
