const nunjucks = require('nunjucks');
const Prism = require('prismjs');
const outdent = require('outdent');

class HighlightExtension {
  constructor() {
    this.tags = ['highlight'];
  }

  parse(parser, nodes, lexer) {
    const tok = parser.nextToken();
    const args = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(tok.value);
    const body = parser.parseUntilBlocks('endhighlight');
    parser.advanceAfterBlockEnd();
    return new nodes.CallExtension(this, 'run', args, [body]);
  }

  run(context, lang, body) {
    const code = body();
    const highlighted = outdent`
    <pre class="language-${lang}"><code class="language-${lang}">${Prism.highlight(
      code,
      Prism.languages[lang],
      lang
    )}</code></pre>`;
    return new nunjucks.runtime.SafeString(highlighted);
  }
}

module.exports = HighlightExtension;
