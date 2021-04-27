import { throttle } from 'throttle-debounce';
import ShoutAndListen from './_util/shout-and-listen';
import Header from '../../components/header';
import ViewType from '../../components/viewType';
import Navigation from '../../components/navigation';
import Sidebar from '../../components/sidebar';
import ModalController from '../../components/modal';
import FormController from '../../components/form';
import FoldableController from '../../components/foldable';
import AccordionController from '../../components/accordion';
import TabController from '../../components/tab';
import getScrollbarWidth from './_util/get-scrollbar-width';

const defaults = {
  scrollLockClass: 'scroll-lock'
};
class UI extends ShoutAndListen {
  constructor(params = {}) {
    super();

    const options = { ...defaults, ...params };
    const viewType = new ViewType();
    const header = new Header({});
    const nav = new Navigation({ name: 'nav' });
    const sidebar = new Sidebar();
    const modalController = new ModalController();
    new FormController();
    new FoldableController();
    new AccordionController();
    new TabController();
    const modules = {
      viewType,
      header,
      nav,
      sidebar,
      modalController
    };
    const instance = this;
    let resizeTimeOutFunction;
    let scrollTimeOutFunction;
    this.listeners = {
      resize: throttle(100, () => {
        if (!resizeTimeOutFunction) {
          instance.shout('resizeStart');
        }
        instance.shout('resize');
        window.clearTimeout(resizeTimeOutFunction);
        resizeTimeOutFunction = window.setTimeout(() => {
          instance.shout('resizeEnd');
          resizeTimeOutFunction = null;
        }, 100);
      }),
      scroll: throttle(100, () => {
        let isFirstScroll = false;
        const time = performance.now();

        if (scrollTimeOutFunction) {
          window.clearTimeout(scrollTimeOutFunction);
          scrollTimeOutFunction = null;
        } else {
          isFirstScroll = true;
        }

        const { scrollY } = window;
        const info = {
          scrollY,
          time
        };

        if (isFirstScroll) {
          instance.shout('scrollStart', info);
        } else {
          instance.shout('scroll', info);
        }

        scrollTimeOutFunction = window.setTimeout(() => {
          instance.shout('scrollEnd', info);
          scrollTimeOutFunction = null;
        }, 101);
      })
    };

    this.options = options;
    this.modules = modules;

    window.addEventListener(
      'load',
      () => {
        instance.shout('load');
      },
      { once: true }
    );
    window.addEventListener('scroll', this.listeners.scroll);
    window.addEventListener('resize', this.listeners.resize);

    this.modal = modalController;
  }
  // 각 모듈에 on*() 메소드를 지정하고 이를 ui.js에서 일괄 관리하는대신 각 모듈에서 shout(), listen() 메소드를 사용
  // onLoad() 대신 module.listen("load")
  // onResizeStart() 대신 module.listen("resizeStart")
  // onResize() 대신 module.listen("resize")
  // onResizeEnd() 대신 module.listen("resizeEnd")
  // onViewtypeChange(value, oldValue) 대신 module.listen("viewTypeChange", ({value, oldValue}) => {})
  scrollLock() {
    const { options } = this;
    const { body } = document;
    const { scrollY } = window;
    const app = document.querySelector('.app');
    const scrollbar = getScrollbarWidth();
    if(!body.classList.contains(options.scrollLockClass)){
      body.classList.add(options.scrollLockClass);
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      app.style.paddingRight = `${scrollbar}px`;
    }
  }
  scrollRelease() {
    const { options } = this;
    const { body } = document;
    const app = document.querySelector('.app');
    const scrollY = body.style.top;
    if(body.classList.contains(options.scrollLockClass)){
      body.classList.remove(options.scrollLockClass);
      body.style.position = '';
      body.style.top = '';
      body.style.right = '';
      app.style.paddingRight = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }
  destroy() {
    super.destroy();
    const { listeners } = this;
    ['scroll', 'resize'].forEach((eventType) => {
      window.removeEventListener(eventType, listeners[eventType]);
      listeners[eventType].cancel();
    });
  }
}

window.ui = new UI();
