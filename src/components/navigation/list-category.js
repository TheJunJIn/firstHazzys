import { throttle } from 'throttle-debounce';
import UIModule from '../ui-module';
import animate, { easeOutQuint } from '../../asset/js/_util/animate';

const states = {
  viewType: null,
  header: {
    isHidden: false,
    height: 60,
    options: {}
  }
};

const dropdownManager = {
  /** @type {HTMLElement} */
  activeDropdown: null,
  /** @returns {() => void} 이벤트 리스너를 제거하는 함수 반환 */
  init() {
    const manager = this;
    const onClick = (event) => {
      const dropdownController = event.target.closest(
        '[aria-controls][aria-expanded]'
      );
      if (dropdownController) {
        event.preventDefault();
        const dropdownId = dropdownController.getAttribute('aria-controls');
        manager.toggle(dropdownId);
      }
    };
    const onKeydown = (event) => {
      if (
        (event.key === 'Escape' || event.key === 'Esc') &&
        manager.activeDropdown
      ) {
        manager.close(manager.activeDropdown);
      }
    };

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeydown);

    return function destroy() {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeydown);
    };
  },
  /**
   * @param {string|HTMLElement} dropdown
   * @returns {Promise<HTMLElement>}
   */
  open(dropdown) {
    if (this.activeDropdown) {
      return this.close(this.activeDropdown).then(() => this.open(dropdown));
    }
    const manager = this;
    return new Promise((resolve, reject) => {
      const dropdownElement =
        typeof dropdown === 'string'
          ? document.getElementById(dropdown)
          : dropdown;

      if (!(dropdownElement instanceof HTMLElement)) {
        reject(new TypeError('드롭다운 Element를 찾을 수 없습니다.'));
      }

      if (!dropdownElement.hidden) {
        resolve(dropdownElement);
      }

      manager.activeDropdown = dropdownElement;

      const controllers = document.querySelectorAll(
        `[aria-controls="${dropdownElement.id}"][aria-expanded]`
      );
      const onTransitionEnd = () => {
        dropdownElement.focus();
        resolve(dropdownElement);
      };

      controllers.forEach((controller) => {
        controller.setAttribute('aria-expanded', true);
      });

      dropdownElement.addEventListener('transitionend', onTransitionEnd);
      dropdownElement.tabIndex = -1;
      dropdownElement.hidden = false;
      setTimeout(() => {
        dropdownElement.classList.add('is-open');
      }, 10);
    });
  },

  /**
   * @param {string|HTMLElement} dropdown
   * @returns {Promise<HTMLElement>}
   */
  close(dropdown) {
    const manager = this;
    return new Promise((resolve, reject) => {
      const dropdownElement =
        typeof dropdown === 'string'
          ? document.getElementById(dropdown)
          : dropdown;

      if (!(dropdownElement instanceof HTMLElement)) {
        reject(new TypeError('드롭다운 Element를 찾을 수 없습니다.'));
      }

      if (dropdownElement.hidden) {
        resolve(dropdownElement);
      }

      const controllers = document.querySelectorAll(
        `[aria-controls="${dropdownElement.id}"][aria-expanded]`
      );
      controllers.forEach((controller) => {
        controller.setAttribute('aria-expanded', false);
      });
      const onTransitionEnd = () => {
        manager.activeDropdown = null;
        dropdownElement.hidden = true;
        dropdownElement.removeEventListener('transitionend', onTransitionEnd);
        resolve(dropdownElement);
      };

      dropdownElement.addEventListener('transitionend', onTransitionEnd);
      dropdownElement.classList.remove('is-open');
    });
  },

  /**
   * @param {string|HTMLElement} dropdown
   * @returns {Promise<boolean>} 열었으면 `true`, 닫았으면 `false` 반환
   */
  toggle(dropdown) {
    const dropdownElement =
      typeof dropdown === 'string'
        ? document.getElementById(dropdown)
        : dropdown;

    if (!(dropdownElement instanceof HTMLElement)) {
      return Promise.reject(
        new TypeError('드롭다운 Element를 찾을 수 없습니다.')
      );
    }

    return (dropdownElement.hidden
      ? this.open(dropdownElement)
      : this.close(dropdownElement)
    ).then((element) => !element.hidden);
  }
};

