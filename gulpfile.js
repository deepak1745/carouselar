var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var header = require('gulp-header');
var sass = require('gulp-sass');
var livereload = require('gulp-livereload');
var del = require('del');
var runSequence = require('run-sequence');
var stylish = require('jshint-stylish');
var http = require('http');
var st = require('st');
var pkg = require('./package');
var jshintConfig = pkg.jshintConfig;

var BANNER = [
  '/**',
  ' * <%= pkg.name %> v<%= pkg.version %> (<%= pkg.homepage %>)',
  ' * Copyright <%= new Date().getFullYear() %> <%= pkg.author %>',
  ' * Licensed under <%= pkg.license %>',
  ' */',
  ''
].join('\n');

var PATH = {
  SOURCE: './src/',
  TEST: './test/',
  DIST: './dist/'
};

var SOURCE = {
  SCRIPTS: PATH.SOURCE + 'scripts/',
  STYLES: PATH.SOURCE + 'styles/',
};

var handleErr = function(err) {
  console.error('ERROR' + (err.fileName ? ' in ' + err.fileName : ':'));
  console.error(err.message);
  this.end();
};

gulp.task('clean', function(cb) {
  del([PATH.DIST], cb);
});

jshintConfig.lookup = false;
gulp.task('jshint', function() {
  return gulp.src(SOURCE.SCRIPTS + '*.js')
    .pipe(jshint(jshintConfig))
    .pipe(jshint.reporter(stylish))
    .pipe(livereload());
});

gulp.task('sass', function() {
  return gulp.src(SOURCE.STYLES + '*.scss')
    .pipe(sass()).on('error', handleErr)
    .pipe(gulp.dest(PATH.DIST))
    .pipe(livereload());
});

gulp.task('concat', function() {
  return gulp.src([
      SOURCE.SCRIPTS + 'directives.js',
      SOURCE.SCRIPTS + 'module.js'
    ])
    .pipe(concat(pkg.name + '.js'))
    .pipe(gulp.dest(PATH.DIST));
});

gulp.task('uglify', function() {
  return gulp.src(PATH.DIST + pkg.name + '.js')
    .pipe(uglify()).on('error', handleErr)
    .pipe(rename({
      basename: pkg.name,
      suffix: '.min'
    }))
    .pipe(gulp.dest(PATH.DIST));
});

gulp.task('banner', function() {
  return gulp.src(PATH.DIST + '*.js')
    .pipe(header(BANNER, {
      pkg: pkg
    }))
    .pipe(gulp.dest(PATH.DIST));
});

gulp.task('watch', ['server'], function() {
  livereload.listen({
    basePath: './',
    reloadPage: 'demo/index.html'
  });
  gulp.watch(SOURCE.SCRIPTS + '*.js', ['jshint']);
  gulp.watch(SOURCE.STYLES + '*.scss', ['sass']);
});

gulp.task('server', function(cb) {
  http.createServer(
    st({
      path: __dirname,
      index: 'index.html',
      cache: false
    })
  ).listen(8080, cb);
});

gulp.task('build', ['clean'], function(cb) {
  runSequence(
    'sass',
    'concat',
    'uglify',
    'banner',
    cb);
});

gulp.task('default', ['build']);