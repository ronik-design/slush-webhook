'use strict';

const path = require('path');
const fs = require('fs');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');
const notify = require('gulp-notify');
const size = require('gulp-size');
const gulpIf = require('gulp-if');
const get = require('lodash.get');
const clonedeep = require('lodash.clonedeep');
const runSequence = require('run-sequence');

const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const stylelint = require('stylelint');
const syntaxScss = require('postcss-scss');
const reporter = require('postcss-reporter');
const autoprefixer = require('autoprefixer');
const objectFitImages = require('postcss-object-fit-images');

const errorHandler = notify.onError();

const loadPostcssPlugins = function (options) {
  const plugins = [];

  for (const plugin of options.plugins) {
    let loaded;

    try {
      loaded = require(plugin.name);
    } catch (e) {
      gutil.log(gutil.colors.red(`
        PostCSS plugin '${plugin.name}' not found. Maybe you need to 'npm install' it?
      `));
    }

    if (!plugin) {
      continue;
    }

    if (plugin.options) {
      loaded = loaded(plugin.options);
    }

    plugins.push(loaded);
  }

  return plugins;
};

const sassImportMappings = function (maps) {
  const mapper = function (importPath, prevPath) {
    let file = importPath;

    for (const map of maps) {
      file = file.replace(new RegExp(map.search), map.replace);
    }

    if (file === prevPath) {
      return null;
    }

    return {file};
  };

  return maps && maps.length ? mapper : null;
};

const getStylelintConfigFile = function (dir) {
  try {
    const filepath = path.join(dir, '.stylelintrc');
    fs.accessSync(filepath, fs.F_OK);
    return filepath;
  } catch (e) {
    return false;
  }
};

gulp.task('styles:lint', () => {
  const watching = gutil.env.watching;
  const config = gutil.env.config;

  const src = path.join(config.source, config['styles_dir']);

  const configFile = getStylelintConfigFile(src);

  if (!configFile) {
    return gulp.src('.').pipe(gutil.log('No .stylelintrc present... skipping'));
  }

  const processors = [
    stylelint({configFile}),
    reporter({clearMessages: true, throwError: true})
  ];

  return gulp.src(`${src}/**/*.{sass,scss}`)
    .pipe(gulpIf(watching, plumber({errorHandler})))
    .pipe(postcss(processors, {syntax: syntaxScss}));
});

gulp.task('styles:build', () => {
  const production = gutil.env.production;
  const watching = gutil.env.watching;
  const config = clonedeep(gutil.env.config);

  const src = path.join(config.source, config['styles_dir']);
  const dst = path.join(config.build, config['styles_path']);

  const sassConfig = {};
  let postcssProcessors = [
    objectFitImages,
    autoprefixer({browsers: [get(config, 'styles.autoprefixer')]})
  ];

  if (get(config, 'styles.sass')) {
    if (config.styles.sass.importMappings) {
      sassConfig.importer = sassImportMappings(config.styles.sass.importMappings);
      delete config.styles.sass.importMappings;
    }
    Object.assign(sassConfig, config.styles.sass);
  }

  if (get(config, 'styles.postcss')) {
    postcssProcessors = loadPostcssPlugins(config.styles.postcss);
  }

  return gulp.src(`${src}/**/[!_]*.{css,sass,scss}`)
    .pipe(gulpIf(watching, plumber({errorHandler})))
    .pipe(gulpIf(!production, sourcemaps.init()))
    .pipe(sass(sassConfig).on('error', sass.logError))
    .pipe(postcss(postcssProcessors))
    .pipe(gulpIf(!production, sourcemaps.write('./')))
    .pipe(size({title: 'styles'}))
    .pipe(gulp.dest(dst));
});

gulp.task('styles', cb => {
  runSequence('styles:lint', 'styles:build', cb);
});
