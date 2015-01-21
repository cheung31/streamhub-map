.PHONY: all build

all: build

build: node_modules
	npm run lessc

dist: build src requirejs.conf.js tools
	mkdir -p dist
	./node_modules/requirejs/bin/r.js -o ./tools/build.conf.js	

# if package.json changes, install
node_modules: package.json
	npm install
	touch $@

server: build
	npm start

test:
	echo "script-friendly tests have yet to be set up. Open a webserver and access /tests"

clean:
	rm -rf node_modules
	rm -rf lib
	rm -rf dist

package: build

env=dev
deploy:
	./node_modules/.bin/lfcdn -e $(env)
