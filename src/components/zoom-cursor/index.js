const defaults = {
  root: '.product-detail__image',
  cursorClass: 'zoom-cursor',
  activeClass: 'active'
};

// 대표이미지 마우스 커서
export default class ZoomCursor {
  constructor(params = {}) {
    const options = { ...defaults, ...params };
    const { root } = options;

    if (typeof root === 'string') {
      this.root = document.querySelector(root);
    } else if (root instanceof Element) {
      this.root = root;
    }

    let cursor = this.root.querySelector(`.${options.cursorClass}`);

    if (!cursor) {
      const element = document.createElement('span');
      element.classList.add(options.cursorClass);
      this.root.appendChild(element);
      cursor = element;
    }

    this.isEnabled = true;
    this.isActive = false;
    this.cursor = cursor;
    this.options = options;

    const imageContent = this.root.querySelector('.swiper-wrapper');
    imageContent.addEventListener('mouseenter', (e) => {
      if (this.isEnabled) {
        this.show();
      }
    });
    this.root.addEventListener('mousemove', (e) => {
      if (this.isEnabled) {
        this.update(e);
      }
    });
    imageContent.addEventListener('mouseleave', (e) => {
      if (this.isEnabled) {
        this.hide();
      }
    });
  }

  enable() {
    this.isEnabled = true;
  }
  disable() {
    this.isEnabled = false;
    this.hide();
  }
  show() {
    const { cursor, options } = this;
    cursor.classList.add(options.activeClass);
    this.isActive = true;
  }
  hide() {
    const { cursor, options } = this;
    cursor.classList.remove(options.activeClass);
    this.isActive = false;
  }
  update(e) {
    const { root, cursor } = this;
    if (this.isActive && this.isEnabled) {
      const { x, y } = root.getBoundingClientRect();
      cursor.style.top = `${e.clientY - y}px`;
      cursor.style.left = `${e.clientX - x}px`;
    }
  }
}
