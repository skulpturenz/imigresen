.PHONY: dev build test test.watch

dev:
	lein ring server-headless

build:
	lein ring uberjar

test:
	lein test

test.watch:
	lein auto test
