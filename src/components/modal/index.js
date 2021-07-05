import UIModule from '../ui-module';
import triggerEvent from '../../asset/js/_util/trigger-event';
import getParams from '../../asset/js/_util/get-params';

function getTargetElement(target) {
  let element;
  if (typeof target === 'string') {
    element = document.querySelector(target);
  } else if (target instanceof Element) {
    element = target;
  } else if (target.jquery || target.length) {
    element = target[0];
  }
  return element;
}

const focusableSelector =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const defaults = {
  rootSelector: '[data-modal]',
  containerSelector: '.modal-dialog',
  openButtonSelector: '[data-modal-open]',
  openTargetSelector: 'modalOpen',
  closeButtonSelector: '[data-modal-close]',
  closeTargetSelector: 'modalClose',
  activeClass: 'active'
};

const modalDefault = {
  dim: true,
  opener: null,
  esc: true,
  timer: null,
  dimClose: true,
  lock: false
};

export default class ModalController extends UIModule {
  constructor(params = {}) {
    super({
      ...defaults,
      ...params
    });
    this.scrollLocked;
    this.openedLayers = [];
    const { options } = this;

    document.addEventListener('click', (e) => {
      const { target } = e;
      const openButton = target.closest(options.openButtonSelector);
      const closeButton = target.closest(options.closeButtonSelector);

      if (openButton) {
        const targetSelector = openButton.dataset[options.openTargetSelector];
        const target = document.querySelector(targetSelector);
        if (target) {
          e.preventDefault();
          this.open(target, {
            opener: openButton
          });
        }
      } else if (closeButton) {
        const targetSelector = closeButton.dataset[options.closeTargetSelector];
        let target;
        if (targetSelector) {
          target = document.querySelector(targetSelector);
        } else {
          target = closeButton.closest(options.rootSelector);
        }
        if (target) {
          e.preventDefault();
          this.close(target);
        }
      } else {
        const root = target.closest(options.rootSelector);
        const container = target.closest(options.containerSelector);
        // 외부영역 클릭
        if (root && !container) {
          const info = {
            ...modalDefault,
            ...getParams(root.dataset.modal)
          };
          if (info.dimClose) {
            this.close(root);
          }
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Escape' || e.key === 'Esc') && this.openedLayers.length) {
        const lastLayer = this.openedLayers[this.openedLayers.length - 1];
        if (lastLayer.esc) {
          this.close(lastLayer.element);
        }
      }
    });
  }

  async open(target, modalOption) {
    const { options } = this;
    const element = getTargetElement(target);

    if (!element || !element instanceof Element) {
      return false;
    }
    const focusableElements = element.querySelectorAll(focusableSelector);

    const info = {
      ...modalDefault,
      ...getParams(element.dataset.modal),
      ...modalOption,
      element
    };

    // Example
    // ui.modal.open($('#id'), {
    //   open: (next) => {
    //     window.setTimeout(() => {
    //       next();
    //     }, 1000);
    //   },
    //   opened: (info) => {}
    // });
    if (info?.open) {
      await (() => {
        return new Promise((resolve) => {
          info.open?.(resolve);
        });
      })();
    }

    if (info.dim) {
      element.classList.add('modal--dim');
    }

    element.classList.add(options.activeClass);
    focusableElements[0].focus();
    this.openedLayers.push(info);

    if (info.lock) {
      const { scrollLocked } = await this.report('scrollLock');
      if (!scrollLocked) {
        this.shout('scrollLock', 'lock');
      }
    }

    if (info?.opened) {
      info.opened?.(info);
    }

    if (info.timer) {
      window.setTimeout(() => {
        this.close(element);
      }, Number(info.timer) * 1000);
    }
  }

  async close(target) {
    const { options, openedLayers } = this;
    const element = getTargetElement(target);

    let closedLayer;
    openedLayers.forEach((layer, i) => {
      if (element === layer.element) {
        if (layer.opener) {
          layer.opener.focus();
        }
        layer.element.classList.remove(options.activeClass);
        closedLayer = { ...layer, index: i };
      }
    });
    if (closedLayer) {
      let openLayers = openedLayers.slice();
      openLayers.splice(closedLayer.index, 1);
      this.openedLayers = openLayers;
      if (closedLayer.lock) {
        const { scrollLocked } = await this.report('scrollLock');
        if (scrollLocked) {
          this.shout('scrollLock', 'release');
        }
      }
    } else {
      // openedLayers에 없는 Layer
      element.classList.remove(options.activeClass);
    }
  }
  closeAll() {}
}