class CategoryScroller extends UIModule {
  constructor(options) {
    super(options);

    if (!this.root) {
      this.destroy();
      return;
    }

    this.scrollingElement = this.root.querySelector('.category-scroller');
    this.indicatorElement = this.root.querySelector(
      '.category-scroller-indicator'
    );

    if (this.options.indicator) {
      if (!this.indicatorElement) {
        const element = document.createElement('div');
        element.classList.add('category-scroller-indicator');
        this.root.appendChild(element);
        this.indicatorElement = element;
      }

      this.indicatorFillElement = this.indicatorElement.querySelector(
        '.category-scroller-indicator-fill'
      );

      if (!this.indicatorFillElement) {
        const element = document.createElement('div');
        element.classList.add('category-scroller-indicator-fill');
        element.style.width = '100%';
        this.indicatorElement.appendChild(element);
        this.indicatorFillElement = element;
      }
    }

    const instance = this;
    const mouseState = {
      isDown: false,
      startX: null,
      startScrollLeft: null,
      reset() {
        this.isDown = false;
        this.startX = null;
        this.startScrollLeft = null;
      }
    };

    this.__listeners = {
      scroll: throttle(100, () => {
        instance.updateIndicator();
      }),
      mousedown: (event) => {
        if (instance.overflows) {
          mouseState.isDown = true;
          mouseState.startX = event.screenX;
          mouseState.startScrollLeft = instance.scrollLeft;
        }
      },
      mousemove: (event) => {
        if (mouseState.isDown) {
          event.preventDefault();
          const moved = event.screenX - mouseState.startX;
          const to = mouseState.startScrollLeft - moved;
          instance.scrollTo(to);
        }
      },
      mousereset: (event) => {
        if (mouseState.isDown) {
          const moved = event.screenX - mouseState.startX;
          const to = mouseState.startScrollLeft - moved;
          instance.scrollTo(to);
          instance.scrollingElement.classList.remove('prevent-grab');
          mouseState.reset();
        }
      }
    };
    this.update();
    this.scrollToEnd();

    const { scrollingElement, __listeners } = this;
    scrollingElement.addEventListener('scroll', this.__listeners.scroll);
    scrollingElement.addEventListener('mousedown', __listeners.mousedown);
    scrollingElement.addEventListener('mousemove', __listeners.mousemove);
    scrollingElement.addEventListener('mouseleave', __listeners.mousereset);
    document.addEventListener('mouseup', __listeners.mousereset);

    this.listen('resize', () => {
      this.update();
    });
    this.listen('load', () => {
      this.update();
      this.scrollToEnd();
      this.scrollToCurrent();

      const { maxScrollLeft } = this;

      setTimeout(() => {
        this.update();

        if (this.maxScrollLeft !== maxScrollLeft) {
          this.scrollToEnd();
          this.scrollToCurrent();
        }
      }, 100);
    });
  }

  get scrollLeft() {
    if (this.scrollingElement) {
      return this.scrollingElement.scrollLeft;
    }
  }

  set scrollLeft(x) {
    if (this.scrollingElement && typeof x === 'number') {
      this.scrollingElement.scrollLeft = x;
    }
  }

  scrollToEnd() {
    if (this.indicatorFillElement) {
      this.indicatorFillElement.style.width = '100%';
    }

    this.scrollLeft =
      this.maxScrollLeft || Number.MAX_SAFE_INTEGER || Number.MAX_VALUE;
  }

  scrollTo(to, duration = 0) {
    if (this.overflows) {
      if (typeof duration === 'number' && duration > 0) {
        animate(
          {
            from: this.scrollLeft,
            to,
            duration,
            easing: easeOutQuint
          },
          (value) => {
            this.scrollLeft = value;
          }
        );
      } else {
        this.scrollLeft = to;
      }
    }
  }

