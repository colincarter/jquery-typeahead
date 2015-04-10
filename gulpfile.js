var gulp = require('gulp'),
	ts = require('gulp-typescript'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	plumber = require('gulp-plumber'),
	tsPath = "src/*.ts",
	libPath = "lib",
	typeDefs = "typings";

gulp.task('typescript', function() {
	var tsResults = gulp.src(tsPath)
						.pipe(ts({
							target: 'ES5',
							declarationFiles: false,
							noExternalResolve: true
						}));
	tsResults.dts.pipe(gulp.dest(typeDefs));
	return tsResults.js.pipe(gulp.dest(libPath));
});

gulp.task('watch', function() {
	gulp.watch([tsPath], ['typescript'])
});

gulp.task('default', ['typescript', 'watch']);
