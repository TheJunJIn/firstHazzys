import path from 'path';
import del from 'del';
import gulp from 'gulp';
import sass from 'gulp-sass';
import nodeSass from 'node-sass';
import autoprefixer from 'autoprefixer';
import spritesmith from 'gulp.spritesmith-multi';
import browserSync from 'browser-sync';

import gulpPlumberNotifier from 'gulp-plumber-notifier';
import gulpNewer from 'gulp-newer';
import gulpIf from 'gulp-if';
import gulpSourcemaps from 'gulp-sourcemaps';
import gulpPostcss from 'gulp-postcss';
import gulpFlatten from 'gulp-flatten';
import gulpImagemin from 'gulp-imagemin';
import gulpHtmlhint from 'gulp-htmlhint';
import gulpFileInclude from 'gulp-file-include';
import through from 'through2';

sass.compiler = nodeSass;
const isProduction = process.env.NODE_ENV === 'production';

const clean = {
  uiPublish: () => del('ui-publish'),
  demo: () => del('dist'),
  markup: () => del('dist/**/*.html'),
  styles: () => del('dist/asset/css'),
  sprites: () =>
    del([
      'src/cmsstatic/asset/images/sprite-*.png',
      'src/components/sprites/*.scss'
    ])
};

const styles = () => {
  return (
    gulp
      .src([
        'src/**/*.scss',
        '!src/components/**/*.scss',
        '!**/_*/**/*.scss',
        '!**/_*.scss'
      ])
      .pipe(gulpPlumberNotifier())
      .pipe(gulpNewer('dist'))
      .pipe(gulpIf(!isProduction, gulpSourcemaps.init()))
      .pipe(sass.sync({
        // https://github.com/sass/node-sass#outputstyle
        outputStyle: 'compressed'
      }).on('error', sass.logError))
      .pipe(
        gulpPostcss([
          autoprefixer({
            grid: 'autoplace'
          })
        ])
      )
      .pipe(gulpIf(!isProduction, gulpSourcemaps.write()))
      .pipe(gulp.dest('dist'))
  );
};

const sprites = () => {
  return gulp
    .src('src/components/sprites/**/*.png')
    .pipe(
      spritesmith({
        spritesmith: function (options, name) {
          options.cssName = 'sprite-' + name + '.scss';
          options.cssSpritesheetName = 'sprite-' + name;
          options.cssTemplate = 'src/components/sprites/template.hbs';
          options.padding = 8;
          options.imgName = `sprite-${options.imgName}`;
          options.imgPath = `/cmsstatic/asset/images/${options.imgName}`;
          options.cssHandlebarsHelpers = {
            sort: (arr) => {
              arr.sort((a, b) => {
                if (a.name < b.name) {
                  return -1;
                }
                if (a.name > b.name) {
                  return 1;
                }
                return 0;
              });
            },
            half: function (num) {
              return num / 2 + 'px';
            },
            getName: function () {
              return name;
            }
          };
        }
      })
    )
    .pipe(
      gulpIf(
        '*.png',
        gulp.dest('src/cmsstatic/asset/images/'),
        gulp.dest('src/components/sprites/')
      )
    );
};

const markup = () => {
  return gulp
    .src([
      'src/**/*.html',
      '!src/components/**/*.html',
      '!**/_*/**/*.html',
      '!**/_*.html'
    ])
    .pipe(gulpPlumberNotifier())
    .pipe(gulpNewer('dist/'))
    .pipe(
      gulpFileInclude({
        prefix: '@@',
        basepath: './src/',
        indent: true
      })
    )
    .pipe(
      gulpHtmlhint({
        htmlhintrc: '.htmlhintrc'
      })
    )
    .pipe(gulpHtmlhint.reporter())
    .pipe(gulp.dest('dist/'));
};

const image = () => {
  return gulp
    .src([
      'src/cmsstatic/asset/images/**/*.{png,jpg,jpeg,gif}',
      '!**/_*/**/*',
      '!**/_*'
    ])
    .pipe(gulpPlumberNotifier())
    .pipe(gulpNewer('dist/cmsstatic/asset/images/'))
    .pipe(
      gulpIf(
        isProduction,
        gulpImagemin({
          interlaced: true,
          progressive: true
        })
      )
    )
    .pipe(gulp.dest('dist/cmsstatic/asset/images'));
};

