const { resolve, dirname, relative } = require('path');
const { mkdirSync, existsSync, readFileSync, writeFileSync } = require('fs');
const { createHash } = require('crypto');
const through = require('through2');
const PluginError = require('plugin-error');

/**
 * @typedef {Object} Settings
 * @property {string} algorithm
 * @property {string} file
 * @property {number} indent
 */

/** @type {Settings} */
const DEFAULTS = {
  algorithm: 'sha1',
  file: 'checksums.json',
  indent: 2
};

/**
 * @param {Settings} options
 * @returns {NodeJS.ReadWriteStream}
 */
function skipUnchanged(options = {}) {
  const settings = {
    ...DEFAULTS,
    ...options
  };

  const cwd = process.cwd();
  const checksumsFile = resolve(cwd, settings.file);
  const checksumsDir = dirname(checksumsFile);

  try {
    mkdirSync(checksumsDir, { recursive: true });
  } catch (error) {
    throw new PluginError('hash', error);
  }

  if (!existsSync(checksumsFile)) {
    writeFileSync(checksumsFile, JSON.stringify({}));
  }

  let checksums;

  try {
    const checksumsFileContent = readFileSync(checksumsFile, 'utf8');

    if (checksumsFileContent) {
      checksums = JSON.parse(checksumsFileContent);
    }
  } catch (error) {
    throw new PluginError('skipUnchanged', error);
  }

  return through.obj(function (file, _, cb) {
    const filePath = file.path;
    const key = relative(cwd, filePath);
    const fileChecksum = createHash(settings.algorithm)
      .update(file.contents.toString())
      .digest('hex');

    if (checksums[key] === fileChecksum) {
      // console.log('file unchanged:', key);
      cb(null, null);
      return;
    }

    checksums[key] = fileChecksum;

    try {
      console.log('file changed:', key);
      writeFileSync(
        checksumsFile,
        JSON.stringify(checksums, null, settings.indent)
      );
      cb(null, file);
    } catch (error) {
      throw new PluginError('skipUnchanged', error, { showStack: true });
    }
  });
}

module.exports = skipUnchanged;
