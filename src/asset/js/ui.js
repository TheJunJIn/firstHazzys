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
import TopButton from '../../components/top-button';
import getScrollbarWidth from './_util/get-scrollbar-width';

const $ = window.jQuery;
const defaults = {
  scrollLockClass: 'scroll-lock'
};

const OVERRAP_STYLE_HEADER_LIST = ['shell-main--mypage-main']
class UI extends ShoutAndListen {
  constructor(params = {}) {
    super();

    // Header 스타일
    const pageMainElement = document.querySelector('.shell-main');
    const isOverlap  = OVERRAP_STYLE_HEADER_LIST.reduce( (acc, current)=> {
      if(pageMainElement?.classList?.contains?.(current)) {
        acc = true;
      }
      return acc;
    }, false);

    const options = { ...defaults, ...params };
    const viewType = new ViewType({ name: 'viewType' });
    const header = new Header({ name: 'header', overlap: isOverlap });
    const nav = new Navigation({ name: 'nav' });
    const sidebar = new Sidebar({ name: 'sidebar' });
    const modalController = new ModalController({ name: 'modalController' });
    const topButton = new TopButton({ name: 'topButton' });
    new FormController();
    new FoldableController();
    new AccordionController();
    new TabController();
    const modules = {
      viewType,
      header,
      nav,
      sidebar,
      topButton,
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

        const { scrollY, pageYOffset } = window;
        const info = {
          scrollY: scrollY || pageYOffset,
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

    $('.button--clear').each(function(){
      var inputblock = $(this).closest('.input-block');
      var inputForm = inputblock.find('input.form-text');
      var clearButton = $(this);
      inputForm.off('.clear').on('propertychange.clear change.clear keyup.clear paste.clear input.clear', function(){
        if($(this).val() !== '') {
          clearButton.show();
        } else {
          clearButton.hide();
        }
      }).change();
      clearButton.off('.clear').on('click.clear', function(){
        inputForm.val('').change().focus();
      })
    });
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
    const { scrollY, pageYOffset } = window;
    const app = document.querySelector('.app');
    const scrollbar = getScrollbarWidth();
    body.classList.add(options.scrollLockClass);
    body.style.position = 'fixed';
    body.style.top = `-${(scrollY || pageYOffset)}px`;
    app.style.paddingRight = `${scrollbar}px`;
  }
  scrollRelease() {
    const { options } = this;
    const { body } = document;
    const app = document.querySelector('.app');
    const scrollY = body.style.top;
    body.classList.remove(options.scrollLockClass);
    body.style.position = '';
    body.style.top = '';
    body.style.right = '';
    app.style.paddingRight = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
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
