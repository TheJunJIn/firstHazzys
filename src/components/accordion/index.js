import getParams from '../../asset/js/_util/get-params';
const $ = window.jQuery;

// tab: aria-expanded aria-selected
// content: aria-hidden
const defaults = {
  rootSelector: '[data-accordion]',
  itemSelector: '[data-accordion-item]',
  contentSelector: '[data-tab-content]',
  buttonSelector: '[data-tab-toggle]',
  activeClass: 'active'
};

const accordionDefault = {
  multi: true, // 한개만 열리고 나머지가 닫혀야 한다면 false
  allClose: true // 반드시 한개는 열려있어야 한다면 false
};

export default class AccordionController {
  constructor(params = {}) {
    const options = { ...defaults, ...params };
    this.options = options;

    document.addEventListener('click', (e) => {
      const { target } = e;
      const toggleButton = target.closest(options.buttonSelector);
      if (toggleButton) {
        const root = toggleButton.closest(options.rootSelector);
        const item = toggleButton.closest(options.itemSelector);
        const targetSelector = toggleButton.getAttribute('aria-controls');
        let tabpanel =
          targetSelector && document.querySelector(`#${targetSelector}`);

        if (!tabpanel) {
          tabpanel = item && item.querySelector(options.contentSelector);
        }

        if (tabpanel) {
          this.toggle({
            tab: toggleButton,
            item,
            tabpanel,
            option: {
              ...accordionDefault,
              ...getParams(root.dataset.accordion)
            }
          });
        }
      }
    });
  }
  toggle(accordion) {
    const { options } = this;
    const { tab, item, tabpanel, option } = accordion;

    if (!item.classList.contains(options.activeClass)) {
      this.show(accordion);
      if (!option.multi) {
        // [TODO] 나머지 모두 닫기
        // show,hide 메소드의 accordion인자 구조를 변경도 고려
      }
    } else {
      // 모두 닫아야 한다면 닫기(1개는 반드시 열려있어야 한다면 닫지 않음)
      if (option.allClose) {
        this.hide(accordion);
      }
    }
  }
  show(accordion) {
    const { tab, item, tabpanel, option } = accordion;
    item.classList.add('active');
    tab.setAttribute('aria-expanded', true);
    tab.setAttribute('aria-selected', true);
    tabpanel.setAttribute('aria-hidden', false);
    $(tabpanel).slideDown('fast');
  }
  hide(accordion) {
    const { tab, item, tabpanel, option } = accordion;
    item.classList.remove('active');
    tab.setAttribute('aria-expanded', false);
    tab.setAttribute('aria-selected', false);
    tabpanel.setAttribute('aria-hidden', true);
    $(tabpanel).slideUp('fast');
  }
}
