const defaults = {
  tablistSelector: '[role="tablist"]',
  tabSelector: '[role="tab"]'
};

export default class TabController {
  constructor(params = {}) {
    const options = { ...defaults, ...params };
    this.options = options;

    document.addEventListener('click', (e) => {
      const { target } = e;
      const tab = target.closest(options.tabSelector);
      const tablist = tab && tab.closest(options.tablistSelector);

      if (tab && tab.getAttribute('aria-selected') !== 'true') {
        const tabs = tablist.querySelectorAll(options.tabSelector);
        tabs.forEach((item) => {
          if (item === tab) {
            this.activateTab(tab);
          } else {
            this.deactivateTab(item);
          }
        });
      }
    });
  }
  activateTab(tab) {
    const controls = tab.getAttribute('aria-controls');
    const panel = document.querySelector(`#${controls}`);
    if (panel) {
      tab.removeAttribute('tabindex');
      tab.setAttribute('aria-selected', 'true');
      panel.removeAttribute('hidden');
    }
  }
  deactivateTab(tab) {
    const controls = tab.getAttribute('aria-controls');
    const panel = document.querySelector(`#${controls}`);
    if (panel) {
      tab.setAttribute('tabindex', '-1');
      tab.setAttribute('aria-selected', 'false');
      panel.setAttribute('hidden', 'hidden');
    }
  }
}
