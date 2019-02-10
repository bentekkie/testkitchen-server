'use strict';

let gulp = require('gulp');
let nodemon = require('gulp-nodemon')
let ts = require('gulp-typescript');

let serverTsProject = ts.createProject('tsconfig.json');

// These tasks will be run when you just type "gulp"
gulp.task('default', ['serverscripts']);

// This task can be run alone with "gulp serverscripts"
gulp.task('serverscripts', () => {
  return serverTsProject.src()
    .pipe(serverTsProject())
    .js
    .pipe(gulp.dest('app'));
});

gulp.task('watch', ['serverscripts'], function () {
  var stream = nodemon({
    script: 'app/server.js' // run ES5 code
    , watch: 'src/**/*' // watch ES2015 code
    , ext: 'ts'
    , tasks: ['serverscripts'] // compile synchronously onChange
  })

  return stream
})