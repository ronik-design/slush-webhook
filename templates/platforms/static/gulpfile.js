var PACKAGE = require('./package');
var PARAMS = require('./params');

var path = require('path');
var gulp = require('gulp');
var util = require('gulp-util');
var watch = require('gulp-watch');
var runSequence = require('run-sequence');
var requireDir = require('require-dir');

function dirPath(dir) {
    return path.resolve(__dirname, dir);
}

// Params
util.env.PACKAGE = PACKAGE;
util.env.PARAMS = PARAMS;

// Domain, for S3 deployment
util.env.domain = PARAMS.domain;

// SPA routing, default on for now
util.env.spa = PARAMS.singlePageApplication;

// Build directory
util.env.buildDir = dirPath(PARAMS.buildDir);
util.env.baseDir = dirPath('./');
util.env.tmpDir = dirPath(PARAMS.buildDir + '/.tmp');

// Various process sub-dirs
util.env.assetsDir = dirPath('assets');
util.env.imagesDir = dirPath('images');
util.env.scriptsDir = dirPath('scripts');
util.env.stylesDir = dirPath('styles');
util.env.iconsDir = dirPath('icons');
util.env.templatePagesDir = dirPath('pages');
util.env.templateDataDir = dirPath('data');

gulp.task('build', function(cb) {

    runSequence(
        'clean',
        'lint',
        ['icons', 'images', 'assets'],
        ['styles', 'webpack', 'templates'],
        'revisions',
        cb
        );
});

gulp.task('watch', function (cb) {

    util.env.watching = true;

    function watchStart() {

        watch('assets/**/*', function() {
            gulp.start('assets');
        });
        watch('styles/**/*.{css,styl}', function() {
            gulp.start('styles');
        });
        watch('images/**/*', function() {
            gulp.start('images');
        });
        watch('icons/**/*.svg', function() {
            runSequence('icons', 'styles');
        });
        watch(['templates/**/*', 'pages/**/*', 'data/**/*'], function() {
            gulp.start('templates');
        });

        cb();
    }

    runSequence(
        'clean',
        'lint',
        ['icons', 'images', 'assets', 'webpack', 'templates'],
        ['styles'],
        watchStart
        );
});

gulp.task('deploy', function (cb) {

    runSequence('build', 's3-deploy', cb);
});

gulp.task('serve', function (cb) {

    runSequence('watch', 'browser-sync', cb);
});

gulp.task('default', function (cb) {

    var help = [
        '',
        '',
        '---- S T E N C I L ----',
        '',
        'Usage: gulp [task] [options]',
        '',
        'gulp clean',
        'gulp lint [--scripts]',
        'gulp build',
        'gulp deploy [--production]',
        'gulp serve [--host, --port]',
        'gulp watch',
        ''
    ];

    util.log(help.join('\n'));

    cb();
});

requireDir('./tasks');
