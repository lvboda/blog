const gulp = require('gulp');
const minifycss = require('gulp-minify-css');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const htmlclean = require('gulp-htmlclean');
// var imagemin = require('gulp-imagemin');

// 压缩css
gulp.task('minify-css', function() {
    return gulp.src('./public/**/*.css')
        .pipe(minifycss({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest('./public'));
});
// 压缩js
gulp.task('minify-js', function() {
    return gulp.src('./public/js/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./public'));
});

// 压缩 public 目录 html文件
gulp.task('minify-html', function() {
    return gulp.src('./public/**/*.html')
      .pipe(htmlclean())
      .pipe(htmlmin({
           removeComments: true,
           minifyJS: true,
           minifyCSS: true,
           minifyURLs: true,
      }))
      .pipe(gulp.dest('./public'))
  });

// 压缩图片
// gulp.task('minify-images', function() {
//     return gulp.src('./public/images/**/*.*')
//         .pipe(imagemin(
//         [imagemin.gifsicle({'optimizationLevel': 3}),
//         imagemin.mozjpeg({'progressive': true}),
//         imagemin.optipng({'optimizationLevel': 7}), 
//         imagemin.svgo()],
//         {'verbose': true}))
//         .pipe(gulp.dest('./public/images'));
// });
        
// 默认任务
gulp.task('default', gulp.parallel(
    'minify-css','minify-js','minify-html', // 'minify-images'
));
