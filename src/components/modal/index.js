import triggerEvent from '../../asset/js/_util/trigger-event';
import getParams from '../../asset/js/_util/get-params';

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
  dimClose: true
};

export default class ModalController {
  constructor(params = {}) {
    const options = { ...defaults, ...params };
    this.options = options;
    this.openedLayers = [];

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

  async open(element, modalOption) {
    const { options } = this;
    const info = {
      ...modalDefault,
      ...getParams(element.dataset.modal),
      ...modalOption,
      element
    };

    if(modalOption?.preopen){
      await modalOption.preopen?.();
    }

    triggerEvent('open', {
      target: element,
      detail: {
        ...info
      },
    });

    if (info.dim) {
      element.classList.add('modal--dim');
    }

    const focusableElements = element.querySelectorAll(focusableSelector);
    focusableElements[0].focus();

    element.classList.add(options.activeClass);
    this.openedLayers.push(info);
  }
  close(element) {
    const { options, openedLayers } = this;
    let closedLayer;
    openedLayers.forEach((layer, i) => {
      if (element === layer.element) {
        triggerEvent('close', {
          target: element,
          detail: {
            ...layer
          },
        });
        if (layer.opener) {
          layer.opener.focus();
        }
        layer.element.classList.remove(options.activeClass);
        closedLayer = {...layer, index: i};
      }
    });
    if (closedLayer) {
      let openLayers = openedLayers.slice();
      openLayers.splice(closedLayer.index, 1);
      this.openedLayers = openLayers;
    } else {
      // ModalController를 사용하지 않고 열린 Layer
      element.classList.remove(options.activeClass);
      console.log('닫기');
    }
  }
  closeAll() {}
  // onLoad(){}
  // onResizeStart() {}
  // onResize() {}
  // onResizeEnd() {}
  // onViewtypeChange(value, oldValue) {}
}
