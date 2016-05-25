'use strict';

const HELP = `


---- S T E N C I L ----

Usage: gulp [task] [options]

gulp clean
gulp develop
gulp build [--production]
gulp deploy [--production, --target=staging|production]

`;

const gulp = require('gulp');
const gutil = require('gulp-util');
const runSequence = require('run-sequence');
const requireDir = require('require-dir');
const loadConfig = require('./libs/load-config');

// Config

gutil.env.production = gutil.env.production || process.env.NODE_ENV === 'production';

gutil.env.config = loadConfig(gutil.env.config || '_config.yml');

// Build

gulp.task('build', cb => {
  runSequence('compile', 'webhook:build', cb);
});

// Develop

gulp.task('develop', cb => {
  runSequence('compile', 'watch', 'webhook:serve', cb);
});

// Deploy

gulp.task('deploy', cb => {
  const done = function () {
    if (gutil.env.deployResult) {
      const service = gutil.env.deployResult.service;
      const host = gutil.env.deployResult.host;

      gutil.log(`Your site has been deployed to ${service}`);
      gutil.log('----------------------------------');
      gutil.log(gutil.colors.green(host));
    }

    cb();
  };

  if (gutil.env.target === 'production') {
    runSequence('build', 'webhook:deploy', done);
  } else {
    runSequence('build', 'revisions', 'deployer', done);
  }
});

// Default / Help

gulp.task('default', cb => {
  gutil.log(HELP);

  cb();
});

requireDir('./tasks');
