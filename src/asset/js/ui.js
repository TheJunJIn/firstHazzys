import { throttle } from 'throttle-debounce';
import ShoutAndListen from './_util/shout-and-listen';

// Layout
import ViewType from '../../components/viewType';
import Header from '../../components/header';
import Navigation from '../../components/navigation';
import Sidebar from '../../components/sidebar';
import TopButton from '../../components/top-button';
import Loading from '../../components/loading';
import ModalController from '../../components/modal';
import ScrollLock from '../../components/scroll-lock';

// ui
import FormController from '../../components/form';
import FoldableController from '../../components/foldable';
import AccordionController from '../../components/accordion';
import TabController from '../../components/tab';

const $ = window.jQuery;
const defaults = {};

class UI extends ShoutAndListen {
  constructor(params = {}) {
    super();
    const options = { ...defaults, ...params };

    /**
     * ViewType (is-mobile | is-desktop)
     */
    new ViewType({ name: 'viewType' });

    /**
     * ScrollLock
     *  scrollLock.lock();
     *  scrollLock.release();
     */
    this.scrollLock = new ScrollLock({ name: 'scrollLock' });

    /**
     * Header
     * header.show();
     * header.hide();
     */
    this.header = new Header({ name: 'header'});

    /**
     * Navigation ( Mobile )
     * nav.show()
     * nav.hide()
     */
    this.nav = new Navigation({ name: 'nav' });

    /**
     * Sidebar ( Desktop )
     * sidebar.show();
     * sidebar.hide();
     */
    this.sidebar = new Sidebar({ name: 'sidebar' });

    /**
     * Top Button
     * topButton.show();
     * topButton.hide();
     */
    this.topButton = new TopButton({ name: 'topButton' });

    /**
     * Loading
     * loading.show();
     * loading.hide();
     */
    this.loading = new Loading();

    /**
     * Modal
     * modal.open();
     * modal.close();
     */
    this.modal = new ModalController({ name: 'modalController' });

    this.options = options;

    /**
     * 확인 중
     */
    this.modules = {
      sidebar: this.sidebar
    }
    new FormController();
    new FoldableController();
    new AccordionController();
    new TabController();

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

    window.addEventListener(
      'load',
      () => {
        instance.shout('load');
      },
      { once: true }
    );
    window.addEventListener('scroll', this.listeners.scroll);
    window.addEventListener('resize', this.listeners.resize);

    $('.button--clear').each(function () {
      var inputblock = $(this).closest('.input-block');
      var inputForm = inputblock.find('input.form-text');
      var clearButton = $(this);
      inputForm
        .off('.clear')
        .on(
          'propertychange.clear change.clear keyup.clear paste.clear input.clear',
          function () {
            if ($(this).val() !== '') {
              clearButton.show();
            } else {
              clearButton.hide();
            }
          }
        )
        .change();
      clearButton.off('.clear').on('click.clear', function () {
        inputForm.val('').change().focus();
      });
    });
  }
  // 각 모듈에 on*() 메소드를 지정하고 이를 ui.js에서 일괄 관리하는대신 각 모듈에서 shout(), listen() 메소드를 사용
  // onLoad() 대신 module.listen("load")
  // onResizeStart() 대신 module.listen("resizeStart")
  // onResize() 대신 module.listen("resize")
  // onResizeEnd() 대신 module.listen("resizeEnd")
  // onViewtypeChange(value, oldValue) 대신 module.listen("viewTypeChange", ({value, oldValue}) => {})
  destroy() {
    super.destroy();
    const { listeners } = this;
    ['scroll', 'resize'].forEach((eventType) => {
      window.removeEventListener(eventType, listeners[eventType]);
      listeners[eventType].cancel();
    });
  }
}

window.ui = new UI({ name: 'UI' });
