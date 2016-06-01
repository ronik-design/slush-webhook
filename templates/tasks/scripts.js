'use strict';

const path = require('path');
const fs = require('fs');
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

const getEslintConfigFile = function (dir) {
  try {
    const filepath = path.join(dir, '.eslintrc');
    fs.accessSync(filepath, fs.F_OK);
    return filepath;
  } catch (e) {
    return false;
  }
};

gulp.task('scripts', () => {
  const production = gutil.env.production;
  const watching = gutil.env.watching;
  const config = gutil.env.config;

  const errorHandler = notify.onError();

  const filename = 'main.js';
  const scriptsDir = path.join(config.source, config['scripts_dir']);

  const src = path.join(scriptsDir, filename);
  const dst = path.join(config.build, config['scripts_path']);

  const webpackConfig = getConfig(scriptsDir, production);

  webpackConfig.output = {filename};

  const configFile = getEslintConfigFile(scriptsDir);

  if (configFile) {
    webpackConfig.eslint = {configFile};
  }

  return gulp.src(src)
    .pipe(gulpIf(watching, plumber({errorHandler})))
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest(dst));
});
