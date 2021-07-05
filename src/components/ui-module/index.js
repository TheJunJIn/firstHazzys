import ShoutAndListen from '../../asset/js/_util/shout-and-listen';

/**
 * @typedef {Object} UIModuleOptions
 * @property {string} [name]
 * @property {(Element|string)} [root]
 */

/**
 * @typedef {Object} UIMessage
 * @property {string} message
 * @property {*} [detail]
 */

class UIModule extends ShoutAndListen {
  /**
   * @param {UIModuleOptions} [options]
   */
  constructor(options = {}) {
    const { name, root, state, ...rest } = options;

    super(name);

    this.options = rest || {};

    /** @type {Element} */
    this.root;

    if (typeof root === 'string') {
      this.root = document.querySelector(root);
    } else if (root instanceof Element) {
      this.root = root;
    }

    if (root && !this.root) {
      this.destroy();
      return;
    }
  }

  /**
   * @param {string} key
   * @param {*} value
   */
  setOption(key, value) {
    this.options[key] = value;
  }

  /**
   * @param {string} key
   * @returns {*}
   */
  getOption(key) {
    return this.options[key];
  }

  destroy() {
    super.destroy();
  }
}

export default UIModule;
