'use strict';

const gulp = require('gulp');
const glob = require('glob');
const path = require('path');
const merge = require('merge-stream');
const gutil = require('gulp-util');
const gulpIf = require('gulp-if');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const svgSprite = require('gulp-svg-sprite');

gulp.task('sprites', () => {
  const watching = gutil.env.watching;
  const config = gutil.env.config;

  const src = path.join(config.source, config['sprites_dir']);
  const dst = path.join(config.build, config['sprites_path']);

  const errorHandler = notify.onError();

  const folders = glob.sync('*/', {cwd: src});

  const tasks = folders.map(folder => {
    const folderName = folder.substr(0, folder.length - 1);
    const config = {
      mode: {
        stack: {dest: '.', sprite: `${folderName}.stack.svg`}
      }
    };

    return gulp.src(path.join(src, folder, '**/*.svg'))
      .pipe(gulpIf(watching, plumber({errorHandler})))
      .pipe(svgSprite(config))
      .pipe(gulp.dest(dst));
  });

  const root = gulp.src(path.join(src, '*.svg'))
      .pipe(gulpIf(watching, plumber({errorHandler})))
      .pipe(svgSprite({mode: {stack: {dest: '.', sprite: 'main.stack.svg'}}}))
      .pipe(gulp.dest(dst));

  return merge(tasks, root);
});
