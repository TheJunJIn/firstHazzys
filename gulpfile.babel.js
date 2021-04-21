import path from 'path';
import del from 'del';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import sass from 'gulp-sass';
import nodeSass from 'node-sass';
import autoprefixer from 'autoprefixer';
import postcssClean from 'postcss-clean';
import spritesmith from 'gulp.spritesmith-multi';
import browserSync from 'browser-sync';
import { createEnv, layoutToExtends, isInclude } from './utils/nunjucks-env';
import readJson from './utils/read-json';

sass.compiler = nodeSass;
const isProduction = process.env.NODE_ENV === 'production';
const plugins = gulpLoadPlugins();

const clean = {
  demo: () => del('dist'),
  sprites: () =>
    del(['src/cmsstatic/asset/images/sprite-*.png', 'src/components/sprites/*.scss'])
};

function makeMarkupTask(src) {
  const SRC = path.resolve(__dirname, 'src');
  const DEST = path.resolve(__dirname, 'dist');
  const njk = {
    path: {
      layout: path.resolve(SRC, 'layouts'),
      data: path.resolve(SRC, '_data')
    },
    data: {},
    layout: {},
    env: null,
    destFilter: null
  };

  let dest = 'dist/';
  if (src) {
    const relToSrc = path.relative(SRC, src);
    dest = path.dirname(path.resolve(DEST, relToSrc));
  }
  src = src || [
    'src/**/*.njk',
    '!src/layouts/**/*.njk',
    '!src/components/**/*.njk'
  ];

  return function markup() {
    njk.env = createEnv();
    njk.destFilter = plugins.filter([
      'src/**/*',
      '!src/layouts/**',
      '!src/components/**'
    ]);
    njk.data.site = readJson(path.resolve(njk.path.data, 'site.json'));
    njk.layout = {};

    return gulp
      .src(src)
      .pipe(plugins.plumberNotifier())
      .pipe(plugins.data((file) => layoutToExtends(njk, file)))
      .pipe(plugins.nunjucks.compile(njk.data, { env: njk.env }))
      .pipe(njk.destFilter)
      .pipe(plugins.prettier())
      .pipe(gulp.dest(dest));
  };
}

const styles = () => {
  return gulp
    .src([
      'src/asset/css/**/*.scss',
      '!**/_*/**/*',
      '!**/_*'
    ])
    .pipe(plugins.plumberNotifier())
    .pipe(plugins.newer('dist/asset/css/'))
    .pipe(plugins.if(!isProduction, plugins.sourcemaps.init()))
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(
      plugins.postcss([
        autoprefixer({
          grid: 'autoplace'
        })
      ])
    )
    .pipe(
      plugins.if(
        isProduction,
        plugins.postcss([
          postcssClean({
            aggressiveMerging: false,
            restructuring: false,
            format: 'keep-breaks'
          })
        ])
      )
    )
    .pipe(plugins.if(!isProduction, plugins.sourcemaps.write()))
    .pipe(gulp.dest('dist/asset/css/'));
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
      plugins.if(
        '*.png',
        gulp.dest('src/cmsstatic/asset/images/'),
        gulp.dest('src/components/sprites/')
      )
    );
};

const svgSprites = () => {
  const config = {
    mode: {
      inline: true,
      symbol: {
        sprite: 'sprite.svg',
        example: false
      }
    },
    shape: {
      transform: ['svgo'],
      id: {
        generator: '%s'
      }
    },
    svg: {
      xmlDeclaration: false,
      doctypeDeclaration: false
    }
  };
  return gulp
    .src('src/cmsstatic/asset/icons/*.svg')
    .pipe(plugins.svgSprite(config))
    .pipe(plugins.flatten())
    .pipe(gulp.dest('dist/cmsstatic/asset/images/'));
};

const image = () => {
  return gulp
    .src(['src/cmsstatic/asset/images/**/*.{png,jpg,jpeg,gif}', '!**/_*/**/*', '!**/_*'])
    .pipe(plugins.plumberNotifier())
    .pipe(plugins.newer('dist/cmsstatic/asset/images/'))
    .pipe(
      plugins.if(
        isProduction,
        plugins.imagemin({
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
      .pipe(plugins.plumberNotifier())
      .pipe(gulp.dest('dist/'));
  },
  font: () => {
    return gulp
      .src([
        'src/cmsstatic/asset/fonts/**/*.{woff,woff2,eot,ttf,otf}',
        '!**/_*/**/*',
        '!**/_*'
      ])
      .pipe(plugins.plumberNotifier())
      .pipe(plugins.newer('dist/cmsstatic/asset/fonts/'))
      .pipe(plugins.flatten())
      .pipe(gulp.dest('dist/cmsstatic/asset/fonts/'));
  },
  media: () => {
    return gulp
      .src([
        'src/cmsstatic/asset/media/**/*.{mp4,ogg,webm}',
        '!**/_*/**/*',
        '!**/_*'
      ])
      .pipe(plugins.plumberNotifier())
      .pipe(plugins.newer('dist/cmsstatic/asset/media/'))
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
  });
};

const startWatchers = () => {
  gulp.watch('src/**/*.scss', styles);
  gulp.watch('src/cmsstatic/asset/images/**/*.{png,jpg,jpeg,gif}', image);
  gulp.watch('src/cmsstatic/asset/fonts/**/*.{woff,woff2,eot,ttf,otf}', copy.font);
  gulp.watch('src/cmsstatic/asset/media/**/*.{mp4,ogg,webm}', copy.media);
  gulp.watch('src/**/*.njk').on('change', (file) => {
    let task;
    if (isInclude(file)) {
      task = makeMarkupTask();
    } else {
      task = makeMarkupTask(file);
    }
    gulp.series(task, function (cb) {
      if (bs && bs.reload) {
        bs.reload();
      }
      cb();
    })();
  });
};

const copyTaskList = [copy.ico, copy.font, copy.media];
const cleanTask = gulp.parallel([clean.demo]);
const spritesTask = gulp.series([clean.sprites, sprites]);
const buildTask = gulp.parallel(makeMarkupTask(), styles, svgSprites, image);
const copyTask = gulp.parallel(copyTaskList);
const build = gulp.parallel(buildTask, copyTask);

const watchTask = gulp.series(build, startWatchers);
const serveTask = gulp.parallel(watchTask, serve);

// export { build as default, cleanTask as clean, watchTask as watch, sprites };
export {
  build as default,
  cleanTask as clean,
  watchTask as watch,
  spritesTask as sprites,
  serveTask as serve
};
