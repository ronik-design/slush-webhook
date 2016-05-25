'use strict';

const path = require('path');
const gulp = require('gulp');
const gutil = require('gulp-util');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const gulpIf = require('gulp-if');

const getConfig = function (scriptsDir, production) {
  if (production) {
    return require(`${scriptsDir}/webpack.production.config.js`);
  }
  return require(`${scriptsDir}/webpack.development.config.js`);
};

gulp.task('scripts', () => {
  const production = gutil.env.production;
  const watching = gutil.env.watching;
  const config = gutil.env.config;

  notify.logLevel(0);

  const errorHandler = notify.onError();

  const filename = 'main.js';
  const scriptsDir = path.join(config.source, config['scripts_dir']);

  const src = path.join(scriptsDir, filename);
  const dst = path.join(config.build, config['scripts_path']);

  const webpackConfig = getConfig(scriptsDir, production);

  webpackConfig.eslint = {configFile: path.join(scriptsDir, '.eslintrc')};
  webpackConfig.output = {filename};

  return gulp.src(src)
    .pipe(gulpIf(watching, plumber({errorHandler})))
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest(dst));
});
