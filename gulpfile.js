var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');

var paths = {
	scripts: ['js/app.js', 'js/controllers/*.js', 'js/services/*.js', 'js/directives/*.js'],
	libraries: [
		'lib/jquery-1.11.3.min.js',
		'lib/jquery-ui.min.js',
		'lib/jquery.noty.min.js',
		'lib/bootstrap.min.js',
		'lib/angular.min.js',
		'lib/angular-route.min.js',
		'lib/angular-sanitize.min.js',
		'lib/ng-context-menu.min.js',
		'lib/marked.min.js',
		'lib/spectrum.js',
		'lib/prefixfree.min.js',
		'lib/moment.local.js',
	]
}

gulp.task('scripts', function() {
	del('js/app.min.js');

	return gulp.src(paths.scripts)
		.pipe(sourcemaps.init())
			.pipe(uglify())
			.pipe(concat('app.min.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('js'))
	;
});

gulp.task('libraries', function() {
	del('lib/libs.min.js');

	return gulp.src(paths.libraries)
		.pipe(sourcemaps.init())
			.pipe(uglify())
			.pipe(concat('libs.min.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('lib'))
	;
});

gulp.task('watch', function() {
	return gulp.watch(paths.scripts, [['scripts']]);
})