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
import { createEnv, layoutToExtends, middleware } from './utils/nunjucks-env';
import readJson from './utils/read-json';
import through from 'through2';
import skipUnchanged from './utils/skip-unchanged';

sass.compiler = nodeSass;
const isProduction = process.env.NODE_ENV === 'production';
const plugins = gulpLoadPlugins();

const clean = {
  demo: () => del('dist'),
  uiPublish: () => del('ui-publish'),
  sprites: () =>
    del([
      'src/cmsstatic/asset/images/sprite-*.png',
      'src/components/sprites/*.scss'
    ]),
  checksums: {
    all: () => del('dist/*.checksums.json'),
    markup: () => del('dist/markup.checksums.json'),
    styles: () => del('dist/styles.checksums.json')
  }
};

const markup = () => {
  const SRC = path.resolve(__dirname, 'src');
  const njk = {
    path: {
      layout: path.resolve(SRC, 'layouts'),
      data: path.resolve(SRC, '_data')
    },
    data: {},
    layout: {},
    env: createEnv(),
    destFilter: plugins.filter(['src/**/*', '!src/{layouts,components}/**'])
  };
  njk.data.site = readJson(path.resolve(njk.path.data, 'site.json'));
  njk.data.categories = readJson(
    path.resolve(njk.path.data, 'categories.json')
  );

  return gulp
    .src(['src/**/*.njk', '!src/{layouts,components}/**/*.njk'])
    .pipe(plugins.plumberNotifier())
    .pipe(skipUnchanged({ file: 'dist/markup.checksums.json' }))
    .pipe(plugins.data((file) => layoutToExtends(njk, file)))
    .pipe(plugins.nunjucks.compile(njk.data, { env: njk.env }))
    .pipe(njk.destFilter)
    .pipe(plugins.prettier())
    .pipe(gulp.dest('dist/'));
};

const styles = () => {
  return (
    gulp
      .src(['src/asset/css/**/*.scss', '!**/_*/**/*', '!**/_*'])
      .pipe(plugins.plumberNotifier())
      .pipe(skipUnchanged({ file: 'dist/styles.checksums.json' }))
      // .pipe(plugins.newer('dist/asset/css/'))
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
      .pipe(gulp.dest('dist/asset/css/'))
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
    .src([
      'src/cmsstatic/asset/images/**/*.{png,jpg,jpeg,gif}',
      '!**/_*/**/*',
      '!**/_*'
    ])
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
    middleware
  });
};

const startWatchers = () => {
  gulp.watch(['src/asset/css/**/*.scss', '!**/_*/**/*', '!**/_*'], styles);
  gulp.watch(
    ['src/**/_*.scss', 'src/**/_*/**/*.scss', 'src/components/**/*.scss'],
    gulp.series(clean.checksums.styles, styles)
  );
  gulp.watch('src/cmsstatic/asset/images/**/*.{png,jpg,jpeg,gif}', image);
  gulp.watch(
    'src/cmsstatic/asset/fonts/**/*.{woff,woff2,eot,ttf,otf}',
    copy.font
  );
  gulp.watch('src/cmsstatic/asset/media/**/*.{mp4,ogg,webm}', copy.media);
  // gulp.watch(['src/**/*.njk', '!src/{layouts,components}/**/*.njk'], markup);
  // gulp.watch(
  //   'src/{layouts,components}/**/*.njk',
  //   gulp.series(clean.checksums.markup, markup)
  // );
  gulp.watch('src/**/*.njk').on('change', () => {
    if (bs && bs.active) {
      bs.reload();
    }
  });
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
const cleanTask = gulp.parallel([clean.demo, clean.checksums.all]);
const spritesTask = gulp.series([clean.sprites, sprites]);
const buildTask = gulp.parallel(markup, styles, svgSprites, image);
const copyTask = gulp.parallel(copyTaskList);
const build = gulp.parallel(buildTask, copyTask);

const watchTask = gulp.series(
  gulp.parallel(styles, svgSprites, image),
  startWatchers
);
const serveTask = gulp.parallel(watchTask, serve);

// export { build as default, cleanTask as clean, watchTask as watch, sprites };
export {
  build as default,
  cleanTask as clean,
  watchTask as watch,
  spritesTask as sprites,
  serveTask as serve,
  uiPublish as publish
};
