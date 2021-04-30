import UIModule from '../ui-module';

export const defaults = {
  root: '.shell-header',
  hideOnScrollDown: true,
  hideOnScrollThreshold: 100
  // hideOnScrollAfter: 60 // 기본값: 헤더 높이
};

export default class Header extends UIModule {
  constructor(params = {}) {
    super({
      ...defaults,
      ...params
    });

    if (!this.root) {
      return;
    }

    if (!this.getOption('hideOnScrollAfter')) {
      this.setOption('hideOnScrollAfter', this.height);
    }

    const firstScroll = {};
    const lastScroll = {};
    const totalScroll = {};

    const toggleHeaderIfNeeded = (scrollY, time) => {
      const delta = {
        pos: scrollY - lastScroll.pos,
        time: time - lastScroll.time
      };

      if (delta.pos === 0) {
        return;
      }

      const direction = delta.pos > 0 ? 'down' : 'up';

      lastScroll.pos = scrollY;
      lastScroll.time = time;
      totalScroll.distance = scrollY - firstScroll.pos;
      totalScroll.duration = time - firstScroll.time;

      const {
        hideOnScrollDown,
        hideOnScrollThreshold,
        hideOnScrollAfter
      } = this.options;

      if (hideOnScrollDown) {
        const passedThreshold =
          Math.abs(totalScroll.distance) > hideOnScrollThreshold;
        const { isHidden } = this;

        if (scrollY > hideOnScrollAfter) {
          if (passedThreshold) {
            if (direction === 'down' && !isHidden) {
              this.hide();
            } else if (direction === 'up' && isHidden) {
              this.show();
            }
          }
        } else if (this.isHidden) {
          this.show();
        }
      } else if (this.isHidden) {
        this.show();
      }
    };

    this.listen('scrollStart', ({ scrollY, time }) => {
      firstScroll.pos = scrollY;
      firstScroll.time = time;
      lastScroll.pos = scrollY;
      lastScroll.time = time;
    });

    this.listen('scroll', ({ scrollY, time }) => {
      toggleHeaderIfNeeded(scrollY, time);
    });

    this.listen('scrollEnd', ({ scrollY, time }) => {
      toggleHeaderIfNeeded(scrollY, time);

      firstScroll.pos = null;
      firstScroll.time = null;
      lastScroll.pos = null;
      lastScroll.time = null;
      totalScroll.pos = null;
      totalScroll.time = null;
    });
  }

  get isHidden() {
    return this.root.classList.contains('is-hidden');
  }

  get height() {
    return this.root.getBoundingClientRect().height;
  }

  show() {
    if (this.isHidden) {
      document.documentElement.classList.remove('header_is_hidden');
      this.root.classList.remove('is-hidden');
      this.shout('headerIsHidden', false);
    }
  }

  hide() {
    if (!this.isHidden) {
      document.documentElement.classList.add('header_is_hidden');
      this.root.classList.add('is-hidden');
      this.shout('headerIsHidden', true);
    }
  }

  toggle() {
    if (this.isHidden) {
      this.show();
    } else {
      this.hide();
    }
  }

  reportback() {
    this.shout('report:header', {
      isHidden: this.isHidden,
      height: this.height,
      options: this.options
    });
  }
}
