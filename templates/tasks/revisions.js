'use strict';

const path = require('path');
const gulp = require('gulp');
const gutil = require('gulp-util');
const ignore = require('gulp-ignore');
const through = require('through2');

const relPath = function (base, filePath) {
  if (filePath.indexOf(base) !== 0) {
    return filePath.replace(/\\/g, '/');
  }

  const newPath = filePath.substr(base.length).replace(/\\/g, '/');

  if (newPath[0] === '/') {
    return newPath.substr(1);
  }

  return newPath;
};

const generateManifest = function () {
  const manifest = {};

  const collect = function (file, enc, cb) {
    const filepath = relPath(file.base, file.path);

    manifest[filepath] = filepath;

    cb();
  };

  const generate = function (cb) {
    const file = new gutil.File({
      path: 'rev-manifest.json'
    });

    file.contents = new Buffer(JSON.stringify(manifest, null, '  '));

    this.push(file);

    cb();
  };

  return through.obj(collect, generate);
};

gulp.task('revisions', () => {
  const config = gutil.env.config;
  const files = path.join(config.destination, '**/*');
  const revisionedFileRe = /[a-fA-F0-9]{8}.minified.(css|js)$/i;

  return gulp.src(files)
    .pipe(ignore.include(revisionedFileRe))
    .pipe(generateManifest())
    .pipe(gulp.dest(config.destination));
});