const copy = {
  ico: () => {
    return gulp
      .src('src/favicon.ico')
      .pipe(gulpPlumberNotifier())
      .pipe(gulp.dest('dist/'));
  },
  font: () => {
    return gulp
      .src([
        'src/cmsstatic/asset/fonts/**/*.{woff,woff2,eot,ttf,otf}',
        '!**/_*/**/*',
        '!**/_*'
      ])
      .pipe(gulpPlumberNotifier())
      .pipe(gulpNewer('dist/cmsstatic/asset/fonts/'))
      .pipe(gulpFlatten())
      .pipe(gulp.dest('dist/cmsstatic/asset/fonts/'));
  },
  media: () => {
    return gulp
      .src([
        'src/cmsstatic/asset/media/**/*.{mp4,ogg,webm}',
        '!**/_*/**/*',
        '!**/_*'
      ])
      .pipe(gulpPlumberNotifier())
      .pipe(gulpNewer('dist/cmsstatic/asset/media/'))
      .pipe(gulp.dest('dist/cmsstatic/asset/media/'));
  }
};

let bs;

const serve = () => {
  bs = browserSync.create();

  // https://browsersync.io/docs/options
  bs.init({
    server: {
      baseDir: 'dist',
      directory: true
    },
    cors: true,
    files: 'dist',
    notify: false,
    ui: false,
    port: 8080
  });
};

const startWatchers = () => {
  gulp.watch(
    [
      'src/**/*.html',
      '!src/components/**/*.html',
      '!**/_*/**/*.html',
      '!**/_*.html'
    ],
    markup
  );
  gulp.watch(
    [
      'src/**/*.scss',
      '!src/components/**/*.scss',
      '!**/_*/**/*.scss',
      '!**/_*.scss'
    ],
    styles
  );
  gulp.watch(
    ['src/components/**/*.scss', 'src/**/_*/**/*.scss', 'src/**/_*.scss'],
    gulp.series([clean.styles, styles])
  );
  gulp.watch('src/cmsstatic/asset/images/**/*.{png,jpg,jpeg,gif}', image);
  gulp.watch(
    'src/cmsstatic/asset/fonts/**/*.{woff,woff2,eot,ttf,otf}',
    copy.font
  );
  gulp.watch('src/cmsstatic/asset/media/**/*.{mp4,ogg,webm}', copy.media);
};

const prefixPath = (content, prefix = '/ui-publish') => {
  let replaced = content;
  [
    /(\/cmsstatic\/)/g,
    /(\/asset\/css\/)/g,
    /(\/asset\/js\/)/g,
    /(\/pages\/)/g,
    /(\/guide\/)/g
  ].forEach((regexp) => {
    replaced = replaced.replace(regexp, (match) => prefix + match);
  });
  return replaced;
};

const uiPublish = () => {
  return gulp
    .src('dist/**/*')
    .pipe(
      through.obj(function (file, _, cb) {
        const ext = path.extname(file.path);

        if (
          ext === '.css' ||
          ext === '.html' ||
          ext === '.json' ||
          ext === '.js'
        ) {
          const fileContents = file.contents.toString();
          const pathReplaced = prefixPath(fileContents);
          file.contents = Buffer.from(pathReplaced);
        }

        cb(null, file);
      })
    )
    .pipe(gulp.dest('ui-publish/'));
};

const copyTaskList = [copy.ico, copy.font, copy.media];
const cleanTask = gulp.parallel([clean.demo]);
const rebuildMarkupTask = gulp.series([clean.markup, markup]);
const rebuildCssTask = gulp.series([clean.styles, sprites]);
const spritesTask = gulp.series([clean.sprites, sprites]);
const buildTask = gulp.parallel(markup, styles, image);
const copyTask = gulp.parallel(copyTaskList);
const build = gulp.parallel(buildTask, copyTask);

const watchTask = gulp.series(
  gulp.parallel(copyTask, buildTask),
  startWatchers
);
const serveTask = gulp.parallel(watchTask, serve);

export {
  build as default,
  rebuildMarkupTask as rebuildMarkup,
  rebuildCssTask as rebuildCssTask,
  cleanTask as clean,
  spritesTask as sprites,
  serveTask as serve,
  uiPublish as publish
};
