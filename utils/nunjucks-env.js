const path = require('path');
const { readFileSync } = require('fs');
const nunjucks = require('nunjucks');
const matter = require('gray-matter');
const outdent = require('outdent');
const addShortcode = require('./add-shortcode');
const shortcodes = require('./shortcodes');
const filters = require('./filters');
const globals = require('./nunjucks-globals');
const HighlightExtension = require('./highlight');
const readJson = require('./read-json');

/** @returns {nunjucks.Environment} */
function createEnv() {
  const env = new nunjucks.Environment([
    new nunjucks.FileSystemLoader([
      'src/',
      'src/pages/',
      'src/guide/',
      'src/layouts/',
      'src/components/'
    ])
  ]);
  Object.entries(shortcodes).forEach(([key, shortcode]) => {
    addShortcode(env, key, shortcode);
  });
  Object.entries(filters).forEach(([key, filter]) => {
    env.addFilter(key, filter);
  });
  Object.entries(globals).forEach(([key, value]) => {
    env.addGlobal(key, value);
  });
  env.addExtension('HighlightExtension', new HighlightExtension());

  return env;
}

/**
 * @param {string} src
 * @param {nunjucks.Environment} env
 * @returns {nunjucks.Template}
 */
function compileTemplate(src, env) {
  return nunjucks.compile(src, env);
}

function layoutToExtends(njk, file) {
  const fileIsString = typeof file === 'string';
  const fileContents = fileIsString ? file : file.contents.toString();
  const { content, data } = matter(fileContents);
  let newContent = content;

  if (typeof data.layout === 'string') {
    const layoutName = path.basename(data.layout, '.njk');

    if (layoutName in njk.layout) {
      data.layout = njk.layout[layoutName];
    } else {
      const layoutPath = path.resolve(njk.path.layout, layoutName + '.njk');
      const layoutSrc = readFileSync(layoutPath, 'utf8');
      const compiledLayout = compileTemplate(layoutSrc, njk.env);
      njk.layout[layoutName] = compiledLayout;
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

  if (fileIsString) {
    return newContent;
  }

  file.contents = Buffer.from(newContent);
  return data || {};
}

/**
 * @param {string} path
 * @returns {boolean}
 */
function isInclude(path) {
  const normalizedPath = path.replace(/\\/g, '/');
  return !!['src/layouts/', 'src/components/'].find(
    (includePath) => normalizedPath.indexOf(includePath) > -1
  );
}

function middleware(req, res, next) {
  const SRC = path.resolve(process.cwd(), 'src');
  const njk = {
    path: {
      layout: path.resolve(SRC, 'layouts'),
      data: path.resolve(SRC, '_data')
    },
    data: {},
    layout: {},
    env: createEnv()
  };
  njk.data.site = readJson(path.resolve(njk.path.data, 'site.json'));
  njk.data.categories = readJson(
    path.resolve(njk.path.data, 'categories.json')
  );

  let pathname = req.url;

  if (pathname.endsWith('/')) {
    pathname += 'index.html';
  }

  if (pathname.endsWith('.html')) {
    const njkPath = path.resolve(
      SRC,
      pathname.replace(/^\//, '').replace('.html', '.njk')
    );

    let fileContents;

    try {
      fileContents = readFileSync(njkPath, { encoding: 'utf8' });
      fileContents = layoutToExtends(njk, fileContents);
    } catch (error) {
      console.error(error);
      next();
      return;
    }

    const env = createEnv();
    return env.renderString(fileContents, njk.data, (error, result) => {
      console.log('[njk]', njkPath);
      res.setHeader('Content-Type', 'text/html');
      res.end(result);
    });
  }

  next();
}

module.exports = {
  createEnv,
  compileTemplate,
  layoutToExtends,
  isInclude,
  middleware
};
