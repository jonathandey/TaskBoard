'use strict';

let gulp = require('gulp'),
    fs = require('fs'),
    del = require('del'),
    merge = require('merge-stream'),
    concat = require('gulp-concat'),
    composer = require('gulp-composer'),
    tsc = require('gulp-typescript'),
    jsMinify = require('gulp-uglify'),
    mocha = require('gulp-mocha'),
    coverage = require('gulp-coverage'),
    scsslint = require('gulp-scss-lint'),
    sass = require('gulp-sass'),
    cssPrefixer = require('gulp-autoprefixer'),
    cssMinify = require('gulp-cssnano'),
    imageMin = require('gulp-imagemin'),
    node,
    spawn = require('child_process').spawn,
    paths = {
        bourbon: 'node_modules/bourbon/app',
        neat: 'node_modules/bourbon-neat/app',
        scss_base: 'node_modules/scss-base/src',
        tsconfig: 'src/app/tsconfig.json',
        ts: 'src/app/**/*.ts',
        tests: 'test/**/*.spec.js',
        html: [
            'src/**/*.html',
            'src/.htaccess'
        ],
        images: 'src/images/**/*.*',
        scss: 'src/scss/**/*.scss',
        scssmain: 'src/scss/main.scss',
        api: [
            'src/api/**/*.*',
            'src/api/.htaccess',
            '!src/api/composer.*'
        ],
        vendor: [
            'node_modules/angular2/bundles/angular2-polyfills.js',
            'node_modules/es6-shim/es6-shim.js',
            'node_modules/systemjs/dist/system.src.js',
            'node_modules/rxjs/bundles/Rx.js',
            'node_modules/angular2/bundles/angular2.dev.js',
            'node_modules/angular2/bundles/router.dev.js',
            'node_modules/angular2/bundles/http.dev.js'
        ]
    };

gulp.task('clean', () => {
    return del('dist');
});

gulp.task('html', () => {
    return gulp.src(paths.html)
        .pipe(gulp.dest('dist/'));
});

gulp.task('images', () => {
    return gulp.src(paths.images)
        .pipe(imageMin())
        .pipe(gulp.dest('dist/images/'));
});

gulp.task('lintScss', () => {
    return gulp.src(paths.scss)
        .pipe(scsslint({ config: 'lint.yml' }));
});

gulp.task('styles', () => {
    return gulp.src(paths.scssmain)
        .pipe(sass({
            precision: 10,
            includePaths: [
                paths.bourbon,
                paths.neat,
                paths.scss_base
            ]
        }))
        .pipe(concat('styles.css'))
        .pipe(cssPrefixer())
        .pipe(gulp.dest('dist/css/'));
});

gulp.task('tsc', () => {
    let tsProject = tsc.createProject(paths.tsconfig),
        tsResult = tsProject.src()
            .pipe(tsc(tsProject));

    return tsResult.js
        .pipe(gulp.dest('dist/app/'));
});

gulp.task('vendor', () => {
    return gulp.src(paths.vendor)
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('dist/js/'));
});

gulp.task('minify', () => {
    let js = gulp.src('dist/js/vendor.js')
        .pipe(jsMinify())
        .pipe(gulp.dest('dist/js/'));

    let styles = gulp.src('dist/css/styles.css')
        .pipe(cssMinify())
        .pipe(gulp.dest('dist/css/'));

    return merge(js, styles);
});

gulp.task('composer', () => {
    return composer({
        'working-dir': 'src/api'
    });
});

gulp.task('api', () => {
    return gulp.src(paths.api)
        .pipe(gulp.dest('dist/api/'));
});

gulp.task('test', ['tsc', 'vendor'], () => {
    return gulp.src('test/**/*.spec.js')
        .pipe(mocha());
});

gulp.task('coverage', ['tsc', 'vendor'], () => {
    return gulp.src('test/**/*.spec.js')
        .pipe(coverage.instrument({
            pattern: ['dist/app/**/*.js']
        }))
        .pipe(mocha())
        .pipe(coverage.gather())
        .pipe(coverage.format())
        .pipe(gulp.dest('./'));
});

gulp.task('watch', () => {
    let watchTs = gulp.watch(paths.ts, ['tsc']),
        watchScss = gulp.watch(paths.scss, ['lintScss', 'styles']),
        watchHtml = gulp.watch(paths.html, ['html']),
        watchImages = gulp.watch(paths.images, ['images']),
        watchApi = gulp.watch(paths.api, ['api']),

        onChanged = (event) => {
            console.log('File ' + event.path + ' was ' + event.type + '. Running tasks...');
        };

    watchTs.on('change', onChanged);
    watchScss.on('change', onChanged);
    watchHtml.on('change', onChanged);
    watchImages.on('change', onChanged);
    watchApi.on('change', onChanged);
});

gulp.task('watchtests', () => {
    let watchTests =gulp.watch(paths.tests, ['test']),
        watchTs = gulp.watch(paths.ts, ['test']),

        onChanged = (event) => {
            console.log('File ' + event.path + ' was ' + event.type + '. Running tasks...');
        };

    watchTests.on('change', onChanged);
    watchTs.on('change', onChanged);
});

gulp.task('default', ['tsc', 'vendor', 'html', 'images', 'lintScss', 'styles', 'api'], () => {
    fs.chmod('dist/api', '0777');
});