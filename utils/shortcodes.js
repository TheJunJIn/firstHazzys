const fs = require('fs');
const path = require('path');
const { outdent } = require('outdent');

const iconDefaultSize = 24;
const manifestPath = path.resolve(__dirname, '../dist/asset/manifest.json');

module.exports = {
  // Allow embedding webpack assets pulled out from `manifest.json`
  // {% webpack "main.css" %}
  webpack: (name) => {
    try {
      const data = fs.readFileSync(manifestPath, { encoding: 'utf8' });
      return JSON.parse(data)[name];
    } catch (e) {
      return `/asset/js/${name}`;
    }
  },

  // Allow embedding svg icon
  // {% icon "github.svg", "my-class", [24, 24] %}
  icon: (name, className, size = iconDefaultSize, title) => {
    if (!Array.isArray(size)) size = [size];
    return outdent({ newline: '' })`
    <svg class="svg-icon svg-icon--${name} ${
      className || ''
    }" role="img" aria-hidden="true" width="${size[0]}" height="${
      size[1] || size[0]
    }" ${title ? `title="${title}"` : ''}>
      ${title ? `<title>${title}</title>` : ''}
      <use xlink:href="/cmsstatic/asset/images/sprite.svg#${name}"></use>
    </svg>`;
  }
};
