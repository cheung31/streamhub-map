var gulp = require('gulp');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var nodemon = require('gulp-nodemon');
var packageJson = require('./package.json');
var path = require('path');
var prefixSelectors = require('rework/lib/plugins/prefix-selectors');
var rework = require('gulp-rework');
var util = require('gulp-util');

var SRC_LESS = 'src/css/style.less';

function lessify(src, dest, prefix, minify) {
  var appName = packageJson.name;
  var paths = [__dirname, path.join(__dirname, 'lib')];

  var proc = gulp.src(src)
    .pipe(less({
      paths: paths,
      relativeUrls: true
    }))
    .on('error', util.log);
  var version = packageJson.version;

  if (prefix) {
    proc = proc.pipe(rework(prefixSelectors('[data-lf-package="' + appName + '#' + version + '"]')));
  }
  if (minify) {
    proc = proc.pipe(minifyCSS());
  }
  proc.pipe(gulp.dest(dest));
}

gulp.task('default', function () {

  /**
   * Run the server
   */
  nodemon({script: 'node_modules/http-server/bin/http-server'});

  /**
   * Watch for less file changes.
   */
  gulp.watch('src/**/*.less', function (event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    lessify(event.path);
  });

  // Lessify the style less
  lessify(SRC_LESS, 'dev');
});

/**
 * Prefix all selectors in the CSS file with the app version.
 */
gulp.task('prefix', function () {
  lessify(SRC_LESS, 'dist/temp', true, true);
});
