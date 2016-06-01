'use strict';

const HELP = `


----------------------------

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
  runSequence('generate', 'webhook:build', cb);
});

// Develop

gulp.task('develop', cb => {
  runSequence('generate', 'watch', 'webhook:serve', cb);
});

// Deploy

gulp.task('deploy', cb => {
  if (gutil.env.target === 'production') {
    runSequence('build', 'webhook:deploy', cb);
  } else {
    runSequence('build', 'revisions', 'deployer', cb);
  }
});

// Default / Help

gulp.task('default', cb => {
  gutil.log(HELP);

  cb();
});

requireDir('./tasks');
