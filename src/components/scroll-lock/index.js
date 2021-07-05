import UIModule from '../ui-module';
import getScrollbarWidth from '../../asset/js/_util/get-scrollbar-width';

const defaults = {
  root: '.app',
  activeClass: 'scroll-lock'
};

export default class ScrollLock extends UIModule {
  constructor(params = {}) {
    super({ ...defaults, ...params });
    this.scrollLocked = false;
  }
  lock() {
    const { root, options } = this;
    const { body } = document;
    const { scrollY, pageYOffset } = window;
    const scrollbar = getScrollbarWidth();

    body.classList.add(options.activeClass);
    body.style.position = 'fixed';
    body.style.top = `-${scrollY || pageYOffset}px`;
    root.style.paddingRight = `${scrollbar}px`;
    this.scrollLocked = true;
  }
  release() {
    const { root, options } = this;
    const { body } = document;
    const scrollY = body.style.top;
    body.classList.remove(options.activeClass);
    body.style.position = '';
    body.style.top = '';
    body.style.right = '';
    root.style.paddingRight = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
    this.scrollLocked = false;
  }
  reportback() {
    this.shout('report:scrollLock', {
      scrollLocked: this.scrollLocked
    });
  }
}
