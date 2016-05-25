'use strict';

const gulp = require('gulp');
const runSequence = require('run-sequence');

// Build
gulp.task('compile', cb => {
  runSequence(
    'clean',
    'sprites',
    'images',
    'styles',
    'scripts',
    cb
  );
});
