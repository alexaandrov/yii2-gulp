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
const part = "frontend";

var config = {
    preprocessor: 'scss',
    bowerPath: 'vendor/bower',
    npmPath: 'node_modules',
    basePath: 'common/web/' + part,
    sourcePath: part + '/web'
};
/* End base settings */

gulp.task('browser-sync', function () {
    browserSync({
        // If you work with server
        proxy: {
            target: "http://yousite.dev"
        },
        // If you work local
        // server: {
        //     baseDir: config.basePath
        // },
        notify: true,
    });
});

gulp.task('sass', function () {
    del.sync(config.sourcePath + '/css/**/*');
    return gulp.src(config.basePath + '/' + config.preprocessor + '/**/*.' + config.preprocessor)
        .pipe(errorNotifier())
        .pipe(sass({
            includePaths: bourbon.includePaths
        }).on('error', sass.logError))
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(cleanCSS())
        .pipe(browserSync.reload({stream: true}))
        .pipe(gulp.dest(config.sourcePath + '/css'));
});

gulp.task('scss', function () {
    del.sync(config.sourcePath + '/css/**/*');
    return gulp.src(config.basePath + '/' + config.preprocessor + '/**/*.' + config.preprocessor)
        .pipe(errorNotifier())
        .pipe(sass.sync({
            outputStyle: 'compressed',
            includePaths: bourbon.includePaths
        }).on('error', sass.logError))
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(cleanCSS())
        .pipe(browserSync.reload({stream: true}))
        .pipe(gulp.dest(config.sourcePath + '/css'));
});

gulp.task('js', function () {
    del.sync(config.sourcePath + '/js/**/*');
    return gulp.src(config.basePath + '/js/**/*.js')
        .pipe(errorNotifier())
        .pipe(concat('common.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(config.sourcePath + '/js'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('libs', function () {
    return gulp.src([
        config.bowerPath + '/jquery/dist/jquery.min.js',
        config.bowerPath + '/bootstrap/dist/js/bootstrap.min.js',
    ])
        .pipe(errorNotifier())
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(config.sourcePath + '/js'));
});

gulp.task('fonts', function () {
    del.sync(config.sourcePath + '/fonts/**/*');
    return gulp.src(config.basePath + '/fonts/**/*').pipe(gulp.dest(config.sourcePath + '/fonts'));
});

gulp.task('imagemin', function () {
    del.sync(config.sourcePath + '/img/**/*');
    return gulp.src(config.basePath + '/img/**/*')
        .pipe(errorNotifier())
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest(config.sourcePath + '/img'));
});

gulp.task('clearcache', function () {
    return cache.clearAll();
});

gulp.task('build', [config.preprocessor, 'js', 'libs', 'imagemin', 'fonts']);

gulp.task('watch', [config.preprocessor, 'libs', 'browser-sync'], function () {
    gulp.watch('common/web/frontend/' + config.preprocessor + '/**/*.' + config.preprocessor, [config.preprocessor]);
    gulp.watch(config.basePath + '/js/**/*.js', ['js']), gulp.watch(part + '/views/**/*.php', browserSync.reload);
});

gulp.task('default', ['build', 'watch']);