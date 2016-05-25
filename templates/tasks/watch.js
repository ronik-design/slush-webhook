'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const watch = require('gulp-watch');

gulp.task('watch', cb => {
  gutil.env.watching = true;

  const config = gutil.env.config;

  watch(`${config.source}/${config['styles_dir']}/**/*`, () => {
    gulp.start('styles');
  });

  watch(`${config.source}/${config['images_dir']}/**/*`, () => {
    gulp.start('images');
  });

  watch(`${config.source}/${config['scripts_dir']}/**/*`, () => {
    gulp.start('scripts');
  });

  watch(`${config.source}/${config['sprites_dir']}/**/*`, () => {
    gulp.start('sprites');
  });

  cb();
});
