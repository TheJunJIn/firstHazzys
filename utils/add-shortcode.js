const nunjucks = require('nunjucks');

function normalizeShortcodeContext(context) {
  const obj = {};
  if (context.ctx && context.ctx.page) {
    obj.page = context.ctx.page;
  }
  return obj;
}

function convertErrorToString(error) {
  return JSON.stringify({
    message: error.message,
    stack: error.stack
  });
}

function addShortcode(njkEnv, shortcodeName, shortcodeFn, isAsync = false) {
  function ShortcodeFunction() {
    this.tags = [shortcodeName];

    this.parse = function (parser, nodes, lexer) {
      let args;
      let tok = parser.nextToken();

      args = parser.parseSignature(true, true);

      // Nunjucks bug with non-paired custom tags bug still exists even
      // though this issue is closed. Works fine for paired.
      // https://github.com/mozilla/nunjucks/issues/158
      if (args.children.length === 0) {
        args.addChild(new nodes.Literal(0, 0, ''));
      }

      parser.advanceAfterBlockEnd(tok.value);
      if (isAsync) {
        return new nodes.CallExtensionAsync(this, 'run', args);
      }
      return new nodes.CallExtension(this, 'run', args);
    };

    this.run = function (...args) {
      let resolve;
      if (isAsync) {
        resolve = args.pop();
      }

      let [context, ...argArray] = args;

      if (isAsync) {
        shortcodeFn
          .call(normalizeShortcodeContext(context), ...argArray)
          .then(function (returnValue) {
            resolve(null, new nunjucks.runtime.SafeString(returnValue));
          })
          .catch(function (e) {
            resolve(
              new Error(
                `Error with Nunjucks shortcode \`${shortcodeName}\`${convertErrorToString(
                  e
                )}`
              ),
              null
            );
          });
      } else {
        try {
          return new nunjucks.runtime.SafeString(
            shortcodeFn.call(normalizeShortcodeContext(context), ...argArray)
          );
        } catch (e) {
          throw new Error(
            `Error with Nunjucks shortcode \`${shortcodeName}\`${convertErrorToString(
              e
            )}`
          );
        }
      }
    };
  }

  njkEnv.addExtension(shortcodeName, new ShortcodeFunction());
}

module.exports = addShortcode;
