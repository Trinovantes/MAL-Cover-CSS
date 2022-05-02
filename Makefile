print-%: ; @echo $*=$($*)

include .env
export

export GIT_HASH                 := $(shell git rev-parse HEAD)
export DOCKER_BUILDKIT          := 1
export COMPOSE_DOCKER_CLI_BUILD := 1

backup-dockerfile = ./docker/backup.Dockerfile
backup-container = malcovercss-backup
backup-image = ghcr.io/trinovantes/$(backup-container)

cron-dockerfile = ./docker/cron.Dockerfile
cron-container = malcovercss-cron
cron-image = ghcr.io/trinovantes/$(cron-container)

web-app-dockerfile = ./docker/web-app.Dockerfile
web-app-container = malcovercss-web-app
web-app-image = ghcr.io/trinovantes/$(web-app-container)

web-dockerfile = ./docker/web.Dockerfile
web-container = malcovercss-web
web-image = ghcr.io/trinovantes/$(web-container)

redis-container = malcovercss-redis
redis-image = redis

.PHONY: \
	build-backup stop-backup run-backup \
	build-cron stop-cron run-cron \
	build-web stop-web run-web \
	stop-redis run-redis \
	pull push clean all

all: build run

build: \
	build-backup \
	build-cron \
	build-web

stop: \
	stop-backup \
	stop-cron \
	stop-web \
	stop-redis

run: \
	run-backup \
	run-cron \
	run-web \
	run-redis

pull:
	docker pull $(backup-image) --quiet
	docker pull $(cron-image) --quiet
	docker pull $(web-image) --quiet

push:
	docker push $(backup-image) --quiet
	docker push $(cron-image) --quiet
	docker push $(web-image) --quiet

clean:
	rm -rf ./dist ./node_modules/.cache
	docker container prune -f
	docker image prune -f

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
		--secret id=APP_URL \
		--secret id=APP_PORT \
		.

stop-cron:
	docker stop $(cron-container) || true
	docker rm $(cron-container) || true

run-cron: stop-cron
	docker run \
		--mount type=bind,source=/var/www/malcovercss/generated,target=/app/dist/generated \
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
		--file $(web-app-dockerfile) \
		--tag $(web-app-image) \
		--progress=plain \
		--secret id=GIT_HASH \
		--secret id=APP_URL \
		--secret id=APP_PORT \
		.

	docker build \
		--file $(web-dockerfile) \
		--tag $(web-image) \
		--progress=plain \
		--secret id=GIT_HASH \
		--secret id=APP_URL \
		--secret id=APP_PORT \
		.

stop-web:
	docker stop $(web-app-container) || true
	docker stop $(web-container) || true
	docker rm $(web-app-container) || true
	docker rm $(web-container) || true

run-web: stop-web redis
	docker run \
		--mount type=bind,source=/var/www/malcovercss/live,target=/app/db/live \
		--publish 9042:$(APP_PORT) \
		--env-file .env \
		--env REDIS_HOST=$(redis-container) \
		--env REDIS_PORT=6379 \
		--network nginx-network \
		--log-driver local \
		--restart=always \
		--detach \
		--name $(web-app-container) \
		$(web-app-image)

	docker run \
		--mount type=bind,source=/var/www/malcovercss/generated,target=/app/dist/web/generated,readonly \
		--publish $(APP_PORT):80 \
		--network nginx-network \
		--log-driver local \
		--restart=always \
		--detach \
		--name $(web-container) \
		$(web-image)

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
