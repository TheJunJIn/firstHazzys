import UIModule from '../ui-module';

const defaults = {
  root: '.shell-header'
};

export default class Header extends UIModule {
  constructor(params = {}) {
    super({
      ...defaults,
      ...params
    });

    const header = this;
    this.listen('hideHeader', () => {
      header.hide();
    });
    this.listen('showHeader', () => {
      header.show();
    });
    this.listen('toggleHeader', () => {
      header.toggle();
    });
    this.listen('scroll', (scrollY) => {
      // console.log('scroll', scrollY);
    });
  }

  get isHidden() {
    return this.root.classList.contains('is-hidden');
  }

  show() {
    this.root.classList.remove('is-hidden');
  }

  hide() {
    this.root.classList.add('is-hidden');
  }

  toggle() {
    if (this.isHidden) {
      this.show();
    } else {
      this.hide();
    }
  }
}
