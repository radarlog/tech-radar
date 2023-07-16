.SILENT:
.DEFAULT_GOAL := help

.PHONY: help
help: ; $(info Usage:)
	echo "make run                      build environment"

.PHONY: up
up: ; $(info Starting containers:)
	docker-compose up -d

.PHONY: down
down: ; $(info Shutting down containers:)
	docker-compose down

.PHONY: yarn
yarn: ; $(info Installing dependencies:)
	docker-compose run -T --rm nodejs yarn install --frozen-lockfile --non-interactive

.PHONY: run
run: yarn up ; $(info Environment has been built succesfully)

.PHONY: linter
linter: ; $(info Checking coding style:)
	docker-compose run -T --rm nodejs yarn run linter
