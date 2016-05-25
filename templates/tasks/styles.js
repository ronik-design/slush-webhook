'use strict';

const path = require('path');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');
const notify = require('gulp-notify');
const size = require('gulp-size');
const gulpIf = require('gulp-if');
const runSequence = require('run-sequence');

const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const stylelint = require('stylelint');
const syntaxScss = require('postcss-scss');
const reporter = require('postcss-reporter');

const errorHandler = notify.onError();

const loadPostcssPlugins = function (options) {
  const plugins = [];

  for (const name in options.plugins) {
    let plugin;

    try {
      plugin = require(name);
    } catch (e) {
      gutil.log(gutil.colors.red(`PostCSS plugin '${name}' not found. Maybe you to 'npm install' it?`));
    }

    if (!plugin) {
      continue;
    }

    if (typeof options.plugins[name] === 'object') {
      plugin = plugin(options.plugins[name]);
    }

    plugins.push(plugin);
  }

  return plugins;
};

gulp.task('styles:lint', () => {
  const watching = gutil.env.watching;
  const config = gutil.env.config;

  const src = path.join(config.source, config['styles_dir']);

  const processors = [
    stylelint({configFile: `${src}/.stylelintrc`}),
    reporter({clearMessages: true, throwError: true})
  ];

  return gulp.src([`${src}/**/*.{sass,scss}`, `!${src}/layout/_grid.scss`])
    .pipe(gulpIf(watching, plumber({errorHandler})))
    .pipe(postcss(processors), {syntax: syntaxScss});
});

gulp.task('styles:build', () => {
  const production = gutil.env.production;
  const watching = gutil.env.watching;
  const config = gutil.env.config;

  const src = path.join(config.source, config['styles_dir']);
  const dst = path.join(config.build, config['styles_path']);

  let sassConfig;
  let postcssConfig;

  if (config.styles) {
    if (config.styles.sass) {
      sassConfig = config.styles.sass;
    }

    if (config.styles.postcss) {
      postcssConfig = loadPostcssPlugins(config.styles.postcss);
    }
  }

  return gulp.src(`${src}/**/[!_]*.{css,sass,scss}`)
    .pipe(gulpIf(watching, plumber({errorHandler})))
    .pipe(gulpIf(!production, sourcemaps.init()))
    .pipe(sass(sassConfig).on('error', sass.logError))
    .pipe(postcss(postcssConfig))
    .pipe(gulpIf(!production, sourcemaps.write('./')))
    .pipe(size({title: 'styles'}))
    .pipe(gulp.dest(dst));
});

gulp.task('styles', cb => {
  runSequence('styles:lint', 'styles:build', cb);
});
