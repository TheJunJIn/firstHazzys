const { readFileSync } = require('fs');

function readJson(path) {
  try {
    const content = readFileSync(path, { encoding: 'utf8' });
    return JSON.parse(content);
  } catch (error) {
    throw error;
  }
}

module.exports = readJson;
