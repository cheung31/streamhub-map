.PHONY: all build

all: build

build: node_modules

dist: build src requirejs.conf.js tools
	mkdir dist
	./node_modules/requirejs/bin/r.js -o ./tools/build.conf.js	

# if package.json changes, install
node_modules: package.json
	npm install
	touch $@

server: build
	npm start


clean:
	rm -rf node_modules
	rm -rf lib
	rm -rf dist

package: build

env=dev
deploy:
	./node_modules/.bin/lfcdn -e $(env)
