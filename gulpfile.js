var gulp = require('gulp');
var less = require('gulp-less');
var nodemon = require('gulp-nodemon');
var packageJson = require('./package.json');
var prefixSelectors = require('rework/lib/plugins/prefix-selectors');
var rework = require('gulp-rework');
var util = require('gulp-util');

function lessify(path) {
  gulp.src(path)
    .pipe(less({ paths: [ __dirname ] }).on('error', util.log))
    .pipe(gulp.dest('dev'));
}

gulp.task('default', function() {

  /**
   * Run the server
   */
  nodemon({ script: 'node_modules/http-server/bin/http-server' });

  /**
   * Watch for less file changes.
   */
  gulp.watch('src/**/*.less', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    lessify(event.path);
  });

  // Lessify the style less
  lessify(__dirname + '/src/css/style.less');
});

/**
 * Prefix all selectors in the CSS file with the app version.
 */
gulp.task('prefix', function() {
  var appName = packageJson.name;
  var version = packageJson.version;
  gulp.src('src/css/style.less')
    .pipe(less({ paths: [ __dirname ] }).on('error', util.log))
    .pipe(rework(prefixSelectors('[data-lf-package="' + appName + '#' + version + '"]')))
    .pipe(gulp.dest('dist/temp'));
});
