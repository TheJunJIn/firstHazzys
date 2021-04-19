import { throttle } from 'throttle-debounce';
import Header from '../../components/header';
import ViewType from '../../components/viewType';
import Navigation from '../../components/navigation';
import ModalController from '../../components/modal';
import FormController from '../../components/form';
import FoldableController from '../../components/foldable';

const defaults = {
  scrollLockClass: 'scroll-lock'
};
class UI {
  constructor(params = {}) {
    const options = { ...defaults, ...params };
    const viewType = new ViewType({
      onViewtypeChange: (...args) => this.onViewtypeChange(...args)
    });
    const header = new Header({});
    const nav = new Navigation({
      callback: {
        shown: () => this.scrollLock(),
        hidden: () => this.scrollRelease()
      }
    });
    const modalController = new ModalController();
    new FormController();
    new FoldableController();
    const modules = {
      viewType,
      header,
      nav,
      modalController
    };
    let resizeTimeOutFunction;
    this.listeners = {
      resize: throttle(100, () => {
        if (!resizeTimeOutFunction) {
          this?.onResizeStart?.();
        }
        this?.onResize?.();
        window.clearTimeout(resizeTimeOutFunction);
        resizeTimeOutFunction = window.setTimeout(() => {
          this?.onResizeEnd?.();
          resizeTimeOutFunction = null;
        }, 100);
      })
    };
    this.options = options;
    this.modules = modules;
    this.onLoad();
    this.modal = modalController;
  }
  onLoad() {
    const { listeners, modules } = this;
    window.addEventListener(
      'load',
      () => {
        Object.entries(modules).forEach(([key, module]) => {
          module?.onLoad?.();
        });
      },
      { once: true }
    );
    window.addEventListener('scroll', listeners.scroll);
    window.addEventListener('resize', listeners.resize);
  }
  onDestroy() {
    const { listeners } = this;
    ['scroll', 'resize'].forEach((eventType) => {
      window.removeEventListener(eventType, listeners[eventType]);
      listeners[eventType].cancel();
    });
  }
  onResizeStart() {
    const { modules } = this;
    Object.entries(modules).forEach(([key, module]) => {
      module?.onResizeStart?.();
    });
  }
  onResize() {
    const { modules } = this;
    Object.entries(modules).forEach(([key, module]) => {
      module?.onResize?.();
    });
  }
  onResizeEnd() {
    const { modules } = this;
    Object.entries(modules).forEach(([key, module]) => {
      module?.onResizeEnd?.();
    });
  }
  onViewtypeChange(value, oldValue) {
    const { modules } = this;
    Object.entries(modules).forEach(([key, module]) => {
      module?.onViewtypeChange?.(value, oldValue);
    });
  }
  scrollLock() {
    const { options } = this;
    const { body } = document;
    const { scrollY } = window;
    body.classList.add(options.scrollLockClass);
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
  }
  scrollRelease() {
    const { options } = this;
    const { body } = document;
    const scrollY = body.style.top;
    body.classList.remove(options.scrollLockClass);
    body.style.position = '';
    body.style.top = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  }
}

window.ui = new UI();
