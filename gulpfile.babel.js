import { readFileSync } from 'fs';
import path from 'path';
import del from 'del';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import sass from 'gulp-sass';
import nodeSass from 'node-sass';
import autoprefixer from 'autoprefixer';
import postcssClean from 'postcss-clean';
import spritesmith from 'gulp.spritesmith-multi';
import matter from 'gray-matter';
import outdent from 'outdent';
import nunjucks from 'nunjucks';
import addShortcode from './utils/add-shortcode';
import filters from './utils/filters';
import shortcodes from './utils/shortcodes';
import HighlightExtension from './utils/highlight';
import browserSync from 'browser-sync';

sass.compiler = nodeSass;
const isProduction = process.env.NODE_ENV === 'production';
const plugins = gulpLoadPlugins();

const clean = {
  demo: () => del('dist'),
  sprites: () =>
    del(['src/cmsstatic/asset/images/sprite-*.png', 'src/components/sprites/*.scss'])
};

const markup = () => {
  const env = new nunjucks.Environment([
    new nunjucks.FileSystemLoader([
      'src/',
      'src/pages/',
      'src/guide/',
      'src/layouts/',
      'src/components/'
    ])
  ]);
  Object.keys(shortcodes).forEach((key) => {
    addShortcode(env, key, shortcodes[key]);
  });
  Object.keys(filters).forEach((key) => {
    env.addFilter(key, filters[key]);
  });
  env.addExtension('HighlightExtension', new HighlightExtension());

  const LAYOUT_ROOT = path.resolve(__dirname, 'src', 'layouts');
  const pageFilter = plugins.filter([
    'src/**/*',
    '!src/layouts/**',
    '!src/components/**'
  ]);
  const globalData = {
    site: JSON.parse(
      readFileSync('./src/_data/site.json', { encoding: 'utf-8' })
    ),
    layout: {}
  };

  return gulp
    .src(['src/**/*.njk', '!src/layouts/**/*.njk', '!src/components/**/*.njk'])
    .pipe(plugins.plumberNotifier())
    .pipe(
      plugins.data((file) => {
        const { content, data } = matter(file.contents.toString());
        let newContent = content;

        if (typeof data.layout === 'string') {
          const layoutName = path.basename(data.layout, '.njk');

          if (layoutName in globalData.layout) {
            data.layout = globalData.layout[layoutName];
          } else {
            const layoutPath = path.resolve(LAYOUT_ROOT, layoutName + '.njk');
            const layoutSrc = readFileSync(layoutPath, 'utf8');
            const compiledLayout = nunjucks.compile(layoutSrc, env);
            globalData.layout[layoutName] = compiledLayout;
            data.layout = compiledLayout;
          }
        }

        if (data.layout) {
          newContent = outdent`
            {% extends layout %}
            {% block content %}
            ${content}
            {% endblock %}
            `;
        }

        file.contents = Buffer.from(newContent);
        return data || {};
      })
    )
    .pipe(
      plugins.nunjucks.compile(globalData, {
        env
      })
    )
    .pipe(pageFilter)
    .pipe(plugins.prettier())
    .pipe(gulp.dest('dist/'));
};

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

const serve = () => {
  const bs = browserSync.create();

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

const watch = () => {
  gulp.watch('src/**/*.scss', styles);
  gulp.watch('src/cmsstatic/asset/images/**/*.{png,jpg,jpeg,gif}', image);
  gulp.watch('src/cmsstatic/asset/fonts/**/*.{woff,woff2,eot,ttf,otf}', copy.font);
  gulp.watch('src/cmsstatic/asset/media/**/*.{mp4,ogg,webm}', copy.media);
  gulp.watch('src/**/*.njk', markup);
};

const copyTaskList = [copy.ico, copy.font, copy.media];
const cleanTask = gulp.parallel([clean.demo]);
const spritesTask = gulp.series([clean.sprites, sprites]);
const buildTask = gulp.parallel(markup, styles, svgSprites, image);
const copyTask = gulp.parallel(copyTaskList);
const build = gulp.parallel(buildTask, copyTask);

const watchTask = gulp.series(build, watch);
const serveTask = gulp.parallel(watchTask, serve);

// export { build as default, cleanTask as clean, watchTask as watch, sprites };
export {
  build as default,
  cleanTask as clean,
  watchTask as watch,
  spritesTask as sprites,
  serveTask as serve
};
