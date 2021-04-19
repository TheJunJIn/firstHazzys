const $ = window.jQuery;

const defaults = {
  rootSelector: '[data-foldable]',
  buttonSelector: '[data-foldable-toggle]',
  contentSelector: '[data-foldable-content]',
  contentTargetSelector: 'foldableToggle',
  activeClass: 'active'
};

export default class FoldableController {
  constructor(params = {}) {
    const options = { ...defaults, ...params };
    this.options = options;

    document.addEventListener('click', (e) => {
      const { target } = e;
      const toggleButton = target.closest(options.buttonSelector);
      if (toggleButton) {
        const targetSelector =
          toggleButton.dataset[options.contentTargetSelector];
        const root = toggleButton.closest(options.rootSelector);
        let target;
        if (targetSelector) {
          target = document.querySelector(targetSelector);
        } else {
          target = root.querySelector(options.contentSelector);
        }
        if (target) {
          e.preventDefault();
          if (root.classList.contains(options.activeClass)) {
            toggleButton.classList.remove(options.activeClass);
            this.fold(target);
          } else {
            toggleButton.classList.add(options.activeClass);
            this.unfold(target);
          }
        }
      }
    });
  }
  fold(element) {
    const { options } = this;
    const root = element.closest(options.rootSelector);
    root.classList.remove('active');
    $(element).slideUp('fast');
  }
  unfold(element) {
    const { options } = this;
    const root = element.closest(options.rootSelector);
    root.classList.add('active');
    $(element).slideDown('fast');
  }
}
