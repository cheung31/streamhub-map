.PHONY: all build

all: build

build: node_modules lib dist

clean:
	rm -rf node_modules
	rm -rf lib
	rm -rf dist
	npm cache clean

env=dev
deploy: dist
	./node_modules/.bin/lfcdn -e $(env)

dist: build src requirejs.conf.js tools
	mkdir -p dist
	./node_modules/gulp/bin/gulp.js prefix
	./node_modules/requirejs/bin/r.js -o ./tools/build.conf.js
	rm -rf dist/temp

lib: bower.json
	./node_modules/bower/bin/bower install
	touch $@

node_modules: package.json
	npm install
	touch $@

package: build

run: build
	npm start

test: build
	./node_modules/karma/bin/karma start tools/karma.conf.js --singleRun=true
