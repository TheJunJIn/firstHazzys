import UIModule from '../ui-module';

const defaults = {
  root: '.shell-sidebar',
  activeClass: 'active'
};

export default class Sidebar extends UIModule {
  constructor(params = {}) {
    super({
      ...defaults,
      ...params
    });

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
    this.root?.classList.add('active');
    this.shout('header', 'hide');

    window.setTimeout(() => {
      this.shout('scrollLock', 'lock');
    }, 300);
  }

  hide() {
    this.root?.classList.remove('active');
    window.setTimeout(() => {
      this.shout('scrollLock', 'release');
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
