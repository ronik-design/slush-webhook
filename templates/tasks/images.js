'use strict';

const path = require('path');
const gulp = require('gulp');
const gutil = require('gulp-util');
const gulpIf = require('gulp-if');
const plumber = require('gulp-plumber');
const changed = require('gulp-changed');
const imagemin = require('gulp-imagemin');
const notify = require('gulp-notify');
const size = require('gulp-size');
const runSequence = require('run-sequence');

const errorHandler = notify.onError();

gulp.task('images:copy', () => {
  const watching = gutil.env.watching;

  const config = gutil.env.config;

  const src = path.join(config.source, config['images_dir'], '**/*.!(gif|jpg|png|jpeg)');
  const dst = path.join(config.build, config['images_path']);

  return gulp.src(src)
    .pipe(gulpIf(watching, plumber({errorHandler})))
    .pipe(changed(dst))
    .pipe(size({title: 'images:copy'}))
    .pipe(gulp.dest(dst));
});

gulp.task('images:min', () => {
  const watching = gutil.env.watching;

  const config = gutil.env.config;

  const src = path.join(config.source, config['images_dir'], '**/*.+(gif|jpg|png|jpeg)');
  const dst = path.join(config.build, config['images_path']);

  return gulp.src(src)
    .pipe(gulpIf(watching, plumber({errorHandler})))
    .pipe(changed(dst))
    .pipe(imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(size({title: 'images:min'}))
    .pipe(gulp.dest(dst));
});

gulp.task('images', cb => {
  runSequence('images:copy', 'images:min', cb);
});
