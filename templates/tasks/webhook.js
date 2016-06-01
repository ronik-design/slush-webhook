'use strict';

const path = require('path');
const gulp = require('gulp');
const gutil = require('gulp-util');
const notify = require('gulp-notify');
const spawn = require('child_process').spawn;

const onExit = function (cb) {
  return function (code) {
    cb(code === 0 ? null : `ERROR: Webhook process exited with code: ${code}`);
  };
};

gulp.task('webhook:build', cb => {
  const args = ['build', '--strict=true'];

  const args1 = [].concat(args);

  const opts = {
    env: process.env,
    stdio: 'inherit'
  };

  if (gutil.env.production) {
    args1.push('--production');
  }

  spawn('grunt', args1, opts)
    .on('error', notify.onError())
    .on('exit', () => {
      spawn('grunt', ['assets'], opts)
        .on('error', notify.onError())
        .on('exit', () => {
          opts.cwd = path.resolve('.whdist');
          const args2 = [].concat(args);
          args2.push(`--cwd=${opts.cwd}`);
          if (gutil.env.production) {
            args2.push('--production');
          }
          spawn('grunt', args2, opts)
            .on('error', notify.onError())
            .on('exit', onExit(cb));
        });
    });
});

gulp.task('webhook:serve', cb => {
  const args = ['serve'];

  const opts = {
    env: process.env,
    stdio: 'inherit'
  };

  if (gutil.env.port) {
    args.push(gutil.env.port);
  }

  spawn('wh', args, opts)
    .on('error', notify.onError())
    .on('exit', onExit(cb));
});

gulp.task('webhook:deploy', cb => {
  const config = gutil.env.config;

  const args = ['deploy'];

  const opts = {
    env: process.env,
    stdio: 'inherit'
  };

  spawn('wh', args, opts)
    .on('error', notify.onError())
    .on('exit', () => {
      gutil.log('');
      gutil.log(`Your site has been deployed to Webhook`);
      gutil.log('--------------------------------------');
      gutil.log(gutil.colors.green(config.url));
      gutil.log('');

      onExit(cb);
    });
});
