var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var tsc = require("gulp-typescript");
var tsProject = tsc.createProject(
    {
        "compilerOptions": {
            "target": "es5",
            "sourceMap": false,
            "module": "commonjs",
            "emitDecoratorMetadata": true,
            "removeComments": true,
            "preserveConstEnums": true,
        }
    });


gulp.task('compress', ['build'], function () {
    console.log(" -> Minifying js file...");
    gulp.src("dist/*.js")
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest("dist/min"));
    
});

gulp.task('build', function (cb) {
    console.log(" -> Build Js file...");
    return gulp.src([
        "src/*.ts"
    ])
        .pipe(tsc(tsProject))
        .js.pipe(gulp.dest("dist"));
});