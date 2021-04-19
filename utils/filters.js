const util = require('util');
const path = require('path');
const validUrl = require('valid-url');

function normalizeUrlPath(...urlPaths) {
  const urlPath = path.posix.join(...urlPaths);
  return urlPath.replace(/\/+$/, '/');
}

module.exports = {
  log: (data) =>
    console.log(
      `=====================================\n\n${util.inspect(
        data
      )}\n\n=====================================`
    ),
  url(url, pathPrefix) {
    // work with undefined
    url = url || '';

    if (
      validUrl.isUri(url) ||
      url.indexOf('http://') === 0 ||
      url.indexOf('https://') === 0
    ) {
      return url;
    }

    if (pathPrefix === undefined || typeof pathPrefix !== 'string') {
      pathPrefix = '/';
    }

    let normUrl = normalizeUrlPath(url);
    let normRootDir = normalizeUrlPath('/', pathPrefix);
    let normFull = normalizeUrlPath('/', pathPrefix, url);
    let isRootDirTrailingSlash =
      normRootDir.length && normRootDir.charAt(normRootDir.length - 1) === '/';

    // minor difference with straight `normalize`, "" resolves to root dir and not "."
    // minor difference with straight `normalize`, "/" resolves to root dir
    if (normUrl === '/' || normUrl === normRootDir) {
      return normRootDir + (!isRootDirTrailingSlash ? '/' : '');
    } else if (normUrl.indexOf('/') === 0) {
      return normFull;
    }

    return normUrl;
  }
};
