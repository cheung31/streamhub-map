// Karma configuration
// Generated on Thu Nov 21 2013 14:47:59 GMT-0800 (PST)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '..',

    // frameworks to use
    frameworks: ['mocha', 'cajon', 'chai'],

    // list of files / patterns to load in the browser
    files: [
      'requirejs.conf.js',
      {pattern: 'package.json', included: false},
      {pattern: 'src/*.js', included: false},
      {pattern: 'src/**/*.js', included: false},
      {pattern: 'src/**/*.css', included: false},
      {pattern: 'src/**/*.mustache', included: false},
      {pattern: 'tests/spec/*.js', included: false},
      {pattern: 'tests/spec/**/*.js', included: false},
      {pattern: 'tests/mocks/**/*.js', included: false},
      {pattern: 'node_modules/**/*.js', included: false},
      {pattern: 'lib/**/*.css', included: false},
      {pattern: 'lib/**/*.js', included: false},
      {pattern: 'lib/**/*.json', included: false},
      {pattern: 'lib/**/*.mustache', included: false},
      {pattern: 'tests/tests-main.js', included: true}
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['mocha'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR ||
    // config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any
    // file changes
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
