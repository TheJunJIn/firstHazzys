import UIModule from '../ui-module';

const defaults = {
  root: '.top-button',
  showAfter: () => window.innerHeight,
  bottomOffset: 0
};

class TopButton extends UIModule {
  constructor(params = {}) {
    super({
      ...defaults,
      ...params
    });

    if (!this.root) {
      this.destroy();
      return;
    }

    this.isEnabled = true;
    this.bottomOffset = this.options.bottomOffset;
    this.showAfter = this.options.showAfter();

    this.root.addEventListener('click', (event) => {
      event.preventDefault();
      this.scrollToTop();
    });

    this.listen('resize', () => {
      this.showAfter = this.options.showAfter();
      this.toggle();
    });
    this.listen('scroll', ({ scrollY }) => {
      this.toggle(scrollY);
    });
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.hide();
    this.isEnabled = false;
  }

  /**
   * 하단 여백 조정 필요 시 사용
   *
   * @param {number} value
   * @example
   * module.shout('topButton', ['setBottomOffset', 100]);
   */
  setBottomOffset(value) {
    if (typeof value !== 'number') {
      return;
    }

    this.bottomOffset = value;

    if (value > 0) {
      this.root.style.transform = `translateY(-${value}px)`;
    } else {
      this.root.style.transform = '';
    }
  }

  show() {
    if (this.isEnabled) {
      this.root?.classList.add('is-active');
    }
  }

  hide() {
    if (this.isEnabled) {
      this.root?.classList.remove('is-active');
    }
  }

  toggle(scrollY = window.scrollY || window.pageYOffset) {
    if (this.isEnabled) {
      if (scrollY > this.showAfter) {
        this.show();
      } else {
        this.hide();
      }
    }
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  destroy() {
    super.destroy();
  }
}

export default TopButton;
