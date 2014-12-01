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

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

console.log('__dirname:', __dirname, fs.existsSync(__dirname));
console.log('distDir:', distDir, fs.existsSync(distDir));
console.log('srcMask:', srcMask, fs.existsSync(path.join(__dirname, 'lib')));

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