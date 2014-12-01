/**
 * created by mekhonoshyn on 11/3/14.
 */

var gulp = require('gulp'),
path = require('path'),
distDir = path.join(__dirname, '..', '..', 'external', 'useful-utils'),
srcMask = path.join(__dirname, 'lib', '**', '*.js'),
del = require('del'),
runSeq = require('run-sequence');

console.log('distDir:', distDir);
console.log('srcMask:', srcMask);

gulp.task('clean', function (cb) {
    return del(distDir, {
        force: true
    }, cb);
});

gulp.task('copy', function () {
    return gulp.src(srcMask).pipe(gulp.dest(distDir));
});

gulp.task('default', function (cb) {
    runSeq('clean', 'copy', cb);
});