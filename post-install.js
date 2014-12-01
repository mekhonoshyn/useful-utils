/**
 * created by mekhonoshyn on 11/3/14.
 */

var gulp = require('gulp'),
    path = require('path'),
    distDir = path.join(__dirname, '..', '..', 'external', 'useful-utils'),
    srcMask = path.join(__dirname, 'lib', '**', '*.js'),
    del = require('del'),
    runSeq = require('run-sequence'),
    fs = require('fs');

console.log('__dirname:', __dirname, fs.existsSync(__dirname));
console.log('distDir:', distDir, fs.existsSync(distDir));
console.log('srcMask:', srcMask, fs.existsSync(path.join(__dirname, 'lib')));

function _onError() {
    "use strict";

    console.log('args:', arguments);
}

gulp.task('clean', function (cb) {
    return del(distDir, {
        force: true
    }, cb);
});

gulp.task('copy', function () {
    return gulp.src(srcMask)
        .pipe(gulp.dest(distDir))
        .on('error', _onError);
});

gulp.task('check', function () {
    console.log('__dirname:', __dirname, fs.existsSync(__dirname));
    console.log('distDir:', distDir, fs.existsSync(distDir));
    console.log('srcMask:', srcMask, fs.existsSync(path.join(__dirname, 'lib')));
});

gulp.task('default', function (cb) {
    runSeq('clean', 'copy', 'check', cb);
});