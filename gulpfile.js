"use strict";

const gulp       = require("gulp")
	, browserify = require("gulp-browserify")
	, del        = require("del")
	, plumber    = require("gulp-plumber")
	, tsc        = require("gulp-typescript")
	, uglify     = require("gulp-uglify")
;

gulp.task("typescript", () => {
	return gulp.src("./lib/**/*.ts")
		.pipe(plumber())
		.pipe(tsc({
			declaration: true
		}))
		.pipe(gulp.dest("./tmp/"))
});

gulp.task("browserify", ["typescript"], () => {
	return gulp.src("./tmp/index.js")
		.pipe(plumber())
		.pipe(browserify())
		.pipe(gulp.dest("./tmp/"));
});

gulp.task("uglify", ["browserify"], () => {
	return gulp.src("./tmp/index.js")
		.pipe(plumber())
		.pipe(uglify())
		.pipe(gulp.dest("./dist/"))
});

gulp.task("copy-typings", ["typescript"], () => {
	return gulp.src("./tmp/index.d.ts")
		.pipe(plumber())
		.pipe(gulp.dest("./dist/"));
});

gulp.task("clean", ["uglify", "copy-typings"], () => {
	return del("./tmp/");
});

gulp.task("default", ["clean"]);