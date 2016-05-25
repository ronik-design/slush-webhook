'use strict';

const path = require('path');
const gulp = require('gulp');
const gutil = require('gulp-util');
const del = require('del');

gulp.task('clean', cb => {
  const config = gutil.env.config;

  const dirs = [config.destination];

  if (config['styles_path']) {
    dirs.push(path.join(config.build, config['styles_path']));
  }

  if (config['scripts_path']) {
    dirs.push(path.join(config.build, config['scripts_path']));
  }

  if (config['icons_path']) {
    dirs.push(path.join(config.build, config['icons_path']));
  }

  if (config['sprites_path']) {
    dirs.push(path.join(config.build, config['sprites_path']));
  }

  if (config['images_path']) {
    dirs.push(path.join(config.build, config['images_path']));
  }

  del.sync(dirs);

  cb();
});
