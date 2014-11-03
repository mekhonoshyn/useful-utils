/**
 * created by mekhonoshyn on 11/3/14.
 */

var gulp = require( 'gulp' ),
    distDir = '../../public/d-n-d',
    del = require( 'del' ),
    runSeq = require( 'run-sequence' );

gulp.task('clean', function (cb) {
    return del(distDir, cb);
});

gulp.task('copy', function () {
    return gulp.src( '**/*.js' ).pipe(gulp.dest(distDir));
});

gulp.task('default', function (cb) {
    runSeq('clean', 'copy', cb);
});