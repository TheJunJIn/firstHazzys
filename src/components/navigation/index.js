import UIModule from '../ui-module';
import Category from './category';
const anime = window.anime;

const defaults = {
  root: '.shell-navigation',
  containerSelector: '.navigation-container',
  buttonSelector: '[data-nav-toggle]',
  activeClass: 'active'
};

export default class Navigation extends UIModule {
  constructor(params = {}) {
    const options = { ...defaults, ...params };
    super(options);

    const { root } = this;

    if (!root) {
      this.destroy();
      return;
    }


    this.viewType = null;
    this.inProgress = false;

    this.report('viewType').then(({ viewType }) => {
      this.viewType = viewType;
    });

    this.listen('viewTypeChanged', async ({ value }) => {
      this.viewType = value;
      if (value === 'desktop') {
        this.reset();
      }
    });

    const container = root && root.querySelector(options.containerSelector);
    this.category = new Category({ name: 'category' });

    if (root) {
      const buttons = document.querySelectorAll(options.buttonSelector);
      buttons.forEach((button) => {
        button.addEventListener('click', (e) => {
          if (!this.inProgress) {
            e.preventDefault();
            const action = button.dataset.navToggle
              ? button.dataset.navToggle
              : 'toggle';
            try {
              this?.[action]?.();
            } catch (e) {
              console.log('[Error]: ', e);
            }
          }
        });
      });
      document.addEventListener('keyup', (e) => {
        if ((e.key === 'Escape' || e.key === 'Esc') && this.isActive) {
          const { mobile } = this.category.states;
          if (mobile.opened.length) {
            this.category.out();
          } else {
            this.hide();
          }
        }
      });
    }
    this.container = container;
  }

  get isActive(){
    return this.root.classList.contains(this.options.activeClass);
  }
  async show(withoutAnimation = false) {
    const { root, container, options } = this;

    if (this.viewType !== 'mobile' || this.inProgress || this.isActive) {
      return false;
    }

    this.inProgress = true;

    if (!withoutAnimation) {
      anime({
        targets: root,
        left: [
          { value: '100%', easing: 'linear', duration: 10 },
          { value: 0, easing: 'linear', duration: 10 }
        ],
        opacity: [
          { value: 0, easing: 'linear', duration: 10 },
          { value: 1, easing: 'linear', duration: 200 }
        ]
      });
      await anime({
        targets: container,
        translateX: [
          { value: '100%', easing: 'linear', duration: 10 },
          { value: 0, easing: 'easeOutQuad', duration: 300 }
        ]
      }).finished;
    }
    root.classList.add(options.activeClass);
    this.inProgress = false;
    this.shout('scrollLock', 'lock');
  }
  async hide(withoutAnimation = false) {
    const { root, container, options } = this;

    if (!this.isActive) {
      return false;
    }

    this.inProgress = true;

    if (!withoutAnimation) {
      await anime({
        targets: container,
        translateX: [
          { value: 0, easing: 'easeOutQuad', duration: 0 },
          { value: '100%', easing: 'linear', duration: 400 }
        ],
        complete: (anim) => {
          anime({
            targets: root,
            opacity: [
              { value: 1, easing: 'linear', duration: 10 },
              { value: 0, easing: 'linear', duration: 200 }
            ],
            left: [
              { value: 0, easing: 'linear', duration: 200 },
              { value: '100%', easing: 'linear', duration: 10 }
            ]
          });
        }
      }).finished;
    }

    root.classList.remove(options.activeClass);
    this.inProgress = false;
    this.shout('scrollLock', 'release');

    this.category.reset('mobile');
  }
  toggle() {
    if (this.isActive) {
      this.hide();
    } else {
      this.show();
    }
  }
  async reset() {
    const { root, container } = this;
    root.style.left = '';
    root.style.opacity = '';
    container.style.transform = '';
    await this.hide(true);
  }
  destroy() {
    super.destroy();
  }
}
