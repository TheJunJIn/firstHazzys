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
  },
  subCategory(category, name) {
    if (!Array.isArray(category)) {
      throw new TypeError(`${category}는 배열이 아닙니다.`);
    }
    if (typeof name !== "string") {
      throw new TypeError(`${name}은 문자열이 아닙니다.`);
    }
    name = name.toLowerCase();
    return category.filter((sub) => {
      if (typeof sub.name === 'string') {
        return sub.name.toLowerCase() === name;
      }
      if (sub.name && typeof sub.name.eng === "string" && typeof sub.name.kor === "string") {
        return (
          sub.name.eng.toLowerCase() === name ||
          sub.name.kor.toLowerCase() === name
        );
      }
    });
  }
};
