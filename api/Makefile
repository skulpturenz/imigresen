.PHONY: dev build build.watch test test.watch repl

dev:
	lein ring server-headless

build:
	lein ring uberjar

build.watch:
	lein auto ring uberjar

test:
	lein test

test.watch:
	lein auto test

repl:
	lein repl
