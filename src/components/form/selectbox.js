const defaults = {
  rootSelector: '[data-ui-select]',
  selectedSelector: '[data-ui-select-selected]',
  listSelector: '[data-ui-select-list]',
  itemSelector: '[data-ui-select-item]',
  opendClass: 'is-opened',
  selectedClass: 'is-selected'
};

export default class SelectBox {
  constructor(params = {}) {
    const options = { ...defaults, ...params };
    this.openedSelectbox = [];
    this.options = options;

    document.addEventListener('click', (e) => {
      const { target } = e;
      const root = target.closest(options.rootSelector);
      if (root) {
        const selected = target.closest(options.selectedSelector);
        const item = target.closest(options.itemSelector);

        // 열기/닫기
        if (selected) {
          this.toggle(root);
        } else if (item) {
          this.select(root, item);
        }
      } else {
        if (this.openedSelectbox.length) {
          this.closeAll();
        }
      }
    });
  }
  select(root, item) {
    const { options } = this;
    const selected = root.querySelector(options.selectedSelector);
    const items = root.querySelectorAll(options.itemSelector);

    items.forEach((opt) => {
      if (opt === item) {
        opt.classList.add(options.selectedClass);
        selected.innerText = item.textContent;
      } else {
        opt.classList.remove(options.selectedClass);
      }
    });
    this.close(root);
  }
  open(root) {
    const { options } = this;
    const list = root.querySelector(options.listSelector);
    list.classList.add(options.opendClass);
    this.openedSelectbox.push(root);
  }
  close(root) {
    const { options, openedSelectbox } = this;
    const list = root.querySelector(options.listSelector);
    list.classList.remove(options.opendClass);
    this.openedSelectbox = openedSelectbox.filter((selectbox) => {
      return selectbox !== root;
    });
  }
  closeAll() {
    this.openedSelectbox.forEach((selectbox) => {
      this.close(selectbox);
    });
  }
  toggle(root) {
    const { options } = this;
    const list = root.querySelector(options.listSelector);
    if (list.classList.contains(options.opendClass)) {
      this.close(root);
    } else {
      this.closeAll();
      this.open(root);
    }
  }
}