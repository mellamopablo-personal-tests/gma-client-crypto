"use strict";

const gulp    = require("gulp")
	, plumber = require("gulp-plumber")
	, tsc     = require("gulp-typescript")
;

gulp.task("typescript", () => {
	return gulp.src("./lib/**/*.ts")
		.pipe(plumber())
		.pipe(tsc({
			allowJs: true
		}))
		.pipe(gulp.dest("./dist/"))
});

gulp.task("default", ["typescript"]);