  scrollToCurrent(smooth = true) {
    if (!this.overflows) {
      return;
    }

    const current = this.root.querySelector(
      '[aria-current="page"],[aria-current="true"]'
    );

    if (current) {
      const { containerWidth } = this;
      const { offsetWidth, offsetLeft } = current;
      const targetScrollLeft = Math.max(
        0,
        offsetLeft - (containerWidth - offsetWidth) / 2
      );

      if (smooth) {
        this.scrollTo(targetScrollLeft, 1500);
      } else {
        this.scrollTo(targetScrollLeft);
      }
    }
  }

  updateIndicator() {
    if (this.options.indicator) {
      this.indicatorElement.hidden = !this.overflows;
      const {
        scrollLeft,
        indicatorFillElement,
        maxScrollLeft,
        minFillRatio
      } = this;
      indicatorFillElement.style.width =
        Math.min(
          minFillRatio + (1 - minFillRatio) * (scrollLeft / maxScrollLeft),
          1
        ) *
          100 +
        '%';
    }
  }

  update() {
    const { scrollingElement } = this;
    const containerWidth = scrollingElement.getBoundingClientRect().width;
    const { scrollWidth } = scrollingElement;

    this.containerWidth = containerWidth;
    this.overflows = scrollWidth > containerWidth;
    this.maxScrollLeft = scrollWidth - containerWidth;
    this.minFillRatio = containerWidth / scrollWidth;
    this.updateIndicator();

    if (this.overflows) {
      scrollingElement.classList.add('overflows');
    } else {
      scrollingElement.classList.remove('overflows');
    }
    this.shout(this.name + ':overflows', !!this.overflows);
  }

  destroy() {
    const { scrollingElement, __listeners } = this;
    if (__listeners) {
      if (scrollingElement) {
        ['scroll', 'mousedown', 'mousemove'].forEach((type) => {
          if (type in __listeners) {
            scrollingElement.removeEventListener(type, __listeners[type]);
          }
        });
        scrollingElement.removeEventListener(
          'mouseleave',
          __listeners.mousereset
        );
      }
      document.removeEventListener('mouseup', __listeners.mousereset);
      delete this.__listeners;
    }
    super.destroy();
  }
}

class CategoryNavigation extends UIModule {
  constructor() {
    super({ name: 'catNav', root: '.category-navigation' });

    if (!this.root) {
      this.destroy();
      return;
    }

    this.fixedNav = this.root.querySelector('.category-fixed-nav');

    this.subNav = {
      depth1: new CategoryScroller({
        name: 'catSubNav_depth_1',
        root: '.category-sub-nav_depth_1',
        indicator: true
      }),
      depth2: new CategoryScroller({
        name: 'catSubNav_depth_2',
        root: '.category-sub-nav_depth_2'
      }),
      depth3: new CategoryScroller({
        name: 'catSubNav_depth_3',
        root: '.category-sub-nav_depth_3'
      })
    };

    this.report('viewType').then(({ viewType }) => {
      states.viewType = viewType;
    });
    this.report('header').then((state) => {
      states.header = Object.assign({}, state);
    });
    this.listen('viewTypeChanged', ({ value }) => {
      states.viewType = value;
    });
    this.listen('catSubNav_depth_1:overflows', (value) => {
      if (value) {
        this.root.classList.add('main-nav-overflows');
      } else {
        this.root.classList.remove('main-nav-overflows');
      }
    });

    this.update();
    this._destroyDropdownManager = dropdownManager.init();
    this.listen('scroll', ({ scrollY }) => {
      this.isFixed = scrollY > this.height;
    });
    this.listen('resize', () => {
      this.update();
    });
    this.listen('viewTypeChanged', ({ value }) => {
      if (value !== 'mobile') {
        this.root.classList.remove('is-fixed');
      }
      this.update();
    });
  }

  set isFixed(value) {
    if (value && states.viewType === 'mobile') {
      this.root.classList.add('is-fixed');
    } else {
      this.root.classList.remove('is-fixed');
    }
  }

  update() {
    this.height = this.root.getBoundingClientRect().height;
    this.isFixed = (window.scrollY || window.pageYOffset) > this.height;
    this.shout('header', [
      'setOption',
      'hideOnScrollAfter',
      this.height + states.header.height
    ]);
  }

  destroy() {
    this._distroyDropdownManager?.();
    super.destroy();
  }
}

export default CategoryNavigation;
