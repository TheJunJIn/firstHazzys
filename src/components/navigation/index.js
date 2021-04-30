import anime from 'animejs/lib/anime.es.js';
import UIModule from '../ui-module';
import Category from './category';
const defaults = {
  root: '.shell-navigation',
  containerSelector: '.navigation-container',
  buttonSelector: '[data-nav-toggle]',
  activeClass: 'active',
  isActive: false
};

export default class Navigation extends UIModule {
  constructor(params = {}) {
    const options = { ...defaults, ...params };
    super(options);

    const { root } = this;
    const container = root && root.querySelector(options.containerSelector);
    this.category = new Category({ name: 'category' });

    if (root) {
      const buttons = document.querySelectorAll(options.buttonSelector);
      buttons.forEach((button) => {
        button.addEventListener('click', (e) => {
          if (this.enable) {
            e.preventDefault();
            const action = button.dataset.navToggle
              ? button.dataset.navToggle
              : this.isActive
              ? 'hide'
              : 'show';
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
          if(mobile.opened.length){
            this.category.out();
          } else {
            this.hide();
          }
        }
      });
    }
    this.container = container;
    this.enable = true;

    this.listen('viewTypeChanged', async ({ value, oldValue }) => {
      const enable = value === 'mobile' ? true : false;
      if (!enable && oldValue) {
        await this.reset();
      }
      this.enable = enable;
    });
  }
  async show(withoutAnimation = false) {
    const { root, container, options } = this;
    this.enable = false;
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
    this.isActive = true;
    this.enable = true;
    this.shout('UI', 'scrollLock');
  }
  async hide(withoutAnimation = false) {
    const { root, container, options } = this;
    this.enable = false;
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
    this.isActive = false;
    this.enable = true;
    this.shout('UI', 'scrollRelease');
    this.category.reset('mobile');
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
