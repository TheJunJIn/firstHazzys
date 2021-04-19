const defaults = {
  rootSelector: '.shell-header'
};

export default class Header {
  constructor(params = {}) {
    const options = { ...defaults, ...params };
    const root = document.querySelector(options.rootSelector);
    this.root = root;
    this.options = options;
  }
}
