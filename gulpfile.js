'use strict';

const gulp          = require('gulp'),
    sass            = require('gulp-sass'),
    concat          = require('gulp-concat'),
    uglify          = require('gulp-uglify'),
    cleanCSS        = require('gulp-clean-css'),
    rename          = require('gulp-rename'),
    del             = require('del'),
    imagemin        = require('gulp-imagemin'),
    pngquant        = require('imagemin-pngquant'),
    cache           = require('gulp-cache'),
    autoprefixer    = require('gulp-autoprefixer'),
    bourbon         = require('node-bourbon'),
    errorNotifier   = require('gulp-error-notifier'),
    browserSync     = require('browser-sync');

/* Base settings */
const base = {
    part: 'frontend',
    preprocessor: 'scss'
};

const path = {
    bower: 'vendor/bower',
    npm: 'node_modules',
    source: 'assets/src/' + base.part,
    dest: base.part + '/web'
};
/* End base settings */

gulp.task('browser-sync', function () {
    browserSync({
        /* If you work with server */
        proxy: {
            target: "http://yousite.dev"
        },
        /* If you work local */
        // server: {
        //     baseDir: path.source
        // },
        notify: true
    });
});

gulp.task('sass', function () {
    del.sync(path.dest + '/css/**/*');
    return gulp.src(path.source + '/' + base.preprocessor + '/**/*.' + base.preprocessor)
        .pipe(errorNotifier())
        .pipe(sass.sync({
            outputStyle: 'compressed',
            includePaths: bourbon.includePaths
        }).on('error', sass.logError))
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(cleanCSS())
        .pipe(gulp.dest(path.dest + '/css'));
});

gulp.task('scss', function () {
    del.sync(path.dest + '/css/**/*');
    return gulp.src(path.source + '/' + base.preprocessor + '/**/*.' + base.preprocessor)
        .pipe(errorNotifier())
        .pipe(sass.sync({
            outputStyle: 'compressed',
            includePaths: bourbon.includePaths
        }).on('error', sass.logError))
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(cleanCSS())
        .pipe(gulp.dest(path.dest + '/css'));
});

gulp.task('js', function () {
    del.sync(path.dest + '/js/**/*');
    return gulp.src(path.source + '/js/**/*.js')
        .pipe(errorNotifier())
        .pipe(concat('common.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.dest + '/js'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('libs', function () {
    return gulp.src([
        // path.bower + '/jquery/dist/jquery.min.js',
        // path.bower + '/bootstrap/dist/js/bootstrap.min.js'
    ])
        .pipe(errorNotifier())
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.dest + '/js'));
});

gulp.task('fonts', function () {
    del.sync(path.dest + '/fonts/**/*');
    return gulp.src(path.source + '/fonts/**/*').pipe(gulp.dest(path.dest + '/fonts'));
});

gulp.task('imagemin', function () {
    del.sync(path.dest + '/img/**/*');
    return gulp.src(path.source + '/img/**/*')
        .pipe(errorNotifier())
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest(path.dest + '/img'));
});

gulp.task('clearcache', function () {
    return cache.clearAll();
});

gulp.task('build', [base.preprocessor, 'js', 'libs', 'imagemin', 'fonts']);

gulp.task('watch', [base.preprocessor, 'libs', 'browser-sync'], function () {
    gulp.watch(path.source + '/' + base.preprocessor + '/**/*.' + base.preprocessor, [base.preprocessor]);
    gulp.watch(path.dest + '/js/**/*.js', browserSync.reload);
    gulp.watch(path.dest + '/css/**/*.css', browserSync.reload);
    gulp.watch(base.part + '/views/**/*.php', browserSync.reload);
});

gulp.task('default', ['build', 'watch']);