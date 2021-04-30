import UIModule from '../ui-module';

const defaults = {
  root: '.shell-sidebar',
  activeClass: 'active'
};

const modalDefault = {
  dim: true,
  opener: null,
  esc: true,
  timer: null,
  dimClose: true
};

export default class Sidebar extends UIModule {
  constructor(params = {}) {
    super({
      ...defaults,
      ...params
    });

    // const sidebar = this;
    // this.listen('hideHeader', () => {
    //   header.hide();
    // });
    // this.listen('showHeader', () => {
    //   header.show();
    // });
    // this.listen('toggleHeader', () => {
    //   header.toggle();
    // });
    // this.listen('scroll', (scrollY) => {
    //   console.log('scroll', scrollY);
    // });
    const sidebar = this;
    document.addEventListener('click', (e) => {
      const { target } = e;
      const closeButton = target.closest('[data-sidebar-close]');

      if (closeButton) {
        e.preventDefault();
        sidebar.hide();
      }
    });
  }

  get isHidden() {
    return !this.root.classList.contains('active');
  }

  show() {
    this.root.classList.add('active');
    this.shout('header', 'hide');

    window.setTimeout(() => {
      this.shout('UI', 'scrollLock');
    }, 300);
  }

  hide() {
    this.root.classList.remove('active');
    window.setTimeout(() => {
      this.shout('UI', 'scrollRelease');
      this.shout('header', 'show');
    }, 300);
  }

  toggle() {
    if (this.isHidden) {
      this.show();
    } else {
      this.hide();
    }
  }
}
