print-%: ; @echo $*=$($*)

export DOCKER_BUILDKIT          := 1
export COMPOSE_DOCKER_CLI_BUILD := 1

# -----------------------------------------------------------------------------
# Individual Starts (for debugging)
# -----------------------------------------------------------------------------

devUpGenerator:
	docker-compose -f build/docker-compose.yml -p malcovercss -f build/docker-compose.development.yml up -d --force-recreate --build generator

devUpScraper:
	docker-compose -f build/docker-compose.yml -p malcovercss -f build/docker-compose.development.yml up -d --force-recreate --build scraper

devUpWeb:
	docker-compose -f build/docker-compose.yml -p malcovercss -f build/docker-compose.development.yml up -d --force-recreate --build www

# -----------------------------------------------------------------------------
# Build
# -----------------------------------------------------------------------------

devUp:
	docker-compose -f build/docker-compose.yml -p malcovercss -f build/docker-compose.development.yml up -d

prodUp:
	docker-compose -f build/docker-compose.yml -p malcovercss -f build/docker-compose.production.yml up -d

devBuild:
	docker-compose -f build/docker-compose.yml -f build/docker-compose.development.yml build

prodBuild:
	docker-compose -f build/docker-compose.yml -f build/docker-compose.production.yml build

dev: devBuild devUp
prod: prodBuild prodUp

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------

down:
	docker-compose -f build/docker-compose.yml -p malcovercss down --remove-orphans

pull:
	docker-compose -f build/docker-compose.yml pull --quiet

push:
	docker-compose -f build/docker-compose.yml push
