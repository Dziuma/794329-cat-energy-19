"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var csso = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");

gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});
gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.scss", gulp.series("css"));
  gulp.watch("source/img/*-sprite.svg", gulp.series("build", "server-reload"));
  gulp.watch("source/*.html", gulp.series("html", "server-reload"));
});
gulp.task("server-reload", function (done) {
  server.reload();
  done();
});
gulp.task("images", function () {
  return gulp.src("source/img/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.mozjpeg({ progressive: true }),
      imagemin.svgo({
        plugins: [
          { cleanupIDs: false }
        ]
      })
    ]))
    .pipe(gulp.dest("source/img/"));
});
gulp.task("webp", function () {
  return gulp.src("source/img/*.{png,jpg}")
    .pipe(webp({ quality: 85 }))
    .pipe(gulp.dest("source/img/"));
});
gulp.task("sprite", function () {
  return gulp.src("source/img/*-sprite.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img/"));
});
gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build/"));
});
gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/css/normalize.min.css",
    "source/*.ico" //favicon
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
});
gulp.task("clean", function () {
  return del("build");
});
gulp.task("addNormalize", function () {
  return gulp.src("node_modules/normalize.css/normalize.css")
    .pipe(csso())
    .pipe(rename("normalize.min.css"))
    .pipe(gulp.dest("source/css"));
});

gulp.task("build", gulp.series(
  "clean",
  "copy",
  "css",
  "sprite",
  "html"
));
gulp.task("start", gulp.series("build", "server"));
