'use strict';

const path = require('path');
const url = require('url');
const gulp = require('gulp');
const gutil = require('gulp-util');
const ignore = require('gulp-ignore');
const runSequence = require('run-sequence');
const gulpIf = require('gulp-if');
const awspublish = require('gulp-awspublish');
const s3Website = require('s3-website');
const notify = require('gulp-notify');
const mergeStream = require('merge-stream');
const parallelize = require('concurrent-transform');
const cyan = gutil.colors.cyan;
const logName = `'${cyan('s3-deploy')}'`;

const MAX_CONCURRENCY = 5;

const REVISIONED_HEADERS = {
  'Cache-Control': 'max-age=315360000, no-transform, public'
};

const STATIC_HEADERS = {
  'Cache-Control': 'max-age=300, s-maxage=900, no-transform, public'
};

let deployHost;

const getManifest = function (dirname, filename) {
  let manifest;

  try {
    const revManifest = require(path.join(dirname, filename || 'rev-manifest.json'));
    manifest = Object.keys(revManifest).map(p => revManifest[p]);
  } catch (e) {
    manifest = [];
  }

  return manifest;
};

const getBucket = function (target, config) {
  if (config.deployer.bucket) {
    return config.deployer.bucket;
  }

  let deployUrl = config.url;

  if (target === 'staging' && config.staging_url) {
    deployUrl = config.staging_url;
  }

  return url.parse(deployUrl).hostname;
};

gulp.task('aws:config', cb => {
  const target = gutil.env.target || 'staging';
  const config = gutil.env.config;

  const hostname = getBucket(target, config);

  const s3Config = {
    domain: hostname,
    index: 'index.html',
    error: config.error
  };

  s3Config.routes = [];

  s3Config.routes.push({
    Condition: {
      KeyPrefixEquals: 'webhook-uploads'
    },
    Redirect: {
      HostName: hostname
    }
  });

  if (config['single_page']) {
    s3Config.routes.push({
      Condition: {
        HttpErrorCodeReturnedEquals: '404'
      },
      Redirect: {
        ReplaceKeyWith: 'index.html'
      }
    });
  }

  s3Website(s3Config, (err, website) => {
    if (err) {
      notify.onError(err);
    }

    deployHost = website.url;

    if (website && website.modified) {
      gutil.log(logName, 'Site updated');
    }

    cb(err);
  });
});

gulp.task('aws:publish', () => {
  const force = gutil.env.force;
  const target = gutil.env.target || 'staging';
  const config = gutil.env.config;
  const deployDir = config.destination;

  const hostname = getBucket(target, config);

  if (!hostname) {
    return gulp.src('.').pipe(gutil.noop());
  }

  const publisher = awspublish.create({
    params: {
      Bucket: hostname
    }
  });

  const publisherOpts = {force};

  const revManifest = getManifest(deployDir);

  const merged = mergeStream();

  if (revManifest.length) {
    const revPaths = revManifest.map(p => path.join(deployDir, p));

    merged.add(
      gulp.src(revPaths, {base: deployDir})
        .pipe(ignore.include('**/*.{html,js,css,txt}'))
        .pipe(awspublish.gzip())
        .pipe(parallelize(publisher.publish(REVISIONED_HEADERS, publisherOpts), MAX_CONCURRENCY))
    );

    merged.add(
      gulp.src(revPaths, {base: deployDir})
        .pipe(ignore.exclude('**/*.{html,js,css,txt}'))
        .pipe(parallelize(publisher.publish(REVISIONED_HEADERS, publisherOpts), MAX_CONCURRENCY))
    );
  }

  merged.add(
    gulp.src(path.join(deployDir, '**/*.+(html|js|css|txt)'))
      .pipe(gulpIf(revManifest.length, ignore.exclude(revManifest)))
      .pipe(awspublish.gzip())
      .pipe(parallelize(publisher.publish(STATIC_HEADERS, publisherOpts), MAX_CONCURRENCY))
  );

  merged.add(
    gulp.src(path.join(deployDir, '/**/*.!(html|js|css|txt)'))
      .pipe(gulpIf(revManifest.length, ignore.exclude(revManifest)))
      .pipe(parallelize(publisher.publish(STATIC_HEADERS, publisherOpts), MAX_CONCURRENCY))
  );

  return merged
    .pipe(publisher.sync())
    .pipe(publisher.cache())
    .pipe(awspublish.reporter());
});

gulp.task('deployer', cb => {
  runSequence('aws:config', 'aws:publish', err => {
    if (err) {
      gutil.log(gutil.colors.red(`Your deploy failed!`));
      notify.onError()(err);
    } else {
      gutil.log('');
      gutil.log(`Your site has been deployed to AWS`);
      gutil.log('----------------------------------');
      gutil.log(gutil.colors.green(deployHost));
      gutil.log('');
    }

    cb(err);
  });
});
